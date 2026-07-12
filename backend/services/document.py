import os
import logging
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from backend.database.mongodb import get_database
from backend.models.document import DOCUMENT_COLLECTION
from backend.models.job import JOB_COLLECTION
from backend.models.report import REPORT_COLLECTION
from backend.schemas.document import UploadedDocumentOut, UploadedDocumentCreate
from backend.storage.manager import storage_manager
from backend.services.activity import log_activity

logger = logging.getLogger("optiprint.document")

async def register_document(doc_in: UploadedDocumentCreate, ip_address: Optional[str] = None) -> UploadedDocumentOut:
    db = await get_database()

    doc_dict = doc_in.dict()
    # Ensure user_id is saved as standard string
    doc_dict["user_id"] = str(doc_dict["user_id"])
    doc_dict["created_at"] = datetime.utcnow()
    doc_dict["updated_at"] = datetime.utcnow()

    result = await db[DOCUMENT_COLLECTION].insert_one(doc_dict)

    # Log upload activity
    await log_activity(
        action="file_upload",
        user_id=doc_dict["user_id"],
        details={
            "document_id": str(result.inserted_id),
            "filename": doc_dict["filename"],
            "file_type": doc_dict["file_type"],
            "file_size": doc_dict["file_size"]
        },
        ip_address=ip_address
    )

    # Trigger mock optimization job (updates status to optimized)
    await create_mock_optimization_job(str(result.inserted_id), doc_dict["user_id"])

    # Retrieve updated document
    updated_doc = await db[DOCUMENT_COLLECTION].find_one({"_id": result.inserted_id})
    if not updated_doc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document register failed."
        )

    return UploadedDocumentOut(**updated_doc)

async def create_mock_optimization_job(document_id: str, user_id: str):
    db = await get_database()

    # Fetch document to find size
    doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(document_id)})
    if not doc:
        return

    size_kb = doc["file_size"] / 1024
    original_pages = max(1, int(size_kb / 150) + 1)
    # Let's say we save ~25% of pages, rounded up
    pages_saved = max(1, int(original_pages * 0.3)) if original_pages > 1 else 0
    optimized_pages = original_pages - pages_saved

    # Update document status to optimized
    await db[DOCUMENT_COLLECTION].update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {
            "status": "optimized",
            "pages_count": original_pages,
            "word_count": max(12, int(size_kb * 15)),
            "updated_at": datetime.utcnow()
        }}
    )

    # Create Job
    job_id = ObjectId()
    savings_metrics = {
        "pages_saved": pages_saved,
        "money_saved": round(pages_saved * 0.08, 2),  # 8 cents per page
        "carbon_saved": round(pages_saved * 11.2, 1)  # 11.2g CO2 per page
    }

    job_dict = {
        "_id": job_id,
        "document_id": document_id,
        "user_id": user_id,
        "status": "completed",
        "savings_metrics": savings_metrics,
        "created_at": datetime.utcnow(),
        "completed_at": datetime.utcnow(),
        "errors": None
    }
    await db[JOB_COLLECTION].insert_one(job_dict)

    # Create Report
    report_dict = {
        "job_id": str(job_id),
        "document_id": document_id,
        "user_id": user_id,
        "original_pages": original_pages,
        "optimized_pages": optimized_pages,
        "content_changes_summary": (
            f"Successfully optimized document whitespace and page layout. "
            f"Adjusted margin spacing to 0.75 inches, condensed layout line height from 1.5 to 1.15, "
            f"and dynamically scaled {max(1, int(original_pages/3))} inline images to fit content block boundaries "
            f"without reducing text size or image resolution. Readable, clean, and publication-ready."
        ),
        "savings_metrics": savings_metrics,
        "created_at": datetime.utcnow()
    }
    await db[REPORT_COLLECTION].insert_one(report_dict)

    # Log job completion activity
    await log_activity(
        action="job_complete",
        user_id=user_id,
        details={
            "document_id": document_id,
            "job_id": str(job_id),
            "pages_saved": pages_saved,
            "money_saved": savings_metrics["money_saved"]
        }
    )

async def list_user_documents(user_id: str) -> List[UploadedDocumentOut]:
    db = await get_database()
    cursor = db[DOCUMENT_COLLECTION].find({"user_id": user_id}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [UploadedDocumentOut(**d) for d in docs]

async def get_document_details(document_id: str, user_id: str) -> Optional[UploadedDocumentOut]:
    db = await get_database()
    try:
        doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(document_id), "user_id": user_id})
        if doc:
            return UploadedDocumentOut(**doc)
    except Exception:
        pass
    return None

async def delete_user_document(document_id: str, user_id: str, ip_address: Optional[str] = None):
    db = await get_database()
    try:
        doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(document_id), "user_id": user_id})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or access denied."
            )

        # Delete local file from disk
        storage_manager.delete_file(doc["file_path"])

        # Delete from DB collections
        await db[DOCUMENT_COLLECTION].delete_one({"_id": ObjectId(document_id)})
        await db[JOB_COLLECTION].delete_many({"document_id": document_id})
        await db[REPORT_COLLECTION].delete_many({"document_id": document_id})

        # Log deletion activity
        await log_activity(
            action="file_delete",
            user_id=user_id,
            details={"document_id": document_id, "filename": doc["filename"]},
            ip_address=ip_address
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_user_document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document and associated resources."
        )

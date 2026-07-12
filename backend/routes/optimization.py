import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from bson import ObjectId

from backend.auth.dependencies import get_current_user
from backend.schemas.user import UserOut
from backend.database.mongodb import get_database
from backend.models.document import DOCUMENT_COLLECTION
from backend.models.job import JOB_COLLECTION
from backend.models.report import REPORT_COLLECTION
from backend.ai_engine.analyzer import DocumentAnalyzer
from backend.ai_engine.optimizer import DocumentOptimizer
from backend.services.activity import log_activity
from backend.config.settings import settings

router = APIRouter(tags=["Document Optimization"])

# Pydantic schemas for requests
class AnalyzeRequest(BaseModel):
    document_id: str

class OptimizeRequest(BaseModel):
    document_id: str
    purpose: str = "College Assignment"
    mode: str = "Smart" # Safe, Smart, Maximum Savings
    instructions: Optional[str] = ""

class StatusResponse(BaseModel):
    document_id: str
    status: str
    progress: int
    message: str

# 1. Analyze Document
@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_document(req: AnalyzeRequest, request: Request, current_user: UserOut = Depends(get_current_user)):
    db = await get_database()
    doc_id = req.document_id

    try:
        doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(doc_id), "user_id": str(current_user.id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID format.")

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied.")

    # Perform analysis
    file_path = doc["file_path"]
    file_type = doc["file_type"]

    try:
        analysis_results = DocumentAnalyzer.analyze_file(file_path, file_type)
        analysis_results["filename"] = doc["filename"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # Update document in MongoDB with analysis details
    await db[DOCUMENT_COLLECTION].update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {
            "analysis": analysis_results,
            "status": "analyzed",
            "pages_count": analysis_results["page_count"],
            "updated_at": datetime.utcnow()
        }}
    )

    # Log activity
    ip_address = request.client.host if request.client else None
    await log_activity(
        action="file_analyze",
        user_id=str(current_user.id),
        details={"document_id": doc_id, "filename": doc["filename"], "pages_count": analysis_results["page_count"]},
        ip_address=ip_address
    )

    return analysis_results

# 2. Optimize Document
@router.post("/optimize", response_model=Dict[str, Any])
async def optimize_document_endpoint(req: OptimizeRequest, request: Request, current_user: UserOut = Depends(get_current_user)):
    db = await get_database()
    doc_id = req.document_id

    try:
        doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(doc_id), "user_id": str(current_user.id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID format.")

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied.")

    # Check if analysis has been run. If not, run it automatically first!
    analysis = doc.get("analysis")
    if not analysis:
        analysis = DocumentAnalyzer.analyze_file(doc["file_path"], doc["file_type"])
        analysis["filename"] = doc["filename"]
        await db[DOCUMENT_COLLECTION].update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": {"analysis": analysis}}
        )

    # Derive rules based on purpose, mode, instructions
    rules = DocumentOptimizer.calculate_rules(req.purpose, req.mode, req.instructions)

    # Execute optimization pipeline
    try:
        opt_results = DocumentOptimizer.optimize_document(
            file_path=doc["file_path"],
            file_type=doc["file_type"],
            analysis=analysis,
            rules=rules,
            out_dir=settings.UPLOAD_DIR
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

    # Update Document status and register optimized paths
    await db[DOCUMENT_COLLECTION].update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {
            "status": "optimized",
            "optimized_file_path": opt_results["optimized_file_path"],
            "optimized_filename": opt_results["optimized_filename"],
            "updated_at": datetime.utcnow()
        }}
    )

    # Register or Update Optimization Job in MongoDB
    job_id = ObjectId()
    job_dict = {
        "_id": job_id,
        "document_id": doc_id,
        "user_id": str(current_user.id),
        "status": "completed",
        "savings_metrics": opt_results["savings_metrics"],
        "purpose": req.purpose,
        "mode": req.mode,
        "instructions": req.instructions,
        "created_at": datetime.utcnow(),
        "completed_at": datetime.utcnow(),
        "errors": None
    }
    await db[JOB_COLLECTION].insert_one(job_dict)

    # Register Optimization Report
    report_dict = {
        "job_id": str(job_id),
        "document_id": doc_id,
        "user_id": str(current_user.id),
        "original_pages": opt_results["original_pages"],
        "optimized_pages": opt_results["optimized_pages"],
        "content_changes_summary": opt_results["content_changes_summary"],
        "savings_metrics": opt_results["savings_metrics"],
        "created_at": datetime.utcnow()
    }
    await db[REPORT_COLLECTION].insert_one(report_dict)

    # Log activity
    ip_address = request.client.host if request.client else None
    await log_activity(
        action="job_complete",
        user_id=str(current_user.id),
        details={
            "document_id": doc_id,
            "job_id": str(job_id),
            "pages_saved": opt_results["savings_metrics"]["pages_saved"],
            "money_saved": opt_results["savings_metrics"]["money_saved"]
        },
        ip_address=ip_address
    )

    return {
        "document_id": doc_id,
        "job_id": str(job_id),
        "original_pages": opt_results["original_pages"],
        "optimized_pages": opt_results["optimized_pages"],
        "savings_metrics": opt_results["savings_metrics"],
        "content_changes_summary": opt_results["content_changes_summary"],
        "optimized_filename": opt_results["optimized_filename"]
    }

# 3. Download Optimized File
@router.get("/download/{document_id}")
async def download_optimized_file(document_id: str, current_user: UserOut = Depends(get_current_user)):
    db = await get_database()

    try:
        doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(document_id), "user_id": str(current_user.id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID format.")

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied.")

    opt_path = doc.get("optimized_file_path")
    opt_filename = doc.get("optimized_filename")

    if not opt_path or not os.path.exists(opt_path):
        raise HTTPException(status_code=400, detail="Optimized file is not ready or has been deleted.")

    return FileResponse(
        path=opt_path,
        filename=opt_filename or doc["filename"],
        media_type="application/pdf"
    )

# 4. Optimization Status
@router.get("/status/{document_id}", response_model=StatusResponse)
async def get_optimization_status(document_id: str, current_user: UserOut = Depends(get_current_user)):
    db = await get_database()

    try:
        doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(document_id), "user_id": str(current_user.id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID format.")

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied.")

    doc_status = doc.get("status", "uploaded")
    progress = 0
    message = "Document uploaded successfully."

    if doc_status == "uploaded":
        progress = 10
        message = "File uploaded and ready for layout analysis."
    elif doc_status == "analyzed":
        progress = 40
        message = "Layout analysis complete. Optimization parameters calculated."
    elif doc_status == "optimized":
        progress = 100
        message = "Intelligent compression finished. File ready for download."
    elif doc_status == "failed":
        progress = 100
        message = "Optimization encountered structural rendering errors."

    return StatusResponse(
        document_id=document_id,
        status=doc_status,
        progress=progress,
        message=message
    )

# 5. Optimization History
@router.get("/history", response_model=List[Dict[str, Any]])
async def get_optimization_history(current_user: UserOut = Depends(get_current_user)):
    db = await get_database()

    cursor = db[JOB_COLLECTION].find({"user_id": str(current_user.id)}).sort("completed_at", -1)
    jobs = await cursor.to_list(length=100)

    history_list = []
    for job in jobs:
        # Fetch matching document details
        doc = await db[DOCUMENT_COLLECTION].find_one({"_id": ObjectId(job["document_id"])})
        doc_name = doc["filename"] if doc else "Deleted Document"

        history_list.append({
            "job_id": str(job["_id"]),
            "document_id": job["document_id"],
            "filename": doc_name,
            "purpose": job.get("purpose", "Other"),
            "mode": job.get("mode", "Smart"),
            "savings_metrics": job["savings_metrics"],
            "completed_at": job["completed_at"].isoformat() if hasattr(job["completed_at"], "isoformat") else str(job["completed_at"]),
            "status": job["status"]
        })

    return history_list

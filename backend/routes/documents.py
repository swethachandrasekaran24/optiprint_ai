from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from bson import ObjectId
from backend.auth.dependencies import get_current_user
from backend.schemas.user import UserOut
from backend.schemas.document import UploadedDocumentOut
from backend.schemas.report import OptimizationReportOut
from backend.database.mongodb import get_database
from backend.models.report import REPORT_COLLECTION
from backend.services.document import list_user_documents, get_document_details, delete_user_document

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[UploadedDocumentOut])
async def get_documents(current_user: UserOut = Depends(get_current_user)):
    return await list_user_documents(str(current_user.id))

@router.get("/{document_id}", response_model=UploadedDocumentOut)
async def get_document(document_id: str, current_user: UserOut = Depends(get_current_user)):
    doc = await get_document_details(document_id, str(current_user.id))
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied."
        )
    return doc

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    request: Request,
    current_user: UserOut = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    await delete_user_document(document_id, str(current_user.id), ip_address=ip_address)
    return {"message": "Document successfully deleted."}

@router.get("/{document_id}/report", response_model=OptimizationReportOut)
async def get_document_report(document_id: str, current_user: UserOut = Depends(get_current_user)):
    db = await get_database()
    try:
        report = await db[REPORT_COLLECTION].find_one({
            "document_id": document_id,
            "user_id": str(current_user.id)
        })
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Optimization report not found for this document."
            )
        return OptimizationReportOut(**report)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving report: {e}"
        )

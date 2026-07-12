from fastapi import APIRouter, Depends, UploadFile, File, Request, status
from backend.auth.dependencies import get_current_user
from backend.schemas.user import UserOut
from backend.schemas.document import UploadedDocumentOut, UploadedDocumentCreate
from backend.storage.manager import storage_manager
from backend.services.document import register_document

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("", response_model=UploadedDocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None

    # Save file to disk
    file_metadata = await storage_manager.save_file(file)

    # Register document metadata in database
    doc_create = UploadedDocumentCreate(
        user_id=current_user.id,
        filename=file_metadata["filename"],
        secure_filename=file_metadata["secure_filename"],
        file_path=file_metadata["file_path"],
        file_size=file_metadata["file_size"],
        file_type=file_metadata["file_type"],
        status="uploaded"
    )

    uploaded_doc = await register_document(doc_create, ip_address=ip_address)
    return uploaded_doc

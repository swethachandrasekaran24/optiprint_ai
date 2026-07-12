import os
import uuid
import shutil
import logging
from fastapi import UploadFile, HTTPException, status
from backend.config.settings import settings

logger = logging.getLogger("optiprint.storage")

ALLOWED_EXTENSIONS = {"pdf", "docx", "pptx"}
CONTENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    # Sometimes browsers report pptx/docx with other content types, so we also trust extensions.
}

class StorageManager:
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR, max_size_mb: int = settings.MAX_FILE_SIZE_MB):
        self.upload_dir = upload_dir
        self.max_size_mb = max_size_mb
        self.ensure_upload_dir()

    def ensure_upload_dir(self):
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir, exist_ok=True)
            logger.info(f"Created upload directory at: {self.upload_dir}")

    def get_file_extension(self, filename: str, content_type: str) -> str:
        # Check by content type
        ext = CONTENT_TYPES.get(content_type)
        if ext:
            return ext

        # Check by filename extension
        if "." in filename:
            ext = filename.rsplit(".", 1)[1].lower()
            if ext in ALLOWED_EXTENSIONS:
                return ext
        return ""

    async def save_file(self, file: UploadFile) -> dict:
        filename = file.filename or "unnamed_file"
        content_type = file.content_type or ""

        ext = self.get_file_extension(filename, content_type)
        if not ext:
            logger.warning(f"Rejected upload with invalid extension/content-type: {filename} ({content_type})")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Only PDF, DOCX, and PPTX files are allowed."
            )

        # Validate file size
        # We need to read a chunk to check size, then seek back
        # Or check content-length header if present
        # To be safe, we will read the file in chunks to disk and measure size
        unique_id = uuid.uuid4().hex
        clean_name = os.path.basename(filename)
        # Remove original extension from base name, then append unique ID and clean extension
        base_name, _ = os.path.splitext(clean_name)
        # Keep base name clean (remove alphanumeric, spaces, dashes, underscores only)
        base_name = "".join(c for c in base_name if c.isalnum() or c in (" ", "-", "_")).strip()
        if not base_name:
            base_name = "document"

        secure_filename = f"{base_name}_{unique_id}.{ext}"
        file_path = os.path.join(self.upload_dir, secure_filename)

        total_bytes = 0
        max_bytes = self.max_size_mb * 1024 * 1024

        try:
            with open(file_path, "wb") as buffer:
                # Read in chunks of 1MB
                while chunk := await file.read(1024 * 1024):
                    total_bytes += len(chunk)
                    if total_bytes > max_bytes:
                        logger.warning(f"File upload exceeded limit of {self.max_size_mb}MB: {filename}")
                        # Delete partial file
                        buffer.close()
                        if os.path.exists(file_path):
                            os.remove(file_path)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds maximum size limit of {self.max_size_mb}MB."
                        )
                    buffer.write(chunk)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not save file to disk."
            )

        # Return file metadata
        return {
            "filename": filename,
            "secure_filename": secure_filename,
            "file_path": file_path,
            "file_size": total_bytes,
            "file_type": ext,
        }

    def delete_file(self, file_path: str):
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted file from local storage: {file_path}")
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")

storage_manager = StorageManager()

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from backend.schemas.base import MongoBaseModel, PyObjectId

class UploadedDocumentBase(BaseModel):
    filename: str
    secure_filename: str
    file_path: str
    file_size: int
    file_type: str  # "pdf", "docx", "pptx"
    status: str = "uploaded"  # "uploaded", "processing", "optimized", "failed"
    pages_count: int = 0
    word_count: int = 0

class UploadedDocumentCreate(UploadedDocumentBase):
    user_id: PyObjectId

class UploadedDocumentUpdate(BaseModel):
    status: Optional[str] = None
    pages_count: Optional[int] = None
    word_count: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class UploadedDocumentOut(MongoBaseModel):
    user_id: str
    filename: str
    secure_filename: str
    file_path: str
    file_size: int
    file_type: str
    status: str
    pages_count: int
    word_count: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

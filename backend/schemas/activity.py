from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.schemas.base import MongoBaseModel

class ActivityLogBase(BaseModel):
    user_id: Optional[str] = None
    action: str
    details: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLogOut(MongoBaseModel):
    user_id: Optional[str] = None
    action: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

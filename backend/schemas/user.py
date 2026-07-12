from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from backend.schemas.base import MongoBaseModel, PyObjectId

class UserPreferences(BaseModel):
    theme: str = "light"
    default_optimize_whitespace: bool = True
    default_optimize_margins: bool = True
    default_optimize_spacing: bool = True
    default_optimize_images: bool = True
    notifications_enabled: bool = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "user"  # "user", "admin"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    preferences: Optional[UserPreferences] = None

class UserOut(MongoBaseModel):
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from backend.schemas.base import MongoBaseModel, PyObjectId

class SavingsMetrics(BaseModel):
    pages_saved: int = 0
    money_saved: float = 0.0
    carbon_saved: float = 0.0  # CO2 in grams or kg

class OptimizationJobBase(BaseModel):
    document_id: str
    user_id: str
    status: str = "pending"  # "pending", "processing", "completed", "failed"
    savings_metrics: SavingsMetrics = Field(default_factory=SavingsMetrics)

class OptimizationJobCreate(OptimizationJobBase):
    pass

class OptimizationJobUpdate(BaseModel):
    status: Optional[str] = None
    savings_metrics: Optional[SavingsMetrics] = None
    completed_at: Optional[datetime] = None
    errors: Optional[str] = None

class OptimizationJobOut(MongoBaseModel):
    document_id: str
    user_id: str
    status: str
    savings_metrics: SavingsMetrics
    errors: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

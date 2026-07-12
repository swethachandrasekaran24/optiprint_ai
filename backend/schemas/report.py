from datetime import datetime
from pydantic import BaseModel, Field
from backend.schemas.base import MongoBaseModel
from backend.schemas.job import SavingsMetrics

class OptimizationReportBase(BaseModel):
    job_id: str
    document_id: str
    user_id: str
    original_pages: int
    optimized_pages: int
    content_changes_summary: str = ""
    savings_metrics: SavingsMetrics = Field(default_factory=SavingsMetrics)

class OptimizationReportCreate(OptimizationReportBase):
    pass

class OptimizationReportOut(MongoBaseModel):
    job_id: str
    document_id: str
    user_id: str
    original_pages: int
    optimized_pages: int
    content_changes_summary: str
    savings_metrics: SavingsMetrics
    created_at: datetime = Field(default_factory=datetime.utcnow)

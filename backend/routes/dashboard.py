from typing import Dict, Any
from fastapi import APIRouter, Depends
from backend.auth.dependencies import get_current_user
from backend.schemas.user import UserOut
from backend.services.dashboard import get_dashboard_data

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=Dict[str, Any])
async def get_dashboard(current_user: UserOut = Depends(get_current_user)):
    return await get_dashboard_data(current_user)

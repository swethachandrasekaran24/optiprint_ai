from fastapi import APIRouter, Depends, Request
from backend.auth.dependencies import get_current_user
from backend.schemas.user import UserOut, UserUpdate
from backend.services.user import update_user_profile

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
async def get_user_me(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
async def update_user_me(
    user_update: UserUpdate,
    request: Request,
    current_user: UserOut = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return await update_user_profile(str(current_user.id), user_update, ip_address=ip_address)

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from backend.database.mongodb import get_database
from backend.models.user import USER_COLLECTION
from backend.schemas.user import UserCreate, UserOut, Token
from backend.auth.security import verify_password, create_access_token, create_refresh_token, decode_refresh_token
from backend.auth.dependencies import get_current_user
from backend.services.user import create_user
from backend.services.activity import log_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])

class JsonLoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, request: Request):
    ip_address = request.client.host if request.client else None
    return await create_user(user_in, ip_address=ip_address)

@router.post("/login", response_model=Token)
async def login(request: Request):
    email = None
    password = None

    content_type = request.headers.get("content-type", "")

    # 1. Parse JSON
    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email")
            password = body.get("password")
        except Exception:
            pass
    # 2. Parse Form Data
    else:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username/email or password format. Provide email and password."
        )

    db = await get_database()
    user_dict = await db[USER_COLLECTION].find_one({"email": email.lower()})

    if not user_dict or not verify_password(password, user_dict["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user_dict.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This user account has been deactivated."
        )

    user_out = UserOut(**user_dict)

    # Generate tokens
    access_token = create_access_token(subject=user_out.id)
    refresh_token = create_refresh_token(subject=user_out.id)

    # Log login activity
    ip_address = request.client.host if request.client else None
    await log_activity(
        action="user_login",
        user_id=str(user_out.id),
        details={"email": user_out.email},
        ip_address=ip_address
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_out
    )

@router.post("/refresh", response_model=Token)
async def refresh(refresh_data: RefreshRequest, request: Request):
    payload = decode_refresh_token(refresh_data.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user_id = payload.get("sub")
    db = await get_database()
    from bson import ObjectId
    user_dict = await db[USER_COLLECTION].find_one({"_id": ObjectId(user_id)})
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists."
        )

    user_out = UserOut(**user_dict)

    # Generate new tokens
    access_token = create_access_token(subject=user_out.id)
    new_refresh_token = create_refresh_token(subject=user_out.id)

    # Log token refresh
    ip_address = request.client.host if request.client else None
    await log_activity(
        action="token_refresh",
        user_id=str(user_out.id),
        details={"email": user_out.email},
        ip_address=ip_address
    )

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=user_out
    )

@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(request: Request, current_user: UserOut = Depends(get_current_user)):
    # Log logout activity
    ip_address = request.client.host if request.client else None
    await log_activity(
        action="user_logout",
        user_id=str(current_user.id),
        details={"email": current_user.email},
        ip_address=ip_address
    )
    return {"message": "Successfully logged out."}

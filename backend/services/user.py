from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from bson import ObjectId
from backend.database.mongodb import get_database
from backend.models.user import USER_COLLECTION
from backend.schemas.user import UserCreate, UserUpdate, UserOut
from backend.auth.security import get_password_hash
from backend.services.activity import log_activity

async def create_user(user_in: UserCreate, ip_address: Optional[str] = None) -> UserOut:
    db = await get_database()

    # Check if user already exists
    existing_user = await db[USER_COLLECTION].find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists in the system."
        )

    # Hash password and prepare user document
    hashed_password = get_password_hash(user_in.password)
    user_dict = user_in.dict(exclude={"password"})
    user_dict["email"] = user_dict["email"].lower()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    user_dict["preferences"] = {
        "theme": "light",
        "default_optimize_whitespace": True,
        "default_optimize_margins": True,
        "default_optimize_spacing": True,
        "default_optimize_images": True,
        "notifications_enabled": True
    }

    result = await db[USER_COLLECTION].insert_one(user_dict)
    user_dict["_id"] = result.inserted_id

    # Log user registration activity
    await log_activity(
        action="user_register",
        user_id=str(result.inserted_id),
        details={"email": user_dict["email"], "full_name": user_dict["full_name"]},
        ip_address=ip_address
    )

    return UserOut(**user_dict)

async def get_user_by_id(user_id: str) -> Optional[UserOut]:
    db = await get_database()
    try:
        user_dict = await db[USER_COLLECTION].find_one({"_id": ObjectId(user_id)})
        if user_dict:
            return UserOut(**user_dict)
    except Exception:
        pass
    return None

async def update_user_profile(user_id: str, user_update: UserUpdate, ip_address: Optional[str] = None) -> UserOut:
    db = await get_database()
    update_data: Dict[str, Any] = {}

    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name

    if user_update.password is not None:
        update_data["hashed_password"] = get_password_hash(user_update.password)

    if user_update.preferences is not None:
        # Nest preferences dictionary
        pref_dict = user_update.preferences.dict()
        for k, v in pref_dict.items():
            update_data[f"preferences.{k}"] = v

    if not update_data:
        # No updates, fetch current
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    update_data["updated_at"] = datetime.utcnow()

    # Run update
    # In MongoDB, dot notation is updated using $set.
    # To set nested fields, we can do $set with flat dict or update the whole nested preferences object.
    # Let's map it cleanly.
    flat_update = {}
    for k, v in update_data.items():
        flat_update[k] = v

    try:
        await db[USER_COLLECTION].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": flat_update}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failed: {e}"
        )

    updated_user = await get_user_by_id(user_id)
    if not updated_user:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found after update")

    # Log update activity
    await log_activity(
        action="profile_update",
        user_id=user_id,
        details={"fields_updated": list(user_update.dict(exclude_none=True).keys())},
        ip_address=ip_address
    )

    return updated_user

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from backend.database.mongodb import get_database
from backend.models.activity import ACTIVITY_COLLECTION

logger = logging.getLogger("optiprint.activity")

async def log_activity(action: str, user_id: Optional[str] = None, details: Optional[Dict[str, Any]] = None, ip_address: Optional[str] = None):
    try:
        db = await get_database()
        log_entry = {
            "user_id": user_id,
            "action": action,
            "details": details or {},
            "ip_address": ip_address,
            "created_at": datetime.utcnow()
        }
        await db[ACTIVITY_COLLECTION].insert_one(log_entry)
        logger.info(f"Activity Logged: {action} by user {user_id or 'anonymous'}")
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")

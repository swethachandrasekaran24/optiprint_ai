import logging
from typing import Dict, Any, List
from datetime import datetime
from bson import ObjectId
from backend.database.mongodb import get_database
from backend.models.document import DOCUMENT_COLLECTION
from backend.models.job import JOB_COLLECTION
from backend.models.activity import ACTIVITY_COLLECTION
from backend.models.user import USER_COLLECTION
from backend.schemas.user import UserOut

logger = logging.getLogger("optiprint.dashboard")

async def get_dashboard_data(user: UserOut) -> Dict[str, Any]:
    db = await get_database()
    user_id = str(user.id)

    # 1. Total uploaded documents
    total_docs = await db[DOCUMENT_COLLECTION].count_documents({"user_id": user_id})

    # 2. Total processed/optimized documents
    total_optimized = await db[DOCUMENT_COLLECTION].count_documents({
        "user_id": user_id,
        "status": "optimized"
    })

    # 3. Sum up savings from jobs
    pages_saved = 0
    money_saved = 0.0
    carbon_saved = 0.0

    pipeline = [
        {"$match": {"user_id": user_id, "status": "completed"}},
        {"$group": {
            "_id": None,
            "total_pages": {"$sum": "$savings_metrics.pages_saved"},
            "total_money": {"$sum": "$savings_metrics.money_saved"},
            "total_carbon": {"$sum": "$savings_metrics.carbon_saved"}
        }}
    ]

    try:
        cursor = db[JOB_COLLECTION].aggregate(pipeline)
        results = await cursor.to_list(length=1)
        if results:
            pages_saved = int(results[0].get("total_pages", 0))
            money_saved = round(float(results[0].get("total_money", 0.0)), 2)
            carbon_saved = round(float(results[0].get("total_carbon", 0.0)), 1)
    except Exception as e:
        logger.error(f"Error aggregating job savings: {e}")

    # If there are no uploaded files, we can provide soft default values to showcase the UI beautifully,
    # but actual stats should be 0. Let's make it real-time based on actual uploads but return defaults only if specified.
    # Actually, returning actual numbers is better since we trigger automatic mock optimization on upload!
    # So if they upload even 1 document, stats will immediately update.

    # 4. Recent uploads (limit 5)
    recent_docs_cursor = db[DOCUMENT_COLLECTION].find({"user_id": user_id}).sort("created_at", -1).limit(5)
    recent_docs = await recent_docs_cursor.to_list(length=5)
    # Map _id to id and ensure serializable
    recent_docs_list = []
    for doc in recent_docs:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        doc["created_at"] = doc["created_at"].isoformat()
        doc["updated_at"] = doc["updated_at"].isoformat()
        recent_docs_list.append(doc)

    # 5. Recent activity logs (limit 5)
    recent_activity_cursor = db[ACTIVITY_COLLECTION].find({"user_id": user_id}).sort("created_at", -1).limit(5)
    recent_activities = await recent_activity_cursor.to_list(length=5)
    recent_activities_list = []
    for act in recent_activities:
        act["id"] = str(act["_id"])
        act.pop("_id", None)
        act["created_at"] = act["created_at"].isoformat()
        recent_activities_list.append(act)

    return {
        "stats": {
            "total_documents": total_docs,
            "total_optimized": total_optimized,
            "pages_saved": pages_saved,
            "money_saved": money_saved,
            "carbon_saved": carbon_saved,
        },
        "user": {
            "id": user_id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "preferences": user.preferences.dict()
        },
        "recent_uploads": recent_docs_list,
        "recent_activity": recent_activities_list
    }

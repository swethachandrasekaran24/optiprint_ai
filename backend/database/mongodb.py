import logging
from motor.motor_asyncio import AsyncIOMotorClient
from backend.config.settings import settings

logger = logging.getLogger("optiprint.database")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_client = MongoDB()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at: {settings.MONGODB_URL}")
    db_client.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_client.db = db_client.client[settings.DATABASE_NAME]
    logger.info(f"Connected to database: {settings.DATABASE_NAME}")
    await create_indexes()

async def close_mongo_connection():
    if db_client.client:
        db_client.client.close()
        logger.info("Closed MongoDB connection.")

async def get_database():
    if db_client.db is None:
        # Fallback if connection wasn't explicitly started (useful for testing or direct entry)
        db_client.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db_client.db = db_client.client[settings.DATABASE_NAME]
    return db_client.db

async def create_indexes():
    db = await get_database()
    logger.info("Ensuring database indexes...")
    try:
        # User Indexes
        await db.users.create_index("email", unique=True)

        # Document Indexes
        await db.uploaded_documents.create_index("user_id")
        await db.uploaded_documents.create_index("created_at")

        # Optimization Job Indexes
        await db.optimization_jobs.create_index("document_id")
        await db.optimization_jobs.create_index("user_id")
        await db.optimization_jobs.create_index("status")

        # Optimization Report Indexes
        await db.optimization_reports.create_index("job_id", unique=True)
        await db.optimization_reports.create_index("document_id")
        await db.optimization_reports.create_index("user_id")

        # Activity Log Indexes
        await db.activity_logs.create_index("user_id")
        await db.activity_logs.create_index("created_at")

        logger.info("Database indexes ensured successfully.")
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")

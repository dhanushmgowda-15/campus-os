from pymongo import MongoClient, ASCENDING
from bson import ObjectId
from datetime import datetime
from app.config import Config

client = None
db = None

def init_db(app=None):
    global client, db
    uri = Config.MONGO_URI
    client = MongoClient(uri)
    # Extract DB name from URI or default
    db_name = uri.rsplit('/', 1)[-1].split('?')[0] or "campus_os"
    db = client[db_name]
    
    # Ensure indexes
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.notes.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
    db.tasks.create_index([("user_id", ASCENDING), ("status", ASCENDING)])
    db.exams.create_index([("user_id", ASCENDING)])
    db.timetable.create_index([("user_id", ASCENDING)])
    db.skills.create_index([("user_id", ASCENDING)])
    db.resumes.create_index([("user_id", ASCENDING)], unique=True)
    db.jobs.create_index([("deadline", ASCENDING)])
    db.events.create_index([("date", ASCENDING)])
    db.notices.create_index([("posted_at", ASCENDING)])
    
    print(f"Connected to MongoDB database: '{db_name}'")
    return db

def get_db():
    global db
    if db is None:
        init_db()
    return db

def serialize_doc(doc):
    """Serialize a MongoDB document into JSON-serializable dictionary."""
    if not doc:
        return None
    res = {}
    for key, value in doc.items():
        if key == "_id":
            res["id"] = str(value)
        elif isinstance(value, ObjectId):
            res[key] = str(value)
        elif isinstance(value, datetime):
            res[key] = value.isoformat()
        elif isinstance(value, list):
            res[key] = [
                serialize_doc(item) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, datetime)
                else item
                for item in value
            ]
        elif isinstance(value, dict):
            res[key] = serialize_doc(value)
        else:
            res[key] = value
    return res

def serialize_docs(cursor):
    """Serialize a MongoDB cursor/list of documents."""
    return [serialize_doc(doc) for doc in cursor]

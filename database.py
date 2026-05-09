import os
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory
from dotenv import load_dotenv

from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "chatbot_db"
COLLECTION_NAME = "chat_histories"

# Initialize PyMongo client for raw data access
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
metrics_collection = db["user_metrics"]
interventions_collection = db["interventions"]

def get_message_history(session_id: str) -> MongoDBChatMessageHistory:
    return MongoDBChatMessageHistory(
        session_id=session_id,
        connection_string=MONGO_URI,
        database_name=DB_NAME,
        collection_name=COLLECTION_NAME,
    )

def save_user_metrics(session_id: str, metrics: dict):
    import datetime
    metrics["session_id"] = session_id
    metrics["timestamp"] = datetime.datetime.utcnow()
    metrics_collection.insert_one(metrics)

def get_recent_metrics(session_id: str, limit: int = 5):
    cursor = metrics_collection.find({"session_id": session_id}).sort("_id", -1).limit(limit)
    # Convert ObjectId to string to avoid serialization issues
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

def save_intervention(session_id: str, intervention: dict):
    import datetime
    intervention["session_id"] = session_id
    intervention["timestamp"] = datetime.datetime.utcnow()
    interventions_collection.insert_one(intervention)

def get_recent_interventions(session_id: str, limit: int = 5):
    cursor = interventions_collection.find({"session_id": session_id}).sort("_id", -1).limit(limit)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

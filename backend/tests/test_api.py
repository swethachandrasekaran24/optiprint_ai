import os
import io
import pytest
import pymongo
from fastapi.testclient import TestClient
from bson import ObjectId

# Set test environment database before importing settings
os.environ["DATABASE_NAME"] = "optiprint_ai_test"

from backend.app.main import app
from backend.config.settings import settings

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    # Sync setup/cleanup using standard pymongo client (no asyncio conflicts)
    client = pymongo.MongoClient(settings.MONGODB_URL)
    client.drop_database("optiprint_ai_test")

    yield

    # Clean up test database after tests finish
    client.drop_database("optiprint_ai_test")
    client.close()

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_full_auth_and_user_flow(client):
    # 1. Register User
    register_payload = {
        "email": "testuser@optiprint.ai",
        "password": "strongpassword123",
        "full_name": "Test User",
        "role": "user"
    }
    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["email"] == "testuser@optiprint.ai"
    assert data["full_name"] == "Test User"
    assert "id" in data

    # 2. Login User
    login_payload = {
        "email": "testuser@optiprint.ai",
        "password": "strongpassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200, response.text
    login_data = response.json()
    assert "access_token" in login_data
    assert "refresh_token" in login_data
    assert login_data["user"]["email"] == "testuser@optiprint.ai"

    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Me
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@optiprint.ai"

    # 4. Update Profile
    update_payload = {
        "full_name": "Updated Test User",
        "preferences": {
            "theme": "dark",
            "default_optimize_whitespace": False,
            "default_optimize_margins": True,
            "default_optimize_spacing": True,
            "default_optimize_images": False,
            "notifications_enabled": False
        }
    }
    response = client.put("/api/profile", json=update_payload, headers=headers)
    assert response.status_code == 200, response.text
    profile_data = response.json()
    assert profile_data["full_name"] == "Updated Test User"
    assert profile_data["preferences"]["theme"] == "dark"
    assert profile_data["preferences"]["default_optimize_whitespace"] is False

    # 5. Upload File
    file_content = b"This is a mock PDF document for test uploads."
    file_obj = io.BytesIO(file_content)
    files = {"file": ("test_doc.pdf", file_obj, "application/pdf")}

    response = client.post("/api/upload", files=files, headers=headers)
    assert response.status_code == 201, response.text
    doc_data = response.json()
    assert doc_data["filename"] == "test_doc.pdf"
    assert doc_data["file_type"] == "pdf"
    assert doc_data["status"] == "optimized" # Mock triggers optimization instantly!

    doc_id = doc_data["id"]

    # 6. Retrieve Documents List
    response = client.get("/api/documents", headers=headers)
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) > 0
    assert docs[0]["id"] == doc_id

    # 7. Get Document Report
    response = client.get(f"/api/documents/{doc_id}/report", headers=headers)
    assert response.status_code == 200, response.text
    report = response.json()
    assert report["document_id"] == doc_id
    assert "savings_metrics" in report
    assert report["original_pages"] > 0

    # 8. Get Dashboard Statistics
    response = client.get("/api/dashboard", headers=headers)
    assert response.status_code == 200, response.text
    dashboard = response.json()
    assert dashboard["stats"]["total_documents"] == 1
    assert dashboard["stats"]["total_optimized"] == 1
    assert len(dashboard["recent_uploads"]) == 1

    # 9. Delete Document
    response = client.delete(f"/api/documents/{doc_id}", headers=headers)
    assert response.status_code == 200

    # Verify deletion from list
    response = client.get("/api/documents", headers=headers)
    assert len(response.json()) == 0

    # 10. Logout
    response = client.post("/api/auth/logout", headers=headers)
    assert response.status_code == 200

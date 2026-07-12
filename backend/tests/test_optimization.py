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

def test_full_optimization_pipeline_flow(client):
    # 1. Register and login to obtain JWT token
    register_payload = {
        "email": "optiuser@optiprint.ai",
        "password": "securepassword99",
        "full_name": "Optimization User",
        "role": "user"
    }
    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 201, response.text

    login_payload = {
        "email": "optiuser@optiprint.ai",
        "password": "securepassword99"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200, response.text
    login_data = response.json()
    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload file
    file_content = b"This is a mock assignment paper that has several unoptimized margin blocks and white spacing."
    file_obj = io.BytesIO(file_content)
    files = {"file": ("student_report.docx", file_obj, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}

    response = client.post("/api/upload", files=files, headers=headers)
    assert response.status_code == 201, response.text
    doc_data = response.json()
    doc_id = doc_data["id"]
    assert doc_data["filename"] == "student_report.docx"

    # 3. Analyze Document
    analyze_payload = {"document_id": doc_id}
    response = client.post("/api/analyze", json=analyze_payload, headers=headers)
    assert response.status_code == 200, response.text
    analysis = response.json()
    assert "page_count" in analysis
    assert "margins" in analysis
    assert "white_space_percentage" in analysis
    assert "layout_complexity" in analysis

    # 4. Optimize Document
    optimize_payload = {
        "document_id": doc_id,
        "purpose": "Research Paper",
        "mode": "Smart",
        "instructions": "Preserve tables, do not reduce font size"
    }
    response = client.post("/api/optimize", json=optimize_payload, headers=headers)
    assert response.status_code == 200, response.text
    opt_report = response.json()
    assert opt_report["document_id"] == doc_id
    assert "original_pages" in opt_report
    assert "optimized_pages" in opt_report
    assert "savings_metrics" in opt_report
    assert "content_changes_summary" in opt_report

    # 5. Get Optimization Status
    response = client.get(f"/api/status/{doc_id}", headers=headers)
    assert response.status_code == 200, response.text
    status_data = response.json()
    assert status_data["document_id"] == doc_id
    assert status_data["status"] == "optimized"
    assert status_data["progress"] == 100

    # 6. Get Optimization History
    response = client.get("/api/history", headers=headers)
    assert response.status_code == 200, response.text
    history = response.json()
    assert len(history) > 0
    assert history[0]["document_id"] == doc_id
    assert history[0]["purpose"] == "Research Paper"
    assert history[0]["mode"] == "Smart"

    # 7. Download Optimized PDF File
    response = client.get(f"/api/download/{doc_id}", headers=headers)
    assert response.status_code == 200, response.text
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 0

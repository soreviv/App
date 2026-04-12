import pytest
from fastapi.testclient import TestClient
import os
from unittest.mock import patch, AsyncMock

# Set dummy env vars before importing app
os.environ["MONGO_URL"] = "mongodb://localhost:27017"
os.environ["DB_NAME"] = "testdb"

from backend.server import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_db():
    with patch("backend.server.db") as mock:
        yield mock

def test_root():
    # Public endpoint, no header required
    response = client.get("/api/")
    assert response.status_code == 200
    assert response.json() == {"message": "Tinnitus Habituation App API", "version": "1.0.0"}

def test_require_device_id_header():
    # Test that endpoints now require X-Device-ID header
    response = client.get("/api/progress")
    assert response.status_code == 422 # FastAPI returns 422 for missing required header

def test_get_progress_with_header():
    device_id = "test-device"
    headers = {"X-Device-ID": device_id}

    with patch("backend.server.db.user_progress.find_one", new_callable=AsyncMock) as mock_find:
        mock_find.return_value = {
            "device_id": device_id,
            "current_week": 1,
            "current_chapter": 1
        }

        response = client.get("/api/progress", headers=headers)
        assert response.status_code == 200
        mock_find.assert_called_once_with({"device_id": device_id})

def test_update_abc_record_security():
    record_id = "test-record-id"
    device_id = "test-device"
    headers = {"X-Device-ID": device_id}
    payload = {
        "alternative_label": "New label",
        "new_intensity": 3
    }

    with patch("backend.server.db.abc_records.find_one_and_update", new_callable=AsyncMock) as mock_update:
        mock_update.return_value = {
            "id": record_id,
            "device_id": device_id,
            "date": "2023-10-10",
            "situation": "test",
            "alarm_label": "test",
            "emotion": "test",
            "intensity": 5,
            "alternative_label": "New label",
            "new_intensity": 3
        }

        response = client.put(f"/api/abc-records/{record_id}", json=payload, headers=headers)
        assert response.status_code == 200
        mock_update.assert_called_once()
        # Verify it was called with data from header and body
        args, kwargs = mock_update.call_args
        assert args[0] == {"id": record_id, "device_id": device_id}
        assert args[1]["$set"]["alternative_label"] == "New label"

def test_delete_emergency_kit_item_security():
    item_id = "test-item-id"
    device_id = "test-device"
    headers = {"X-Device-ID": device_id}

    with patch("backend.server.db.emergency_kit.delete_one", new_callable=AsyncMock) as mock_delete:
        class MockResult:
            deleted_count = 1
        mock_delete.return_value = MockResult()

        response = client.delete(f"/api/emergency-kit/{item_id}", headers=headers)
        assert response.status_code == 200
        mock_delete.assert_called_once_with({"id": item_id, "device_id": device_id})

def test_complete_chapter_security():
    device_id = "test-device"
    headers = {"X-Device-ID": device_id}
    chapter_id = 5

    with patch("backend.server.db.user_progress.find_one_and_update", new_callable=AsyncMock) as mock_update:
        mock_update.return_value = {"device_id": device_id, "chapters_completed": [5]}

        response = client.post(f"/api/progress/complete-chapter/{chapter_id}", headers=headers)
        assert response.status_code == 200
        mock_update.assert_called_once()
        args, kwargs = mock_update.call_args
        assert args[0] == {"device_id": device_id}
        assert chapter_id == args[1]["$addToSet"]["chapters_completed"]

def test_get_emergency_kit_security():
    device_id = "test-device"
    headers = {"X-Device-ID": device_id}

    with patch("backend.server.db.emergency_kit.find") as mock_find:
        # motor-style mock for find().to_list()
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = []
        mock_find.return_value = mock_cursor

        response = client.get("/api/emergency-kit", headers=headers)
        assert response.status_code == 200
        mock_find.assert_called_once_with({"device_id": device_id})

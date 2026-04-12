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
    response = client.get("/api/")
    assert response.status_code == 200
    assert response.json() == {"message": "Tinnitus Habituation App API", "version": "1.0.0"}

def test_update_abc_record_security():
    record_id = "test-record-id"
    payload = {
        "device_id": "test-device",
        "alternative_label": "New label",
        "new_intensity": 3
    }

    with patch("backend.server.db.abc_records.find_one_and_update", new_callable=AsyncMock) as mock_update:
        mock_update.return_value = {
            "id": record_id,
            "device_id": "test-device",
            "date": "2023-10-10",
            "situation": "test",
            "alarm_label": "test",
            "emotion": "test",
            "intensity": 5,
            "alternative_label": "New label",
            "new_intensity": 3
        }

        response = client.put(f"/api/abc-records/{record_id}", json=payload)
        assert response.status_code == 200
        mock_update.assert_called_once()
        # Verify it was called with data from body
        args, kwargs = mock_update.call_args
        assert args[0] == {"id": record_id, "device_id": "test-device"}
        assert args[1]["$set"]["alternative_label"] == "New label"

def test_delete_emergency_kit_item_security():
    item_id = "test-item-id"
    payload = {"device_id": "test-device"}

    with patch("backend.server.db.emergency_kit.delete_one", new_callable=AsyncMock) as mock_delete:
        # Mocking the return value of delete_one which is an object with deleted_count
        class MockResult:
            deleted_count = 1
        mock_delete.return_value = MockResult()

        response = client.request("DELETE", f"/api/emergency-kit/{item_id}", json=payload)
        assert response.status_code == 200
        mock_delete.assert_called_once_with({"id": item_id, "device_id": "test-device"})

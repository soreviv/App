
import sys
import os
import unittest
from unittest.mock import MagicMock, AsyncMock
import asyncio

# Mock motor and pymongo before importing server
sys.modules['motor'] = MagicMock()
sys.modules['motor.motor_asyncio'] = MagicMock()
sys.modules['pymongo'] = MagicMock()

# Avoid actual DB connection during import
os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
os.environ['DB_NAME'] = 'test'

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

import server
from server import ABCRecordUpdate

class TestSecurityFixes(unittest.TestCase):
    def setUp(self):
        # Mock database
        server.db = MagicMock()

    def test_update_abc_record_security(self):
        # GIVEN
        record_id = 'test-record-id'
        device_id = 'test-device-id'
        update_data = ABCRecordUpdate(
            device_id=device_id,
            alternative_label='New Label',
            new_intensity=3
        )

        # Mock find_one_and_update
        server.db.abc_records.find_one_and_update = AsyncMock(return_value={
            'id': record_id,
            'device_id': device_id,
            'date': '2024-05-20',
            'situation': 'Test',
            'alarm_label': 'Test',
            'emotion': 'Test',
            'intensity': 5,
            'alternative_label': 'New Label',
            'new_intensity': 3,
            'created_at': '2024-05-20T10:00:00'
        })

        # WHEN
        loop = asyncio.get_event_loop()
        loop.run_until_complete(server.update_abc_record(record_id, update_data))

        # THEN: Verify the query used device_id (IDOR fix)
        args, _ = server.db.abc_records.find_one_and_update.call_args
        self.assertEqual(args[0]['id'], record_id)
        self.assertEqual(args[0]['device_id'], device_id)

    def test_delete_emergency_kit_item_security(self):
        # GIVEN
        item_id = 'test-item-id'
        device_id = 'test-device-id'
        server.db.emergency_kit.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))

        # WHEN
        loop = asyncio.get_event_loop()
        loop.run_until_complete(server.delete_emergency_kit_item(item_id, device_id))

        # THEN: Verify the query used device_id (IDOR fix)
        args, _ = server.db.emergency_kit.delete_one.call_args
        self.assertEqual(args[0]['id'], item_id)
        self.assertEqual(args[0]['device_id'], device_id)

if __name__ == '__main__':
    unittest.main()

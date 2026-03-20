#!/usr/bin/env python3
"""
Backend API Tests for Tinnitus Habituation App
Tests all the API endpoints mentioned in the review request
"""

import requests
import json
from datetime import datetime, date
import sys
import traceback

# Backend URL from environment
BASE_URL = "https://89cd57d7-c9af-4b65-83cc-06077346ef65.preview.emergentagent.com/api"
DEVICE_ID = "test_device_123"

def print_test_result(test_name, success, response_data=None, error_msg=None):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if not success and error_msg:
        print(f"    Error: {error_msg}")
    if response_data and success:
        print(f"    Response: {json.dumps(response_data, indent=2, default=str)}")
    print("-" * 60)

def test_api_health():
    """Test API health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print_test_result("API Health Check", True, data)
            return True
        else:
            print_test_result("API Health Check", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("API Health Check", False, error_msg=str(e))
        return False

def test_create_user_progress():
    """Test creating user progress"""
    try:
        payload = {"device_id": DEVICE_ID}
        response = requests.post(f"{BASE_URL}/progress", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Create User Progress", True, data)
            return True
        else:
            print_test_result("Create User Progress", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Create User Progress", False, error_msg=str(e))
        return False

def test_get_progress():
    """Test getting user progress"""
    try:
        response = requests.get(f"{BASE_URL}/progress/{DEVICE_ID}")
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Get User Progress", True, data)
            return True
        else:
            print_test_result("Get User Progress", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Get User Progress", False, error_msg=str(e))
        return False

def test_complete_chapter():
    """Test completing a chapter"""
    try:
        response = requests.post(f"{BASE_URL}/progress/{DEVICE_ID}/complete-chapter/1")
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Complete Chapter 1", True, data)
            return True
        else:
            print_test_result("Complete Chapter 1", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Complete Chapter 1", False, error_msg=str(e))
        return False

def test_create_daily_log():
    """Test creating a daily log"""
    try:
        today = date.today().strftime("%Y-%m-%d")
        payload = {
            "device_id": DEVICE_ID,
            "date": today,
            "distress_level": 5,
            "reflection": "Feeling moderate distress today",
            "sleep_quality": 6,
            "notes": "Practiced breathing exercises"
        }
        response = requests.post(f"{BASE_URL}/daily-logs", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Create Daily Log", True, data)
            return True
        else:
            print_test_result("Create Daily Log", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Create Daily Log", False, error_msg=str(e))
        return False

def test_get_daily_logs():
    """Test getting daily logs"""
    try:
        response = requests.get(f"{BASE_URL}/daily-logs/{DEVICE_ID}")
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Get Daily Logs", True, data)
            return True
        else:
            print_test_result("Get Daily Logs", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Get Daily Logs", False, error_msg=str(e))
        return False

def test_create_abc_record():
    """Test creating an ABC record"""
    try:
        today = date.today().strftime("%Y-%m-%d")
        payload = {
            "device_id": DEVICE_ID,
            "date": today,
            "situation": "Loud restaurant with family dinner",
            "time": "19:30",
            "location": "Local restaurant",
            "alarm_label": "This tinnitus will ruin the entire evening",
            "emotion": "anxiety",
            "intensity": 7,
            "action_taken": "Used breathing exercises and stayed at dinner"
        }
        response = requests.post(f"{BASE_URL}/abc-records", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Create ABC Record", True, data)
            return True
        else:
            print_test_result("Create ABC Record", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Create ABC Record", False, error_msg=str(e))
        return False

def test_create_emergency_kit_item():
    """Test creating an emergency kit item"""
    try:
        payload = {
            "device_id": DEVICE_ID,
            "category": "containment_phrase",
            "title": "Calming Phrase",
            "content": "This feeling will pass, I am in control of my response"
        }
        response = requests.post(f"{BASE_URL}/emergency-kit", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Create Emergency Kit Item", True, data)
            return True
        else:
            print_test_result("Create Emergency Kit Item", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Create Emergency Kit Item", False, error_msg=str(e))
        return False

def test_get_emergency_kit():
    """Test getting emergency kit items"""
    try:
        response = requests.get(f"{BASE_URL}/emergency-kit/{DEVICE_ID}")
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Get Emergency Kit", True, data)
            return True
        else:
            print_test_result("Get Emergency Kit", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Get Emergency Kit", False, error_msg=str(e))
        return False

def test_create_questionnaire_response():
    """Test creating a questionnaire response"""
    try:
        today = date.today().strftime("%Y-%m-%d")
        payload = {
            "device_id": DEVICE_ID,
            "date": today,
            "week_number": 1,
            "sleep_difficulty": 2,
            "concentration_interference": 3,
            "frustration_anger": 2,
            "social_impact": 1,
            "future_worry": 3,
            "relaxation_difficulty": 2,
            "overwhelm_despair": 1
        }
        response = requests.post(f"{BASE_URL}/questionnaire", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("Create Questionnaire Response", True, data)
            return True
        else:
            print_test_result("Create Questionnaire Response", False, error_msg=f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Create Questionnaire Response", False, error_msg=str(e))
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print("=" * 60)
    print("STARTING TINNITUS HABITUATION APP API TESTS")
    print("=" * 60)
    print(f"Backend URL: {BASE_URL}")
    print(f"Device ID: {DEVICE_ID}")
    print("=" * 60)
    
    tests = [
        test_api_health,
        test_create_user_progress,
        test_get_progress,
        test_complete_chapter,
        test_create_daily_log,
        test_get_daily_logs,
        test_create_abc_record,
        test_create_emergency_kit_item,
        test_get_emergency_kit,
        test_create_questionnaire_response
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ FAIL {test.__name__} - Unexpected error: {str(e)}")
            traceback.print_exc()
    
    print("=" * 60)
    print(f"TEST SUMMARY: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
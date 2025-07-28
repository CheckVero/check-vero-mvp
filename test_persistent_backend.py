#!/usr/bin/env python3
"""
Test script for Check Vero persistent backend
Run this after deploying to verify all endpoints work
"""

import requests
import json

def test_backend(base_url):
    print(f"🧪 Testing Check Vero Backend at: {base_url}")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            print("✅ Health check: PASSED")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ Health check: ERROR - {e}")
    
    print()
    
    # Test 2: Phone verification
    try:
        response = requests.post(
            f"{base_url}/api/verify-phone",
            json={"phone_number": "+31612345678"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("is_verified") and "Acme Bank" in data.get("company_name", ""):
                print("✅ Phone verification: PASSED")
                print(f"   Company: {data.get('company_name')}")
                print(f"   Message: {data.get('message')}")
            else:
                print("❌ Phone verification: FAILED - Incorrect data")
        else:
            print(f"❌ Phone verification: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ Phone verification: ERROR - {e}")
    
    print()
    
    # Test 3: User registration
    try:
        test_user = {
            "username": f"testuser_{int(requests.time.time())}",
            "email": "test@example.com",
            "password": "TestPass123!",
            "role": "citizen"
        }
        
        response = requests.post(
            f"{base_url}/api/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print("✅ User registration: PASSED")
                print(f"   User ID: {data.get('user_id')}")
                print(f"   Role: {data.get('role')}")
            else:
                print("❌ User registration: FAILED - No token")
        else:
            print(f"❌ User registration: FAILED ({response.status_code})")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ User registration: ERROR - {e}")
    
    print()
    print("🎯 Backend testing completed!")

if __name__ == "__main__":
    # Test the deployed backend
    test_backend("https://checkvero-api.vercel.app")
    
    # Also test current backend as fallback
    print("\n" + "=" * 50)
    print("Testing fallback backend...")
    test_backend("https://b175beef-7ded-4a3d-8fd1-e5ba7a9ba148.preview.emergentagent.com")
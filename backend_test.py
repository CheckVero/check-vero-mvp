#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CheckVeroAPITester:
    def __init__(self, base_url="https://b175beef-7ded-4a3d-8fd1-e5ba7a9ba148.preview.emergentagent.com"):
        self.base_url = base_url
        self.citizen_token = None
        self.business_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_users = {}
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error details: {error_detail}")
                except:
                    self.log(f"   Response text: {response.text}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "/api/health", 200)

    def test_user_registration(self, role, username, email, password, company_name=None):
        """Test user registration for different roles"""
        data = {
            "username": username,
            "email": email,
            "password": password,
            "role": role
        }
        if company_name:
            data["company_name"] = company_name
            
        success, response = self.run_test(
            f"Register {role.title()} User",
            "POST",
            "/api/register",
            200,
            data=data
        )
        
        if success and 'access_token' in response:
            self.test_users[role] = {
                'username': username,
                'password': password,
                'token': response['access_token'],
                'user_id': response['user_id']
            }
            return True, response['access_token']
        return False, None

    def test_user_login(self, username, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "/api/login",
            200,
            data={"username": username, "password": password}
        )
        
        if success and 'access_token' in response:
            return True, response['access_token']
        return False, None

    def test_phone_registration(self, token, phone_number, company_name, description=None):
        """Test phone number registration (business/admin only)"""
        data = {
            "phone_number": phone_number,
            "company_name": company_name
        }
        if description:
            data["description"] = description
            
        return self.run_test(
            "Register Phone Number",
            "POST",
            "/api/phone-numbers/register",
            200,
            data=data,
            token=token
        )

    def test_phone_verification(self, phone_number, expected_verified=None, expected_company=None):
        """Test phone number verification (public endpoint)"""
        success, response = self.run_test(
            f"Verify Phone Number: {phone_number}",
            "POST",
            "/api/verify-phone",
            200,
            data={"phone_number": phone_number}
        )
        
        if success and response:
            is_verified = response.get('is_verified', False)
            company_name = response.get('company_name', '')
            message = response.get('message', '')
            
            self.log(f"   Result: {'✅ VERIFIED' if is_verified else '❌ NOT VERIFIED'}")
            if is_verified:
                self.log(f"   Company: {company_name}")
            self.log(f"   Message: {message}")
            
            # Validate expected results if provided
            if expected_verified is not None:
                if is_verified == expected_verified:
                    self.log(f"   ✅ Verification status matches expected: {expected_verified}")
                else:
                    self.log(f"   ❌ Verification status mismatch. Expected: {expected_verified}, Got: {is_verified}")
                    return False, response
                    
            if expected_company and is_verified:
                if company_name == expected_company:
                    self.log(f"   ✅ Company name matches expected: {expected_company}")
                else:
                    self.log(f"   ❌ Company name mismatch. Expected: {expected_company}, Got: {company_name}")
                    return False, response
        
        return success, response

    def test_fraud_report_submission(self, token, report_type, description, phone_number=None, email_address=None):
        """Test fraud report submission (citizen only)"""
        data = {
            "report_type": report_type,
            "description": description
        }
        if phone_number:
            data["phone_number"] = phone_number
        if email_address:
            data["email_address"] = email_address
            
        return self.run_test(
            "Submit Fraud Report",
            "POST",
            "/api/reports/submit",
            200,
            data=data,
            token=token
        )

    def test_get_my_reports(self, token):
        """Test getting user's reports"""
        return self.run_test(
            "Get My Reports",
            "GET",
            "/api/reports/my-reports",
            200,
            token=token
        )

    def test_get_all_reports(self, token):
        """Test getting all reports (admin only)"""
        return self.run_test(
            "Get All Reports (Admin)",
            "GET",
            "/api/reports/all",
            200,
            token=token
        )

    def test_get_my_phone_numbers(self, token):
        """Test getting user's phone numbers"""
        return self.run_test(
            "Get My Phone Numbers",
            "GET",
            "/api/phone-numbers/my-numbers",
            200,
            token=token
        )

    def test_get_user_profile(self, token):
        """Test getting user profile"""
        return self.run_test(
            "Get User Profile",
            "GET",
            "/api/users/profile",
            200,
            token=token
        )

    def test_get_dashboard_stats(self, token, role):
        """Test getting dashboard statistics"""
        return self.run_test(
            f"Get Dashboard Stats ({role})",
            "GET",
            "/api/stats/dashboard",
            200,
            token=token
        )

    def test_role_based_access_control(self):
        """Test that role-based access control works properly"""
        self.log("\n🔒 Testing Role-Based Access Control...")
        
        # Test citizen trying to register phone number (should fail)
        if 'citizen' in self.test_users:
            success, _ = self.run_test(
                "Citizen Access to Phone Registration (Should Fail)",
                "POST",
                "/api/phone-numbers/register",
                403,
                data={"phone_number": "+1234567890", "company_name": "Test"},
                token=self.test_users['citizen']['token']
            )
        
        # Test citizen trying to access all reports (should fail)
        if 'citizen' in self.test_users:
            success, _ = self.run_test(
                "Citizen Access to All Reports (Should Fail)",
                "GET",
                "/api/reports/all",
                403,
                token=self.test_users['citizen']['token']
            )
        
        # Test business trying to submit report (should fail)
        if 'business' in self.test_users:
            success, _ = self.run_test(
                "Business Submit Report (Should Fail)",
                "POST",
                "/api/reports/submit",
                403,
                data={"report_type": "call", "description": "Test report"},
                token=self.test_users['business']['token']
            )

def main():
    tester = CheckVeroAPITester()
    timestamp = datetime.now().strftime('%H%M%S')
    
    tester.log("🚀 Starting Check Vero API Tests...")
    
    # 1. Test Health Check
    tester.test_health_check()
    
    # 2. Test User Registration for all roles
    tester.log("\n👥 Testing User Registration...")
    tester.test_user_registration("citizen", f"citizen_user_{timestamp}", f"citizen_{timestamp}@test.com", "TestPass123!")
    tester.test_user_registration("business", f"business_user_{timestamp}", f"business_{timestamp}@test.com", "TestPass123!", "Test Business Corp")
    tester.test_user_registration("admin", f"admin_user_{timestamp}", f"admin_{timestamp}@test.com", "TestPass123!")
    
    # 3. Test User Login
    tester.log("\n🔐 Testing User Login...")
    if 'citizen' in tester.test_users:
        tester.test_user_login(tester.test_users['citizen']['username'], tester.test_users['citizen']['password'])
    
    # 4. Test Phone Number Registration (Business/Admin only)
    tester.log("\n📞 Testing Phone Number Registration...")
    test_phone = f"+1555000{timestamp[-3:]}"
    if 'business' in tester.test_users:
        tester.test_phone_registration(
            tester.test_users['business']['token'],
            test_phone,
            "Test Business Corp",
            "Customer service line"
        )
    
    # 5. Test Phone Number Verification (Public)
    tester.log("\n✅ Testing Phone Number Verification...")
    tester.test_phone_verification(test_phone)
    tester.test_phone_verification("+1999999999")  # Non-existent number
    
    # 6. Test Fraud Report Submission (Citizen only)
    tester.log("\n📋 Testing Fraud Report Submission...")
    if 'citizen' in tester.test_users:
        # Test high-risk report
        tester.test_fraud_report_submission(
            tester.test_users['citizen']['token'],
            "call",
            "Urgent call asking me to verify account details and click now to avoid suspension. They said I won a prize!",
            "+1800123456"
        )
        
        # Test medium-risk report
        tester.test_fraud_report_submission(
            tester.test_users['citizen']['token'],
            "email",
            "Suspicious email asking for personal information",
            email_address="suspicious@tempmail.com"
        )
        
        # Test low-risk report
        tester.test_fraud_report_submission(
            tester.test_users['citizen']['token'],
            "ai_chat",
            "Normal conversation but seemed a bit odd"
        )
    
    # 7. Test Data Retrieval Endpoints
    tester.log("\n📊 Testing Data Retrieval...")
    
    # Test citizen endpoints
    if 'citizen' in tester.test_users:
        token = tester.test_users['citizen']['token']
        tester.test_get_my_reports(token)
        tester.test_get_user_profile(token)
        tester.test_get_dashboard_stats(token, "citizen")
    
    # Test business endpoints
    if 'business' in tester.test_users:
        token = tester.test_users['business']['token']
        tester.test_get_my_phone_numbers(token)
        tester.test_get_user_profile(token)
        tester.test_get_dashboard_stats(token, "business")
    
    # Test admin endpoints
    if 'admin' in tester.test_users:
        token = tester.test_users['admin']['token']
        tester.test_get_all_reports(token)
        tester.test_get_my_phone_numbers(token)
        tester.test_get_user_profile(token)
        tester.test_get_dashboard_stats(token, "admin")
    
    # 8. Test Role-Based Access Control
    tester.test_role_based_access_control()
    
    # Print final results
    tester.log(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        tester.log("🎉 All tests passed!")
        return 0
    else:
        tester.log(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
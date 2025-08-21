from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
import json
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from pymongo import MongoClient
import base64
from enum import Enum
import re

# Initialize FastAPI app
app = FastAPI(title="Check Vero API", description="Professional fraud verification platform")

# Add CORS middleware with explicit configuration for production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://checkvero.com",
        "https://www.checkvero.com", 
        "https://vero-check.preview.emergentagent.com",
        "http://localhost:3000",  # For development
        "*"  # Fallback for other domains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(mongo_url)
db = client.checkvero

# Security setup
SECRET_KEY = "your-secret-key-here-check-vero-mvp"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    CITIZEN = "citizen"
    BUSINESS = "business"
    ADMIN = "admin"

class ReportType(str, Enum):
    CALL = "call"
    EMAIL = "email"
    AI_CHAT = "ai_chat"

class ReportStatus(str, Enum):
    PENDING = "pending"
    ANALYZED = "analyzed"
    VERIFIED = "verified"
    REJECTED = "rejected"

# Enhanced Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str

class PhoneNumberRegister(BaseModel):
    phone_number: str
    company_name: str
    description: Optional[str] = None

class ReportCreate(BaseModel):
    report_type: ReportType
    phone_number: Optional[str] = None
    email_address: Optional[str] = None
    description: str
    screenshot: Optional[str] = None  # Base64 encoded file data

class VerificationCheck(BaseModel):
    phone_number: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        role: str = payload.get("role")
        if username is None or user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return {"username": username, "user_id": user_id, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Enhanced AI Analysis Function
def advanced_ai_analysis(report_data):
    """Enhanced AI analysis with more sophisticated fraud detection patterns"""
    
    # Suspicious keywords and patterns
    high_risk_keywords = [
        "urgent", "immediate", "act now", "limited time", "verify account", "suspended account",
        "click here", "confirm identity", "prize", "winner", "lottery", "inheritance",
        "congratulations", "selected", "refund", "tax refund", "irs", "social security",
        "credit card", "bank account", "bitcoin", "cryptocurrency", "investment opportunity",
        "prince", "nigeria", "foreign country", "legal action", "arrest warrant"
    ]
    
    medium_risk_keywords = [
        "help", "assistance", "support", "verify", "confirm", "update", "expires",
        "security", "protection", "alert", "warning", "notice", "important",
        "free", "discount", "offer", "deal", "save money", "cash", "loan"
    ]
    
    description = report_data.get("description", "").lower()
    phone_number = report_data.get("phone_number", "")
    email_address = report_data.get("email_address", "")
    
    # Initialize analysis
    risk_score = 0
    reasons = []
    confidence_factors = []
    
    # Analyze keywords
    high_risk_matches = [word for word in high_risk_keywords if word in description]
    medium_risk_matches = [word for word in medium_risk_keywords if word in description]
    
    if high_risk_matches:
        risk_score += len(high_risk_matches) * 3
        reasons.append(f"Contains high-risk keywords: {', '.join(high_risk_matches[:3])}")
        confidence_factors.append("High-risk language patterns")
    
    if medium_risk_matches:
        risk_score += len(medium_risk_matches) * 1
        if len(medium_risk_matches) > 2:
            reasons.append(f"Multiple suspicious keywords detected ({len(medium_risk_matches)} found)")
            confidence_factors.append("Multiple warning indicators")
    
    # Phone number analysis
    if phone_number:
        # Check for suspicious phone patterns
        if any(pattern in phone_number for pattern in ["800", "888", "877", "866", "855", "844", "833", "822"]):
            risk_score += 1
            reasons.append("Uses toll-free number (common in scams)")
        
        if phone_number.startswith("unknown") or phone_number.startswith("blocked"):
            risk_score += 2
            reasons.append("Caller ID blocked or unknown")
            confidence_factors.append("Hidden caller identity")
        
        if not re.match(r'^[\+]?[1-9][\d\-\s\(\)]{7,15}$', phone_number):
            risk_score += 1
            reasons.append("Invalid or suspicious phone number format")
    
    # Email analysis
    if email_address:
        # Check for suspicious email patterns
        suspicious_domains = [
            "tempmail", "10minutemail", "guerrillamail", "mailinator", "yopmail",
            "gmail.com", "yahoo.com", "hotmail.com"  # Free email services (medium risk)
        ]
        
        domain = email_address.split('@')[-1].lower() if '@' in email_address else ""
        
        if any(sus_domain in domain for sus_domain in suspicious_domains[:5]):  # Temporary email services
            risk_score += 3
            reasons.append("Uses temporary/disposable email service")
            confidence_factors.append("Temporary email provider")
        elif any(sus_domain in domain for sus_domain in suspicious_domains[5:]):  # Free email services
            risk_score += 1
            reasons.append("Uses free email service (common in scams)")
        
        # Check for typosquatting
        legit_domains = ["paypal.com", "amazon.com", "apple.com", "microsoft.com", "google.com", "facebook.com"]
        for legit in legit_domains:
            if legit in domain and domain != legit:
                risk_score += 4
                reasons.append(f"Potential typosquatting: {domain} mimics {legit}")
                confidence_factors.append("Domain impersonation")
    
    # Content analysis patterns
    if "click" in description and any(word in description for word in ["link", "here", "now", "urgent"]):
        risk_score += 2
        reasons.append("Suspicious call-to-action language")
    
    if any(word in description for word in ["money", "payment", "card", "account"]) and \
       any(word in description for word in ["problem", "issue", "suspend", "block", "verify"]):
        risk_score += 3
        reasons.append("Financial information request under pressure")
        confidence_factors.append("Financial urgency tactics")
    
    # Personal information requests
    if any(word in description for word in ["ssn", "social security", "date of birth", "mother's maiden", "password"]):
        risk_score += 4
        reasons.append("Requests sensitive personal information")
        confidence_factors.append("Identity theft indicators")
    
    # Communication urgency
    urgency_words = ["immediately", "right now", "asap", "expires today", "limited time", "act fast"]
    if any(word in description for word in urgency_words):
        risk_score += 2
        reasons.append("Creates false sense of urgency")
    
    # Determine risk level and response
    if risk_score >= 8:
        risk_level = "HIGH"
        recommendation = "🚨 HIGH RISK - This appears to be a scam. Do not provide any personal information, click links, or send money. Report to authorities if financial loss occurred."
        points_awarded = 30
        confidence_score = min(90 + (risk_score - 8) * 2, 98)
    elif risk_score >= 4:
        risk_level = "MEDIUM"
        recommendation = "⚠️ MEDIUM RISK - Exercise extreme caution. Verify through official channels before taking any action. Do not provide personal information."
        points_awarded = 20
        confidence_score = min(75 + (risk_score - 4) * 3, 89)
    else:
        risk_level = "LOW"
        recommendation = "✅ LOW RISK - No obvious red flags detected, but always remain vigilant with unsolicited communications."
        points_awarded = 10
        confidence_score = min(60 + risk_score * 5, 74)
    
    # Add confidence factors to response
    analysis_details = {
        "risk_score": risk_score,
        "confidence_factors": confidence_factors,
        "keywords_detected": {
            "high_risk": high_risk_matches,
            "medium_risk": medium_risk_matches
        }
    }
    
    return {
        "risk_level": risk_level,
        "recommendation": recommendation,
        "confidence_score": confidence_score,
        "reasons": reasons,
        "points_awarded": points_awarded,
        "analysis_details": analysis_details
    }

# Initialize sample data on startup
def initialize_sample_data():
    """Initialize sample phone numbers for testing"""
    sample_numbers = [
        {
            "phone_id": str(uuid.uuid4()),
            "phone_number": "+31612345678",
            "company_name": "Acme Bank",
            "description": "Customer Service Line",
            "registered_by": "system",
            "verified": True,
            "verification_date": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "verification_count": 0
        },
        {
            "phone_id": str(uuid.uuid4()),
            "phone_number": "+61298765432",
            "company_name": "Gov Australia",
            "description": "Government Services",
            "registered_by": "system",
            "verified": True,
            "verification_date": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "verification_count": 0
        },
        {
            "phone_id": str(uuid.uuid4()),
            "phone_number": "+14155552020",
            "company_name": "TechCorp Support",
            "description": "Technical Support Hotline",
            "registered_by": "system",
            "verified": True,
            "verification_date": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "verification_count": 0
        },
        {
            "phone_id": str(uuid.uuid4()),
            "phone_number": "+442071234567",
            "company_name": "British Telecom",
            "description": "Customer Services",
            "registered_by": "system",
            "verified": True,
            "verification_date": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "verification_count": 0
        }
    ]
    
    for phone in sample_numbers:
        # Only insert if not already exists
        existing = db.phone_numbers.find_one({"phone_number": phone["phone_number"]})
        if not existing:
            db.phone_numbers.insert_one(phone)
    
    print(f"✅ Sample data initialized: {len(sample_numbers)} phone numbers")

# Initialize sample data when server starts
try:
    initialize_sample_data()
except Exception as e:
    print(f"⚠️ Warning: Could not initialize sample data: {e}")

# Function to log verification attempts
def log_verification_attempt(phone_number, result, ip_address=None):
    """Log phone number verification attempts"""
    try:
        log_entry = {
            "log_id": str(uuid.uuid4()),
            "phone_number": phone_number,
            "result": result,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow(),
            "user_agent": None  # Could be added from request headers
        }
        db.verification_logs.insert_one(log_entry)
    except Exception as e:
        print(f"Warning: Could not log verification attempt: {e}")

# Routes
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight requests"""
    return {"message": "OK"}

@app.get("/api/debug/test")
async def debug_test():
    """Debug endpoint for testing connectivity"""
    return {
        "status": "debug_ok",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "If you can see this, the API is working correctly"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "Check Vero API", 
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "cors_enabled": True,
        "allowed_origins": ["https://checkvero.com", "https://www.checkvero.com"]
    }

@app.get("/api/cors-test")
async def cors_test():
    """Test endpoint specifically for CORS verification"""
    return {
        "status": "cors_ok",
        "message": "CORS is working correctly from checkvero.com",
        "timestamp": datetime.utcnow().isoformat(),
        "backend_url": "https://vero-check.preview.emergentagent.com"
    }

@app.post("/api/register", response_model=Token)
async def register_user(user: UserCreate):
    # Enhanced validation
    if len(user.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Check if user already exists
    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "user_id": user_id,
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "company_name": user.company_name,
        "points": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "email_verified": False
    }
    
    db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user_id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "role": user.role
    }

@app.post("/api/login", response_model=Token)
async def login_user(user: UserLogin):
    db_user = db.users.find_one({"username": user.username})
    
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    if not db_user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    # Update last login
    db.users.update_one(
        {"user_id": db_user["user_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": db_user["user_id"], "role": db_user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user["user_id"],
        "role": db_user["role"]
    }

@app.post("/api/phone-numbers/register")
async def register_phone_number(phone_data: PhoneNumberRegister, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["business", "admin"]:
        raise HTTPException(status_code=403, detail="Only businesses and admins can register phone numbers")
    
    # Enhanced phone number validation
    if not re.match(r'^[\+]?[1-9][\d\-\s\(\)]{7,15}$', phone_data.phone_number):
        raise HTTPException(status_code=400, detail="Invalid phone number format")
    
    # Check if phone number already exists
    existing = db.phone_numbers.find_one({"phone_number": phone_data.phone_number})
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    phone_doc = {
        "phone_id": str(uuid.uuid4()),
        "phone_number": phone_data.phone_number,
        "company_name": phone_data.company_name,
        "description": phone_data.description,
        "registered_by": current_user["user_id"],
        "verified": True,
        "verification_date": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "verification_count": 0
    }
    
    db.phone_numbers.insert_one(phone_doc)
    
    return {"message": "Phone number registered successfully", "phone_id": phone_doc["phone_id"]}

@app.post("/api/verify-phone")
async def verify_phone_number(verification: VerificationCheck):
    """Verify if a phone number is registered and log the attempt"""
    
    # Clean and normalize the phone number
    phone_number = verification.phone_number.strip()
    
    # Look up the phone number in the database
    phone_record = db.phone_numbers.find_one({
        "phone_number": phone_number, 
        "is_active": True
    })
    
    if phone_record:
        # Increment verification count
        db.phone_numbers.update_one(
            {"phone_id": phone_record["phone_id"]},
            {
                "$inc": {"verification_count": 1}, 
                "$set": {"last_verified": datetime.utcnow()}
            }
        )
        
        result = {
            "is_verified": True,
            "company_name": phone_record["company_name"],
            "description": phone_record.get("description", ""),
            "verified_since": phone_record["verification_date"],
            "verification_count": phone_record.get("verification_count", 0) + 1,
            "message": f"✅ This number is verified and belongs to {phone_record['company_name']}"
        }
        
        # Log the successful verification
        log_verification_attempt(phone_number, "verified")
        
        return result
    else:
        result = {
            "is_verified": False,
            "message": "❌ This number is not registered. Proceed with caution.",
            "warning": "Unregistered numbers may be legitimate businesses not yet in our database, or potential scammers."
        }
        
        # Log the failed verification
        log_verification_attempt(phone_number, "not_verified")
        
        return result

@app.post("/api/reports/submit")
async def submit_report(report: ReportCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can submit reports")
    
    # Enhanced validation
    if len(report.description) < 10:
        raise HTTPException(status_code=400, detail="Description must be at least 10 characters")
    
    report_id = str(uuid.uuid4())
    
    # Enhanced AI analysis
    ai_analysis = advanced_ai_analysis({
        "description": report.description,
        "phone_number": report.phone_number,
        "email_address": report.email_address
    })
    
    # Process file upload if provided
    screenshot_info = None
    if report.screenshot:
        # In a real implementation, you would save the file to cloud storage
        # For now, we'll just store metadata
        screenshot_info = {
            "uploaded": True,
            "size": len(report.screenshot),
            "type": "image" if report.screenshot.startswith("data:image") else "unknown"
        }
    
    report_doc = {
        "report_id": report_id,
        "user_id": current_user["user_id"],
        "report_type": report.report_type,
        "phone_number": report.phone_number,
        "email_address": report.email_address,
        "description": report.description,
        "screenshot_info": screenshot_info,
        "status": ReportStatus.ANALYZED,
        "ai_analysis": ai_analysis,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }
    
    db.reports.insert_one(report_doc)
    
    # Award points to user
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"points": ai_analysis["points_awarded"]}}
    )
    
    return {
        "report_id": report_id,
        "message": "Report submitted and analyzed successfully",
        "ai_analysis": ai_analysis
    }

@app.get("/api/reports/my-reports")
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    reports = list(db.reports.find(
        {"user_id": current_user["user_id"], "is_active": True}
    ).sort("created_at", -1))
    
    # Convert ObjectId to string and format dates
    for report in reports:
        report["_id"] = str(report["_id"])
        report["created_at"] = report["created_at"].isoformat()
        report["updated_at"] = report["updated_at"].isoformat()
    
    return reports

@app.get("/api/reports/all")
async def get_all_reports(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    reports = list(db.reports.find({"is_active": True}).sort("created_at", -1))
    
    # Convert ObjectId to string and format dates
    for report in reports:
        report["_id"] = str(report["_id"])
        report["created_at"] = report["created_at"].isoformat()
        report["updated_at"] = report["updated_at"].isoformat()
    
    return reports

@app.get("/api/phone-numbers/my-numbers")
async def get_my_phone_numbers(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["business", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {"is_active": True}
    if current_user["role"] == "business":
        query["registered_by"] = current_user["user_id"]
    
    phone_numbers = list(db.phone_numbers.find(query).sort("created_at", -1))
    
    # Convert ObjectId to string and format dates
    for phone in phone_numbers:
        phone["_id"] = str(phone["_id"])
        phone["created_at"] = phone["created_at"].isoformat()
        phone["updated_at"] = phone["updated_at"].isoformat()
    
    return phone_numbers

@app.get("/api/users/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    user = db.users.find_one({"user_id": current_user["user_id"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "company_name": user.get("company_name"),
        "points": user.get("points", 0),
        "created_at": user["created_at"].isoformat(),
        "email_verified": user.get("email_verified", False)
    }

@app.get("/api/stats/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    stats = {}
    
    if current_user["role"] == "citizen":
        user_reports = list(db.reports.find({"user_id": current_user["user_id"], "is_active": True}))
        stats = {
            "total_reports": len(user_reports),
            "points_earned": db.users.find_one({"user_id": current_user["user_id"]})["points"],
            "high_risk_reports": len([r for r in user_reports if r.get("ai_analysis", {}).get("risk_level") == "HIGH"]),
            "medium_risk_reports": len([r for r in user_reports if r.get("ai_analysis", {}).get("risk_level") == "MEDIUM"]),
            "low_risk_reports": len([r for r in user_reports if r.get("ai_analysis", {}).get("risk_level") == "LOW"])
        }
    elif current_user["role"] == "business":
        user_phones = list(db.phone_numbers.find({"registered_by": current_user["user_id"], "is_active": True}))
        total_verifications = sum(phone.get("verification_count", 0) for phone in user_phones)
        stats = {
            "registered_numbers": len(user_phones),
            "verification_checks": total_verifications,
            "reports_mentioning": db.reports.count_documents({
                "phone_number": {"$in": [phone["phone_number"] for phone in user_phones]},
                "is_active": True
            }),
            "active_numbers": len([p for p in user_phones if p.get("is_active", True)])
        }
    elif current_user["role"] == "admin":
        all_reports = list(db.reports.find({"is_active": True}))
        stats = {
            "total_users": db.users.count_documents({"is_active": True}),
            "total_reports": len(all_reports),
            "total_phone_numbers": db.phone_numbers.count_documents({"is_active": True}),
            "high_risk_reports": len([r for r in all_reports if r.get("ai_analysis", {}).get("risk_level") == "HIGH"]),
            "pending_reports": len([r for r in all_reports if r.get("status") == "pending"]),
            "verified_businesses": db.users.count_documents({"role": "business", "is_active": True})
        }
    
    return stats

# Enhanced endpoint for detailed analytics
@app.get("/api/analytics/summary")
async def get_analytics_summary(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get recent activity
    recent_reports = list(db.reports.find({"is_active": True}).sort("created_at", -1).limit(10))
    recent_registrations = list(db.phone_numbers.find({"is_active": True}).sort("created_at", -1).limit(10))
    
    # Calculate trends
    today = datetime.utcnow()
    yesterday = today - timedelta(days=1)
    
    today_reports = db.reports.count_documents({
        "created_at": {"$gte": yesterday},
        "is_active": True
    })
    
    today_verifications = db.phone_numbers.count_documents({
        "created_at": {"$gte": yesterday},
        "is_active": True
    })
    
    return {
        "recent_reports": [
            {
                "report_id": r["report_id"],
                "type": r["report_type"],
                "risk_level": r.get("ai_analysis", {}).get("risk_level", "UNKNOWN"),
                "created_at": r["created_at"].isoformat()
            }
            for r in recent_reports
        ],
        "recent_registrations": [
            {
                "phone_number": r["phone_number"],
                "company_name": r["company_name"],
                "created_at": r["created_at"].isoformat()
            }
            for r in recent_registrations
        ],
        "daily_stats": {
            "reports_today": today_reports,
            "verifications_today": today_verifications
        }
    }

@app.get("/api/verification-logs")
async def get_verification_logs(current_user: dict = Depends(get_current_user), limit: int = 50):
    """Get recent phone number verification attempts (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    logs = list(db.verification_logs.find().sort("timestamp", -1).limit(limit))
    
    # Convert ObjectId to string and format dates
    for log in logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = log["timestamp"].isoformat()
    
    return {
        "verification_logs": logs,
        "total_count": db.verification_logs.count_documents({})
    }

@app.get("/api/sample-numbers")
async def get_sample_numbers():
    """Get list of sample verified numbers for testing (public endpoint)"""
    sample_numbers = [
        {"number": "+31612345678", "company": "Acme Bank"},
        {"number": "+61298765432", "company": "Gov Australia"}, 
        {"number": "+14155552020", "company": "TechCorp Support"},
        {"number": "+442071234567", "company": "British Telecom"}
    ]
    return {
        "sample_numbers": sample_numbers,
        "message": "Use these numbers to test the verification system"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
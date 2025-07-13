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

# Initialize FastAPI app
app = FastAPI(title="Check Vero API", description="Phone verification and fraud reporting platform")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(mongo_url)
db = client.checkvero

# Security setup
SECRET_KEY = "your-secret-key-here"
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

# Pydantic models
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
    screenshot: Optional[str] = None

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

# Mock AI Analysis Function
def mock_ai_analysis(report_data):
    """Mock OpenAI GPT-4 analysis for demonstration"""
    suspicious_keywords = ["urgent", "click now", "verify account", "suspended", "prize", "winner", "lottery", "inheritance"]
    
    description = report_data.get("description", "").lower()
    phone_number = report_data.get("phone_number", "")
    email_address = report_data.get("email_address", "")
    
    # Basic suspicious patterns
    suspicion_score = 0
    reasons = []
    
    for keyword in suspicious_keywords:
        if keyword in description:
            suspicion_score += 1
            reasons.append(f"Contains suspicious keyword: '{keyword}'")
    
    # Phone number patterns
    if phone_number and (phone_number.startswith("+1-800") or phone_number.startswith("unknown")):
        suspicion_score += 1
        reasons.append("Suspicious phone number pattern")
    
    # Email patterns
    if email_address and any(domain in email_address for domain in ["tempmail", "10minutemail", "guerrillamail"]):
        suspicion_score += 1
        reasons.append("Suspicious email domain")
    
    # Generate response based on score
    if suspicion_score >= 2:
        risk_level = "HIGH"
        recommendation = "⚠️ SUSPICIOUS - Likely phishing attempt. Do not respond or provide personal information."
        points_awarded = 25
    elif suspicion_score == 1:
        risk_level = "MEDIUM"
        recommendation = "⚡ MODERATE RISK - Exercise caution. Verify through official channels."
        points_awarded = 15
    else:
        risk_level = "LOW"
        recommendation = "✅ APPEARS LEGITIMATE - No obvious red flags detected."
        points_awarded = 5
    
    return {
        "risk_level": risk_level,
        "recommendation": recommendation,
        "confidence_score": min(85 + suspicion_score * 10, 95),
        "reasons": reasons,
        "points_awarded": points_awarded
    }

# Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Check Vero API"}

@app.post("/api/register", response_model=Token)
async def register_user(user: UserCreate):
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
        "is_active": True
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
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    db.phone_numbers.insert_one(phone_doc)
    
    return {"message": "Phone number registered successfully", "phone_id": phone_doc["phone_id"]}

@app.post("/api/verify-phone")
async def verify_phone_number(verification: VerificationCheck):
    phone_record = db.phone_numbers.find_one({"phone_number": verification.phone_number})
    
    if phone_record:
        return {
            "is_verified": True,
            "company_name": phone_record["company_name"],
            "description": phone_record.get("description", ""),
            "verified_since": phone_record["created_at"]
        }
    else:
        return {
            "is_verified": False,
            "message": "Phone number not found in verification database"
        }

@app.post("/api/reports/submit")
async def submit_report(report: ReportCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can submit reports")
    
    report_id = str(uuid.uuid4())
    
    # Mock AI analysis
    ai_analysis = mock_ai_analysis({
        "description": report.description,
        "phone_number": report.phone_number,
        "email_address": report.email_address
    })
    
    report_doc = {
        "report_id": report_id,
        "user_id": current_user["user_id"],
        "report_type": report.report_type,
        "phone_number": report.phone_number,
        "email_address": report.email_address,
        "description": report.description,
        "screenshot": report.screenshot,
        "status": ReportStatus.ANALYZED,
        "ai_analysis": ai_analysis,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db.reports.insert_one(report_doc)
    
    # Award points to user
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"points": ai_analysis["points_awarded"]}}
    )
    
    return {
        "report_id": report_id,
        "message": "Report submitted successfully",
        "ai_analysis": ai_analysis
    }

@app.get("/api/reports/my-reports")
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    reports = list(db.reports.find({"user_id": current_user["user_id"]}).sort("created_at", -1))
    
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
    
    reports = list(db.reports.find().sort("created_at", -1))
    
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
    
    query = {"registered_by": current_user["user_id"]} if current_user["role"] == "business" else {}
    phone_numbers = list(db.phone_numbers.find(query).sort("created_at", -1))
    
    # Convert ObjectId to string and format dates
    for phone in phone_numbers:
        phone["_id"] = str(phone["_id"])
        phone["created_at"] = phone["created_at"].isoformat()
    
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
        "created_at": user["created_at"].isoformat()
    }

@app.get("/api/stats/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    stats = {}
    
    if current_user["role"] == "citizen":
        stats = {
            "total_reports": db.reports.count_documents({"user_id": current_user["user_id"]}),
            "points_earned": db.users.find_one({"user_id": current_user["user_id"]})["points"],
            "high_risk_reports": db.reports.count_documents({
                "user_id": current_user["user_id"],
                "ai_analysis.risk_level": "HIGH"
            })
        }
    elif current_user["role"] == "business":
        stats = {
            "registered_numbers": db.phone_numbers.count_documents({"registered_by": current_user["user_id"]}),
            "verification_checks": db.phone_numbers.count_documents({"registered_by": current_user["user_id"]}),
            "reports_mentioning": db.reports.count_documents({
                "phone_number": {"$in": [phone["phone_number"] for phone in db.phone_numbers.find({"registered_by": current_user["user_id"]})]}
            })
        }
    elif current_user["role"] == "admin":
        stats = {
            "total_users": db.users.count_documents({}),
            "total_reports": db.reports.count_documents({}),
            "total_phone_numbers": db.phone_numbers.count_documents({}),
            "high_risk_reports": db.reports.count_documents({"ai_analysis.risk_level": "HIGH"}),
            "pending_reports": db.reports.count_documents({"status": "pending"})
        }
    
    return stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
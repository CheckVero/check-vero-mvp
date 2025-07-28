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
import base64
from enum import Enum
import re

# Initialize FastAPI app
app = FastAPI(
    title="Check Vero API", 
    description="Persistent fraud verification platform API",
    version="1.0.0"
)

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://checkvero.com",
        "https://www.checkvero.com", 
        "https://checkvero.vercel.app",
        "http://localhost:3000",
        "*"  # Allow all for maximum compatibility
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Security setup
SECRET_KEY = "checkvero-persistent-api-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# In-memory database for persistent demo (in production, use MongoDB Atlas)
USERS_DB = {}
PHONE_NUMBERS_DB = {}
REPORTS_DB = {}
VERIFICATION_LOGS_DB = {}

# Initialize sample data
def initialize_sample_data():
    """Initialize sample phone numbers for demo"""
    sample_numbers = {
        "+31612345678": {
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
        "+61298765432": {
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
        "+14155552020": {
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
        "+442071234567": {
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
    }
    
    PHONE_NUMBERS_DB.update(sample_numbers)
    print(f"✅ Sample data initialized: {len(sample_numbers)} phone numbers")

# Initialize on startup
initialize_sample_data()

# Enums
class UserRole(str, Enum):
    CITIZEN = "citizen"
    BUSINESS = "business"
    ADMIN = "admin"

class ReportType(str, Enum):
    CALL = "call"
    EMAIL = "email"
    AI_CHAT = "ai_chat"

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
    """Mock AI analysis for demonstration"""
    suspicious_keywords = ["urgent", "click now", "verify account", "suspended", "prize", "winner", "lottery"]
    
    description = report_data.get("description", "").lower()
    
    risk_score = 0
    reasons = []
    
    for keyword in suspicious_keywords:
        if keyword in description:
            risk_score += 1
            reasons.append(f"Contains suspicious keyword: '{keyword}'")
    
    if risk_score >= 2:
        risk_level = "HIGH"
        recommendation = "🚨 HIGH RISK - This appears to be a scam. Do not provide any personal information."
        points_awarded = 30
        confidence_score = 90
    elif risk_score == 1:
        risk_level = "MEDIUM"
        recommendation = "⚠️ MEDIUM RISK - Exercise caution. Verify through official channels."
        points_awarded = 20
        confidence_score = 75
    else:
        risk_level = "LOW"
        recommendation = "✅ LOW RISK - No obvious red flags detected."
        points_awarded = 10
        confidence_score = 60
    
    return {
        "risk_level": risk_level,
        "recommendation": recommendation,
        "confidence_score": confidence_score,
        "reasons": reasons,
        "points_awarded": points_awarded
    }

# Routes
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight requests"""
    return {"message": "OK"}

@app.get("/")
async def root():
    return {
        "service": "Check Vero API",
        "status": "online",
        "version": "1.0.0",
        "description": "Persistent backend API for phone verification and fraud detection"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "Check Vero API", 
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "persistent": True,
        "uptime": "24/7"
    }

@app.post("/api/register", response_model=Token)
async def register_user(user: UserCreate):
    # Check if user already exists
    if user.username in USERS_DB:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    USERS_DB[user.username] = {
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
    db_user = USERS_DB.get(user.username)
    
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

@app.post("/api/verify-phone")
async def verify_phone_number(verification: VerificationCheck):
    """Verify if a phone number is registered"""
    
    phone_number = verification.phone_number.strip()
    phone_record = PHONE_NUMBERS_DB.get(phone_number)
    
    if phone_record:
        # Increment verification count
        phone_record["verification_count"] = phone_record.get("verification_count", 0) + 1
        phone_record["last_verified"] = datetime.utcnow()
        
        # Log verification attempt
        log_id = str(uuid.uuid4())
        VERIFICATION_LOGS_DB[log_id] = {
            "log_id": log_id,
            "phone_number": phone_number,
            "result": "verified",
            "timestamp": datetime.utcnow()
        }
        
        return {
            "is_verified": True,
            "company_name": phone_record["company_name"],
            "description": phone_record.get("description", ""),
            "verified_since": phone_record["verification_date"].isoformat(),
            "verification_count": phone_record["verification_count"],
            "message": f"✅ This number is verified and belongs to {phone_record['company_name']}"
        }
    else:
        # Log failed verification attempt
        log_id = str(uuid.uuid4())
        VERIFICATION_LOGS_DB[log_id] = {
            "log_id": log_id,
            "phone_number": phone_number,
            "result": "not_verified",
            "timestamp": datetime.utcnow()
        }
        
        return {
            "is_verified": False,
            "message": "❌ This number is not registered. Proceed with caution.",
            "warning": "Unregistered numbers may be legitimate businesses not yet in our database, or potential scammers."
        }

@app.post("/api/phone-numbers/register")
async def register_phone_number(phone_data: PhoneNumberRegister, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["business", "admin"]:
        raise HTTPException(status_code=403, detail="Only businesses and admins can register phone numbers")
    
    # Check if phone number already exists
    if phone_data.phone_number in PHONE_NUMBERS_DB:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    phone_id = str(uuid.uuid4())
    PHONE_NUMBERS_DB[phone_data.phone_number] = {
        "phone_id": phone_id,
        "phone_number": phone_data.phone_number,
        "company_name": phone_data.company_name,
        "description": phone_data.description,
        "registered_by": current_user["user_id"],
        "verified": True,
        "verification_date": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "is_active": True,
        "verification_count": 0
    }
    
    return {"message": "Phone number registered successfully", "phone_id": phone_id}

@app.post("/api/reports/submit")
async def submit_report(report: ReportCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can submit reports")
    
    report_id = str(uuid.uuid4())
    
    # AI analysis
    ai_analysis = mock_ai_analysis({
        "description": report.description,
        "phone_number": report.phone_number,
        "email_address": report.email_address
    })
    
    REPORTS_DB[report_id] = {
        "report_id": report_id,
        "user_id": current_user["user_id"],
        "report_type": report.report_type,
        "phone_number": report.phone_number,
        "email_address": report.email_address,
        "description": report.description,
        "ai_analysis": ai_analysis,
        "created_at": datetime.utcnow()
    }
    
    # Award points to user
    if current_user["username"] in USERS_DB:
        USERS_DB[current_user["username"]]["points"] += ai_analysis["points_awarded"]
    
    return {
        "report_id": report_id,
        "message": "Report submitted and analyzed successfully",
        "ai_analysis": ai_analysis
    }

@app.get("/api/users/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    user = USERS_DB.get(current_user["username"])
    
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
    stats = {
        "total_users": len(USERS_DB),
        "total_reports": len(REPORTS_DB),
        "total_phone_numbers": len(PHONE_NUMBERS_DB),
        "total_verifications": len(VERIFICATION_LOGS_DB)
    }
    
    if current_user["role"] == "citizen":
        user_reports = [r for r in REPORTS_DB.values() if r["user_id"] == current_user["user_id"]]
        stats.update({
            "total_reports": len(user_reports),
            "points_earned": USERS_DB.get(current_user["username"], {}).get("points", 0),
            "high_risk_reports": len([r for r in user_reports if r.get("ai_analysis", {}).get("risk_level") == "HIGH"])
        })
    
    return stats

# For Vercel deployment
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
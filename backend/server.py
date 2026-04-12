from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional
import re
import uuid
from datetime import datetime, date
from enum import Enum

# Reusable date format validator
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME_PATTERN = re.compile(r"^\d{2}:\d{2}$")

def validate_date_format(v: str) -> str:
    if not DATE_PATTERN.match(v):
        raise ValueError("Formato de fecha debe ser YYYY-MM-DD")
    # Verify it's a real date
    try:
        datetime.strptime(v, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Fecha inválida")
    return v

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# User Progress Model
class UserProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    current_week: int = 1
    current_chapter: int = 1
    chapters_completed: List[int] = []
    program_start_date: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    initial_distress_score: Optional[int] = None
    commitment_signed: bool = False
    commitment_date: Optional[datetime] = None

class UserProgressCreate(BaseModel):
    device_id: str

class UserProgressUpdate(BaseModel):
    current_week: Optional[int] = Field(None, ge=1, le=12)
    current_chapter: Optional[int] = Field(None, ge=1, le=12)
    chapters_completed: Optional[List[int]] = None
    initial_distress_score: Optional[int] = Field(None, ge=0, le=10)
    commitment_signed: Optional[bool] = None

# Daily Log Model
class DailyLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    date: str  # YYYY-MM-DD format
    distress_level: int = Field(ge=0, le=10)
    reflection: Optional[str] = Field(None, max_length=2000)
    exercises_completed: List[str] = []
    sleep_quality: Optional[int] = Field(None, ge=0, le=10)
    notes: Optional[str] = Field(None, max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DailyLogCreate(BaseModel):
    device_id: str
    date: str
    distress_level: int = Field(ge=0, le=10)
    reflection: Optional[str] = Field(None, max_length=2000)
    exercises_completed: List[str] = []
    sleep_quality: Optional[int] = Field(None, ge=0, le=10)
    notes: Optional[str] = Field(None, max_length=2000)

    @field_validator("date")
    @classmethod
    def check_date(cls, v: str) -> str:
        return validate_date_format(v)

class ABCRecordUpdate(BaseModel):
    device_id: str
    alternative_label: str = Field(max_length=1000)
    new_intensity: int = Field(ge=0, le=10)

# ABC Record Model (for cognitive restructuring)
class ABCRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    date: str
    # A - Activator (Situation)
    situation: str = Field(max_length=2000)
    time: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=200)
    # B - Belief (Alarm Label)
    alarm_label: str = Field(max_length=1000)
    # C - Consequence (Emotion/Action)
    emotion: str = Field(max_length=200)
    intensity: int = Field(ge=0, le=10)
    action_taken: Optional[str] = Field(None, max_length=1000)
    # Alternative B (from Chapter 8)
    alternative_label: Optional[str] = Field(None, max_length=1000)
    new_intensity: Optional[int] = Field(None, ge=0, le=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ABCRecordCreate(BaseModel):
    device_id: str
    date: str
    situation: str = Field(max_length=2000)
    time: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=200)
    alarm_label: str = Field(max_length=1000)
    emotion: str = Field(max_length=200)
    intensity: int = Field(ge=0, le=10)
    action_taken: Optional[str] = Field(None, max_length=1000)
    alternative_label: Optional[str] = Field(None, max_length=1000)
    new_intensity: Optional[int] = Field(None, ge=0, le=10)

    @field_validator("date")
    @classmethod
    def check_date(cls, v: str) -> str:
        return validate_date_format(v)

class ABCRecordUpdate(BaseModel):
    device_id: str
    alternative_label: str = Field(max_length=1000)
    new_intensity: int = Field(ge=0, le=10)
# Exposure Ladder Model
class ExposureStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    step_number: int = Field(ge=1, le=5)
    situation: str = Field(max_length=1000)
    anticipated_anxiety: int = Field(ge=0, le=10)
    attempts: List[dict] = []
    is_dominated: bool = False

class ExposureLadder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    steps: List[ExposureStep] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ExposureLadderCreate(BaseModel):
    device_id: str
    steps: List[dict]

class ExposureAttempt(BaseModel):
    device_id: str
    step_number: int = Field(ge=1, le=5)
    date: str
    initial_anxiety: int = Field(ge=0, le=10)
    final_anxiety: int = Field(ge=0, le=10)
    used_label: bool

    @field_validator("date")
    @classmethod
    def check_date(cls, v: str) -> str:
        return validate_date_format(v)

# Emergency Kit Model
EmergencyCategory = Literal["alarm_signal", "containment_phrase", "rescue_action", "alternative_label", "custom"]

class EmergencyKitItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    category: EmergencyCategory
    title: str = Field(max_length=200)
    content: str = Field(max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DeleteRequest(BaseModel):
    device_id: str

class EmergencyKitItemCreate(BaseModel):
    device_id: str
    category: EmergencyCategory
    title: str = Field(max_length=200)
    content: str = Field(max_length=2000)

# Aggravating Factors Log
class FactorLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    date: str
    tinnitus_level: int = Field(ge=0, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    caffeine_cups: Optional[int] = Field(None, ge=0, le=50)
    alcohol_drinks: Optional[int] = Field(None, ge=0, le=50)
    stress_level: Optional[int] = Field(None, ge=0, le=10)
    exercise_minutes: Optional[int] = Field(None, ge=0, le=1440)
    notes: Optional[str] = Field(None, max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FactorLogCreate(BaseModel):
    device_id: str
    date: str
    tinnitus_level: int = Field(ge=0, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    caffeine_cups: Optional[int] = Field(None, ge=0, le=50)
    alcohol_drinks: Optional[int] = Field(None, ge=0, le=50)
    stress_level: Optional[int] = Field(None, ge=0, le=10)
    exercise_minutes: Optional[int] = Field(None, ge=0, le=1440)
    notes: Optional[str] = Field(None, max_length=2000)

    @field_validator("date")
    @classmethod
    def check_date(cls, v: str) -> str:
        return validate_date_format(v)

# Mindfulness Session Log
class MindfulnessSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    date: str
    time_of_day: Literal["morning", "night"]
    completed: bool
    difficulty_level: int = Field(ge=1, le=10)
    observation: Optional[str] = Field(None, max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MindfulnessSessionCreate(BaseModel):
    device_id: str
    date: str
    time_of_day: Literal["morning", "night"]
    completed: bool
    difficulty_level: int = Field(ge=1, le=10)
    observation: Optional[str] = Field(None, max_length=2000)

    @field_validator("date")
    @classmethod
    def check_date(cls, v: str) -> str:
        return validate_date_format(v)

# Distress Questionnaire Response
class QuestionnaireResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    date: str
    week_number: int = Field(ge=1, le=12)
    # Questions A-G (0-4 scale each)
    sleep_difficulty: int = Field(ge=0, le=4)
    concentration_interference: int = Field(ge=0, le=4)
    frustration_anger: int = Field(ge=0, le=4)
    social_impact: int = Field(ge=0, le=4)
    future_worry: int = Field(ge=0, le=4)
    relaxation_difficulty: int = Field(ge=0, le=4)
    overwhelm_despair: int = Field(ge=0, le=4)
    total_score: int = Field(ge=0, le=28)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuestionnaireResponseCreate(BaseModel):
    device_id: str
    date: str
    week_number: int = Field(ge=1, le=12)
    sleep_difficulty: int = Field(ge=0, le=4)
    concentration_interference: int = Field(ge=0, le=4)
    frustration_anger: int = Field(ge=0, le=4)
    social_impact: int = Field(ge=0, le=4)
    future_worry: int = Field(ge=0, le=4)
    relaxation_difficulty: int = Field(ge=0, le=4)
    overwhelm_despair: int = Field(ge=0, le=4)

    @field_validator("date")
    @classmethod
    def check_date(cls, v: str) -> str:
        return validate_date_format(v)

# Settings Model
class UserSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    reminder_enabled: bool = True
    reminder_time: str = "09:00"  # HH:MM format
    sound_masking_volume: int = Field(default=50, ge=0, le=100)
    preferred_sounds: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserSettingsUpdate(BaseModel):
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[str] = None
    sound_masking_volume: Optional[int] = Field(None, ge=0, le=100)
    preferred_sounds: Optional[List[str]] = None

    @field_validator("reminder_time")
    @classmethod
    def check_reminder_time(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not TIME_PATTERN.match(v):
            raise ValueError("Formato de hora debe ser HH:MM")
        return v

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Tinnitus Habituation App API", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# User Progress Routes
@api_router.post("/progress", response_model=UserProgress)
async def create_or_get_progress(input: UserProgressCreate):
    existing = await db.user_progress.find_one({"device_id": input.device_id})
    if existing:
        return UserProgress(**existing)
    progress = UserProgress(device_id=input.device_id)
    await db.user_progress.insert_one(progress.dict())
    return progress

@api_router.get("/progress/{device_id}", response_model=UserProgress)
async def get_progress(device_id: str):
    progress = await db.user_progress.find_one({"device_id": device_id})
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    return UserProgress(**progress)

@api_router.put("/progress/{device_id}", response_model=UserProgress)
async def update_progress(device_id: str, update: UserProgressUpdate):
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    update_dict["last_active"] = datetime.utcnow()
    
    if update.commitment_signed:
        update_dict["commitment_date"] = datetime.utcnow()
    
    result = await db.user_progress.find_one_and_update(
        {"device_id": device_id},
        {"$set": update_dict},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Progress not found")
    return UserProgress(**result)

@api_router.post("/progress/{device_id}/complete-chapter/{chapter_id}")
async def complete_chapter(device_id: str, chapter_id: int):
    result = await db.user_progress.find_one_and_update(
        {"device_id": device_id},
        {
            "$addToSet": {"chapters_completed": chapter_id},
            "$set": {"last_active": datetime.utcnow()}
        },
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Progress not found")
    return UserProgress(**result)

# Daily Log Routes
@api_router.post("/daily-logs", response_model=DailyLog)
async def create_daily_log(input: DailyLogCreate):
    # Check if log exists for this date
    existing = await db.daily_logs.find_one({
        "device_id": input.device_id,
        "date": input.date
    })
    if existing:
        # Update existing
        update_dict = input.dict()
        del update_dict["device_id"]
        del update_dict["date"]
        result = await db.daily_logs.find_one_and_update(
            {"device_id": input.device_id, "date": input.date},
            {"$set": update_dict},
            return_document=True
        )
        return DailyLog(**result)
    
    log = DailyLog(**input.dict())
    await db.daily_logs.insert_one(log.dict())
    return log

@api_router.get("/daily-logs/{device_id}", response_model=List[DailyLog])
async def get_daily_logs(device_id: str, limit: int = 30):
    logs = await db.daily_logs.find(
        {"device_id": device_id}
    ).sort("date", -1).limit(limit).to_list(limit)
    return [DailyLog(**log) for log in logs]

@api_router.get("/daily-logs/{device_id}/{date}", response_model=DailyLog)
async def get_daily_log_by_date(device_id: str, date: str):
    log = await db.daily_logs.find_one({"device_id": device_id, "date": date})
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return DailyLog(**log)

# ABC Record Routes
@api_router.post("/abc-records", response_model=ABCRecord)
async def create_abc_record(input: ABCRecordCreate):
    record = ABCRecord(**input.dict())
    await db.abc_records.insert_one(record.dict())
    return record

@api_router.get("/abc-records/{device_id}", response_model=List[ABCRecord])
async def get_abc_records(device_id: str, limit: int = 50):
    records = await db.abc_records.find(
        {"device_id": device_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return [ABCRecord(**r) for r in records]

@api_router.put("/abc-records/{record_id}", response_model=ABCRecord)
async def update_abc_record(record_id: str, update: ABCRecordUpdate):
    # Security: Verify both record_id AND device_id to prevent IDOR
    # and use request body to avoid sensitive data in logs
    result = await db.abc_records.find_one_and_update(
        {"id": record_id, "device_id": update.device_id},
        {"$set": {
            "alternative_label": update.alternative_label,
            "new_intensity": update.new_intensity
        }},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Record not found")
    return ABCRecord(**result)

# Exposure Ladder Routes
@api_router.post("/exposure-ladder", response_model=ExposureLadder)
async def create_exposure_ladder(input: ExposureLadderCreate):
    existing = await db.exposure_ladders.find_one({"device_id": input.device_id})
    if existing:
        # Update existing
        steps = [ExposureStep(**s) for s in input.steps]
        result = await db.exposure_ladders.find_one_and_update(
            {"device_id": input.device_id},
            {"$set": {"steps": [s.dict() for s in steps], "updated_at": datetime.utcnow()}},
            return_document=True
        )
        return ExposureLadder(**result)
    
    steps = [ExposureStep(**s) for s in input.steps]
    ladder = ExposureLadder(device_id=input.device_id, steps=[s.dict() for s in steps])
    await db.exposure_ladders.insert_one(ladder.dict())
    return ladder

@api_router.get("/exposure-ladder/{device_id}", response_model=ExposureLadder)
async def get_exposure_ladder(device_id: str):
    ladder = await db.exposure_ladders.find_one({"device_id": device_id})
    if not ladder:
        raise HTTPException(status_code=404, detail="Ladder not found")
    return ExposureLadder(**ladder)

@api_router.post("/exposure-ladder/{device_id}/attempt")
async def add_exposure_attempt(device_id: str, attempt: ExposureAttempt):
    ladder = await db.exposure_ladders.find_one({"device_id": device_id})
    if not ladder:
        raise HTTPException(status_code=404, detail="Ladder not found")
    
    steps = ladder.get("steps", [])
    for step in steps:
        if step["step_number"] == attempt.step_number:
            dominated = attempt.final_anxiety <= 3
            step["attempts"].append({
                "date": attempt.date,
                "initial_anxiety": attempt.initial_anxiety,
                "final_anxiety": attempt.final_anxiety,
                "used_label": attempt.used_label,
                "dominated": dominated
            })
            # Check if step is dominated (3 successful attempts)
            success_count = sum(1 for a in step["attempts"] if a.get("dominated", False))
            if success_count >= 3:
                step["is_dominated"] = True
            break
    
    result = await db.exposure_ladders.find_one_and_update(
        {"device_id": device_id},
        {"$set": {"steps": steps, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    return ExposureLadder(**result)

# Emergency Kit Routes
@api_router.post("/emergency-kit", response_model=EmergencyKitItem)
async def create_emergency_kit_item(input: EmergencyKitItemCreate):
    item = EmergencyKitItem(**input.dict())
    await db.emergency_kit.insert_one(item.dict())
    return item

@api_router.get("/emergency-kit/{device_id}", response_model=List[EmergencyKitItem])
async def get_emergency_kit(device_id: str):
    items = await db.emergency_kit.find({"device_id": device_id}).to_list(100)
    return [EmergencyKitItem(**item) for item in items]

@api_router.delete("/emergency-kit/{item_id}")
async def delete_emergency_kit_item(item_id: str, device_id: str):
    # Security: Verify both item_id AND device_id to prevent IDOR
    result = await db.emergency_kit.delete_one({"id": item_id, "device_id": device_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "deleted"}

# Factor Log Routes
@api_router.post("/factor-logs", response_model=FactorLog)
async def create_factor_log(input: FactorLogCreate):
    existing = await db.factor_logs.find_one({
        "device_id": input.device_id,
        "date": input.date
    })
    if existing:
        update_dict = input.dict()
        del update_dict["device_id"]
        del update_dict["date"]
        result = await db.factor_logs.find_one_and_update(
            {"device_id": input.device_id, "date": input.date},
            {"$set": update_dict},
            return_document=True
        )
        return FactorLog(**result)
    
    log = FactorLog(**input.dict())
    await db.factor_logs.insert_one(log.dict())
    return log

@api_router.get("/factor-logs/{device_id}", response_model=List[FactorLog])
async def get_factor_logs(device_id: str, limit: int = 14):
    logs = await db.factor_logs.find(
        {"device_id": device_id}
    ).sort("date", -1).limit(limit).to_list(limit)
    return [FactorLog(**log) for log in logs]

# Mindfulness Session Routes
@api_router.post("/mindfulness-sessions", response_model=MindfulnessSession)
async def create_mindfulness_session(input: MindfulnessSessionCreate):
    session = MindfulnessSession(**input.dict())
    await db.mindfulness_sessions.insert_one(session.dict())
    return session

@api_router.get("/mindfulness-sessions/{device_id}", response_model=List[MindfulnessSession])
async def get_mindfulness_sessions(device_id: str, limit: int = 14):
    sessions = await db.mindfulness_sessions.find(
        {"device_id": device_id}
    ).sort("date", -1).limit(limit).to_list(limit)
    return [MindfulnessSession(**s) for s in sessions]

# Questionnaire Routes
@api_router.post("/questionnaire", response_model=QuestionnaireResponse)
async def create_questionnaire_response(input: QuestionnaireResponseCreate):
    total_score = (
        input.sleep_difficulty +
        input.concentration_interference +
        input.frustration_anger +
        input.social_impact +
        input.future_worry +
        input.relaxation_difficulty +
        input.overwhelm_despair
    )
    response = QuestionnaireResponse(
        **input.dict(),
        total_score=total_score
    )
    await db.questionnaire_responses.insert_one(response.dict())
    return response

@api_router.get("/questionnaire/{device_id}", response_model=List[QuestionnaireResponse])
async def get_questionnaire_responses(device_id: str):
    responses = await db.questionnaire_responses.find(
        {"device_id": device_id}
    ).sort("week_number", 1).to_list(20)
    return [QuestionnaireResponse(**r) for r in responses]

# Settings Routes
@api_router.get("/settings/{device_id}", response_model=UserSettings)
async def get_settings(device_id: str):
    settings = await db.user_settings.find_one({"device_id": device_id})
    if not settings:
        # Create default settings
        new_settings = UserSettings(device_id=device_id)
        await db.user_settings.insert_one(new_settings.dict())
        return new_settings
    return UserSettings(**settings)

@api_router.put("/settings/{device_id}", response_model=UserSettings)
async def update_settings(device_id: str, update: UserSettingsUpdate):
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.user_settings.find_one_and_update(
        {"device_id": device_id},
        {"$set": update_dict},
        return_document=True,
        upsert=True
    )
    return UserSettings(**result)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

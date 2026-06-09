import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Setting
from pydantic import BaseModel

router = APIRouter()

class SettingCreate(BaseModel):
    key: str
    value: str

@router.get("/")
def list_settings(db: Session = Depends(get_db)):
    return {s.key: s.value for s in db.query(Setting).all()}

@router.post("/")
def update_setting(s: SettingCreate, db: Session = Depends(get_db)):
    existing = db.query(Setting).filter(Setting.key == s.key).first()
    if existing:
        existing.value = s.value
    else:
        db.add(Setting(key=s.key, value=s.value))
    db.commit()
    return {"success": True}

@router.post("/groq-key")
def set_groq_key(data: SettingCreate, db: Session = Depends(get_db)):
    existing = db.query(Setting).filter(Setting.key == "groq_api_key").first()
    if existing:
        existing.value = data.value
    else:
        db.add(Setting(key="groq_api_key", value=data.value))
    db.commit()
    os.environ["GROQ_API_KEY"] = data.value
    return {"success": True}

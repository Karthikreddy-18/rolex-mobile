from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Reminder
from pydantic import BaseModel

router = APIRouter()

class ReminderCreate(BaseModel):
    text: str
    time: str

@router.get("/")
def list_reminders(db: Session = Depends(get_db)):
    return db.query(Reminder).all()

@router.post("/")
def create_reminder(r: ReminderCreate, db: Session = Depends(get_db)):
    reminder = Reminder(text=r.text, time=r.time)
    db.add(reminder)
    db.commit()
    return {"success": True, "id": reminder.id}

@router.delete("/{rid}")
def delete_reminder(rid: int, db: Session = Depends(get_db)):
    r = db.query(Reminder).filter(Reminder.id == rid).first()
    if not r:
        raise HTTPException(404, "Reminder not found")
    db.delete(r)
    db.commit()
    return {"success": True}

@router.patch("/{rid}/toggle")
def toggle_reminder(rid: int, db: Session = Depends(get_db)):
    r = db.query(Reminder).filter(Reminder.id == rid).first()
    if not r:
        raise HTTPException(404, "Reminder not found")
    r.active = not r.active
    db.commit()
    return {"success": True, "active": r.active}

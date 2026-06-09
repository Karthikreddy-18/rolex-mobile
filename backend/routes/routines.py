from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Routine
from pydantic import BaseModel

router = APIRouter()

class RoutineCreate(BaseModel):
    name: str
    steps: str

@router.get("/")
def list_routines(db: Session = Depends(get_db)):
    return db.query(Routine).all()

@router.post("/")
def create_routine(r: RoutineCreate, db: Session = Depends(get_db)):
    routine = Routine(name=r.name, steps=r.steps)
    db.add(routine)
    db.commit()
    return {"success": True, "id": routine.id}

@router.delete("/{rid}")
def delete_routine(rid: int, db: Session = Depends(get_db)):
    r = db.query(Routine).filter(Routine.id == rid).first()
    if not r:
        raise HTTPException(404, "Routine not found")
    db.delete(r)
    db.commit()
    return {"success": True}

@router.patch("/{rid}/toggle")
def toggle_routine(rid: int, db: Session = Depends(get_db)):
    r = db.query(Routine).filter(Routine.id == rid).first()
    if not r:
        raise HTTPException(404, "Routine not found")
    r.enabled = not r.enabled
    db.commit()
    return {"success": True, "enabled": r.enabled}

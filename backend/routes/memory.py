from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Memory
from pydantic import BaseModel

router = APIRouter()

class MemoryCreate(BaseModel):
    key: str
    value: str
    category: str = "general"

@router.get("/")
def list_memories(db: Session = Depends(get_db)):
    return db.query(Memory).all()

@router.post("/")
def create_memory(m: MemoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Memory).filter(Memory.key == m.key).first()
    if existing:
        existing.value = m.value
    else:
        db.add(Memory(key=m.key, value=m.value, category=m.category))
    db.commit()
    return {"success": True}

@router.delete("/{key}")
def delete_memory(key: str, db: Session = Depends(get_db)):
    mem = db.query(Memory).filter(Memory.key == key).first()
    if not mem:
        raise HTTPException(404, "Memory not found")
    db.delete(mem)
    db.commit()
    return {"success": True}

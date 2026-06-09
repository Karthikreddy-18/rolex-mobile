import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import Setting
from routes import voice, memory, reminders, routines, settings, search

Base.metadata.create_all(bind=engine)

# Load saved Groq key from database
try:
    db = SessionLocal()
    key = db.query(Setting).filter(Setting.key == "groq_api_key").first()
    if key and key.value:
        os.environ["GROQ_API_KEY"] = key.value
    db.close()
except:
    pass

app = FastAPI(title="Rolex API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["Reminders"])
app.include_router(routines.router, prefix="/api/routines", tags=["Routines"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])

@app.get("/api/health")
def health():
    return {"status": "ok", "name": "Rolex"}

import base64
from fastapi import APIRouter, UploadFile, File, Form
from groq_client import chat_completion, transcribe_audio, generate_speech
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: list = []

@router.post("/chat")
async def chat(req: ChatRequest):
    messages = [{"role": "system", "content": "You are Rolex, a helpful voice assistant."}]
    for h in req.history:
        messages.append(h)
    messages.append({"role": "user", "content": req.message})
    result = await chat_completion(messages)
    return {"response": result.get("choices", [{}])[0].get("message", {}).get("content", ""), "raw": result}

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio = await file.read()
    result = await transcribe_audio(audio)
    return result

@router.post("/speak")
async def speak(text: str = Form(...)):
    audio = await generate_speech(text)
    return {"audio": base64.b64encode(audio).decode()}

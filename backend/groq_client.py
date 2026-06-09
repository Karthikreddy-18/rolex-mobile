import httpx
import os

GROQ_BASE = "https://api.groq.com/openai/v1"

def _get_headers():
    key = os.getenv("GROQ_API_KEY", "")
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

def _has_key():
    return bool(os.getenv("GROQ_API_KEY", ""))

async def chat_completion(messages, model="llama3-70b-8192", temperature=0.7):
    if not _has_key():
        return {"error": "GROQ_API_KEY not set"}
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GROQ_BASE}/chat/completions",
            headers=_get_headers(),
            json={"model": model, "messages": messages, "temperature": temperature},
            timeout=30,
        )
    return resp.json()

async def transcribe_audio(audio_bytes):
    if not _has_key():
        return {"error": "GROQ_API_KEY not set"}
    key = os.getenv("GROQ_API_KEY", "")
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GROQ_BASE}/audio/transcriptions",
            headers={"Authorization": f"Bearer {key}"},
            files={"file": ("audio.wav", audio_bytes, "audio/wav")},
            data={"model": "whisper-large-v3"},
            timeout=30,
        )
    return resp.json()

async def generate_speech(text, voice="alloy"):
    if not _has_key():
        return {"error": "GROQ_API_KEY not set"}
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GROQ_BASE}/audio/speech",
            headers=_get_headers(),
            json={"model": "tts-1", "input": text, "voice": voice},
            timeout=30,
        )
    return resp.content

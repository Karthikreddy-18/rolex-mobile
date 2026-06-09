from fastapi import APIRouter
from pydantic import BaseModel
from search import search_web
from groq_client import chat_completion

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    history: list = []

@router.post("/")
async def search(req: SearchRequest):
    web_results = search_web(req.query)
    context = "\n".join(
        f"- {r.get('title','')}: {r.get('body','')}"
        for r in web_results[:5] if "error" not in r
    )
    system_prompt = f"""You are Rolex, a helpful AI assistant. Use web search results to answer accurately.
Current date: June 2026

Web search results for "{req.query}":
{context if context else "No results found."}

Answer the user's question using this information. Be concise and cite sources."""
    messages = [{"role": "system", "content": system_prompt}]
    for h in req.history:
        messages.append(h)
    messages.append({"role": "user", "content": req.query})
    result = await chat_completion(messages)
    return {
        "response": result.get("choices", [{}])[0].get("message", {}).get("content", ""),
        "sources": [r.get("link", "") for r in web_results[:5] if "error" not in r],
    }

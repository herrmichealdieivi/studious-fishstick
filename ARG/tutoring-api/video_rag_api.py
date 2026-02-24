"""
FastAPI backend for Video RAG Engine - Integrated into ARG
Exposes playback position, context-aware analysis, and conversation save.
Run: uvicorn video_rag_api:app --reload --host 0.0.0.0 --port 8001
"""

import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from temporal_video_rag_engine import TemporalVideoRAGEngine

# Storage directory (env or default)
STORAGE_DIR = os.environ.get("VIDEO_RAG_STORAGE_DIR", "./video_rag_storage")

# One engine per video_id to keep playback position and conversation state per video
_engines: dict[str, TemporalVideoRAGEngine] = {}


def get_engine(video_id: str) -> TemporalVideoRAGEngine:
    if video_id not in _engines:
        _engines[video_id] = TemporalVideoRAGEngine(storage_dir=STORAGE_DIR)
    return _engines[video_id]


app = FastAPI(
    title="Video RAG API - ARG Integration",
    description="Enhanced Video RAG with temporal awareness and conversation context",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response models ---


class PlaybackPositionBody(BaseModel):
    video_id: str
    position: float


class AnalyzeBody(BaseModel):
    video_id: str
    query: str
    top_k: int = 3


class SaveConversationBody(BaseModel):
    video_id: str
    session_name: Optional[str] = None


class CreateDemoBody(BaseModel):
    video_id: str


# --- Endpoints ---


@app.get("/health")
def health():
    return {"status": "ok", "service": "video-rag-arg"}


@app.post("/playback-position")
def set_playback_position(body: PlaybackPositionBody):
    """Update current playback position (seconds) for a video."""
    try:
        engine = get_engine(body.video_id)
        engine.set_playback_position(body.position)
        return {"video_id": body.video_id, "position": body.position}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
def analyze(body: AnalyzeBody):
    """
    Ask a question with full temporal and conversation context.
    Returns chunks, prompt (for LLM), and context_info.
    """
    try:
        engine = get_engine(body.video_id)
        result = engine.analyze_with_context(
            query=body.query,
            video_path=body.video_id,
            top_k=body.top_k,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/conversation/save")
def save_conversation(body: SaveConversationBody):
    """Save conversation history for the current video."""
    try:
        engine = get_engine(body.video_id)
        engine.save_conversation(body.video_id, body.session_name)
        return {"video_id": body.video_id, "saved": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/demo/create")
def create_demo_data(body: CreateDemoBody):
    """Create demo chunks for testing (no real video needed)."""
    try:
        engine = get_engine(body.video_id)
        chunks = engine.create_demo_chunks(body.video_id)
        return {
            "video_id": body.video_id,
            "chunks_created": len(chunks),
            "message": f"Demo data created for {body.video_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/engines")
def list_engines():
    """List all active engines and their states."""
    engine_info = {}
    for video_id, engine in _engines.items():
        engine_info[video_id] = {
            "current_position": engine.current_playback_position,
            "conversation_turns": len(engine.conversation_history),
            "recently_viewed_chunks": len(engine.recently_viewed_chunks)
        }
    return {"engines": engine_info, "total_active": len(_engines)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

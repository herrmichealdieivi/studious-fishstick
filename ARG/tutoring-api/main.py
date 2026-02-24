"""
main.py – AI Tutoring System (OpenRouter or Groq) with Video RAG Integration

Same app, but uses cheaper providers:
- OpenRouter: $0.00015 per 1K tokens (vs Anthropic $0.003)
- Groq: FREE tier available (10K requests/day)

Now includes Video RAG capabilities for enhanced learning experience.

Set provider:
  export LLM_PROVIDER=openrouter  # or "groq"
  export OPENROUTER_API_KEY=sk-...
  # OR
  export GROQ_API_KEY=gsk-...

Deploy: python main.py
"""

import os
import hashlib
import logging
import time
import uuid
from typing import Optional, Dict, List, Tuple
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, field
import json

import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Import Video RAG components
try:
    from video_rag_engine import VideoRAGEngine
    from temporal_video_rag_engine import TemporalVideoRAGEngine
    VIDEO_RAG_AVAILABLE = True
    logging.info("Video RAG components loaded successfully")
except ImportError as e:
    VIDEO_RAG_AVAILABLE = False
    logging.warning(f"Video RAG components not available: {e}")
    logging.warning("Install with: pip install -r requirements_rag.txt")

# ---------------------------------------------------------------------------
# LOGGING
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tutoring.db")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openrouter")  # "openrouter" or "groq"

# Try to load embeddings model (optional)
try:
    from sentence_transformers import SentenceTransformer
    embeddings_model = SentenceTransformer("all-MiniLM-L6-v2")
except ImportError:
    logger.warning("SentenceTransformer not available; embeddings disabled")
    embeddings_model = None

# ---------------------------------------------------------------------------
# LLM CLIENT (OpenRouter or Groq)
# ---------------------------------------------------------------------------

class LLMClient:
    """Unified interface for OpenRouter or Groq."""

    def __init__(self, provider: str):
        self.provider = provider

        if provider == "openrouter":
            self.api_key = os.getenv("OPENROUTER_API_KEY", "")
            if not self.api_key:
                raise ValueError("Set OPENROUTER_API_KEY environment variable")
            self.base_url = "https://openrouter.ai/api/v1"
            # Cheaper models on OpenRouter
            self.cheap_model = "meta-llama/llama-2-7b-chat"  # ~$0.00015 per 1K tokens
            self.default_model = "gpt-3.5-turbo"  # ~$0.0005 per 1K tokens
            logger.info("Using OpenRouter")

        elif provider == "groq":
            self.api_key = os.getenv("GROQ_API_KEY", "")
            if not self.api_key:
                raise ValueError("Set GROQ_API_KEY environment variable")
            self.base_url = "https://api.groq.com/openai/v1"
            # Groq is super fast and FREE tier available
            self.cheap_model = "mixtral-8x7b-32768"  # FREE (10K/day)
            self.default_model = "mixtral-8x7b-32768"  # Same, all free
            logger.info("Using Groq (FREE)")

        else:
            raise ValueError(f"Unknown provider: {provider}")

    def create_message(self, model: str, max_tokens: int, messages: list) -> dict:
        """Call LLM API and return response."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }

        try:
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=30.0,
                )

            if response.status_code != 200:
                logger.error(f"LLM API error: {response.status_code} {response.text}")
                raise HTTPException(status_code=500, detail="LLM API error")

            result = response.json()

            # Extract text and token usage
            answer = result["choices"][0]["message"]["content"]
            usage = result.get("usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)

            return {
                "answer": answer,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
            }

        except httpx.TimeoutException:
            logger.error("LLM request timeout")
            raise HTTPException(status_code=504, detail="LLM timeout")
        except Exception as e:
            logger.error(f"LLM error: {e}")
            raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")


# Initialize LLM client
try:
    llm_client = LLMClient(LLM_PROVIDER)
except ValueError as e:
    logger.error(f"LLM initialization failed: {e}")
    llm_client = None

# ---------------------------------------------------------------------------
# TYPES & DATACLASSES (same as before)
# ---------------------------------------------------------------------------

StudentId = str
SkillId = str


@dataclass
class BktParameters:
    pL0: float = 0.5
    pT: float = 0.1
    pS: float = 0.1
    pG: float = 0.2
    version: str = "v1-fixed"

    def validate(self) -> None:
        if not (0 <= self.pL0 <= 1):
            raise ValueError(f"pL0 must be in [0,1], got {self.pL0}")
        if not (0 <= self.pT <= 1):
            raise ValueError(f"pT must be in [0,1], got {self.pT}")
        if not (0 <= self.pS <= 1):
            raise ValueError(f"pS must be in [0,1], got {self.pS}")
        if not (0 <= self.pG <= 1):
            raise ValueError(f"pG must be in [0,1], got {self.pG}")
        if self.pS + self.pG > 1:
            raise ValueError(f"pS ({self.pS}) + pG ({self.pG}) must be <= 1")


DEFAULT_BKT_PARAMS = BktParameters()


@dataclass
class EvidenceEvent:
    studentId: StudentId
    skillId: SkillId
    timestamp: float
    correct: int
    confidence: Optional[float] = None
    timeToAnswerMs: Optional[int] = None
    metadata: Optional[Dict] = None


@dataclass
class SkillState:
    studentId: StudentId
    skillId: SkillId
    masteryProbability: float
    evidenceCount: int
    lastUpdatedAt: Optional[float]
    paramsVersion: str = "v1-fixed"


@dataclass
class DiagnosticState:
    studentId: StudentId
    skillId: SkillId
    alerts: List[str] = field(default_factory=list)
    pattern: Optional[str] = None
    recommendedAction: Optional[str] = None


class ModelTier(Enum):
    CHEAP = "cheap"
    DEFAULT = "default"


# ---------------------------------------------------------------------------
# BKT MATH (same as before)
# ---------------------------------------------------------------------------


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def posteriorGivenCorrect(prior: float, params: BktParameters) -> float:
    pS, pG = params.pS, params.pG
    num = prior * (1 - pS)
    den = num + (1 - prior) * pG

    if den == 0:
        logger.warning(
            f"Degenerate posteriorGivenCorrect: prior={prior}, pS={pS}, pG={pG}"
        )
        return prior

    return clamp01(num / den)


def posteriorGivenIncorrect(prior: float, params: BktParameters) -> float:
    pS, pG = params.pS, params.pG
    num = prior * pS
    den = num + (1 - prior) * (1 - pG)

    if den == 0:
        logger.warning(
            f"Degenerate posteriorGivenIncorrect: prior={prior}, pS={pS}, pG={pG}"
        )
        return prior

    return clamp01(num / den)


def applyTransition(posterior: float, params: BktParameters) -> float:
    pT = params.pT
    return clamp01(posterior + (1 - posterior) * pT)


def initialSkillState(
    student_id: StudentId, skill_id: SkillId, params: BktParameters = None
) -> SkillState:
    if params is None:
        params = DEFAULT_BKT_PARAMS
    params.validate()

    return SkillState(
        studentId=student_id,
        skillId=skill_id,
        masteryProbability=params.pL0,
        evidenceCount=0,
        lastUpdatedAt=None,
        paramsVersion=params.version,
    )


def updateSkillState(
    previous: Optional[SkillState],
    event: EvidenceEvent,
    params: BktParameters = None,
) -> SkillState:
    if params is None:
        params = DEFAULT_BKT_PARAMS
    params.validate()

    priorState = (
        previous
        if previous
        else initialSkillState(event.studentId, event.skillId, params)
    )

    if priorState.paramsVersion != params.version:
        logger.warning(
            f"Param version mismatch for {event.studentId}/{event.skillId}: "
            f"{priorState.paramsVersion} → {params.version}, resetting"
        )
        priorState = initialSkillState(event.studentId, event.skillId, params)

    prior = priorState.masteryProbability
    posterior = (
        posteriorGivenCorrect(prior, params)
        if event.correct == 1
        else posteriorGivenIncorrect(prior, params)
    )
    nextMastery = applyTransition(posterior, params)

    return SkillState(
        studentId=priorState.studentId,
        skillId=priorState.skillId,
        masteryProbability=nextMastery,
        evidenceCount=priorState.evidenceCount + 1,
        lastUpdatedAt=event.timestamp,
        paramsVersion=params.version,
    )


# ---------------------------------------------------------------------------
# DIAGNOSTIC RULES (same as before)
# ---------------------------------------------------------------------------


def buildDiagnosticState(
    state: SkillState, allEvents: List[EvidenceEvent]
) -> DiagnosticState:
    alerts: List[str] = []
    pattern: Optional[str] = None
    recommendedAction: Optional[str] = None

    if len(allEvents) == 0:
        return DiagnosticState(
            studentId=state.studentId,
            skillId=state.skillId,
            alerts=alerts,
        )

    recent = allEvents[-5:]
    correctCount = sum(1 for e in recent if e.correct == 1)
    recent_ratio = correctCount / len(recent)

    if state.masteryProbability >= 0.75:
        pattern = "mastered"
        recommendedAction = "Move to next topic"
    elif state.masteryProbability < 0.3 and state.evidenceCount >= 5:
        pattern = "struggling"
        recommendedAction = "Review prerequisites or seek help"
        alerts.append(f"Low mastery ({state.masteryProbability:.1%}) despite {state.evidenceCount} attempts")
    elif recent_ratio < 0.4 and state.evidenceCount >= 3:
        pattern = "declining"
        alerts.append("Recent performance is worse than overall")
        recommendedAction = "Take a break or switch approaches"
    elif state.masteryProbability > 0.5 and recent_ratio == 1.0:
        pattern = "improving"
        recommendedAction = "Increase difficulty"
    else:
        pattern = "developing"

    return DiagnosticState(
        studentId=state.studentId,
        skillId=state.skillId,
        alerts=alerts,
        pattern=pattern,
        recommendedAction=recommendedAction,
    )


# ---------------------------------------------------------------------------
# ADAPTER: Mentorium → BKT (same as before)
# ---------------------------------------------------------------------------


class RawInteraction(BaseModel):
    studentId: StudentId
    contentId: str
    skillId: Optional[SkillId] = None
    timestamp: float
    isCorrect: bool
    confidence: Optional[float] = None
    timeToAnswerMs: Optional[int] = None
    errorCode: Optional[str] = None
    subject: Optional[str] = None


class MappingError:
    def __init__(
        self,
        reason: str,
        contentId: Optional[str] = None,
        context: Optional[str] = None,
    ):
        self.reason = reason
        self.contentId = contentId
        self.context = context

    def __str__(self):
        return f"{self.reason}: {self.context or ''}"


class ToEvidenceEventResult:
    def __init__(self, success: bool, event: Optional[EvidenceEvent] = None, error: Optional[MappingError] = None):
        self.success = success
        self.event = event
        self.error = error


def toEvidenceEvent(
    raw: RawInteraction,
    contentToSkillMap: Dict[str, SkillId],
) -> ToEvidenceEventResult:
    skillId = raw.skillId
    if not skillId:
        skillId = contentToSkillMap.get(raw.contentId)
        if not skillId:
            logger.error(f"No skill mapping for contentId: {raw.contentId}")
            return ToEvidenceEventResult(
                success=False,
                error=MappingError(
                    reason="mapping_failed",
                    contentId=raw.contentId,
                    context=f"Could not map contentId to skillId",
                ),
            )
        logger.debug(
            f"Inferred skill from content: {raw.contentId} → {skillId}"
        )

    if not isinstance(raw.timestamp, (int, float)) or raw.timestamp <= 0:
        return ToEvidenceEventResult(
            success=False,
            error=MappingError(
                reason="invalid_timestamp",
                context=f"Timestamp {raw.timestamp} is invalid",
            ),
        )

    if (
        raw.confidence is not None
        and (raw.confidence < 0 or raw.confidence > 1)
    ):
        return ToEvidenceEventResult(
            success=False,
            error=MappingError(
                reason="invalid_confidence",
                context=f"Confidence {raw.confidence} not in [0, 1]",
            ),
        )

    if (
        raw.timeToAnswerMs is not None
        and (raw.timeToAnswerMs < 0 or raw.timeToAnswerMs > 600_000)
    ):
        logger.warning(f"Suspicious timeToAnswer: {raw.timeToAnswerMs}ms")

    metadata: Dict = {}
    if raw.errorCode and raw.errorCode.strip():
        metadata["error_code"] = raw.errorCode.strip()
    if raw.subject:
        metadata["subject"] = raw.subject

    event = EvidenceEvent(
        studentId=raw.studentId,
        skillId=skillId,
        timestamp=raw.timestamp,
        correct=1 if raw.isCorrect else 0,
        confidence=raw.confidence,
        timeToAnswerMs=raw.timeToAnswerMs,
        metadata=metadata if metadata else None,
    )

    logger.debug(
        f"Mapped interaction: {raw.studentId}/{skillId} correct={event.correct}"
    )

    return ToEvidenceEventResult(success=True, event=event)


# ---------------------------------------------------------------------------
# MARE: BKT Coordinator (same as before)
# ---------------------------------------------------------------------------


class MareUpdateInput:
    def __init__(
        self,
        event: EvidenceEvent,
        previousState: Optional[SkillState],
        recentEventsForSkill: List[EvidenceEvent],
        maxRecentCount: int = 50,
        params: Optional[BktParameters] = None,
    ):
        self.event = event
        self.previousState = previousState
        self.recentEventsForSkill = recentEventsForSkill
        self.maxRecentCount = maxRecentCount
        self.params = params or DEFAULT_BKT_PARAMS


class MareUpdateOutput:
    def __init__(
        self,
        newState: SkillState,
        diagnostic: DiagnosticState,
        computeTimeMs: float = 0,
    ):
        self.newState = newState
        self.diagnostic = diagnostic
        self.computeTimeMs = computeTimeMs


def mareUpdate(inp: MareUpdateInput) -> MareUpdateOutput:
    t0 = time.time()

    if not inp.event.studentId or not inp.event.skillId:
        raise ValueError("Event missing studentId or skillId")
    if inp.event.timestamp <= 0:
        raise ValueError("Event has invalid timestamp")

    inp.params.validate()

    recentWindow = inp.recentEventsForSkill[-inp.maxRecentCount :]

    priorState = (
        inp.previousState
        if inp.previousState
        else initialSkillState(
            inp.event.studentId, inp.event.skillId, inp.params
        )
    )

    newState = updateSkillState(priorState, inp.event, inp.params)

    allEventsWithNew = recentWindow + [inp.event]
    diagnostic = buildDiagnosticState(newState, allEventsWithNew)

    t1 = time.time()

    return MareUpdateOutput(
        newState=newState,
        diagnostic=diagnostic,
        computeTimeMs=(t1 - t0) * 1000,
    )


# ---------------------------------------------------------------------------
# COST MANAGER: Routing + Caching (simplified for free APIs)
# ---------------------------------------------------------------------------


def classifyQuestion(question: str) -> ModelTier:
    """Route question. With free APIs, usually doesn't matter."""
    q = question.lower().strip()

    # Since Groq is free, just use it
    if LLM_PROVIDER == "groq":
        return ModelTier.CHEAP

    # For OpenRouter, still optimize
    complexSignals = [
        "why",
        "explain why",
        "compare",
        "contrast",
        "analyze",
    ]
    for signal in complexSignals:
        if q.startswith(signal):
            return ModelTier.DEFAULT

    return ModelTier.CHEAP


class CacheEntry:
    def __init__(
        self,
        key: str,
        videoId: str,
        question: str,
        answer: str,
        modelUsed: str,
        inputTokens: int,
        outputTokens: int,
        ttlSeconds: int = 86_400,
    ):
        self.key = key
        self.videoId = videoId
        self.question = question
        self.answer = answer
        self.modelUsed = modelUsed
        self.inputTokens = inputTokens
        self.outputTokens = outputTokens
        self.createdAt = time.time()
        self.ttlSeconds = ttlSeconds
        self.hits = 0

    @property
    def expired(self) -> bool:
        return (time.time() - self.createdAt) > self.ttlSeconds


class RoutingDecision:
    def __init__(
        self,
        cacheHit: bool,
        cachedAnswer: Optional[str],
        model: Optional[str],
        prompt: Optional[str],
        videoId: str,
        question: str,
        blocked: bool = False,
        blockReason: Optional[str] = None,
        tier: Optional[ModelTier] = None,
    ):
        self.cacheHit = cacheHit
        self.cachedAnswer = cachedAnswer
        self.model = model
        self.prompt = prompt
        self.videoId = videoId
        self.question = question
        self.blocked = blocked
        self.blockReason = blockReason
        self.tier = tier


class CostManager:
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}
        self._videoIndex: Dict[str, List[str]] = {}

    @staticmethod
    def _cacheKey(videoId: str, question: str) -> str:
        normalised = " ".join(question.lower().split())
        return hashlib.md5(f"{videoId}:{normalised}".encode()).hexdigest()

    def before_llm_call(
        self, videoId: str, question: str
    ) -> RoutingDecision:
        key = self._cacheKey(videoId, question)
        entry = self._cache.get(key)
        if entry and not entry.expired:
            entry.hits += 1
            logger.info(f"Cache hit: {question[:50]}... (hits: {entry.hits})")
            return RoutingDecision(
                cacheHit=True,
                cachedAnswer=entry.answer,
                model=entry.modelUsed,
                prompt=None,
                videoId=videoId,
                question=question,
            )

        if entry and entry.expired:
            del self._cache[key]

        tier = classifyQuestion(question)
        logger.debug(f"Routed to {tier.name}: {question[:50]}...")

        return RoutingDecision(
            cacheHit=False,
            cachedAnswer=None,
            model="free" if LLM_PROVIDER == "groq" else "cheap",
            prompt=question,
            videoId=videoId,
            question=question,
            tier=tier,
        )

    def after_llm_call(
        self,
        videoId: str,
        question: str,
        answer: str,
        model: str,
        inputTokens: int,
        outputTokens: int,
    ) -> None:
        key = self._cacheKey(videoId, question)
        self._cache[key] = CacheEntry(
            key=key,
            videoId=videoId,
            question=question,
            answer=answer,
            modelUsed=model,
            inputTokens=inputTokens,
            outputTokens=outputTokens,
        )
        self._videoIndex.setdefault(videoId, []).append(key)
        logger.debug(f"Cached answer for: {question[:50]}...")

    def stats(self, videoId: Optional[str] = None) -> Dict:
        entries = list(self._cache.values())
        if videoId:
            entries = [e for e in entries if e.videoId == videoId]
        totalHits = sum(e.hits for e in entries)
        return {
            "cached_answers": len(entries),
            "total_hits": totalHits,
            "hit_rate_%": round(
                totalHits / max(1, totalHits + len(entries)) * 100, 1
            ),
        }


# ---------------------------------------------------------------------------
# DATABASE MODELS (same as before)
# ---------------------------------------------------------------------------

Base = declarative_base()


class SkillStateDB(Base):
    __tablename__ = "skill_states"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, index=True)
    skill_id = Column(String, index=True)
    mastery_probability = Column(Float)
    evidence_count = Column(Integer)
    last_updated_at = Column(DateTime)
    params_version = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class EvidenceEventDB(Base):
    __tablename__ = "evidence_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, index=True)
    skill_id = Column(String, index=True)
    timestamp = Column(Float)
    correct = Column(Integer)
    confidence = Column(Float, nullable=True)
    time_to_answer_ms = Column(Integer, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContentSkillMapDB(Base):
    __tablename__ = "content_skill_map"

    content_id = Column(String, primary_key=True)
    skill_id = Column(String, index=True)


class SkillDB(Base):
    __tablename__ = "skills"

    skill_id = Column(String, primary_key=True)
    subject_id = Column(String, index=True)  # e.g. house id "1" or "math"


# Ranges for adaptive learning (per-subject)
MIN_EVIDENCE_FOR_ADAPTATION = 5
MASTERY_INDEPENDENT = 0.75
CHALLENGE_BAND_WIDTH = 0.2


try:
    engine = create_engine(DATABASE_URL, echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    logger.info(f"Database connected: {DATABASE_URL}")
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    SessionLocal = None


def getDb():
    if not SessionLocal:
        raise RuntimeError("Database not initialized")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# PYDANTIC MODELS (same as before)
# ---------------------------------------------------------------------------


class FeedbackRequest(BaseModel):
    student_id: StudentId
    content_id: str
    skill_id: Optional[SkillId] = None
    is_correct: bool
    confidence: Optional[float] = None
    time_to_answer_ms: Optional[int] = None
    timestamp: float = Field(default_factory=lambda: time.time())


class AskRequest(BaseModel):
    student_id: StudentId
    video_id: str
    question: str
    subject_id: Optional[str] = None  # for adaptive prompt (e.g. house id)
    skill_id: Optional[SkillId] = None


class SkillProgressResponse(BaseModel):
    student_id: StudentId
    skill_id: SkillId
    mastery: float
    evidence_count: int
    pattern: Optional[str]
    recommendations: List[str]


# ---------------------------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Tutoring System (Free LLM)",
    description="RAG + Cost Manager + BKT + OpenRouter or Groq",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

cost_manager = CostManager()
contentToSkillMap: Dict[str, SkillId] = {}
skillToSubject: Dict[SkillId, str] = {}  # skill_id -> subject_id

class LessonCompleteRequest(BaseModel):
    student_id: StudentId
    skill_id: SkillId
    subject_id: Optional[str] = None
    actual_time_seconds: float
    estimated_time_seconds: float
    points_earned: int
    bonus_points: int


class LessonCompleteResponse(BaseModel):
    success: bool
    total_points: int
    streak: int
    new_badges: List[str]
    mastery_improvement: float
    leaderboard_position: Optional[int] = None
async def load_content_map():
    global contentToSkillMap, skillToSubject
    if not SessionLocal:
        return
    db = SessionLocal()
    try:
        rows = db.query(ContentSkillMapDB).all()
        contentToSkillMap = {row.content_id: row.skill_id for row in rows}
        logger.info(f"Loaded {len(contentToSkillMap)} content→skill mappings")
        skill_rows = db.query(SkillDB).all()
        skillToSubject = {row.skill_id: row.subject_id for row in skill_rows}
        logger.info(f"Loaded {len(skillToSubject)} skill→subject mappings")
    except Exception as e:
        logger.error(f"Failed to load content/skill maps: {e}")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------


@app.post("/feedback", response_model=SkillProgressResponse)
async def submit_feedback(req: FeedbackRequest):
    """Student submits feedback: did they get the question right?"""
    if not SessionLocal:
        raise HTTPException(status_code=500, detail="Database not initialized")

    db = SessionLocal()

    try:
        raw = RawInteraction(
            studentId=req.student_id,
            contentId=req.content_id,
            skillId=req.skill_id,
            timestamp=req.timestamp,
            isCorrect=req.is_correct,
            confidence=req.confidence,
            timeToAnswerMs=req.time_to_answer_ms,
        )

        mapResult = toEvidenceEvent(raw, contentToSkillMap)
        if not mapResult.success:
            logger.error(f"Mapping failed: {mapResult.error}")
            raise HTTPException(status_code=400, detail=str(mapResult.error))

        event = mapResult.event

        previousStateDb = (
            db.query(SkillStateDB)
            .filter_by(student_id=event.studentId, skill_id=event.skillId)
            .order_by(SkillStateDB.created_at.desc())
            .first()
        )

        previousState = None
        if previousStateDb:
            previousState = SkillState(
                studentId=previousStateDb.student_id,
                skillId=previousStateDb.skill_id,
                masteryProbability=previousStateDb.mastery_probability,
                evidenceCount=previousStateDb.evidence_count,
                lastUpdatedAt=previousStateDb.last_updated_at.timestamp()
                if previousStateDb.last_updated_at
                else None,
                paramsVersion=previousStateDb.params_version,
            )

        recentEventsDb = (
            db.query(EvidenceEventDB)
            .filter_by(student_id=event.studentId, skill_id=event.skillId)
            .order_by(EvidenceEventDB.timestamp.asc())
            .limit(50)
            .all()
        )

        recentEvents = [
            EvidenceEvent(
                studentId=e.student_id,
                skillId=e.skill_id,
                timestamp=e.timestamp,
                correct=e.correct,
                confidence=e.confidence,
                timeToAnswerMs=e.time_to_answer_ms,
                metadata=e.metadata,
            )
            for e in recentEventsDb
        ]

        mareResult = mareUpdate(
            MareUpdateInput(
                event=event,
                previousState=previousState,
                recentEventsForSkill=recentEvents,
                maxRecentCount=50,
                params=DEFAULT_BKT_PARAMS,
            )
        )

        stateDb = SkillStateDB(
            id=f"{event.studentId}:{event.skillId}",
            student_id=event.studentId,
            skill_id=event.skillId,
            mastery_probability=mareResult.newState.masteryProbability,
            evidence_count=mareResult.newState.evidenceCount,
            last_updated_at=datetime.fromtimestamp(
                mareResult.newState.lastUpdatedAt
            ) if mareResult.newState.lastUpdatedAt else None,
            params_version=mareResult.newState.paramsVersion,
        )
        db.merge(stateDb)

        eventDb = EvidenceEventDB(
            student_id=event.studentId,
            skill_id=event.skillId,
            timestamp=event.timestamp,
            correct=event.correct,
            confidence=event.confidence,
            time_to_answer_ms=event.timeToAnswerMs,
            metadata=event.metadata,
        )
        db.add(eventDb)
        db.commit()

        logger.info(
            f"Updated {event.studentId}/{event.skillId}: "
            f"mastery={mareResult.newState.masteryProbability:.3f}, "
            f"evidence={mareResult.newState.evidenceCount}"
        )

        recommendations = []
        if mareResult.diagnostic.recommendedAction:
            recommendations.append(mareResult.diagnostic.recommendedAction)
        recommendations.extend(mareResult.diagnostic.alerts)

        return SkillProgressResponse(
            student_id=event.studentId,
            skill_id=event.skillId,
            mastery=round(mareResult.newState.masteryProbability, 3),
            evidence_count=mareResult.newState.evidenceCount,
            pattern=mareResult.diagnostic.pattern,
            recommendations=recommendations,
        )

    except Exception as e:
        logger.error(f"Error in /feedback: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        db.close()


@app.post("/ask")
async def ask_question(req: AskRequest):
    """Student asks a question. System routes to LLM (OpenRouter or Groq). Optional subject_id/skill_id enable adaptive prompt."""
    if not llm_client:
        raise HTTPException(
            status_code=500,
            detail="LLM client not initialized. Check your API keys.",
        )

    try:
        route = cost_manager.before_llm_call(req.video_id, req.question)

        if route.cacheHit:
            return {
                "answer": route.cachedAnswer,
                "source": "cache",
                "model": LLM_PROVIDER,
                "cost": "$0.00",
            }

        # Adaptive context: if subject_id provided, fetch mastery band and tailor prompt
        adaptive_instruction = ""
        if req.subject_id and SessionLocal:
            db = SessionLocal()
            try:
                ctx = _compute_adaptive_context(db, req.student_id, req.subject_id)
                low, high = ctx["suggested_difficulty_min"], ctx["suggested_difficulty_max"]
                independent = ctx["mastered_for_independent"]
                adaptive_instruction = (
                    f"[Instructor note: Student's mastery in this subject is ~{ctx.get('avg_mastery', 0.5):.2f} (0-1). "
                    f"Target difficulty band: {low:.2f}-{high:.2f}. "
                    f"Explain at this level — challenging but solvable. "
                )
                if independent:
                    adaptive_instruction += "They can work without step-by-step scaffolding; prefer concise explanations."
                else:
                    adaptive_instruction += "They may need clearer steps or one hint; avoid assuming prior knowledge."
                adaptive_instruction += "]\n\n"
            except Exception as e:
                logger.warning(f"Adaptive context failed: {e}")
            finally:
                db.close()

        # Call LLM
        model = (
            llm_client.cheap_model
            if route.tier == ModelTier.CHEAP
            else llm_client.default_model
        )

        user_content = adaptive_instruction + req.question if adaptive_instruction else req.question
        result = llm_client.create_message(
            model=model,
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": user_content,
                }
            ],
        )

        answer = result["answer"]
        input_tokens = result["input_tokens"]
        output_tokens = result["output_tokens"]

        cost_manager.after_llm_call(
            videoId=req.video_id,
            question=req.question,
            answer=answer,
            model=LLM_PROVIDER,
            inputTokens=input_tokens,
            outputTokens=output_tokens,
        )

        logger.info(
            f"/ask: {req.student_id} → {LLM_PROVIDER} "
            f"({input_tokens} in, {output_tokens} out)"
        )

        # Estimate cost
        if LLM_PROVIDER == "groq":
            cost = "$0.00"  # Free
        else:  # openrouter
            cost = f"${(input_tokens * 0.00015 + output_tokens * 0.0006) / 1000:.4f}"

        return {
            "answer": answer,
            "source": "llm",
            "model": LLM_PROVIDER,
            "tokens": {
                "input": input_tokens,
                "output": output_tokens,
            },
            "cost": cost,
        }

    except Exception as e:
        logger.error(f"Error in /ask: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


def _compute_adaptive_context(
    db: Session,
    student_id: StudentId,
    subject_id: str,
) -> dict:
    """Compute per-subject ranges and challenge band from skill_states."""
    skill_ids = [sid for sid, sub in skillToSubject.items() if sub == subject_id]
    if not skill_ids:
        return {
            "student_id": student_id,
            "subject_id": subject_id,
            "has_enough_data": False,
            "mastered_for_independent": False,
            "suggested_difficulty_min": 0.3,
            "suggested_difficulty_max": 0.7,
            "total_evidence": 0,
            "min_mastery": DEFAULT_BKT_PARAMS.pL0,
            "skills": [],
        }

    states = (
        db.query(SkillStateDB)
        .filter(
            SkillStateDB.student_id == student_id,
            SkillStateDB.skill_id.in_(skill_ids),
        )
        .all()
    )

    total_evidence = sum(s.evidence_count for s in states)
    masteries = [s.mastery_probability for s in states]
    min_mastery = min(masteries) if masteries else DEFAULT_BKT_PARAMS.pL0
    avg_mastery = sum(masteries) / len(masteries) if masteries else DEFAULT_BKT_PARAMS.pL0

    has_enough_data = total_evidence >= MIN_EVIDENCE_FOR_ADAPTATION
    mastered_for_independent = min_mastery >= MASTERY_INDEPENDENT
    low = max(0.0, avg_mastery - CHALLENGE_BAND_WIDTH)
    high = min(1.0, avg_mastery + CHALLENGE_BAND_WIDTH)

    return {
        "student_id": student_id,
        "subject_id": subject_id,
        "has_enough_data": has_enough_data,
        "mastered_for_independent": mastered_for_independent,
        "suggested_difficulty_min": round(low, 3),
        "suggested_difficulty_max": round(high, 3),
        "total_evidence": total_evidence,
        "min_mastery": round(min_mastery, 3),
        "avg_mastery": round(avg_mastery, 3),
        "skills": [
            {
                "skill_id": s.skill_id,
                "mastery": round(s.mastery_probability, 3),
                "evidence_count": s.evidence_count,
            }
            for s in states
        ],
    }


@app.get("/adaptive-context/{student_id}")
async def get_adaptive_context(
    student_id: StudentId,
    subject_id: str = Query(..., description="Subject (e.g. house id) for which to get adaptive context"),
):
    """
    Get adaptive context for a student in a subject: has_enough_data,
    mastered_for_independent, suggested_difficulty band. Use this before
    asking questions or calling /ask so the LLM and question difficulty
    match the student's pace.
    """
    if not SessionLocal:
        raise HTTPException(status_code=500, detail="Database not initialized")
    db = SessionLocal()
    try:
        return _compute_adaptive_context(db, student_id, subject_id)
    finally:
        db.close()


@app.get("/skill/{student_id}/{skill_id}")
async def get_skill_progress(student_id: StudentId, skill_id: SkillId):
    """Get mastery for a specific (student, skill)."""
    if not SessionLocal:
        raise HTTPException(status_code=500, detail="Database not initialized")

    db = SessionLocal()
    try:
        stateDb = (
            db.query(SkillStateDB)
            .filter_by(student_id=student_id, skill_id=skill_id)
            .order_by(SkillStateDB.created_at.desc())
            .first()
        )

        if not stateDb:
            return {
                "student_id": student_id,
                "skill_id": skill_id,
                "mastery": DEFAULT_BKT_PARAMS.pL0,
                "evidence_count": 0,
                "pattern": "new",
            }

        return {
            "student_id": student_id,
            "skill_id": skill_id,
            "mastery": round(stateDb.mastery_probability, 3),
            "evidence_count": stateDb.evidence_count,
            "last_updated": stateDb.last_updated_at.isoformat()
            if stateDb.last_updated_at
            else None,
        }

    finally:
        db.close()


@app.get("/skills/{student_id}")
async def get_all_skills(student_id: StudentId):
    """Get mastery across all skills for a student."""
    if not SessionLocal:
        raise HTTPException(status_code=500, detail="Database not initialized")

    db = SessionLocal()
    try:
        statesDb = (
            db.query(SkillStateDB)
            .filter_by(student_id=student_id)
            .order_by(SkillStateDB.skill_id)
            .all()
        )

        return {
            "student_id": student_id,
            "skills": [
                {
                    "skill_id": s.skill_id,
                    "mastery": round(s.mastery_probability, 3),
                    "evidence": s.evidence_count,
                }
                for s in statesDb
            ],
        }

    finally:
        db.close()


@app.get("/cache/stats")
async def cache_stats(video_id: Optional[str] = None):
    """Cache hit statistics."""
    return cost_manager.stats(video_id)


@app.get("/health")
async def health():
    """Health check."""
    return {
        "status": "ok",
        "llm_provider": LLM_PROVIDER,
        "video_rag_available": VIDEO_RAG_AVAILABLE,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ---------------------------------------------------------------------------
# VIDEO RAG ENDPOINTS (if available)
# ---------------------------------------------------------------------------

if VIDEO_RAG_AVAILABLE:

    class VideoPlaybackPosition(BaseModel):
        video_id: str
        position: float

    class VideoAnalyzeBody(BaseModel):
        video_id: str
        query: str
        top_k: int = 3

    class VideoSaveConversationBody(BaseModel):
        video_id: str
        session_name: Optional[str] = None

    class VideoCreateDemoBody(BaseModel):
        video_id: str

    def get_video_rag_engine(video_id: str) -> TemporalVideoRAGEngine:
        """Get or create video RAG engine for a video"""
        if video_id not in video_rag_engines:
            video_rag_engines[video_id] = TemporalVideoRAGEngine()
        return video_rag_engines[video_id]

    @app.post("/video/playback-position")
    async def set_video_playback_position(body: VideoPlaybackPosition):
        """Update current playback position (seconds) for a video."""
        try:
            engine = get_video_rag_engine(body.video_id)
            engine.set_playback_position(body.position)
            return {"video_id": body.video_id, "position": body.position}
        except Exception as e:
            logger.error(f"Error setting video position: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/video/analyze")
    async def analyze_video_query(body: VideoAnalyzeBody):
        """
        Ask a question about video content with temporal and conversation context.
        Returns chunks, prompt (for LLM), and context_info.
        """
        try:
            engine = get_video_rag_engine(body.video_id)
            result = engine.analyze_with_context(
                query=body.query,
                video_path=body.video_id,
                top_k=body.top_k,
            )
            return result
        except ValueError as e:
            logger.error(f"Video analysis error: {e}")
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error(f"Video analysis error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/video/conversation/save")
    async def save_video_conversation(body: VideoSaveConversationBody):
        """Save conversation history for the current video."""
        try:
            engine = get_video_rag_engine(body.video_id)
            engine.save_conversation(body.video_id, body.session_name)
            return {"video_id": body.video_id, "saved": True}
        except Exception as e:
            logger.error(f"Error saving video conversation: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/video/demo/create")
    async def create_video_demo_data(body: VideoCreateDemoBody):
        """Create demo chunks for testing (no real video needed)."""
        try:
            engine = get_video_rag_engine(body.video_id)
            chunks = engine.create_demo_chunks(body.video_id)
            return {
                "video_id": body.video_id,
                "chunks_created": len(chunks),
                "message": f"Demo data created for {body.video_id}"
            }
        except Exception as e:
            logger.error(f"Error creating video demo: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/video/engines")
    async def list_video_engines():
        """List all active video RAG engines and their states."""
        engine_info = {}
        for video_id, engine in video_rag_engines.items():
            engine_info[video_id] = {
                "current_position": engine.current_playback_position,
                "conversation_turns": len(engine.conversation_history),
                "recently_viewed_chunks": len(engine.recently_viewed_chunks)
            }
        return {"engines": engine_info, "total_active": len(video_rag_engines)}

    @app.post("/video/process-transcript")
    async def process_video_transcript(
        video_id: str,
        segments: List[Dict]
    ):
        """
        Process video transcript segments into chunks using basic video RAG engine.
        This creates the semantic chunks needed for temporal analysis.
        """
        try:
            global basic_video_rag_engine
            if basic_video_rag_engine is None:
                basic_video_rag_engine = VideoRAGEngine()
            
            # Process transcript into chunks
            chunks = basic_video_rag_engine.process_video(segments)
            
            # Save chunks for temporal engine to use
            chunk_file = f"./video_rag_storage/chunks/{video_id}_chunks.json"
            os.makedirs(os.path.dirname(chunk_file), exist_ok=True)
            basic_video_rag_engine.save_chunks(chunk_file)
            
            return {
                "video_id": video_id,
                "chunks_created": len(chunks),
                "message": f"Processed {len(segments)} transcript segments into {len(chunks)} chunks"
            }
        except Exception as e:
            logger.error(f"Error processing transcript: {e}")
            raise HTTPException(status_code=500, detail=str(e))

else:
    @app.get("/video/health")
    async def video_health():
        return {
            "status": "unavailable",
            "message": "Video RAG components not installed. Install with: pip install -r requirements_rag.txt"
        }


class TimeEstimateRequest(BaseModel):
    student_id: StudentId
    skill_id: SkillId
    subject_id: Optional[str] = None


class TimeEstimateResponse(BaseModel):
    estimated_minutes: float
    traditional_hours: float
    confidence: float
    mastery_level: float
    efficiency: float
    factors: Dict[str, float]


def _compute_time_estimate(
    student_id: StudentId, 
    skill_id: SkillId, 
    subject_id: Optional[str] = None,
    db: Session = None
) -> TimeEstimateResponse:
    """
    Compute adaptive time estimation based on BKT mastery and performance patterns.
    This estimates how long it will take the student to master the skill.
    """
    if not db:
        db = SessionLocal()
    
    try:
        # Get current skill state
        skill_state_db = (
            db.query(SkillStateDB)
            .filter_by(student_id=student_id, skill_id=skill_id)
            .order_by(SkillStateDB.created_at.desc())
            .first()
        )
        
        # Get recent performance events
        recent_events = (
            db.query(EvidenceEventDB)
            .filter_by(student_id=student_id, skill_id=skill_id)
            .order_by(EvidenceEventDB.timestamp.desc())
            .limit(20)
            .all()
        )
        
        # Base time estimates (in minutes)
        base_time = {
            "beginner": 45,      # 45 minutes for complete beginners
            "novice": 30,        # 30 minutes for novices
            "intermediate": 20,  # 20 minutes for intermediate
            "advanced": 10,      # 10 minutes for advanced
            "expert": 5          # 5 minutes for experts
        }
        
        # Calculate mastery level
        mastery_level = 0.1  # Default to beginner
        if skill_state_db:
            mastery_level = skill_state_db.mastery_probability
        
        # Calculate average response time and accuracy
        avg_response_time = 0
        accuracy_rate = 0.5
        
        if recent_events:
            response_times = [e.time_to_answer_ms for e in recent_events if e.time_to_answer_ms]
            if response_times:
                avg_response_time = sum(response_times) / len(response_times) / 1000  # Convert to seconds
            
            correct_count = sum(1 for e in recent_events if e.correct == 1)
            accuracy_rate = correct_count / len(recent_events)
        
        # Determine learning tier
        if mastery_level >= 0.9:
            tier = "expert"
        elif mastery_level >= 0.75:
            tier = "advanced"
        elif mastery_level >= 0.5:
            tier = "intermediate"
        elif mastery_level >= 0.25:
            tier = "novice"
        else:
            tier = "beginner"
        
        # Calculate adaptive factors
        factors = {
            "mastery_bonus": mastery_level * 0.7,  # Higher mastery reduces time
            "accuracy_bonus": accuracy_rate * 0.2,  # Higher accuracy reduces time
            "speed_penalty": min(avg_response_time / 60, 1.0) * 0.1,  # Slower responses increase time
        }
        
        # Base time for this tier
        base_minutes = base_time[tier]
        
        # Apply adaptive factors
        total_reduction = sum(factors.values())
        adaptive_multiplier = max(0.2, 1.0 - total_reduction)  # Minimum 20% of base time
        
        estimated_minutes = base_minutes * adaptive_multiplier
        
        # Traditional learning estimate (much slower)
        traditional_hours = estimated_minutes / 60 * 8  # 8x slower than adaptive
        
        # Calculate efficiency (how much faster than traditional)
        efficiency = traditional_hours / (estimated_minutes / 60)
        
        # Confidence in estimate (higher with more data)
        evidence_count = len(recent_events)
        confidence = min(0.9, 0.3 + (evidence_count / 20) * 0.6)
        
        return TimeEstimateResponse(
            estimated_minutes=round(estimated_minutes, 1),
            traditional_hours=round(traditional_hours, 1),
            confidence=round(confidence, 2),
            mastery_level=round(mastery_level, 2),
            efficiency=round(efficiency, 1),
            factors={k: round(v, 3) for k, v in factors.items()}
        )
        
    finally:
        if not db:
            db.close()


@app.post("/time-estimate", response_model=TimeEstimateResponse)
async def get_time_estimate(req: TimeEstimateRequest):
    """Get adaptive time estimation for skill mastery."""
    if not SessionLocal:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    db = SessionLocal()
    try:
        result = _compute_time_estimate(req.student_id, req.skill_id, req.subject_id, db)
        logger.info(f"Time estimate for {req.student_id}/{req.skill_id}: {result.estimated_minutes}min (efficiency: {result.efficiency}x)")
        return result
    except Exception as e:
        logger.error(f"Error in /time-estimate: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        log_level="info",
    )

"""
Pydantic models for the ML Authentication Portal API.

These schemas mirror the TypeScript interfaces in src/types/behavior.ts exactly.
"""

from pydantic import BaseModel
from typing import Optional


# --- Request Models ---

class MousePoint(BaseModel):
    x: float
    y: float
    t: float  # timestamp in ms (performance.now())


class MouseData(BaseModel):
    points: list[MousePoint]
    velocities: list[float]
    curvatures: list[float]
    path_straightness: float


class KeystrokeData(BaseModel):
    flight_times: list[float]  # ms between consecutive keydown events
    dwell_times: list[float]   # ms each key was held
    total_keys: int


class SessionData(BaseModel):
    page_load_ts: float
    submit_ts: float
    page_dwell_ms: float


class EntropyData(BaseModel):
    canvas_hash: Optional[str] = None
    audio_hash: Optional[str] = None


class BehaviorPayload(BaseModel):
    mouse: MouseData
    keystroke: KeystrokeData
    session: SessionData
    entropy: EntropyData
    user_agent: str


# --- Response Models ---

class ScoreBreakdown(BaseModel):
    mouse_score: float
    keystroke_score: float
    tls_score: float
    session_score: float
    entropy_score: float


class VerifyResponse(BaseModel):
    confidence: float
    decision: str  # "PASS", "FALLBACK", or "BLOCK"
    breakdown: ScoreBreakdown
    request_id: str

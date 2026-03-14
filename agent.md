# ML Authentication Portal — Agent Strategy Document

## 1. Project Identity

**Project Name:** ML Authentication Portal (Secura Portal)  
**Tagline:** *Invisible CAPTCHA — Behavioral ML that protects your APIs without annoying your users.*  
**Context:** 24-hour hackathon project. Judged on Innovation, ML Effectiveness, Privacy Compliance, Enterprise Feasibility, and UX Quality.

---

## 2. Agent Role & Objectives

This document defines the AI coding agent's behavior, priorities, and execution strategy for building the ML Authentication Portal.

### Primary Objective
Build a working split-screen demo that shows:
1. **Left Screen**: A polished React login page where behavioral data is silently collected
2. **Right Screen**: A Python FastAPI terminal showing real-time ML scoring

### Demo Scenarios
| Scenario | User Action | Expected Result |
|---|---|---|
| **Human Flow** | Type naturally, move mouse organically, click Login | Confidence ≥ 0.85 → instant dashboard access |
| **Bot Flow** | Paste password instantly, no mouse movement, or use Selenium | Confidence < 0.85 → "Slide to Verify" fallback triggers |

---

## 3. Decision Framework

### Privacy-First Design Rules
1. **NEVER** log `Event.key` — only timing metadata (flight time, dwell time)
2. **ALWAYS** wrap `Canvas` and `AudioContext` calls in `try/catch`
3. **NEVER** store raw behavioral data longer than the scoring request
4. **ALWAYS** hash browser entropy values before transmission

### ML Model Selection Rationale
| Signal | Why This Model | Alternative Considered |
|---|---|---|
| Mouse | Random Forest on BeCAPTCHA-Mouse | CNN — too slow for real-time; RF gives 94%+ accuracy |
| Keystroke | TypeFormer (Transformer) | RNN — TypeFormer is SOTA on Aalto/Clarkson II |
| TLS | CatBoost on JA4DB | XGBoost — CatBoost handles categorical features (cipher suites) better |

### Scoring Threshold Logic
```
if confidence >= 0.85:
    → PASS (silent, zero friction)
elif confidence >= 0.60:
    → FALLBACK ("Slide to Verify" — human-friendly challenge)
else:
    → BLOCK (deny access, log as malicious)
```

---

## 4. Code Quality Standards

### Frontend (React/TypeScript)
- All behavioral trackers must be implemented as custom React hooks
- Use TypeScript strict mode — no `any` types in production code
- All data payloads must have a defined `interface` in `src/types/`
- Privacy-sensitive operations (Canvas, Audio) must have `try/catch` + `null` fallback

### Backend (Python/FastAPI)
- Use Pydantic models for all request/response schemas
- Structured JSON logging for demo terminal output
- CORS configured for `localhost:3000`
- Each ML model must implement a common `ModelInterface`:
  ```python
  class ModelInterface:
      def predict(self, features: dict) -> float:
          """Returns confidence score 0.0–1.0"""
  ```

### General
- No hardcoded secrets or API keys
- All weights and thresholds configurable via environment variables
- README.md must be updated with setup instructions before demo

---

## 5. Execution Priority Matrix

The agent should prioritize work in this order (highest impact per hour for the hackathon):

| Priority | Task | Estimated Time | Impact |
|---|---|---|---|
| **P0** | Frontend behavioral data collection (mouse + keystroke + timing) | 2 hours | Without data, no ML is possible |
| **P0** | FastAPI backend with `/api/verify` endpoint | 1.5 hours | Without backend, no scoring |
| **P1** | ML model integration (even simplified/mock models) | 2 hours | Core "ML Effectiveness" score |
| **P1** | Frontend ↔ Backend wiring for live demo | 1 hour | Demo won't work without this |
| **P2** | TLS fingerprinting with JA4 | 1 hour | Advanced feature, impressive if shown |
| **P2** | Dashboard live telemetry | 1 hour | Visual impact for judges |
| **P3** | Bot flow script (Selenium or `requests`) | 0.5 hours | Shows contrast in demo |

### Fallback Strategy (If Running Out of Time)
If ML models can't be fully integrated:
1. Use **statistical heuristics** (velocity variance, timing distributions) instead of trained models
2. Hardcode known-good thresholds from the training data distributions
3. Still present the architecture as "production-ready with pre-trained model slots"

---

## 6. File Ownership Map

| File | Owner | Status |
|---|---|---|
| `src/App.tsx` | Agent | ✅ Done — needs minor updates for API integration |
| `src/components/Login.tsx` | Agent | ✅ Done |
| `src/components/Dashboard.tsx` | Agent | ✅ Done — needs live telemetry in Phase 5 |
| `src/components/FallbackModal.tsx` | Agent | ✅ Done |
| `src/hooks/useBehaviorTracker.ts` | Agent | 🔧 Stub — Phase 2 target |
| `src/services/api.ts` | Agent | 🆕 Phase 2 |
| `src/types/behavior.ts` | Agent | 🆕 Phase 2 |
| `src/utils/mouseTracker.ts` | Agent | 🆕 Phase 2 |
| `src/utils/keystrokeTracker.ts` | Agent | 🆕 Phase 2 |
| `src/utils/entropyCollector.ts` | Agent | 🆕 Phase 2 |
| `backend/main.py` | Agent | 🆕 Phase 3 |
| `backend/models/` | Agent | 🆕 Phase 4 |
| `design.md` | Agent | ✅ Done |
| `agent.md` | Agent | ✅ Done |

---

## 7. Demo Script (For Judges)

### Setup
```bash
# Terminal 1: Frontend
cd ml-authentication-portal
npm run dev
# → localhost:3000

# Terminal 2: Backend
cd ml-authentication-portal/backend
uvicorn main:app --reload --port 8000
# → localhost:8000
```

### Demo Flow
1. **Open split screen**: Browser (left) + Terminal (right)
2. **Human Flow**: 
   - Type username and password naturally with human-like timing
   - Move mouse in natural curves toward the Login button
   - Click Login → Backend terminal shows `confidence: 0.94` → Dashboard loads instantly
3. **Bot Flow**:
   - Open browser console or use Selenium
   - Paste password directly (0ms dwell time)
   - Click Login instantly
   - Backend terminal shows `confidence: 0.32` with breakdown
   - Frontend triggers "Slide to Verify" fallback modal
4. **Highlight for Judges**: Point out the backend terminal showing real-time ML breakdown scores per signal

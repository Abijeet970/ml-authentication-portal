# ML Authentication Portal — System Design Document

## 1. Vision & Problem Statement

Enterprises need to protect APIs and login pages from automated bot traffic **without** forcing users to solve annoying visual CAPTCHAs. This system silently determines if a user is human using **passive behavioral signals** and **machine learning**, achieving a frictionless authentication experience.

### Judging Criteria Alignment

| Criteria | Our Approach |
|---|---|
| **Innovation** | Invisible ML-based CAPTCHA using behavioral biometrics — no puzzles |
| **ML Effectiveness** | Pre-trained models (BeCAPTCHA-Mouse, TypeFormer, JA4DB) with ensemble scoring |
| **Privacy Compliance** | No keystroke values logged, Canvas/Audio wrapped in try/catch, no PII stored |
| **Enterprise Feasibility** | FastAPI backend, pluggable model architecture, TLS-level fingerprinting |
| **UX Quality** | Zero-friction human flow; graceful "Slide to Verify" fallback for edge cases |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│                         localhost:3000                            │
│                                                                  │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │  Login Page  │  │ Behavior Tracker │  │  Fallback Modal    │  │
│  │  (Login.tsx) │  │ (useBehavior     │  │  (FallbackModal    │  │
│  │             │  │  Tracker.ts)     │  │   .tsx)            │  │
│  └──────┬──────┘  └────────┬─────────┘  └────────┬───────────┘  │
│         │                  │                      │              │
│         └──────────┬───────┘                      │              │
│                    ▼                              │              │
│         ┌──────────────────┐                      │              │
│         │ Behavior Payload │◄─────────────────────┘              │
│         │ (JSON bundle)    │                                     │
│         └────────┬─────────┘                                     │
└──────────────────┼───────────────────────────────────────────────┘
                   │  POST /api/verify
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND (Python FastAPI)                      │
│                        localhost:8000                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ TLS/JA4      │  │  Signal      │  │   ML Ensemble Engine   │ │
│  │ Fingerprint  │  │  Validator   │  │                        │ │
│  │ Extractor    │  │  & Normalizer│  │  ┌──────────────────┐  │ │
│  └──────┬───────┘  └──────┬───────┘  │  │ Mouse Model      │  │ │
│         │                  │         │  │ (RandomForest/    │  │ │
│         └──────────┬───────┘         │  │  LSTM)            │  │ │
│                    ▼                 │  ├──────────────────┤  │ │
│           ┌────────────────┐         │  │ Keystroke Model   │  │ │
│           │ Scoring Engine │◄────────│  │ (TypeFormer)      │  │ │
│           │ (Confidence    │         │  ├──────────────────┤  │ │
│           │  0.0 → 1.0)   │         │  │ TLS/Network       │  │ │
│           └────────┬───────┘         │  │ Model (CatBoost)  │  │ │
│                    │                 │  └──────────────────┘  │ │
│                    ▼                 └────────────────────────┘ │
│           ┌────────────────┐                                     │
│           │ Decision Engine│                                     │
│           │ ≥0.85 → PASS   │                                     │
│           │ <0.85 → FALLBK │                                     │
│           └────────────────┘                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Collection & Privacy Strategy

### 3.1 Mouse Dynamics (Frontend)
- **Collected:** X/Y coordinates, timestamps (ms), path curvature
- **Not collected:** Nothing sensitive
- **Purpose:** Feed to BeCAPTCHA-Mouse–trained model to detect robotic trajectories
- **Privacy:** Pure positional data, no PII

### 3.2 Keystroke Dynamics (Frontend)
- **Collected:** Flight time (inter-key interval), dwell time (key hold duration)
- **NOT collected:** `Event.key` — we never record which key was pressed
- **Purpose:** Feed to TypeFormer model to detect robotic typing patterns
- **Privacy:** Cannot reconstruct typed content; not a keylogger

### 3.3 Session Behavior (Frontend)
- **Collected:** Total page dwell time before clicking "Log In"
- **Purpose:** Bots submit instantly (< 500ms); humans take 3–15 seconds
- **Privacy:** Single timestamp, no PII

### 3.4 Browser Entropy (Frontend)
- **Collected:** Canvas API fingerprint hash, AudioContext fingerprint hash
- **Privacy safeguard:** Wrapped in `try/catch` — if blocked by Brave/Firefox privacy mode, returns `null` instead of false-flagging the user
- **Purpose:** Detect headless browsers and spoofed environments

### 3.5 TLS Fingerprinting (Backend)
- **Collected:** JA4 hash derived from TLS handshake metadata (ciphers, extensions, ALPN)
- **Purpose:** Expose bots that spoof User-Agent/IP but can't fake their TLS stack
- **Privacy:** Network-level metadata only, no payload inspection

---

## 4. ML Engine Design

### 4.1 Mouse Dynamics Model
| Attribute | Value |
|---|---|
| **Architecture** | Random Forest / LSTM |
| **Training Data** | BeCAPTCHA-Mouse Benchmark (15,000 human + synthetic bot trajectories) |
| **Input Features** | Velocity, acceleration, curvature, jerk, path straightness index |
| **Output** | `mouse_score: 0.0–1.0` (probability of human) |

### 4.2 Keystroke Dynamics Model
| Attribute | Value |
|---|---|
| **Architecture** | TypeFormer (Transformer) |
| **Training Data** | Aalto & Clarkson II massive typing datasets |
| **Input Features** | Flight time sequences, dwell time sequences |
| **Output** | `keystroke_score: 0.0–1.0` |

### 4.3 TLS/Network Model
| Attribute | Value |
|---|---|
| **Architecture** | CatBoost / XGBoost |
| **Training Data** | JA4DB repository |
| **Input Features** | JA4 hash components, cipher suite ordering, extension set |
| **Output** | `tls_score: 0.0–1.0` (claimed 98.6% accuracy) |

### 4.4 Ensemble Scoring
```
final_confidence = w1 * mouse_score + w2 * keystroke_score + w3 * tls_score + w4 * session_score + w5 * entropy_score

Default weights: w1=0.30, w2=0.25, w3=0.25, w4=0.10, w5=0.10
```

**Decision threshold:** `≥ 0.85 → PASS (silent) | < 0.85 → FALLBACK (Slide to Verify)`

---

## 5. Frontend Component Architecture

```
src/
├── App.tsx                    # Root: manages login/dashboard view + ML confidence state
├── components/
│   ├── Login.tsx              # Login form with parallax background
│   ├── Dashboard.tsx          # Enterprise admin portal (post-auth)
│   └── FallbackModal.tsx      # "Slide to Verify" modal for low-confidence users
├── hooks/
│   └── useBehaviorTracker.ts  # 🔧 STUB — needs real implementation
├── services/
│   └── api.ts                 # 🆕 HTTP client for POST /api/verify
├── types/
│   └── behavior.ts            # 🆕 BehaviorPayload TypeScript interface
└── utils/
    ├── mouseTracker.ts        # 🆕 Mouse dynamics collection logic
    ├── keystrokeTracker.ts    # 🆕 Keystroke dynamics collection logic
    └── entropyCollector.ts    # 🆕 Canvas + AudioContext fingerprinting
```

---

## 6. Backend API Design

### `POST /api/verify`
```json
// Request (from frontend)
{
  "mouse": {
    "points": [{"x": 120, "y": 340, "t": 1710000001}],
    "velocity": [12.5, 14.2],
    "curvature": [0.02, 0.04]
  },
  "keystroke": {
    "flight_times": [85, 112, 96, 130],
    "dwell_times": [45, 52, 38, 60]
  },
  "session": {
    "page_dwell_ms": 8420,
    "submit_timestamp": 1710000010
  },
  "entropy": {
    "canvas_hash": "a3f8c2...",
    "audio_hash": "b7e1d4..."
  },
  "user_agent": "Mozilla/5.0 ..."
}

// Response
{
  "confidence": 0.94,
  "decision": "PASS",
  "breakdown": {
    "mouse_score": 0.97,
    "keystroke_score": 0.91,
    "tls_score": 0.95,
    "session_score": 0.88,
    "entropy_score": 1.0
  },
  "request_id": "uuid-here"
}
```

---

## 7. Execution Phases

### Phase 1 ✅ — UI Shell & Prototype
> **STATUS: COMPLETE**
- Vite + React + TypeScript + Tailwind project scaffolded
- `Login.tsx` — polished login form with parallax background & animations
- `Dashboard.tsx` — enterprise admin portal with auth activity table
- `FallbackModal.tsx` — "Slide to Verify" fallback mechanism
- `useBehaviorTracker.ts` — stub hook (event listeners, no logic)
- `App.tsx` — view routing + simulated `window.setMlConfidence()` for testing
- Standalone HTML prototypes for rapid design iteration

### Phase 2 — Frontend Behavioral Data Collection
> **STATUS: NEXT**
- Implement real mouse dynamics tracking (X/Y, velocity, curvature)
- Implement keystroke dynamics (flight time, dwell time — no key values)
- Implement session timing + browser entropy collection
- Create `BehaviorPayload` type + API service layer
- Wire the "Log In" button to collect data + POST to backend

### Phase 3 — Python FastAPI Backend
- Set up FastAPI with CORS, structured logging
- `/api/verify` endpoint receives `BehaviorPayload`
- TLS fingerprint extraction middleware
- Scoring engine with pluggable model interface

### Phase 4 — ML Model Integration
- Load pre-trained mouse model (BeCAPTCHA-Mouse)
- Load TypeFormer keystroke model
- Load CatBoost TLS classifier
- Build weighted ensemble scorer

### Phase 5 — Live Demo Polish
- Frontend ↔ Backend real-time communication
- Dashboard displays live ML telemetry
- Human flow (natural behavior → instant pass)
- Bot flow (Selenium script / paste → low score → fallback trigger)
- Split-screen terminal demo for judges

---

## 8. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 3.4 |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| ML Runtime | scikit-learn, PyTorch (TypeFormer), CatBoost |
| TLS Fingerprinting | ja4 Python library |
| Fonts | Inter (Google Fonts), Material Symbols |

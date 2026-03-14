"""
ML Scoring Engine for Bot Detection

Heuristic-based scoring that analyzes behavioral signals to determine
if a user is human or a bot. Each sub-scorer returns 0.0-1.0 (1.0 = human).

Scoring Models:
  - Mouse dynamics: velocity variance, curvature, path straightness
  - Keystroke dynamics: dwell/flight time distributions and variance
  - Session behavior: page dwell time before submit
  - Browser entropy: canvas/audio fingerprint presence
  - TLS/Network: user-agent analysis (placeholder for JA4)
"""

import math
import statistics
from models import BehaviorPayload


# ──────────────────────────────────────────────
#  1. MOUSE DYNAMICS SCORER
# ──────────────────────────────────────────────

def score_mouse(payload: BehaviorPayload) -> tuple[float, dict]:
    """
    Humans produce varied velocities, curved paths, and non-straight trajectories.
    Bots typically have zero mouse data, perfectly straight paths, or uniform velocity.
    """
    mouse = payload.mouse
    details = {}

    # No mouse data at all - very suspicious
    if len(mouse.points) < 3:
        details["reason"] = "No/minimal mouse movement detected"
        return 0.15, details

    # --- Velocity variance ---
    # Humans have high variance; bots have near-zero or perfectly uniform
    if len(mouse.velocities) > 2:
        vel_mean = statistics.mean(mouse.velocities)
        vel_std = statistics.stdev(mouse.velocities)
        vel_cv = vel_std / vel_mean if vel_mean > 0 else 0  # coefficient of variation

        # Good CV range for humans: 0.3 - 2.0
        if vel_cv > 0.3:
            velocity_score = min(1.0, 0.5 + vel_cv * 0.3)
        else:
            velocity_score = vel_cv / 0.3 * 0.5  # Low variance = suspicious
    else:
        velocity_score = 0.3
    details["velocity_score"] = round(velocity_score, 3)

    # --- Curvature analysis ---
    # Humans have natural curves; bots move in straight lines
    if len(mouse.curvatures) > 2:
        avg_curvature = statistics.mean(mouse.curvatures)
        # Human mouse paths have average curvature 0.1-0.8 radians
        if 0.05 < avg_curvature < 1.2:
            curvature_score = 0.9
        elif avg_curvature <= 0.05:
            curvature_score = 0.3  # Too straight
        else:
            curvature_score = 0.6  # Too erratic
    else:
        curvature_score = 0.4
    details["curvature_score"] = round(curvature_score, 3)

    # --- Path straightness ---
    # Humans: 0.3-0.8 (somewhat curved), Bots: ~1.0 (perfectly straight)
    straightness = mouse.path_straightness
    if straightness > 0.95:
        straightness_score = 0.3  # Too perfect
    elif straightness > 0.85:
        straightness_score = 0.6
    elif straightness > 0.3:
        straightness_score = 0.95  # Natural human range
    else:
        straightness_score = 0.7  # Very erratic but still possible
    details["straightness_score"] = round(straightness_score, 3)

    # --- Data volume ---
    # More points = more interaction time = more human-like
    point_count = len(mouse.points)
    volume_score = min(1.0, point_count / 80) * 0.8 + 0.2
    details["volume_score"] = round(volume_score, 3)
    details["point_count"] = point_count

    # Weighted combination
    final = 0.30 * velocity_score + 0.25 * curvature_score + 0.25 * straightness_score + 0.20 * volume_score
    return round(final, 4), details


# ──────────────────────────────────────────────
#  2. KEYSTROKE DYNAMICS SCORER
# ──────────────────────────────────────────────

def score_keystroke(payload: BehaviorPayload) -> tuple[float, dict]:
    """
    Humans type with natural rhythm variation. Bots either don't type (paste)
    or have suspiciously uniform timing.
    """
    ks = payload.keystroke
    details = {}

    # No typing at all - could be paste attack or autofill
    if ks.total_keys < 2:
        details["reason"] = "No/minimal keystroke data (paste or autofill?)"
        return 0.20, details

    details["total_keys"] = ks.total_keys

    # --- Dwell time analysis ---
    if len(ks.dwell_times) > 2:
        avg_dwell = statistics.mean(ks.dwell_times)
        std_dwell = statistics.stdev(ks.dwell_times)
        details["avg_dwell_ms"] = round(avg_dwell, 1)
        details["std_dwell_ms"] = round(std_dwell, 1)

        # Human dwell times: 50-200ms with std > 15ms
        if 30 < avg_dwell < 300 and std_dwell > 10:
            dwell_score = 0.9
        elif avg_dwell < 10:
            dwell_score = 0.1  # Impossibly fast
        elif std_dwell < 5:
            dwell_score = 0.2  # Too uniform - bot
        else:
            dwell_score = 0.5
    else:
        dwell_score = 0.4
    details["dwell_score"] = round(dwell_score, 3)

    # --- Flight time analysis ---
    if len(ks.flight_times) > 2:
        avg_flight = statistics.mean(ks.flight_times)
        std_flight = statistics.stdev(ks.flight_times)
        details["avg_flight_ms"] = round(avg_flight, 1)
        details["std_flight_ms"] = round(std_flight, 1)

        # Human flight times: 80-400ms with std > 20ms
        if 50 < avg_flight < 500 and std_flight > 15:
            flight_score = 0.9
        elif avg_flight < 20:
            flight_score = 0.1  # Too fast
        elif std_flight < 5:
            flight_score = 0.15  # Too uniform
        else:
            flight_score = 0.5
    else:
        flight_score = 0.4
    details["flight_score"] = round(flight_score, 3)

    # Weighted combination
    final = 0.50 * dwell_score + 0.50 * flight_score
    return round(final, 4), details


# ──────────────────────────────────────────────
#  3. SESSION BEHAVIOR SCORER
# ──────────────────────────────────────────────

def score_session(payload: BehaviorPayload) -> tuple[float, dict]:
    """
    Humans spend 3-30 seconds on a login page. Bots submit in <500ms.
    """
    dwell_ms = payload.session.page_dwell_ms
    details = {"page_dwell_ms": round(dwell_ms)}

    if dwell_ms < 500:
        score = 0.05  # Almost certainly a bot
        details["reason"] = "Submitted in under 500ms - highly suspicious"
    elif dwell_ms < 1500:
        score = 0.3  # Suspicious
        details["reason"] = "Very fast submission"
    elif dwell_ms < 3000:
        score = 0.7  # Borderline
        details["reason"] = "Faster than typical human"
    elif dwell_ms < 60000:
        score = 0.95  # Normal human range
        details["reason"] = "Normal human interaction time"
    else:
        score = 0.7  # Too long might be idle tab
        details["reason"] = "Very long dwell - possibly idle tab"

    return round(score, 4), details


# ──────────────────────────────────────────────
#  4. BROWSER ENTROPY SCORER
# ──────────────────────────────────────────────

def score_entropy(payload: BehaviorPayload) -> tuple[float, dict]:
    """
    Canvas and AudioContext fingerprints are present in real browsers.
    Headless browsers (Puppeteer, Playwright) often fail these.
    """
    entropy = payload.entropy
    details = {}

    score = 0.5  # base
    if entropy.canvas_hash:
        score += 0.25
        details["canvas"] = "YES"
    else:
        details["canvas"] = "MISSING/BLOCKED"

    if entropy.audio_hash:
        score += 0.25
        details["audio"] = "YES"
    else:
        details["audio"] = "MISSING/BLOCKED"

    return round(score, 4), details


# ──────────────────────────────────────────────
#  5. TLS / USER-AGENT SCORER (Placeholder)
# ──────────────────────────────────────────────

def score_tls(payload: BehaviorPayload) -> tuple[float, dict]:
    """
    Placeholder for real JA4 TLS fingerprinting.
    Currently uses basic user-agent heuristics to detect obvious bots.
    """
    ua = payload.user_agent.lower()
    details = {"user_agent_snippet": payload.user_agent[:80]}

    # Known bot signatures in user-agent
    bot_keywords = ["headlesschrome", "phantomjs", "selenium", "puppeteer",
                    "playwright", "python-requests", "curl", "wget", "scrapy"]

    for keyword in bot_keywords:
        if keyword in ua:
            details["reason"] = f"Bot keyword detected: {keyword}"
            return 0.05, details

    # Check for common real browser strings
    if "mozilla" in ua and ("chrome" in ua or "firefox" in ua or "safari" in ua):
        details["reason"] = "Standard browser user-agent"
        return 0.90, details

    details["reason"] = "Unusual user-agent"
    return 0.50, details


# ──────────────────────────────────────────────
#  ENSEMBLE SCORER
# ──────────────────────────────────────────────

# Weights from design.md
WEIGHTS = {
    "mouse": 0.30,
    "keystroke": 0.25,
    "tls": 0.25,
    "session": 0.10,
    "entropy": 0.10,
}

THRESHOLD_PASS = 0.85
THRESHOLD_FALLBACK = 0.60


def compute_verdict(payload: BehaviorPayload) -> dict:
    """
    Run all sub-scorers, combine with weighted ensemble, and return verdict.
    """
    mouse_score, mouse_details = score_mouse(payload)
    keystroke_score, keystroke_details = score_keystroke(payload)
    session_score, session_details = score_session(payload)
    entropy_score, entropy_details = score_entropy(payload)
    tls_score, tls_details = score_tls(payload)

    # Weighted ensemble
    confidence = (
        WEIGHTS["mouse"] * mouse_score +
        WEIGHTS["keystroke"] * keystroke_score +
        WEIGHTS["tls"] * tls_score +
        WEIGHTS["session"] * session_score +
        WEIGHTS["entropy"] * entropy_score
    )
    confidence = round(confidence, 4)

    # Decision
    if confidence >= THRESHOLD_PASS:
        decision = "PASS"
    elif confidence >= THRESHOLD_FALLBACK:
        decision = "FALLBACK"
    else:
        decision = "BLOCK"

    return {
        "confidence": confidence,
        "decision": decision,
        "breakdown": {
            "mouse_score": round(mouse_score, 3),
            "keystroke_score": round(keystroke_score, 3),
            "tls_score": round(tls_score, 3),
            "session_score": round(session_score, 3),
            "entropy_score": round(entropy_score, 3),
        },
        "details": {
            "mouse": mouse_details,
            "keystroke": keystroke_details,
            "session": session_details,
            "entropy": entropy_details,
            "tls": tls_details,
        },
    }

"""
ML Authentication Portal - FastAPI Backend

Receives behavioral data from the React frontend, runs ML-based heuristic
scoring, and returns a confidence verdict. Displays rich terminal output
showing incoming data and ML results for demo purposes.

Run: python -m uvicorn main:app --reload --port 8000
"""

import os
import sys
import uuid
from datetime import datetime

# Fix Windows console encoding for rich output
if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box

from models import BehaviorPayload, VerifyResponse, ScoreBreakdown
from scoring import compute_verdict

# ──────────────────────────────────────────────
#  APP SETUP
# ──────────────────────────────────────────────

app = FastAPI(
    title="Secura Portal - ML Authentication API",
    description="Invisible CAPTCHA using behavioral ML",
    version="1.0.0",
)

# Allow the Vite dev server to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

console = Console(force_terminal=True)
request_counter = 0


# ──────────────────────────────────────────────
#  TERMINAL DISPLAY
# ──────────────────────────────────────────────

def print_startup_banner():
    banner_text = (
        "[bold cyan]=================================================[/]\n"
        "[bold white on blue]    SECURA PORTAL  -  ML Auth Engine    [/]\n"
        "[dim]  Invisible CAPTCHA via Behavioral Biometrics[/]\n"
        "[green]  Listening on http://localhost:8000[/]\n"
        "[dim]  Waiting for frontend requests...[/]\n"
        "[bold cyan]=================================================[/]"
    )
    console.print(Panel(banner_text, border_style="cyan", title="[bold]SECURA[/]"))
    console.print()


def print_incoming_data(req_num: int, payload: BehaviorPayload):
    """Print a summary of the incoming behavioral data."""

    table = Table(
        title=f"[INCOMING] REQUEST #{req_num}  |  {datetime.now().strftime('%H:%M:%S')}",
        box=box.ROUNDED,
        title_style="bold white on blue",
        border_style="blue",
        show_header=True,
        header_style="bold cyan",
        expand=False,
        min_width=55,
    )
    table.add_column("Signal", style="bold", width=18)
    table.add_column("Data Summary", width=40)

    # Mouse summary
    pts = len(payload.mouse.points)
    mouse_info = f"{pts} points captured"
    if pts > 0:
        mouse_info += f"\n  Straightness: {payload.mouse.path_straightness:.3f}"
        if payload.mouse.velocities:
            avg_vel = sum(payload.mouse.velocities) / len(payload.mouse.velocities)
            mouse_info += f"\n  Avg velocity: {avg_vel:.2f} px/ms"
    table.add_row("[Mouse]", mouse_info)

    # Keystroke summary
    ks = payload.keystroke
    ks_info = f"{ks.total_keys} keys pressed"
    if ks.dwell_times:
        avg_dwell = sum(ks.dwell_times) / len(ks.dwell_times)
        ks_info += f"\n  Avg dwell: {avg_dwell:.0f}ms"
    if ks.flight_times:
        avg_flight = sum(ks.flight_times) / len(ks.flight_times)
        ks_info += f"\n  Avg flight: {avg_flight:.0f}ms"
    table.add_row("[Keystroke]", ks_info)

    # Session
    table.add_row("[Session]", f"Page dwell: {payload.session.page_dwell_ms:.0f}ms")

    # Entropy
    canvas = "YES" if payload.entropy.canvas_hash else "BLOCKED"
    audio = "YES" if payload.entropy.audio_hash else "BLOCKED"
    table.add_row("[Entropy]", f"Canvas: {canvas}  |  Audio: {audio}")

    # User-Agent
    ua_short = payload.user_agent[:60] + "..." if len(payload.user_agent) > 60 else payload.user_agent
    table.add_row("[User-Agent]", ua_short)

    console.print()
    console.print(table)


def print_ml_result(req_num: int, verdict: dict, request_id: str):
    """Print the ML scoring result with color-coded scores."""

    breakdown = verdict["breakdown"]
    details = verdict["details"]
    confidence = verdict["confidence"]
    decision = verdict["decision"]

    # Score table
    table = Table(
        title=f"[ML SCORING] RESULT #{req_num}",
        box=box.ROUNDED,
        title_style="bold white on magenta",
        border_style="magenta",
        show_header=True,
        header_style="bold magenta",
        expand=False,
        min_width=55,
    )
    table.add_column("Model", style="bold", width=14)
    table.add_column("Score", width=8, justify="center")
    table.add_column("Weight", width=6, justify="center")
    table.add_column("Analysis", width=30)

    def score_color(score: float) -> str:
        if score >= 0.8:
            return "bold green"
        elif score >= 0.6:
            return "bold yellow"
        else:
            return "bold red"

    # Mouse
    ms = breakdown["mouse_score"]
    mouse_detail = details.get("mouse", {})
    mouse_analysis = mouse_detail.get("reason", f"vel={mouse_detail.get('velocity_score', '?')} curv={mouse_detail.get('curvature_score', '?')}")
    table.add_row("Mouse", Text(f"{ms:.3f}", style=score_color(ms)), "0.30", str(mouse_analysis)[:30])

    # Keystroke
    ks = breakdown["keystroke_score"]
    ks_detail = details.get("keystroke", {})
    ks_analysis = ks_detail.get("reason", f"dwell={ks_detail.get('dwell_score', '?')} flight={ks_detail.get('flight_score', '?')}")
    table.add_row("Keystroke", Text(f"{ks:.3f}", style=score_color(ks)), "0.25", str(ks_analysis)[:30])

    # TLS
    ts = breakdown["tls_score"]
    tls_detail = details.get("tls", {})
    tls_analysis = tls_detail.get("reason", "N/A")
    table.add_row("TLS/UA", Text(f"{ts:.3f}", style=score_color(ts)), "0.25", str(tls_analysis)[:30])

    # Session
    ss = breakdown["session_score"]
    sess_detail = details.get("session", {})
    sess_analysis = sess_detail.get("reason", "N/A")
    table.add_row("Session", Text(f"{ss:.3f}", style=score_color(ss)), "0.10", str(sess_analysis)[:30])

    # Entropy
    es = breakdown["entropy_score"]
    ent_detail = details.get("entropy", {})
    ent_analysis = f"Canvas: {ent_detail.get('canvas', '?')} Audio: {ent_detail.get('audio', '?')}"
    table.add_row("Entropy", Text(f"{es:.3f}", style=score_color(es)), "0.10", str(ent_analysis)[:30])

    console.print(table)

    # Final verdict panel
    if decision == "PASS":
        style = "bold white on green"
        border = "green"
        msg = "HUMAN VERIFIED - Access Granted (No CAPTCHA needed)"
    elif decision == "FALLBACK":
        style = "bold black on yellow"
        border = "yellow"
        msg = "LOW CONFIDENCE - Slide to Verify challenge triggered"
    else:
        style = "bold white on red"
        border = "red"
        msg = "BOT DETECTED - Access Denied"

    verdict_text = Text()
    verdict_text.append(f"\n  DECISION: {decision}\n", style=style)
    verdict_text.append(f"  Confidence: {confidence:.4f}\n", style="bold")
    verdict_text.append(f"  Weighted formula: ", style="dim")
    verdict_text.append(
        f"0.30x{breakdown['mouse_score']:.3f} + "
        f"0.25x{breakdown['keystroke_score']:.3f} + "
        f"0.25x{breakdown['tls_score']:.3f} + "
        f"0.10x{breakdown['session_score']:.3f} + "
        f"0.10x{breakdown['entropy_score']:.3f}\n",
        style="dim",
    )
    verdict_text.append(f"  Request ID: {request_id}\n", style="dim")
    verdict_text.append(f"  {msg}\n", style="bold")

    console.print(Panel(verdict_text, border_style=border, title="[FINAL VERDICT]", title_align="left"))
    console.print("-" * 60, style="dim")


# ──────────────────────────────────────────────
#  API ENDPOINTS
# ──────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    print_startup_banner()


@app.get("/")
async def root():
    return {
        "service": "Secura Portal ML Authentication API",
        "status": "running",
        "endpoints": {
            "POST /api/verify": "Submit behavioral data for ML scoring",
        },
    }


@app.post("/api/verify", response_model=VerifyResponse)
async def verify_behavior(payload: BehaviorPayload):
    global request_counter
    request_counter += 1
    request_id = str(uuid.uuid4())

    # Run ML scoring engine
    verdict = compute_verdict(payload)

    # Print to terminal (wrapped in try/except so printing errors never break the API)
    try:
        print_incoming_data(request_counter, payload)
        print_ml_result(request_counter, verdict, request_id)
    except Exception as e:
        # Fallback: plain print if rich fails on Windows
        print(f"\n=== REQUEST #{request_counter} ===")
        print(f"  Mouse points: {len(payload.mouse.points)}")
        print(f"  Keystroke keys: {payload.keystroke.total_keys}")
        print(f"  Page dwell: {payload.session.page_dwell_ms:.0f}ms")
        print(f"  Confidence: {verdict['confidence']}")
        print(f"  Decision: {verdict['decision']}")
        print(f"  Breakdown: {verdict['breakdown']}")
        print(f"  (Rich output failed: {e})")
        print(f"========================\n")

    # Return response to frontend
    return VerifyResponse(
        confidence=verdict["confidence"],
        decision=verdict["decision"],
        breakdown=ScoreBreakdown(**verdict["breakdown"]),
        request_id=request_id,
    )


@app.get("/health")
async def health():
    return {"status": "healthy", "requests_processed": request_counter}

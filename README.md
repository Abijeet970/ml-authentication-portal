# Secura Portal - ML Authentication
> **Invisible CAPTCHA using Behavioral Biometrics**

Secura Portal is an advanced ML Authentication System that replaces traditional CAPTCHAs with invisible, continuous behavioral analysis. By capturing micro-interactions—how you move your mouse, the rhythm of your typing, and your browser's unique signature—Secura distinguishes human users from automated bots in real-time.

---

## 🚀 Key Features

* **Invisible Behavioral Tracking**: Silently collects telemetry data using a custom `useBehaviorTracker` React hook without interrupting the user experience.
* **Heuristic ML Scoring Engine**: A sophisticated Python backend that calculates a "Human Confidence Score" (0.0 to 1.0) using an ensemble model.
* **Dynamic Adaptive Authentication**:
  * **PASS** (Score $\ge$ 0.85): Direct entry to Dashboard.
  * **FALLBACK** (Score 0.60 - 0.84): Presents a frictionless Slide-to-Verify modal challenge.
  * **BLOCK** (Score $\lt$ 0.60): Access is immediately denied.
* **Live Terminal Telemetry**: Provides a stunning `Rich`-powered terminal output in the backend, visualizing incoming behavioral signals and model breakdown scores in real-time.

---

## 🧠 Behavioral Signals Analyzed (Ensemble Model)

1. **Mouse Dynamics (30%)**: Analyzes velocity variance, path curvature, and straightness. (Bots draw straight lines; humans jitter).
2. **Keystroke Dynamics (25%)**: Measures flight times (key-to-key) and dwell times (key hold length). 
3. **TLS / User-Agent (25%)**: Heuristic detection of headless browsers, automation tools (Puppeteer, Selenium), and signature matching.
4. **Session Behavior (10%)**: Measures page dwell time before form submission.
5. **Browser Entropy (10%)**: Validates the presence of native Canvas and Audio Context hashes to catch headless environments.

---

## 🛠 Tech Stack

**Frontend**
* React 19 + TypeScript
* Vite (Lightning-fast HMR)
* Tailwind CSS 3.4
* ESLint 9

**Backend**
* Python 3
* FastAPI (High-performance API)
* Uvicorn (ASGI web server)
* Rich (Beautiful terminal formatting)

---

## 💻 Local Setup & Installation

### 1. Start the Backend API
Navigate to the `backend` directory, install the Python dependencies, and run the Uvicorn server:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*The backend will start and listen on `http://localhost:8000`.*

### 2. Start the Frontend App
Open a new terminal at the project root, install Node dependencies, and start Vite:
```bash
npm install
npm run dev
```
*The frontend will start on your localhost (usually `http://localhost:5173`).*

---

## 🎮 Usage & Demo

1. Open the frontend in your browser.
2. Type in the email and password fields, and move your mouse around normally to generate human-like telemetry data.
3. Click "Authenticate".
4. **Watch your Backend Terminal**: The FastAPI server will output a detailed table containing the signals received, your ML score breakdown, and the final access decision!

**Debug Mode:** You can force the application to test the Fallback or Block thresholds by running the following in your browser's Developer Console:
```javascript
// Force low confidence (Trigger Fallback)
window.setMlConfidence(0.65);

// Force bot confidence (Trigger Block)
window.setMlConfidence(0.10);
```

---

*Built with ❤️ for a frictionless, secure web.*

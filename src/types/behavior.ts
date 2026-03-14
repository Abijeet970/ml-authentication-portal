/**
 * Behavioral data types for ML-based bot detection.
 * 
 * PRIVACY NOTES:
 * - MouseData: pure positional data, no PII
 * - KeystrokeData: timing only — NO key values are ever recorded
 * - EntropyData: hashed fingerprints, not raw canvas/audio data
 */

// --- Mouse Dynamics ---

export interface MousePoint {
  x: number;
  y: number;
  t: number; // timestamp in ms (performance.now())
}

export interface MouseData {
  points: MousePoint[];
  velocities: number[];
  curvatures: number[];
  path_straightness: number; // ratio of direct distance to total path length
}

// --- Keystroke Dynamics ---

export interface KeystrokeData {
  flight_times: number[]; // ms between consecutive keydown events
  dwell_times: number[];  // ms each key was held (keyup - keydown)
  total_keys: number;     // count of keys pressed (NOT which keys)
}

// --- Session Behavior ---

export interface SessionData {
  page_load_ts: number;   // performance.now() at page mount
  submit_ts: number;      // performance.now() at Login click
  page_dwell_ms: number;  // submit_ts - page_load_ts
}

// --- Browser Entropy ---

export interface EntropyData {
  canvas_hash: string | null; // SHA-256 hex, or null if blocked
  audio_hash: string | null;  // SHA-256 hex, or null if blocked
}

// --- Full Payload ---

export interface BehaviorPayload {
  mouse: MouseData;
  keystroke: KeystrokeData;
  session: SessionData;
  entropy: EntropyData;
  user_agent: string;
}

// --- Backend Response ---

export interface VerifyResponse {
  confidence: number;
  decision: 'PASS' | 'FALLBACK' | 'BLOCK';
  breakdown: {
    mouse_score: number;
    keystroke_score: number;
    tls_score: number;
    session_score: number;
    entropy_score: number;
  };
  request_id: string;
}

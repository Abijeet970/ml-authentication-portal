/**
 * API Service for ML Authentication Portal
 * 
 * Communicates with the FastAPI backend to verify behavioral data.
 * Falls back gracefully if backend is unreachable (for demo flexibility).
 */

import type { BehaviorPayload, VerifyResponse } from '../types/behavior';

const API_BASE = 'http://localhost:8000';

/**
 * Send behavioral data to the backend for ML verification.
 * 
 * If the backend is unreachable (Phase 3 not yet deployed),
 * returns a mock high-confidence response so the frontend flow
 * still works for UI development and demo.
 */
export async function verifyBehavior(payload: BehaviorPayload): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return await response.json() as VerifyResponse;
  } catch (error) {
    console.warn(
      '[Secura] Backend unreachable — using mock response.',
      'Start the FastAPI backend on port 8000 for real ML scoring.',
      error
    );

    // Mock response for when backend isn't running
    return createMockResponse(payload);
  }
}

/**
 * Generate a mock verification response based on simple heuristics.
 * This is used when the backend isn't available yet.
 * 
 * It applies basic statistical checks to give somewhat realistic scores:
 * - More mouse points → higher mouse score
 * - More keystroke data → higher keystroke score
 * - Longer page dwell → higher session score
 */
function createMockResponse(payload: BehaviorPayload): VerifyResponse {
  // Simple heuristic scoring based on data volume and characteristics
  const mouseScore = Math.min(1.0, payload.mouse.points.length / 50) * 0.6 + 0.4;
  
  const hasKeystrokeData = payload.keystroke.total_keys > 3;
  const avgDwell = hasKeystrokeData
    ? payload.keystroke.dwell_times.reduce((a, b) => a + b, 0) / payload.keystroke.dwell_times.length
    : 0;
  // Human dwell times are typically 50-200ms; bots are either 0 or very uniform
  const keystrokeScore = hasKeystrokeData && avgDwell > 30 && avgDwell < 300 ? 0.85 : 0.3;

  const sessionScore = payload.session.page_dwell_ms > 2000 ? 0.9 : 0.2;
  const entropyScore = payload.entropy.canvas_hash ? 1.0 : 0.5;
  const tlsScore = 0.9; // Can't assess TLS from frontend

  const confidence = 
    0.30 * mouseScore +
    0.25 * keystrokeScore +
    0.25 * tlsScore +
    0.10 * sessionScore +
    0.10 * entropyScore;

  const decision: VerifyResponse['decision'] =
    confidence >= 0.85 ? 'PASS' :
    confidence >= 0.60 ? 'FALLBACK' : 'BLOCK';

  return {
    confidence: Math.round(confidence * 1000) / 1000,
    decision,
    breakdown: {
      mouse_score: Math.round(mouseScore * 1000) / 1000,
      keystroke_score: Math.round(keystrokeScore * 1000) / 1000,
      tls_score: tlsScore,
      session_score: Math.round(sessionScore * 1000) / 1000,
      entropy_score: entropyScore,
    },
    request_id: `mock-${Date.now()}`,
  };
}

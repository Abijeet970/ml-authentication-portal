/**
 * useBehaviorTracker — Core behavioral data collection hook
 * 
 * Attaches mouse/keystroke/session listeners on mount and provides
 * a `collectPayload()` function that assembles the full BehaviorPayload
 * for ML scoring when the user clicks Login.
 * 
 * This hook is the bridge between the React UI and the data collection
 * utilities. It manages the lifecycle of all trackers.
 */

import { useEffect, useRef, useCallback } from 'react';
import { MouseTracker } from '../utils/mouseTracker';
import { KeystrokeTracker } from '../utils/keystrokeTracker';
import { collectEntropy } from '../utils/entropyCollector';
import type { BehaviorPayload } from '../types/behavior';

export function useBehaviorTracker() {
  const mouseTracker = useRef(new MouseTracker());
  const keystrokeTracker = useRef(new KeystrokeTracker());
  const pageLoadTime = useRef(performance.now());

  useEffect(() => {
    const mouse = mouseTracker.current;
    const keys = keystrokeTracker.current;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.record(e.clientX, e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // PRIVACY: we use e.code (e.g., "KeyA") only as a map key
      // to pair keydown/keyup events. We never record e.key (the character).
      if (!e.repeat) {
        keys.onKeyDown(e.code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.onKeyUp(e.code);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('keyup', handleKeyUp, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * Collect the full behavioral payload for ML verification.
   * Call this when the user clicks "Log In".
   */
  const collectPayload = useCallback(async (): Promise<BehaviorPayload> => {
    const submitTime = performance.now();
    const pageDwell = submitTime - pageLoadTime.current;

    // Collect all data in parallel where possible
    const [entropy] = await Promise.all([collectEntropy()]);

    const payload: BehaviorPayload = {
      mouse: mouseTracker.current.getData(),
      keystroke: keystrokeTracker.current.getData(),
      session: {
        page_load_ts: pageLoadTime.current,
        submit_ts: submitTime,
        page_dwell_ms: Math.round(pageDwell),
      },
      entropy,
      user_agent: navigator.userAgent,
    };

    // Log payload summary for debugging and demo
    console.log(
      '%c[Secura] Behavioral Payload Collected',
      'color: #2563eb; font-weight: bold;',
      {
        mousePoints: payload.mouse.points.length,
        pathStraightness: payload.mouse.path_straightness.toFixed(3),
        keystrokeEvents: payload.keystroke.total_keys,
        avgFlightTime: payload.keystroke.flight_times.length > 0
          ? `${Math.round(payload.keystroke.flight_times.reduce((a, b) => a + b, 0) / payload.keystroke.flight_times.length)}ms`
          : 'N/A',
        avgDwellTime: payload.keystroke.dwell_times.length > 0
          ? `${Math.round(payload.keystroke.dwell_times.reduce((a, b) => a + b, 0) / payload.keystroke.dwell_times.length)}ms`
          : 'N/A',
        pageDwellMs: payload.session.page_dwell_ms,
        canvasEntropy: payload.entropy.canvas_hash ? '✓' : '✗ (blocked)',
        audioEntropy: payload.entropy.audio_hash ? '✓' : '✗ (blocked)',
      }
    );

    return payload;
  }, []);

  return { collectPayload };
}

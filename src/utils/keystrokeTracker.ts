/**
 * Keystroke Dynamics Tracker
 * 
 * Captures typing rhythm for ML-based bot detection:
 * - Flight time: interval between consecutive keydown events
 * - Dwell time: how long each key is held (keyup - keydown)
 * 
 * PRIVACY CRITICAL:
 * - We use `event.code` as a MAP KEY ONLY (e.g., "KeyA") to match keydown→keyup pairs
 * - We NEVER record `event.key` (the actual character typed)
 * - We NEVER store which code was pressed — only the timing
 * - This cannot reconstruct what was typed; it is NOT a keylogger
 */

import type { KeystrokeData } from '../types/behavior';

export class KeystrokeTracker {
  // Map from event.code → keydown timestamp (for computing dwell time)
  private activeKeys: Map<string, number> = new Map();

  private dwellTimes: number[] = [];
  private flightTimes: number[] = [];
  private lastKeydownTime: number | null = null;
  private totalKeys = 0;

  /**
   * Handle keydown event. Records timestamp for dwell calculation
   * and computes flight time from previous keydown.
   */
  onKeyDown(code: string): void {
    const now = performance.now();

    // Ignore repeat events (key held down)
    if (this.activeKeys.has(code)) return;

    this.activeKeys.set(code, now);
    this.totalKeys++;

    // Compute flight time from previous keydown
    if (this.lastKeydownTime !== null) {
      const flight = now - this.lastKeydownTime;
      this.flightTimes.push(Math.round(flight));
    }
    this.lastKeydownTime = now;
  }

  /**
   * Handle keyup event. Computes dwell time for the released key.
   */
  onKeyUp(code: string): void {
    const now = performance.now();
    const downTime = this.activeKeys.get(code);

    if (downTime !== undefined) {
      const dwell = now - downTime;
      this.dwellTimes.push(Math.round(dwell));
      this.activeKeys.delete(code);
    }
  }

  /**
   * Get the full keystroke dynamics data package.
   */
  getData(): KeystrokeData {
    return {
      flight_times: [...this.flightTimes],
      dwell_times: [...this.dwellTimes],
      total_keys: this.totalKeys,
    };
  }

  /**
   * Reset all collected data.
   */
  reset(): void {
    this.activeKeys.clear();
    this.dwellTimes = [];
    this.flightTimes = [];
    this.lastKeydownTime = null;
    this.totalKeys = 0;
  }
}

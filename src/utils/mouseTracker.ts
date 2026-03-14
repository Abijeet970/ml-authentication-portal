/**
 * Mouse Dynamics Tracker
 * 
 * Captures mouse movement data and computes features for ML scoring:
 * - Raw X/Y/timestamp points (throttled to ~16ms intervals)
 * - Instantaneous velocities between consecutive points
 * - Path curvature using 3-point angle calculation
 * - Path straightness index (direct distance / total path length)
 * 
 * PRIVACY: Pure positional data, no PII.
 */

import type { MousePoint, MouseData } from '../types/behavior';

const THROTTLE_MS = 16; // ~60fps capture rate

export class MouseTracker {
  private points: MousePoint[] = [];
  private lastRecordTime = 0;

  /**
   * Record a mouse position. Automatically throttles to ~60fps.
   */
  record(x: number, y: number): void {
    const now = performance.now();
    if (now - this.lastRecordTime < THROTTLE_MS) return;
    this.lastRecordTime = now;
    this.points.push({ x, y, t: now });
  }

  /**
   * Compute velocity between two consecutive points.
   */
  private computeVelocity(p1: MousePoint, p2: MousePoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dt = p2.t - p1.t;
    if (dt === 0) return 0;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance / dt; // pixels per ms
  }

  /**
   * Compute curvature at point B given three consecutive points A, B, C.
   * Uses the angle between vectors AB and BC.
   * Returns value in radians (0 = straight, π = reversal).
   */
  private computeCurvature(a: MousePoint, b: MousePoint, c: MousePoint): number {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const bcx = c.x - b.x;
    const bcy = c.y - b.y;

    const dot = abx * bcx + aby * bcy;
    const magAB = Math.sqrt(abx * abx + aby * aby);
    const magBC = Math.sqrt(bcx * bcx + bcy * bcy);

    if (magAB === 0 || magBC === 0) return 0;

    const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magBC)));
    return Math.acos(cosAngle);
  }

  /**
   * Compute path straightness: ratio of direct start→end distance to total path length.
   * A perfectly straight path = 1.0, a very curvy path → 0.0
   */
  private computePathStraightness(): number {
    if (this.points.length < 2) return 1.0;

    const first = this.points[0];
    const last = this.points[this.points.length - 1];
    const directDistance = Math.sqrt(
      (last.x - first.x) ** 2 + (last.y - first.y) ** 2
    );

    let totalPathLength = 0;
    for (let i = 1; i < this.points.length; i++) {
      const dx = this.points[i].x - this.points[i - 1].x;
      const dy = this.points[i].y - this.points[i - 1].y;
      totalPathLength += Math.sqrt(dx * dx + dy * dy);
    }

    if (totalPathLength === 0) return 1.0;
    return Math.min(1.0, directDistance / totalPathLength);
  }

  /**
   * Get the full mouse dynamics data package.
   */
  getData(): MouseData {
    const velocities: number[] = [];
    const curvatures: number[] = [];

    for (let i = 1; i < this.points.length; i++) {
      velocities.push(this.computeVelocity(this.points[i - 1], this.points[i]));
    }

    for (let i = 1; i < this.points.length - 1; i++) {
      curvatures.push(
        this.computeCurvature(this.points[i - 1], this.points[i], this.points[i + 1])
      );
    }

    return {
      points: this.points,
      velocities,
      curvatures,
      path_straightness: this.computePathStraightness(),
    };
  }

  /**
   * Reset all collected data.
   */
  reset(): void {
    this.points = [];
    this.lastRecordTime = 0;
  }

  /**
   * Get the number of recorded points.
   */
  get pointCount(): number {
    return this.points.length;
  }
}

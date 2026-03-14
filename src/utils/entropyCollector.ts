/**
 * Browser Entropy Collector
 * 
 * Generates fingerprint hashes from Canvas API and AudioContext to detect
 * headless browsers and spoofed environments.
 * 
 * PRIVACY SAFEGUARDS:
 * - All operations wrapped in try/catch — returns null if blocked by
 *   privacy browsers (Brave, Tor, Firefox with resistFingerprinting)
 * - Only SHA-256 hashes are stored, never raw rendering data
 * - Canvas and audio data are immediately discarded after hashing
 */

import type { EntropyData } from '../types/behavior';

/**
 * Compute SHA-256 hash of a string, returned as hex.
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a Canvas API fingerprint hash.
 * 
 * Draws text and shapes on an offscreen canvas, then hashes the resulting
 * pixel data. Different browsers/GPUs produce slightly different renderings,
 * making this useful for detecting spoofed or headless environments.
 */
async function getCanvasHash(): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw text with specific font rendering
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Secura Portal ✈', 2, 15);

    // Draw shapes for additional entropy
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(50, 25, 15, 0, Math.PI * 2);
    ctx.fill();

    // Hash the canvas data
    const dataUrl = canvas.toDataURL();
    return await sha256(dataUrl);
  } catch {
    // Privacy browser blocked Canvas — return null gracefully
    return null;
  }
}

/**
 * Generate an AudioContext fingerprint hash.
 * 
 * Creates an oscillator connected to an analyser, processes a small buffer
 * of float frequency data, and hashes the result. Different audio stacks
 * produce slightly different outputs.
 */
async function getAudioHash(): Promise<string | null> {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();

    // Configure the audio graph
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);
    gain.gain.setValueAtTime(0, context.currentTime); // silent
    
    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(context.destination);

    oscillator.start(0);

    // Wait a tiny bit for the oscillator to produce data
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture frequency data
    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(frequencyData);

    // Clean up
    oscillator.stop();
    await context.close();

    // Hash the float array
    const dataString = frequencyData.slice(0, 30).join(',');
    return await sha256(dataString);
  } catch {
    // Privacy browser blocked AudioContext — return null gracefully
    return null;
  }
}

/**
 * Collect all browser entropy data.
 * Each signal independently falls back to null if blocked.
 */
export async function collectEntropy(): Promise<EntropyData> {
  const [canvas_hash, audio_hash] = await Promise.all([
    getCanvasHash(),
    getAudioHash(),
  ]);

  return { canvas_hash, audio_hash };
}

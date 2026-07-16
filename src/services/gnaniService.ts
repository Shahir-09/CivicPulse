/**
 * gnaniService.ts — Utility helpers for Gnani.ai STT integration.
 *
 * The actual real-time transcription is handled via WebSocket directly
 * in the useGnaniVoice hook. This file provides helper utilities only.
 */

/**
 * Checks if Gnani.ai STT integration is enabled via environment config.
 */
export function isGnaniEnabled(): boolean {
  return import.meta.env.VITE_GNANI_CONFIGURED === 'true';
}

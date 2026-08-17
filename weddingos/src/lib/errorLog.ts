import { readJSON, writeJSON, STORAGE_KEYS } from './storage';
import { APP_VERSION } from './appVersion';

/**
 * Section 47/49: WeddingOS ships no external analytics or monitoring
 * (no Google Analytics, Mixpanel, Sentry, PostHog, etc.) — this is the
 * privacy-preserving alternative: a small, bounded, purely local error
 * log the user can view, export, or clear themselves. Never sent
 * anywhere automatically.
 */
export type ErrorLogCategory = 'render' | 'unhandled' | 'network' | 'sync' | 'other';

export interface ErrorLogEntry {
  timestamp: string;
  appVersion: string;
  route: string;
  category: ErrorLogCategory;
  message: string;
  /** Only the stack trace in dev; in production builds this is intentionally omitted to avoid leaking internal paths in an exported diagnostic file. */
  stack?: string;
  mode: 'local' | 'supabase';
  onlineStatus: boolean;
}

const MAX_ENTRIES = 100;
const listeners = new Set<() => void>();

function readEntries(): ErrorLogEntry[] {
  return readJSON<ErrorLogEntry[]>(STORAGE_KEYS.errorLog, []);
}

function writeEntries(entries: ErrorLogEntry[]): void {
  writeJSON(STORAGE_KEYS.errorLog, entries);
  for (const listener of listeners) listener();
}

export function getErrorLog(): ErrorLogEntry[] {
  return readEntries();
}

export function onErrorLogChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function logError(params: { category: ErrorLogCategory; message: string; stack?: string; mode: 'local' | 'supabase' }): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    route: window.location.hash || window.location.pathname,
    category: params.category,
    message: params.message,
    stack: import.meta.env.DEV ? params.stack : undefined,
    mode: params.mode,
    onlineStatus: navigator.onLine,
  };
  const next = [...readEntries(), entry].slice(-MAX_ENTRIES);
  writeEntries(next);
}

export function clearErrorLog(): void {
  writeEntries([]);
}

export function exportErrorLogText(): string {
  return JSON.stringify(getErrorLog(), null, 2);
}

// Robust (de)serialization of GameState to/from localStorage: validates shape rather than trusting a cast,
// since stored JSON can predate schema changes or be edited/corrupted outside the app.
import { GameState } from './types';

const STORAGE_KEY = 'railway-empire-sheet:game-state';
const STORAGE_VERSION = 1;

export type StoredGameState = {
  version: typeof STORAGE_VERSION;
  state: GameState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const StoredGameState = {
  isInstance: (value: unknown): value is StoredGameState =>
    isRecord(value) && value.version === STORAGE_VERSION && GameState.isInstance(value.state),
} as const;

export function serializeGameState(state: GameState): string {
  const stored: StoredGameState = { version: STORAGE_VERSION, state };
  return JSON.stringify(stored);
}

export function deserializeGameState(json: string): GameState | undefined {
  try {
    const parsed: unknown = JSON.parse(json);
    return StoredGameState.isInstance(parsed) ? parsed.state : undefined;
  } catch {
    return undefined;
  }
}

export function loadGameStateFromStorage(): GameState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? undefined : deserializeGameState(raw);
  } catch {
    return undefined;
  }
}

export function saveGameStateToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeGameState(state));
  } catch {
    // localStorage may be unavailable (e.g. private browsing quota); persistence is best-effort
  }
}

export function clearStoredGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best-effort, see saveGameStateToStorage
  }
}

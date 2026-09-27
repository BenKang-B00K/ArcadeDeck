/**
 * Firestore circuit breaker.
 *
 * On `resource-exhausted` (daily quota) or `unavailable` errors, flip a flag in
 * localStorage and short-circuit subsequent Firestore calls for COOLDOWN_MS so
 * the app degrades to cached/empty results instead of spamming the API and
 * surfacing red errors to users.
 */

const CIRCUIT_KEY = 'arcadedeck_firestore_circuit_open_until';
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

interface FirestoreLikeError {
  code?: string;
  name?: string;
  message?: string;
}

export function isQuotaError(err: unknown): boolean {
  const e = err as FirestoreLikeError | null | undefined;
  if (!e) return false;
  if (e.code === 'resource-exhausted') return true;
  if (e.code === 'unavailable') return true;
  if (typeof e.message === 'string' && /quota|resource-exhausted|unavailable/i.test(e.message)) return true;
  return false;
}

export function circuitOpen(): boolean {
  try {
    const raw = localStorage.getItem(CIRCUIT_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (Number.isFinite(until) && Date.now() < until) return true;
    localStorage.removeItem(CIRCUIT_KEY);
  } catch { /* private mode — fail safe to closed */ }
  return false;
}

export function openCircuit(): void {
  try {
    localStorage.setItem(CIRCUIT_KEY, String(Date.now() + COOLDOWN_MS));
    console.warn('[firestore] quota exhausted — circuit open for 1h, serving cached/empty data');
  } catch { /* ignore */ }
}

/**
 * Wrap a Firestore read. If the circuit is open or a quota error fires,
 * returns `fallback` instead of throwing. Other errors still throw.
 */
export async function safeRead<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (circuitOpen()) return fallback;
  try {
    return await fn();
  } catch (err) {
    if (isQuotaError(err)) openCircuit();
    // Reads are best-effort: any failure (quota, missing index, offline) degrades to fallback.
    else console.warn('[firestore] read failed', err);
    return fallback;
  }
}

export interface SafeWriteResult {
  ok: boolean;
  quotaExhausted?: boolean;
  error?: unknown;
}

/**
 * Wrap a Firestore write. On quota exhaustion, opens the circuit and returns
 * `{ ok: false, quotaExhausted: true }` so the caller can show a friendly
 * "try again later" message instead of an unhandled rejection.
 */
export async function safeWrite<T>(fn: () => Promise<T>): Promise<SafeWriteResult & { value?: T }> {
  if (circuitOpen()) return { ok: false, quotaExhausted: true };
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (err) {
    if (isQuotaError(err)) {
      openCircuit();
      return { ok: false, quotaExhausted: true, error: err };
    }
    return { ok: false, error: err };
  }
}

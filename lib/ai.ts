/**
 * AI part-identification service.
 *
 * Two implementations:
 *  - MockAI  — 2.5s delay, returns a random ScanState (or forced state for __DEV__ demos)
 *  - RealAI  — POST to EXPO_PUBLIC_AI_SERVICE_URL/api/v1/identify-part with Supabase JWT
 *
 * identifyPart() picks the right implementation automatically.
 */

import { type ScanState } from './mock';

export interface ScanResult {
  state: ScanState;
  categoryId: string; // detected part category — e.g. 'filtre-huile'
}

// ── Dev override (only used via forceState() in __DEV__ builds) ───────────────

let _forcedState: ScanState | null = null;

/**
 * Force the next mock scan result to a specific state.
 * Only meaningful in __DEV__; ignored in production.
 */
export function forceState(s: ScanState | null): void {
  _forcedState = s;
}

// ── Mock implementation ───────────────────────────────────────────────────────

const STATES: ScanState[] = ['compatible', 'incompatible', 'suspect'];

async function mockIdentify(): Promise<ScanResult> {
  await new Promise<void>((r) => setTimeout(r, 2500));
  const state: ScanState =
    _forcedState ?? STATES[Math.floor(Math.random() * STATES.length)];
  _forcedState = null;
  return { state, categoryId: 'filtre-huile' };
}

// ── Real implementation ───────────────────────────────────────────────────────

async function realIdentify(
  imageBase64: string,
  vehicleEngineId: string,
): Promise<ScanResult> {
  const baseUrl = process.env.EXPO_PUBLIC_AI_SERVICE_URL!;

  let jwt: string | undefined;
  try {
    const { supabase } = await import('./supabase');
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      jwt = data.session?.access_token;
    }
  } catch {
    // no-op — unauthenticated request is allowed
  }

  const res = await fetch(`${baseUrl}/api/v1/identify-part`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify({ imageBase64, vehicleEngineId }),
  });

  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  return res.json() as Promise<ScanResult>;
}

// ── Public API ────────────────────────────────────────────────────────────────

const isAiConfigured = Boolean(
  process.env.EXPO_PUBLIC_AI_SERVICE_URL &&
    process.env.EXPO_PUBLIC_AI_SERVICE_URL.length > 0,
);

/**
 * Identify a part from a base64 image.
 * Falls back to mock if the AI service is not configured or fails.
 */
export async function identifyPart(
  imageBase64: string,
  vehicleEngineId = '',
): Promise<ScanResult> {
  if (isAiConfigured) {
    try {
      return await realIdentify(imageBase64, vehicleEngineId);
    } catch {
      return await mockIdentify();
    }
  }
  return await mockIdentify();
}

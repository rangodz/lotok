import { isSupabaseConfigured, supabase } from './supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sends a verification code to the given phone number.
 * Mock: always succeeds (no real SMS sent).
 * Real: calls supabase.auth.signInWithOtp({ phone }).
 */
export async function signInWithOtp(phone: string): Promise<AuthResult> {
  // Validate DZ format: 10 digits starting with 05/06/07
  if (!/^0[567]\d{8}$/.test(phone)) {
    return { success: false, error: 'invalid_phone' };
  }

  if (isSupabaseConfigured && supabase) {
    const international = '+213' + phone.slice(1);
    const { error } = await supabase.auth.signInWithOtp({ phone: international });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Mock fallback
  await new Promise((r) => setTimeout(r, 800));
  return { success: true };
}

/**
 * Verifies the OTP code.
 * Mock: only "000000" is accepted.
 * Real: calls supabase.auth.verifyOtp({ phone, token, type: 'sms' }).
 */
export async function verifyOtp(phone: string, code: string): Promise<AuthResult> {
  if (isSupabaseConfigured && supabase) {
    const international = '+213' + phone.slice(1);
    const { error } = await supabase.auth.verifyOtp({
      phone: international,
      token: code,
      type: 'sms',
    });
    if (error) return { success: false, error: 'wrong_code' };
    return { success: true };
  }

  // Mock fallback
  await new Promise((r) => setTimeout(r, 600));
  if (code === '000000') return { success: true };
  return { success: false, error: 'wrong_code' };
}

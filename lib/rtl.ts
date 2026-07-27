import { I18nManager } from 'react-native';

/** True when the app is running in RTL mode (Arabic). */
export const isRTL = I18nManager.isRTL;

/**
 * Returns ltrValue normally; rtlValue when the UI direction is RTL.
 * Useful for swapping icons (ChevronRight ↔ ChevronLeft) and numeric offsets.
 */
export function rtlFlip<T>(ltrValue: T, rtlValue: T): T {
  return isRTL ? rtlValue : ltrValue;
}

/**
 * Text style for content that must always render LTR regardless of app direction
 * (OEM codes, part references, prices).
 */
export const ltrText = {
  writingDirection: 'ltr' as const,
  textAlign: 'left' as const,
};

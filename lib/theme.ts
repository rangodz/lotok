/**
 * Lotok Design System — tokens
 * Source : 01_BRAND_BIBLE.md
 */

import { StyleSheet } from 'react-native';

export const colors = {
  // Brand
  karto: '#1E3A8A',
  kartoLight: '#3B5BDB',
  orange: '#F97316',
  orangeLight: '#FB923C',
  orangeDeep: '#C2410C',

  // Semantic
  success: '#10B981',
  successBg: '#D1FAE5',
  successDeep: '#047857',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  dangerDeep: '#B91C1C',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  warningDeep: '#92400E',
  greenAction: '#22C55E',    // green-500 — WhatsApp / action green

  // Extended brand palette
  kartoSurface: '#EEF2FF',   // indigo-50 — icon bgs, active state fills
  kartoPale: '#A5B4FC',      // indigo-300 — decorative text on karto bg
  kartoNote: '#C7D2FE',      // indigo-200 — note text on karto bg

  // Neutrals
  white: '#FFFFFF',
  bg: '#F8FAFC',
  surface: '#F1F5F9',
  border: '#E2E8F0',
  textMuted: '#94A3B8',
  textSecondary: '#475569',
  textPrimary: '#0F172A',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fonts = {
  display: 'Sora_700Bold',
  heading: 'Sora_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const typography = {
  displayL: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42 },
  h1: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.bodySemiBold, fontSize: 18, lineHeight: 24 },
  bodyL: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  tiny: { fontFamily: fonts.bodySemiBold, fontSize: 10, lineHeight: 14 },
} as const;

export const shadow = {
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

/** Hairline row separator — use instead of { height: 1, backgroundColor: colors.border }. */
export const separator = {
  height: StyleSheet.hairlineWidth,
  backgroundColor: colors.border,
} as const;

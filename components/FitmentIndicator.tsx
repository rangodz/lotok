import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, typography } from '@/lib/theme';

export type FitmentLevel = 'confirmed' | 'likely' | 'unverified';

interface FitmentIndicatorProps {
  level: FitmentLevel;
  /**
   * Called when the user taps "Pourquoi ?".
   * The link is only rendered when level === 'likely'.
   */
  onExplain?: () => void;
}

const FILLED_COUNT: Record<FitmentLevel, number> = {
  confirmed: 3,
  likely: 2,
  unverified: 1,
};

const LABELS: Record<FitmentLevel, string> = {
  confirmed: 'Compatibilité confirmée',
  likely: 'Compatibilité probable',
  unverified: 'Non vérifié',
};

/**
 * Compact fitment level indicator.
 *
 * Three vertical 4 px segments (like a signal-strength bar) convey the level
 * with no semantic color — fully greyscale-safe.
 *
 * - confirmed  → 3 segments filled
 * - likely     → 2 segments filled  +  optional "Pourquoi ?" link
 * - unverified → 1 segment filled
 */
export function FitmentIndicator({ level, onExplain }: FitmentIndicatorProps) {
  const filledCount = FILLED_COUNT[level];

  return (
    <View
      style={styles.root}
      accessibilityLabel={LABELS[level]}
      accessibilityRole="text"
    >
      {/* Three vertical bars — filled = dark, empty = light */}
      <View style={styles.segments}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i <= filledCount ? styles.segmentFilled : styles.segmentEmpty,
            ]}
          />
        ))}
      </View>

      {/* Label + optional explain link */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{LABELS[level]}</Text>
        {level === 'likely' && onExplain ? (
          <Pressable
            onPress={onExplain}
            accessibilityRole="button"
            accessibilityLabel="Pourquoi cette compatibilité ?"
            hitSlop={8}
          >
            <Text style={styles.explainLink}>Pourquoi ?</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  segment: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  segmentFilled: {
    backgroundColor: colors.textPrimary,
  },
  segmentEmpty: {
    backgroundColor: colors.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  explainLink: {
    ...typography.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.karto,
  },
});

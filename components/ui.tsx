import React from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { AlertCircle, Star } from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/lib/theme';

/* ---------------------------------- Card --------------------------------- */

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ---------------------------------- Badge -------------------------------- */

type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

const badgeColors: Record<BadgeVariant, { bg: string; fg: string }> = {
  success: { bg: colors.successBg, fg: colors.successDeep },
  danger: { bg: colors.dangerBg, fg: colors.dangerDeep },
  warning: { bg: colors.warningBg, fg: colors.warningMid },
  neutral: { bg: colors.surface, fg: colors.textSecondary },
};

export function Badge({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const c = badgeColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

/* --------------------------------- Button -------------------------------- */

type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'inverse';

export function Button({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
}) {
  const variantStyle: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.karto, height: 48 },
    cta: { backgroundColor: colors.orange, height: 56 },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
      height: 48,
    },
    inverse: { backgroundColor: colors.white, height: 56 },
  };
  const textColor =
    variant === 'ghost'
      ? colors.textSecondary
      : variant === 'inverse'
        ? colors.textPrimary
        : colors.white;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.button,
        variantStyle[variant],
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

/* ---------------------------------- Stars -------------------------------- */

export function Stars({ tier }: { tier: 1 | 2 | 3 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={14}
          color={i <= tier ? colors.warning : colors.border}
          fill={i <= tier ? colors.warning : 'transparent'}
        />
      ))}
    </View>
  );
}

/* ------------------------------ Section title ---------------------------- */

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/* -------------------------------- EmptyState ----------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
  onCta,
}: {
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  title: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <View style={uiStyles.emptyRoot}>
      {Icon && (
        <View style={uiStyles.emptyIconWrap}>
          <Icon size={40} color={colors.border} strokeWidth={1.5} />
        </View>
      )}
      <Text style={uiStyles.emptyTitle}>{title}</Text>
      {body ? <Text style={uiStyles.emptyBody}>{body}</Text> : null}
      {cta && onCta ? (
        <Pressable
          style={uiStyles.emptyCta}
          onPress={onCta}
          accessibilityRole="button"
          accessibilityLabel={cta}
        >
          <Text style={uiStyles.emptyCtaText}>{cta}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------- ErrorState ----------------------------- */

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Réessayer',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View style={uiStyles.emptyRoot}>
      <View style={[uiStyles.emptyIconWrap, { backgroundColor: colors.dangerBg }]}>
        <AlertCircle size={36} color={colors.danger} strokeWidth={2} />
      </View>
      <Text style={[uiStyles.emptyTitle, { color: colors.danger }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={[uiStyles.emptyCta, { backgroundColor: colors.danger }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          <Text style={uiStyles.emptyCtaText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ------------------------------ SkeletonLoader --------------------------- */

export function SkeletonBlock({
  width,
  height = 16,
  radius: r,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const anim = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        uiStyles.skeleton,
        {
          width: width ?? '100%',
          height,
          borderRadius: r ?? 8,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={uiStyles.skeletonCard}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <SkeletonBlock width={44} height={44} radius={radius.md} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBlock height={14} width="60%" />
          <SkeletonBlock height={11} width="40%" />
        </View>
      </View>
      {lines > 2 && (
        <View style={{ gap: 6, marginTop: spacing.sm }}>
          {Array.from({ length: lines - 2 }).map((_, i) => (
            <SkeletonBlock key={i} height={11} width={i === lines - 3 ? '50%' : '100%'} />
          ))}
        </View>
      )}
    </View>
  );
}

const uiStyles = StyleSheet.create({
  emptyRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { ...typography.h3, color: colors.textSecondary, textAlign: 'center' },
  emptyBody: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyCta: {
    marginTop: spacing.sm,
    backgroundColor: colors.karto,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  emptyCtaText: { ...typography.h3, fontSize: 15, color: colors.white },
  skeleton: { backgroundColor: colors.surface },
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.xs,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.xs,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    ...typography.h3,
    fontSize: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
});

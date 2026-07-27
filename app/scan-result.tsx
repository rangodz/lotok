import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  X,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { ltrText } from '@/lib/rtl';
import { scanResults, type ScanState } from '@/lib/mock';
import { Button } from '@/components/ui';

// ── Per-state visual config ───────────────────────────────────────────────────

const stateConfig: Record<
  ScanState,
  {
    bg: string;
    bgDeep: string;
    icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  }
> = {
  compatible: {
    bg: colors.success,
    bgDeep: colors.successDeep,
    icon: CheckCircle2,
  },
  incompatible: {
    bg: colors.danger,
    bgDeep: colors.dangerDeep,
    icon: AlertTriangle,
  },
  suspect: {
    bg: colors.orange,
    bgDeep: colors.orangeDeep,
    icon: ShieldAlert,
  },
};

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ScanResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { state: rawState, categoryId } =
    useLocalSearchParams<{ state?: string; categoryId?: string }>();

  // Fallback to 'incompatible' if param is missing or invalid
  const validStates: ScanState[] = ['compatible', 'incompatible', 'suspect'];
  const state: ScanState =
    validStates.includes(rawState as ScanState) ? (rawState as ScanState) : 'incompatible';

  const cfg = stateConfig[state];
  const data = scanResults[state];
  const Icon = cfg.icon;
  const detectedCategory = categoryId ?? 'filtre-huile';

  // ── CTA actions ──────────────────────────────────────────────────────────────

  const handleCta = () => {
    switch (state) {
      case 'compatible':
        router.replace('/(tabs)/shops');
        break;
      case 'incompatible':
      case 'suspect':
        router.replace(`/parts/${detectedCategory}`);
        break;
    }
  };

  const handleScanAnother = () => {
    router.back(); // returns to camera (/(tabs)/scan)
  };

  return (
    <View style={[styles.root, { backgroundColor: cfg.bg }]}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top + spacing.sm }}>
        <View style={styles.topBar}>
          <Pressable
            onPress={handleScanAnother}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <X size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.topBarTitle}>{t('scanResult.screenTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Verdict icon */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.iconCircle}>
          <Icon size={56} color={colors.white} strokeWidth={1.8} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(80).duration(400).springify()} style={styles.title}>
          {data.title}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(140).duration(400).springify()} style={styles.subtitle}>
          {data.subtitle}
        </Animated.Text>

        {/* Detail card */}
        <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} style={styles.detailCard}>
          <Text style={styles.detailLabel}>{data.detected.brand}</Text>
          <Text style={[styles.detailRef, ltrText]}>{data.detected.ref}</Text>
          <Text style={styles.detailMeta}>{data.detected.detail}</Text>

          <View style={styles.divider} />

          <Text style={styles.detailBody}>{data.body}</Text>

          {data.expected && (
            <View style={styles.expectedBox}>
              <Text style={styles.expectedLabel}>
                {t('scanResult.expectedLabel')}
              </Text>
              <Text style={styles.expectedRef}>{data.expected}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* CTAs */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button variant="inverse" title={data.cta} onPress={handleCta} />
        <Pressable
          onPress={handleScanAnother}
          accessibilityRole="button"
          accessibilityLabel={t('scanResult.scanAnother')}
          style={{ paddingVertical: spacing.sm }}
        >
          <Text style={styles.secondaryAction}>{t('scanResult.scanAnother')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  topBarTitle: { ...typography.h3, color: colors.white },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 32,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyL,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },

  detailCard: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '100%',
  },
  detailLabel: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailRef: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: colors.white,
    marginTop: 4,
  },
  detailMeta: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: spacing.md,
  },
  detailBody: { ...typography.body, color: colors.white, lineHeight: 22 },

  expectedBox: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  expectedLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  expectedRef: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 2,
  },

  ctaWrap: { paddingHorizontal: spacing.md, gap: spacing.xs },
  secondaryAction: {
    ...typography.bodyL,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});

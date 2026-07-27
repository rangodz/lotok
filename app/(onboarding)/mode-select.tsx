import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Car, Wrench } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { useSettingsStore, type UserMode } from '@/stores/settingsStore';

interface ModeCardProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  detail: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}

function ModeCard({ icon: Icon, label, detail, desc, selected, onPress }: ModeCardProps) {
  return (
    <Pressable
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      <View style={[styles.cardIconWrap, selected && styles.cardIconWrapSelected]}>
        <Icon size={32} color={selected ? colors.white : colors.karto} strokeWidth={1.8} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{label}</Text>
        <Text style={styles.cardDetail}>{detail}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

export default function ModeSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setUserMode } = useSettingsStore();
  const [selected, setSelected] = useState<UserMode>('individual');

  const handleContinue = () => {
    setUserMode(selected);
    router.push('/(onboarding)/add-vehicle');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.modeSelectTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.modeSelectSubtitle')}</Text>

        <View style={styles.cards}>
          <ModeCard
            icon={Car}
            label={t('onboarding.individual')}
            detail={t('onboarding.individualDetail')}
            desc={t('onboarding.individualDesc')}
            selected={selected === 'individual'}
            onPress={() => setSelected('individual')}
          />
          <ModeCard
            icon={Wrench}
            label={t('onboarding.pro')}
            detail={t('onboarding.proDetail')}
            desc={t('onboarding.proDesc')}
            selected={selected === 'pro'}
            onPress={() => setSelected('pro')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.ctaButton}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue')}
        >
          <Text style={styles.ctaText}>{t('common.continue')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.xl },

  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyL, color: colors.textSecondary, marginBottom: spacing.xl },

  cards: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cardSelected: {
    borderColor: colors.karto,
    backgroundColor: colors.kartoSurface,
  },

  cardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.kartoSurface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIconWrapSelected: { backgroundColor: colors.karto },

  cardBody: { flex: 1, gap: 2 },
  cardLabel: { ...typography.h3, color: colors.textPrimary },
  cardLabelSelected: { color: colors.karto },
  cardDetail: { ...typography.body, color: colors.textSecondary },
  cardDesc: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: { borderColor: colors.karto },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.karto,
  },

  footer: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  ctaButton: {
    backgroundColor: colors.karto,
    borderRadius: radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { ...typography.h3, color: colors.white, fontSize: 16 },
});

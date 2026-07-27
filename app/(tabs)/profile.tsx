import React, { useState } from 'react';
import {
  Alert,
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  Globe,
  HelpCircle,
  LogOut,
  MapPin,
  Shield,
  Star,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { useSettingsStore } from '@/stores/settingsStore';
import type { SupportedLanguage } from '@/lib/i18n';
import i18n from '@/lib/i18n';
import { isRTL } from '@/lib/rtl';

// ── Language picker modal ─────────────────────────────────────────────────────

const LANGUAGES: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: 'fr', label: 'Français', native: 'Français' },
  { code: 'ar', label: 'العربية',  native: 'العربية' },
  { code: 'en', label: 'English',  native: 'English' },
];

function LanguageModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: SupportedLanguage;
  onSelect: (lang: SupportedLanguage) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close')}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              style={[styles.langRow, lang.code === current && styles.langRowActive]}
              onPress={() => { onSelect(lang.code); onClose(); }}
              accessibilityRole="radio"
              accessibilityState={{ checked: lang.code === current }}
              accessibilityLabel={lang.native}
            >
              <Text style={styles.langLabel}>{lang.native}</Text>
              {lang.code === current && <View style={styles.radioActive} />}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Settings row ──────────────────────────────────────────────────────────────

function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  right,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={label}
    >
      <View style={styles.rowIcon}>
        <Icon size={18} color={colors.textSecondary} strokeWidth={2} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {right ?? (onPress ? <ChevronIcon size={16} color={colors.textMuted} /> : null)}
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    language, userMode, isAuthenticated, userPhone, userName,
    setLanguage, setUserMode, logout,
  } = useSettingsStore();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const isPro = userMode === 'pro';
  const displayName = userName || (isAuthenticated ? userPhone : t('profile.guest'));
  const displaySub = isAuthenticated ? userPhone : t('profile.guestSub');
  const initials = (displayName.charAt(0) ?? 'K').toUpperCase();

  const langLabel = LANGUAGES.find((l) => l.code === language)?.native ?? language;

  const handleLanguage = async (lang: SupportedLanguage) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);

    const needsRTL = lang === 'ar';
    if (I18nManager.isRTL !== needsRTL) {
      I18nManager.forceRTL(needsRTL);
      if (__DEV__) {
        Alert.alert(
          needsRTL ? 'RTL activé' : 'RTL désactivé',
          'Redémarre l\'application pour appliquer la direction du texte.',
        );
      } else {
        // In production, use expo-updates if available
        try {
          const Updates = await import('expo-updates');
          await Updates.reloadAsync();
        } catch {
          Alert.alert('', 'Redémarre l\'application pour appliquer les changements.');
        }
      }
    }
  };

  const handleModeToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserMode(value ? 'pro' : 'individual');
  };

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userSub}>{displaySub}</Text>
        {!isAuthenticated && (
          <Pressable
            style={styles.loginButton}
            accessibilityRole="button"
            accessibilityLabel={t('profile.login')}
            onPress={() => {}}
          >
            <Text style={styles.loginButtonText}>{t('profile.login')}</Text>
          </Pressable>
        )}
      </View>

      {/* Mode toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('profile.mode')}</Text>
        <View style={styles.card}>
          <View style={styles.modeToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modeToggleTitle}>
                {isPro ? t('profile.pro') : t('profile.individual')}
              </Text>
              <Text style={styles.modeToggleDesc}>{t('profile.proToggleDesc')}</Text>
            </View>
            <Switch
              value={isPro}
              onValueChange={handleModeToggle}
              trackColor={{ false: colors.border, true: colors.kartoLight }}
              thumbColor={isPro ? colors.karto : colors.white}
              accessibilityRole="switch"
              accessibilityLabel={t('profile.mode')}
            />
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <View style={styles.card}>
          <SettingsRow
            icon={Globe}
            label={t('profile.language')}
            value={langLabel}
            onPress={() => setLangModalVisible(true)}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={Flag}
            label={t('profile.notifications')}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.kartoLight }}
                thumbColor={notificationsEnabled ? colors.karto : colors.white}
              />
            }
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={MapPin}
            label={t('profile.location')}
            value={t('profile.locationDesc')}
          />
        </View>
      </View>

      {/* Premium card */}
      <View style={styles.section}>
        <View style={styles.premiumCard}>
          <View style={styles.premiumTop}>
            <Star size={22} color="rgba(255,255,255,0.9)" strokeWidth={1.8} />
            <Text style={styles.premiumTitle}>{t('profile.premium')}</Text>
          </View>
          <Text style={styles.premiumDesc}>{t('profile.premiumDesc')}</Text>
          <View style={styles.premiumCta}>
            <Text style={styles.premiumCtaText}>{t('profile.premiumCta')}</Text>
          </View>
        </View>
      </View>

      {/* Help section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('profile.helpSection')}</Text>
        <View style={styles.card}>
          <SettingsRow icon={HelpCircle} label={t('profile.howItWorks')} onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingsRow icon={MapPin}     label={t('profile.reportShop')}  onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingsRow icon={Shield}     label={t('profile.support')}      onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingsRow icon={BookOpen}   label={t('profile.terms')}        onPress={() => {}} />
        </View>
      </View>

      {/* Logout */}
      {isAuthenticated && (
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Pressable
            style={styles.logoutButton}
            onPress={logout}
            accessibilityRole="button"
            accessibilityLabel={t('profile.logout')}
          >
            <LogOut size={18} color={colors.danger} strokeWidth={2} />
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </Pressable>
        </View>
      )}

      <LanguageModal
        visible={langModalVisible}
        current={language}
        onSelect={handleLanguage}
        onClose={() => setLangModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Header
  headerCard: {
    backgroundColor: colors.karto,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.kartoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  avatarText: { fontFamily: 'Sora_700Bold', fontSize: 32, color: colors.white },
  userName: { ...typography.h2, color: colors.white },
  userSub: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  loginButton: {
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  loginButtonText: { ...typography.body, fontFamily: 'Inter_500Medium', color: colors.white },

  // Sections
  section: { marginTop: spacing.lg },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  // Mode toggle
  modeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  modeToggleTitle: { ...typography.h3, color: colors.textPrimary },
  modeToggleDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { ...typography.caption, color: colors.textSecondary },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 48 + spacing.md },

  // Premium card
  premiumCard: {
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.karto,
  },
  premiumTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  premiumTitle: { ...typography.h3, color: colors.white },
  premiumDesc: { ...typography.caption, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  premiumCta: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: spacing.xs,
    opacity: 0.6,
  },
  premiumCtaText: { ...typography.caption, color: colors.white },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.dangerBg,
    borderRadius: radius.md,
    height: 48,
    backgroundColor: colors.white,
  },
  logoutText: { ...typography.body, fontFamily: 'Inter_500Medium', color: colors.danger },

  // Language modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.md,
    paddingBottom: 40,
    gap: spacing.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  langRowActive: { backgroundColor: colors.kartoSurface },
  langLabel: { ...typography.bodyL, color: colors.textPrimary },
  radioActive: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.karto,
  },
});

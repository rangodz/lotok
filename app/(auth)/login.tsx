import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { signInWithOtp } from '@/lib/auth';
import { useSettingsStore } from '@/stores/settingsStore';

function isValidDZPhone(raw: string): boolean {
  // Accept "07 XX XX XX XX" style (with spaces) or "07XXXXXXXX"
  const digits = raw.replace(/\D/g, '');
  // Must be 10 digits starting with 05, 06 or 07
  return /^0[567]\d{8}$/.test(digits);
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setHasOnboarded } = useSettingsStore();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setError('');
    if (!isValidDZPhone(phone)) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setLoading(true);
    const result = await signInWithOtp(phone);
    setLoading(false);
    if (result.success) {
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } else {
      setError(t('auth.invalidPhone'));
    }
  };

  const handleSkip = () => {
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.loginTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

        <View style={styles.inputRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixFlag}>🇩🇿</Text>
            <Text style={styles.prefixCode}>+213</Text>
          </View>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder={t('auth.phonePlaceholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(v) => { setPhone(v); setError(''); }}
            maxLength={14}
            accessibilityLabel={t('auth.loginTitle')}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.sendButton, (loading || phone.length < 9) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading || phone.length < 9}
          accessibilityRole="button"
          accessibilityLabel={t('auth.sendCode')}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.sendButtonText}>{t('auth.sendCode')}</Text>
          }
        </Pressable>
      </View>

      {/* Skip */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel={t('auth.continueWithoutAccount')}
        >
          <Text style={styles.skipText}>{t('auth.continueWithoutAccount')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyL, color: colors.textSecondary, marginBottom: spacing.xl },

  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  prefix: {
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prefixFlag: { fontSize: 20 },
  prefixCode: { ...typography.bodyL, color: colors.textPrimary },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...typography.bodyL,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.danger },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },

  sendButton: {
    backgroundColor: colors.karto,
    borderRadius: radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { ...typography.h3, color: colors.white, fontSize: 16 },

  footer: { alignItems: 'center', paddingTop: spacing.md },
  skipText: { ...typography.bodyL, color: colors.textSecondary },
});

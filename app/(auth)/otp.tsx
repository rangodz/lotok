import React, { useEffect, useRef, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { verifyOtp } from '@/lib/auth';
import { useSettingsStore } from '@/stores/settingsStore';

const OTP_LEN = 6;
const RESEND_DELAY = 60;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setAuthenticated, setHasOnboarded } = useSettingsStore();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const inputRef = useRef<TextInput>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === OTP_LEN) {
      handleVerify(otp);
    }
  }, [otp]);

  const handleVerify = async (code: string) => {
    setError('');
    setLoading(true);
    const result = await verifyOtp(phone ?? '', code);
    setLoading(false);
    if (result.success) {
      setAuthenticated(phone ?? '');
      setHasOnboarded(true);
      router.replace('/(tabs)');
    } else {
      setError(t('auth.wrongCode'));
      setOtp('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_DELAY);
    setError('');
    setOtp('');
  };

  // Build digit display array from otp string
  const digits = Array.from({ length: OTP_LEN }, (_, i) => otp[i] ?? '');

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
        <Text style={styles.title}>{t('auth.otpTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.otpSubtitle', { phone: phone ?? '' })}</Text>
        <Text style={styles.demoHint}>{t('auth.demoHint')}</Text>

        {/* OTP digit boxes — tap any to focus hidden input */}
        <Pressable
          style={styles.otpRow}
          onPress={() => inputRef.current?.focus()}
          accessibilityLabel="Code OTP"
        >
          {digits.map((d, i) => (
            <View
              key={i}
              style={[
                styles.digitBox,
                otp.length === i && styles.digitBoxCursor,
                otp.length > i && styles.digitBoxFilled,
                error ? styles.digitBoxError : null,
              ]}
            >
              {loading && i === otp.length - 1
                ? <ActivityIndicator size="small" color={colors.karto} />
                : <Text style={styles.digitText}>{d}</Text>
              }
            </View>
          ))}
        </Pressable>

        {/* Hidden native input captures keyboard */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={OTP_LEN}
          value={otp}
          onChangeText={(v) => {
            setError('');
            setOtp(v.replace(/\D/g, '').slice(0, OTP_LEN));
          }}
          autoFocus
          caretHidden
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Resend */}
        <Pressable
          onPress={handleResend}
          disabled={countdown > 0}
          accessibilityRole="button"
          accessibilityLabel={t('auth.resend')}
          style={styles.resendButton}
        >
          <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
            {countdown > 0
              ? t('auth.resendIn', { seconds: countdown })
              : t('auth.resend')}
          </Text>
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
  subtitle: { ...typography.bodyL, color: colors.textSecondary, marginBottom: spacing.xs },
  demoHint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xl },

  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  digitBox: {
    width: 48,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxCursor: { borderColor: colors.karto, borderStyle: 'solid' },
  digitBoxFilled: { borderColor: colors.kartoLight, backgroundColor: colors.kartoSurface },
  digitBoxError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  digitText: { ...typography.h2, color: colors.textPrimary },

  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },

  errorText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  resendButton: { alignItems: 'center', paddingVertical: spacing.sm },
  resendText: { ...typography.bodyL, color: colors.karto },
  resendDisabled: { color: colors.textMuted },
});

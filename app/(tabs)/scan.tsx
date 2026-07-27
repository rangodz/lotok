import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Images, Zap, ZapOff } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { identifyPart, forceState } from '@/lib/ai';
import { useVehicleStore } from '@/stores/vehicleStore';
import type { ScanState } from '@/lib/mock';

const { width: SCREEN_W } = Dimensions.get('window');
const VF_W = Math.round(SCREEN_W * 0.76);
const VF_H = Math.round(VF_W * (3 / 4)); // 4:3

type ScreenState = 'permission-needed' | 'permission-denied' | 'camera' | 'preview' | 'analyzing';

const ANALYZING_MSGS = ['analyzing1', 'analyzing2', 'analyzing3'] as const;

// ── Permission needed ─────────────────────────────────────────────────────────

function PermissionScreen({ onRequest }: { onRequest: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.permRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.permIconWrap}>
        <Images size={52} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
      </View>
      <Text style={styles.permTitle}>{t('scan.permissionTitle')}</Text>
      <Text style={styles.permBody}>{t('scan.permissionBody')}</Text>
      <Pressable
        style={styles.permCta}
        onPress={onRequest}
        accessibilityRole="button"
        accessibilityLabel={t('scan.authorize')}
      >
        <Text style={styles.permCtaText}>{t('scan.authorize')}</Text>
      </Pressable>
    </View>
  );
}

// ── Permission denied ─────────────────────────────────────────────────────────

function PermissionDeniedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.permRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.permIconWrap}>
        <ZapOff size={52} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
      </View>
      <Text style={styles.permTitle}>{t('scan.deniedTitle')}</Text>
      <Text style={styles.permBody}>{t('scan.deniedBody')}</Text>
      <Pressable
        style={styles.permCta}
        onPress={() => Linking.openSettings()}
        accessibilityRole="button"
        accessibilityLabel={t('scan.openSettings')}
      >
        <Text style={styles.permCtaText}>{t('scan.openSettings')}</Text>
      </Pressable>
    </View>
  );
}

// ── Analyzing overlay ─────────────────────────────────────────────────────────

function AnalyzingOverlay() {
  const { t } = useTranslation();
  const [msgIdx, setMsgIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setMsgIdx((i) => (i + 1) % ANALYZING_MSGS.length);
    };
    const id = setInterval(cycle, 900);
    return () => clearInterval(id);
  }, [fadeAnim]);

  return (
    <View style={styles.analyzingOverlay}>
      <View style={styles.analyzingSpinnerWrap}>
        <View style={styles.analyzingRing} />
        <View style={styles.analyzingDot} />
      </View>
      <Animated.Text style={[styles.analyzingMsg, { opacity: fadeAnim }]}>
        {t(`scan.${ANALYZING_MSGS[msgIdx]}`)}
      </Animated.Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { getActiveVehicle } = useVehicleStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [screenState, setScreenState] = useState<ScreenState>('camera');
  const [torchOn, setTorchOn] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Permission gating
  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      setScreenState(
        permission.canAskAgain ? 'permission-needed' : 'permission-denied',
      );
    } else {
      setScreenState('camera');
    }
  }, [permission]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.granted) {
      setScreenState('camera');
    } else {
      setScreenState(result.canAskAgain ? 'permission-needed' : 'permission-denied');
    }
  };

  // Capture from camera
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
    if (!photo) return;
    setPhotoUri(photo.uri);
    setPhotoBase64(photo.base64 ?? null);
    setScreenState('preview');
  };

  // Pick from gallery
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setPhotoBase64(asset.base64 ?? null);
      setScreenState('preview');
    }
  };

  // Analyze
  const handleAnalyze = async () => {
    setScreenState('analyzing');
    const active = getActiveVehicle();
    const result = await identifyPart(photoBase64 ?? '', active?.engineId ?? '');

    // Haptic feedback based on result
    if (result.state === 'compatible') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (result.state === 'suspect') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    router.push({
      pathname: '/scan-result',
      params: { state: result.state, categoryId: result.categoryId },
    });
    // Reset camera state after navigation
    setTimeout(() => {
      setPhotoUri(null);
      setPhotoBase64(null);
      setScreenState('camera');
    }, 600);
  };

  // Retake
  const handleRetake = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    setScreenState('camera');
  };

  // __DEV__ force helper
  const handleForce = async (s: ScanState) => {
    forceState(s);
    if (photoUri) {
      await handleAnalyze();
    } else {
      // Use a blank base64 placeholder so analyze runs
      setPhotoBase64('');
      setPhotoUri('placeholder');
      setScreenState('analyzing');
      const active = getActiveVehicle();
      const result = await identifyPart('', active?.engineId ?? '');
      if (result.state === 'compatible') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.state === 'suspect') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      router.push({ pathname: '/scan-result', params: { state: result.state, categoryId: result.categoryId } });
      setTimeout(() => { setPhotoUri(null); setPhotoBase64(null); setScreenState('camera'); }, 600);
    }
  };

  // ── Render branches ──────────────────────────────────────────────────────────

  if (screenState === 'permission-needed') {
    return <PermissionScreen onRequest={handleRequestPermission} />;
  }

  if (screenState === 'permission-denied') {
    return <PermissionDeniedScreen />;
  }

  if (screenState === 'preview' && photoUri) {
    return (
      <View style={styles.root}>
        <Image
          source={{ uri: photoUri === 'placeholder' ? undefined : photoUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          placeholder={{ blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I' }}
        />
        {/* Dark overlay */}
        <View style={styles.previewOverlay} />

        <View style={[styles.previewActions, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Pressable
            style={[styles.previewBtn, styles.previewBtnRetake]}
            onPress={handleRetake}
            accessibilityRole="button"
            accessibilityLabel={t('scan.retake')}
          >
            <Text style={styles.previewBtnRetakeText}>{t('scan.retake')}</Text>
          </Pressable>
          <Pressable
            style={[styles.previewBtn, styles.previewBtnAnalyze]}
            onPress={handleAnalyze}
            accessibilityRole="button"
            accessibilityLabel={t('scan.analyze')}
          >
            <Text style={styles.previewBtnAnalyzeText}>{t('scan.analyze')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Camera */}
      {screenState !== 'analyzing' && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchOn}
        />
      )}

      {/* Analyzing overlay */}
      {screenState === 'analyzing' && <AnalyzingOverlay />}

      {/* Viewfinder overlay (shown in camera mode) */}
      {screenState === 'camera' && (
        <>
          {/* Dark quadrants around the viewfinder */}
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddleRow}>
            <View style={styles.overlaySide} />
            {/* Clear viewfinder window */}
            <View style={[styles.viewfinder, { width: VF_W, height: VF_H }]}>
              {/* 4 corner marks */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />

          {/* Instruction label */}
          <View style={styles.instructionWrap} pointerEvents="none">
            <Text style={styles.instruction}>{t('scan.instruction')}</Text>
          </View>
        </>
      )}

      {/* Top bar: flash toggle */}
      {screenState === 'camera' && (
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            style={[styles.iconButton, torchOn && styles.iconButtonActive]}
            onPress={() => setTorchOn((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={t('scan.flash')}
          >
            {torchOn
              ? <Zap size={20} color={colors.orange} strokeWidth={2} />
              : <ZapOff size={20} color="rgba(255,255,255,0.8)" strokeWidth={2} />}
          </Pressable>
        </View>
      )}

      {/* Bottom bar: gallery + shutter */}
      {screenState === 'camera' && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          {/* Gallery */}
          <Pressable
            style={styles.iconButton}
            onPress={handleGallery}
            accessibilityRole="button"
            accessibilityLabel={t('scan.gallery')}
          >
            <Images size={22} color="rgba(255,255,255,0.85)" strokeWidth={2} />
          </Pressable>

          {/* Shutter — orange with white ring */}
          <Pressable
            style={styles.shutterOuter}
            onPress={handleCapture}
            accessibilityRole="button"
            accessibilityLabel="Capturer"
          >
            <View style={styles.shutterInner} />
          </Pressable>

          {/* Spacer to balance layout */}
          <View style={{ width: 48 }} />
        </View>
      )}

      {/* __DEV__ debug buttons */}
      {__DEV__ && screenState === 'camera' && (
        <View style={[styles.devRow, { bottom: insets.bottom + 130 }]}>
          {(['compatible', 'incompatible', 'suspect'] as ScanState[]).map((s) => (
            <Pressable
              key={s}
              style={styles.devBtn}
              onPress={() => handleForce(s)}
              accessibilityRole="button"
              accessibilityLabel={`Force ${s}`}
            >
              <Text style={styles.devBtnText}>{s[0].toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CORNER_SIZE = 22;
const CORNER_W = 3;
const CORNER_R = 6;
const DARK = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // Permission screens
  permRoot: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  permIconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  permTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: colors.white,
    textAlign: 'center',
  },
  permBody: {
    ...typography.body,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  permCta: {
    marginTop: spacing.md,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
  },
  permCtaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },

  // Viewfinder overlay quadrants
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '50%',
    marginBottom: VF_H / 2,
    backgroundColor: DARK,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '50%',
    marginTop: VF_H / 2,
    backgroundColor: DARK,
  },
  overlayMiddleRow: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: VF_H,
    marginTop: -(VF_H / 2),
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: DARK,
  },

  // Viewfinder clear window
  viewfinder: {
    position: 'relative',
  },

  // Corner marks
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.white,
    borderWidth: CORNER_W,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: CORNER_R,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: CORNER_R,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: CORNER_R,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: CORNER_R,
  },

  // Instruction
  instructionWrap: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -(VF_H / 2) - 44,
    alignItems: 'center',
  },
  instruction: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(249,115,22,0.25)',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  // Shutter button
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  // Preview
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  previewBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBtnRetake: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
  },
  previewBtnAnalyze: {
    backgroundColor: colors.orange,
  },
  previewBtnRetakeText: {
    ...typography.body,
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },
  previewBtnAnalyzeText: {
    ...typography.body,
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },

  // Analyzing overlay
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  analyzingSpinnerWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.orange,
    borderTopColor: 'transparent',
    // Note: real spinning animation would need Animated.rotate;
    // keeping static ring here since Animated.loop would add complexity
  },
  analyzingDot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    opacity: 0.9,
  },
  analyzingMsg: {
    ...typography.bodyL,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    maxWidth: 240,
  },

  // __DEV__ buttons
  devRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  devBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  devBtnText: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_600SemiBold',
  },
});

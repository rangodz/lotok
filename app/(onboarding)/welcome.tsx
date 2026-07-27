import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, MapPin, ShieldCheck } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';

const { width: W } = Dimensions.get('window');

interface Slide {
  key: string;
  titleKey: string;
  bodyKey: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconBg: string;
  iconColor: string;
}

const SLIDES: Slide[] = [
  {
    key: '1',
    titleKey: 'onboarding.slide1Title',
    bodyKey: 'onboarding.slide1Body',
    Icon: ShieldCheck,
    iconBg: colors.kartoSurface,
    iconColor: colors.karto,
  },
  {
    key: '2',
    titleKey: 'onboarding.slide2Title',
    bodyKey: 'onboarding.slide2Body',
    Icon: AlertTriangle,
    iconBg: colors.orangeSurface,
    iconColor: colors.orange,
  },
  {
    key: '3',
    titleKey: 'onboarding.slide3Title',
    bodyKey: 'onboarding.slide3Body',
    Icon: MapPin,
    iconBg: colors.successBg,
    iconColor: colors.success,
  },
];

function SlideItem({ slide }: { slide: Slide }) {
  const { t } = useTranslation();
  const { Icon } = slide;
  return (
    <View style={styles.slide}>
      <View style={[styles.iconCircle, { backgroundColor: slide.iconBg }]}>
        <Icon size={64} color={slide.iconColor} strokeWidth={1.5} />
      </View>
      <Text style={styles.slideTitle}>{t(slide.titleKey as Parameters<typeof t>[0])}</Text>
      <Text style={styles.slideBody}>{t(slide.bodyKey as Parameters<typeof t>[0])}</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.push('/(onboarding)/mode-select');
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip */}
      <View style={styles.topBar}>
        {!isLast ? (
          <Pressable
            onPress={() => router.push('/(onboarding)/mode-select')}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.skip')}
          >
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        renderItem={({ item }) => <SlideItem slide={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={styles.slider}
      />

      {/* Dots + CTA */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={styles.nextButton}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? t('onboarding.finish') : t('common.next')}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? t('onboarding.finish') : t('common.next')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    minHeight: 48,
  },
  skipButton: { padding: spacing.sm },
  skipText: { ...typography.bodyL, color: colors.textSecondary },

  slider: { flex: 1 },

  slide: {
    width: W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  slideTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  slideBody: {
    ...typography.bodyL,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: { width: 28, backgroundColor: colors.karto },

  nextButton: {
    backgroundColor: colors.karto,
    borderRadius: radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: { ...typography.h3, color: colors.white, fontSize: 16 },
});

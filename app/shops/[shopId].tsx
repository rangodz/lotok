import React from 'react';
import {
  ActivityIndicator,
  Linking,
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
  ArrowLeft,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
  Tag,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/lib/theme';
import { useShop } from '@/hooks/useShops';
import { Badge } from '@/components/ui';

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  icon: Icon,
  label,
  onPress,
  variant = 'default',
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'green';
}) {
  return (
    <Pressable
      style={[styles.actionBtn, variant === 'green' && styles.actionBtnGreen]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon
        size={18}
        color={variant === 'green' ? colors.white : colors.karto}
        strokeWidth={2}
      />
      <Text style={[styles.actionBtnText, variant === 'green' && styles.actionBtnTextGreen]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({
  initials,
  name,
  rating,
  text,
  date,
}: {
  initials: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewInitials}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName}>{name}</Text>
          <View style={styles.reviewStars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                color={i < rating ? colors.orange : colors.border}
                fill={i < rating ? colors.orange : 'transparent'}
                strokeWidth={1.5}
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{date}</Text>
      </View>
      <Text style={styles.reviewText}>{text}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ShopDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { shopId } = useLocalSearchParams<{ shopId: string }>();

  const { data: shop, isLoading, isError } = useShop(shopId);

  // Actions
  const handleCall = () => {
    if (!shop) return;
    Linking.openURL(`tel:${shop.phone}`);
  };

  const handleWhatsApp = () => {
    if (!shop?.whatsapp) return;
    const international = '+213' + shop.whatsapp.slice(1);
    Linking.openURL(`https://wa.me/${international.replace('+', '')}`);
  };

  const handleMaps = () => {
    if (!shop) return;
    Linking.openURL(
      `https://maps.google.com/?q=${shop.lat},${shop.lng}`
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }, styles.center]}>
        <ActivityIndicator size="large" color={colors.karto} />
      </View>
    );
  }

  // Error / not found
  if (isError || !shop) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }, styles.center]}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backLink}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Photo header */}
      <View style={styles.photoHeader}>
        <View style={styles.photoPlaceholder}>
          <MapPin size={36} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
        </View>

        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={20} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title row */}
        <Animated.View entering={FadeInDown.duration(350).springify()} style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shopName}>{shop.name}</Text>
            <View style={styles.addressRow}>
              <MapPin size={13} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.shopAddress}>{shop.address}</Text>
            </View>
          </View>
          {shop.isPartner && (
            <Badge label={t('shops.partner')} variant="success" />
          )}
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(80).duration(350).springify()} style={styles.statsRow}>
          {/* Rating */}
          <View style={styles.statItem}>
            <View style={styles.ratingBig}>
              <Star size={16} color={colors.orange} fill={colors.orange} strokeWidth={0} />
              <Text style={styles.ratingBigText}>{shop.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.statLabel}>
              {t('shops.reviews', { count: shop.reviewCount })}
            </Text>
          </View>

          <View style={styles.statDivider} />

          {/* Hours */}
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <Clock size={16} color={shop.isOpenNow ? colors.success : colors.textMuted} strokeWidth={2} />
              <Text style={[styles.statValue, { color: shop.isOpenNow ? colors.success : colors.textMuted }]}>
                {shop.isOpenNow ? t('shops.openNow') : t('shops.closed')}
              </Text>
            </View>
            <Text style={styles.statLabel}>{shop.hours}</Text>
          </View>

          {shop.distance !== undefined && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Navigation size={16} color={colors.karto} strokeWidth={2} />
                  <Text style={[styles.statValue, { color: colors.karto }]}>
                    {t('shops.km', { distance: shop.distance })}
                  </Text>
                </View>
                <Text style={styles.statLabel}>distance</Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <ActionBtn icon={Phone} label={t('shops.callAction')} onPress={handleCall} />
          {shop.whatsapp ? (
            <ActionBtn
              icon={MessageCircle}
              label={t('shops.whatsappAction')}
              onPress={handleWhatsApp}
              variant="green"
            />
          ) : null}
          <ActionBtn icon={Navigation} label={t('shops.mapsAction')} onPress={handleMaps} />
        </View>

        {/* Brands */}
        <Text style={styles.sectionTitle}>{t('shops.brandsLabel')}</Text>
        <View style={styles.brandsWrap}>
          {shop.brands.map((brand) => (
            <View key={brand} style={styles.brandChip}>
              <Tag size={12} color={colors.karto} strokeWidth={2} />
              <Text style={styles.brandChipText}>{brand}</Text>
            </View>
          ))}
        </View>

        {/* Reviews */}
        <Text style={styles.sectionTitle}>{t('shops.reviewsLabel')}</Text>
        {shop.reviews.length === 0 ? (
          <Text style={styles.noReviews}>{t('shops.noReviews')}</Text>
        ) : (
          <View style={styles.reviewsList}>
            {shop.reviews.map((r) => (
              <ReviewCard
                key={r.id}
                initials={r.authorInitials}
                name={r.authorName}
                rating={r.rating}
                text={r.text}
                date={r.date}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },

  // Photo header
  photoHeader: {
    height: 180,
    backgroundColor: colors.karto,
    position: 'relative',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.kartoDeep,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: spacing.md,
    gap: spacing.md,
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.xs,
  },
  shopName: { ...typography.h2, color: colors.textPrimary },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  shopAddress: { ...typography.caption, color: colors.textSecondary, flex: 1 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.xs,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: colors.border },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { ...typography.h3, fontSize: 15 },
  ratingBig: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingBigText: { ...typography.h3, fontSize: 18, color: colors.textPrimary },
  statLabel: { ...typography.tiny, color: colors.textMuted },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.xs,
  },
  actionBtnGreen: {
    backgroundColor: colors.greenAction,
    borderColor: colors.greenAction,
  },
  actionBtnText: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: colors.karto,
  },
  actionBtnTextGreen: { color: colors.white },

  // Brands
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  brandsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.kartoSurface,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandChipText: { ...typography.caption, color: colors.karto, fontFamily: 'Inter_500Medium' },

  // Reviews
  reviewsList: { gap: spacing.sm },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.xs,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.kartoSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInitials: { ...typography.caption, fontFamily: 'Inter_600SemiBold', color: colors.karto },
  reviewName: { ...typography.h3, fontSize: 14, color: colors.textPrimary },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewDate: { ...typography.tiny, color: colors.textMuted },
  reviewText: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  noReviews: { ...typography.body, color: colors.textMuted },

  // Error
  errorText: { ...typography.h3, color: colors.danger },
  backLink: { ...typography.body, color: colors.karto, marginTop: spacing.sm },
});

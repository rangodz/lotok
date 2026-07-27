import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MapPin, List, Map, Star } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { useShops, BEJAIA, type UserLocation } from '@/hooks/useShops';
import type { Shop } from '@/lib/mock';
import { Badge, SkeletonCard } from '@/components/ui';

// ── Filter chips ──────────────────────────────────────────────────────────────

type Filter = 'open' | 'partners' | 'nearby';

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

// ── Shop card ─────────────────────────────────────────────────────────────────

function ShopCard({ shop, onPress }: { shop: Shop; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={shop.name}
    >
      {/* Avatar */}
      <View style={styles.cardAvatar}>
        <MapPin size={20} color={shop.isPartner ? colors.karto : colors.textMuted} strokeWidth={2} />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>{shop.name}</Text>
          {shop.isPartner && (
            <Badge label={t('shops.partner')} variant="success" />
          )}
        </View>
        <Text style={styles.cardAddress} numberOfLines={1}>{shop.address}</Text>

        <View style={styles.cardMeta}>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <Star size={12} color={colors.orange} fill={colors.orange} strokeWidth={0} />
            <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>
              ({t('shops.reviews', { count: shop.reviewCount })})
            </Text>
          </View>

          {/* Distance */}
          {shop.distance !== undefined && (
            <Text style={styles.distance}>
              {t('shops.km', { distance: shop.distance })}
            </Text>
          )}

          {/* Open/closed */}
          <Text style={[styles.openBadge, !shop.isOpenNow && styles.closedBadge]}>
            {shop.isOpenNow ? t('shops.openNow') : t('shops.closed')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ShopsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ partRef?: string }>();

  const [view, setView] = useState<'list' | 'map'>('list');
  const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set());
  const [userLocation, setUserLocation] = useState<UserLocation>(BEJAIA);
  const [locationFallback, setLocationFallback] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const mapRef = useRef<MapView>(null);

  // Request location once on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } else {
        setLocationFallback(true);
      }
    })();
  }, []);

  const { data: shops, isLoading, isError, refetch, isFetching } = useShops(userLocation);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleFilter = (f: Filter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const filteredShops = (shops ?? []).filter((s) => {
    if (activeFilters.has('open') && !s.isOpenNow) return false;
    if (activeFilters.has('partners') && !s.isPartner) return false;
    if (activeFilters.has('nearby') && (s.distance ?? 999) >= 5) return false;
    return true;
  });

  const handleShopPress = (shop: Shop) => {
    router.push(`/shops/${shop.id}`);
  };

  const handleMarkerPress = (shop: Shop) => {
    setSelectedShop(shop);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('shops.title')}</Text>
          <Text style={styles.subtitle}>{t('shops.subtitle')}</Text>
        </View>

        {/* List / Map toggle */}
        <View style={styles.segmented}>
          <Pressable
            style={[styles.segBtn, view === 'list' && styles.segBtnActive]}
            onPress={() => setView('list')}
            accessibilityRole="button"
            accessibilityState={{ selected: view === 'list' }}
            accessibilityLabel={t('shops.listView')}
          >
            <List size={16} color={view === 'list' ? colors.white : colors.kartoLight} />
          </Pressable>
          <Pressable
            style={[styles.segBtn, view === 'map' && styles.segBtnActive]}
            onPress={() => setView('map')}
            accessibilityRole="button"
            accessibilityState={{ selected: view === 'map' }}
            accessibilityLabel={t('shops.mapView')}
          >
            <Map size={16} color={view === 'map' ? colors.white : colors.kartoLight} />
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          <FilterChip
            label={t('shops.filterOpen')}
            active={activeFilters.has('open')}
            onPress={() => toggleFilter('open')}
          />
          <FilterChip
            label={t('shops.filterPartners')}
            active={activeFilters.has('partners')}
            onPress={() => toggleFilter('partners')}
          />
          <FilterChip
            label={t('shops.filterNearby')}
            active={activeFilters.has('nearby')}
            onPress={() => toggleFilter('nearby')}
          />
        </ScrollView>
      </View>

      {/* Location fallback banner */}
      {locationFallback && (
        <View style={styles.fallbackBanner}>
          <MapPin size={14} color={colors.warning} />
          <Text style={styles.fallbackText}>{t('shops.locationFallback')}</Text>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </ScrollView>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('common.error')}</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn} accessibilityRole="button">
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : view === 'list' ? (
        <FlatList
          data={filteredShops}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <ShopCard shop={item} onPress={() => handleShopPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.karto}
              colors={[colors.karto]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <MapPin size={40} color={colors.border} strokeWidth={1.5} />
              <Text style={styles.emptyText}>{t('shops.empty')}</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }}
          >
            {filteredShops.map((shop) => (
              <Marker
                key={shop.id}
                coordinate={{ latitude: shop.lat, longitude: shop.lng }}
                onPress={() => handleMarkerPress(shop)}
                pinColor={shop.isPartner ? colors.karto : colors.textMuted}
              >
                <Callout tooltip>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>{shop.name}</Text>
                    <Text style={styles.calloutMeta}>
                      {shop.rating.toFixed(1)} ★  ·  {shop.hours}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Bottom sheet — shown when a pin is tapped */}
          {selectedShop && (
            <Pressable
              style={styles.mapBottomSheet}
              onPress={() => handleShopPress(selectedShop)}
              accessibilityRole="button"
              accessibilityLabel={selectedShop.name}
            >
              <View style={styles.mapSheetHandle} />
              <Text style={styles.mapSheetName}>{selectedShop.name}</Text>
              <Text style={styles.mapSheetAddress}>{selectedShop.address}</Text>
              <View style={styles.mapSheetMeta}>
                <View style={styles.ratingRow}>
                  <Star size={12} color={colors.orange} fill={colors.orange} strokeWidth={0} />
                  <Text style={styles.ratingText}>{selectedShop.rating.toFixed(1)}</Text>
                </View>
                {selectedShop.distance !== undefined && (
                  <Text style={styles.distance}>{t('shops.km', { distance: selectedShop.distance })}</Text>
                )}
                <Text style={[styles.openBadge, !selectedShop.isOpenNow && styles.closedBadge]}>
                  {selectedShop.isOpenNow ? t('shops.openNow') : t('shops.closed')}
                </Text>
              </View>
              <Pressable
                style={styles.mapSheetClose}
                onPress={() => setSelectedShop(null)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Text style={styles.mapSheetCloseText}>✕</Text>
              </Pressable>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.karto,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  title: { ...typography.h1, color: colors.white },
  subtitle: { ...typography.body, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Segmented
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    padding: 3,
    gap: 2,
  },
  segBtn: {
    width: 36,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: {
    backgroundColor: colors.kartoLight,
  },

  // Filters
  filtersRow: { marginTop: spacing.sm },
  filtersContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.kartoSurface,
    borderColor: colors.kartoLight,
  },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.karto, fontFamily: 'Inter_600SemiBold' },

  // Fallback
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fallbackText: { ...typography.caption, color: colors.warningDeep, flex: 1 },

  // List
  listContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardName: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  cardAddress: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { ...typography.caption, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary },
  reviewCount: { ...typography.caption, color: colors.textMuted },
  distance: { ...typography.caption, color: colors.karto },
  openBadge: {
    ...typography.tiny,
    color: colors.success,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closedBadge: { color: colors.textMuted },

  // Empty / loading / error
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  errorText: { ...typography.body, color: colors.danger },
  retryBtn: {
    backgroundColor: colors.karto,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryText: { ...typography.body, color: colors.white },

  // Map
  mapContainer: { flex: 1, position: 'relative' },

  // Callout
  callout: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    minWidth: 160,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  calloutName: { ...typography.h3, fontSize: 13, color: colors.textPrimary },
  calloutMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  // Map bottom sheet
  mapBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  mapSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  mapSheetName: { ...typography.h2, color: colors.textPrimary },
  mapSheetAddress: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  mapSheetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  mapSheetClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSheetCloseText: { ...typography.body, color: colors.textSecondary },
});

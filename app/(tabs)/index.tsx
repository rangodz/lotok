import React, { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  Battery,
  Bell,
  ChevronRight,
  Disc,
  Droplet,
  Fan,
  Fuel,
  MoveVertical,
  Plus,
  RefreshCw,
  Search,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/lib/theme';
import { categories } from '@/lib/mock';
import { useVehicleStore } from '@/stores/vehicleStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card } from '@/components/ui';

const categoryIcons: Record<
  string,
  React.ComponentType<{ size: number; color: string; strokeWidth: number }>
> = {
  droplet:         Droplet,
  wind:            Wind,
  disc:            Disc,
  fan:             Fan,
  zap:             Zap,
  battery:         Battery,
  fuel:            Fuel,
  'move-vertical': MoveVertical,
};

const MARKET_LABEL: Record<string, string> = {
  CN:   'marketCN',
  EU:   'marketEU',
  MENA: 'marketMENA',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { getActiveVehicle } = useVehicleStore();
  const { userMode, userName } = useSettingsStore();
  const isPro = userMode === 'pro';
  const active = getActiveVehicle();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800)); // no-op in mock
    setRefreshing(false);
  };

  const handleCategoryPress = async (catId: string) => {
    await Haptics.selectionAsync();
    router.push(`/parts/${catId}`);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.karto}
            colors={[colors.karto]}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {isPro ? <Wrench size={20} color={colors.white} /> : 'S'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.greetingMuted}>
                {isPro ? t('home.workshopTitle') : t('home.greeting')}
              </Text>
              <Text style={styles.greetingName}>
                {userName || 'Salah'}
              </Text>
            </View>
            <Pressable
              style={styles.iconButton}
              accessibilityLabel={t('home.notificationsLabel')}
              accessibilityRole="button"
            >
              <Bell size={20} color={colors.white} />
            </Pressable>
          </View>

          {/* Vehicle selector */}
          {active ? (
            <Pressable
              style={styles.vehicleCard}
              accessibilityRole="button"
              accessibilityLabel={`${active.brand} ${active.model}`}
              onPress={() => router.push('/garage')}
            >
              <View style={styles.vehicleIcon}>
                <Text style={styles.vehicleIconText}>🚗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleName}>
                  {active.brand} {active.model}
                </Text>
                <Text style={styles.vehicleMeta}>
                  {active.engine} · {active.year} · {t(`home.${MARKET_LABEL[active.market] ?? 'marketEU'}`)}
                </Text>
              </View>
              <RefreshCw size={18} color={colors.kartoLight} />
            </Pressable>
          ) : (
            <Pressable
              style={styles.vehicleCardEmpty}
              accessibilityRole="button"
              accessibilityLabel={t('home.addVehicle')}
              onPress={() => router.push('/garage/add')}
            >
              <View style={[styles.vehicleIcon, { backgroundColor: colors.kartoSurface }]}>
                <Plus size={20} color={colors.karto} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleName}>{t('home.noVehicle')}</Text>
                <Text style={styles.vehicleMeta}>{t('home.addVehiclePrompt')}</Text>
              </View>
              <ChevronRight size={18} color={colors.kartoLight} />
            </Pressable>
          )}
        </View>

        {/* Search bar */}
        <View style={styles.content}>
          <Pressable
            style={styles.searchBar}
            accessibilityRole="search"
            accessibilityLabel={t('home.searchPlaceholder')}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Search size={20} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>{t('home.searchPlaceholder')}</Text>
          </Pressable>

          {/* Categories */}
          <Text style={styles.sectionTitle}>{t('home.categoriesTitle')}</Text>
          <View style={styles.grid}>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.icon] ?? Droplet;
              return (
                <Pressable
                  key={cat.id}
                  style={styles.gridItem}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                  onPress={() => handleCategoryPress(cat.id)}
                >
                  <View style={styles.gridIconWrap}>
                    <Icon size={22} color={colors.karto} strokeWidth={2} />
                  </View>
                  <Text style={styles.gridLabel}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Maintenance alert */}
          {active && (
            <>
              <Text style={styles.sectionTitle}>{t('home.maintenanceSection')}</Text>
              <Card style={styles.maintenanceCard}>
                <View style={styles.maintenanceIconWrap}>
                  <Droplet size={20} color={colors.orangeDeep} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.maintenanceTitle}>{t('home.maintenanceAlert')}</Text>
                  <Text style={styles.maintenanceMeta}>{t('home.maintenanceMeta')}</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.karto,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.kartoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3, color: colors.white },
  greetingMuted: { ...typography.caption, color: colors.kartoPale },
  greetingName: { ...typography.h2, color: colors.white },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  vehicleCard: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.md,
  },
  vehicleCardEmpty: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.kartoLight,
    ...shadow.xs,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIconText: { fontSize: 22 },
  vehicleName: { ...typography.h3, color: colors.textPrimary },
  vehicleMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  content: { paddingHorizontal: spacing.md },

  searchBar: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchPlaceholder: { ...typography.bodyL, color: colors.textMuted },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItem: {
    width: '23%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 6,
    ...shadow.xs,
  },
  gridIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.kartoSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: { ...typography.caption, color: colors.textSecondary },

  maintenanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  maintenanceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintenanceTitle: { ...typography.h3, fontSize: 15, color: colors.textPrimary },
  maintenanceMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});

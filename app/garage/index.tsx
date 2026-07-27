import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Car, CheckCircle2, Plus } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { useVehicleStore, type UserVehicle } from '@/stores/vehicleStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Badge, Card, EmptyState } from '@/components/ui';

// ── Maintenance calculation ───────────────────────────────────────────────────

interface MaintenanceItem {
  labelKey: string;
  interval: number; // km
  defaultBase: number; // starting mileage reference
}

const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  { labelKey: 'garage.oilChange',  interval: 10000, defaultBase: 0 },
  { labelKey: 'garage.brakes',     interval: 30000, defaultBase: 0 },
  { labelKey: 'garage.timing',     interval: 90000, defaultBase: 0 },
];

type Urgency = 'green' | 'amber' | 'red';

function getUrgency(remaining: number): Urgency {
  if (remaining < 0)    return 'red';
  if (remaining < 2000) return 'red';
  if (remaining < 5000) return 'amber';
  return 'green';
}

const urgencyColor: Record<Urgency, string> = {
  green: colors.success,
  amber: colors.warning,
  red:   colors.danger,
};

// ── Vehicle card ──────────────────────────────────────────────────────────────

function VehicleCard({
  vehicle,
  isActive,
  isPro,
  onSetActive,
}: {
  vehicle: UserVehicle;
  isActive: boolean;
  isPro: boolean;
  onSetActive: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onSetActive}
      accessibilityRole="button"
      accessibilityLabel={`${vehicle.brand} ${vehicle.model}`}
      accessibilityState={{ selected: isActive }}
    >
      <Card style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}>
        <View style={styles.vehicleCardTop}>
          <View style={styles.vehicleAvatar}>
            <Car size={22} color={isActive ? colors.karto : colors.textMuted} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleTitle}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={styles.vehicleMeta}>
              {vehicle.year} · {vehicle.engine}
            </Text>
            {isPro && vehicle.clientName && (
              <Text style={styles.vehicleClient}>
                {t('garage.clientLabel')} : {vehicle.clientName}
              </Text>
            )}
          </View>
          {isActive && (
            <Badge label={t('garage.active')} variant="success" />
          )}
        </View>

        <View style={styles.vehicleFooter}>
          <Text style={styles.vehicleKm}>
            {t('garage.mileage', { km: vehicle.mileage.toLocaleString('fr-FR') })}
          </Text>
          <Badge label={vehicle.market} variant={vehicle.market === 'CN' ? 'danger' : vehicle.market === 'MENA' ? 'warning' : 'neutral'} />
        </View>
      </Card>
    </Pressable>
  );
}

// ── Maintenance row ───────────────────────────────────────────────────────────

function MaintenanceRow({ item, mileage }: { item: MaintenanceItem; mileage: number }) {
  const { t } = useTranslation();
  const nextService = Math.ceil(mileage / item.interval) * item.interval;
  const remaining = nextService - mileage;
  const urgency = getUrgency(remaining);
  const dot = urgencyColor[urgency];

  return (
    <View style={styles.maintenanceRow}>
      <View style={[styles.urgencyDot, { backgroundColor: dot }]} />
      <Text style={styles.maintenanceLabel}>{t(item.labelKey as Parameters<typeof t>[0])}</Text>
      <Text style={[styles.maintenanceDue, { color: dot }]}>
        {remaining <= 0
          ? t('garage.overdue')
          : t('garage.dueIn', { km: remaining.toLocaleString('fr-FR') })}
      </Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function GarageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { vehicles, activeVehicleId, setActiveVehicle, getActiveVehicle } = useVehicleStore();
  const { userMode } = useSettingsStore();
  const isPro = userMode === 'pro';
  const active = getActiveVehicle();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('garage.title')}</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/garage/add')}
          accessibilityRole="button"
          accessibilityLabel={t('garage.addVehicle')}
        >
          <Plus size={20} color={colors.karto} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle list */}
        {vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title={t('garage.empty')}
            cta={t('garage.addVehicle')}
            onCta={() => router.push('/garage/add')}
          />
        ) : (
          <View style={styles.vehicleList}>
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isActive={v.id === activeVehicleId}
                isPro={isPro}
                onSetActive={() => setActiveVehicle(v.id)}
              />
            ))}
          </View>
        )}

        {/* Maintenance section — only when active vehicle exists */}
        {active && (
          <View>
            <Text style={styles.sectionTitle}>{t('garage.maintenance')}</Text>
            <Card>
              {MAINTENANCE_ITEMS.map((item, i) => (
                <View key={item.labelKey}>
                  {i > 0 && <View style={styles.divider} />}
                  <MaintenanceRow item={item} mileage={active.mileage} />
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary, flex: 1 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.kartoSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: spacing.md,
    paddingBottom: 40,
    gap: spacing.lg,
  },

  // Vehicle list
  vehicleList: { gap: spacing.md },
  vehicleCard: { gap: spacing.sm },
  vehicleCardActive: {
    borderWidth: 2,
    borderColor: colors.karto,
    backgroundColor: colors.kartoSurface,
  },
  vehicleCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  vehicleAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTitle: { ...typography.h3, color: colors.textPrimary },
  vehicleMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  vehicleClient: { ...typography.caption, color: colors.karto, marginTop: 2 },
  vehicleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vehicleKm: { ...typography.caption, color: colors.textMuted },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.karto,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ctaButtonText: { ...typography.h3, color: colors.white },

  // Section title
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // Maintenance
  maintenanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: spacing.sm,
  },
  urgencyDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    flexShrink: 0,
  },
  maintenanceLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  maintenanceDue: { ...typography.caption, fontFamily: 'Inter_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});

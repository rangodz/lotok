import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useVehicleStore } from '@/stores/vehicleStore';
import { colors, fonts, spacing, typography } from '@/lib/theme';
import { ltrText, rtlFlip } from '@/lib/rtl';

interface VehicleBarProps {
  /** Called when the user taps "Changer" or the empty-state row. */
  onChangePress?: () => void;
}

/**
 * Sticky context banner showing the active vehicle.
 * Pulls directly from vehicleStore — no props needed for data.
 * RTL-safe: engine code and year are forced LTR (technical identifiers).
 */
export function VehicleBar({ onChangePress }: VehicleBarProps) {
  const vehicle = useVehicleStore((s) => s.getActiveVehicle());
  const ChevronIcon = rtlFlip(ChevronRight, ChevronLeft);

  if (!vehicle) {
    return (
      <Pressable
        style={styles.root}
        onPress={onChangePress}
        accessibilityRole="button"
        accessibilityLabel="Ajouter un véhicule"
      >
        <View style={styles.iconWrap}>
          <Plus size={16} color={colors.karto} strokeWidth={2.5} />
        </View>
        <Text style={styles.emptyText}>Ajouter un véhicule</Text>
        <ChevronIcon size={16} color={colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.root}
      onPress={onChangePress}
      accessibilityRole="button"
      accessibilityLabel={`Véhicule actif : ${vehicle.brand} ${vehicle.model}. Appuyer pour changer.`}
    >
      <View style={styles.iconWrap}>
        <Car size={16} color={colors.karto} strokeWidth={2} />
      </View>
      <View style={styles.info}>
        <Text style={styles.vehicleName} numberOfLines={1}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <Text style={[styles.engineCode, ltrText]} numberOfLines={1}>
          {vehicle.engineCode} · {vehicle.year}
        </Text>
      </View>
      <Text style={styles.changeLink}>Changer</Text>
      <ChevronIcon size={14} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.kartoSurface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
    // minWidth: 0 enables numberOfLines truncation inside flex children
    minWidth: 0,
  },
  vehicleName: {
    ...typography.body,
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
  engineCode: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.body,
    color: colors.karto,
    flex: 1,
  },
  changeLink: {
    ...typography.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.karto,
    flexShrink: 0,
  },
});

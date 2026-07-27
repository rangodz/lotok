import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import {
  BatteryMedium,
  Disc3,
  Droplet,
  Link2,
  Minus,
  Package,
  Settings2,
  Wind,
  Zap,
} from 'lucide-react-native';
import { colors, fonts, spacing, typography } from '@/lib/theme';
import { ltrText } from '@/lib/rtl';

type IconComponent = React.ComponentType<{
  size: number;
  color: string;
  strokeWidth: number;
}>;

/** Maps category slugs (from the DB seed) to a representative icon. */
const CATEGORY_ICONS: Record<string, IconComponent> = {
  'oil-filter': Droplet,
  'air-filter': Wind,
  'brake-pads': Disc3,
  'spark-plugs': Zap,
  'timing-belt': Link2,
  'battery': BatteryMedium,
  'wiper-blades': Minus,
  'transmission': Settings2,
};

interface PartThumbnailProps {
  /** Remote image URL. If absent or on error, the category icon is shown. */
  imageUri?: string;
  /** Category slug used to select the fallback icon. */
  categoryId: string;
  /** Square size in dp. Defaults to 64. */
  size?: number;
  /** OEM / aftermarket reference — always rendered LTR. */
  partRef?: string;
}

/**
 * Square part thumbnail with a mandatory category-icon fallback.
 *
 * - No layout shift: container is always `size × size`.
 * - Image fades in (200 ms) once loaded via expo-image transition.
 * - Falls back to the category icon on error or when no URI is provided.
 * - `partRef` is forced LTR (technical identifier — never reversed in Arabic).
 */
export function PartThumbnail({
  imageUri,
  categoryId,
  size = 64,
  partRef,
}: PartThumbnailProps) {
  const [imageError, setImageError] = React.useState(false);
  const showImage = !!imageUri && !imageError;

  const Icon = CATEGORY_ICONS[categoryId] ?? Package;
  const iconSize = Math.round(size * 0.38);
  const br = Math.max(4, Math.round(size * 0.08));

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.container, { width: size, height: size, borderRadius: br }]}
        accessibilityRole="image"
        accessibilityLabel={partRef ? `Pièce ${partRef}` : 'Image de pièce'}
      >
        {/* Fallback icon — always rendered; sits beneath the image */}
        <Icon size={iconSize} color={colors.textMuted} strokeWidth={1.5} />

        {/* Remote image — absolutely positioned, fades over the icon */}
        {showImage ? (
          <Image
            source={{ uri: imageUri }}
            style={[StyleSheet.absoluteFill, { borderRadius: br }]}
            contentFit="cover"
            transition={200}
            onError={() => setImageError(true)}
          />
        ) : null}
      </View>

      {partRef ? (
        <Text style={[styles.partRef, ltrText]} numberOfLines={1}>
          {partRef}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  container: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  partRef: {
    ...typography.tiny,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
});

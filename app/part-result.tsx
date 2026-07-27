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
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/lib/theme';
import { oilFilterResult as data } from '@/lib/mock';
import { Badge, Button, Card, Stars } from '@/components/ui';

export default function PartResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* ------------------------------- Header ------------------------------ */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>{data.category}</Text>
          <Text style={styles.headerSubtitle}>{data.vehicleLabel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ------------------------------- OEM -------------------------------- */}
        <View style={styles.oemCard}>
          <View style={styles.oemHeader}>
            <ShieldCheck size={18} color={colors.kartoPale} />
            <Text style={styles.oemLabel}>Référence OEM officielle</Text>
          </View>
          <View style={styles.oemRow}>
            <Text style={styles.oemCode}>{data.oem.code}</Text>
            <Pressable style={styles.copyButton} accessibilityLabel="Copier la référence">
              <Copy size={16} color={colors.white} />
            </Pressable>
          </View>
          <Text style={styles.oemNote}>{data.oem.note}</Text>
        </View>

        {/* ---------------------------- Équivalents ---------------------------- */}
        <Text style={styles.sectionTitle}>Marques compatibles vérifiées</Text>
        <View style={{ gap: spacing.sm }}>
          {data.equivalents.map((part) => (
            <Card key={part.ref} style={styles.partCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.partTopRow}>
                  <Text style={styles.partName}>
                    {part.manufacturer}{' '}
                    <Text style={styles.partRef}>{part.ref}</Text>
                  </Text>
                  <Stars tier={part.tier} />
                </View>
                <View style={styles.partMetaRow}>
                  <Badge
                    label={part.tierLabel}
                    variant={part.tier === 3 ? 'success' : 'neutral'}
                  />
                  <Text style={styles.partPrice}>
                    {part.priceMin.toLocaleString('fr-FR')} –{' '}
                    {part.priceMax.toLocaleString('fr-FR')} DA
                  </Text>
                </View>
                <Text style={styles.partShops}>
                  Disponible dans {part.shopsCount} magasin
                  {part.shopsCount > 1 ? 's' : ''} à Béjaïa
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* ------------------------- Marques à éviter -------------------------- */}
        <Text style={styles.sectionTitle}>Marques à éviter</Text>
        <Card style={styles.avoidCard}>
          {data.avoid.map((item, i) => (
            <View
              key={item.ref}
              style={[
                styles.avoidRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.warningBorder },
              ]}
            >
              <XCircle size={18} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.avoidName}>
                  {item.brand} {item.ref}
                </Text>
                <Text style={styles.avoidReason}>{item.reason}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* --------------------------- Contrefaçon ----------------------------- */}
        <Text style={styles.sectionTitle}>Contrefaçon connue</Text>
        <Card style={styles.counterfeitCard}>
          <View style={styles.counterfeitHeader}>
            <AlertTriangle size={20} color={colors.dangerDeep} />
            <Text style={styles.counterfeitTitle}>
              « {data.counterfeit.brand} » — {data.counterfeit.ref}
            </Text>
          </View>
          {data.counterfeit.signs.map((sign) => (
            <View key={sign} style={styles.signRow}>
              <View style={styles.signDot} />
              <Text style={styles.signText}>{sign}</Text>
            </View>
          ))}
          <Text style={styles.counterfeitFooter}>
            Signalée 12 fois par la communauté Lotok
          </Text>
        </Card>
      </ScrollView>

      {/* -------------------------------- CTA --------------------------------- */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button
          variant="cta"
          title="Trouver près de moi"
          onPress={() => {}}
        />
        <View style={styles.ctaHintRow}>
          <MapPin size={14} color={colors.textMuted} />
          <Text style={styles.ctaHint}>3 magasins dans un rayon de 5 km</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  headerSubtitle: { ...typography.caption, color: colors.textSecondary },

  oemCard: {
    backgroundColor: colors.karto,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.md,
  },
  oemHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oemLabel: {
    ...typography.tiny,
    color: colors.kartoPale,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  oemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  oemCode: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    color: colors.white,
    letterSpacing: 0.5,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oemNote: { ...typography.caption, color: colors.kartoNote, marginTop: spacing.sm },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  partCard: { flexDirection: 'row' },
  partTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partName: { ...typography.h3, fontSize: 16, color: colors.textPrimary },
  partRef: { fontFamily: 'Inter_500Medium', color: colors.textSecondary },
  partMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  partPrice: { ...typography.bodyL, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary },
  partShops: { ...typography.caption, color: colors.success, marginTop: 6 },

  avoidCard: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    padding: 0,
    overflow: 'hidden',
  },
  avoidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  avoidName: { ...typography.h3, fontSize: 14, color: colors.warningDeep },
  avoidReason: { ...typography.caption, color: colors.warningMid },

  counterfeitCard: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  counterfeitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  counterfeitTitle: {
    ...typography.h3,
    fontSize: 15,
    color: colors.dangerDeep,
    flex: 1,
  },
  signRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  signDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.dangerDeep,
    marginTop: 7,
  },
  signText: { ...typography.body, color: colors.dangerDarker, flex: 1 },
  counterfeitFooter: {
    ...typography.caption,
    color: colors.dangerDeep,
    marginTop: spacing.sm,
    fontFamily: 'Inter_600SemiBold',
  },

  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  ctaHint: { ...typography.caption, color: colors.textMuted },
});

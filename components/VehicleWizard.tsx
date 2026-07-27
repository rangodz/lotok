import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, Search } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import {
  BRANDS,
  ENGINES,
  MODELS,
  YEARS,
  getEnginesForModel,
  getModelsForBrand,
  type Brand,
  type EngineOption,
  type Market,
  type VehicleModel,
} from '@/lib/data/vehicles';
import { Badge } from '@/components/ui';

export interface NewVehicle {
  brandId: string;
  brand: string;
  modelId: string;
  model: string;
  year: string;
  engineId: string;
  engine: string;
  engineCode: string;
  market: Market;
}

interface Props {
  onComplete: (vehicle: NewVehicle) => void;
  onCancel?: () => void;
}

type Step = 0 | 1 | 2 | 3 | 4; // 4 = confirm

interface Selection {
  brandId: string;
  brand: string;
  modelId: string;
  model: string;
  year: string;
  engineId: string;
  engine: string;
  engineCode: string;
  market: Market;
}

const MARKET_BADGE: Record<Market, { label: string; variant: 'danger' | 'warning' | 'neutral' }> = {
  CN:   { label: 'CN',   variant: 'danger' },
  MENA: { label: 'MENA', variant: 'warning' },
  EU:   { label: 'EU',   variant: 'neutral' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: Step }) {
  return (
    <View style={styles.progressBar}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            i < step
              ? styles.progressDone
              : i === step
              ? styles.progressActive
              : styles.progressPending,
          ]}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Market note — shown on engine step when market ≠ EU
// ─────────────────────────────────────────────────────────────────────────────
function MarketNote({ note }: { note: string }) {
  return (
    <View style={styles.marketNote}>
      <Text style={styles.marketNoteText}>{note}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main wizard
// ─────────────────────────────────────────────────────────────────────────────
export default function VehicleWizard({ onComplete, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>(0);
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState<Partial<Selection>>({});
  const searchRef = useRef<TextInput>(null);

  const goBack = () => {
    if (step === 0) {
      onCancel?.();
    } else {
      setStep((step - 1) as Step);
      setSearch('');
    }
  };

  // ── Step 0 — Brand ─────────────────────────────────────────────────────────
  const filteredBrands = useMemo(
    () =>
      search.trim()
        ? BRANDS.filter((b) =>
            b.name.toLowerCase().includes(search.toLowerCase())
          )
        : BRANDS,
    [search]
  );

  const renderBrand = ({ item }: { item: Brand }) => (
    <Pressable
      style={styles.brandItem}
      onPress={() => {
        setSel({ brandId: item.id, brand: item.name });
        setSearch('');
        setStep(1);
      }}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      <View style={[styles.brandAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.brandInitials}>{item.initials}</Text>
      </View>
      <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
    </Pressable>
  );

  // ── Step 1 — Model ─────────────────────────────────────────────────────────
  const models = useMemo(
    () => getModelsForBrand(sel.brandId ?? ''),
    [sel.brandId]
  );

  const filteredModels = useMemo(
    () =>
      search.trim()
        ? models.filter((m) =>
            m.name.toLowerCase().includes(search.toLowerCase())
          )
        : models,
    [search, models]
  );

  const renderModel = ({ item }: { item: VehicleModel }) => (
    <Pressable
      style={styles.listRow}
      onPress={() => {
        setSel((s) => ({ ...s, modelId: item.id, model: item.name }));
        setSearch('');
        setStep(2);
      }}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      <Text style={styles.listRowText}>{item.name}</Text>
    </Pressable>
  );

  // ── Step 2 — Year ──────────────────────────────────────────────────────────
  const renderYear = ({ item }: { item: string }) => (
    <Pressable
      style={styles.listRow}
      onPress={() => {
        setSel((s) => ({ ...s, year: item }));
        setStep(3);
      }}
      accessibilityRole="button"
      accessibilityLabel={item}
    >
      <Text style={styles.listRowText}>{item}</Text>
    </Pressable>
  );

  // ── Step 3 — Engine ────────────────────────────────────────────────────────
  const engines = useMemo(
    () => getEnginesForModel(sel.modelId ?? ''),
    [sel.modelId]
  );

  const renderEngine = ({ item }: { item: EngineOption }) => {
    const badge = MARKET_BADGE[item.market];
    return (
      <Pressable
        style={styles.engineRow}
        onPress={() => {
          const updated: Partial<Selection> = {
            ...sel,
            engineId: item.id,
            engine: item.label,
            engineCode: item.code,
            market: item.market,
          };
          setSel(updated);
          setStep(4);
        }}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        <View style={styles.engineMain}>
          <Text style={styles.engineLabel}>{item.label}</Text>
          <Text style={styles.engineCode}>Code : {item.code}</Text>
        </View>
        <Badge label={badge.label} variant={badge.variant} />
      </Pressable>
    );
  };

  // ── Step 4 — Confirm ───────────────────────────────────────────────────────
  const handleConfirm = () => {
    const v = sel as Selection;
    onComplete({
      brandId: v.brandId,
      brand: v.brand,
      modelId: v.modelId,
      model: v.model,
      year: v.year,
      engineId: v.engineId,
      engine: v.engine,
      engineCode: v.engineCode,
      market: v.market,
    });
  };

  // ── Step label & subtitle ──────────────────────────────────────────────────
  const STEP_LABELS = [
    'onboarding.brandLabel',
    'onboarding.modelLabel',
    'onboarding.yearLabel',
    'onboarding.engineLabel',
  ] as const;
  const labelIdx = (step < 4 ? step : 3) as 0 | 1 | 2 | 3;
  const stepLabelKey = STEP_LABELS[labelIdx];

  const showSearch = step < 2;
  const showProgress = step < 4;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={22} color={colors.white} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {step < 4 ? t('onboarding.addVehicleTitle') : t('onboarding.confirmTitle')}
          </Text>
          {showProgress && (
            <Text style={styles.headerSub}>
              {t('onboarding.addVehicleSubtitle', { step: step + 1 })}
            </Text>
          )}
        </View>
      </View>

      {/* Progress bar */}
      {showProgress && <ProgressBar step={step} />}

      {/* Breadcrumb chips */}
      {step > 0 && step < 4 && (
        <View style={styles.breadcrumbs}>
          {sel.brand && <View style={styles.chip}><Text style={styles.chipText}>{sel.brand}</Text></View>}
          {sel.model && step > 1 && <View style={styles.chip}><Text style={styles.chipText}>{sel.model}</Text></View>}
          {sel.year && step > 2 && <View style={styles.chip}><Text style={styles.chipText}>{sel.year}</Text></View>}
        </View>
      )}

      {/* Search bar (steps 0-1) */}
      {showSearch && (
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder={t('onboarding.searchBrand')}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              accessibilityLabel="Rechercher"
            />
          </View>
        </View>
      )}

      {/* Step label */}
      {step < 4 && (
        <Text style={styles.stepLabel}>{t(stepLabelKey)}</Text>
      )}

      {/* Content */}
      {step === 0 && (
        <FlatList
          data={filteredBrands}
          keyExtractor={(b) => b.id}
          renderItem={renderBrand}
          numColumns={3}
          columnWrapperStyle={styles.brandRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {step === 1 && (
        <FlatList
          data={filteredModels}
          keyExtractor={(m) => m.id}
          renderItem={renderModel}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('common.empty')}</Text>
            </View>
          }
        />
      )}

      {step === 2 && (
        <FlatList
          data={YEARS}
          keyExtractor={(y) => y}
          renderItem={renderYear}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {step === 3 && (
        <FlatList
          data={engines}
          keyExtractor={(e) => e.id}
          renderItem={renderEngine}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('common.empty')}</Text>
            </View>
          }
        />
      )}

      {step === 4 && (
        <View style={styles.confirmContent}>
          {/* Vehicle recap card */}
          <View style={styles.confirmCard}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmFieldLabel}>{t('onboarding.brandLabel')}</Text>
              <Text style={styles.confirmFieldValue}>{sel.brand}</Text>
            </View>
            <View style={[styles.confirmRow, styles.confirmRowBorder]}>
              <Text style={styles.confirmFieldLabel}>{t('onboarding.modelLabel')}</Text>
              <Text style={styles.confirmFieldValue}>{sel.model}</Text>
            </View>
            <View style={[styles.confirmRow, styles.confirmRowBorder]}>
              <Text style={styles.confirmFieldLabel}>{t('onboarding.yearLabel')}</Text>
              <Text style={styles.confirmFieldValue}>{sel.year}</Text>
            </View>
            <View style={[styles.confirmRow, styles.confirmRowBorder]}>
              <Text style={styles.confirmFieldLabel}>{t('onboarding.engineLabel')}</Text>
              <View style={styles.confirmEngineRow}>
                <Text style={styles.confirmFieldValue}>{sel.engine}</Text>
                {sel.market && (
                  <Badge label={MARKET_BADGE[sel.market].label} variant={MARKET_BADGE[sel.market].variant} />
                )}
              </View>
            </View>
          </View>

          {/* Market note if CN or MENA */}
          {sel.market === 'CN' && (
            <MarketNote note={t('onboarding.marketCN')} />
          )}
          {sel.market === 'MENA' && (
            <MarketNote note={t('onboarding.marketMENA')} />
          )}

          {/* Check icon */}
          <CheckCircle2 size={56} color={colors.success} style={styles.confirmIcon} strokeWidth={1.5} />

          {/* CTA */}
          <Pressable
            style={styles.ctaButton}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.addToGarage')}
          >
            <Text style={styles.ctaButtonText}>{t('onboarding.addToGarage')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    backgroundColor: colors.karto,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { flex: 1 },
  headerTitle: { ...typography.h2, color: colors.white },
  headerSub: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Progress
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.karto,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
  progressDone: { backgroundColor: colors.orangeLight },
  progressActive: { backgroundColor: colors.orange },
  progressPending: { backgroundColor: 'rgba(255,255,255,0.2)' },

  // Breadcrumbs
  breadcrumbs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: { ...typography.caption, color: colors.textSecondary },

  // Search
  searchWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  // Step label
  stepLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  // List
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 40 },

  // Brand grid
  brandRow: { gap: spacing.sm, marginBottom: spacing.sm },
  brandItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  brandAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitials: { ...typography.h3, color: colors.textPrimary },
  brandName: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  // Model / Year rows
  listRow: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  listRowText: { ...typography.bodyL, color: colors.textPrimary },

  // Engine row
  engineRow: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  engineMain: { flex: 1, gap: 2 },
  engineLabel: { ...typography.bodyL, color: colors.textPrimary },
  engineCode: { ...typography.caption, color: colors.textSecondary },

  // Confirm
  confirmContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  confirmCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  confirmRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  confirmFieldLabel: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  confirmFieldValue: { ...typography.bodyL, color: colors.textPrimary },
  confirmEngineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  confirmIcon: { alignSelf: 'center', marginTop: spacing.sm },
  ctaButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  ctaButtonText: { ...typography.h3, color: colors.white, fontSize: 16 },

  // Market note
  marketNote: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  marketNoteText: { ...typography.body, color: colors.warningDeep },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted },
});

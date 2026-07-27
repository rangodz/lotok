import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui';
import { useSearchByOem } from '@/hooks/useParts';
import { ltrText } from '@/lib/rtl';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const { data: results, isLoading, isError, refetch } = useSearchByOem(query);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('search.title')}</Text>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            accessibilityLabel={t('search.placeholder')}
          />
        </View>
        <Text style={styles.hint}>{t('search.hint')}</Text>
      </View>

      {isLoading && query.length >= 3 ? (
        <View style={styles.content}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </View>
      ) : isError ? (
        <ErrorState
          message={t('common.error')}
          onRetry={() => refetch()}
          retryLabel={t('common.retry')}
        />
      ) : results && results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <Pressable
              style={styles.resultCard}
              onPress={() => router.push(`/parts/filtre-huile`)}
              accessibilityRole="button"
              accessibilityLabel={item.oem.code}
            >
              <Text style={[styles.resultCode, ltrText]}>{item.oem.code}</Text>
              <Text style={styles.resultLabel}>{item.category} · {item.vehicleLabel}</Text>
            </Pressable>
          )}
        />
      ) : (
        <EmptyState
          icon={Search}
          title={query.length >= 3 ? t('search.empty') : t('search.hint')}
          body={query.length >= 3 ? t('partResult.findNearMe') : undefined}
          cta={query.length >= 3 ? t('common.retry') : undefined}
          onCta={query.length >= 3 ? () => refetch() : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.karto,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { ...typography.h1, color: colors.white, marginBottom: spacing.md },
  searchBar: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: { flex: 1, ...typography.bodyL, color: colors.textPrimary },
  hint: { ...typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: spacing.sm },
  content: { padding: spacing.md, gap: spacing.sm },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  resultCode: {
    fontFamily: 'Sora_700Bold',
    fontSize: 18,
    color: colors.karto,
  },
  resultLabel: { ...typography.caption, color: colors.textSecondary },
});

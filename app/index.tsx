import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/lib/theme';
import { useSettingsStore } from '@/stores/settingsStore';

export default function Index() {
  const [hydrated, setHydrated] = useState(
    useSettingsStore.persist.hasHydrated()
  );
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);

  useEffect(() => {
    if (hydrated) return;
    const unsub = useSettingsStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    return unsub;
  }, [hydrated]);

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.karto,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}

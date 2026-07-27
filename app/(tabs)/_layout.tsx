import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Camera, Home, MapPin, Search, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/lib/theme';

type LucideIcon = React.ComponentType<{
  size: number;
  color: string;
  strokeWidth: number;
}>;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const activeRouteName = state.routes[state.index]?.name;

  const renderTab = (name: string, Icon: LucideIcon, label: string) => {
    const isActive = activeRouteName === name;
    const color = isActive ? colors.karto : colors.textMuted;
    return (
      <Pressable
        key={name}
        style={styles.tabItem}
        onPress={() => navigation.navigate(name)}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: isActive }}
      >
        <Icon size={22} color={color} strokeWidth={isActive ? 2.4 : 2} />
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 12 }]}>
      {renderTab('index', Home, t('tabs.home'))}
      {renderTab('search', Search, t('tabs.search'))}
      <Pressable
        style={styles.scanButton}
        onPress={() => navigation.navigate('scan')}
        accessibilityRole="button"
        accessibilityLabel={t('home.scanLabel')}
      >
        <Camera size={26} color={colors.white} strokeWidth={2.2} />
      </Pressable>
      {renderTab('shops', MapPin, t('tabs.shops'))}
      {renderTab('profile', User, t('tabs.profile'))}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="shops" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: { alignItems: 'center', gap: 2, width: 64 },
  tabLabel: { ...typography.tiny },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
});

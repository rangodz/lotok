import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedLanguage } from '@/lib/i18n';

export type UserMode = 'individual' | 'pro';

interface SettingsState {
  language: SupportedLanguage;
  userMode: UserMode;
  hasOnboarded: boolean;
  vehicleConfigured: boolean;
  isAuthenticated: boolean;
  userPhone: string;
  userName: string;
  setLanguage: (lang: SupportedLanguage) => void;
  setUserMode: (mode: UserMode) => void;
  setHasOnboarded: (v: boolean) => void;
  setVehicleConfigured: (v: boolean) => void;
  setAuthenticated: (phone: string) => void;
  setUserName: (name: string) => void;
  logout: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'fr',
      userMode: 'individual',
      hasOnboarded: false,
      vehicleConfigured: false,
      isAuthenticated: false,
      userPhone: '',
      userName: '',
      setLanguage: (language) => set({ language }),
      setUserMode: (userMode) => set({ userMode }),
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setVehicleConfigured: (vehicleConfigured) => set({ vehicleConfigured }),
      setAuthenticated: (phone) => set({ isAuthenticated: true, userPhone: phone }),
      setUserName: (userName) => set({ userName }),
      logout: () => set({ isAuthenticated: false, userPhone: '', userName: '' }),
    }),
    {
      name: 'lotok-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import fr from './fr.json';
import ar from './ar.json';
import en from './en.json';

const supportedLangs = ['fr', 'ar', 'en'] as const;
export type SupportedLanguage = (typeof supportedLangs)[number];

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'fr';
const lng: SupportedLanguage = (supportedLangs as readonly string[]).includes(deviceLang)
  ? (deviceLang as SupportedLanguage)
  : 'fr';

const options: InitOptions = {
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
    en: { translation: en },
  },
  lng,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
};

i18n.use(initReactI18next).init(options);

export default i18n;

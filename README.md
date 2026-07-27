# Karto

Application mobile pour propriétaires de voitures en Algérie — trouver la bonne pièce, éviter les contrefaçons, localiser les magasins de confiance.

## Stack

| Couche | Technologie |
|---|---|
| Framework | Expo SDK 54 · React 19 · React Native 0.81 |
| Navigation | expo-router v6 (file-based) |
| État global | Zustand v5 + AsyncStorage (persist) |
| Serveur | TanStack Query v5 + offline cache (AsyncStorage) |
| Backend | Supabase (optionnel — mock complet sans .env) |
| IA scan | Service externe (optionnel — mock aléatoire sans .env) |
| i18n | i18next v26 · FR / AR (RTL) / EN |
| Styles | StyleSheet natif · design tokens `lib/theme.ts` |
| Caméra | expo-camera · expo-image-picker · expo-haptics |
| Carte | react-native-maps |
| CI/CD | EAS Build |

## Setup rapide

```bash
# Cloner et installer
npm install

# Variables d'environnement (optionnel — l'app fonctionne sans)
cp .env .env.local   # modifier les valeurs

# Démarrer
npx expo start --clear
```

## Variables d'environnement

Fichier `.env` à la racine :

```env
# Supabase — laisser vide pour mode mock complet
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Service IA — laisser vide pour mock (résultat aléatoire en 2.5s)
EXPO_PUBLIC_AI_SERVICE_URL=
```

**L'app fonctionne entièrement sans backend** quand ces variables sont vides.

## Générer l'icône

```bash
npm install canvas
node scripts/generate-icon.js
# Produit : assets/icon.png · assets/adaptive-icon.png · assets/splash.png
```

## Architecture

```
app/
  (tabs)/           → 5 onglets : Home · Search · Scan · Shops · Profile
  (onboarding)/     → Welcome · Mode select · Add vehicle
  (auth)/           → Login (OTP +213) · Vérification OTP
  garage/           → Liste véhicules · Ajout
  parts/[id]        → Résultat pièce (OEM + équivalents + contrefaçons)
  shops/[id]        → Fiche magasin (horaires · actions · avis)
  scan-result.tsx   → Résultat scan fullScreenModal

lib/
  theme.ts          → Tokens design (PROTÉGÉ — source unique des couleurs)
  mock.ts           → Données mock (véhicule, pièces, 8 magasins Béjaïa, avis)
  repository.ts     → Interface + MockRepository + SupabaseRepository
  ai.ts             → identifyPart() — MockAI ou RealAI
  auth.ts           → signInWithOtp / verifyOtp
  supabase.ts       → Client Supabase + isSupabaseConfigured
  rtl.ts            → isRTL · rtlFlip() · ltrText
  i18n/             → Traductions FR · AR · EN

stores/
  settingsStore.ts  → language · userMode · isAuthenticated
  vehicleStore.ts   → vehicles[] · activeVehicleId

hooks/
  useParts.ts       → useCategories · usePartResult · useSearchByOem
  useShops.ts       → useShops(location) · useShop(id)
  useVehicleCatalog.ts → useBrands · useModels · useEngines

components/
  ui.tsx            → Card · Badge · Button · Stars · SectionTitle
                      EmptyState · ErrorState · SkeletonBlock · SkeletonCard
  VehicleWizard.tsx → Wizard 5 étapes (onboarding + garage)
```

## Mode démo

**OTP** : code `000000` accepté en mode mock.

**Scan** (en `__DEV__`) : 3 boutons discrets au-dessus du déclencheur :
- **C** → force `compatible` → haptic Success
- **I** → force `incompatible` → haptic Error
- **S** → force `suspect` → haptic Warning

## EAS Build

### Prérequis
```bash
npm install -g eas-cli
npx expo login
eas build:configure   # lie le projet à ton compte Expo
```

### Commandes

```bash
# Preview interne — APK Android direct
eas build --profile preview --platform android

# Preview iOS — IPA ad-hoc (nécessite Apple Developer Program)
eas build --profile preview --platform ios

# Les deux plateformes
eas build --profile preview --platform all

# Production (AAB Android + IPA App Store)
eas build --profile production --platform all
```

### Avant le build iOS
- Apple Developer Program actif ($99/an)
- Compléter dans `eas.json > submit > production > ios` :
  - `appleId` : ton identifiant Apple ID
  - `ascAppId` : ID App Store Connect de l'app
  - `appleTeamId` : Team ID (developer.apple.com → Membership)

### Google Maps (Android)
Remplacer `YOUR_GOOGLE_MAPS_API_KEY_HERE` dans `app.json` par une clé **Maps SDK for Android** activée sur Google Cloud Console.

## Règles développement

- `lib/theme.ts` — ne jamais modifier sans demande explicite
- `components/ui.tsx` — ajouter OK, ne pas modifier les exports existants
- Toutes les couleurs via `colors.*` de `lib/theme.ts`
- Modules natifs : `npx expo install <pkg>` · JS only : `npm install <pkg>`
- TypeScript strict — aucun `any`
- Après ajout de module natif : `npx expo start --clear`

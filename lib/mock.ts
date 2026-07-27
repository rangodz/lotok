/**
 * Mock data — basé sur le cas réel Skoda Kamiq 1.5 MPI (Béjaïa)
 */

export const activeVehicle = {
  brand: 'Skoda',
  model: 'Kamiq',
  engine: '1.5 MPI',
  engineCode: 'DJSA',
  year: 2023,
  market: 'CN',
  mileage: 32000,
};

export type CategoryItem = {
  id: string;
  label: string;
  icon: string; // lucide icon key
};

export const categories: CategoryItem[] = [
  { id: 'filtre-huile', label: 'Filtre huile', icon: 'droplet' },
  { id: 'filtre-air', label: 'Filtre air', icon: 'wind' },
  { id: 'plaquettes', label: 'Plaquettes', icon: 'disc' },
  { id: 'filtre-habitacle', label: 'Habitacle', icon: 'fan' },
  { id: 'bougies', label: 'Bougies', icon: 'zap' },
  { id: 'batterie', label: 'Batterie', icon: 'battery' },
  { id: 'filtre-carburant', label: 'Carburant', icon: 'fuel' },
  { id: 'amortisseurs', label: 'Amortis.', icon: 'move-vertical' },
];

export type AftermarketPart = {
  manufacturer: string;
  ref: string;
  tier: 1 | 2 | 3;
  tierLabel: string;
  priceMin: number;
  priceMax: number;
  shopsCount: number;
};

export const oilFilterResult = {
  category: 'Filtre à huile',
  vehicleLabel: 'Skoda Kamiq 1.5 MPI',
  oem: {
    code: '04E 115 561 S',
    brand: 'VAG',
    note: 'Filtre EA211 essence — version chinoise marché DZ',
  },
  equivalents: [
    {
      manufacturer: 'Mann-Filter',
      ref: 'W 712/95',
      tier: 3,
      tierLabel: 'Premium',
      priceMin: 3500,
      priceMax: 4500,
      shopsCount: 3,
    },
    {
      manufacturer: 'Bosch',
      ref: 'F 026 407 143',
      tier: 3,
      tierLabel: 'Premium',
      priceMin: 3200,
      priceMax: 4000,
      shopsCount: 2,
    },
    {
      manufacturer: 'Mahle',
      ref: 'OC 593',
      tier: 3,
      tierLabel: 'Premium',
      priceMin: 3000,
      priceMax: 3800,
      shopsCount: 2,
    },
    {
      manufacturer: 'Hengst',
      ref: 'H314W',
      tier: 2,
      tierLabel: 'Bon rapport',
      priceMin: 2800,
      priceMax: 3500,
      shopsCount: 1,
    },
  ] as AftermarketPart[],
  avoid: [
    { brand: 'Vestal', ref: 'VS-FH37', reason: 'Qualité douteuse' },
    { brand: 'Rafinium', ref: 'RFO1135', reason: 'Mauvaise référence' },
  ],
  counterfeit: {
    brand: 'MHO Germany',
    ref: '030 115 561 AB',
    signs: [
      'Logos VW + Audi factices sur le filtre',
      'Marque MHO inexistante chez VAG',
      'Référence pour anciens Polo 1.0/1.4 — pas EA211',
    ],
  },
};

// ── Shop types ────────────────────────────────────────────────────────────────

export interface Shop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  whatsapp?: string;
  rating: number;
  reviewCount: number;
  isPartner: boolean;
  brands: string[];
  hours: string;       // display string e.g. "08h – 18h"
  isOpenNow: boolean;
  distance?: number;   // km, computed at runtime based on user location
}

export interface ShopReview {
  id: string;
  shopId: string;
  authorName: string;
  authorInitials: string;
  rating: number;
  text: string;
  date: string; // relative label e.g. "il y a 2 jours"
}

// 8 shops around Béjaïa city (36.7509, 5.0567)
export const mockShops: Shop[] = [
  {
    id: 'shop-1',
    name: 'Filter Shop Béjaïa',
    address: 'Rue Amirouche, Béjaïa Centre',
    lat: 36.7521,
    lng: 5.0582,
    phone: '034123456',
    whatsapp: '0770123456',
    rating: 4.6,
    reviewCount: 89,
    isPartner: true,
    brands: ['Mann-Filter', 'Bosch', 'Mahle', 'NGK'],
    hours: '08h – 18h',
    isOpenNow: true,
  },
  {
    id: 'shop-2',
    name: 'Auto Pièces El Alia',
    address: 'Cité El Alia, Béjaïa',
    lat: 36.7480,
    lng: 5.0620,
    phone: '034234567',
    rating: 4.2,
    reviewCount: 47,
    isPartner: false,
    brands: ['Bosch', 'Hengst', 'Valeo'],
    hours: '08h – 17h30',
    isOpenNow: true,
  },
  {
    id: 'shop-3',
    name: 'Garage Idir Motors',
    address: 'Boulevard des FAR, Béjaïa',
    lat: 36.7550,
    lng: 5.0530,
    phone: '034345678',
    whatsapp: '0661345678',
    rating: 4.5,
    reviewCount: 63,
    isPartner: true,
    brands: ['Mann-Filter', 'Valeo', 'Febi', 'Bosch'],
    hours: '07h30 – 18h',
    isOpenNow: true,
  },
  {
    id: 'shop-4',
    name: 'Pièces Auto Youcef',
    address: 'Marché couvert, Béjaïa',
    lat: 36.7495,
    lng: 5.0595,
    phone: '034456789',
    rating: 3.9,
    reviewCount: 28,
    isPartner: false,
    brands: ['Hengst', 'Sofima', 'Champion'],
    hours: '09h – 17h',
    isOpenNow: false,
  },
  {
    id: 'shop-5',
    name: 'Centre Auto Tizi',
    address: 'Route de Tizi-Ouzou, Béjaïa',
    lat: 36.7440,
    lng: 5.0490,
    phone: '034567890',
    whatsapp: '0770567890',
    rating: 4.3,
    reviewCount: 55,
    isPartner: false,
    brands: ['NGK', 'Bosch', 'Mann-Filter', 'SKF'],
    hours: '08h – 19h',
    isOpenNow: true,
  },
  {
    id: 'shop-6',
    name: 'Mécanique Moderne Sidi Aich',
    address: 'Sidi Aich, wilaya de Béjaïa',
    lat: 36.6290,
    lng: 4.9090,
    phone: '034678901',
    rating: 4.0,
    reviewCount: 34,
    isPartner: false,
    brands: ['Valeo', 'Bosch', 'Hella'],
    hours: '08h – 17h',
    isOpenNow: true,
  },
  {
    id: 'shop-7',
    name: 'Auto Service Akbou',
    address: 'Zone industrielle Akbou, Béjaïa',
    lat: 36.4680,
    lng: 4.5270,
    phone: '034789012',
    whatsapp: '0550789012',
    rating: 4.4,
    reviewCount: 71,
    isPartner: true,
    brands: ['Mann-Filter', 'Mahle', 'Febi', 'Bosch', 'NGK'],
    hours: '07h – 18h30',
    isOpenNow: true,
  },
  {
    id: 'shop-8',
    name: 'Pièces & Accessoires Kherrata',
    address: 'Centre-ville Kherrata, Béjaïa',
    lat: 36.5130,
    lng: 5.2970,
    phone: '034890123',
    rating: 3.8,
    reviewCount: 19,
    isPartner: false,
    brands: ['Hengst', 'WIX', 'Champion'],
    hours: '09h – 17h30',
    isOpenNow: false,
  },
];

export const mockReviews: ShopReview[] = [
  {
    id: 'rev-1',
    shopId: 'shop-1',
    authorName: 'Karim B.',
    authorInitials: 'KB',
    rating: 5,
    text: 'Excellent service, les références sont fiables. Le gérant connaît très bien les véhicules chinois.',
    date: 'il y a 2 jours',
  },
  {
    id: 'rev-2',
    shopId: 'shop-1',
    authorName: 'Salah M.',
    authorInitials: 'SM',
    rating: 4,
    text: 'Bonne sélection de filtres Mann. Légèrement cher mais qualité garantie.',
    date: 'il y a 1 semaine',
  },
  {
    id: 'rev-3',
    shopId: 'shop-1',
    authorName: 'Amir T.',
    authorInitials: 'AT',
    rating: 5,
    text: 'La référence pour le Kamiq en Kabylie. Stock complet et conseil professionnel.',
    date: 'il y a 2 semaines',
  },
  {
    id: 'rev-4',
    shopId: 'shop-3',
    authorName: 'Yacine R.',
    authorInitials: 'YR',
    rating: 5,
    text: 'Top garage, pièces d\'origine et bon accueil. Recommandé.',
    date: 'il y a 3 jours',
  },
  {
    id: 'rev-5',
    shopId: 'shop-3',
    authorName: 'Nassim D.',
    authorInitials: 'ND',
    rating: 4,
    text: 'Bonnes pièces Valeo disponibles. Temps d\'attente acceptable.',
    date: 'il y a 5 jours',
  },
  {
    id: 'rev-6',
    shopId: 'shop-7',
    authorName: 'Omar F.',
    authorInitials: 'OF',
    rating: 5,
    text: 'Meilleur stock de la région! Mahle et Mann disponibles immédiatement.',
    date: 'il y a 1 jour',
  },
  {
    id: 'rev-7',
    shopId: 'shop-2',
    authorName: 'Djamel H.',
    authorInitials: 'DH',
    rating: 4,
    text: 'Prix corrects, personnel sympa. Quelques ruptures de stock parfois.',
    date: 'il y a 3 semaines',
  },
  {
    id: 'rev-8',
    shopId: 'shop-5',
    authorName: 'Rachid A.',
    authorInitials: 'RA',
    rating: 4,
    text: 'Bonne sélection de bougies NGK. Service rapide.',
    date: 'il y a 1 semaine',
  },
];

export type ScanState = 'compatible' | 'incompatible' | 'suspect';

export const scanResults: Record<
  ScanState,
  {
    title: string;
    subtitle: string;
    detected: { ref: string; brand: string; detail: string };
    body: string;
    expected?: string;
    cta: string;
  }
> = {
  compatible: {
    title: 'Compatible',
    subtitle: 'Cette pièce convient à ton Skoda Kamiq 1.5 MPI',
    detected: {
      ref: 'W 712/95',
      brand: 'Mann-Filter',
      detail: 'Filtre à huile · équivalent OEM 04E 115 561 S',
    },
    body: 'Fournisseur OEM officiel VAG. Prix conseillé : 3 500 – 4 500 DA.',
    cta: "C'est bon, je le prends",
  },
  incompatible: {
    title: 'Attention',
    subtitle: "Cette pièce N'EST PAS pour ton véhicule",
    detected: {
      ref: '030 115 561 AB',
      brand: 'Référence détectée',
      detail: 'Filtre pour anciens Polo 1.0 / 1.4 — pas EA211',
    },
    body: 'Risque : pression d\u2019huile incorrecte, fuite possible, usure moteur prématurée.',
    expected: '04E 115 561 S',
    cta: 'Trouve la bonne pièce',
  },
  suspect: {
    title: 'Pièce suspecte',
    subtitle: 'Signes de contrefaçon détectés',
    detected: {
      ref: '030 115 561 AB',
      brand: 'MHO Germany',
      detail: 'Marque non référencée chez VAG',
    },
    body: 'Logos VW + Audi factices. MHO n\u2019est pas un fournisseur OEM. Signalé 12 fois par la communauté Lotok.',
    cta: 'Voir les vraies marques',
  },
};

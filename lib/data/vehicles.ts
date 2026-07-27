export interface Brand {
  id: string;
  name: string;
  initials: string;
  color: string; // avatar background
}

export interface VehicleModel {
  id: string;
  brandId: string;
  name: string;
}

export type Market = 'EU' | 'CN' | 'MENA';

export interface EngineOption {
  id: string;
  modelId: string;
  label: string;
  code: string;
  market: Market;
  marketNote?: string;
}

export const BRANDS: Brand[] = [
  { id: 'renault',    name: 'Renault',    initials: 'RE', color: '#FEF3C7' },
  { id: 'peugeot',    name: 'Peugeot',    initials: 'PE', color: '#E0F2FE' },
  { id: 'citroen',    name: 'Citroën',    initials: 'CI', color: '#F0FDF4' },
  { id: 'dacia',      name: 'Dacia',      initials: 'DA', color: '#EEF2FF' },
  { id: 'volkswagen', name: 'Volkswagen', initials: 'VW', color: '#FEE2E2' },
  { id: 'skoda',      name: 'Skoda',      initials: 'SK', color: '#D1FAE5' },
  { id: 'hyundai',    name: 'Hyundai',    initials: 'HY', color: '#FDF4FF' },
  { id: 'kia',        name: 'Kia',        initials: 'KI', color: '#FFF7ED' },
  { id: 'toyota',     name: 'Toyota',     initials: 'TO', color: '#FEE2E2' },
  { id: 'ford',       name: 'Ford',       initials: 'FO', color: '#EFF6FF' },
];

export const MODELS: VehicleModel[] = [
  // Renault
  { id: 'clio4',      brandId: 'renault',    name: 'Clio 4' },
  { id: 'megane3',    brandId: 'renault',    name: 'Mégane 3' },
  { id: 'logan',      brandId: 'renault',    name: 'Logan' },
  { id: 'duster_r',   brandId: 'renault',    name: 'Duster' },
  { id: 'symbol',     brandId: 'renault',    name: 'Symbol' },
  // Peugeot
  { id: '206',        brandId: 'peugeot',    name: '206' },
  { id: '208',        brandId: 'peugeot',    name: '208' },
  { id: '301',        brandId: 'peugeot',    name: '301' },
  { id: '308',        brandId: 'peugeot',    name: '308' },
  { id: 'partner',    brandId: 'peugeot',    name: 'Partner' },
  // Citroën
  { id: 'c3',         brandId: 'citroen',    name: 'C3' },
  { id: 'celysee',    brandId: 'citroen',    name: 'C-Elysée' },
  { id: 'berlingo',   brandId: 'citroen',    name: 'Berlingo' },
  { id: 'ds3',        brandId: 'citroen',    name: 'DS3' },
  // Dacia
  { id: 'sandero',    brandId: 'dacia',      name: 'Sandero' },
  { id: 'logan_d',    brandId: 'dacia',      name: 'Logan' },
  { id: 'duster_d',   brandId: 'dacia',      name: 'Duster' },
  { id: 'lodgy',      brandId: 'dacia',      name: 'Lodgy' },
  // VW
  { id: 'golf7',      brandId: 'volkswagen', name: 'Golf 7' },
  { id: 'polo6',      brandId: 'volkswagen', name: 'Polo 6' },
  { id: 'tiguan',     brandId: 'volkswagen', name: 'Tiguan' },
  { id: 'troc',       brandId: 'volkswagen', name: 'T-Roc' },
  // Skoda
  { id: 'kamiq',      brandId: 'skoda',      name: 'Kamiq' },
  { id: 'octavia',    brandId: 'skoda',      name: 'Octavia' },
  { id: 'fabia',      brandId: 'skoda',      name: 'Fabia' },
  { id: 'superb',     brandId: 'skoda',      name: 'Superb' },
  // Hyundai
  { id: 'i10',        brandId: 'hyundai',    name: 'i10' },
  { id: 'i20',        brandId: 'hyundai',    name: 'i20' },
  { id: 'accent',     brandId: 'hyundai',    name: 'Accent' },
  { id: 'tucson',     brandId: 'hyundai',    name: 'Tucson' },
  // Kia
  { id: 'picanto',    brandId: 'kia',        name: 'Picanto' },
  { id: 'rio',        brandId: 'kia',        name: 'Rio' },
  { id: 'sportage',   brandId: 'kia',        name: 'Sportage' },
  { id: 'cerato',     brandId: 'kia',        name: 'Cerato' },
  // Toyota
  { id: 'yaris',      brandId: 'toyota',     name: 'Yaris' },
  { id: 'corolla',    brandId: 'toyota',     name: 'Corolla' },
  { id: 'hilux',      brandId: 'toyota',     name: 'Hilux' },
  { id: 'landcruiser',brandId: 'toyota',     name: 'Land Cruiser' },
  // Ford
  { id: 'fiesta',     brandId: 'ford',       name: 'Fiesta' },
  { id: 'focus',      brandId: 'ford',       name: 'Focus' },
  { id: 'ecosport',   brandId: 'ford',       name: 'EcoSport' },
];

export const ENGINES: EngineOption[] = [
  // Renault Clio 4 — REQUIRED
  { id: 'clio4_15dci', modelId: 'clio4', label: '1.5 dCi 75ch', code: 'K9K', market: 'EU' },
  { id: 'clio4_12tce', modelId: 'clio4', label: '1.2 TCe 120ch', code: 'H5F', market: 'EU' },
  { id: 'clio4_10',    modelId: 'clio4', label: '1.0 SCe 65ch', code: 'D4F', market: 'EU' },
  // Renault Mégane 3
  { id: 'megane3_15dci', modelId: 'megane3', label: '1.5 dCi 110ch', code: 'K9K', market: 'EU' },
  { id: 'megane3_16',    modelId: 'megane3', label: '1.6 16V 115ch', code: 'K4M', market: 'EU' },
  // Renault Logan
  { id: 'logan_15dci', modelId: 'logan', label: '1.5 dCi 90ch', code: 'K9K', market: 'MENA', marketNote: 'Version MENA — montage Algérie' },
  { id: 'logan_16',    modelId: 'logan', label: '1.6 8V 83ch',  code: 'K7M', market: 'MENA', marketNote: 'Version MENA — montage Algérie' },
  // Renault Duster
  { id: 'duster_r_15dci', modelId: 'duster_r', label: '1.5 dCi 110ch', code: 'K9K', market: 'MENA', marketNote: 'Version MENA — montage Algérie' },
  { id: 'duster_r_20',    modelId: 'duster_r', label: '2.0 16V 143ch', code: 'F4R', market: 'MENA' },
  // Peugeot 208
  { id: '208_14hdi',      modelId: '208', label: '1.4 HDi 68ch',      code: '8HR',  market: 'EU' },
  { id: '208_12puretech', modelId: '208', label: '1.2 PureTech 82ch', code: 'HMZ',  market: 'EU' },
  // Peugeot 301
  { id: '301_15hdi', modelId: '301', label: '1.5 BlueHDi 100ch', code: 'XNZ', market: 'MENA', marketNote: 'Version MENA' },
  { id: '301_12',    modelId: '301', label: '1.2 PureTech 82ch', code: 'HMZ', market: 'MENA' },
  // Citroën C-Elysée
  { id: 'celysee_15', modelId: 'celysee', label: '1.5 BlueHDi 100ch', code: 'YHZ', market: 'MENA', marketNote: 'Version MENA' },
  { id: 'celysee_12', modelId: 'celysee', label: '1.2 PureTech 82ch', code: 'HMZ', market: 'MENA' },
  // Citroën C3
  { id: 'c3_12', modelId: 'c3', label: '1.2 PureTech 82ch', code: 'HMZ', market: 'EU' },
  { id: 'c3_15', modelId: 'c3', label: '1.5 BlueHDi 100ch', code: 'YHZ', market: 'EU' },
  // Dacia Sandero — REQUIRED
  { id: 'sandero_15dci', modelId: 'sandero', label: '1.5 dCi 75ch', code: 'K9K', market: 'MENA', marketNote: 'Version MENA — montage Algérie' },
  { id: 'sandero_16',    modelId: 'sandero', label: '1.6 8V 83ch',  code: 'K7M', market: 'MENA' },
  { id: 'sandero_09',    modelId: 'sandero', label: '0.9 TCe 90ch', code: 'H4B', market: 'EU' },
  // Dacia Logan
  { id: 'logand_15dci', modelId: 'logan_d', label: '1.5 dCi 90ch', code: 'K9K', market: 'MENA', marketNote: 'Version MENA — montage Algérie' },
  { id: 'logand_16',    modelId: 'logan_d', label: '1.6 8V 83ch',  code: 'K7M', market: 'MENA' },
  // VW Golf 7 — REQUIRED
  { id: 'golf7_16tdi', modelId: 'golf7', label: '1.6 TDI 105ch', code: 'CLHA', market: 'EU' },
  { id: 'golf7_20tdi', modelId: 'golf7', label: '2.0 TDI 150ch', code: 'CRBC', market: 'EU' },
  { id: 'golf7_14tsi', modelId: 'golf7', label: '1.4 TSI 125ch', code: 'CZDA', market: 'EU' },
  // VW Polo 6
  { id: 'polo6_10tsi', modelId: 'polo6', label: '1.0 TSI 95ch (EU)',         code: 'DKLA', market: 'EU' },
  { id: 'polo6_10mpi', modelId: 'polo6', label: '1.0 MPI 65ch (CN)',         code: 'CHY',  market: 'CN', marketNote: 'Version chinoise — références spécifiques' },
  // Skoda Kamiq — REQUIRED (CN)
  { id: 'kamiq_15mpi', modelId: 'kamiq', label: '1.5 MPI 110ch (DJSA)',      code: 'DJSA', market: 'CN', marketNote: 'Version chinoise — références spécifiques' },
  { id: 'kamiq_10tsi', modelId: 'kamiq', label: '1.0 TSI 115ch',             code: 'DKRF', market: 'EU' },
  { id: 'kamiq_15tsi', modelId: 'kamiq', label: '1.5 TSI 150ch',             code: 'DADA', market: 'EU' },
  // Skoda Octavia
  { id: 'octavia_16tdi', modelId: 'octavia', label: '1.6 TDI 115ch', code: 'DGDA', market: 'EU' },
  { id: 'octavia_20tdi', modelId: 'octavia', label: '2.0 TDI 150ch', code: 'DGTD', market: 'EU' },
  // Skoda Fabia
  { id: 'fabia_10',  modelId: 'fabia', label: '1.0 MPI 75ch',  code: 'CHYA', market: 'EU' },
  { id: 'fabia_12',  modelId: 'fabia', label: '1.2 TSI 90ch',  code: 'CJZC', market: 'EU' },
  // Hyundai i10 — REQUIRED
  { id: 'i10_10', modelId: 'i10', label: '1.0 MPI 66ch',  code: 'G3LA', market: 'EU' },
  { id: 'i10_12', modelId: 'i10', label: '1.2 MPI 84ch',  code: 'G4LA', market: 'EU' },
  // Hyundai i20
  { id: 'i20_14crdi', modelId: 'i20', label: '1.4 CRDi 90ch', code: 'D4FC', market: 'EU' },
  { id: 'i20_12',     modelId: 'i20', label: '1.2 MPI 75ch',  code: 'G4LA', market: 'EU' },
  // Kia Picanto
  { id: 'picanto_10', modelId: 'picanto', label: '1.0 MPI 67ch', code: 'G3LA', market: 'EU' },
  { id: 'picanto_12', modelId: 'picanto', label: '1.2 MPI 84ch', code: 'G4LA', market: 'EU' },
  // Kia Rio
  { id: 'rio_14crdi', modelId: 'rio', label: '1.4 CRDi 90ch',  code: 'D4FC', market: 'EU' },
  { id: 'rio_12',     modelId: 'rio', label: '1.2 CVVT 84ch',  code: 'G4LA', market: 'EU' },
  // Toyota Yaris
  { id: 'yaris_13', modelId: 'yaris', label: '1.3 VVT-i 99ch',  code: '2NZ-FE', market: 'EU' },
  { id: 'yaris_15', modelId: 'yaris', label: '1.5 VVT-i 111ch', code: '1NZ-FE', market: 'EU' },
  // Toyota Corolla
  { id: 'corolla_16', modelId: 'corolla', label: '1.6 VVT-i 132ch',  code: '1ZR-FE',  market: 'EU' },
  { id: 'corolla_20', modelId: 'corolla', label: '2.0 VVT-i 170ch',  code: '3ZR-FAE', market: 'EU' },
  // Toyota Hilux
  { id: 'hilux_24', modelId: 'hilux', label: '2.4 D-4D 150ch', code: '2GD-FTV', market: 'EU' },
  // Ford Fiesta
  { id: 'fiesta_10eb', modelId: 'fiesta', label: '1.0 EcoBoost 100ch', code: 'SFJA', market: 'EU' },
  { id: 'fiesta_15td', modelId: 'fiesta', label: '1.5 TDCi 75ch',      code: 'XUDC', market: 'EU' },
  // Ford Focus
  { id: 'focus_15td', modelId: 'focus', label: '1.5 TDCi 120ch',      code: 'XXDA', market: 'EU' },
  { id: 'focus_10eb', modelId: 'focus', label: '1.0 EcoBoost 125ch',  code: 'M1DA', market: 'EU' },
];

export const YEARS = Array.from({ length: 27 }, (_, i) => String(2026 - i));

export function getModelsForBrand(brandId: string): VehicleModel[] {
  return MODELS.filter((m) => m.brandId === brandId);
}

export function getEnginesForModel(modelId: string): EngineOption[] {
  return ENGINES.filter((e) => e.modelId === modelId);
}

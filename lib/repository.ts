/**
 * Repository abstraction layer.
 *
 * Two implementations:
 *  - MockRepository  — reads lib/mock.ts + lib/data/vehicles.ts (default when no env vars)
 *  - SupabaseRepository — real DB queries (used when EXPO_PUBLIC_SUPABASE_* are set)
 *
 * getRepository() returns the correct implementation automatically.
 */

import { isSupabaseConfigured, supabase } from './supabase';
import {
  type Brand,
  type VehicleModel,
  type EngineOption,
  BRANDS,
  getModelsForBrand,
  getEnginesForModel,
} from './data/vehicles';
import {
  type CategoryItem,
  type AftermarketPart,
  type Shop,
  type ShopReview,
  categories,
  oilFilterResult,
  mockShops,
  mockReviews,
} from './mock';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface PartResultData {
  category: string;
  vehicleLabel: string;
  oem: { code: string; brand: string; note: string };
  equivalents: AftermarketPart[];
  avoid: { brand: string; ref: string; reason: string }[];
  counterfeit: { brand: string; ref: string; signs: string[] } | null;
}

export interface ShopWithReviews extends Shop {
  reviews: ShopReview[];
}

// ── Interface ─────────────────────────────────────────────────────────────────

export interface PartsRepository {
  getBrands(): Promise<Brand[]>;
  getModels(brandId: string): Promise<VehicleModel[]>;
  getEngines(modelId: string): Promise<EngineOption[]>;
  getCategories(): Promise<CategoryItem[]>;
  getPartResult(engineId: string, categoryId: string): Promise<PartResultData | null>;
  getNearbyShops(lat: number, lng: number): Promise<Shop[]>;
  getShop(id: string): Promise<ShopWithReviews | null>;
  searchByOemCode(code: string): Promise<PartResultData[]>;
}

// ── Mock implementation ───────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

class MockRepository implements PartsRepository {
  async getBrands(): Promise<Brand[]> {
    await delay();
    return [...BRANDS];
  }

  async getModels(brandId: string): Promise<VehicleModel[]> {
    await delay();
    return getModelsForBrand(brandId);
  }

  async getEngines(modelId: string): Promise<EngineOption[]> {
    await delay();
    return getEnginesForModel(modelId);
  }

  async getCategories(): Promise<CategoryItem[]> {
    await delay();
    return [...categories];
  }

  async getPartResult(
    _engineId: string,
    _categoryId: string,
  ): Promise<PartResultData | null> {
    await delay(400);
    // Return the Kamiq oil filter result as a stand-in for all queries
    return oilFilterResult;
  }

  async getNearbyShops(lat: number, lng: number): Promise<Shop[]> {
    await delay(400);
    return mockShops
      .map((s) => ({ ...s, distance: parseFloat(haversineKm(lat, lng, s.lat, s.lng).toFixed(1)) }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  async getShop(id: string): Promise<ShopWithReviews | null> {
    await delay();
    const shop = mockShops.find((s) => s.id === id);
    if (!shop) return null;
    const reviews = mockReviews.filter((r) => r.shopId === id);
    return { ...shop, reviews };
  }

  async searchByOemCode(code: string): Promise<PartResultData[]> {
    await delay(300);
    if (oilFilterResult.oem.code.includes(code.toUpperCase())) {
      return [oilFilterResult];
    }
    return [];
  }
}

// ── Supabase implementation ───────────────────────────────────────────────────

// Colonnes de retour de la RPC nearby_shops (migration 0002).
interface NearbyShopRow {
  id: string;
  name: string;
  slug: string;
  wilaya: string;
  commune: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  hours: { display?: string } | null;
  is_verified: boolean;
  result_lat: number | null;
  result_lng: number | null;
  distance_m: number | null;
}

// Forme retournée par search_parts_by_ref et récupérée depuis parts.
interface DbPart {
  id: string;
  label: { fr: string; en?: string; ar?: string };
  description: { fr?: string; en?: string } | null;
}

interface DbPartRef {
  id: string;
  part_id: string;
  ref_number: string;
  ref_type: 'oem' | 'aftermarket';
  manufacturer: string | null;
}

function mapDbRefsToPartResult(
  part: DbPart,
  refs: DbPartRef[],
): PartResultData {
  const oemRef = refs.find((r) => r.ref_type === 'oem');
  const aftermarketRefs = refs.filter((r) => r.ref_type === 'aftermarket');
  return {
    category: part.label.fr,
    vehicleLabel: '',
    oem: {
      code: oemRef?.ref_number ?? '',
      brand: oemRef?.manufacturer ?? '',
      note: part.description?.fr ?? '',
    },
    equivalents: aftermarketRefs.map((r) => ({
      manufacturer: r.manufacturer ?? '',
      ref: r.ref_number,
      tier: 2 as const,
      tierLabel: 'Bon rapport',
      priceMin: 0,
      priceMax: 0,
      shopsCount: 0,
    })),
    avoid: [],
    counterfeit: null,
  };
}

function mapNearbyRow(s: NearbyShopRow): Shop {
  return {
    id: s.id,
    name: s.name,
    address: s.address ?? `${s.commune ?? ''}, ${s.wilaya}`.trim(),
    lat: s.result_lat ?? 0,
    lng: s.result_lng ?? 0,
    phone: s.phone ?? '',
    whatsapp: s.whatsapp ?? undefined,
    rating: 0,
    reviewCount: 0,
    isPartner: s.is_verified,
    brands: [],
    hours: s.hours?.display ?? '',
    isOpenNow: true,
    distance: s.distance_m != null
      ? parseFloat((s.distance_m / 1000).toFixed(1))
      : undefined,
  };
}

class SupabaseRepository implements PartsRepository {
  // Le catalogue véhicules est statique et identique aux données seedées.
  async getBrands(): Promise<Brand[]> { return [...BRANDS]; }
  async getModels(brandId: string): Promise<VehicleModel[]> { return getModelsForBrand(brandId); }
  async getEngines(modelId: string): Promise<EngineOption[]> { return getEnginesForModel(modelId); }

  async getCategories(): Promise<CategoryItem[]> {
    if (!supabase) return [...categories];
    const { data, error } = await supabase
      .from('categories')
      .select('slug, label, icon')
      .is('parent_id', null)
      .order('sort_order');
    if (error || !data) return [...categories];
    return data.map((c) => ({
      id: c.slug as string,
      label: (c.label as { fr: string }).fr,
      icon: (c.icon as string) ?? '',
    }));
  }

  async getPartResult(engineId: string, categoryId: string): Promise<PartResultData | null> {
    if (!supabase) return null;

    // 1. Résoudre le slug de catégorie en UUID.
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categoryId)
      .maybeSingle();
    if (!cat) return null;

    // 2. Trouver les pièces ayant une compatibilité pour ce moteur.
    const { data: fitments } = await supabase
      .from('part_fitments')
      .select('part_id, confidence')
      .eq('engine_id', engineId);
    if (!fitments?.length) return null;

    const partIds = fitments.map((f) => f.part_id as string);

    // 3. Filtrer celles qui appartiennent à la catégorie demandée.
    const { data: parts } = await supabase
      .from('parts')
      .select('id, label, description')
      .in('id', partIds)
      .eq('category_id', cat.id);
    const part = parts?.[0] as DbPart | undefined;
    if (!part) return null;

    // 4. Récupérer les références OEM + aftermarket.
    const { data: refs } = await supabase
      .from('part_references')
      .select('id, part_id, ref_number, ref_type, manufacturer')
      .eq('part_id', part.id);

    return mapDbRefsToPartResult(part, (refs ?? []) as DbPartRef[]);
  }

  async getNearbyShops(lat: number, lng: number): Promise<Shop[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.rpc('nearby_shops', {
      lat,
      lng,
      radius_m: 20000,
    });
    if (error || !data) return [];
    return (data as NearbyShopRow[]).map(mapNearbyRow);
  }

  async getShop(id: string): Promise<ShopWithReviews | null> {
    if (!supabase) return null;
    const [{ data: shop }, { data: shopBrands }] = await Promise.all([
      supabase.from('shops_geo').select('*').eq('id', id).maybeSingle(),
      supabase.from('shop_brands').select('brands(name)').eq('shop_id', id),
    ]);
    if (!shop) return null;

    const s = shop as {
      id: string; name: string; address: string | null;
      commune: string | null; wilaya: string;
      lat: number | null; lng: number | null;
      phone: string | null; whatsapp: string | null;
      is_verified: boolean; hours: { display?: string } | null;
    };

    const brandNames = (shopBrands ?? [])
      .map((sb: any) => (Array.isArray(sb.brands) ? sb.brands[0]?.name : sb.brands?.name))
      .filter((n): n is string => typeof n === 'string' && n.length > 0);

    return {
      id: s.id,
      name: s.name,
      address: s.address ?? `${s.commune ?? ''}, ${s.wilaya}`.trim(),
      lat: s.lat ?? 0,
      lng: s.lng ?? 0,
      phone: s.phone ?? '',
      whatsapp: s.whatsapp ?? undefined,
      rating: 0,
      reviewCount: 0,
      isPartner: s.is_verified,
      brands: brandNames,
      hours: s.hours?.display ?? '',
      isOpenNow: true,
      reviews: [],
    };
  }

  async searchByOemCode(code: string): Promise<PartResultData[]> {
    if (!supabase) return [];

    // Appelle la RPC search_parts_by_ref (match exact puis préfixe sur normalized).
    const { data: parts, error } = await supabase.rpc('search_parts_by_ref', { q: code });
    if (error || !parts?.length) return [];

    const partIds = (parts as DbPart[]).map((p) => p.id);
    const { data: refs } = await supabase
      .from('part_references')
      .select('id, part_id, ref_number, ref_type, manufacturer')
      .in('part_id', partIds);

    return (parts as DbPart[]).map((part) => {
      const partRefs = (refs ?? []).filter(
        (r: DbPartRef) => r.part_id === part.id,
      ) as DbPartRef[];
      return mapDbRefsToPartResult(part, partRefs);
    });
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

let _repository: PartsRepository | null = null;

export function getRepository(): PartsRepository {
  if (!_repository) {
    _repository = isSupabaseConfigured ? new SupabaseRepository() : new MockRepository();
  }
  return _repository;
}

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

class SupabaseRepository implements PartsRepository {
  async getBrands(): Promise<Brand[]> {
    // Fallback to local data — vehicle catalog is static
    return [...BRANDS];
  }

  async getModels(brandId: string): Promise<VehicleModel[]> {
    return getModelsForBrand(brandId);
  }

  async getEngines(modelId: string): Promise<EngineOption[]> {
    return getEnginesForModel(modelId);
  }

  async getCategories(): Promise<CategoryItem[]> {
    return [...categories];
  }

  async getPartResult(
    engineId: string,
    categoryId: string,
  ): Promise<PartResultData | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('part_results')
      .select('*')
      .eq('engine_id', engineId)
      .eq('category_id', categoryId)
      .maybeSingle();
    if (error || !data) return null;
    return data as PartResultData;
  }

  async getNearbyShops(lat: number, lng: number): Promise<Shop[]> {
    if (!supabase) return [];
    // Use PostGIS distance ordering if available, else fetch all + sort client-side
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .limit(50);
    if (error || !data) return [];
    return (data as Shop[])
      .map((s) => ({ ...s, distance: parseFloat(haversineKm(lat, lng, s.lat, s.lng).toFixed(1)) }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  async getShop(id: string): Promise<ShopWithReviews | null> {
    if (!supabase) return null;
    const [{ data: shop }, { data: reviews }] = await Promise.all([
      supabase.from('shops').select('*').eq('id', id).maybeSingle(),
      supabase.from('shop_reviews').select('*').eq('shop_id', id).order('created_at', { ascending: false }),
    ]);
    if (!shop) return null;
    return { ...(shop as Shop), reviews: (reviews ?? []) as ShopReview[] };
  }

  async searchByOemCode(code: string): Promise<PartResultData[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('part_results')
      .select('*')
      .ilike('oem_code', `%${code}%`);
    if (error || !data) return [];
    return data as PartResultData[];
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

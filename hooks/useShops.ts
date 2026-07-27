import { useQuery } from '@tanstack/react-query';
import { getRepository } from '@/lib/repository';

const STALE_5MIN = 1000 * 60 * 5;

export interface UserLocation {
  lat: number;
  lng: number;
}

// Béjaïa fallback coordinates
export const BEJAIA: UserLocation = { lat: 36.7509, lng: 5.0567 };

export function useShops(location: UserLocation = BEJAIA) {
  return useQuery({
    queryKey: ['shops', location.lat, location.lng],
    queryFn: () => getRepository().getNearbyShops(location.lat, location.lng),
    staleTime: STALE_5MIN,
    gcTime: STALE_5MIN * 2,
  });
}

export function useShop(id: string | undefined) {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => getRepository().getShop(id!),
    enabled: Boolean(id),
    staleTime: STALE_5MIN,
    gcTime: STALE_5MIN * 2,
  });
}

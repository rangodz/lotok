import { useQuery } from '@tanstack/react-query';
import { getRepository } from '@/lib/repository';

const STALE_24H = 1000 * 60 * 60 * 24;

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => getRepository().getBrands(),
    staleTime: STALE_24H,
    gcTime: STALE_24H,
  });
}

export function useModels(brandId: string | undefined) {
  return useQuery({
    queryKey: ['models', brandId],
    queryFn: () => getRepository().getModels(brandId!),
    enabled: Boolean(brandId),
    staleTime: STALE_24H,
    gcTime: STALE_24H,
  });
}

export function useEngines(modelId: string | undefined) {
  return useQuery({
    queryKey: ['engines', modelId],
    queryFn: () => getRepository().getEngines(modelId!),
    enabled: Boolean(modelId),
    staleTime: STALE_24H,
    gcTime: STALE_24H,
  });
}

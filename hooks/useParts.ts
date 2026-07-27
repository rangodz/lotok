import { useQuery } from '@tanstack/react-query';
import { getRepository } from '@/lib/repository';

const STALE_24H = 1000 * 60 * 60 * 24;

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getRepository().getCategories(),
    staleTime: STALE_24H,
    gcTime: STALE_24H,
  });
}

export function usePartResult(engineId: string | undefined, categoryId: string | undefined) {
  return useQuery({
    queryKey: ['part-result', engineId, categoryId],
    queryFn: () => getRepository().getPartResult(engineId!, categoryId!),
    enabled: Boolean(engineId) && Boolean(categoryId),
    staleTime: STALE_24H,
    gcTime: STALE_24H,
  });
}

export function useSearchByOem(code: string) {
  return useQuery({
    queryKey: ['search-oem', code],
    queryFn: () => getRepository().searchByOemCode(code),
    enabled: code.trim().length >= 3,
    staleTime: STALE_24H,
    gcTime: STALE_24H,
  });
}

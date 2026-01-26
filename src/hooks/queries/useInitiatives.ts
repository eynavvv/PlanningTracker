import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useInitiativesList() {
  return useQuery({
    queryKey: queryKeys.initiatives.list(),
    queryFn: () => dataService.getAllReleases(),
    enabled: dataService.isConfigured(),
  });
}

export function useDashboardTimeline() {
  return useQuery({
    queryKey: queryKeys.initiatives.timeline(),
    queryFn: () => dataService.getDashboardTimelineData(),
    enabled: dataService.isConfigured(),
  });
}

export function useInitiativeDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.initiatives.detail(id),
    queryFn: () => dataService.getRelease(id),
    enabled: !!id && dataService.isConfigured(),
  });
}

export function useCreateInitiative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => dataService.createInitiative(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });
      toast.success('Initiative created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create initiative', { description: error.message });
    },
  });
}

export function useUpdateInitiative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      dataService.updateInitiative(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives.detail(id) });

      const previousData = queryClient.getQueryData(queryKeys.initiatives.detail(id));

      queryClient.setQueryData(queryKeys.initiatives.detail(id), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const typedOld = old as { Initiative?: Record<string, unknown> };
        return {
          ...typedOld,
          Initiative: { ...typedOld.Initiative, ...updates },
        };
      });

      return { previousData };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.initiatives.detail(id), context.previousData);
      }
      toast.error('Failed to save changes');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });
    },
  });
}

export function useDeleteInitiative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.deleteInitiative(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });
      toast.success('Initiative deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete initiative', { description: error.message });
    },
  });
}

export function useReorderInitiatives() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => dataService.updateInitiativeOrder(orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives.timeline() });

      const previousData = queryClient.getQueryData(queryKeys.initiatives.timeline());

      queryClient.setQueryData(queryKeys.initiatives.timeline(), (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;
        return orderedIds
          .map((id) => (old as Array<{ id: string }>).find((item) => item.id === id))
          .filter(Boolean);
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.initiatives.timeline(), context.previousData);
      }
      toast.error('Failed to reorder initiatives');
    },
  });
}

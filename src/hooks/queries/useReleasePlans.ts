import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useCreateReleasePlan(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => dataService.createReleasePlan(initiativeId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.detail(initiativeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });
      toast.success('Release plan created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create release plan', { description: error.message });
    },
  });
}

export function useUpdateReleasePlan(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, updates }: { planId: string; updates: Record<string, unknown> }) =>
      dataService.updateReleasePlan(initiativeId, planId, updates),
    onMutate: async ({ planId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives.detail(initiativeId) });

      const previousData = queryClient.getQueryData(queryKeys.initiatives.detail(initiativeId));

      queryClient.setQueryData(queryKeys.initiatives.detail(initiativeId), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const typedOld = old as { Initiative?: { ReleasePlan?: Array<{ id: string }> } };
        if (!typedOld.Initiative?.ReleasePlan) return old;
        return {
          ...typedOld,
          Initiative: {
            ...typedOld.Initiative,
            ReleasePlan: typedOld.Initiative.ReleasePlan.map((rp) =>
              rp.id === planId ? { ...rp, ...updates } : rp
            ),
          },
        };
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.initiatives.detail(initiativeId), context.previousData);
      }
      toast.error('Failed to update release plan');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });
    },
  });
}

export function useDeleteReleasePlan(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => dataService.deleteReleasePlan(initiativeId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.detail(initiativeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });
      toast.success('Release plan deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete release plan', { description: error.message });
    },
  });
}

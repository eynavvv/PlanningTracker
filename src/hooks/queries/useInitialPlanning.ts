import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useUpdateInitialPlanning(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      dataService.updateInitialPlanning(initiativeId, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives.detail(initiativeId) });

      const previousData = queryClient.getQueryData(queryKeys.initiatives.detail(initiativeId));

      queryClient.setQueryData(queryKeys.initiatives.detail(initiativeId), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const typedOld = old as { Initiative?: { InitialPlanning?: Record<string, unknown> } };
        return {
          ...typedOld,
          Initiative: {
            ...typedOld.Initiative,
            InitialPlanning: {
              ...typedOld.Initiative?.InitialPlanning,
              ...updates,
            },
          },
        };
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.initiatives.detail(initiativeId), context.previousData);
      }
      toast.error('Failed to update planning');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });
    },
  });
}

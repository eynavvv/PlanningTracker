import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useCreateEpic(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ releasePlanId, name }: { releasePlanId: string; name: string }) =>
      dataService.createEpic(initiativeId, releasePlanId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.detail(initiativeId) });
      toast.success('Epic created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create epic', { description: error.message });
    },
  });
}

export function useUpdateEpic(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ epicId, updates }: { epicId: string; updates: Record<string, unknown> }) =>
      dataService.updateEpic(initiativeId, epicId, updates),
    onMutate: async ({ epicId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives.detail(initiativeId) });

      const previousData = queryClient.getQueryData(queryKeys.initiatives.detail(initiativeId));

      queryClient.setQueryData(queryKeys.initiatives.detail(initiativeId), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const typedOld = old as {
          Initiative?: {
            ReleasePlan?: Array<{ Epics?: Array<{ id: string }> }>;
          };
        };
        if (!typedOld.Initiative?.ReleasePlan) return old;
        return {
          ...typedOld,
          Initiative: {
            ...typedOld.Initiative,
            ReleasePlan: typedOld.Initiative.ReleasePlan.map((rp) => ({
              ...rp,
              Epics: rp.Epics?.map((epic) => (epic.id === epicId ? { ...epic, ...updates } : epic)),
            })),
          },
        };
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.initiatives.detail(initiativeId), context.previousData);
      }
      toast.error('Failed to update epic');
    },
  });
}

export function useDeleteEpic(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (epicId: string) => dataService.deleteEpic(initiativeId, epicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.detail(initiativeId) });
      toast.success('Epic deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete epic', { description: error.message });
    },
  });
}

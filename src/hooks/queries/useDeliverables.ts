import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useDeliverables(initiativeId: string) {
  return useQuery({
    queryKey: queryKeys.deliverables.byInitiative(initiativeId),
    queryFn: () => dataService.getDeliverables(initiativeId),
    enabled: !!initiativeId && dataService.isConfigured(),
  });
}

export function useCreateDeliverable(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliverable: { name: string; date?: string; status?: string }) =>
      dataService.createDeliverable(initiativeId, deliverable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables.byInitiative(initiativeId) });
      toast.success('Deliverable added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add deliverable', { description: error.message });
    },
  });
}

export function useUpdateDeliverable(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      dataService.updateDeliverable(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.deliverables.byInitiative(initiativeId),
      });

      const previousData = queryClient.getQueryData(
        queryKeys.deliverables.byInitiative(initiativeId)
      );

      queryClient.setQueryData(
        queryKeys.deliverables.byInitiative(initiativeId),
        (old: unknown) => {
          if (!Array.isArray(old)) return old;
          return old.map((d: { id: string }) => (d.id === id ? { ...d, ...updates } : d));
        }
      );

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.deliverables.byInitiative(initiativeId),
          context.previousData
        );
      }
      toast.error('Failed to update deliverable');
    },
  });
}

export function useDeleteDeliverable(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.deleteDeliverable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables.byInitiative(initiativeId) });
      toast.success('Deliverable deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete deliverable', { description: error.message });
    },
  });
}

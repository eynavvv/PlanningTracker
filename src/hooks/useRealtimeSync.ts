import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type RealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'initiatives' },
        (payload: RealtimePayload) => {
          handleInitiativeChange(payload, queryClient);
          broadcastChange('initiatives');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'release_plans' },
        (payload: RealtimePayload) => {
          handleReleasePlanChange(payload, queryClient);
          broadcastChange('release_plans');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'initial_planning' },
        (payload: RealtimePayload) => {
          handleInitialPlanningChange(payload, queryClient);
          broadcastChange('initial_planning');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deliverables' },
        (payload: RealtimePayload) => {
          handleDeliverableChange(payload, queryClient);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload: RealtimePayload) => {
          handleTaskChange(payload, queryClient);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'epics' },
        (payload: RealtimePayload) => {
          handleEpicChange(payload, queryClient);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'initiative_updates' },
        (_payload: RealtimePayload) => {
          broadcastChange('initiative_updates');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

function handleInitiativeChange(
  payload: RealtimePayload,
  queryClient: ReturnType<typeof useQueryClient>
) {
  const { eventType, new: newData, old: oldData } = payload;

  // Invalidate timeline for all changes
  queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });

  if (eventType === 'UPDATE' && newData.id) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.initiatives.detail(newData.id as string),
    });

    // Show toast for significant changes from other users
    if (oldData.status !== newData.status) {
      toast.info(`"${newData.name}" status changed to ${newData.status}`);
    }
  }

  if (eventType === 'DELETE') {
    toast.info(`Initiative was deleted`);
    queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });
  }

  if (eventType === 'INSERT') {
    toast.info(`New initiative created`);
    queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });
  }
}

function handleReleasePlanChange(
  payload: RealtimePayload,
  queryClient: ReturnType<typeof useQueryClient>
) {
  const { new: newData } = payload;

  if (newData?.initiative_id) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.initiatives.detail(newData.initiative_id as string),
    });
  }

  queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });
}

function handleInitialPlanningChange(
  payload: RealtimePayload,
  queryClient: ReturnType<typeof useQueryClient>
) {
  const { new: newData } = payload;

  if (newData?.initiative_id) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.initiatives.detail(newData.initiative_id as string),
    });
  }

  queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.timeline() });
}

function handleDeliverableChange(
  payload: RealtimePayload,
  queryClient: ReturnType<typeof useQueryClient>
) {
  const { eventType, new: newData, old: oldData } = payload;
  const initiativeId = (newData?.initiative_id || oldData?.initiative_id) as string;

  if (initiativeId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.deliverables.byInitiative(initiativeId),
    });

    if (eventType === 'UPDATE' && oldData.status !== newData.status) {
      if (newData.status === 'done') {
        toast.success(`"${newData.name}" marked complete!`);
      }
    }
  }
}

function handleTaskChange(
  _payload: RealtimePayload,
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
  window.dispatchEvent(new CustomEvent('supabase-update', { detail: { table: 'tasks' } }));
}

function handleEpicChange(
  payload: RealtimePayload,
  queryClient: ReturnType<typeof useQueryClient>
) {
  const { new: newData, old: oldData } = payload;
  const releaseId = (newData?.release_id || oldData?.release_id) as string;

  if (releaseId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.epics.byRelease(releaseId) });
  }

  window.dispatchEvent(new CustomEvent('supabase-update', { detail: { table: 'epics' } }));
}

// Global broadcast to notify manual state components
function broadcastChange(table: string) {
  window.dispatchEvent(new CustomEvent('supabase-update', { detail: { table } }));
}

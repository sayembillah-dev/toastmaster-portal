"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { EventInput, EventUpdateInput } from "@/lib/validation";

export function useEvents(params?: { upcoming?: boolean }) {
  return useQuery({
    queryKey: qk.events.all,
    queryFn: () => api.events.list(params),
  });
}

export function useEventTemplates() {
  return useQuery({
    queryKey: qk.events.templates,
    queryFn: () => api.events.list({ template: true }),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: qk.events.detail(id),
    queryFn: () => api.events.get(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventInput) => api.events.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events.all });
      qc.invalidateQueries({ queryKey: qk.events.templates });
    },
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventUpdateInput) => api.events.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events.all });
      qc.invalidateQueries({ queryKey: qk.events.detail(id) });
      qc.invalidateQueries({ queryKey: qk.events.templates });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.events.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events.all });
      qc.invalidateQueries({ queryKey: qk.events.templates });
    },
  });
}

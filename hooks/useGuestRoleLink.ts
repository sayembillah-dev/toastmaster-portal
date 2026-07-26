"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { AgendaRoleKey } from "@/lib/eventConstants";

export function useCreateGuestLink(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: AgendaRoleKey) => api.events.createGuestLink(eventId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events.detail(eventId) }),
  });
}

export function useRevokeGuestLink(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: AgendaRoleKey) => api.events.revokeGuestLink(eventId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events.detail(eventId) }),
  });
}

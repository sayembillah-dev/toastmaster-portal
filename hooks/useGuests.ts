"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { GuestInput, GuestUpdateInput } from "@/lib/validation";

export function useGuests() {
  return useQuery({
    queryKey: qk.guests.all,
    queryFn: () => api.guests.list(),
  });
}

export function useGuest(id: string) {
  return useQuery({
    queryKey: qk.guests.detail(id),
    queryFn: () => api.guests.get(id),
    enabled: !!id,
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GuestInput) => api.guests.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.guests.all }),
  });
}

export function useUpdateGuest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GuestUpdateInput) => api.guests.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.guests.all });
      qc.invalidateQueries({ queryKey: qk.guests.detail(id) });
    },
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.guests.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.guests.all }),
  });
}

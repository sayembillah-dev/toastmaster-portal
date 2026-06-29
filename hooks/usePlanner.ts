"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { PlannerRowInput, PlannerRowUpdateInput } from "@/lib/validation";

export function usePlanner() {
  return useQuery({
    queryKey: qk.planner.all,
    queryFn: () => api.planner.list(),
  });
}

export function useCreatePlannerRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlannerRowInput) => api.planner.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.planner.all });
    },
  });
}

export function useUpdatePlannerRow(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlannerRowUpdateInput) => api.planner.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.planner.all });
    },
  });
}

export function useDeletePlannerRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.planner.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.planner.all });
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { TaskInput, TaskUpdateInput } from "@/lib/validation";

export function useTasks() {
  return useQuery({
    queryKey: qk.tasks.all,
    queryFn: () => api.tasks.list(),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskInput) => api.tasks.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks.all }),
  });
}

export function useUpdateTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskUpdateInput) => api.tasks.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks.all }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks.all }),
  });
}

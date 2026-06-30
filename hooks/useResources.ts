"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";

export type ResourceParams = {
  q?:        string;
  page?:     number;
  pageSize?: number;
};

export function useResources(params: ResourceParams = {}) {
  return useQuery({
    queryKey: qk.resources.list(params as Record<string, unknown>),
    queryFn:  () => api.resources.list(params),
  });
}

export function useUploadResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      api.resources.upload(title, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.resources.all });
    },
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.resources.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.resources.all });
    },
  });
}

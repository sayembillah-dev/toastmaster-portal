"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";

export type DocumentParams = {
  q?:        string;
  type?:     string;
  page?:     number;
  pageSize?: number;
};

export function useDocuments(params: DocumentParams = {}) {
  return useQuery({
    queryKey: qk.documents.list(params as Record<string, unknown>),
    queryFn:  () => api.documents.list(params),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      api.documents.uploadFile(title, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.documents.all }); },
  });
}

export function useCreateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; url: string; description?: string }) =>
      api.documents.createLink(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.documents.all }); },
  });
}

export function useCreateText() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.documents.createText(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.documents.all }); },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.documents.remove(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: qk.documents.all }); },
  });
}

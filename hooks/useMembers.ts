"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { MemberInput, MemberUpdateInput } from "@/lib/validation";

export function useMembers() {
  return useQuery({
    queryKey: qk.members.all,
    queryFn: () => api.members.list(),
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: qk.members.detail(id),
    queryFn: () => api.members.get(id),
    enabled: !!id,
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberInput) => api.members.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members.all }),
  });
}

export function useUpdateMember(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberUpdateInput) => api.members.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.members.all });
      qc.invalidateQueries({ queryKey: qk.members.detail(id) });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.members.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members.all }),
  });
}

export function useUploadMemberPhoto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.members.uploadPhoto(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.members.all });
      qc.invalidateQueries({ queryKey: qk.members.detail(id) });
    },
  });
}

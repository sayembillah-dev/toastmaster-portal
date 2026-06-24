"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { TransactionInput, TransactionUpdateInput } from "@/lib/validation";

export function useTransactions() {
  return useQuery({
    queryKey: qk.funds.transactions,
    queryFn: () => api.funds.list(),
  });
}

export function useFundSummary() {
  return useQuery({
    queryKey: qk.funds.summary,
    queryFn: () => api.funds.summary(),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionInput) => api.funds.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.funds.transactions });
      qc.invalidateQueries({ queryKey: qk.funds.summary });
    },
  });
}

export function useUpdateTransaction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionUpdateInput) => api.funds.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.funds.transactions });
      qc.invalidateQueries({ queryKey: qk.funds.summary });
      qc.invalidateQueries({ queryKey: qk.funds.detail(id) });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.funds.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.funds.transactions });
      qc.invalidateQueries({ queryKey: qk.funds.summary });
    },
  });
}

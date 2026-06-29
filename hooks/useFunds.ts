"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import { qk } from "@/lib/queryKeys";
import type { TransactionInput, TransactionUpdateInput } from "@/lib/validation";

export type TransactionParams = {
  q?:        string;
  type?:     string;
  category?: string;
  month?:    string;
  year?:     string;
  from?:     string;
  to?:       string;
  page?:     number;
  pageSize?: number;
};

export function useTransactions(params: TransactionParams = {}) {
  return useQuery({
    queryKey: qk.funds.transactions(params as Record<string, unknown>),
    queryFn:  () => api.funds.list(params),
  });
}

export function useFundSummary() {
  return useQuery({
    queryKey: qk.funds.summary,
    queryFn:  () => api.funds.summary(),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionInput) => api.funds.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.funds.all });
      qc.invalidateQueries({ queryKey: qk.funds.summary });
    },
  });
}

export function useUpdateTransaction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionUpdateInput) => api.funds.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.funds.all });
      qc.invalidateQueries({ queryKey: qk.funds.summary });
      qc.invalidateQueries({ queryKey: qk.funds.detail(id) });
    },
  });
}

export function useBulkCreateTransactions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transactions: TransactionInput[]) => api.funds.bulkCreate(transactions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.funds.all });
      qc.invalidateQueries({ queryKey: qk.funds.summary });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.funds.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.funds.all });
      qc.invalidateQueries({ queryKey: qk.funds.summary });
    },
  });
}

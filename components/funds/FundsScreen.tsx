"use client";

import { useEffect, useState } from "react";
import { useTransactions } from "@/hooks/useFunds";
import { FundSummaryCards } from "./FundSummaryCards";
import { TransactionFormDialog } from "./TransactionFormDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { BulkTransactionDialog } from "./BulkTransactionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  formatAmount,
} from "@/lib/fundConstants";
import { cn } from "@/lib/utils";
import type { TransactionDTO } from "@/lib/serializers";

const PAGE_SIZE = 20;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Static year list: current year back 6 years
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - i);

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function FundsScreen() {
  const [q, setQ]                       = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter]   = useState("");
  const [yearFilter, setYearFilter]     = useState("");
  const [page, setPage]                 = useState(1);

  const [formOpen, setFormOpen]         = useState(false);
  const [formMode, setFormMode]         = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget]     = useState<TransactionDTO | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<TransactionDTO | undefined>();
  const [bulkOpen, setBulkOpen]         = useState(false);

  const debouncedQ = useDebounce(q);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [debouncedQ, typeFilter, categoryFilter, monthFilter, yearFilter]);

  const params = {
    ...(debouncedQ       && { q:        debouncedQ }),
    ...(typeFilter       && { type:     typeFilter }),
    ...(categoryFilter   && { category: categoryFilter }),
    ...(monthFilter      && { month:    monthFilter }),
    ...(yearFilter       && { year:     yearFilter }),
    page,
    pageSize: PAGE_SIZE,
  };

  const { data: paged, isLoading } = useTransactions(params);
  const transactions = paged?.data ?? [];
  const total        = paged?.total ?? 0;
  const totalPages   = paged?.totalPages ?? 1;

  const allCategories    = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  const visibleCategories = typeFilter === "income"
    ? INCOME_CATEGORIES
    : typeFilter === "expense"
    ? EXPENSE_CATEGORIES
    : allCategories;

  const pageStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd   = Math.min(page * PAGE_SIZE, total);

  function handleAdd() {
    setEditTarget(undefined);
    setFormMode("create");
    setFormOpen(true);
  }

  function handleEdit(t: TransactionDTO) {
    setEditTarget(t);
    setFormMode("edit");
    setFormOpen(true);
  }

  const hasActiveFilter = !!(q || typeFilter || categoryFilter || monthFilter || yearFilter);

  function clearFilters() {
    setQ(""); setTypeFilter(""); setCategoryFilter(""); setMonthFilter(""); setYearFilter("");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Club Funds</h2>
          {paged && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {total} transaction{total !== 1 ? "s" : ""}
              {hasActiveFilter && " matching filters"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setBulkOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Bulk record
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Record transaction
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <FundSummaryCards />

      <Separator />

      {/* Filters — row 1: search + type + category */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search transactions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(!v || v === "all" ? "" : v);
            setCategoryFilter("");
          }}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {visibleCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filters — row 2: month + year + clear */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={monthFilter}
          onValueChange={(v) => setMonthFilter(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {MONTH_NAMES.map((name, i) => (
              <SelectItem key={name} value={String(i + 1)}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={yearFilter}
          onValueChange={(v) => setYearFilter(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" className="h-10 text-muted-foreground hover:text-foreground" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Transaction list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {!hasActiveFilter && total === 0 ? (
            <div className="space-y-3">
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Start recording income and expenses.</p>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Record transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">No transactions match your filters</p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {transactions.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {pageStart}–{pageEnd} of {total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-16 text-center text-sm tabular-nums">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        transaction={editTarget}
      />
      {deleteTarget && (
        <DeleteTransactionDialog
          transaction={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        />
      )}
      <BulkTransactionDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    </div>
  );
}

function TransactionRow({
  transaction: t,
  onEdit,
  onDelete,
}: {
  transaction: TransactionDTO;
  onEdit:  (t: TransactionDTO) => void;
  onDelete:(t: TransactionDTO) => void;
}) {
  const isIncome = t.type === "income";
  const date = new Date(t.date).toLocaleDateString("en-MY", {
    day: "numeric", month: "short", year: "numeric",
  });
  const heading = t.memberName || t.description || t.category;

  return (
    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      <div className={cn(
        "p-2 rounded-full shrink-0",
        isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600",
      )}>
        {isIncome ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{heading}</span>
          <Badge variant="outline" className="text-xs shrink-0">{t.category}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{date}</span>
          {t.memberName && t.description && <span className="truncate">{t.description}</span>}
          {!t.memberName && !t.description && (
            <span className="flex items-center gap-1 opacity-50">
              <User className="h-3 w-3" /> No member
            </span>
          )}
        </div>
      </div>

      <span className={cn(
        "font-semibold text-sm shrink-0",
        isIncome ? "text-green-600" : "text-destructive",
      )}>
        {isIncome ? "+" : "−"}{formatAmount(t.amount)}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(t)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(t)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

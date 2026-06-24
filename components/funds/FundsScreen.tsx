"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useFunds";
import { FundSummaryCards } from "./FundSummaryCards";
import { TransactionFormDialog } from "./TransactionFormDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
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
} from "lucide-react";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  formatAmount,
} from "@/lib/fundConstants";
import { cn } from "@/lib/utils";
import type { TransactionDTO } from "@/lib/serializers";

export function FundsScreen() {
  const { data: transactions, isLoading } = useTransactions();

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<TransactionDTO | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<TransactionDTO | undefined>();

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  const visibleCategories = typeFilter === "income"
    ? INCOME_CATEGORIES
    : typeFilter === "expense"
    ? EXPENSE_CATEGORIES
    : allCategories;

  const filtered = useMemo(() => {
    if (!transactions) return [];
    let list = transactions;
    if (typeFilter) list = list.filter((t) => t.type === typeFilter);
    if (categoryFilter) list = list.filter((t) => t.category === categoryFilter);
    if (q) {
      const lower = q.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(lower) ||
          t.category.toLowerCase().includes(lower) ||
          t.memberName.toLowerCase().includes(lower),
      );
    }
    return list;
  }, [transactions, typeFilter, categoryFilter, q]);

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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Club Funds</h2>
          {transactions && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} recorded
            </p>
          )}
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Record transaction
        </Button>
      </div>

      {/* Summary cards */}
      <FundSummaryCards />

      <Separator />

      {/* Filters */}
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
            const val = !v || v === "all" ? "" : v;
            setTypeFilter(val);
            setCategoryFilter(""); // reset category when type changes
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

      {/* Transaction list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {transactions?.length === 0 ? (
            <div className="space-y-3">
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Start recording income and expenses.</p>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Record transaction
              </Button>
            </div>
          ) : (
            <p className="font-medium">No transactions match your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
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
    </div>
  );
}

function TransactionRow({
  transaction: t,
  onEdit,
  onDelete,
}: {
  transaction: TransactionDTO;
  onEdit: (t: TransactionDTO) => void;
  onDelete: (t: TransactionDTO) => void;
}) {
  const isIncome = t.type === "income";
  const date = new Date(t.date).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      {/* Icon */}
      <div className={cn(
        "p-2 rounded-full shrink-0",
        isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600",
      )}>
        {isIncome
          ? <ArrowUpCircle className="h-4 w-4" />
          : <ArrowDownCircle className="h-4 w-4" />
        }
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{t.description}</span>
          <Badge variant="outline" className="text-xs shrink-0">{t.category}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{date}</span>
          {t.memberName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {t.memberName}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <span className={cn(
        "font-semibold text-sm shrink-0",
        isIncome ? "text-green-600" : "text-destructive",
      )}>
        {isIncome ? "+" : "−"}{formatAmount(t.amount)}
      </span>

      {/* Actions */}
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

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBulkCreateTransactions } from "@/hooks/useFunds";
import { useMembers } from "@/hooks/useMembers";
import {
  TRANSACTION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type TransactionType,
  type TransactionCategory,
} from "@/lib/fundConstants";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberDTO } from "@/lib/serializers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SharedState = {
  type: TransactionType;
  category: TransactionCategory;
  amount: string;
  description: string;
  defaultDate: string;
};

type RowEntry = {
  key: string;
  memberName: string;
  date: string;
};

let _rowKey = 0;
function nextKey() { return String(++_rowKey); }
const todayISO = () => new Date().toISOString().split("T")[0];

const EMPTY_SHARED: SharedState = {
  type: "income",
  category: "Monthly Club Fee",
  amount: "",
  description: "",
  defaultDate: todayISO(),
};

function emptyRow(date: string): RowEntry {
  return { key: nextKey(), memberName: "", date };
}

export function BulkTransactionDialog({ open, onOpenChange }: Props) {
  const bulkCreate = useBulkCreateTransactions();
  const { data: members = [] } = useMembers();

  const [shared, setShared] = useState<SharedState>(EMPTY_SHARED);
  const [rows, setRows] = useState<RowEntry[]>([emptyRow(EMPTY_SHARED.defaultDate)]);

  useEffect(() => {
    if (open) {
      const fresh = { ...EMPTY_SHARED, defaultDate: todayISO() };
      setShared(fresh);
      setRows([emptyRow(fresh.defaultDate)]);
    }
  }, [open]);

  function setField<K extends keyof SharedState>(key: K, value: SharedState[K]) {
    setShared((s) => ({ ...s, [key]: value }));
  }

  function handleTypeChange(type: TransactionType) {
    setShared((s) => ({
      ...s,
      type,
      category: type === "income" ? "Monthly Club Fee" : "Event Cost",
    }));
  }

  function addRow() {
    setRows((r) => [...r, emptyRow(shared.defaultDate)]);
  }

  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: "memberName" | "date", value: string) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(shared.amount);
    if (isNaN(amount) || amount <= 0) { toast.error("Please enter a valid amount"); return; }
    const validRows = rows.filter((r) => r.date);
    if (validRows.length === 0) { toast.error("Each entry needs a date"); return; }

    bulkCreate.mutate(
      validRows.map((row) => ({
        type: shared.type,
        category: shared.category,
        amount,
        description: shared.description,
        date: row.date,
        memberName: row.memberName,
      })),
      {
        onSuccess: (created) => {
          toast.success(`${created.length} transaction${created.length !== 1 ? "s" : ""} recorded`);
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  const categories = shared.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const validRowCount = rows.filter((r) => r.date).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[92vw] sm:max-w-5xl h-[82vh] overflow-hidden p-0 flex flex-col gap-0">

        {/* ── Top bar ── */}
        <div className="flex flex-col gap-3 border-b px-5 py-4 shrink-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="pr-8">
            <DialogTitle className="text-base font-semibold">Bulk record transactions</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill shared fields once — add a row per person.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)} disabled={bulkCreate.isPending}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={handleSubmit} disabled={bulkCreate.isPending || validRowCount === 0}>
              {bulkCreate.isPending
                ? "Recording…"
                : `Record ${validRowCount}`}
            </Button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">

          {/* Left panel — shared fields */}
          <div className="w-full shrink-0 border-b flex flex-col bg-muted/20 md:w-72 md:border-b-0 md:border-r md:overflow-y-auto">
            <div className="px-5 py-4 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Shared fields
              </p>

              {/* Type toggle */}
              <div className="flex rounded-lg border overflow-hidden">
                {TRANSACTION_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium transition-colors",
                      shared.type === t
                        ? t === "income"
                          ? "bg-green-600 text-white"
                          : "bg-destructive text-white"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {t === "income" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (BDT) *</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={shared.amount}
                  onChange={(e) => setField("amount", e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs">Category *</Label>
                <Select
                  value={shared.category}
                  onValueChange={(v) => { if (v) setField("category", v as TransactionCategory); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Description{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  value={shared.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="e.g. June monthly club fee"
                  maxLength={500}
                />
              </div>

              {/* Default date */}
              <div className="space-y-1.5">
                <Label className="text-xs">Default date *</Label>
                <Input
                  type="date"
                  value={shared.defaultDate}
                  onChange={(e) => setField("defaultDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Right panel — entries */}
          <div className="flex-1 flex flex-col md:min-h-0 md:overflow-hidden">

            {/* Entries header */}
            <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Entries ({rows.length})
              </span>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add entry
              </button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[24px_1fr_120px_32px] gap-2 px-4 py-2 border-b bg-muted/30 shrink-0 md:grid-cols-[32px_1fr_160px_36px] md:gap-3 md:px-6">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">#</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Member</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</span>
              <span />
            </div>

            {/* Rows — scrollable on desktop, flows on mobile */}
            <div className="md:flex-1 md:overflow-y-auto">
              {rows.map((row, idx) => (
                <MemberRow
                  key={row.key}
                  index={idx}
                  memberName={row.memberName}
                  date={row.date}
                  members={members}
                  onChange={updateRow}
                  onRemove={removeRow}
                  isOnly={rows.length === 1}
                />
              ))}

              {/* Empty state */}
              {rows.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <p className="text-sm">No entries yet</p>
                  <button type="button" onClick={addRow} className="text-xs text-primary hover:underline">
                    Add the first entry
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({
  index,
  memberName,
  date,
  members,
  onChange,
  onRemove,
  isOnly,
}: {
  index: number;
  memberName: string;
  date: string;
  members: MemberDTO[];
  onChange: (idx: number, field: "memberName" | "date", value: string) => void;
  onRemove: (idx: number) => void;
  isOnly: boolean;
}) {
  const [search, setSearch] = useState(memberName);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = search.trim()
    ? members.filter((m) => m.fullName.toLowerCase().includes(search.toLowerCase()))
    : members;

  function selectMember(name: string) {
    setSearch(name);
    onChange(index, "memberName", name);
    setDropdownOpen(false);
  }

  return (
    <div className="grid grid-cols-[24px_1fr_120px_32px] gap-2 items-center px-4 py-2.5 border-b last:border-b-0 hover:bg-muted/20 transition-colors md:grid-cols-[32px_1fr_160px_36px] md:gap-3 md:px-6">
      {/* Index */}
      <span className="text-xs text-muted-foreground text-center tabular-nums">{index + 1}</span>

      {/* Member search */}
      <div className="relative" ref={ref}>
        <Input
          autoComplete="off"
          placeholder="Member name (optional)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(index, "memberName", e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          className="h-9 text-sm"
        />
        {dropdownOpen && filtered.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full max-h-44 overflow-y-auto rounded-md border bg-popover shadow-lg text-sm">
            {filtered.map((m) => (
              <li
                key={m.id}
                onMouseDown={() => selectMember(m.fullName)}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-muted",
                  memberName === m.fullName && "bg-muted font-medium",
                )}
              >
                {m.fullName}
              </li>
            ))}
          </ul>
        )}
        {dropdownOpen && search.trim() && filtered.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-lg">
            No members found
          </div>
        )}
      </div>

      {/* Date */}
      <Input
        type="date"
        value={date}
        onChange={(e) => onChange(index, "date", e.target.value)}
        className="h-9 text-sm"
        required
      />

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={isOnly}
        className={cn(
          "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
          isOnly
            ? "opacity-20 cursor-not-allowed"
            : "text-muted-foreground hover:bg-red-50 hover:text-destructive",
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/useFunds";
import { useMembers } from "@/hooks/useMembers";
import {
  TRANSACTION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type TransactionType,
  type TransactionCategory,
} from "@/lib/fundConstants";
import { toast } from "sonner";
import type { TransactionDTO } from "@/lib/serializers";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  transaction?: TransactionDTO;
}

type FormState = {
  type: TransactionType;
  category: TransactionCategory;
  amount: string;
  description: string;
  date: string;
  memberName: string;
};

const EMPTY_FORM: FormState = {
  type: "income",
  category: "Membership Fee",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  memberName: "",
};

export function TransactionFormDialog({ open, onOpenChange, mode, transaction }: Props) {
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction(transaction?.id ?? "");
  const { data: members = [] } = useMembers();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [memberSearch, setMemberSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const memberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && transaction) {
        setForm({
          type: transaction.type,
          category: transaction.category,
          amount: String(transaction.amount),
          description: transaction.description,
          date: transaction.date.split("T")[0],
          memberName: transaction.memberName,
        });
        setMemberSearch(transaction.memberName);
      } else {
        setForm(EMPTY_FORM);
        setMemberSearch("");
      }
      setDropdownOpen(false);
    }
  }, [open, mode, transaction]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (memberRef.current && !memberRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTypeChange(type: TransactionType) {
    const defaultCategory = type === "income" ? "Membership Fee" : "Event Cost";
    setForm((f) => ({ ...f, type, category: defaultCategory }));
  }

  function handleMemberSelect(name: string) {
    set("memberName", name);
    setMemberSearch(name);
    setDropdownOpen(false);
  }

  function handleMemberSearchChange(value: string) {
    setMemberSearch(value);
    set("memberName", "");
    setDropdownOpen(true);
  }

  const filteredMembers = memberSearch.trim()
    ? members.filter((m) =>
        m.fullName.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : members;

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const payload = {
      type: form.type,
      category: form.category,
      amount,
      description: form.description,
      date: form.date,
      memberName: form.memberName,
    };

    const onSuccess = () => {
      toast.success(mode === "create" ? "Transaction recorded" : "Transaction updated");
      onOpenChange(false);
    };
    const onError = (err: Error) => toast.error(err.message);

    if (mode === "create") {
      createTx.mutate(payload, { onSuccess, onError });
    } else {
      updateTx.mutate(payload, { onSuccess, onError });
    }
  }

  const isPending = createTx.isPending || updateTx.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Record transaction" : "Edit transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {TRANSACTION_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === t
                    ? t === "income"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-destructive text-white border-destructive"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t === "income" ? "Income" : "Expense"}
              </button>
            ))}
          </div>

          {/* Member */}
          <div className="space-y-1.5" ref={memberRef}>
            <Label htmlFor="memberSearch">Member <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <div className="relative">
              <Input
                id="memberSearch"
                autoComplete="off"
                placeholder="Search member…"
                value={memberSearch}
                onChange={(e) => handleMemberSearchChange(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
              />
              {dropdownOpen && filteredMembers.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md text-sm">
                  {filteredMembers.map((m) => (
                    <li
                      key={m.id}
                      onMouseDown={() => handleMemberSelect(m.fullName)}
                      className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                        form.memberName === m.fullName ? "bg-muted font-medium" : ""
                      }`}
                    >
                      {m.fullName}
                    </li>
                  ))}
                </ul>
              )}
              {dropdownOpen && memberSearch.trim() && filteredMembers.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                  No members found
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (BDT) *</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => { if (v) set("category", v as TransactionCategory); }}
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
            <Label htmlFor="description">Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Monthly membership fee from Ahmad"
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : mode === "create" ? "Record" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

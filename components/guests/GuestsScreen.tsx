"use client";

import { useMemo, useState } from "react";
import { useGuests } from "@/hooks/useGuests";
import { GuestCard } from "./GuestCard";
import { GuestFormDialog } from "./GuestFormDialog";
import { DeleteGuestDialog } from "./DeleteGuestDialog";
import { GuestPipelineBoard } from "./GuestPipelineBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Search, Link2, Check, LayoutGrid, Kanban } from "lucide-react";
import { FOLLOW_UP_STATUSES, FOLLOW_UP_LABELS } from "@/lib/guestConstants";
import type { GuestDTO } from "@/lib/serializers";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "pipeline";

export function GuestsScreen() {
  const { data: guests, isLoading } = useGuests();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<GuestDTO | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<GuestDTO | undefined>();
  const [view, setView] = useState<ViewMode>("list");

  const filtered = useMemo(() => {
    if (!guests) return [];
    let list = guests;
    if (statusFilter) list = list.filter((g) => g.followUpStatus === statusFilter);
    if (q) {
      const lower = q.toLowerCase();
      list = list.filter(
        (g) =>
          g.fullName.toLowerCase().includes(lower) ||
          g.email.toLowerCase().includes(lower) ||
          g.phone.includes(lower),
      );
    }
    return list;
  }, [guests, q, statusFilter]);

  function handleEdit(guest: GuestDTO) {
    setEditTarget(guest);
    setFormMode("edit");
    setFormOpen(true);
  }

  function handleAdd() {
    setEditTarget(undefined);
    setFormMode("create");
    setFormOpen(true);
  }

  function handleShareLink() {
    const url = `${window.location.origin}/join`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Guests</h2>
          {guests && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {guests.length} total guest{guests.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShareLink} className="gap-2">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
            {copied ? "Copied!" : "Share link"}
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add guest
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search guests…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        {view === "list" && (
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(!v || v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Follow-up status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {FOLLOW_UP_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {FOLLOW_UP_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center border rounded-md p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("pipeline")}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
              view === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Kanban className="h-3.5 w-3.5" />
            Kanban
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-30" />
          {guests?.length === 0 ? (
            <>
              <p className="font-medium">No guests yet</p>
              <p className="text-sm mt-1">Add guests who have visited the club.</p>
              <Button onClick={handleAdd} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add guest
              </Button>
            </>
          ) : (
            <p className="font-medium">No guests match your filters</p>
          )}
        </div>
      ) : view === "pipeline" ? (
        <GuestPipelineBoard guests={filtered} />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <GuestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        guest={editTarget}
      />

      {deleteTarget && (
        <DeleteGuestDialog
          guest={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        />
      )}
    </div>
  );
}

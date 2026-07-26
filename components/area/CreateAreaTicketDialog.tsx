"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllClubMembersGrouped } from "@/hooks/useAllClubMembersGrouped";
import { DIVISION_DIRECTOR_LABEL, type AreaClub } from "@/lib/areaConstants";
import {
  TICKET_SEVERITIES,
  type GlobalTicket,
  type TicketParty,
  type TicketSeverity,
} from "@/lib/ticketConstants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Building2, ChevronDown, ArrowUpCircle, X, Check } from "lucide-react";

type SelectedPerson = { clubId: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubs: AreaClub[];
  onCreate: (ticket: GlobalTicket) => void;
};

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function CreateAreaTicketDialog({ open, onOpenChange, clubs, onCreate }: Props) {
  const { groups, isLoading: membersLoading } = useAllClubMembersGrouped(clubs);

  const [selectedClubIds, setSelectedClubIds] = useState<Set<string>>(new Set());
  const [selectedPeople, setSelectedPeople] = useState<SelectedPerson[]>([]);
  const [escalate, setEscalate] = useState(false);
  const [expandedClubIds, setExpandedClubIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<TicketSeverity>("Medium");

  useEffect(() => {
    if (open) {
      setSelectedClubIds(new Set());
      setSelectedPeople([]);
      setEscalate(false);
      setExpandedClubIds(new Set());
      setTitle("");
      setDescription("");
      setSeverity("Medium");
    }
  }, [open]);

  function toggleClub(clubId: string) {
    setSelectedClubIds((prev) => {
      const next = new Set(prev);
      if (next.has(clubId)) next.delete(clubId);
      else next.add(clubId);
      return next;
    });
  }

  function togglePerson(clubId: string, name: string) {
    setSelectedPeople((prev) => {
      const exists = prev.some((p) => p.clubId === clubId && p.name === name);
      return exists
        ? prev.filter((p) => !(p.clubId === clubId && p.name === name))
        : [...prev, { clubId, name }];
    });
  }

  function toggleExpanded(clubId: string) {
    setExpandedClubIds((prev) => {
      const next = new Set(prev);
      if (next.has(clubId)) next.delete(clubId);
      else next.add(clubId);
      return next;
    });
  }

  const hasSelection = selectedClubIds.size > 0 || selectedPeople.length > 0 || escalate;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!hasSelection) {
      toast.error("Select at least one club, person, or the Division Director");
      return;
    }

    const parties: TicketParty[] = [
      ...[...selectedClubIds].map((clubId) => {
        const club = clubs.find((c) => c.id === clubId);
        return { type: "club" as const, clubId, name: club?.name ?? clubId, resolved: false };
      }),
      ...selectedPeople.map((p) => ({ type: "person" as const, clubId: p.clubId, name: p.name, resolved: false })),
      ...(escalate ? [{ type: "division" as const, name: DIVISION_DIRECTOR_LABEL, resolved: false }] : []),
    ];

    const ticket: GlobalTicket = {
      id: `ticket-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      severity,
      date: todayLabel(),
      parties,
    };

    onCreate(ticket);
    toast.success("Ticket created");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Ticket</DialogTitle>
          <DialogDescription>
            Tag any combination of clubs, specific people, and your {DIVISION_DIRECTOR_LABEL}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Selected chips */}
          {hasSelection && (
            <div className="flex flex-wrap gap-1.5">
              {[...selectedClubIds].map((id) => {
                const club = clubs.find((c) => c.id === id);
                if (!club) return null;
                return (
                  <Badge key={`club-${id}`} variant="secondary" className="gap-1 pr-1">
                    <Building2 className="h-3 w-3" />
                    {club.name}
                    <button type="button" onClick={() => toggleClub(id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              {selectedPeople.map((p) => (
                <Badge key={`person-${p.clubId}-${p.name}`} variant="secondary" className="gap-1 pr-1">
                  {p.name}
                  <button
                    type="button"
                    onClick={() => togglePerson(p.clubId, p.name)}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {escalate && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  <ArrowUpCircle className="h-3 w-3" />
                  {DIVISION_DIRECTOR_LABEL}
                  <button type="button" onClick={() => setEscalate(false)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Tag tree */}
          <div className="space-y-1.5">
            <Label>Tag * <span className="text-xs text-muted-foreground font-normal">(select any number)</span></Label>

            <button
              type="button"
              onClick={() => setEscalate((v) => !v)}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                escalate ? "border-primary bg-primary/5" : "hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  escalate ? "bg-primary border-primary text-primary-foreground" : "border-input",
                )}
              >
                {escalate && <Check className="h-3 w-3" />}
              </span>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Escalate to {DIVISION_DIRECTOR_LABEL}</span>
            </button>

            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {groups.map((g) => {
                const clubChecked = selectedClubIds.has(g.clubId);
                const expanded = expandedClubIds.has(g.clubId);
                return (
                  <div key={g.clubId}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleClub(g.clubId)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            clubChecked ? "bg-primary border-primary text-primary-foreground" : "border-input",
                          )}
                        >
                          {clubChecked && <Check className="h-3 w-3" />}
                        </span>
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{g.clubName}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(g.clubId)}
                        className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                      </button>
                    </div>
                    {expanded && (
                      <div className="pb-1.5">
                        {membersLoading && g.members.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">Loading…</p>
                        ) : g.members.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">No members.</p>
                        ) : (
                          g.members.map((m) => {
                            const checked = selectedPeople.some((p) => p.clubId === g.clubId && p.name === m.name);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => togglePerson(g.clubId, m.name)}
                                className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left hover:bg-muted/40 transition-colors"
                              >
                                <span
                                  className={cn(
                                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
                                    checked ? "bg-primary border-primary text-primary-foreground" : "border-input",
                                  )}
                                >
                                  {checked && <Check className="h-2.5 w-2.5" />}
                                </span>
                                <span className="text-sm truncate">{m.name}</span>
                                <span className="text-xs text-muted-foreground shrink-0 ml-auto">{m.role}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="areaTicketTitle">Title *</Label>
            <Input
              id="areaTicketTitle"
              placeholder="Short summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="areaTicketDescription">
              Description <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="areaTicketDescription"
              placeholder="Add details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Severity */}
          <div className="space-y-1.5">
            <Label>Severity *</Label>
            <Select value={severity} onValueChange={(v) => { if (v) setSeverity(v as TicketSeverity); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

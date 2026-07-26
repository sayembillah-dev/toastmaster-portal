"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClubMembers } from "@/hooks/useClubMembers";
import type { AreaClub } from "@/lib/areaConstants";
import { TICKET_SEVERITIES, type GlobalTicket, type TicketParty, type TicketSeverity } from "@/lib/ticketConstants";
import { toast } from "sonner";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: AreaClub;
  onCreate: (ticket: GlobalTicket) => void;
};

const EMPTY = { title: "", description: "", severity: "Medium" as TicketSeverity, tags: [] as string[] };

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function CreateTicketDialog({ open, onOpenChange, club, onCreate }: Props) {
  const { members } = useClubMembers(club);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  function toggleTag(name: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(name) ? f.tags.filter((t) => t !== name) : [...f.tags, name],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    // No specific person tagged → the ticket is against the whole club (President resolves).
    const parties: TicketParty[] =
      form.tags.length > 0
        ? form.tags.map((name) => ({ type: "person" as const, clubId: club.id, name, resolved: false }))
        : [{ type: "club" as const, clubId: club.id, name: club.name, resolved: false }];

    const ticket: GlobalTicket = {
      id: `ticket-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
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
          <DialogTitle>New Ticket — {club.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="ticketTitle">Title *</Label>
            <Input
              id="ticketTitle"
              placeholder="Short summary of the issue"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticketDescription">
              Description <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="ticketDescription"
              placeholder="Add details…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Severity *</Label>
            <Select
              value={form.severity}
              onValueChange={(v) => { if (v) setForm((f) => ({ ...f, severity: v as TicketSeverity })); }}
            >
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

          <div className="space-y-1.5">
            <Label>
              Tag <span className="text-xs text-muted-foreground">(optional — anyone from this club; leave empty to tag the whole club)</span>
            </Label>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {form.tags.map((name) => (
                  <Badge key={name} variant="secondary" className="gap-1 pr-1">
                    {name}
                    <button
                      type="button"
                      onClick={() => toggleTag(name)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No members to tag.</p>
              ) : (
                members.map((m) => {
                  const checked = form.tags.includes(m.name);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleTag(m.name)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                        checked ? "bg-muted/70" : "hover:bg-muted/40"
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{m.role}</span>
                    </button>
                  );
                })
              )}
            </div>
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

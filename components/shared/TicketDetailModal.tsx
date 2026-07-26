"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ticketStatus,
  partyLabel,
  partyDisplayKey,
  TICKET_STATUS_STYLES,
  TICKET_SEVERITY_STYLES,
  TICKET_SEVERITIES,
  type GlobalTicket,
  type TicketSeverity,
} from "@/lib/ticketConstants";
import { Building2, User, UserPen, ArrowUpCircle, Check, Pencil, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type Props = {
  ticket: GlobalTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolveTicket: (ticketId: string, resolved: boolean) => void;
  onUpdate: (ticketId: string, patch: Partial<GlobalTicket>) => void;
  onDelete: (ticketId: string) => void;
};

const PARTY_ICON = { club: Building2, person: User, division: ArrowUpCircle } as const;

export function TicketDetailModal({ ticket, open, onOpenChange, onResolveTicket, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<TicketSeverity>("Medium");

  useEffect(() => {
    if (ticket && open) {
      setEditing(false);
      setConfirmingDelete(false);
      setTitle(ticket.title);
      setDescription(ticket.description);
      setSeverity(ticket.severity);
    }
  }, [ticket, open]);

  if (!ticket) return null;

  const status = ticketStatus(ticket);

  function handleSaveEdit() {
    if (!ticket) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onUpdate(ticket.id, { title: title.trim(), description: description.trim(), severity });
    toast.success("Ticket updated");
    setEditing(false);
  }

  function handleDelete() {
    if (!ticket) return;
    onDelete(ticket.id);
    toast.success("Ticket deleted");
    onOpenChange(false);
  }

  function handleToggleResolved() {
    if (!ticket) return;
    onResolveTicket(ticket.id, !ticket.resolved);
    toast.success(ticket.resolved ? "Ticket reopened" : "Ticket resolved");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle>{editing ? "Edit Ticket" : ticket.title}</DialogTitle>
            {!editing && (
              <Badge variant="outline" className={cn("text-xs shrink-0", TICKET_STATUS_STYLES[status])}>
                {status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {editing ? (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="editTitle">Title *</Label>
              <Input id="editTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>
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
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", TICKET_SEVERITY_STYLES[ticket.severity])}>
                {ticket.severity} severity
              </Badge>
              <span className="text-xs text-muted-foreground">{ticket.date}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserPen className="h-3.5 w-3.5 shrink-0" />
              <span>
                Created by <span className="font-medium text-foreground">{ticket.createdBy}</span>
              </span>
            </div>

            {ticket.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
            )}

            {ticket.parties.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Involved</Label>
                <div className="border rounded-lg divide-y">
                  {ticket.parties.map((p) => {
                    const Icon = PARTY_ICON[p.type];
                    return (
                      <div key={partyDisplayKey(p)} className="flex items-center gap-2 px-3 py-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{partyLabel(p)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              type="button"
              variant={ticket.resolved ? "outline" : "default"}
              className={cn("w-full gap-1.5", !ticket.resolved && "bg-green-600 hover:bg-green-700 text-white")}
              onClick={handleToggleResolved}
            >
              {ticket.resolved ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {ticket.resolved ? "Reopen Ticket" : "Mark Ticket Resolved"}
            </Button>
          </div>
        )}

        {!editing && (
          <DialogFooter>
            {confirmingDelete ? (
              <>
                <span className="text-xs text-muted-foreground self-center mr-auto">Delete this ticket?</span>
                <Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" className="gap-1.5" onClick={() => setConfirmingDelete(true)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button type="button" variant="outline" className="gap-1.5" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

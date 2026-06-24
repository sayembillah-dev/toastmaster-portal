"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Users, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGuests } from "@/hooks/useGuests";
import type { AttendeeDTO } from "@/lib/serializers";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";

type Props = { form: EventFormState; update: UpdateFormFn };

const EMPTY_MANUAL: Omit<AttendeeDTO, "guestId"> = { name: "", email: "", phone: "", notes: "" };

export function GuestListTab({ form, update }: Props) {
  const [showPoolDialog, setShowPoolDialog] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [poolSearch, setPoolSearch] = useState("");
  const [manual, setManual] = useState({ ...EMPTY_MANUAL });

  const { data: guestPool = [] } = useGuests();

  const attendees = form.attendees;

  const removeAttendee = (i: number) =>
    update({ attendees: attendees.filter((_, idx) => idx !== i) });

  const addFromPool = (guest: (typeof guestPool)[number]) => {
    const already = attendees.some((a) => a.guestId === guest.id);
    if (already) return;
    update({
      attendees: [
        ...attendees,
        { name: guest.fullName, email: guest.email, phone: guest.phone, guestId: guest.id, notes: "" },
      ],
    });
    setShowPoolDialog(false);
    setPoolSearch("");
  };

  const addManual = () => {
    if (!manual.name.trim()) return;
    update({
      attendees: [...attendees, { ...manual, guestId: "" }],
    });
    setManual({ ...EMPTY_MANUAL });
    setShowManualForm(false);
  };

  const filtered = guestPool.filter((g) => {
    const q = poolSearch.toLowerCase();
    return (
      g.fullName.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Guest List</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {attendees.length} {attendees.length === 1 ? "attendee" : "attendees"} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={() => setShowPoolDialog(true)}
          >
            <Users className="h-3.5 w-3.5" />
            From Pool
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={() => setShowManualForm((v) => !v)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Manually
          </Button>
        </div>
      </div>

      {/* Manual entry form */}
      {showManualForm && (
        <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Attendee</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground mb-1">Name *</Label>
              <Input
                value={manual.name}
                onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
                placeholder="Full name"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Email</Label>
              <Input
                type="email"
                value={manual.email}
                onChange={(e) => setManual((m) => ({ ...m, email: e.target.value }))}
                placeholder="email@example.com"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Phone</Label>
              <Input
                value={manual.phone}
                onChange={(e) => setManual((m) => ({ ...m, phone: e.target.value }))}
                placeholder="+60 12-345 6789"
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground mb-1">Notes (optional)</Label>
              <Input
                value={manual.notes}
                onChange={(e) => setManual((m) => ({ ...m, notes: e.target.value }))}
                placeholder="e.g. Visiting from Kuala Lumpur"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setShowManualForm(false); setManual({ ...EMPTY_MANUAL }); }}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={addManual} disabled={!manual.name.trim()}>
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Attendee list */}
      {attendees.length === 0 && !showManualForm && (
        <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">
          No attendees yet. Add guests from the pool or manually.
        </div>
      )}

      {attendees.length > 0 && (
        <div className="border rounded-lg overflow-hidden divide-y">
          {attendees.map((a, i) => (
            <div key={`attendee-${i}`} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{a.name}</span>
                  {a.guestId && (
                    <Badge variant="secondary" className="text-xs shrink-0">Pool</Badge>
                  )}
                </div>
                {(a.email || a.phone) && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {[a.email, a.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
                {a.notes && (
                  <p className="text-xs text-muted-foreground/70 truncate">{a.notes}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeAttendee(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Guest pool dialog */}
      {showPoolDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-sm">Add from Guest Pool</h2>
              <button
                type="button"
                onClick={() => { setShowPoolDialog(false); setPoolSearch(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  autoFocus
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                  placeholder="Search by name, email, phone…"
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No guests found.</p>
              ) : (
                <div className="divide-y">
                  {filtered.map((g) => {
                    const already = attendees.some((a) => a.guestId === g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        disabled={already}
                        onClick={() => addFromPool(g)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{g.fullName}</p>
                          {(g.email || g.phone) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {[g.email, g.phone].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                        {already && (
                          <Badge variant="outline" className="text-xs shrink-0">Added</Badge>
                        )}
                        {!already && (
                          <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Separator />
            <div className="p-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => { setShowPoolDialog(false); setPoolSearch(""); }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

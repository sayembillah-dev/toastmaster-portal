"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, FileText, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { EventCard } from "./EventCard";
import { useEvents, useEventTemplates, useCreateEvent, useDeleteEvent } from "@/hooks/useEvents";
import type { EventDTO } from "@/lib/serializers";

type NewEventMode = "blank" | "template";

function today() {
  return new Date().toISOString().split("T")[0];
}

export function EventsScreen() {
  const router = useRouter();
  const { data: events, isLoading } = useEvents();
  const { data: templates } = useEventTemplates();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [mode, setMode] = useState<NewEventMode>("blank");
  const [selectedTemplate, setSelectedTemplate] = useState<EventDTO | null>(null);
  const [newDate, setNewDate] = useState(today());
  const [newMeetingNum, setNewMeetingNum] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const nonTemplateEvents = events?.filter((e) => !e.isTemplate) ?? [];
  const templateEvents = templates ?? [];

  const upcoming = nonTemplateEvents.filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)));
  const past = nonTemplateEvents.filter((e) => new Date(e.date) < new Date(new Date().setHours(0, 0, 0, 0)));

  const openNewDialog = () => {
    setMode("blank");
    setSelectedTemplate(null);
    setNewDate(today());
    setNewMeetingNum("");
    setNewTheme("");
    setShowNewDialog(true);
  };

  const handleCreate = async () => {
    if (!newDate) {
      toast.error("Please pick a date");
      return;
    }
    setCreating(true);
    try {
      const base = mode === "template" && selectedTemplate
        ? {
            roles: selectedTemplate.roles,
            wordOfDay: selectedTemplate.wordOfDay,
            speakers: [],
            tableTopicQuestions: [],
          }
        : {};

      const doc = await createEvent.mutateAsync({
        date: newDate,
        meetingNumber: Number(newMeetingNum) || 0,
        theme: newTheme,
        startTime: "18:00",
        isTemplate: false,
        attendees: [],
        resources: [],
        timerEntries: [],
        ...base,
      } as unknown as Parameters<typeof createEvent.mutateAsync>[0]);

      setShowNewDialog(false);
      router.push(`/events/${doc.id}`);
    } catch {
      toast.error("Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    setDeletingId(id);
    try {
      await deleteEvent.mutateAsync(id);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Events
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Build and print meeting agendas</p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* Upcoming events */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
            No upcoming events.{" "}
            <button type="button" className="underline" onClick={openNewDialog}>
              Create one
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} onDelete={handleDelete} isDeleting={deletingId === e.id} />
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {past.map((e) => (
              <EventCard key={e.id} event={e} onDelete={handleDelete} isDeleting={deletingId === e.id} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-6" />

      {/* Templates */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={async () => {
              setCreating(true);
              try {
                const doc = await createEvent.mutateAsync({
                  date: today(),
                  startTime: "18:00",
                  isTemplate: true,
                  templateName: "New Template",
                  meetingNumber: 0,
                } as unknown as Parameters<typeof createEvent.mutateAsync>[0]);
                router.push(`/events/${doc.id}`);
              } catch {
                toast.error("Failed to create template");
              } finally {
                setCreating(false);
              }
            }}
            disabled={creating}
          >
            <Plus className="h-3.5 w-3.5" />
            New Template
          </Button>
        </div>
        {templateEvents.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-muted-foreground text-sm">
            No templates yet. Save an event as a template to reuse role assignments.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templateEvents.map((e) => (
              <EventCard key={e.id} event={e} onDelete={handleDelete} isDeleting={deletingId === e.id} />
            ))}
          </div>
        )}
      </section>

      {/* New Event Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Event</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Mode selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMode("blank"); setSelectedTemplate(null); }}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  mode === "blank" ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Start blank
              </button>
              <button
                type="button"
                onClick={() => setMode("template")}
                disabled={templateEvents.length === 0}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                  mode === "template" ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Load template
              </button>
            </div>

            {/* Template picker */}
            {mode === "template" && templateEvents.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Select template</Label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {templateEvents.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedTemplate?.id === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {t.templateName || t.theme || "Untitled template"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Meeting #</Label>
                <Input
                  type="number"
                  value={newMeetingNum}
                  onChange={(e) => setNewMeetingNum(e.target.value)}
                  placeholder="40"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1">Theme (optional)</Label>
              <Input
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                placeholder="e.g. Expectations vs Reality"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || (mode === "template" && !selectedTemplate)}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create & Build
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

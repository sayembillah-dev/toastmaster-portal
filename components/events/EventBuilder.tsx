"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Printer, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUpdateEvent } from "@/hooks/useEvents";
import type { EventDTO, SpeakerDTO, TableTopicQuestionDTO } from "@/lib/serializers";
import { AGENDA_ROLE_KEYS, AGENDA_ROLE_LABELS, type AgendaRoleKey } from "@/lib/eventConstants";
import { MemberCombobox } from "./MemberCombobox";

type Props = { event: EventDTO };

type FormState = {
  title: string;
  meetingNumber: string;
  date: string;
  startTime: string;
  theme: string;
  venue: string;
  isTemplate: boolean;
  templateName: string;
  roles: Record<AgendaRoleKey, string>;
  speakers: SpeakerDTO[];
  wordOfDay: { word: string; partOfSpeech: string; meaning: string; example: string };
  tableTopicQuestions: TableTopicQuestionDTO[];
};

function toISODate(iso: string) {
  return iso.split("T")[0];
}

function initForm(event: EventDTO): FormState {
  return {
    title: event.title,
    meetingNumber: String(event.meetingNumber || ""),
    date: toISODate(event.date),
    startTime: event.startTime,
    theme: event.theme,
    venue: event.venue,
    isTemplate: event.isTemplate,
    templateName: event.templateName,
    roles: { ...event.roles } as Record<AgendaRoleKey, string>,
    speakers: event.speakers.map((s) => ({ ...s })),
    wordOfDay: { ...event.wordOfDay },
    tableTopicQuestions: event.tableTopicQuestions.map((q) => ({ ...q })),
  };
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-sm">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1">{label}</Label>
      {children}
    </div>
  );
}

export function EventBuilder({ event }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initForm(event));
  const updateEvent = useUpdateEvent(event.id);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);

  const buildPayload = useCallback((f: FormState) => ({
    title: f.title,
    meetingNumber: Number(f.meetingNumber) || 0,
    date: f.date,
    startTime: f.startTime,
    theme: f.theme,
    venue: f.venue,
    isTemplate: f.isTemplate,
    templateName: f.templateName,
    roles: f.roles,
    speakers: f.speakers,
    wordOfDay: f.wordOfDay,
    tableTopicQuestions: f.tableTopicQuestions.filter((q) => q.text.trim()),
  }), []);

  const triggerAutoSave = useCallback((nextForm: FormState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await updateEvent.mutateAsync(buildPayload(nextForm));
        toast.success("Saved", { duration: 1500 });
      } catch {
        toast.error("Failed to save");
      } finally {
        setSaving(false);
      }
    }, 1500);
  }, [updateEvent, buildPayload]);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const handleSaveNow = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    try {
      await updateEvent.mutateAsync(buildPayload(form));
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Speaker helpers
  const addSpeaker = () => {
    if (form.speakers.length >= 3) return;
    update({ speakers: [...form.speakers, { name: "", speechTitle: "", speechProject: "", speechLevel: "", duration: 7, notes: "", evaluatorName: "" }] });
  };

  const removeSpeaker = (i: number) => {
    update({ speakers: form.speakers.filter((_, idx) => idx !== i) });
  };

  const updateSpeaker = (i: number, patch: Partial<SpeakerDTO>) => {
    const next = form.speakers.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    update({ speakers: next });
  };

  const moveSpeaker = (i: number, dir: -1 | 1) => {
    const arr = [...form.speakers];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update({ speakers: arr });
  };

  // Table topic helpers
  const addQuestion = () => {
    if (form.tableTopicQuestions.length >= 10) return;
    update({ tableTopicQuestions: [...form.tableTopicQuestions, { text: "", completed: false }] });
  };

  const removeQuestion = (i: number) => {
    update({ tableTopicQuestions: form.tableTopicQuestions.filter((_, idx) => idx !== i) });
  };

  const updateQuestion = (i: number, val: string) => {
    const next = form.tableTopicQuestions.map((q, idx) => idx === i ? { ...q, text: val } : q);
    update({ tableTopicQuestions: next });
  };

  const moveQuestion = (i: number, dir: -1 | 1) => {
    const arr = [...form.tableTopicQuestions];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update({ tableTopicQuestions: arr });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/events")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            {form.isTemplate ? "Template" : "Meeting"} #{form.meetingNumber || "—"}
          </p>
          <h1 className="text-sm font-semibold leading-tight truncate">
            {form.theme || form.title || "Untitled"}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>}
          <Button variant="outline" size="sm" onClick={handleSaveNow} disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/events/${event.id}/print`, "_blank")}
            className="gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Agenda</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/events/${event.id}/table-topics/print`, "_blank")}
            className="gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table Topics</span>
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full pb-12">

        {/* Section 1: Meeting Details */}
        <Section title="Meeting Details">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Meeting Number">
              <Input
                type="number"
                value={form.meetingNumber}
                onChange={(e) => update({ meetingNumber: e.target.value })}
                placeholder="40"
                className="h-8 text-sm"
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
                className="h-8 text-sm"
              />
            </Field>
            <Field label="Start Time">
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => update({ startTime: e.target.value })}
                className="h-8 text-sm"
              />
            </Field>
            <Field label="Theme of the Day" className="col-span-2 sm:col-span-3">
              <Input
                value={form.theme}
                onChange={(e) => update({ theme: e.target.value })}
                placeholder="Expectations vs Reality"
                className="h-8 text-sm"
              />
            </Field>
            <Field label="Venue (optional)" className="col-span-2 sm:col-span-2">
              <Input
                value={form.venue}
                onChange={(e) => update({ venue: e.target.value })}
                placeholder="e.g. Zoom / Room 101"
                className="h-8 text-sm"
              />
            </Field>
            <Field label="Title / Label (optional)">
              <Input
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Internal label"
                className="h-8 text-sm"
              />
            </Field>
          </div>

          <Separator className="my-3" />

          <div className="flex items-start gap-3">
            <input
              id="isTemplate"
              type="checkbox"
              checked={form.isTemplate}
              onChange={(e) => update({ isTemplate: e.target.checked })}
              className="mt-0.5 h-4 w-4 cursor-pointer"
            />
            <div className="flex-1">
              <Label htmlFor="isTemplate" className="text-sm font-medium cursor-pointer">
                Save as reusable template
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Templates appear in the Templates section and can be loaded when creating new events.
              </p>
              {form.isTemplate && (
                <Input
                  className="mt-2 h-8 text-sm max-w-xs"
                  value={form.templateName}
                  onChange={(e) => update({ templateName: e.target.value })}
                  placeholder="Template name (e.g. Standard Meeting)"
                />
              )}
            </div>
          </div>
        </Section>

        {/* Section 2: Role Assignments */}
        <Section title="Role Assignments">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AGENDA_ROLE_KEYS.map((key) => (
              <Field key={key} label={AGENDA_ROLE_LABELS[key]}>
                <MemberCombobox
                  value={form.roles[key] || ""}
                  onChange={(val) => update({ roles: { ...form.roles, [key]: val } })}
                  placeholder="Select member…"
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Section 3: Prepared Speakers */}
        <Section title="Prepared Speakers">
          <div className="space-y-4">
            {form.speakers.map((speaker, i) => (
              <div key={i} className="border rounded-lg p-3 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => moveSpeaker(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => moveSpeaker(i, 1)} disabled={i === form.speakers.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                  <span className="flex-1 text-sm font-medium">{speaker.name || "Speaker"}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeSpeaker(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Field label="Speaker" className="col-span-2 sm:col-span-2">
                    <MemberCombobox
                      value={speaker.name}
                      onChange={(val) => updateSpeaker(i, { name: val })}
                      placeholder="Select speaker…"
                    />
                  </Field>
                  <Field label="Duration (min)">
                    <Input
                      type="number"
                      value={speaker.duration}
                      onChange={(e) => updateSpeaker(i, { duration: Number(e.target.value) || 7 })}
                      min={1}
                      max={30}
                      className="h-8 text-sm"
                    />
                  </Field>
                  <Field label="Speech Title" className="col-span-2">
                    <Input
                      value={speaker.speechTitle}
                      onChange={(e) => updateSpeaker(i, { speechTitle: e.target.value })}
                      placeholder="e.g. The Three Things That Shaped Me"
                      className="h-8 text-sm"
                    />
                  </Field>
                  <Field label="Evaluator">
                    <MemberCombobox
                      value={speaker.evaluatorName}
                      onChange={(val) => updateSpeaker(i, { evaluatorName: val })}
                      placeholder="Select evaluator…"
                    />
                  </Field>
                  <Field label="Project / Path">
                    <Input
                      value={speaker.speechProject}
                      onChange={(e) => updateSpeaker(i, { speechProject: e.target.value })}
                      placeholder="e.g. Persuasive Influence"
                      className="h-8 text-sm"
                    />
                  </Field>
                  <Field label="Level">
                    <Input
                      value={speaker.speechLevel}
                      onChange={(e) => updateSpeaker(i, { speechLevel: e.target.value })}
                      placeholder="e.g. Level 1"
                      className="h-8 text-sm"
                    />
                  </Field>
                  <Field label="Notes (optional)">
                    <Input
                      value={speaker.notes}
                      onChange={(e) => updateSpeaker(i, { notes: e.target.value })}
                      placeholder="e.g. Using Presentation Software"
                      className="h-8 text-sm"
                    />
                  </Field>
                </div>
              </div>
            ))}

            {form.speakers.length < 3 && (
              <Button type="button" variant="outline" size="sm" onClick={addSpeaker} className="gap-2 w-full">
                <Plus className="h-4 w-4" />
                Add Speaker {form.speakers.length > 0 ? `(${form.speakers.length}/3)` : ""}
              </Button>
            )}
            {form.speakers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-1">No speakers yet. Add up to 3.</p>
            )}
          </div>
        </Section>

        {/* Section 4: Word of the Day */}
        <Section title="Word of the Day">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Word">
              <Input
                value={form.wordOfDay.word}
                onChange={(e) => update({ wordOfDay: { ...form.wordOfDay, word: e.target.value } })}
                placeholder="e.g. Connect"
                className="h-8 text-sm"
              />
            </Field>
            <Field label="Part of Speech">
              <Input
                value={form.wordOfDay.partOfSpeech}
                onChange={(e) => update({ wordOfDay: { ...form.wordOfDay, partOfSpeech: e.target.value } })}
                placeholder="e.g. Verb"
                className="h-8 text-sm"
              />
            </Field>
            <Field label="Meaning" className="col-span-2">
              <Textarea
                value={form.wordOfDay.meaning}
                onChange={(e) => update({ wordOfDay: { ...form.wordOfDay, meaning: e.target.value } })}
                placeholder="Definition of the word…"
                className="text-sm min-h-0 h-16 resize-none"
              />
            </Field>
            <Field label="Example Sentence" className="col-span-2">
              <Textarea
                value={form.wordOfDay.example}
                onChange={(e) => update({ wordOfDay: { ...form.wordOfDay, example: e.target.value } })}
                placeholder="The unexpected outcome turned out better than the original plan."
                className="text-sm min-h-0 h-16 resize-none"
              />
            </Field>
          </div>
        </Section>

        {/* Section 5: Table Topic Questions */}
        <Section title="Table Topic Questions">
          <div className="space-y-2">
            {form.tableTopicQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveQuestion(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => moveQuestion(i, 1)} disabled={i === form.tableTopicQuestions.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-xs font-medium text-muted-foreground w-5 shrink-0 text-right">{i + 1}.</span>
                <Input
                  value={q.text}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  placeholder={`Question ${i + 1}`}
                  className="h-8 text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeQuestion(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            {form.tableTopicQuestions.length < 10 && (
              <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-2 w-full mt-2">
                <Plus className="h-4 w-4" />
                Add Question {form.tableTopicQuestions.length > 0 ? `(${form.tableTopicQuestions.length}/10)` : ""}
              </Button>
            )}
            {form.tableTopicQuestions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-1">No questions yet. Add up to 10.</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

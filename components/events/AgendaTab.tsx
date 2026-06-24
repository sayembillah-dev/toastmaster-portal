"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MemberCombobox } from "./MemberCombobox";
import { AGENDA_ROLE_KEYS, AGENDA_ROLE_LABELS } from "@/lib/eventConstants";
import type { SpeakerDTO } from "@/lib/serializers";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";

type Props = { form: EventFormState; update: UpdateFormFn };

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

export function AgendaTab({ form, update }: Props) {
  const addSpeaker = () => {
    if (form.speakers.length >= 3) return;
    update({
      speakers: [
        ...form.speakers,
        { name: "", speechTitle: "", speechProject: "", speechLevel: "", duration: 7, notes: "", evaluatorName: "" },
      ],
    });
  };

  const removeSpeaker = (i: number) =>
    update({ speakers: form.speakers.filter((_, idx) => idx !== i) });

  const updateSpeaker = (i: number, patch: Partial<SpeakerDTO>) =>
    update({ speakers: form.speakers.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });

  const moveSpeaker = (i: number, dir: -1 | 1) => {
    const arr = [...form.speakers];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update({ speakers: arr });
  };

  return (
    <div className="space-y-4">
      {/* Meeting Details */}
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
          <Field label="Venue (optional)" className="col-span-2">
            <Input
              value={form.venue}
              onChange={(e) => update({ venue: e.target.value })}
              placeholder="e.g. Zoom / Room 101"
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Label (optional)">
            <Input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Internal label"
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Registration Link (optional)" className="col-span-2 sm:col-span-3">
            <Input
              value={form.joinUrl}
              onChange={(e) => update({ joinUrl: e.target.value })}
              placeholder="https://forms.gle/..."
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
              Templates can be loaded when creating future events.
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

      {/* Role Assignments */}
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

      {/* Prepared Speakers */}
      <Section title="Prepared Speakers">
        <div className="space-y-4">
          {form.speakers.map((speaker, i) => (
            <div key={`speaker-${i}`} className="border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex flex-col gap-0.5">
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

      {/* Word of the Day */}
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
    </div>
  );
}

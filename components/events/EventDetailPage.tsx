"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Printer, CheckCircle2, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateEvent } from "@/hooks/useEvents";
import { AgendaTab } from "./AgendaTab";
import { TableTopicsTab } from "./TableTopicsTab";
import { GuestListTab } from "./GuestListTab";
import { ResourcesTab } from "./ResourcesTab";
import { TimerReportTab } from "./TimerReportTab";
import { AhCounterTab } from "./AhCounterTab";
import { toast } from "sonner";
import { AGENDA_ROLE_KEYS } from "@/lib/eventConstants";
import { generateCaption } from "@/lib/generateCaption";
import type { EventDTO, TableTopicQuestionDTO } from "@/lib/serializers";
import type { EventFormState } from "./eventTabTypes";

function normalizeQuestion(q: unknown): TableTopicQuestionDTO {
  if (typeof q === "string") return { text: q, completed: false };
  const obj = q as Record<string, unknown>;
  return { text: String(obj?.text ?? ""), completed: Boolean(obj?.completed) };
}

type TabKey = "agenda" | "tableTopics" | "guestList" | "resources" | "timerReport" | "ahCounter";

const TABS: { key: TabKey; label: string }[] = [
  { key: "agenda", label: "Meeting Agenda" },
  { key: "tableTopics", label: "Table Topics" },
  { key: "guestList", label: "Guest List" },
  { key: "resources", label: "Resources" },
  { key: "timerReport", label: "Timer Report" },
  { key: "ahCounter", label: "Ah Counter" },
];

function initForm(event: EventDTO): EventFormState {
  const emptyRoles = Object.fromEntries(AGENDA_ROLE_KEYS.map((k) => [k, ""])) as Record<
    (typeof AGENDA_ROLE_KEYS)[number],
    string
  >;
  return {
    title: event.title ?? "",
    meetingNumber: String(event.meetingNumber ?? ""),
    date: event.date ? event.date.slice(0, 10) : "",
    startTime: event.startTime ?? "18:00",
    theme: event.theme ?? "",
    venue: event.venue ?? "",
    isTemplate: event.isTemplate ?? false,
    templateName: event.templateName ?? "",
    roles: { ...emptyRoles, ...event.roles },
    speakers: event.speakers ?? [],
    wordOfDay: event.wordOfDay ?? { word: "", partOfSpeech: "", meaning: "", example: "" },
    joinUrl: event.joinUrl ?? "",
    tableTopicQuestions: (event.tableTopicQuestions as unknown[]).map(normalizeQuestion),
    attendees: event.attendees ?? [],
    resources: event.resources ?? [],
    timerEntries: Array.isArray(event.timerEntries) ? event.timerEntries : [],
    fillerWords: event.fillerWords ?? ["Ah", "Um", "So", "Like"],
    ahCounterReport: event.ahCounterReport ?? [],
  };
}

function buildPayload(form: EventFormState) {
  return {
    title: form.title,
    meetingNumber: Number(form.meetingNumber) || 0,
    date: form.date || new Date().toISOString().slice(0, 10),
    startTime: form.startTime || "18:00",
    theme: form.theme,
    venue: form.venue,
    isTemplate: form.isTemplate,
    templateName: form.templateName,
    roles: form.roles,
    speakers: form.speakers,
    wordOfDay: form.wordOfDay,
    joinUrl: form.joinUrl,
    tableTopicQuestions: form.tableTopicQuestions.map(normalizeQuestion),
    attendees: form.attendees,
    resources: form.resources,
    timerEntries: form.timerEntries,
    fillerWords: form.fillerWords,
    ahCounterReport: form.ahCounterReport,
  };
}

type SaveState = "idle" | "saving" | "saved";

type Props = { event: EventDTO };

export function EventDetailPage({ event }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("agenda");
  const [form, setForm] = useState<EventFormState>(() => initForm(event));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef(form);
  formRef.current = form;

  const { mutateAsync: updateEvent } = useUpdateEvent(event.id);

  const doSave = useCallback(async () => {
    setSaveState("saving");
    try {
      await updateEvent(buildPayload(formRef.current));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("idle");
    }
  }, [updateEvent]);

  const update = useCallback(
    (patch: Partial<EventFormState>, immediate = false) => {
      setForm((prev) => {
        const next = { ...prev, ...patch };
        formRef.current = next;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!immediate) {
          debounceRef.current = setTimeout(() => doSave(), 1500);
        }
        return next;
      });
      if (immediate) doSave();
    },
    [doSave],
  );

  const handleManualSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSave();
  };

  const handleCopyCaption = async () => {
    const text = generateCaption(formRef.current);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied to clipboard!");
    } catch {
      toast.error("Could not copy automatically — please copy the text manually.");
    }
  };

  const heading =
    form.meetingNumber
      ? `Meeting #${form.meetingNumber}${form.theme ? ` — ${form.theme}` : ""}`
      : form.title || "Event";

  const printAgendaUrl = `/events/${event.id}/print`;
  const printTableTopicsUrl = `/events/${event.id}/table-topics/print`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push("/events")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{heading}</p>
          {saveState === "saving" && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </p>
          )}
          {saveState === "saved" && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Saved
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 hidden sm:flex"
            onClick={handleCopyCaption}
          >
            <Copy className="h-3.5 w-3.5" />
            Caption
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 hidden sm:flex"
            onClick={() => window.open(printAgendaUrl, "_blank")}
          >
            <Printer className="h-3.5 w-3.5" />
            Agenda
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 hidden sm:flex"
            onClick={() => window.open(printTableTopicsUrl, "_blank")}
          >
            <Printer className="h-3.5 w-3.5" />
            Table Topics
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={handleManualSave}
            disabled={saveState === "saving"}
          >
            {saveState === "saving" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
      </header>

      {/* Tab bar — sticky below header, right-fade hints at overflow */}
      <div className="sticky top-14 z-20 border-b bg-background">
        <div className="relative px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* Fade gradient to indicate horizontal scrollability */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-background to-transparent" />
        </div>
      </div>

      {/* Tab content */}
      <main className="flex-1 p-4 max-w-3xl w-full mx-auto">
        {tab === "agenda" && <AgendaTab form={form} update={update} />}
        {tab === "tableTopics" && <TableTopicsTab form={form} update={update} />}
        {tab === "guestList" && <GuestListTab form={form} update={update} />}
        {tab === "resources" && <ResourcesTab form={form} update={update} />}
        {tab === "timerReport" && <TimerReportTab form={form} update={update} />}
        {tab === "ahCounter" && <AhCounterTab form={form} update={update} />}
      </main>
    </div>
  );
}

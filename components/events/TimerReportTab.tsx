"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Square, Plus, RotateCcw, Timer, X, MoreHorizontal, Pencil, Trash2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMembers } from "@/hooks/useMembers";
import { useGuests } from "@/hooks/useGuests";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";
import type { TimerEntryDTO, TimerCategory, TimerStatus } from "@/lib/serializers";

// ─── Flag times (official Timer Sheet) ───────────────────────────────────────
//   Prepared speech  → Green 5:00 / Yellow 6:00 / Red 7:00
//   Ice Breaker      → Green 4:00 / Yellow 5:00 / Red 6:00
//   Table Topics     → Green 1:00 / Yellow 1:30 / Red 2:00
//   All Evaluations  → Green 2:00 / Yellow 2:30 / Red 3:00

function getFlagTimes(category: TimerCategory) {
  switch (category) {
    case "preparedSpeaker":   return { green: 300, yellow: 360, red: 420 };
    case "iceBreaker":        return { green: 240, yellow: 300, red: 360 };
    case "tableTopic":        return { green: 60,  yellow: 90,  red: 120 };
    default:                  return { green: 120, yellow: 150, red: 180 };
  }
}

// ─── Types / constants ────────────────────────────────────────────────────────

type FlagColor = "none" | "green" | "yellow" | "red";

const CATEGORY_LABELS: Record<TimerCategory, string> = {
  preparedSpeaker:     "Prepared Speaker",
  iceBreaker:          "Ice Breaker",
  tableTopic:          "Table Topic",
  preparedEvaluator:   "Speech Evaluator",
  tableTopicEvaluator: "TT Evaluator",
  generalEvaluator:    "General Evaluator",
};

const ALL_CATEGORIES: TimerCategory[] = [
  "preparedSpeaker", "iceBreaker", "tableTopic", "preparedEvaluator", "tableTopicEvaluator", "generalEvaluator",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Big clock always shows 00:00 (zero-padded minutes)
function fmtClock(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// Compact display for chips and table
function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function getFlag(elapsed: number, flags: ReturnType<typeof getFlagTimes>): FlagColor {
  if (elapsed >= flags.red)    return "red";
  if (elapsed >= flags.yellow) return "yellow";
  if (elapsed >= flags.green)  return "green";
  return "none";
}

function buildInitialEntries(form: EventFormState): TimerEntryDTO[] {
  const base = { elapsed: 0, status: "idle" as TimerStatus };
  const out: TimerEntryDTO[] = [];
  form.speakers.forEach((s, i) => {
    if (s.name)          out.push({ id: uid(), label: s.name,          category: "preparedSpeaker",   speakerIndex: i, ...base });
  });
  form.speakers.forEach((s, i) => {
    if (s.evaluatorName) out.push({ id: uid(), label: s.evaluatorName, category: "preparedEvaluator", speakerIndex: i, ...base });
  });
  if (form.roles.tableTopicEvaluator) out.push({ id: uid(), label: form.roles.tableTopicEvaluator, category: "tableTopicEvaluator", ...base });
  if (form.roles.generalEvaluator)    out.push({ id: uid(), label: form.roles.generalEvaluator,    category: "generalEvaluator",    ...base });
  return out;
}

// ─── Flag card (3-column grid in active panel) ────────────────────────────────

const FLAG_CARD_ACTIVE: Record<"green" | "yellow" | "red", string> = {
  green:  "bg-green-500  text-white",
  yellow: "bg-amber-400  text-black",
  red:    "bg-red-500    text-white",
};
const FLAG_CARD_INACTIVE: Record<"green" | "yellow" | "red", string> = {
  green:  "bg-green-50  border border-green-200  text-green-400  dark:bg-green-950/20 dark:border-green-800 dark:text-green-700",
  yellow: "bg-amber-50  border border-amber-200  text-amber-400  dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-700",
  red:    "bg-red-50    border border-red-200    text-red-400    dark:bg-red-950/20   dark:border-red-800   dark:text-red-700",
};

function FlagCard({ color, label, time, active }: { color: "green"|"yellow"|"red"; label: string; time: number; active: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl py-3 px-1 transition-all duration-500 ${
      active ? FLAG_CARD_ACTIVE[color] : FLAG_CARD_INACTIVE[color]
    }`}>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-0.5">{label}</span>
      <span className="font-mono text-lg font-extrabold tabular-nums leading-none">{fmt(time)}</span>
    </div>
  );
}

// ─── Active timer panel ───────────────────────────────────────────────────────

const PANEL_ACCENT: Record<FlagColor, string> = {
  none:   "bg-muted",
  green:  "bg-green-500",
  yellow: "bg-amber-400",
  red:    "bg-red-500",
};
const CLOCK_COLOR: Record<FlagColor, string> = {
  none:   "text-foreground",
  green:  "text-green-600  dark:text-green-400",
  yellow: "text-amber-600  dark:text-amber-400",
  red:    "text-red-600    dark:text-red-400",
};

interface ActivePanelProps {
  entry:     TimerEntryDTO;
  elapsed:   number;
  isRunning: boolean;
  onStart(): void;
  onPause(): void;
  onStop():  void;
  onReset(): void;
}

function ActivePanel({ entry, elapsed, isRunning, onStart, onPause, onStop, onReset }: ActivePanelProps) {
  const flags      = getFlagTimes(entry.category);
  const flag       = getFlag(elapsed, flags);
  const overtime   = elapsed > flags.red;
  const overSec    = elapsed - flags.red;

  return (
    <div className="overflow-hidden rounded-2xl border shadow-sm">
      {/* Color strip — full width accent bar */}
      <div className={`h-1.5 transition-colors duration-700 ${PANEL_ACCENT[flag]}`} />

      <div className="p-5">
        {/* Role pill + name */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {CATEGORY_LABELS[entry.category]}
            </span>
            <p className="mt-1.5 text-xl font-bold leading-snug truncate">{entry.label || "—"}</p>
          </div>
          {isRunning && (
            <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-green-500">
              <span className="animate-ping inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            </span>
          )}
        </div>

        {/* Big clock — centered */}
        <div className="my-2 text-center">
          <span className={`font-mono font-black tabular-nums leading-none tracking-tighter transition-colors duration-500
            text-[5rem] sm:text-[7rem]
            ${CLOCK_COLOR[flag]} ${overtime && isRunning ? "animate-pulse" : ""}`}>
            {fmtClock(elapsed)}
          </span>

          {/* Overtime badge */}
          {overtime && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
              <span className={`inline-block h-1.5 w-1.5 rounded-full bg-white ${isRunning ? "animate-ping" : ""}`} />
              OVERTIME +{fmt(overSec)}
            </div>
          )}
        </div>

        {/* Flag cards — 3-column grid */}
        <div className="mt-5 mb-5 grid grid-cols-3 gap-2">
          <FlagCard color="green"  label="Green"  time={flags.green}  active={elapsed >= flags.green} />
          <FlagCard color="yellow" label="Yellow" time={flags.yellow} active={elapsed >= flags.yellow} />
          <FlagCard color="red"    label="Red"    time={flags.red}    active={elapsed >= flags.red} />
        </div>

        {/* Controls — full-width primary, stop+reset row */}
        <div className="space-y-2">
          {isRunning ? (
            <Button variant="outline" size="lg" className="w-full h-12 gap-2 text-base" onClick={onPause}>
              <Pause className="h-5 w-5" /> Pause
            </Button>
          ) : (
            <Button size="lg" className="w-full h-12 gap-2 text-base" onClick={onStart}>
              <Play className="h-5 w-5" /> {elapsed > 0 ? "Resume" : "Start"}
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="flex-1 h-11 gap-2"
              onClick={onStop} disabled={elapsed === 0 && !isRunning}>
              <Square className="h-4 w-4" /> Stop
            </Button>
            <Button variant="ghost" size="lg" className="flex-1 h-11 gap-2 text-muted-foreground" onClick={onReset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Queue card ───────────────────────────────────────────────────────────────

const CARD_ACCENT: Record<FlagColor | "running", string> = {
  none:    "bg-muted-foreground/20",
  green:   "bg-green-500",
  yellow:  "bg-amber-400",
  red:     "bg-red-500",
  running: "bg-primary",
};

interface QueueCardProps {
  entry:      TimerEntryDTO;
  elapsed:    number;
  isSelected: boolean;
  isRunning:  boolean;
  onSelect(): void;
  onDelete(): void;
  onRename(label: string): void;
}

function QueueCard({ entry, elapsed, isSelected, isRunning, onSelect, onDelete, onRename }: QueueCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(entry.label);
  const inputRef              = useRef<HTMLInputElement>(null);

  const flags    = getFlagTimes(entry.category);
  const flag     = getFlag(elapsed, flags);
  const overtime = elapsed > flags.red;
  const accentKey: keyof typeof CARD_ACCENT = isRunning ? "running" : flag;

  const statusLabel =
    isRunning                    ? "Running"
    : entry.status === "paused"  ? "Paused"
    : entry.status === "stopped" ? "Done"
    : "";

  function startRename(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(entry.label);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const v = draft.trim();
    if (v && v !== entry.label) onRename(v);
    setEditing(false);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={editing ? undefined : onSelect}
      onKeyDown={(e) => !editing && e.key === "Enter" && onSelect()}
      className={`relative flex items-center gap-3 overflow-hidden rounded-xl border py-3 pr-2 pl-5 transition-all
        ${editing ? "cursor-default" : "cursor-pointer select-none active:scale-[0.99]"}
        ${isRunning ? "border-green-400 bg-green-50 dark:bg-green-950/20 shadow-sm" : isSelected ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border hover:bg-muted/40"}`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-500 ${CARD_ACCENT[accentKey]} ${isRunning ? "animate-pulse" : ""}`} />

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter")  { e.preventDefault(); commitEdit(); }
              if (e.key === "Escape") { setEditing(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-md border border-primary/50 bg-background px-2 py-0.5 text-sm font-semibold outline-none ring-2 ring-primary/20"
          />
        ) : (
          <p className="truncate text-sm font-semibold leading-snug">
            {entry.label || "—"}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">{CATEGORY_LABELS[entry.category]}</p>
      </div>

      {/* Elapsed + status */}
      <div className="shrink-0 text-right">
        {elapsed > 0 && (
          <p className={`font-mono text-sm font-bold tabular-nums ${overtime ? "text-red-500" : "text-foreground"}`}>
            {fmt(elapsed)}
          </p>
        )}
        {statusLabel && (
          <p className={`text-[10px] font-semibold ${isRunning ? "text-primary" : "text-muted-foreground"}`}>
            {statusLabel}
          </p>
        )}
      </div>

      {/* Three-dot menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem onClick={startRename}>
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Speaker name input (search + free-text unified) ─────────────────────────

interface SpeakerNameInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function SpeakerNameInput({ value, onChange, onSubmit, onCancel }: SpeakerNameInputProps) {
  const [open, setOpen]               = useState(false);
  const [dropStyle, setDropStyle]     = useState<React.CSSProperties>({});
  const inputRef                      = useRef<HTMLInputElement>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);
  const dropRef                       = useRef<HTMLDivElement>(null);

  const { data: members = [] } = useMembers();
  const { data: guests  = [] } = useGuests();

  const q              = value.trim().toLowerCase();
  const activeMembers  = members.filter((m) => m.status === "active");
  const filteredM      = q ? activeMembers.filter((m) => m.fullName.toLowerCase().includes(q)) : activeMembers.slice(0, 6);
  const filteredG      = q ? guests.filter((g) => g.fullName.toLowerCase().includes(q))        : guests.slice(0, 4);
  const hasResults     = filteredM.length > 0 || filteredG.length > 0;

  function reposition() {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setDropStyle({ position: "fixed", top: r.bottom + 4, left: r.left, width: Math.max(r.width, 220), zIndex: 9999 });
  }

  function openDrop() { reposition(); setOpen(true); }

  function pick(name: string) {
    onChange(name);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!containerRef.current?.contains(t) && !dropRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = () => reposition();
    window.addEventListener("scroll", fn, true);
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("scroll", fn, true); window.removeEventListener("resize", fn); };
  }, [open]);

  const dropdown = open && hasResults ? (
    <div ref={dropRef} style={dropStyle} className="bg-popover border rounded-md shadow-lg overflow-hidden">
      <div className="max-h-52 overflow-y-auto py-1">
        {filteredM.length > 0 && (
          <>
            <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Members</p>
            {filteredM.map((m) => (
              <button key={m.id} type="button"
                onMouseDown={(e) => { e.preventDefault(); pick(m.fullName); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors">
                <span className="flex-1 truncate font-medium">{m.fullName}</span>
                <span className="text-xs text-muted-foreground shrink-0">{m.clubRole}</span>
              </button>
            ))}
          </>
        )}
        {filteredG.length > 0 && (
          <>
            {filteredM.length > 0 && <div className="my-1 border-t" />}
            <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guests</p>
            {filteredG.map((g) => (
              <button key={g.id} type="button"
                onMouseDown={(e) => { e.preventDefault(); pick(g.fullName); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors">
                <span className="flex-1 truncate font-medium">{g.fullName}</span>
                <span className="text-xs text-muted-foreground shrink-0">Guest</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <input
        ref={inputRef}
        autoFocus
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); openDrop(); }}
        onFocus={openDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter")  { e.preventDefault(); setOpen(false); onSubmit(); }
          if (e.key === "Escape") { if (open) setOpen(false); else onCancel(); }
        }}
        placeholder="Search or type a name…"
        className="w-full h-9 px-3 text-sm border rounded-md bg-background outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
      />
      {typeof document !== "undefined" && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}

// ─── Category select ──────────────────────────────────────────────────────────

function CategorySelect({ value, onChange }: { value: TimerCategory; onChange: (v: TimerCategory) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 px-3 text-sm border rounded-md bg-background flex items-center justify-between gap-2 sm:w-44 w-full shrink-0 hover:bg-accent transition-colors outline-none cursor-pointer">
        <span className="truncate text-left flex-1">{CATEGORY_LABELS[value]}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom">
        {ALL_CATEGORIES.map((c) => (
          <DropdownMenuItem key={c} onClick={() => onChange(c)} className="gap-2">
            <Check className={`h-3.5 w-3.5 shrink-0 ${c === value ? "opacity-100 text-primary" : "opacity-0"}`} />
            {CATEGORY_LABELS[c]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Add entry form ───────────────────────────────────────────────────────────

interface AddFormProps {
  onAdd(label: string, category: TimerCategory): void;
  onCancel(): void;
}

function AddEntryForm({ onAdd, onCancel }: AddFormProps) {
  const [name, setName] = useState("");
  const [cat, setCat]   = useState<TimerCategory>("preparedSpeaker");

  const submit = () => { if (name.trim()) onAdd(name.trim(), cat); };

  return (
    <div className="rounded-xl border bg-card p-3 space-y-2">
      {/* Speech type + name + actions — stacks on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row gap-2">
        <CategorySelect value={cat} onChange={setCat} />

        <SpeakerNameInput
          value={name}
          onChange={setName}
          onSubmit={submit}
          onCancel={onCancel}
        />

        <div className="flex gap-2 shrink-0">
          <Button type="button" size="sm" className="h-9 flex-1 sm:flex-none px-4" onClick={submit} disabled={!name.trim()}>
            Add
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Timer summary table ──────────────────────────────────────────────────────

function TimerSummary({ entries, runningId, startedAt }: {
  entries:   TimerEntryDTO[];
  runningId: string | null;
  startedAt: number | null;
}) {
  const timed = entries.filter((e) => e.elapsed > 0 || (e.id === runningId && startedAt !== null));
  if (timed.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Session Report</h3>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="py-2.5 pl-4 pr-2 text-left text-xs font-semibold">Speaker</th>
              <th className="hidden py-2.5 px-2 text-left text-xs font-semibold sm:table-cell">Type</th>
              <th className="py-2.5 px-2 text-right text-xs font-semibold">Time</th>
              <th className="hidden py-2.5 pl-2 pr-4 text-right text-xs font-semibold sm:table-cell">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {timed.map((entry) => {
              const live = entry.id === runningId && startedAt !== null
                ? entry.elapsed + Math.floor((Date.now() - startedAt) / 1000)
                : entry.elapsed;
              const flags    = getFlagTimes(entry.category);
              const flag     = getFlag(live, flags);
              const overtime = live > flags.red;

              const resCls = overtime ? "text-red-500 font-semibold"
                : flag === "none"   ? "text-muted-foreground"
                : flag === "green"  ? "text-green-600"
                : flag === "yellow" ? "text-amber-600"
                : "text-red-600";

              return (
                <tr key={entry.id} className="hover:bg-muted/20">
                  <td className="py-2.5 pl-4 pr-2 font-medium">{entry.label}</td>
                  <td className="hidden py-2.5 px-2 text-xs text-muted-foreground sm:table-cell">{CATEGORY_LABELS[entry.category]}</td>
                  <td className={`py-2.5 px-2 text-right font-mono font-bold tabular-nums ${overtime ? "text-red-500" : ""}`}>
                    {fmt(live)}
                  </td>
                  <td className={`hidden py-2.5 pl-2 pr-4 text-right text-xs sm:table-cell ${resCls}`}>
                    {overtime ? `Over +${fmt(live - flags.red)}` : flag === "none" ? "Under time" : "On time"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</h3>
      {children}
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { form: EventFormState; update: UpdateFormFn };

export function TimerReportTab({ form, update }: Props) {
  const [entries, setEntries]       = useState<TimerEntryDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runningId, setRunningId]   = useState<string | null>(null);
  const [startedAt, setStartedAt]   = useState<number | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [, setTick]                 = useState(0);

  const entriesRef     = useRef<TimerEntryDTO[]>([]);
  const initializedRef = useRef(false);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const saved = form.timerEntries ?? [];
    const initial = saved.length > 0 ? saved : buildInitialEntries(form);
    entriesRef.current = initial;
    setEntries(initial);
    if (initial.length > 0) setSelectedId(initial[0].id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (runningId !== null && startedAt !== null) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [runningId, startedAt]);

  const live = (entry: TimerEntryDTO): number => {
    if (entry.id !== runningId || startedAt === null) return entry.elapsed;
    return entry.elapsed + Math.floor((Date.now() - startedAt) / 1000);
  };

  const persist = useCallback((next: TimerEntryDTO[], immediate: boolean) => {
    entriesRef.current = next;
    setEntries(next);
    update({ timerEntries: next }, immediate);
  }, [update]);

  const startTimer = useCallback(() => {
    if (selectedId === null) return;
    let current = entriesRef.current;
    if (runningId !== null && runningId !== selectedId && startedAt !== null) {
      const extra = Math.floor((Date.now() - startedAt) / 1000);
      current = current.map((e) =>
        e.id === runningId ? { ...e, elapsed: e.elapsed + extra, status: "paused" as TimerStatus } : e
      );
    }
    entriesRef.current = current;
    setEntries(current);
    setRunningId(selectedId);
    setStartedAt(Date.now());
  }, [selectedId, runningId, startedAt]);

  const pauseTimer = useCallback(() => {
    if (runningId === null || startedAt === null) return;
    const extra = Math.floor((Date.now() - startedAt) / 1000);
    const next = entriesRef.current.map((e) =>
      e.id === runningId ? { ...e, elapsed: e.elapsed + extra, status: "paused" as TimerStatus } : e
    );
    setRunningId(null); setStartedAt(null);
    persist(next, true);
  }, [runningId, startedAt, persist]);

  const stopTimer = useCallback(() => {
    if (runningId === null) return;
    const extra = startedAt !== null ? Math.floor((Date.now() - startedAt) / 1000) : 0;
    const next = entriesRef.current.map((e) =>
      e.id === runningId ? { ...e, elapsed: e.elapsed + extra, status: "stopped" as TimerStatus } : e
    );
    setRunningId(null); setStartedAt(null);
    persist(next, true);
  }, [runningId, startedAt, persist]);

  const resetEntry = useCallback((id: string) => {
    if (runningId === id) { setRunningId(null); setStartedAt(null); }
    persist(entriesRef.current.map((e) => e.id === id ? { ...e, elapsed: 0, status: "idle" as TimerStatus } : e), true);
  }, [runningId, persist]);

  const deleteEntry = useCallback((id: string) => {
    if (runningId === id) { setRunningId(null); setStartedAt(null); }
    const next = entriesRef.current.filter((e) => e.id !== id);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
    persist(next, true);
  }, [runningId, selectedId, persist]);

  const addEntry = useCallback((label: string, category: TimerCategory) => {
    const e: TimerEntryDTO = { id: uid(), label, category, elapsed: 0, status: "idle" };
    const next = [...entriesRef.current, e];
    persist(next, true);
    setSelectedId(e.id);
    setShowAdd(false);
  }, [persist]);

  const renameEntry = useCallback((id: string, label: string) => {
    persist(entriesRef.current.map((e) => e.id === id ? { ...e, label } : e), true);
  }, [persist]);

  const selectedEntry    = entries.find((e) => e.id === selectedId) ?? null;
  const isRunning        = runningId !== null && startedAt !== null;
  const preparedEntries  = entries.filter((e) => e.category === "preparedSpeaker" || e.category === "iceBreaker" || e.category === "preparedEvaluator");
  const ttEntries        = entries.filter((e) => e.category === "tableTopic"      || e.category === "tableTopicEvaluator");
  const geEntries        = entries.filter((e) => e.category === "generalEvaluator");

  return (
    <div className="space-y-5 pb-12">

      {/* Active panel */}
      {selectedEntry ? (
        <ActivePanel
          entry={selectedEntry}
          elapsed={live(selectedEntry)}
          isRunning={isRunning && selectedEntry.id === runningId}
          onStart={startTimer}
          onPause={pauseTimer}
          onStop={stopTimer}
          onReset={() => resetEntry(selectedEntry.id)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-14 text-center">
          <Timer className="h-10 w-10 text-muted-foreground/25" />
          <div>
            <p className="text-sm font-semibold text-muted-foreground">No speaker selected</p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">Tap a speaker below to select them</p>
          </div>
        </div>
      )}

      {/* Add speaker */}
      {showAdd ? (
        <AddEntryForm onAdd={addEntry} onCancel={() => setShowAdd(false)} />
      ) : (
        <Button type="button" variant="outline" className="w-full gap-2 h-10" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add Speaker
        </Button>
      )}

      {/* Prepared speeches & evaluations */}
      {preparedEntries.length > 0 && (
        <Section label="Prepared Speeches & Evaluations">
          {preparedEntries.map((e) => (
            <QueueCard key={e.id} entry={e} elapsed={live(e)}
              isSelected={e.id === selectedId} isRunning={isRunning && e.id === runningId}
              onSelect={() => setSelectedId(e.id)} onDelete={() => deleteEntry(e.id)}
              onRename={(l) => renameEntry(e.id, l)} />
          ))}
        </Section>
      )}

      {/* Table topics */}
      {ttEntries.length > 0 && (
        <Section label="Table Topics">
          {ttEntries.map((e) => (
            <QueueCard key={e.id} entry={e} elapsed={live(e)}
              isSelected={e.id === selectedId} isRunning={isRunning && e.id === runningId}
              onSelect={() => setSelectedId(e.id)} onDelete={() => deleteEntry(e.id)}
              onRename={(l) => renameEntry(e.id, l)} />
          ))}
        </Section>
      )}

      {/* General evaluation */}
      {geEntries.length > 0 && (
        <Section label="General Evaluation">
          {geEntries.map((e) => (
            <QueueCard key={e.id} entry={e} elapsed={live(e)}
              isSelected={e.id === selectedId} isRunning={isRunning && e.id === runningId}
              onSelect={() => setSelectedId(e.id)} onDelete={() => deleteEntry(e.id)}
              onRename={(l) => renameEntry(e.id, l)} />
          ))}
        </Section>
      )}

      {/* Session report */}
      <TimerSummary entries={entries} runningId={runningId} startedAt={startedAt} />
    </div>
  );
}

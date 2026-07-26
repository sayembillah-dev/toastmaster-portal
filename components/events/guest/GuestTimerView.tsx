"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Square, RotateCcw, Timer as TimerIcon } from "lucide-react";
import type { TimerEntryDTO, TimerCategory, TimerStatus } from "@/lib/serializers";
import type { GuestTimerRoleDTO } from "@/lib/guestRoleTypes";

const CATEGORY_LABELS: Record<TimerCategory, string> = {
  preparedSpeaker: "Prepared Speaker",
  iceBreaker: "Ice Breaker",
  tableTopic: "Table Topic",
  preparedEvaluator: "Speech Evaluator",
  tableTopicEvaluator: "TT Evaluator",
  generalEvaluator: "General Evaluator",
};

function getFlagTimes(category: TimerCategory) {
  switch (category) {
    case "preparedSpeaker": return { green: 300, yellow: 360, red: 420 };
    case "iceBreaker": return { green: 240, yellow: 300, red: 360 };
    case "tableTopic": return { green: 60, yellow: 90, red: 120 };
    default: return { green: 120, yellow: 150, red: 180 };
  }
}

type FlagColor = "none" | "green" | "yellow" | "red";

function getFlag(elapsed: number, flags: ReturnType<typeof getFlagTimes>): FlagColor {
  if (elapsed >= flags.red) return "red";
  if (elapsed >= flags.yellow) return "yellow";
  if (elapsed >= flags.green) return "green";
  return "none";
}

function fmtClock(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Merge a fresh server snapshot in without clobbering the entry actively ticking locally —
// its elapsed/status only becomes authoritative on the server once start/pause/stop persists it.
function mergeEntries(remote: TimerEntryDTO[], local: TimerEntryDTO[], runningId: string | null): TimerEntryDTO[] {
  const localById = new Map(local.map((e) => [e.id, e]));
  return remote.map((r) => {
    if (r.id !== runningId) return r;
    const l = localById.get(r.id);
    return l ? { ...r, elapsed: l.elapsed, status: l.status } : r;
  });
}

const CARD_ACCENT: Record<FlagColor | "running", string> = {
  none: "bg-[#7B6B5C]/20",
  green: "bg-green-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
  running: "bg-[#9E1D06]",
};

function QueueRow({ entry, elapsed, isSelected, isRunning, onSelect }: {
  entry: TimerEntryDTO; elapsed: number; isSelected: boolean; isRunning: boolean; onSelect(): void;
}) {
  const flags = getFlagTimes(entry.category);
  const flag = getFlag(elapsed, flags);
  const accentKey: keyof typeof CARD_ACCENT = isRunning ? "running" : flag;
  const statusLabel = isRunning ? "Running" : entry.status === "paused" ? "Paused" : entry.status === "stopped" ? "Done" : "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl border py-3 pr-4 pl-5 text-left transition-all
        ${isRunning ? "border-green-400 bg-green-50" : isSelected ? "border-[#9E1D06]/40 bg-[#9E1D06]/5" : "border-[#E7DAC6] bg-white hover:bg-[#FBF6EC]"}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${CARD_ACCENT[accentKey]} ${isRunning ? "animate-pulse" : ""}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-snug text-[#2A201A]">{entry.label || "—"}</p>
        <p className="mt-0.5 text-xs text-[#7B6B5C]">{CATEGORY_LABELS[entry.category]}</p>
      </div>
      <div className="shrink-0 text-right">
        {elapsed > 0 && <p className="font-mono text-sm font-bold tabular-nums text-[#2A201A]">{fmt(elapsed)}</p>}
        {statusLabel && <p className="text-[10px] font-semibold text-[#9E1D06]">{statusLabel}</p>}
      </div>
    </button>
  );
}

type Props = { token: string; data: GuestTimerRoleDTO };

export function GuestTimerView({ token, data }: Props) {
  const [entries, setEntries] = useState<TimerEntryDTO[]>(data.timerEntries);
  const [selectedId, setSelectedId] = useState<string | null>(data.timerEntries[0]?.id ?? null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [, setTick] = useState(0);

  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const runningRef = useRef(runningId);
  runningRef.current = runningId;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tick the active clock once a second while running
  useEffect(() => {
    if (runningId === null || startedAt === null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [runningId, startedAt]);

  const persist = useCallback((next: TimerEntryDTO[], immediate: boolean) => {
    entriesRef.current = next;
    setEntries(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const send = () => {
      fetch(`/api/public/guest-role/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timerEntries: entriesRef.current }),
      }).catch(() => {});
    };
    if (immediate) send();
    else debounceRef.current = setTimeout(send, 1500);
  }, [token]);

  // Poll for officer-side changes (new/removed/renamed agenda entries)
  useEffect(() => {
    const id = setInterval(() => {
      fetch(`/api/public/guest-role/${token}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((fresh: GuestTimerRoleDTO | null) => {
          if (!fresh) return;
          const merged = mergeEntries(fresh.timerEntries, entriesRef.current, runningRef.current);
          entriesRef.current = merged;
          setEntries(merged);
          setSelectedId((prev) => (prev && merged.some((e) => e.id === prev) ? prev : merged[0]?.id ?? null));
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [token]);

  const live = (entry: TimerEntryDTO): number => {
    if (entry.id !== runningId || startedAt === null) return entry.elapsed;
    return entry.elapsed + Math.floor((Date.now() - startedAt) / 1000);
  };

  const startTimer = useCallback(() => {
    if (selectedId === null) return;
    let current = entriesRef.current;
    if (runningId !== null && runningId !== selectedId && startedAt !== null) {
      const extra = Math.floor((Date.now() - startedAt) / 1000);
      current = current.map((e) => (e.id === runningId ? { ...e, elapsed: e.elapsed + extra, status: "paused" as TimerStatus } : e));
    }
    entriesRef.current = current;
    setEntries(current);
    setRunningId(selectedId);
    setStartedAt(Date.now());
  }, [selectedId, runningId, startedAt]);

  const pauseTimer = useCallback(() => {
    if (runningId === null || startedAt === null) return;
    const extra = Math.floor((Date.now() - startedAt) / 1000);
    const next = entriesRef.current.map((e) => (e.id === runningId ? { ...e, elapsed: e.elapsed + extra, status: "paused" as TimerStatus } : e));
    setRunningId(null); setStartedAt(null);
    persist(next, true);
  }, [runningId, startedAt, persist]);

  const stopTimer = useCallback(() => {
    if (runningId === null) return;
    const extra = startedAt !== null ? Math.floor((Date.now() - startedAt) / 1000) : 0;
    const next = entriesRef.current.map((e) => (e.id === runningId ? { ...e, elapsed: e.elapsed + extra, status: "stopped" as TimerStatus } : e));
    setRunningId(null); setStartedAt(null);
    persist(next, true);
  }, [runningId, startedAt, persist]);

  const resetEntry = useCallback((id: string) => {
    if (runningId === id) { setRunningId(null); setStartedAt(null); }
    persist(entriesRef.current.map((e) => (e.id === id ? { ...e, elapsed: 0, status: "idle" as TimerStatus } : e)), true);
  }, [runningId, persist]);

  const selectedEntry = entries.find((e) => e.id === selectedId) ?? null;
  const isRunning = runningId !== null && startedAt !== null;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#E7DAC6] py-14 text-center">
        <TimerIcon className="h-10 w-10 text-[#7B6B5C]/30" />
        <p className="text-sm font-semibold text-[#7B6B5C]">No speakers on the agenda yet</p>
        <p className="max-w-xs text-xs text-[#7B6B5C]/70">The organizer hasn&rsquo;t added any speakers or evaluators to time yet — check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedEntry && (() => {
        const elapsed = live(selectedEntry);
        const flags = getFlagTimes(selectedEntry.category);
        const flag = getFlag(elapsed, flags);
        const overtime = elapsed > flags.red;
        const running = isRunning && selectedEntry.id === runningId;
        return (
          <div className="overflow-hidden rounded-2xl border border-[#E7DAC6] bg-white shadow-sm">
            <div className={`h-1.5 ${flag === "none" ? "bg-[#7B6B5C]/20" : flag === "green" ? "bg-green-500" : flag === "yellow" ? "bg-amber-400" : "bg-red-500"}`} />
            <div className="p-5">
              <span className="inline-block rounded-full bg-[#F5EEE1] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#7B6B5C]">
                {CATEGORY_LABELS[selectedEntry.category]}
              </span>
              <p className="mt-1.5 text-xl font-bold leading-snug text-[#2A201A]">{selectedEntry.label || "—"}</p>

              <div className="my-4 text-center">
                <span className={`font-mono text-[5rem] font-black leading-none tracking-tighter tabular-nums sm:text-[6rem] ${
                  flag === "none" ? "text-[#2A201A]" : flag === "green" ? "text-green-600" : flag === "yellow" ? "text-amber-600" : "text-red-600"
                } ${overtime && running ? "animate-pulse" : ""}`}>
                  {fmtClock(elapsed)}
                </span>
                {overtime && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                    OVERTIME +{fmt(elapsed - flags.red)}
                  </div>
                )}
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2">
                {(["green", "yellow", "red"] as const).map((c) => (
                  <div key={c} className={`flex flex-col items-center justify-center rounded-xl py-3 ${
                    elapsed >= flags[c]
                      ? c === "green" ? "bg-green-500 text-white" : c === "yellow" ? "bg-amber-400 text-black" : "bg-red-500 text-white"
                      : "border border-[#E7DAC6] bg-[#FBF6EC] text-[#7B6B5C]/60"
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-75">{c}</span>
                    <span className="font-mono text-lg font-extrabold tabular-nums">{fmt(flags[c])}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {running ? (
                  <button type="button" onClick={pauseTimer} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#E7DAC6] text-base font-medium text-[#2A201A] hover:bg-[#FBF6EC]">
                    <Pause className="h-5 w-5" /> Pause
                  </button>
                ) : (
                  <button type="button" onClick={startTimer} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#9E1D06] text-base font-medium text-white hover:bg-[#83180a]">
                    <Play className="h-5 w-5" /> {elapsed > 0 ? "Resume" : "Start"}
                  </button>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={stopTimer} disabled={elapsed === 0 && !running}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#E7DAC6] font-medium text-[#2A201A] hover:bg-[#FBF6EC] disabled:opacity-40">
                    <Square className="h-4 w-4" /> Stop
                  </button>
                  <button type="button" onClick={() => resetEntry(selectedEntry.id)}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-[#7B6B5C] hover:bg-[#FBF6EC]">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#7B6B5C]">On the Agenda</h3>
        {entries.map((e) => (
          <QueueRow key={e.id} entry={e} elapsed={live(e)} isSelected={e.id === selectedId} isRunning={isRunning && e.id === runningId}
            onSelect={() => setSelectedId(e.id)} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Ear } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AhCounterEntryDTO } from "@/lib/serializers";
import type { GuestAhCounterRoleDTO } from "@/lib/guestRoleTypes";

function AccordionEntry({ entry, fillerWords, open, onToggle, onAdjust }: {
  entry: AhCounterEntryDTO; fillerWords: string[]; open: boolean; onToggle(): void; onAdjust(word: string, delta: number): void;
}) {
  const total = entry.counts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-[#E7DAC6] bg-white">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#FBF6EC]">
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#7B6B5C] transition-transform duration-200", open && "rotate-180")} />
        <span className="flex-1 truncate text-sm font-semibold text-[#2A201A]">{entry.name || "—"}</span>
        {total > 0 && <span className="shrink-0 text-xs font-bold tabular-nums text-[#7B6B5C]">{total} total</span>}
      </button>

      <div className={cn("grid transition-all duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="border-t border-[#E7DAC6]">
            <div className={cn("grid divide-x divide-y divide-[#E7DAC6]", fillerWords.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
              {fillerWords.map((word) => {
                const count = entry.counts.find((c) => c.word === word)?.count ?? 0;
                return (
                  <div key={word} className="flex flex-col items-center gap-1 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#7B6B5C]">{word}</span>
                    <span className="py-1 text-4xl font-black leading-none tabular-nums text-[#2A201A]">{count}</span>
                    <div className="mt-1 flex gap-2">
                      <button type="button" onClick={() => onAdjust(word, -1)} disabled={count === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7DAC6] text-lg font-bold text-[#7B6B5C] hover:bg-[#FBF6EC] disabled:opacity-30">
                        −
                      </button>
                      <button type="button" onClick={() => onAdjust(word, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9E1D06] text-lg font-bold text-white hover:bg-[#83180a]">
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = { token: string; data: GuestAhCounterRoleDTO };

export function GuestAhCounterView({ token, data }: Props) {
  const [report, setReport] = useState<AhCounterEntryDTO[]>(data.ahCounterReport);
  const [fillerWords, setFillerWords] = useState<string[]>(data.fillerWords);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(data.ahCounterReport.map((e) => e.timerId)));

  const reportRef = useRef(report);
  reportRef.current = report;

  const send = useCallback((next: AhCounterEntryDTO[]) => {
    reportRef.current = next;
    setReport(next);
    fetch(`/api/public/guest-role/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ahCounterReport: next }),
    }).catch(() => {});
  }, [token]);

  function adjustCount(timerId: string, word: string, delta: number) {
    const next = reportRef.current.map((entry) => {
      if (entry.timerId !== timerId) return entry;
      const existing = entry.counts.find((c) => c.word === word);
      const newCount = Math.max(0, (existing?.count ?? 0) + delta);
      const counts = existing
        ? entry.counts.map((c) => (c.word === word ? { ...c, count: newCount } : c))
        : [...entry.counts, { word, count: newCount }];
      return { ...entry, counts };
    });
    send(next);
  }

  function toggleEntry(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Poll for officer-side changes (new/removed speakers, filler word list edits)
  useEffect(() => {
    const id = setInterval(() => {
      fetch(`/api/public/guest-role/${token}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((fresh: GuestAhCounterRoleDTO | null) => {
          if (!fresh) return;
          reportRef.current = fresh.ahCounterReport;
          setReport(fresh.ahCounterReport);
          setFillerWords(fresh.fillerWords);
          setOpenIds((prev) => {
            const next = new Set(prev);
            fresh.ahCounterReport.forEach((e) => { if (!prev.has(e.timerId)) next.add(e.timerId); });
            return next;
          });
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [token]);

  if (report.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#E7DAC6] py-14 text-center">
        <Ear className="h-10 w-10 text-[#7B6B5C]/30" />
        <p className="text-sm font-semibold text-[#7B6B5C]">No speakers on the agenda yet</p>
        <p className="max-w-xs text-xs text-[#7B6B5C]/70">The organizer hasn&rsquo;t added any speakers or evaluators to count for yet — check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {report.map((entry) => (
        <AccordionEntry
          key={entry.timerId}
          entry={entry}
          fillerWords={fillerWords}
          open={openIds.has(entry.timerId)}
          onToggle={() => toggleEntry(entry.timerId)}
          onAdjust={(word, delta) => adjustCount(entry.timerId, word, delta)}
        />
      ))}
    </div>
  );
}

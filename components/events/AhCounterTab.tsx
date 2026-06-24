"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";
import type { AhCounterEntryDTO } from "@/lib/serializers";

const DEFAULT_FILLER_WORDS = ["Ah", "Um", "So", "Like"];

type Props = { form: EventFormState; update: UpdateFormFn };

export function AhCounterTab({ form, update }: Props) {
  const [addingWord, setAddingWord] = useState(false);
  const [newWord, setNewWord] = useState("");

  const fillerWords = form.fillerWords.length > 0 ? form.fillerWords : DEFAULT_FILLER_WORDS;
  const report = form.ahCounterReport;

  // Auto-add timer entry persons not yet in report
  const timerIdsKey = form.timerEntries.map((t) => t.id).join(",");
  const prevIdsRef = useRef<string>("");
  useEffect(() => {
    if (prevIdsRef.current === timerIdsKey) return;
    prevIdsRef.current = timerIdsKey;

    const existingIds = new Set(form.ahCounterReport.map((e) => e.timerId));
    const missing = form.timerEntries.filter((t) => !existingIds.has(t.id));
    if (missing.length === 0) return;

    const words = form.fillerWords.length > 0 ? form.fillerWords : DEFAULT_FILLER_WORDS;
    const newEntries: AhCounterEntryDTO[] = missing.map((t) => ({
      timerId: t.id,
      name: t.label,
      counts: words.map((w) => ({ word: w, count: 0 })),
    }));
    update({ ahCounterReport: [...form.ahCounterReport, ...newEntries] }, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerIdsKey]);

  const getCount = (entry: AhCounterEntryDTO, word: string) =>
    entry.counts.find((c) => c.word === word)?.count ?? 0;

  const adjustCount = (timerId: string, word: string, delta: number) => {
    const next = report.map((entry) => {
      if (entry.timerId !== timerId) return entry;
      const existing = entry.counts.find((c) => c.word === word);
      const newCount = Math.max(0, (existing?.count ?? 0) + delta);
      const counts = existing
        ? entry.counts.map((c) => (c.word === word ? { ...c, count: newCount } : c))
        : [...entry.counts, { word, count: newCount }];
      return { ...entry, counts };
    });
    update({ ahCounterReport: next }, true);
  };

  const addWord = () => {
    const w = newWord.trim();
    if (!w || fillerWords.map((f) => f.toLowerCase()).includes(w.toLowerCase())) {
      setNewWord("");
      setAddingWord(false);
      return;
    }
    const nextWords = [...fillerWords, w];
    const nextReport = report.map((entry) => ({
      ...entry,
      counts: [...entry.counts, { word: w, count: 0 }],
    }));
    update({ fillerWords: nextWords, ahCounterReport: nextReport }, true);
    setNewWord("");
    setAddingWord(false);
  };

  const removeWord = (word: string) => {
    const nextWords = fillerWords.filter((w) => w !== word);
    const nextReport = report.map((entry) => ({
      ...entry,
      counts: entry.counts.filter((c) => c.word !== word),
    }));
    update({ fillerWords: nextWords, ahCounterReport: nextReport }, true);
  };

  const totalFor = (entry: AhCounterEntryDTO) =>
    entry.counts.reduce((sum, c) => sum + c.count, 0);

  if (form.timerEntries.length === 0 && report.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-14 text-center">
        <p className="text-sm font-semibold text-muted-foreground">No speakers yet</p>
        <p className="text-xs text-muted-foreground/60">
          Add speakers in the Timer Report tab — they will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Filler words */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Filler Words</h3>
        <div className="flex flex-wrap gap-2 items-center">
          {fillerWords.map((word) => (
            <span
              key={word}
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-sm font-medium"
            >
              {word}
              <button
                type="button"
                onClick={() => removeWord(word)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${word}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {addingWord ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addWord();
                  if (e.key === "Escape") { setAddingWord(false); setNewWord(""); }
                }}
                placeholder="Word…"
                className="h-8 w-28 text-sm"
              />
              <Button type="button" size="sm" className="h-8 text-xs" onClick={addWord} disabled={!newWord.trim()}>
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => { setAddingWord(false); setNewWord(""); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : fillerWords.length < 20 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs rounded-full"
              onClick={() => setAddingWord(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add word
            </Button>
          ) : null}
        </div>
      </section>

      {/* Per-person cards */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Counts</h3>
        {report.map((entry) => {
          const total = totalFor(entry);
          return (
            <div key={entry.timerId} className="overflow-hidden rounded-xl border bg-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                <p className="text-sm font-semibold">{entry.name || "—"}</p>
                {total > 0 && (
                  <span className="text-xs font-bold text-muted-foreground">{total} total</span>
                )}
              </div>

              {/* Filler word grid */}
              <div className={`grid divide-x divide-y ${fillerWords.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
                {fillerWords.map((word) => {
                  const count = getCount(entry, word);
                  return (
                    <div key={word} className="flex flex-col items-center gap-1 p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        {word}
                      </span>
                      <span className="text-4xl font-black tabular-nums leading-none py-1">{count}</span>
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => adjustCount(entry.timerId, word, -1)}
                          disabled={count === 0}
                          className="flex h-9 w-9 items-center justify-center rounded-full border text-lg font-bold text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                          aria-label={`Decrease ${word}`}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustCount(entry.timerId, word, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90 transition-colors"
                          aria-label={`Increase ${word}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Summary table — only when there's data */}
      {report.some((e) => totalFor(e) > 0) && (
        <section className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Summary</h3>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="py-2.5 pl-4 pr-2 text-left text-xs font-semibold">Speaker</th>
                  {fillerWords.map((w) => (
                    <th key={w} className="py-2.5 px-2 text-center text-xs font-semibold">{w}</th>
                  ))}
                  <th className="py-2.5 pl-2 pr-4 text-right text-xs font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.map((entry) => {
                  const total = totalFor(entry);
                  return (
                    <tr key={entry.timerId} className="hover:bg-muted/20">
                      <td className="py-2.5 pl-4 pr-2 font-medium">{entry.name}</td>
                      {fillerWords.map((w) => {
                        const n = getCount(entry, w);
                        return (
                          <td key={w} className="py-2.5 px-2 text-center font-mono tabular-nums">
                            {n > 0 ? n : <span className="text-muted-foreground/40">—</span>}
                          </td>
                        );
                      })}
                      <td className="py-2.5 pl-2 pr-4 text-right font-bold">
                        {total > 0 ? total : <span className="text-muted-foreground/40">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

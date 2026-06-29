"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMembers } from "@/hooks/useMembers";
import { useGuests } from "@/hooks/useGuests";
import { cn } from "@/lib/utils";
import type { EventFormState, UpdateFormFn } from "./eventTabTypes";
import type { AhCounterEntryDTO } from "@/lib/serializers";

const DEFAULT_FILLER_WORDS = ["Ah", "Um", "So", "Like"];

function uid() {
  return `manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Speaker name input (search + free-text) ─────────────────────────────────

interface SpeakerNameInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function SpeakerNameInput({ value, onChange, onSubmit, onCancel }: SpeakerNameInputProps) {
  const [open, setOpen]           = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const inputRef                  = useRef<HTMLInputElement>(null);
  const containerRef              = useRef<HTMLDivElement>(null);
  const dropRef                   = useRef<HTMLDivElement>(null);

  const { data: members = [] } = useMembers();
  const { data: guests  = [] } = useGuests();

  const q             = value.trim().toLowerCase();
  const activeMembers = members.filter((m) => m.status === "active");
  const filteredM     = q ? activeMembers.filter((m) => m.fullName.toLowerCase().includes(q)) : activeMembers.slice(0, 6);
  const filteredG     = q ? guests.filter((g) => g.fullName.toLowerCase().includes(q))        : guests.slice(0, 4);
  const hasResults    = filteredM.length > 0 || filteredG.length > 0;

  function reposition() {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setDropStyle({ position: "fixed", top: r.bottom + 4, left: r.left, width: Math.max(r.width, 220), zIndex: 9999 });
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

  function pick(name: string) {
    onChange(name);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

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
        onChange={(e) => { onChange(e.target.value); reposition(); setOpen(true); }}
        onFocus={() => { reposition(); setOpen(true); }}
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

// ─── Accordion entry ──────────────────────────────────────────────────────────

interface AccordionEntryProps {
  entry:       AhCounterEntryDTO;
  fillerWords: string[];
  open:        boolean;
  onToggle():  void;
  onAdjust(word: string, delta: number): void;
  onDelete():  void;
}

function AccordionEntry({ entry, fillerWords, open, onToggle, onAdjust, onDelete }: AccordionEntryProps) {
  const total = entry.counts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
      >
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        <span className="flex-1 text-sm font-semibold truncate">{entry.name || "—"}</span>
        {total > 0 && (
          <span className="text-xs font-bold tabular-nums text-muted-foreground shrink-0">{total} total</span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Remove speaker"
          className="ml-1 shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </button>

      {/* Body — animated accordion */}
      <div className={cn("grid transition-all duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="border-t">
            <div className={cn(
              "grid divide-x divide-y border-border",
              fillerWords.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
            )}>
              {fillerWords.map((word) => {
                const count = entry.counts.find((c) => c.word === word)?.count ?? 0;
                return (
                  <div key={word} className="flex flex-col items-center gap-1 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{word}</span>
                    <span className="text-4xl font-black tabular-nums leading-none py-1">{count}</span>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => onAdjust(word, -1)}
                        disabled={count === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-full border text-lg font-bold text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                        aria-label={`Decrease ${word}`}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjust(word, 1)}
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
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { form: EventFormState; update: UpdateFormFn };

export function AhCounterTab({ form, update }: Props) {
  const [addingWord,  setAddingWord]  = useState(false);
  const [newWord,     setNewWord]     = useState("");
  const [showAdd,     setShowAdd]     = useState(false);
  const [newName,     setNewName]     = useState("");
  // Track which accordion entries are open (by timerId); default all open
  const [openIds,     setOpenIds]     = useState<Set<string>>(new Set());

  const fillerWords = form.fillerWords.length > 0 ? form.fillerWords : DEFAULT_FILLER_WORDS;
  const report      = form.ahCounterReport;

  // Auto-add timer entry persons not yet in report
  const timerIdsKey   = form.timerEntries.map((t) => t.id).join(",");
  const prevIdsRef    = useRef<string>("");
  const initialised   = useRef(false);

  useEffect(() => {
    const existingIds = new Set(form.ahCounterReport.map((e) => e.timerId));
    const missing     = form.timerEntries.filter((t) => !existingIds.has(t.id));

    // On first mount, open all existing + incoming entries
    if (!initialised.current) {
      initialised.current = true;
      const allIds = new Set([
        ...form.ahCounterReport.map((e) => e.timerId),
        ...missing.map((t) => t.id),
      ]);
      setOpenIds(allIds);
    }

    if (prevIdsRef.current === timerIdsKey) return;
    prevIdsRef.current = timerIdsKey;
    if (missing.length === 0) return;

    const words      = form.fillerWords.length > 0 ? form.fillerWords : DEFAULT_FILLER_WORDS;
    const newEntries = missing.map((t): AhCounterEntryDTO => ({
      timerId: t.id,
      name:    t.label,
      counts:  words.map((w) => ({ word: w, count: 0 })),
    }));
    // Open newly auto-added entries
    setOpenIds((prev) => { const next = new Set(prev); missing.forEach((t) => next.add(t.id)); return next; });
    update({ ahCounterReport: [...form.ahCounterReport, ...newEntries] }, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerIdsKey]);

  function toggleEntry(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function adjustCount(timerId: string, word: string, delta: number) {
    const next = report.map((entry) => {
      if (entry.timerId !== timerId) return entry;
      const existing = entry.counts.find((c) => c.word === word);
      const newCount  = Math.max(0, (existing?.count ?? 0) + delta);
      const counts    = existing
        ? entry.counts.map((c) => (c.word === word ? { ...c, count: newCount } : c))
        : [...entry.counts, { word, count: newCount }];
      return { ...entry, counts };
    });
    update({ ahCounterReport: next }, true);
  }

  function deleteSpeaker(timerId: string) {
    update({ ahCounterReport: report.filter((e) => e.timerId !== timerId) }, true);
    setOpenIds((prev) => { const next = new Set(prev); next.delete(timerId); return next; });
  }

  function addSpeakerManually() {
    const name = newName.trim();
    if (!name) return;
    const id         = uid();
    const newEntry: AhCounterEntryDTO = {
      timerId: id,
      name,
      counts:  fillerWords.map((w) => ({ word: w, count: 0 })),
    };
    setOpenIds((prev) => new Set(prev).add(id));
    update({ ahCounterReport: [...report, newEntry] }, true);
    setNewName("");
    setShowAdd(false);
  }

  function addWord() {
    const w = newWord.trim();
    if (!w || fillerWords.map((f) => f.toLowerCase()).includes(w.toLowerCase())) {
      setNewWord(""); setAddingWord(false); return;
    }
    const nextWords  = [...fillerWords, w];
    const nextReport = report.map((entry) => ({
      ...entry,
      counts: [...entry.counts, { word: w, count: 0 }],
    }));
    update({ fillerWords: nextWords, ahCounterReport: nextReport }, true);
    setNewWord(""); setAddingWord(false);
  }

  function removeWord(word: string) {
    const nextWords  = fillerWords.filter((w) => w !== word);
    const nextReport = report.map((entry) => ({
      ...entry,
      counts: entry.counts.filter((c) => c.word !== word),
    }));
    update({ fillerWords: nextWords, ahCounterReport: nextReport }, true);
  }

  const totalFor = (entry: AhCounterEntryDTO) => entry.counts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6 pb-12">

      {/* Filler words */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Filler Words</h3>
        <div className="flex flex-wrap gap-2 items-center">
          {fillerWords.map((word) => (
            <span key={word} className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-sm font-medium">
              {word}
              <button type="button" onClick={() => removeWord(word)}
                className="text-muted-foreground hover:text-destructive transition-colors" aria-label={`Remove ${word}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {addingWord ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")  addWord();
                  if (e.key === "Escape") { setAddingWord(false); setNewWord(""); }
                }}
                placeholder="Word…" className="h-8 w-28 text-sm"
              />
              <Button type="button" size="sm" className="h-8 text-xs" onClick={addWord} disabled={!newWord.trim()}>Add</Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setAddingWord(false); setNewWord(""); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : fillerWords.length < 20 ? (
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-full" onClick={() => setAddingWord(true)}>
              <Plus className="h-3.5 w-3.5" /> Add word
            </Button>
          ) : null}
        </div>
      </section>

      {/* Counts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Counts</h3>
          {!showAdd && (
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Speaker
            </Button>
          )}
        </div>

        {/* Add speaker form */}
        {showAdd && (
          <div className="rounded-xl border bg-card p-3">
            <div className="flex gap-2">
              <SpeakerNameInput
                value={newName}
                onChange={setNewName}
                onSubmit={addSpeakerManually}
                onCancel={() => { setShowAdd(false); setNewName(""); }}
              />
              <Button type="button" size="sm" className="h-9 shrink-0 px-4" onClick={addSpeakerManually} disabled={!newName.trim()}>
                Add
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0"
                onClick={() => { setShowAdd(false); setNewName(""); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {report.length === 0 && !showAdd ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 text-center">
            <p className="text-sm font-semibold text-muted-foreground">No speakers yet</p>
            <p className="text-xs text-muted-foreground/60 max-w-xs">
              Speakers from the Timer tab appear here automatically, or add one manually above.
            </p>
          </div>
        ) : (
          report.map((entry) => (
            <AccordionEntry
              key={entry.timerId}
              entry={entry}
              fillerWords={fillerWords}
              open={openIds.has(entry.timerId)}
              onToggle={() => toggleEntry(entry.timerId)}
              onAdjust={(word, delta) => adjustCount(entry.timerId, word, delta)}
              onDelete={() => deleteSpeaker(entry.timerId)}
            />
          ))
        )}
      </section>

      {/* Summary table */}
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
                        const n = entry.counts.find((c) => c.word === w)?.count ?? 0;
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

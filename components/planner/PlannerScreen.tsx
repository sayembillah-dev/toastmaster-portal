"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePlanner, useCreatePlannerRow, useUpdatePlannerRow, useDeletePlannerRow } from "@/hooks/usePlanner";
import { MemberCombobox } from "@/components/events/MemberCombobox";
import { toast } from "sonner";
import type { PlannerRowDTO } from "@/lib/serializers";
import type { PlannerRowUpdateInput } from "@/lib/validation";

const ROLE_COLUMNS = [
  { key: "tmod" as const, label: "TMOD" },
  { key: "ttm" as const, label: "TTM" },
  { key: "tableTopicEvaluator" as const, label: "TT Evaluator" },
  { key: "preparedSpeaker1" as const, label: "Speaker 1" },
  { key: "preparedEvaluator1" as const, label: "Evaluator 1" },
  { key: "preparedSpeaker2" as const, label: "Speaker 2" },
  { key: "preparedEvaluator2" as const, label: "Evaluator 2" },
  { key: "preparedSpeaker3" as const, label: "Speaker 3" },
  { key: "preparedEvaluator3" as const, label: "Evaluator 3" },
  { key: "generalEvaluator" as const, label: "General Eval." },
  { key: "timer" as const, label: "Timer" },
  { key: "ahCounter" as const, label: "Ah Counter" },
  { key: "grammarian" as const, label: "Grammarian" },
];

type RoleKey = typeof ROLE_COLUMNS[number]["key"];
type RowStatus = "past" | "next" | "upcoming";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoToDateInput(iso: string) {
  return iso.slice(0, 10);
}

function dateInputToIso(val: string) {
  // val is YYYY-MM-DD; send as-is, API converts to Date
  return val;
}

function PlannerRow({ row, status }: { row: PlannerRowDTO; status: RowStatus }) {
  const [roles, setRoles] = useState<Record<RoleKey, string>>({
    tmod: row.tmod,
    ttm: row.ttm,
    tableTopicEvaluator: row.tableTopicEvaluator,
    preparedSpeaker1: row.preparedSpeaker1,
    preparedEvaluator1: row.preparedEvaluator1,
    preparedSpeaker2: row.preparedSpeaker2,
    preparedEvaluator2: row.preparedEvaluator2,
    preparedSpeaker3: row.preparedSpeaker3,
    preparedEvaluator3: row.preparedEvaluator3,
    generalEvaluator: row.generalEvaluator,
    timer: row.timer,
    ahCounter: row.ahCounter,
    grammarian: row.grammarian,
  });

  const themeRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLInputElement>(null);

  const update = useUpdatePlannerRow(row.id);
  const deleteRow = useDeletePlannerRow();

  function patch(data: PlannerRowUpdateInput) {
    update.mutate(data, { onError: (err) => toast.error(err.message) });
  }

  function handleRoleChange(key: RoleKey, value: string) {
    setRoles((prev) => ({ ...prev, [key]: value }));
    patch({ [key]: value });
  }

  function handleDateBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val) patch({ date: dateInputToIso(val) });
  }

  function handleThemeBlur() {
    const val = themeRef.current?.value ?? "";
    if (val !== row.theme) patch({ theme: val });
  }

  function handleNotesBlur() {
    const val = notesRef.current?.value ?? "";
    if (val !== row.notes) patch({ notes: val });
  }

  const isPast = status === "past";
  const isNext = status === "next";

  return (
    <tr
      className={cn(
        "border-b group transition-colors",
        isPast && "opacity-50",
        isNext && "bg-amber-50/60 dark:bg-amber-950/20",
        !isPast && !isNext && "hover:bg-muted/20",
      )}
    >
      {/* Date */}
      <td className="px-2 py-1.5 sticky left-0 bg-inherit z-10 border-r">
        <div className="flex items-center gap-1.5">
          {isNext && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          )}
          <input
            type="date"
            defaultValue={isoToDateInput(row.date)}
            onBlur={handleDateBlur}
            className={cn(
              "w-[130px] h-8 px-2 text-sm border rounded-md bg-background outline-none focus:ring-1 focus:ring-ring",
              isNext && "border-amber-400 font-medium",
              isPast && "text-muted-foreground",
            )}
          />
        </div>
      </td>

      {/* Role columns */}
      {ROLE_COLUMNS.map(({ key }) => (
        <td key={key} className="px-2 py-1.5">
          <MemberCombobox
            value={roles[key]}
            onChange={(v) => handleRoleChange(key, v)}
            placeholder="—"
            className="w-[150px]"
          />
        </td>
      ))}

      {/* Theme */}
      <td className="px-2 py-1.5">
        <input
          ref={themeRef}
          type="text"
          defaultValue={row.theme}
          onBlur={handleThemeBlur}
          placeholder="Theme…"
          maxLength={200}
          className="w-[140px] h-8 px-2 text-sm border rounded-md bg-background outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </td>

      {/* Notes */}
      <td className="px-2 py-1.5">
        <input
          ref={notesRef}
          type="text"
          defaultValue={row.notes}
          onBlur={handleNotesBlur}
          placeholder="Notes…"
          maxLength={1000}
          className="w-[180px] h-8 px-2 text-sm border rounded-md bg-background outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </td>

      {/* Actions */}
      <td className="px-2 py-1.5 sticky right-0 bg-inherit border-l">
        <button
          type="button"
          onClick={() =>
            deleteRow.mutate(row.id, {
              onError: (err) => toast.error(err.message),
            })
          }
          disabled={deleteRow.isPending}
          aria-label="Delete row"
          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

export function PlannerScreen() {
  const { data: rows = [], isLoading } = usePlanner();
  const createRow = useCreatePlannerRow();

  const today = todayStr();

  // Find next upcoming row id
  const upcomingRows = rows.filter((r) => isoToDateInput(r.date) >= today);
  const nextRowId = upcomingRows.length > 0
    ? upcomingRows.reduce((a, b) =>
        isoToDateInput(a.date) <= isoToDateInput(b.date) ? a : b
      ).id
    : null;

  function getStatus(row: PlannerRowDTO): RowStatus {
    const d = isoToDateInput(row.date);
    if (d < today) return "past";
    if (row.id === nextRowId) return "next";
    return "upcoming";
  }

  function addRow() {
    createRow.mutate(
      { date: today },
      { onError: (err) => toast.error(err.message) },
    );
  }

  const HEADERS = [
    "Date",
    ...ROLE_COLUMNS.map((c) => c.label),
    "Theme",
    "Notes",
    "",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Planner</h1>
          <p className="text-sm text-muted-foreground">Role assignments for upcoming meetings</p>
        </div>
        <Button onClick={addRow} disabled={createRow.isPending} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Row
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-2 border-b text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-100 dark:bg-amber-950/40 border border-amber-400/50" />
          Next meeting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-muted/40 border border-border/50 opacity-50" />
          Past
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p className="text-sm">No plans yet.</p>
            <p className="text-xs mt-1">Click &ldquo;Add Row&rdquo; to plan your first meeting.</p>
          </div>
        ) : (
          <table className="w-max min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 sticky top-0 z-20">
                {HEADERS.map((h, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap text-xs tracking-wide",
                      i === 0 && "sticky left-0 bg-muted/50 z-30 border-r",
                      i === HEADERS.length - 1 && "sticky right-0 bg-muted/50 z-30 border-l w-10",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <PlannerRow
                  key={row.id}
                  row={row}
                  status={getStatus(row)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

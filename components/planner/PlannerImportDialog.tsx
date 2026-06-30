"use client";

import { useRef, useState } from "react";
import { Upload, AlertTriangle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMembers } from "@/hooks/useMembers";
import { useGuests } from "@/hooks/useGuests";
import { useBulkCreatePlannerRows } from "@/hooks/usePlanner";
import { parsePlannerXlsx, type ParsedPlannerRow } from "@/lib/plannerExcel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlannerRowInput } from "@/lib/validation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "preview";

export function PlannerImportDialog({ open, onOpenChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("pick");
  const [parsed, setParsed] = useState<ParsedPlannerRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const { data: members = [] } = useMembers();
  const { data: guests = [] } = useGuests();
  const bulkCreate = useBulkCreatePlannerRows();

  const validNames = new Set<string>([
    ...members.filter((m) => m.status === "active").map((m) => m.fullName),
    ...guests.map((g) => g.fullName),
  ]);

  function reset() {
    setStage("pick");
    setParsed([]);
    setParseError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".xlsx")) {
      setParseError("Please upload a .xlsx file.");
      return;
    }
    setParseError(null);
    setParsing(true);
    try {
      const rows = await parsePlannerXlsx(file, validNames);
      if (rows.length === 0) {
        setParseError("No data rows found. Make sure the file has data after the header row.");
        setParsing(false);
        return;
      }
      setParsed(rows);
      setStage("preview");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse file.");
    } finally {
      setParsing(false);
    }
  }

  const validRows = parsed.filter((r) => !r.missingDate);
  const rowsWithWarnings = parsed.filter(
    (r) => !r.missingDate && r.unknownNames.length > 0
  );
  const skippedRows = parsed.filter((r) => r.missingDate);
  const totalWarnings = parsed.reduce((sum, r) => sum + r.unknownNames.length, 0);

  async function handleImport() {
    const toCreate: PlannerRowInput[] = validRows.map((r) => ({
      date: r.data.date ?? "",
      tmod: r.data.tmod ?? "",
      ttm: r.data.ttm ?? "",
      tableTopicEvaluator: r.data.tableTopicEvaluator ?? "",
      preparedSpeaker1: r.data.preparedSpeaker1 ?? "",
      preparedEvaluator1: r.data.preparedEvaluator1 ?? "",
      preparedSpeaker2: r.data.preparedSpeaker2 ?? "",
      preparedEvaluator2: r.data.preparedEvaluator2 ?? "",
      preparedSpeaker3: r.data.preparedSpeaker3 ?? "",
      preparedEvaluator3: r.data.preparedEvaluator3 ?? "",
      generalEvaluator: r.data.generalEvaluator ?? "",
      timer: r.data.timer ?? "",
      ahCounter: r.data.ahCounter ?? "",
      grammarian: r.data.grammarian ?? "",
      theme: r.data.theme ?? "",
      notes: r.data.notes ?? "",
    }));

    bulkCreate.mutate(toCreate, {
      onSuccess: (created) => {
        toast.success(`${created.length} row${created.length !== 1 ? "s" : ""} imported`);
        handleClose();
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] max-w-2xl overflow-hidden p-0 flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <DialogTitle className="text-base font-semibold">Import from Excel</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a .xlsx file with planner rows
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {stage === "pick" ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FileSpreadsheet className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Choose a .xlsx file</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Names must match exactly with members or guests in the system.
                </p>
              </div>

              {parseError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive max-w-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {parseError}
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFile}
                className="hidden"
              />
              <Button
                onClick={() => fileRef.current?.click()}
                disabled={parsing}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                {parsing ? "Reading file…" : "Browse file"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b bg-muted/30 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {validRows.length} row{validRows.length !== 1 ? "s" : ""} ready
                </span>
                {skippedRows.length > 0 && (
                  <span className="flex items-center gap-1.5 text-destructive font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {skippedRows.length} skipped (missing date)
                  </span>
                )}
                {totalWarnings > 0 && (
                  <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {totalWarnings} unrecognised name{totalWarnings !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Warning note */}
              {totalWarnings > 0 && (
                <div className="mx-6 mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    Unrecognised names will still be imported as-is. You can update them
                    from the planner table afterward.
                  </span>
                </div>
              )}

              {/* Row preview table */}
              <div className="overflow-x-auto mx-6 mt-3 mb-4 rounded-md border text-xs">
                <table className="w-max min-w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">#</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">TMOD</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">TTM</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">TT Eval.</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Spk 1</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Eval 1</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Spk 2</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Eval 2</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Spk 3</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Eval 3</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Gen. Eval.</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Timer</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Ah Ctr.</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Gram.</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Theme</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Notes</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((r) => {
                      const unknownSet = new Set(r.unknownNames.map((u) => u.value));
                      const skip = r.missingDate;
                      return (
                        <tr
                          key={r.rowNum}
                          className={cn(
                            "border-b last:border-0",
                            skip && "opacity-40",
                          )}
                        >
                          <td className="px-3 py-1.5 text-muted-foreground tabular-nums">{r.rowNum}</td>
                          <NameCell value={r.data.date ?? ""} bad={skip} />
                          <NameCell value={r.data.tmod ?? ""} bad={unknownSet.has(r.data.tmod ?? "")} />
                          <NameCell value={r.data.ttm ?? ""} bad={unknownSet.has(r.data.ttm ?? "")} />
                          <NameCell value={r.data.tableTopicEvaluator ?? ""} bad={unknownSet.has(r.data.tableTopicEvaluator ?? "")} />
                          <NameCell value={r.data.preparedSpeaker1 ?? ""} bad={unknownSet.has(r.data.preparedSpeaker1 ?? "")} />
                          <NameCell value={r.data.preparedEvaluator1 ?? ""} bad={unknownSet.has(r.data.preparedEvaluator1 ?? "")} />
                          <NameCell value={r.data.preparedSpeaker2 ?? ""} bad={unknownSet.has(r.data.preparedSpeaker2 ?? "")} />
                          <NameCell value={r.data.preparedEvaluator2 ?? ""} bad={unknownSet.has(r.data.preparedEvaluator2 ?? "")} />
                          <NameCell value={r.data.preparedSpeaker3 ?? ""} bad={unknownSet.has(r.data.preparedSpeaker3 ?? "")} />
                          <NameCell value={r.data.preparedEvaluator3 ?? ""} bad={unknownSet.has(r.data.preparedEvaluator3 ?? "")} />
                          <NameCell value={r.data.generalEvaluator ?? ""} bad={unknownSet.has(r.data.generalEvaluator ?? "")} />
                          <NameCell value={r.data.timer ?? ""} bad={unknownSet.has(r.data.timer ?? "")} />
                          <NameCell value={r.data.ahCounter ?? ""} bad={unknownSet.has(r.data.ahCounter ?? "")} />
                          <NameCell value={r.data.grammarian ?? ""} bad={unknownSet.has(r.data.grammarian ?? "")} />
                          <td className="px-3 py-1.5 max-w-[120px] truncate">{r.data.theme ?? ""}</td>
                          <td className="px-3 py-1.5 max-w-[160px] truncate">{r.data.notes ?? ""}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            {skip ? (
                              <span className="text-destructive font-medium">Skip – no date</span>
                            ) : r.unknownNames.length > 0 ? (
                              <span className="text-amber-600 font-medium">⚠ {r.unknownNames.length} unknown</span>
                            ) : (
                              <span className="text-emerald-600 font-medium">✓ OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20 shrink-0">
          {stage === "preview" ? (
            <>
              <Button variant="ghost" size="sm" onClick={reset} disabled={bulkCreate.isPending}>
                ← Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClose} disabled={bulkCreate.isPending}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={bulkCreate.isPending || validRows.length === 0}
                >
                  {bulkCreate.isPending
                    ? "Importing…"
                    : `Import ${validRows.length} row${validRows.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleClose} className="ml-auto">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NameCell({ value, bad }: { value: string; bad: boolean }) {
  return (
    <td
      className={cn(
        "px-3 py-1.5 whitespace-nowrap max-w-[130px] truncate",
        bad && value ? "text-amber-700 dark:text-amber-400 font-medium" : "",
        !value && "text-muted-foreground/40",
      )}
      title={value || undefined}
    >
      {value || "—"}
    </td>
  );
}

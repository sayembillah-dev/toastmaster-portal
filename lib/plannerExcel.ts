import * as XLSX from "xlsx";
import type { PlannerRowInput } from "@/lib/validation";

// Column label → field key mapping, in table display order
export const PLANNER_EXCEL_COLUMNS = [
  { label: "Date", key: "date" },
  { label: "TMOD", key: "tmod" },
  { label: "TTM", key: "ttm" },
  { label: "TT Evaluator", key: "tableTopicEvaluator" },
  { label: "Speaker 1", key: "preparedSpeaker1" },
  { label: "Evaluator 1", key: "preparedEvaluator1" },
  { label: "Speaker 2", key: "preparedSpeaker2" },
  { label: "Evaluator 2", key: "preparedEvaluator2" },
  { label: "Speaker 3", key: "preparedSpeaker3" },
  { label: "Evaluator 3", key: "preparedEvaluator3" },
  { label: "General Eval.", key: "generalEvaluator" },
  { label: "Timer", key: "timer" },
  { label: "Ah Counter", key: "ahCounter" },
  { label: "Grammarian", key: "grammarian" },
  { label: "Theme", key: "theme" },
  { label: "Notes", key: "notes" },
] as const;

const HEADERS = PLANNER_EXCEL_COLUMNS.map((c) => c.label);

// Build a reverse map: label → key
const LABEL_TO_KEY = Object.fromEntries(
  PLANNER_EXCEL_COLUMNS.map(({ label, key }) => [label.toLowerCase(), key])
);

export function downloadPlannerTemplate() {
  const wb = XLSX.utils.book_new();

  // Header row + two blank sample rows
  const data = [HEADERS, [], []];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  const colWidths = PLANNER_EXCEL_COLUMNS.map(({ label }) => ({
    wch: Math.max(label.length + 4, label === "Notes" ? 30 : label === "Date" ? 14 : 18),
  }));
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Planner");
  XLSX.writeFile(wb, "planner-template.xlsx");
}

export type ParsedPlannerRow = {
  rowNum: number;
  data: Partial<PlannerRowInput>;
  unknownNames: { column: string; value: string }[];
  missingDate: boolean;
};

export function parsePlannerXlsx(
  file: File,
  validNames: Set<string>
): Promise<ParsedPlannerRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buf = e.target?.result;
        if (!buf) throw new Error("Empty file");

        const wb = XLSX.read(buf, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) throw new Error("No sheet found");

        const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: "",
          raw: false,
        });

        if (rows.length < 2) {
          resolve([]);
          return;
        }

        // Find header row (first row with at least "Date" in it)
        const headerRow = (rows[0] as string[]).map((h) => String(h).trim().toLowerCase());
        const colIndex: Record<string, number> = {};
        headerRow.forEach((h, i) => {
          const key = LABEL_TO_KEY[h];
          if (key) colIndex[key] = i;
        });

        const results: ParsedPlannerRow[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as string[];
          const rowNum = i + 1; // 1-based, header is row 1

          const data: Record<string, string> = {};
          for (const [key, idx] of Object.entries(colIndex)) {
            const raw = row[idx];
            data[key] = raw != null ? String(raw).trim() : "";
          }

          // Skip completely blank rows
          if (Object.values(data).every((v) => v === "")) continue;

          const dateVal = data.date ?? "";
          const missingDate = !dateVal;

          // Normalise date: Excel may output M/D/YYYY or YYYY-MM-DD
          let normDate = dateVal;
          if (dateVal && !missingDate) {
            // Try to parse and re-format as YYYY-MM-DD
            const parsed = new Date(dateVal);
            if (!isNaN(parsed.getTime())) {
              const y = parsed.getFullYear();
              const m = String(parsed.getMonth() + 1).padStart(2, "0");
              const d = String(parsed.getDate()).padStart(2, "0");
              normDate = `${y}-${m}-${d}`;
            }
          }

          // Name-resolution check for role columns
          const roleKeys = PLANNER_EXCEL_COLUMNS.filter(
            (c) => c.key !== "date" && c.key !== "theme" && c.key !== "notes"
          ).map((c) => c.key as string);

          const unknownNames: { column: string; value: string }[] = [];
          for (const key of roleKeys) {
            const val = data[key];
            if (val && !validNames.has(val)) {
              const col = PLANNER_EXCEL_COLUMNS.find((c) => c.key === key)?.label ?? key;
              unknownNames.push({ column: col, value: val });
            }
          }

          results.push({
            rowNum,
            data: { ...data, date: normDate } as Partial<PlannerRowInput>,
            unknownNames,
            missingDate,
          });
        }

        resolve(results);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to parse file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

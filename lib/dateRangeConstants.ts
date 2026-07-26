export const DATE_RANGE_PRESETS = [
  "this_month",
  "previous_month",
  "last_3_months",
  "last_6_months",
  "this_year",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

export const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  this_month: "This Month",
  previous_month: "Previous Month",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  this_year: "This Year",
};

export type DateRange = { start: Date; end: Date };

// End-of-day for the last day of `monthsAgo` months before `now`'s month
// (0 = current month).
function endOfMonth(now: Date, monthsAgo: number): Date {
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59, 999);
}

function startOfMonth(now: Date, monthsAgo: number): Date {
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1, 0, 0, 0, 0);
}

export function resolveDateRange(preset: DateRangePreset, now: Date = new Date()): DateRange {
  switch (preset) {
    case "this_month":
      return { start: startOfMonth(now, 0), end: endOfMonth(now, 0) };
    case "previous_month":
      return { start: startOfMonth(now, 1), end: endOfMonth(now, 1) };
    case "last_3_months":
      return { start: startOfMonth(now, 2), end: endOfMonth(now, 0) };
    case "last_6_months":
      return { start: startOfMonth(now, 5), end: endOfMonth(now, 0) };
    case "this_year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
  }
}

export function isWithinRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

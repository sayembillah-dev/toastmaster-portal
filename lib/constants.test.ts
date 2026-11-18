import { describe, expect, it } from "vitest";
import {
  AGENDA_DURATIONS,
  AGENDA_ROLE_KEYS,
  AGENDA_ROLE_LABELS,
} from "@/lib/eventConstants";
import {
  ALL_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatAmount,
} from "@/lib/fundConstants";
import { FOLLOW_UP_LABELS, FOLLOW_UP_STATUSES } from "@/lib/guestConstants";
import { PRIORITY_COLORS, PRIORITY_LABELS, TASK_PRIORITIES } from "@/lib/taskConstants";

describe("eventConstants", () => {
  it("has a label for every agenda role key", () => {
    expect(Object.keys(AGENDA_ROLE_LABELS).sort()).toEqual([...AGENDA_ROLE_KEYS].sort());
    for (const key of AGENDA_ROLE_KEYS) {
      expect(AGENDA_ROLE_LABELS[key]).toBeTruthy();
    }
  });

  it("has unique role keys", () => {
    expect(new Set(AGENDA_ROLE_KEYS).size).toBe(AGENDA_ROLE_KEYS.length);
  });

  it("uses positive integer minute durations", () => {
    for (const value of Object.values(AGENDA_DURATIONS)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });
});

describe("fundConstants", () => {
  it("combines income and expense categories without overlap", () => {
    expect(ALL_CATEGORIES).toEqual([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]);
    expect(new Set(ALL_CATEGORIES).size).toBe(ALL_CATEGORIES.length);
  });

  it("formatAmount renders the currency and two decimals", () => {
    expect(formatAmount(1500)).toBe("BDT 1500.00");
    expect(formatAmount(0.5)).toBe("BDT 0.50");
    expect(formatAmount(0)).toBe("BDT 0.00");
  });

  it("formatAmount rounds to two decimals", () => {
    expect(formatAmount(12.345678)).toBe("BDT 12.35");
  });
});

describe("guestConstants", () => {
  it("has a label for every follow-up status", () => {
    expect(Object.keys(FOLLOW_UP_LABELS).sort()).toEqual([...FOLLOW_UP_STATUSES].sort());
  });
});

describe("taskConstants", () => {
  it("has a label and colour for every priority", () => {
    for (const p of TASK_PRIORITIES) {
      expect(PRIORITY_LABELS[p]).toBeTruthy();
      expect(PRIORITY_COLORS[p]).toBeTruthy();
    }
  });
});

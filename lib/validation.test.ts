import { describe, expect, it } from "vitest";
import {
  eventSchema,
  eventUpdateSchema,
  guestSchema,
  memberSchema,
  memberUpdateSchema,
  plannerRowSchema,
  taskSchema,
  transactionSchema,
} from "@/lib/validation";

const validMember = {
  fullName: "Jane Doe",
  joinDate: "2026-01-01",
  status: "active",
  clubRole: "Member",
};

describe("memberSchema", () => {
  it("accepts a minimal valid member", () => {
    expect(memberSchema.safeParse(validMember).success).toBe(true);
  });

  it("trims names and lowercases emails", () => {
    const result = memberSchema.parse({ ...validMember, fullName: "  Jane Doe  ", email: "Jane@Example.COM" });
    expect(result.fullName).toBe("Jane Doe");
    expect(result.email).toBe("jane@example.com");
  });

  it("allows an empty-string email but rejects a malformed one", () => {
    expect(memberSchema.safeParse({ ...validMember, email: "" }).success).toBe(true);
    expect(memberSchema.safeParse({ ...validMember, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects too-short names, unknown status and unknown role", () => {
    expect(memberSchema.safeParse({ ...validMember, fullName: "J" }).success).toBe(false);
    expect(memberSchema.safeParse({ ...validMember, status: "banned" }).success).toBe(false);
    expect(memberSchema.safeParse({ ...validMember, clubRole: "King" }).success).toBe(false);
  });

  it("requires a join date", () => {
    const result = memberSchema.safeParse({ ...validMember, joinDate: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Join date is required");
  });

  it("update schema accepts partial payloads but still validates present fields", () => {
    expect(memberUpdateSchema.safeParse({}).success).toBe(true);
    expect(memberUpdateSchema.safeParse({ status: "inactive" }).success).toBe(true);
    expect(memberUpdateSchema.safeParse({ status: "nope" }).success).toBe(false);
  });
});

describe("guestSchema", () => {
  const validGuest = {
    fullName: "Guest One",
    whatsappSameAsPhone: false,
    visitDate: "2026-02-02",
    followUpStatus: "new",
  };

  it("accepts a minimal valid guest", () => {
    expect(guestSchema.safeParse(validGuest).success).toBe(true);
  });

  it("requires whatsappSameAsPhone as a boolean", () => {
    const { whatsappSameAsPhone, ...rest } = validGuest;
    void whatsappSameAsPhone;
    expect(guestSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an unknown follow-up status", () => {
    expect(guestSchema.safeParse({ ...validGuest, followUpStatus: "ghosted" }).success).toBe(false);
  });
});

describe("transactionSchema", () => {
  const validTx = { type: "income", category: "Donation", amount: 100, date: "2026-03-03" };

  it("accepts a valid transaction", () => {
    expect(transactionSchema.safeParse(validTx).success).toBe(true);
  });

  it("rejects zero and negative amounts", () => {
    const zero = transactionSchema.safeParse({ ...validTx, amount: 0 });
    expect(zero.success).toBe(false);
    expect(zero.error?.issues[0].message).toBe("Amount must be greater than 0");
    expect(transactionSchema.safeParse({ ...validTx, amount: -5 }).success).toBe(false);
  });

  it("rejects amounts passed as strings", () => {
    expect(transactionSchema.safeParse({ ...validTx, amount: "100" }).success).toBe(false);
  });

  it("rejects an unknown category or type", () => {
    expect(transactionSchema.safeParse({ ...validTx, category: "Bribes" }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...validTx, type: "transfer" }).success).toBe(false);
  });
});

describe("taskSchema", () => {
  const validTask = { title: "Book venue", priority: "high", status: "todo" };

  it("accepts a valid task", () => {
    expect(taskSchema.safeParse(validTask).success).toBe(true);
  });

  it("requires a non-empty title", () => {
    const result = taskSchema.safeParse({ ...validTask, title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title is required");
  });

  it("rejects unknown priority and status", () => {
    expect(taskSchema.safeParse({ ...validTask, priority: "urgent" }).success).toBe(false);
    expect(taskSchema.safeParse({ ...validTask, status: "doing" }).success).toBe(false);
  });
});

describe("eventSchema", () => {
  it("fills defaults for a date-only event", () => {
    const e = eventSchema.parse({ date: "2026-04-04" });
    expect(e.startTime).toBe("18:00");
    expect(e.meetingNumber).toBe(0);
    expect(e.isTemplate).toBe(false);
    expect(e.speakers).toEqual([]);
    expect(e.fillerWords).toEqual(["Ah", "Um", "So", "Like"]);
    expect(e.roles).toEqual({});
    expect(e.tableTopicQuestions).toEqual([]);
  });

  it("requires a date", () => {
    expect(eventSchema.safeParse({}).success).toBe(false);
    expect(eventSchema.safeParse({ date: "" }).success).toBe(false);
  });

  it("enforces HH:MM start times", () => {
    expect(eventSchema.safeParse({ date: "2026-04-04", startTime: "7pm" }).success).toBe(false);
    expect(eventSchema.safeParse({ date: "2026-04-04", startTime: "19:30" }).success).toBe(true);
  });

  it("limits speakers to 3 and defaults speaker duration to 7", () => {
    const four = Array.from({ length: 4 }, () => ({}));
    expect(eventSchema.safeParse({ date: "2026-04-04", speakers: four }).success).toBe(false);
    const parsed = eventSchema.parse({ date: "2026-04-04", speakers: [{ name: "A" }] });
    expect(parsed.speakers[0].duration).toBe(7);
  });

  it("rejects speaker durations outside 1-30 minutes", () => {
    expect(eventSchema.safeParse({ date: "d", speakers: [{ duration: 0 }] }).success).toBe(false);
    expect(eventSchema.safeParse({ date: "d", speakers: [{ duration: 31 }] }).success).toBe(false);
  });

  it("converts string table topic questions into objects", () => {
    const parsed = eventSchema.parse({
      date: "2026-04-04",
      tableTopicQuestions: ["  What is joy?  ", { text: "Why?", completed: true }],
    });
    expect(parsed.tableTopicQuestions).toEqual([
      { text: "What is joy?", completed: false },
      { text: "Why?", completed: true },
    ]);
  });

  it("limits table topic questions to 10", () => {
    const eleven = Array.from({ length: 11 }, (_, i) => `Q${i}`);
    expect(eventSchema.safeParse({ date: "d", tableTopicQuestions: eleven }).success).toBe(false);
  });

  it("validates timer entries", () => {
    const ok = eventSchema.parse({
      date: "d",
      timerEntries: [{ id: "t1", label: "Speaker 1", category: "preparedSpeaker" }],
    });
    expect(ok.timerEntries[0]).toMatchObject({ elapsed: 0, status: "idle" });
    expect(
      eventSchema.safeParse({ date: "d", timerEntries: [{ id: "t1", label: "x", category: "bogus" }] }).success,
    ).toBe(false);
  });

  it("update schema makes every field optional but still validates provided ones", () => {
    expect(eventUpdateSchema.safeParse({}).success).toBe(true);
    expect(eventUpdateSchema.safeParse({ theme: "Space" }).success).toBe(true);
    expect(eventUpdateSchema.safeParse({ startTime: "bad" }).success).toBe(false);
  });
});

describe("plannerRowSchema", () => {
  it("requires only a date", () => {
    expect(plannerRowSchema.safeParse({ date: "2026-05-05" }).success).toBe(true);
    expect(plannerRowSchema.safeParse({}).success).toBe(false);
  });

  it("trims role names and enforces the 80 character limit", () => {
    expect(plannerRowSchema.parse({ date: "d", tmod: "  Ann " }).tmod).toBe("Ann");
    expect(plannerRowSchema.safeParse({ date: "d", tmod: "x".repeat(81) }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { buildAgendaSchedule } from "@/lib/agendaSchedule";
import type { EventDTO, SpeakerDTO } from "@/lib/serializers";

function makeSpeaker(overrides: Partial<SpeakerDTO> = {}): SpeakerDTO {
  return {
    name: "",
    speechTitle: "",
    speechProject: "",
    speechLevel: "",
    duration: 7,
    notes: "",
    evaluatorName: "",
    ...overrides,
  };
}

function makeEvent(overrides: Partial<EventDTO> = {}): EventDTO {
  return {
    id: "evt1",
    title: "",
    meetingNumber: 1,
    date: "2026-01-01",
    startTime: "18:00",
    theme: "",
    venue: "",
    isTemplate: false,
    templateName: "",
    roles: {
      president: "Pat",
      sergeantAtArms: "Sam",
      toastmaster: "Tom",
      generalEvaluator: "Gina",
      tableTopicMaster: "Tina",
      tableTopicEvaluator: "Ted",
      ahCounter: "Al",
      timer: "Tim",
      grammarian: "Gary",
    },
    speakers: [],
    wordOfDay: { word: "", partOfSpeech: "", meaning: "", example: "" },
    joinUrl: "",
    tableTopicQuestions: [],
    attendees: [],
    resources: [],
    timerEntries: [],
    fillerWords: [],
    ahCounterReport: [],
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("buildAgendaSchedule", () => {
  it("omits the Prepared Speech Session when there are no speakers", () => {
    const rows = buildAgendaSchedule(makeEvent());
    expect(rows).toHaveLength(9);
    expect(rows.map((r) => r.label)).not.toContain("Prepared Speech Session");
  });

  it("includes the Prepared Speech Session when speakers exist", () => {
    const rows = buildAgendaSchedule(makeEvent({ speakers: [makeSpeaker()] }));
    expect(rows).toHaveLength(10);
    expect(rows.map((r) => r.label)).toContain("Prepared Speech Session");
  });

  it("starts at the event start time and ends with Meeting Conclusion", () => {
    const rows = buildAgendaSchedule(makeEvent());
    expect(rows[0].time).toBe("6:00 PM");
    expect(rows[rows.length - 1].label).toBe("Meeting Conclusion");
  });

  it("accumulates times from the section durations (no speakers)", () => {
    const times = buildAgendaSchedule(makeEvent()).map((r) => r.time);
    expect(times).toEqual([
      "6:00 PM", // SAA opens floor (10)
      "6:10 PM", // PO calls to order (10)
      "6:20 PM", // Intro TMOE (1)
      "6:21 PM", // Theme (2)
      "6:23 PM", // Intro GE (10)
      "6:33 PM", // Intro TTM (2 + 15)
      "6:50 PM", // Invite GE (26)
      "7:16 PM", // Invite PO (2 + 4)
      "7:22 PM", // Conclusion
    ]);
  });

  it("adds evaluator objectives plus speech duration per speaker to the timeline", () => {
    const rows = buildAgendaSchedule(
      makeEvent({ speakers: [makeSpeaker({ duration: 5 }), makeSpeaker({ duration: 8 })] }),
    );
    const pss = rows.find((r) => r.label === "Prepared Speech Session");
    expect(pss?.duration).toBe(2 + 5 + 2 + 8);
    expect(pss?.time).toBe("6:33 PM");
    const ttm = rows.find((r) => r.label === "TMOE introduces the Table Topic Master");
    expect(ttm?.time).toBe("6:50 PM");
  });

  it("falls back to the default speech duration when a speaker has none", () => {
    const rows = buildAgendaSchedule(makeEvent({ speakers: [makeSpeaker({ duration: 0 })] }));
    const pss = rows.find((r) => r.label === "Prepared Speech Session");
    expect(pss?.duration).toBe(2 + 7);
    expect(pss?.subRows?.[1].duration).toBe(7);
  });

  it("builds speaker sub rows with titles, names and an italic details row", () => {
    const rows = buildAgendaSchedule(
      makeEvent({
        speakers: [
          makeSpeaker({
            name: "Sue",
            speechTitle: "My Journey",
            evaluatorName: "Eve",
            speechProject: "Ice Breaker",
            speechLevel: "L1",
          }),
          makeSpeaker({}),
        ],
      }),
    );
    const sub = rows.find((r) => r.label === "Prepared Speech Session")!.subRows!;
    expect(sub[0]).toMatchObject({ label: "Evaluator explains Objectives", person: "Eve" });
    expect(sub[1]).toMatchObject({ label: "1. My Journey", person: "Sue", duration: 7 });
    expect(sub[2]).toEqual({ label: "Ice Breaker  ·  L1", italic: true });
    // Second speaker: no title -> placeholder label, no details row, no names.
    expect(sub[3].person).toBeUndefined();
    expect(sub[4]).toMatchObject({ label: "2. Speaker 2" });
    expect(sub[4].person).toBeUndefined();
    expect(sub).toHaveLength(5);
  });

  it("assigns role holders to the matching rows", () => {
    const rows = buildAgendaSchedule(makeEvent());
    const byLabel = (label: string) => rows.find((r) => r.label === label);
    expect(byLabel("Sergeant at Arms opens the floor")?.person).toBe("Sam");
    expect(byLabel("Presiding Officer calls the Meeting to order")?.person).toBe("Pat");
    expect(byLabel("Introduction of the Toastmaster of the Day")?.person).toBe("Tom");
    expect(byLabel("TMOE introduces the Table Topic Master")?.person).toBe("Tina");
    const ge = byLabel("TMOE invites General Evaluator");
    expect(ge?.person).toBe("Gina");
    expect(ge?.subRows?.map((s) => s.person)).toEqual([undefined, "Ted", "Al", "Tim", "Gary"]);
  });

  it("uses the first speaker's evaluator for Prepared Speech Evaluations", () => {
    const rows = buildAgendaSchedule(
      makeEvent({ speakers: [makeSpeaker({ evaluatorName: "Eve" })] }),
    );
    const ge = rows.find((r) => r.label === "TMOE invites General Evaluator");
    expect(ge?.subRows?.[0]).toMatchObject({ label: "Prepared Speech Evaluations", person: "Eve" });
  });

  it("defaults to 6:00 PM when startTime is empty", () => {
    const rows = buildAgendaSchedule(makeEvent({ startTime: "" }));
    expect(rows[0].time).toBe("6:00 PM");
  });

  it("formats morning, noon and midnight times in 12-hour clock", () => {
    expect(buildAgendaSchedule(makeEvent({ startTime: "09:05" }))[0].time).toBe("9:05 AM");
    expect(buildAgendaSchedule(makeEvent({ startTime: "12:00" }))[0].time).toBe("12:00 PM");
    expect(buildAgendaSchedule(makeEvent({ startTime: "00:30" }))[0].time).toBe("12:30 AM");
  });

  it("wraps past midnight", () => {
    const rows = buildAgendaSchedule(makeEvent({ startTime: "23:50" }));
    expect(rows[1].time).toBe("12:00 AM");
  });
});

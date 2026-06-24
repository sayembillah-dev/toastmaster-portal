import type { EventDTO, SpeakerDTO } from "./serializers";
import { AGENDA_DURATIONS } from "./eventConstants";

export type AgendaSubRow = {
  label: string;
  person?: string;
  duration?: number;
  italic?: boolean;
};

export type AgendaRow = {
  time: string;
  label: string;
  person?: string;
  duration?: number;
  bold?: boolean;
  subRows?: AgendaSubRow[];
};

function parseStartMinutes(startTime: string): number {
  const [h, m] = startTime.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function pssTotal(speakers: SpeakerDTO[]): number {
  return speakers.reduce(
    (sum, s) => sum + AGENDA_DURATIONS.evaluatorObjectives + (s.duration || AGENDA_DURATIONS.defaultSpeechDuration),
    0,
  );
}

export function buildAgendaSchedule(event: EventDTO): AgendaRow[] {
  const { roles, speakers, startTime } = event;
  const base = parseStartMinutes(startTime || "18:00");
  let offset = 0;

  const rows: AgendaRow[] = [];

  const push = (row: AgendaRow) => rows.push(row);

  // 1. SAA opens floor
  push({
    time: formatTime(base + offset),
    label: "Sergeant at Arms opens the floor",
    person: roles.sergeantAtArms,
    duration: AGENDA_DURATIONS.saaOpensFloor,
    bold: true,
    subRows: [
      { label: "Ground rules" },
      { label: "Mission Statement" },
    ],
  });
  offset += AGENDA_DURATIONS.saaOpensFloor;

  // 2. PO calls meeting to order
  push({
    time: formatTime(base + offset),
    label: "Presiding Officer calls the Meeting to order",
    person: roles.president,
    duration: AGENDA_DURATIONS.poCallsToOrder,
    bold: true,
    subRows: [
      { label: "National Anthem", duration: AGENDA_DURATIONS.nationalAnthem },
      { label: "Welcome guests & Round-Roaming Session", duration: AGENDA_DURATIONS.welcomeGuests },
    ],
  });
  offset += AGENDA_DURATIONS.poCallsToOrder;

  // 3. Introduction of TMOE
  push({
    time: formatTime(base + offset),
    label: "Introduction of the Toastmaster of the Day",
    person: roles.toastmaster,
    duration: AGENDA_DURATIONS.introTmoe,
    bold: true,
  });
  offset += AGENDA_DURATIONS.introTmoe;

  // 4. TMOE introduces theme
  push({
    time: formatTime(base + offset),
    label: "TMOE Introduce the Theme of the day",
    duration: AGENDA_DURATIONS.tmoeTheme,
    bold: true,
  });
  offset += AGENDA_DURATIONS.tmoeTheme;

  // 5. TMOE introduces GE
  push({
    time: formatTime(base + offset),
    label: "TMOE Introduces the General Evaluator",
    person: roles.generalEvaluator,
    duration: AGENDA_DURATIONS.tmoeIntroGe,
    bold: true,
    subRows: [
      { label: "Ah Counter" },
      { label: "Timer", person: roles.timer },
      { label: "Grammarian", person: roles.grammarian },
    ],
  });
  offset += AGENDA_DURATIONS.tmoeIntroGe;

  // 6. Prepared Speech Session
  const pssDuration = pssTotal(speakers);
  const pssSubRows: AgendaSubRow[] = [];
  speakers.forEach((s, i) => {
    pssSubRows.push({
      label: "Evaluator explains Objectives",
      person: s.evaluatorName || undefined,
      duration: AGENDA_DURATIONS.evaluatorObjectives,
    });
    const speechLabel = s.speechTitle || `Speaker ${i + 1}`;
    const speakerSub: AgendaSubRow = {
      label: `${i + 1}. ${speechLabel}`,
      person: s.name || undefined,
      duration: s.duration || AGENDA_DURATIONS.defaultSpeechDuration,
    };
    pssSubRows.push(speakerSub);
    if (s.speechProject || s.speechLevel || s.notes) {
      pssSubRows.push({
        label: [s.speechProject, s.speechLevel, s.notes].filter(Boolean).join("  ·  "),
        italic: true,
      });
    }
  });

  if (speakers.length > 0) {
    push({
      time: formatTime(base + offset),
      label: "Prepared Speech Session",
      duration: pssDuration,
      bold: true,
      subRows: pssSubRows,
    });
    offset += pssDuration;
  }

  // 7. TMOE introduces TTM
  push({
    time: formatTime(base + offset),
    label: "TMOE introduces the Table Topic Master",
    person: roles.tableTopicMaster,
    duration: AGENDA_DURATIONS.tmoeIntroTtm,
    bold: true,
    subRows: [
      { label: "Table Topic Session", duration: AGENDA_DURATIONS.tableTopicSession },
    ],
  });
  offset += AGENDA_DURATIONS.tmoeIntroTtm + AGENDA_DURATIONS.tableTopicSession;

  // 8. TMOE invites GE
  const geDuration =
    AGENDA_DURATIONS.psSpeechEvaluations +
    AGENDA_DURATIONS.ttSpeechEvaluations +
    AGENDA_DURATIONS.ahCounterReport +
    AGENDA_DURATIONS.timerReport +
    AGENDA_DURATIONS.grammarianReport;

  push({
    time: formatTime(base + offset),
    label: "TMOE invites General Evaluator",
    person: roles.generalEvaluator,
    duration: geDuration,
    bold: true,
    subRows: [
      { label: "Prepared Speech Evaluations", person: speakers[0]?.evaluatorName || undefined, duration: AGENDA_DURATIONS.psSpeechEvaluations },
      { label: "Table Topic Speech Evaluations", person: roles.tableTopicEvaluator, duration: AGENDA_DURATIONS.ttSpeechEvaluations },
      { label: "Ah Counter's Report", duration: AGENDA_DURATIONS.ahCounterReport },
      { label: "Timer's Reports", person: roles.timer, duration: AGENDA_DURATIONS.timerReport },
      { label: "Grammarian's Report", person: roles.grammarian, duration: AGENDA_DURATIONS.grammarianReport },
    ],
  });
  offset += geDuration;

  // 9. TMOE invites PO
  push({
    time: formatTime(base + offset),
    label: "TMOE invites Presiding Officer",
    person: roles.president,
    duration: AGENDA_DURATIONS.tmoeInvitesPo,
    bold: true,
    subRows: [
      { label: "Feedback & Q&A", duration: AGENDA_DURATIONS.feedbackQA },
    ],
  });
  offset += AGENDA_DURATIONS.tmoeInvitesPo + AGENDA_DURATIONS.feedbackQA;

  // 10. Meeting Conclusion
  push({
    time: formatTime(base + offset),
    label: "Meeting Conclusion",
    bold: true,
  });

  return rows;
}

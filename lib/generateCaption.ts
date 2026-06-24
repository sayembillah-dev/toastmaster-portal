import { AGENDA_DURATIONS, CLUB_INFO } from "./eventConstants";
import type { EventFormState } from "@/components/events/eventTabTypes";

function ordinal(n: number): string {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}

function fmtDate(iso: string): string {
  // Parse as local date (avoid UTC midnight timezone shift)
  const [y, mo, d] = iso.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${weekday}, ${ordinal(d)} ${month} ${y}`;
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function computeEndTime(form: EventFormState): string {
  const [h, m] = (form.startTime || "18:00").split(":").map(Number);
  const base = h * 60 + m;
  const d = AGENDA_DURATIONS;
  const fixed =
    d.saaOpensFloor + d.poCallsToOrder + d.introTmoe + d.tmoeTheme +
    d.tmoeIntroGe + d.tmoeIntroTtm + d.tableTopicSession +
    d.psSpeechEvaluations + d.ttSpeechEvaluations +
    d.ahCounterReport + d.timerReport + d.grammarianReport +
    d.tmoeInvitesPo + d.feedbackQA;
  const pss = form.speakers.reduce(
    (s, sp) => s + d.evaluatorObjectives + (sp.duration || d.defaultSpeechDuration),
    0,
  );
  const end = base + fixed + pss;
  const endH = Math.floor(end / 60) % 24;
  const endM = end % 60;
  const suffix = endH >= 12 ? "PM" : "AM";
  const h12 = endH % 12 === 0 ? 12 : endH % 12;
  return `${h12}:${String(endM).padStart(2, "0")} ${suffix}`;
}

export function generateCaption(form: EventFormState): string {
  const num = Number(form.meetingNumber) || 0;
  const ord = ordinal(num);
  const date = form.date ? fmtDate(form.date) : "TBD";
  const startTime = form.startTime ? fmtTime(form.startTime) : "TBD";
  const endTime = computeEndTime(form);
  const theme = form.theme || "TBD";
  const venue = form.venue || CLUB_INFO.address;

  const lines: string[] = [
    `🎉 Announcement: ${CLUB_INFO.name} – ${ord} General Meeting 🎉`,
    "",
    `We are delighted to invite you to the ${ord} General Meeting of ${CLUB_INFO.name}—an engaging session focused on strengthening communication, leadership, and personal growth.`,
    "",
    `🌟 Theme of the Meeting: "${theme}"`,
    "",
    `📅 Date : ${date}`,
    `⏰ Time : ${startTime} – ${endTime}`,
    `📍 Venue : ${venue}`,
    `Google Map link: ${CLUB_INFO.mapLink}`,
    "",
    "Join us for an insightful evening filled with inspiring speeches, constructive evaluations, and meaningful connections",
  ];

  if (form.joinUrl) {
    lines.push("", "Registration Link", form.joinUrl);
  }

  return lines.join("\n");
}

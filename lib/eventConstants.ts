export const AGENDA_ROLE_KEYS = [
  "president",
  "sergeantAtArms",
  "toastmaster",
  "generalEvaluator",
  "tableTopicMaster",
  "tableTopicEvaluator",
  "ahCounter",
  "timer",
  "grammarian",
] as const;

export type AgendaRoleKey = (typeof AGENDA_ROLE_KEYS)[number];

export const AGENDA_ROLE_LABELS: Record<AgendaRoleKey, string> = {
  president: "President",
  sergeantAtArms: "Sergeant at Arms",
  toastmaster: "Toast Master of the Day",
  generalEvaluator: "General Evaluator",
  tableTopicMaster: "Table Topic Master",
  tableTopicEvaluator: "Table Topic Evaluator",
  ahCounter: "Ah Counter",
  timer: "Timer",
  grammarian: "Grammarian",
};

export const AGENDA_DURATIONS = {
  saaOpensFloor: 10,
  poCallsToOrder: 10,
  nationalAnthem: 5,
  welcomeGuests: 5,
  introTmoe: 1,
  tmoeTheme: 2,
  tmoeIntroGe: 10,
  evaluatorObjectives: 2,
  defaultSpeechDuration: 7,
  tmoeIntroTtm: 2,
  tableTopicSession: 15,
  psSpeechEvaluations: 10,
  ttSpeechEvaluations: 10,
  ahCounterReport: 2,
  timerReport: 2,
  grammarianReport: 2,
  tmoeInvitesPo: 2,
  feedbackQA: 4,
} as const;

export const CLUB_INFO = {
  name: "Nifty Toastmasters Club",
  district: "District 124",
  division: "Division B",
  area: "Area B07",
  address: "Nifty Toastmasters Club, Unit 11A, Tropical Noor Tower,\n40 Kazi Nazrul Islam Avenue, Dhaka 1215",
  mapLink: "https://maps.app.goo.gl/QSYDdKRsGKYSPKaf7",
  mission:
    "We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth.",
} as const;

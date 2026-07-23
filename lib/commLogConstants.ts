export const COMM_CHANNELS = ["phone", "whatsapp", "email", "in_person", "other"] as const;
export type CommChannel = (typeof COMM_CHANNELS)[number];

export const COMM_OUTCOMES = [
  "no_answer",
  "positive",
  "neutral",
  "negative",
  "scheduled_visit",
] as const;
export type CommOutcome = (typeof COMM_OUTCOMES)[number];

export const COMM_CHANNEL_LABELS: Record<CommChannel, string> = {
  phone:      "Phone Call",
  whatsapp:   "WhatsApp",
  email:      "Email",
  in_person:  "In Person",
  other:      "Other",
};

export const COMM_OUTCOME_LABELS: Record<CommOutcome, string> = {
  no_answer:       "No Answer",
  positive:        "Positive Response",
  neutral:         "Neutral",
  negative:        "Not Interested",
  scheduled_visit: "Scheduled a Visit",
};

export const SLOT_STATUSES = ["requested", "confirmed", "declined", "cancelled"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const SLOT_TYPES = [
  "preparedSpeaker",
  "evaluator",
  "toastmaster",
  "tableTopicMaster",
  "generalEvaluator",
  "timer",
  "ahCounter",
  "grammarian",
  "functionary",
] as const;
export type SlotType = (typeof SLOT_TYPES)[number];

export const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  preparedSpeaker:  "Prepared Speaker",
  evaluator:        "Prepared Evaluator",
  toastmaster:      "Toastmaster of the Day",
  tableTopicMaster: "Table Topics Master",
  generalEvaluator: "General Evaluator",
  timer:            "Timer",
  ahCounter:        "Ah-Counter",
  grammarian:       "Grammarian",
  functionary:      "Functionary",
};

export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  requested:  "Pending Review",
  confirmed:  "Confirmed",
  declined:   "Declined",
  cancelled:  "Cancelled",
};

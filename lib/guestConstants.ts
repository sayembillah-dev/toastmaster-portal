export const FOLLOW_UP_STATUSES = [
  "new",
  "contacted",
  "interested",
  "not_interested",
  "joined",
] as const;

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  not_interested: "Not Interested",
  joined: "Joined",
};

// How a follow-up touchpoint with a guest happened.
export const COMMUNICATION_CHANNELS = [
  "call",
  "whatsapp",
  "email",
  "in_person",
  "other",
] as const;

export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];

export const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  call: "Phone Call",
  whatsapp: "WhatsApp",
  email: "Email",
  in_person: "In Person",
  other: "Other",
};

// Roles a guest can express interest in trying at a meeting.
export const GUEST_PREFERRED_ROLES = [
  "Prepared Speaker",
  "Table Topics Speaker",
  "Table Topic Master",
  "Toastmaster of the Day",
  "Evaluator",
  "General Evaluator",
  "Timer",
  "Ah-Counter",
  "Grammarian",
  "Just Observing",
] as const;

export type GuestPreferredRole = (typeof GUEST_PREFERRED_ROLES)[number];

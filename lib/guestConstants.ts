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

// Roles a guest can express interest in trying at a meeting.
export const GUEST_PREFERRED_ROLES = [
  "Prepared Speaker",
  "Table Topics Speaker",
  "Evaluator",
  "Timer",
  "Ah-Counter",
  "Grammarian",
  "General Evaluator",
  "Just Observing",
] as const;

export type GuestPreferredRole = (typeof GUEST_PREFERRED_ROLES)[number];

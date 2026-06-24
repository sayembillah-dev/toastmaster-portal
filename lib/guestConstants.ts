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

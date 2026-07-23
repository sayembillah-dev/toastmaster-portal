export const ALERT_TYPES = [
  "low_attendance",
  "missed_dues",
  "inactive_role",
  "no_speech",
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_STATUSES = ["active", "acknowledged", "resolved"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  low_attendance: "Low Meeting Attendance",
  missed_dues:    "Missed Dues Payment",
  inactive_role:  "No Role Taken Recently",
  no_speech:      "No Speech Delivered Recently",
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  active:       "Active",
  acknowledged: "Acknowledged",
  resolved:     "Resolved",
};

export const INVITATION_STATUSES = ["pending", "accepted", "declined", "cancelled"] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

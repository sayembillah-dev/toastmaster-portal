export const CLUB_ROLES = [
  "President",
  "VP Education",
  "VP Public Relations",
  "VP Membership",
  "Secretary",
  "Treasurer",
  "Sergeant-at-Arms",
  "Member",
] as const;

export type ClubRole = (typeof CLUB_ROLES)[number];

export const MEMBER_STATUSES = ["active", "inactive", "suspended"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

// Dues payment status, independent of the member's active/inactive/suspended standing.
export const MEMBER_PAYMENT_STATUSES = ["paid", "unpaid"] as const;
export type MemberPaymentStatus = (typeof MEMBER_PAYMENT_STATUSES)[number];

export const MEMBER_PAYMENT_LABELS: Record<MemberPaymentStatus, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
};

// What kind of event produced an activity log entry on a member's profile.
export const ACTIVITY_LOG_TYPES = ["guest_attendance", "conversion", "note"] as const;
export type ActivityLogType = (typeof ACTIVITY_LOG_TYPES)[number];

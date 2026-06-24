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

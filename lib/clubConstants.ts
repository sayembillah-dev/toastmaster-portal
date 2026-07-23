export const CLUB_TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Karachi",
  "Asia/Riyadh",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Australia/Sydney",
] as const;
export type ClubTimezone = (typeof CLUB_TIMEZONES)[number];

export const CLUB_DEFAULTS = {
  timezone: "Asia/Dhaka",
  currency: "BDT",
} as const;

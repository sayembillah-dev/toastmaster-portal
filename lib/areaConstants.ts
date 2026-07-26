import { CLUB_ROLES, type MemberPaymentStatus } from "@/lib/memberConstants";

export const HOME_CLUB_ID = "home-club";

export const DISTINGUISHED_STATUSES = [
  "President's Distinguished",
  "Select Distinguished",
  "Distinguished",
  "Not Distinguished",
] as const;

export type DistinguishedStatus = (typeof DISTINGUISHED_STATUSES)[number];

export type AreaClubMeeting = {
  id: string;
  label: string;
  present: number;
  total: number;
};

export type AreaClubMember = {
  id: string;
  name: string;
  role: string;
  paymentStatus: MemberPaymentStatus;
};

export type RoleActivity = {
  role: string;
  activityPercentage: number;
};

// Officer roles an activeness score applies to — everyone except plain "Member".
export const OFFICER_ROLES = CLUB_ROLES.filter((r) => r !== "Member");

function roleActivityFrom(percentages: number[]): RoleActivity[] {
  return OFFICER_ROLES.map((role, i) => ({ role, activityPercentage: percentages[i] ?? 0 }));
}

function buildMembers(
  clubId: string,
  // Dummy roster placeholder — only paid/unpaid, since these clubs have no real dues data
  // to justify seeding "Advance Paid" examples.
  entries: [name: string, role: string, paid: boolean][],
): AreaClubMember[] {
  return entries.map(([name, role, paid], i) => ({
    id: `${clubId}-mem-${i}`,
    name,
    role,
    paymentStatus: paid ? "paid" : "unpaid",
  }));
}

export type AreaClub = {
  id: string;
  name: string;
  clubNumber: string;
  isHomeClub?: boolean;
  status: DistinguishedStatus;
  memberCount: number;
  goalMemberCount: number;
  meetingDay: string;
  meetingTime: string;
  location: string;
  // Not backed by any tracking model yet (no Guest-retention/role-fulfillment aggregate) —
  // kept as locally-stored placeholders for every club, including the home club.
  guestRetention: number;
  roleFulfillmentHealth: number;
  // Past-meeting headcounts. For the home club this is unused — its meetings/attendance
  // are computed live from real Event.memberAttendance data instead (see useClubMeetingStats).
  meetings: AreaClubMeeting[];
  // Dummy roster for non-home clubs only — the home club's member list is real
  // (see useClubMembers), so this stays empty there.
  members: AreaClubMember[];
  // No officer-audit-trail model exists yet — placeholder for every club.
  roleActivity: RoleActivity[];
};

export const AREA_NAME = "Area 12";
export const AREA_DIVISION = "Division B";
export const DIVISION_DIRECTOR_LABEL = `${AREA_DIVISION} Director`;

export const AREA_CLUBS_STORAGE_KEY = "ntc_area_clubs_v5";

export const SEED_AREA_CLUBS: AreaClub[] = [
  {
    id: "home-club",
    name: "NTC",
    clubNumber: "00512345",
    isHomeClub: true,
    status: "Distinguished",
    memberCount: 24,
    goalMemberCount: 20,
    meetingDay: "Thursday",
    meetingTime: "7:00 PM",
    location: "Community Hall, Room 3",
    guestRetention: 42,
    roleFulfillmentHealth: 88,
    meetings: [],
    members: [],
    roleActivity: roleActivityFrom([92, 80, 55, 70, 88, 90, 65]),
  },
  {
    id: "dummy-1",
    name: "Riverside Speakers",
    clubNumber: "00587213",
    status: "President's Distinguished",
    memberCount: 31,
    goalMemberCount: 20,
    meetingDay: "Tuesday",
    meetingTime: "6:30 PM",
    location: "Riverside Library, Meeting Room A",
    guestRetention: 58,
    roleFulfillmentHealth: 95,
    meetings: [
      { id: "m1", label: "Jun 2, 2026", present: 26, total: 28 },
      { id: "m2", label: "Jun 9, 2026", present: 25, total: 28 },
      { id: "m3", label: "Jun 16, 2026", present: 27, total: 28 },
      { id: "m4", label: "Jun 23, 2026", present: 24, total: 28 },
      { id: "m5", label: "Jun 30, 2026", present: 26, total: 28 },
      { id: "m6", label: "Jul 7, 2026", present: 28, total: 28 },
    ],
    members: buildMembers("dummy-1", [
      ["Amara Osei", "President", true],
      ["Devon Lok", "VP Education", true],
      ["Priya Nair", "VP Public Relations", true],
      ["Marcus Wei", "VP Membership", true],
      ["Sofia Reyes", "Secretary", true],
      ["Jamal Idris", "Treasurer", false],
      ["Hana Suzuki", "Sergeant-at-Arms", true],
      ["Leo Bianchi", "Member", true],
    ]),
    roleActivity: roleActivityFrom([96, 94, 88, 85, 97, 90, 92]),
  },
  {
    id: "dummy-2",
    name: "Downtown Communicators",
    clubNumber: "00549871",
    status: "Select Distinguished",
    memberCount: 22,
    goalMemberCount: 20,
    meetingDay: "Wednesday",
    meetingTime: "12:00 PM",
    location: "City Center Office, 4th Floor",
    guestRetention: 47,
    roleFulfillmentHealth: 80,
    meetings: [
      { id: "m1", label: "Jun 3, 2026", present: 16, total: 20 },
      { id: "m2", label: "Jun 10, 2026", present: 14, total: 20 },
      { id: "m3", label: "Jun 17, 2026", present: 15, total: 20 },
      { id: "m4", label: "Jun 24, 2026", present: 13, total: 20 },
      { id: "m5", label: "Jul 1, 2026", present: 16, total: 20 },
      { id: "m6", label: "Jul 8, 2026", present: 17, total: 20 },
    ],
    members: buildMembers("dummy-2", [
      ["Grace Okafor", "President", true],
      ["Ravi Chandran", "VP Education", true],
      ["Elena Petrova", "VP Public Relations", false],
      ["Tomas Silva", "VP Membership", true],
      ["Nadia Haddad", "Secretary", true],
      ["Owen Fitzgerald", "Treasurer", true],
      ["Mei Lin Tan", "Sergeant-at-Arms", false],
    ]),
    roleActivity: roleActivityFrom([84, 78, 60, 72, 82, 76, 68]),
  },
  {
    id: "dummy-3",
    name: "Sunrise Toastmasters",
    clubNumber: "00563209",
    status: "Not Distinguished",
    memberCount: 14,
    goalMemberCount: 20,
    meetingDay: "Saturday",
    meetingTime: "9:00 AM",
    location: "Sunrise Community Center",
    guestRetention: 18,
    roleFulfillmentHealth: 52,
    meetings: [
      { id: "m1", label: "Jun 6, 2026", present: 6, total: 14 },
      { id: "m2", label: "Jun 13, 2026", present: 5, total: 14 },
      { id: "m3", label: "Jun 20, 2026", present: 4, total: 14 },
      { id: "m4", label: "Jun 27, 2026", present: 7, total: 14 },
      { id: "m5", label: "Jul 4, 2026", present: 5, total: 14 },
      { id: "m6", label: "Jul 11, 2026", present: 6, total: 14 },
    ],
    members: buildMembers("dummy-3", [
      ["Carlos Mendes", "President", false],
      ["Fatima Zahra", "VP Education", true],
      ["Ben Okoye", "VP Public Relations", false],
      ["Ingrid Solberg", "VP Membership", false],
      ["Yusuf Rahman", "Secretary", true],
      ["Chloe Baptiste", "Treasurer", false],
      ["Arjun Mehta", "Sergeant-at-Arms", true],
    ]),
    roleActivity: roleActivityFrom([48, 55, 30, 25, 60, 35, 40]),
  },
  {
    id: "dummy-4",
    name: "Innovators Club",
    clubNumber: "00591044",
    status: "Distinguished",
    memberCount: 19,
    goalMemberCount: 20,
    meetingDay: "Monday",
    meetingTime: "7:30 PM",
    location: "Tech Park Auditorium",
    guestRetention: 51,
    roleFulfillmentHealth: 70,
    meetings: [
      { id: "m1", label: "Jun 1, 2026", present: 13, total: 19 },
      { id: "m2", label: "Jun 8, 2026", present: 12, total: 19 },
      { id: "m3", label: "Jun 15, 2026", present: 14, total: 19 },
      { id: "m4", label: "Jun 22, 2026", present: 11, total: 19 },
      { id: "m5", label: "Jun 29, 2026", present: 13, total: 19 },
      { id: "m6", label: "Jul 6, 2026", present: 14, total: 19 },
    ],
    members: buildMembers("dummy-4", [
      ["Wei Chen", "President", true],
      ["Aisha Bello", "VP Education", true],
      ["Diego Fernandez", "VP Public Relations", true],
      ["Naomi Cohen", "VP Membership", false],
      ["Karim Aziz", "Secretary", true],
      ["Lucia Moretti", "Treasurer", true],
      ["Samuel Oduya", "Sergeant-at-Arms", false],
    ]),
    roleActivity: roleActivityFrom([70, 66, 58, 50, 74, 68, 62]),
  },
  {
    id: "dummy-5",
    name: "Voices of Change",
    clubNumber: "00578650",
    status: "Not Distinguished",
    memberCount: 11,
    goalMemberCount: 20,
    meetingDay: "Friday",
    meetingTime: "5:30 PM",
    location: "Westside Public Library",
    guestRetention: 22,
    roleFulfillmentHealth: 45,
    meetings: [
      { id: "m1", label: "Jun 5, 2026", present: 4, total: 11 },
      { id: "m2", label: "Jun 12, 2026", present: 3, total: 11 },
      { id: "m3", label: "Jun 19, 2026", present: 4, total: 11 },
      { id: "m4", label: "Jun 26, 2026", present: 3, total: 11 },
      { id: "m5", label: "Jul 3, 2026", present: 4, total: 11 },
      { id: "m6", label: "Jul 10, 2026", present: 3, total: 11 },
    ],
    members: buildMembers("dummy-5", [
      ["Isabel Duarte", "President", false],
      ["Noah Kim", "VP Education", false],
      ["Zara Ahmed", "VP Public Relations", false],
      ["Tobias Weber", "VP Membership", true],
      ["Ruth Adeyemi", "Secretary", false],
      ["Felix Nowak", "Treasurer", false],
    ]),
    roleActivity: roleActivityFrom([35, 28, 20, 40, 30, 22, 33]),
  },
];

// Single-hue scale (green = achieved) instead of a different color per tier —
// intensity signals rank so the dashboard doesn't turn into a rainbow of badges.
export const STATUS_BADGE_STYLES: Record<DistinguishedStatus, string> = {
  "President's Distinguished": "bg-green-600 text-white border-transparent",
  "Select Distinguished": "bg-green-100 text-green-700 border-green-200",
  Distinguished: "bg-transparent text-green-700 border-green-200",
  "Not Distinguished": "bg-muted text-muted-foreground border-transparent",
};

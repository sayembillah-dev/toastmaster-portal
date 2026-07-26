import { DIVISION_DIRECTOR_LABEL } from "@/lib/areaConstants";

export const TICKET_STATUSES = ["Open", "Active", "Resolved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_SEVERITIES = ["Low", "Medium", "High"] as const;
export type TicketSeverity = (typeof TICKET_SEVERITIES)[number];

export type TicketPartyType = "club" | "person" | "division";

export type TicketParty = {
  type: TicketPartyType;
  // Present for "club" and "person" parties — absent for "division".
  clubId?: string;
  name: string;
  resolved: boolean;
};

export type GlobalTicket = {
  id: string;
  title: string;
  description: string;
  severity: TicketSeverity;
  date: string;
  parties: TicketParty[];
};

// Status is derived, never stored directly — a ticket isn't "Resolved" until
// every connected party (club president, tagged member(s), Division Director) has resolved their part.
export function ticketStatus(ticket: GlobalTicket): TicketStatus {
  if (ticket.parties.length === 0) return "Open";
  if (ticket.parties.every((p) => p.resolved)) return "Resolved";
  if (ticket.parties.some((p) => p.resolved)) return "Active";
  return "Open";
}

export function partyKey(p: TicketParty): string {
  return `${p.type}:${p.clubId ?? ""}:${p.name}`;
}

export function partyResolverLabel(p: TicketParty): string {
  if (p.type === "club") return `${p.name} — resolved by President`;
  if (p.type === "division") return `Resolved by ${p.name}`;
  return `Resolved by ${p.name}`;
}

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  Open: "bg-amber-100 text-amber-700 border-amber-200",
  Active: "bg-blue-100 text-blue-700 border-blue-200",
  Resolved: "bg-green-100 text-green-700 border-green-200",
};

export const TICKET_SEVERITY_STYLES: Record<TicketSeverity, string> = {
  Low: "bg-muted text-muted-foreground border-transparent",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  High: "bg-red-100 text-red-700 border-red-200",
};

export const TICKETS_STORAGE_KEY = "ntc_tickets_v1";

function clubParty(clubId: string, clubName: string, resolved: boolean): TicketParty {
  return { type: "club", clubId, name: clubName, resolved };
}

function personParty(clubId: string, name: string, resolved: boolean): TicketParty {
  return { type: "person", clubId, name, resolved };
}

function divisionParty(resolved: boolean): TicketParty {
  return { type: "division", name: DIVISION_DIRECTOR_LABEL, resolved };
}

function ticket(
  id: string,
  title: string,
  description: string,
  severity: TicketSeverity,
  date: string,
  parties: TicketParty[],
): GlobalTicket {
  return { id, title, description, severity, date, parties };
}

export const SEED_TICKETS: GlobalTicket[] = [
  // NTC (home club)
  ticket(
    "tix-1",
    "Projector not working in Room 3",
    "The venue's ceiling projector has been flickering out mid-meeting for the past two sessions. Needs a bulb check or replacement before the next agenda.",
    "Medium",
    "Jul 18, 2026",
    [clubParty("home-club", "NTC", false)],
  ),
  ticket(
    "tix-2",
    "Need 2 more Table Topics volunteers for next meeting",
    "Table Topics slot is short-handed for the upcoming meeting — looking for two members willing to help fill it.",
    "Low",
    "Jul 15, 2026",
    [personParty("home-club", "VP Education", false)],
  ),
  ticket(
    "tix-3",
    "Late dues follow-up for 3 members",
    "Three members are past due on club dues. Treasurer has sent reminders; following up before the next billing cycle.",
    "Low",
    "Jul 3, 2026",
    [personParty("home-club", "Treasurer", true)],
  ),

  // Riverside Speakers
  ticket(
    "tix-4",
    "Requesting mentorship pairing for 2 new members",
    "Two members who joined last month are ready to be paired with a mentor for their first pathway level.",
    "Low",
    "Jul 20, 2026",
    [personParty("dummy-1", "Devon Lok", false)],
  ),
  ticket(
    "tix-5",
    "Room booking conflict on Jul 28 meeting",
    "The library has double-booked Meeting Room A for our regular slot — need an alternate room confirmed before the 28th.",
    "Medium",
    "Jul 17, 2026",
    [personParty("dummy-1", "Amara Osei", true), personParty("dummy-1", "Hana Suzuki", false)],
  ),
  ticket(
    "tix-6",
    "Sound system feedback issue — resolved by venue",
    "Persistent mic feedback during Table Topics was traced to a loose XLR cable; venue technician fixed it on-site.",
    "Low",
    "Jun 25, 2026",
    [personParty("dummy-1", "Hana Suzuki", true)],
  ),

  // Downtown Communicators
  ticket(
    "tix-7",
    "Guest follow-up backlog piling up",
    "About 6 guests from the last month haven't received a follow-up call or email yet.",
    "Medium",
    "Jul 19, 2026",
    [personParty("dummy-2", "Tomas Silva", false)],
  ),
  ticket(
    "tix-8",
    "Table Topics timing running over consistently",
    "Table Topics has run 8-10 minutes over the last three meetings, pushing the agenda late.",
    "Low",
    "Jul 12, 2026",
    [personParty("dummy-2", "Ravi Chandran", false)],
  ),
  ticket(
    "tix-9",
    "Clarify dues deadline for lapsed members",
    "A few members were confused about the renewal window; deadline has been clarified and communicated.",
    "Medium",
    "Jun 30, 2026",
    [personParty("dummy-2", "Owen Fitzgerald", true)],
  ),

  // Sunrise Toastmasters
  ticket(
    "tix-10",
    "Struggling to fill functionary roles most weeks",
    "Timer, Ah-Counter, and Grammarian have gone unfilled for 3 of the last 4 meetings due to low turnout.",
    "High",
    "Jul 21, 2026",
    [clubParty("dummy-3", "Sunrise Toastmasters", false)],
  ),
  ticket(
    "tix-11",
    "Membership renewal reminders not going out",
    "Renewal emails haven't been sent for this cycle — need to confirm the mailing list and resend.",
    "High",
    "Jul 14, 2026",
    [personParty("dummy-3", "Ingrid Solberg", false)],
  ),
  ticket(
    "tix-12",
    "Venue availability uncertain past September",
    "Community center has flagged possible renovations that could bump our regular Saturday slot.",
    "Medium",
    "Jul 5, 2026",
    [personParty("dummy-3", "Carlos Mendes", true), personParty("dummy-3", "Arjun Mehta", false)],
  ),

  // Innovators Club
  ticket(
    "tix-13",
    "New pathways enrollment questions from 3 members",
    "Three members want help choosing their next Pathways level and need guidance from VPE.",
    "Low",
    "Jul 16, 2026",
    [personParty("dummy-4", "Aisha Bello", false)],
  ),
  ticket(
    "tix-14",
    "Evaluator no-shows twice this month",
    "Assigned evaluators have dropped out last-minute twice — need a backup evaluator process.",
    "Medium",
    "Jul 9, 2026",
    [personParty("dummy-4", "Wei Chen", false)],
  ),
  ticket(
    "tix-15",
    "Guest chair confirmed for Q3 recruitment push",
    "VP PR has lined up a guest-chair rotation for the Q3 open house campaign.",
    "Low",
    "Jun 20, 2026",
    [personParty("dummy-4", "Diego Fernandez", true)],
  ),

  // Voices of Change
  ticket(
    "tix-16",
    "Club at risk of falling below charter minimum",
    "Active membership has dropped to 11, close to the charter-strength floor. Needs an intervention plan.",
    "High",
    "Jul 22, 2026",
    [clubParty("dummy-5", "Voices of Change", false)],
  ),
  ticket(
    "tix-17",
    "Requesting Area Director visit to help recruitment",
    "Officers have asked for an Area Director visit to help energize a recruitment push next quarter, and flagged it up the chain too.",
    "High",
    "Jul 20, 2026",
    [
      personParty("dummy-5", "Isabel Duarte", false),
      personParty("dummy-5", "Zara Ahmed", false),
      divisionParty(false),
    ],
  ),
  ticket(
    "tix-18",
    "Treasurer report overdue for June",
    "June's financial report hasn't been submitted yet — following up with the Treasurer.",
    "Medium",
    "Jul 10, 2026",
    [personParty("dummy-5", "Felix Nowak", false)],
  ),
];

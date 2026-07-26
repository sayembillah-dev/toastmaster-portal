export const TICKET_STATUSES = ["Open", "Resolved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_SEVERITIES = ["Low", "Medium", "High"] as const;
export type TicketSeverity = (typeof TICKET_SEVERITIES)[number];

// There's no per-user login yet, so every ticket created in this browser is
// automatically attributed to a single stand-in identity rather than asking.
export const CURRENT_USER_LABEL = "You";

export type TicketPartyType = "club" | "person" | "division";

export type TicketParty = {
  type: TicketPartyType;
  // Present for "club" and "person" parties — absent for "division".
  clubId?: string;
  // Display label for "club" (club name) and "division" (Division Director label).
  // For "person" this holds the tagged member's actual name — kept only so "tagged
  // in you" filtering can match it; it's never rendered (see partyLabel below),
  // since a bare human name doesn't say who resolves it or from which club.
  name: string;
  // "person" only — rendered as "<clubName> — <role>" instead of the member's name.
  clubName?: string;
  role?: string;
};

export type GlobalTicket = {
  id: string;
  title: string;
  description: string;
  severity: TicketSeverity;
  date: string;
  createdBy: string;
  // Resolution is a single action on the ticket as a whole, not per tagged party —
  // there's no per-user login yet to know which party a given viewer represents,
  // so anyone resolving on a specific party's behalf would be a guess.
  resolved: boolean;
  parties: TicketParty[];
};

// Case/whitespace-insensitive identity match, used to compare a ticket's
// createdBy/party name against the current viewer's typed name.
export function sameName(a: string, b: string): boolean {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  return x.length > 0 && x === y;
}

export function ticketStatus(ticket: GlobalTicket): TicketStatus {
  return ticket.resolved ? "Resolved" : "Open";
}

// Display label for an "Involved" badge — club + role for a tagged person, rather
// than their bare name, so it's clear which club/role is responsible.
export function partyLabel(p: TicketParty): string {
  if (p.type === "person") return [p.clubName, p.role].filter(Boolean).join(" — ") || p.name;
  return p.name;
}

export function partyDisplayKey(p: TicketParty): string {
  return `${p.type}:${p.clubId ?? ""}:${p.name}`;
}

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  Open: "bg-amber-100 text-amber-700 border-amber-200",
  Resolved: "bg-green-100 text-green-700 border-green-200",
};

export const TICKET_SEVERITY_STYLES: Record<TicketSeverity, string> = {
  Low: "bg-muted text-muted-foreground border-transparent",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  High: "bg-red-100 text-red-700 border-red-200",
};

// Bumped to v4 when the dummy club roster was trimmed down to the 3 real
// external clubs, so existing localStorage data (shaped for the old dummy clubs) reseeds.
export const TICKETS_STORAGE_KEY = "ntc_tickets_v4";

function clubParty(clubId: string, clubName: string): TicketParty {
  return { type: "club", clubId, name: clubName };
}

function personParty(clubId: string, clubName: string, personName: string, role: string): TicketParty {
  return { type: "person", clubId, clubName, name: personName, role };
}

function ticket(
  id: string,
  title: string,
  description: string,
  severity: TicketSeverity,
  date: string,
  createdBy: string,
  resolved: boolean,
  parties: TicketParty[],
): GlobalTicket {
  return { id, title, description, severity, date, createdBy, resolved, parties };
}

export const SEED_TICKETS: GlobalTicket[] = [
  // NTC (home club)
  ticket(
    "tix-1",
    "Projector not working in Room 3",
    "The venue's ceiling projector has been flickering out mid-meeting for the past two sessions. Needs a bulb check or replacement before the next agenda.",
    "Medium",
    "Jul 18, 2026",
    "Sergeant-at-Arms",
    false,
    [clubParty("home-club", "NTC")],
  ),
  ticket(
    "tix-2",
    "Need 2 more Table Topics volunteers for next meeting",
    "Table Topics slot is short-handed for the upcoming meeting — looking for two members willing to help fill it.",
    "Low",
    "Jul 15, 2026",
    "President",
    false,
    [personParty("home-club", "NTC", "VP Education", "VP Education")],
  ),
  ticket(
    "tix-3",
    "Late dues follow-up for 3 members",
    "Three members are past due on club dues. Treasurer has sent reminders; following up before the next billing cycle.",
    "Low",
    "Jul 3, 2026",
    "Secretary",
    true,
    [personParty("home-club", "NTC", "Treasurer", "Treasurer")],
  ),

  // 100X Toastmaster Club
  ticket(
    "tix-4",
    "Requesting mentorship pairing for 2 new members",
    "Two members who joined last month are ready to be paired with a mentor for their first pathway level.",
    "Low",
    "Jul 20, 2026",
    "Amara Osei",
    false,
    [personParty("dummy-1", "100X Toastmaster Club", "Devon Lok", "VP Education")],
  ),
  ticket(
    "tix-5",
    "Room booking conflict on Jul 28 meeting",
    "The library has double-booked Meeting Room A for our regular slot — need an alternate room confirmed before the 28th.",
    "Medium",
    "Jul 17, 2026",
    "Amara Osei",
    false,
    [
      personParty("dummy-1", "100X Toastmaster Club", "Amara Osei", "President"),
      personParty("dummy-1", "100X Toastmaster Club", "Hana Suzuki", "Sergeant-at-Arms"),
    ],
  ),
  ticket(
    "tix-6",
    "Sound system feedback issue — resolved by venue",
    "Persistent mic feedback during Table Topics was traced to a loose XLR cable; venue technician fixed it on-site.",
    "Low",
    "Jun 25, 2026",
    "Amara Osei",
    true,
    [personParty("dummy-1", "100X Toastmaster Club", "Hana Suzuki", "Sergeant-at-Arms")],
  ),

  // Legacy Leaders Toastmasters
  ticket(
    "tix-7",
    "Guest follow-up backlog piling up",
    "About 6 guests from the last month haven't received a follow-up call or email yet.",
    "Medium",
    "Jul 19, 2026",
    "Grace Okafor",
    false,
    [personParty("dummy-2", "Legacy Leaders Toastmasters", "Tomas Silva", "VP Membership")],
  ),
  ticket(
    "tix-8",
    "Table Topics timing running over consistently",
    "Table Topics has run 8-10 minutes over the last three meetings, pushing the agenda late.",
    "Low",
    "Jul 12, 2026",
    "Grace Okafor",
    false,
    [personParty("dummy-2", "Legacy Leaders Toastmasters", "Ravi Chandran", "VP Education")],
  ),
  ticket(
    "tix-9",
    "Clarify dues deadline for lapsed members",
    "A few members were confused about the renewal window; deadline has been clarified and communicated.",
    "Medium",
    "Jun 30, 2026",
    "Nadia Haddad",
    true,
    [personParty("dummy-2", "Legacy Leaders Toastmasters", "Owen Fitzgerald", "Treasurer")],
  ),

  // Dhrupodi Bangla Toastmasters Club
  ticket(
    "tix-10",
    "Struggling to fill functionary roles most weeks",
    "Timer, Ah-Counter, and Grammarian have gone unfilled for 3 of the last 4 meetings due to low turnout.",
    "High",
    "Jul 21, 2026",
    "Carlos Mendes",
    false,
    [clubParty("dummy-3", "Dhrupodi Bangla Toastmasters Club")],
  ),
  ticket(
    "tix-11",
    "Membership renewal reminders not going out",
    "Renewal emails haven't been sent for this cycle — need to confirm the mailing list and resend.",
    "High",
    "Jul 14, 2026",
    "Carlos Mendes",
    false,
    [personParty("dummy-3", "Dhrupodi Bangla Toastmasters Club", "Ingrid Solberg", "VP Membership")],
  ),
  ticket(
    "tix-12",
    "Venue availability uncertain past September",
    "Community center has flagged possible renovations that could bump our regular Saturday slot.",
    "Medium",
    "Jul 5, 2026",
    "Carlos Mendes",
    false,
    [
      personParty("dummy-3", "Dhrupodi Bangla Toastmasters Club", "Carlos Mendes", "President"),
      personParty("dummy-3", "Dhrupodi Bangla Toastmasters Club", "Arjun Mehta", "Sergeant-at-Arms"),
    ],
  ),
];

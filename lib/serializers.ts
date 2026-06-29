import type { ClubRole, MemberStatus } from "@/lib/memberConstants";
import type { FollowUpStatus } from "@/lib/guestConstants";
import type { TransactionType, TransactionCategory } from "@/lib/fundConstants";
import type { TaskPriority, TaskStatus } from "@/lib/taskConstants";

export type LeanMember = {
  _id: unknown;
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  clubRole: ClubRole;
  joinDate: Date;
  bio: string;
  photoUrl: string;
  photoPublicId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MemberDTO = {
  id: string;
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  clubRole: ClubRole;
  joinDate: string;
  bio: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeMember(m: LeanMember): MemberDTO {
  return {
    id: String(m._id),
    membershipNumber: m.membershipNumber ?? "",
    fullName: m.fullName,
    email: m.email ?? "",
    phone: m.phone ?? "",
    status: m.status,
    clubRole: m.clubRole,
    joinDate: m.joinDate instanceof Date ? m.joinDate.toISOString() : String(m.joinDate),
    bio: m.bio ?? "",
    photoUrl: m.photoUrl ?? "",
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : String(m.updatedAt),
  };
}

// ── Guest ────────────────────────────────────────────────────────────────────

export type LeanGuest = {
  _id: unknown;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  details: string;
  preferredRole?: string;
  visitDate: Date;
  followUpStatus: FollowUpStatus;
  notes: string;
  photoUrl: string;
  photoPublicId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GuestDTO = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  details: string;
  preferredRole: string;
  visitDate: string;
  followUpStatus: FollowUpStatus;
  notes: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeGuest(g: LeanGuest): GuestDTO {
  return {
    id: String(g._id),
    fullName: g.fullName,
    email: g.email ?? "",
    phone: g.phone ?? "",
    whatsapp: g.whatsapp ?? "",
    whatsappSameAsPhone: g.whatsappSameAsPhone ?? true,
    details: g.details ?? "",
    preferredRole: g.preferredRole ?? "",
    visitDate: g.visitDate instanceof Date ? g.visitDate.toISOString() : String(g.visitDate),
    followUpStatus: g.followUpStatus,
    notes: g.notes ?? "",
    photoUrl: g.photoUrl ?? "",
    createdAt: g.createdAt instanceof Date ? g.createdAt.toISOString() : String(g.createdAt),
    updatedAt: g.updatedAt instanceof Date ? g.updatedAt.toISOString() : String(g.updatedAt),
  };
}

// ── Transaction ──────────────────────────────────────────────────────────────

export type LeanTransaction = {
  _id: unknown;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  date: Date;
  memberId?: unknown;
  memberName?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionDTO = {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  memberId: string;
  memberName: string;
  receiptUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type FundSummaryDTO = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
};

// ── Task ─────────────────────────────────────────────────────────────────────

export type LeanTask = {
  _id: unknown;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedMemberId: string;
  assignedMemberName: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskDTO = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedMemberId: string;
  assignedMemberName: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeTask(t: LeanTask): TaskDTO {
  return {
    id: String(t._id),
    title: t.title,
    description: t.description ?? "",
    priority: t.priority,
    status: t.status,
    assignedMemberId: t.assignedMemberId ?? "",
    assignedMemberName: t.assignedMemberName ?? "",
    dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : (t.dueDate ? String(t.dueDate) : ""),
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : String(t.updatedAt),
  };
}

// ── Event ─────────────────────────────────────────────────────────────────────

export type AttendeeDTO = {
  name: string;
  email: string;
  phone: string;
  guestId: string;
  notes: string;
};

export type SpeakerDTO = {
  name: string;
  speechTitle: string;
  speechProject: string;
  speechLevel: string;
  duration: number;
  notes: string;
  evaluatorName: string;
};

export type WordOfDayDTO = {
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
};

export type ResourceDTO = {
  title: string;
  description: string;
};

export type TableTopicQuestionDTO = {
  text: string;
  completed: boolean;
};

export type AhCountDTO = { word: string; count: number };
export type AhCounterEntryDTO = { timerId: string; name: string; counts: AhCountDTO[] };

export type TimerCategory = "preparedSpeaker" | "iceBreaker" | "tableTopic" | "preparedEvaluator" | "tableTopicEvaluator" | "generalEvaluator";
export type TimerStatus = "idle" | "paused" | "stopped";

export type TimerEntryDTO = {
  id: string;
  label: string;
  category: TimerCategory;
  speakerIndex?: number;
  elapsed: number;
  status: TimerStatus;
};

export type EventRolesDTO = {
  president: string;
  sergeantAtArms: string;
  toastmaster: string;
  generalEvaluator: string;
  tableTopicMaster: string;
  tableTopicEvaluator: string;
  ahCounter: string;
  timer: string;
  grammarian: string;
};

export type LeanEvent = {
  _id: unknown;
  title: string;
  meetingNumber: number;
  date: Date;
  startTime: string;
  theme: string;
  venue: string;
  isTemplate: boolean;
  templateName: string;
  roles: EventRolesDTO;
  speakers: SpeakerDTO[];
  wordOfDay: WordOfDayDTO;
  joinUrl: string;
  tableTopicQuestions: (string | { text?: string; completed?: boolean })[];
  attendees: AttendeeDTO[];
  resources: ResourceDTO[];
  timerEntries: TimerEntryDTO[];
  fillerWords: string[];
  ahCounterReport: { timerId?: string; name?: string; counts?: { word?: string; count?: number }[] }[];
  createdAt: Date;
  updatedAt: Date;
};

export type EventDTO = {
  id: string;
  title: string;
  meetingNumber: number;
  date: string;
  startTime: string;
  theme: string;
  venue: string;
  isTemplate: boolean;
  templateName: string;
  roles: EventRolesDTO;
  speakers: SpeakerDTO[];
  wordOfDay: WordOfDayDTO;
  joinUrl: string;
  tableTopicQuestions: TableTopicQuestionDTO[];
  attendees: AttendeeDTO[];
  resources: ResourceDTO[];
  timerEntries: TimerEntryDTO[];
  fillerWords: string[];
  ahCounterReport: AhCounterEntryDTO[];
  createdAt: string;
  updatedAt: string;
};

function serializeRoles(r: Partial<EventRolesDTO> | undefined): EventRolesDTO {
  return {
    president: r?.president ?? "",
    sergeantAtArms: r?.sergeantAtArms ?? "",
    toastmaster: r?.toastmaster ?? "",
    generalEvaluator: r?.generalEvaluator ?? "",
    tableTopicMaster: r?.tableTopicMaster ?? "",
    tableTopicEvaluator: r?.tableTopicEvaluator ?? "",
    ahCounter: r?.ahCounter ?? "",
    timer: r?.timer ?? "",
    grammarian: r?.grammarian ?? "",
  };
}

function serializeSpeaker(s: Partial<SpeakerDTO>): SpeakerDTO {
  return {
    name: s?.name ?? "",
    speechTitle: s?.speechTitle ?? "",
    speechProject: s?.speechProject ?? "",
    speechLevel: s?.speechLevel ?? "",
    duration: s?.duration ?? 7,
    notes: s?.notes ?? "",
    evaluatorName: s?.evaluatorName ?? "",
  };
}

function serializeWordOfDay(w: Partial<WordOfDayDTO> | undefined): WordOfDayDTO {
  return {
    word: w?.word ?? "",
    partOfSpeech: w?.partOfSpeech ?? "",
    meaning: w?.meaning ?? "",
    example: w?.example ?? "",
  };
}

export function serializeEvent(e: LeanEvent): EventDTO {
  return {
    id: String(e._id),
    title: e.title ?? "",
    meetingNumber: e.meetingNumber ?? 0,
    date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
    startTime: e.startTime ?? "18:00",
    theme: e.theme ?? "",
    venue: e.venue ?? "",
    isTemplate: e.isTemplate ?? false,
    templateName: e.templateName ?? "",
    roles: serializeRoles(e.roles),
    speakers: (e.speakers ?? []).map(serializeSpeaker),
    wordOfDay: serializeWordOfDay(e.wordOfDay),
    joinUrl: e.joinUrl ?? "",
    tableTopicQuestions: (e.tableTopicQuestions ?? []).map((q) =>
      typeof q === "string"
        ? { text: q, completed: false }
        : { text: q?.text ?? "", completed: q?.completed ?? false }
    ),
    attendees: (e.attendees ?? []).map((a) => ({
      name: a?.name ?? "",
      email: a?.email ?? "",
      phone: a?.phone ?? "",
      guestId: a?.guestId ?? "",
      notes: a?.notes ?? "",
    })),
    resources: (e.resources ?? []).map((r) => ({
      title: r?.title ?? "",
      description: r?.description ?? "",
    })),
    timerEntries: (e.timerEntries ?? []).map((t) => ({
      id: t?.id ?? "",
      label: t?.label ?? "",
      category: (t?.category ?? "tableTopic") as TimerCategory,
      speakerIndex: t?.speakerIndex,
      elapsed: t?.elapsed ?? 0,
      status: (t?.status ?? "idle") as TimerStatus,
    })),
    fillerWords: (e.fillerWords ?? []).length > 0 ? (e.fillerWords ?? []) : ["Ah", "Um", "So", "Like"],
    ahCounterReport: (e.ahCounterReport ?? []).map((entry) => ({
      timerId: entry?.timerId ?? "",
      name: entry?.name ?? "",
      counts: (entry?.counts ?? []).map((c) => ({ word: c?.word ?? "", count: c?.count ?? 0 })),
    })),
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : String(e.updatedAt),
  };
}

// ── Planner ───────────────────────────────────────────────────────────────────

export type LeanPlannerRow = {
  _id: unknown;
  date: Date;
  tmod: string;
  ttm: string;
  tableTopicEvaluator: string;
  preparedSpeaker1: string;
  preparedEvaluator1: string;
  preparedSpeaker2: string;
  preparedEvaluator2: string;
  preparedSpeaker3: string;
  preparedEvaluator3: string;
  generalEvaluator: string;
  timer: string;
  ahCounter: string;
  grammarian: string;
  theme: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PlannerRowDTO = {
  id: string;
  date: string;
  tmod: string;
  ttm: string;
  tableTopicEvaluator: string;
  preparedSpeaker1: string;
  preparedEvaluator1: string;
  preparedSpeaker2: string;
  preparedEvaluator2: string;
  preparedSpeaker3: string;
  preparedEvaluator3: string;
  generalEvaluator: string;
  timer: string;
  ahCounter: string;
  grammarian: string;
  theme: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export function serializePlannerRow(p: LeanPlannerRow): PlannerRowDTO {
  return {
    id: String(p._id),
    date: p.date instanceof Date ? p.date.toISOString() : String(p.date),
    tmod: p.tmod ?? "",
    ttm: p.ttm ?? "",
    tableTopicEvaluator: p.tableTopicEvaluator ?? "",
    preparedSpeaker1: p.preparedSpeaker1 ?? "",
    preparedEvaluator1: p.preparedEvaluator1 ?? "",
    preparedSpeaker2: p.preparedSpeaker2 ?? "",
    preparedEvaluator2: p.preparedEvaluator2 ?? "",
    preparedSpeaker3: p.preparedSpeaker3 ?? "",
    preparedEvaluator3: p.preparedEvaluator3 ?? "",
    generalEvaluator: p.generalEvaluator ?? "",
    timer: p.timer ?? "",
    ahCounter: p.ahCounter ?? "",
    grammarian: p.grammarian ?? "",
    theme: p.theme ?? "",
    notes: p.notes ?? "",
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
  };
}

export function serializeTransaction(t: LeanTransaction): TransactionDTO {
  return {
    id: String(t._id),
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description ?? "",
    date: t.date instanceof Date ? t.date.toISOString() : String(t.date),
    memberId: t.memberId ? String(t.memberId) : "",
    memberName: t.memberName ?? "",
    receiptUrl: t.receiptUrl ?? "",
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : String(t.updatedAt),
  };
}

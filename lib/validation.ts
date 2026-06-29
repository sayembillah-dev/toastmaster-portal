import { z } from "zod";
import { CLUB_ROLES, MEMBER_STATUSES } from "@/lib/memberConstants";
import { FOLLOW_UP_STATUSES } from "@/lib/guestConstants";
import { TRANSACTION_TYPES, ALL_CATEGORIES } from "@/lib/fundConstants";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/taskConstants";

export const memberSchema = z.object({
  fullName: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().optional().or(z.literal("")),
  phone: z.string().max(20).trim().optional().or(z.literal("")),
  membershipNumber: z.string().max(20).trim().optional().or(z.literal("")),
  joinDate: z.string().min(1, "Join date is required"),
  status: z.enum(MEMBER_STATUSES),
  clubRole: z.enum(CLUB_ROLES),
  bio: z.string().max(1000).trim().optional().or(z.literal("")),
});

export const memberUpdateSchema = memberSchema.partial();

export type MemberInput = z.infer<typeof memberSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;

export const guestSchema = z.object({
  fullName: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().optional().or(z.literal("")),
  phone: z.string().max(20).trim().optional().or(z.literal("")),
  whatsapp: z.string().max(20).trim().optional().or(z.literal("")),
  whatsappSameAsPhone: z.boolean(),
  details: z.string().max(2000).trim().optional().or(z.literal("")),
  preferredRole: z.string().max(80).trim().optional().or(z.literal("")),
  visitDate: z.string().min(1, "Visit date is required"),
  followUpStatus: z.enum(FOLLOW_UP_STATUSES),
  notes: z.string().max(1000).trim().optional().or(z.literal("")),
});

export const guestUpdateSchema = guestSchema.partial();

export type GuestInput = z.infer<typeof guestSchema>;
export type GuestUpdateInput = z.infer<typeof guestUpdateSchema>;

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  category: z.enum(ALL_CATEGORIES),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().max(500).trim().optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  memberId: z.string().optional().or(z.literal("")),
  memberName: z.string().max(80).trim().optional().or(z.literal("")),
});

export const transactionUpdateSchema = transactionSchema.partial();

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(2000).trim().optional().or(z.literal("")),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  assignedMemberId: z.string().optional().or(z.literal("")),
  assignedMemberName: z.string().max(80).trim().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export const taskUpdateSchema = taskSchema.partial();

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

// ── Event ─────────────────────────────────────────────────────────────────────

const attendeeSchema = z.object({
  name: z.string().min(1).max(80).trim(),
  email: z.string().max(120).trim().optional().or(z.literal("")),
  phone: z.string().max(20).trim().optional().or(z.literal("")),
  guestId: z.string().optional().or(z.literal("")),
  notes: z.string().max(300).trim().optional().or(z.literal("")),
});

export type AttendeeInput = z.infer<typeof attendeeSchema>;

const speakerSchema = z.object({
  name: z.string().max(80).trim().optional().or(z.literal("")),
  speechTitle: z.string().max(200).trim().optional().or(z.literal("")),
  speechProject: z.string().max(100).trim().optional().or(z.literal("")),
  speechLevel: z.string().max(20).trim().optional().or(z.literal("")),
  duration: z.number().min(1).max(30).default(7),
  notes: z.string().max(200).trim().optional().or(z.literal("")),
  evaluatorName: z.string().max(80).trim().optional().or(z.literal("")),
});

const resourceSchema = z.object({
  title: z.string().max(200).trim().optional().or(z.literal("")),
  description: z.string().max(2000).trim().optional().or(z.literal("")),
});

const wordOfDaySchema = z.object({
  word: z.string().max(80).trim().optional().or(z.literal("")),
  partOfSpeech: z.string().max(30).trim().optional().or(z.literal("")),
  meaning: z.string().max(500).trim().optional().or(z.literal("")),
  example: z.string().max(500).trim().optional().or(z.literal("")),
});

const rolesSchema = z.object({
  president: z.string().max(80).trim().optional().or(z.literal("")),
  sergeantAtArms: z.string().max(80).trim().optional().or(z.literal("")),
  toastmaster: z.string().max(80).trim().optional().or(z.literal("")),
  generalEvaluator: z.string().max(80).trim().optional().or(z.literal("")),
  tableTopicMaster: z.string().max(80).trim().optional().or(z.literal("")),
  tableTopicEvaluator: z.string().max(80).trim().optional().or(z.literal("")),
  ahCounter: z.string().max(80).trim().optional().or(z.literal("")),
  timer: z.string().max(80).trim().optional().or(z.literal("")),
  grammarian: z.string().max(80).trim().optional().or(z.literal("")),
});

const ahCountSchema = z.object({
  word: z.string().max(50).trim(),
  count: z.number().int().min(0).default(0),
});

const ahCounterEntrySchema = z.object({
  timerId: z.string().max(100).default(""),
  name: z.string().max(80).trim().default(""),
  counts: z.array(ahCountSchema).default([]),
});

const TIMER_CATEGORIES = ["preparedSpeaker", "iceBreaker", "tableTopic", "preparedEvaluator", "tableTopicEvaluator", "generalEvaluator"] as const;
const TIMER_STATUSES = ["idle", "paused", "stopped"] as const;

const timerEntrySchema = z.object({
  id: z.string().max(100),
  label: z.string().max(200).trim(),
  category: z.enum(TIMER_CATEGORIES),
  speakerIndex: z.number().optional(),
  elapsed: z.number().min(0).default(0),
  status: z.enum(TIMER_STATUSES).default("idle"),
});

export const eventSchema = z.object({
  title: z.string().max(200).trim().optional().or(z.literal("")),
  meetingNumber: z.number().min(0).default(0),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format").default("18:00"),
  theme: z.string().max(200).trim().optional().or(z.literal("")),
  venue: z.string().max(200).trim().optional().or(z.literal("")),
  isTemplate: z.boolean().default(false),
  templateName: z.string().max(100).trim().optional().or(z.literal("")),
  roles: rolesSchema.optional().default({}),
  speakers: z.array(speakerSchema).max(3).default([]),
  wordOfDay: wordOfDaySchema.optional().default({}),
  tableTopicQuestions: z
    .array(
      z.preprocess(
        (q) => (typeof q === "string" ? { text: q, completed: false } : q),
        z.object({
          text: z.string().max(500).trim().default(""),
          completed: z.boolean().default(false),
        }),
      ),
    )
    .max(10)
    .default([]),
  joinUrl: z.string().max(500).trim().optional().or(z.literal("")),
  attendees: z.array(attendeeSchema).default([]),
  resources: z.array(resourceSchema).default([]),
  timerEntries: z.array(timerEntrySchema).default([]),
  fillerWords: z.array(z.string().max(50).trim()).max(20).default(["Ah", "Um", "So", "Like"]),
  ahCounterReport: z.array(ahCounterEntrySchema).default([]),
});

export const eventUpdateSchema = eventSchema.partial();

export type EventInput = z.infer<typeof eventSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

// ── Planner ───────────────────────────────────────────────────────────────────

export const plannerRowSchema = z.object({
  date: z.string().min(1, "Date is required"),
  tmod: z.string().max(80).trim().optional().or(z.literal("")),
  ttm: z.string().max(80).trim().optional().or(z.literal("")),
  tableTopicEvaluator: z.string().max(80).trim().optional().or(z.literal("")),
  preparedSpeaker1: z.string().max(80).trim().optional().or(z.literal("")),
  preparedEvaluator1: z.string().max(80).trim().optional().or(z.literal("")),
  preparedSpeaker2: z.string().max(80).trim().optional().or(z.literal("")),
  preparedEvaluator2: z.string().max(80).trim().optional().or(z.literal("")),
  preparedSpeaker3: z.string().max(80).trim().optional().or(z.literal("")),
  preparedEvaluator3: z.string().max(80).trim().optional().or(z.literal("")),
  generalEvaluator: z.string().max(80).trim().optional().or(z.literal("")),
  timer: z.string().max(80).trim().optional().or(z.literal("")),
  ahCounter: z.string().max(80).trim().optional().or(z.literal("")),
  grammarian: z.string().max(80).trim().optional().or(z.literal("")),
  theme: z.string().max(200).trim().optional().or(z.literal("")),
  notes: z.string().max(1000).trim().optional().or(z.literal("")),
});

export const plannerRowUpdateSchema = plannerRowSchema.partial();

export type PlannerRowInput = z.infer<typeof plannerRowSchema>;
export type PlannerRowUpdateInput = z.infer<typeof plannerRowUpdateSchema>;

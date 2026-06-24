import mongoose, { Schema, Document } from "mongoose";
import type { AgendaRoleKey } from "@/lib/eventConstants";

interface IEventAttendee {
  name: string;
  email: string;
  phone: string;
  guestId: string;
  notes: string;
}

interface ISpeaker {
  name: string;
  speechTitle: string;
  speechProject: string;
  speechLevel: string;
  duration: number;
  notes: string;
  evaluatorName: string;
}

interface IWordOfDay {
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

interface ITableTopicQuestion {
  text: string;
  completed: boolean;
}

interface IAhCounterCount {
  word: string;
  count: number;
}

interface IAhCounterEntry {
  timerId: string;
  name: string;
  counts: IAhCounterCount[];
}

interface IResource {
  title: string;
  description: string;
}

interface ITimerEntry {
  id: string;
  label: string;
  category: "preparedSpeaker" | "iceBreaker" | "tableTopic" | "preparedEvaluator" | "tableTopicEvaluator" | "generalEvaluator";
  speakerIndex?: number;
  elapsed: number;
  status: "idle" | "paused" | "stopped";
}

interface IEvent extends Document {
  fillerWords: string[];
  ahCounterReport: IAhCounterEntry[];
  title: string;
  meetingNumber: number;
  date: Date;
  startTime: string;
  theme: string;
  venue: string;
  isTemplate: boolean;
  templateName: string;
  roles: Record<AgendaRoleKey, string>;
  speakers: ISpeaker[];
  wordOfDay: IWordOfDay;
  joinUrl: string;
  tableTopicQuestions: ITableTopicQuestion[];
  attendees: IEventAttendee[];
  resources: IResource[];
  timerEntries: ITimerEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendeeSchema = new Schema<IEventAttendee>(
  {
    name: { type: String, trim: true, maxlength: 80, default: "" },
    email: { type: String, trim: true, maxlength: 120, default: "" },
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    guestId: { type: String, default: "" },
    notes: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { _id: false },
);

const SpeakerSchema = new Schema<ISpeaker>(
  {
    name: { type: String, trim: true, maxlength: 80, default: "" },
    speechTitle: { type: String, trim: true, maxlength: 200, default: "" },
    speechProject: { type: String, trim: true, maxlength: 100, default: "" },
    speechLevel: { type: String, trim: true, maxlength: 20, default: "" },
    duration: { type: Number, default: 7, min: 1, max: 30 },
    notes: { type: String, trim: true, maxlength: 200, default: "" },
    evaluatorName: { type: String, trim: true, maxlength: 80, default: "" },
  },
  { _id: false },
);

const TimerEntrySchema = new Schema<ITimerEntry>(
  {
    id: { type: String, default: "" },
    label: { type: String, trim: true, maxlength: 200, default: "" },
    category: { type: String, trim: true, maxlength: 40, default: "tableTopic" },
    speakerIndex: { type: Number },
    elapsed: { type: Number, default: 0, min: 0 },
    status: { type: String, trim: true, maxlength: 20, default: "idle" },
  },
  { _id: false },
);

const AhCounterCountSchema = new Schema<IAhCounterCount>(
  {
    word: { type: String, trim: true, maxlength: 50, default: "" },
    count: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const AhCounterEntrySchema = new Schema<IAhCounterEntry>(
  {
    timerId: { type: String, default: "" },
    name: { type: String, trim: true, maxlength: 80, default: "" },
    counts: { type: [AhCounterCountSchema], default: [] },
  },
  { _id: false },
);

const TableTopicQuestionSchema = new Schema<ITableTopicQuestion>(
  {
    text: { type: String, trim: true, maxlength: 500, default: "" },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, trim: true, maxlength: 200, default: "" },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { _id: false },
);

const WordOfDaySchema = new Schema<IWordOfDay>(
  {
    word: { type: String, trim: true, maxlength: 80, default: "" },
    partOfSpeech: { type: String, trim: true, maxlength: 30, default: "" },
    meaning: { type: String, trim: true, maxlength: 500, default: "" },
    example: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: false },
);

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, trim: true, maxlength: 200, default: "" },
    meetingNumber: { type: Number, default: 0 },
    date: { type: Date, required: true },
    startTime: { type: String, trim: true, maxlength: 5, default: "18:00" },
    theme: { type: String, trim: true, maxlength: 200, default: "" },
    venue: { type: String, trim: true, maxlength: 200, default: "" },
    isTemplate: { type: Boolean, default: false },
    templateName: { type: String, trim: true, maxlength: 100, default: "" },
    roles: {
      president: { type: String, trim: true, maxlength: 80, default: "" },
      sergeantAtArms: { type: String, trim: true, maxlength: 80, default: "" },
      toastmaster: { type: String, trim: true, maxlength: 80, default: "" },
      generalEvaluator: { type: String, trim: true, maxlength: 80, default: "" },
      tableTopicMaster: { type: String, trim: true, maxlength: 80, default: "" },
      tableTopicEvaluator: { type: String, trim: true, maxlength: 80, default: "" },
      ahCounter: { type: String, trim: true, maxlength: 80, default: "" },
      timer: { type: String, trim: true, maxlength: 80, default: "" },
      grammarian: { type: String, trim: true, maxlength: 80, default: "" },
    },
    speakers: { type: [SpeakerSchema], default: [] },
    wordOfDay: { type: WordOfDaySchema, default: () => ({}) },
    joinUrl: { type: String, trim: true, maxlength: 500, default: "" },
    tableTopicQuestions: { type: [TableTopicQuestionSchema], default: [] },
    attendees: { type: [AttendeeSchema], default: [] },
    resources: { type: [ResourceSchema], default: [] },
    timerEntries: { type: [TimerEntrySchema], default: [] },
    fillerWords: { type: [String], default: ["Ah", "Um", "So", "Like"] },
    ahCounterReport: { type: [AhCounterEntrySchema], default: [] },
  },
  { timestamps: true },
);

EventSchema.index({ date: -1 });
EventSchema.index({ isTemplate: 1 });
EventSchema.index({ meetingNumber: 1 });

// In dev, HMR re-evaluates modules but Mongoose caches the old model on the connection.
// Delete the stale model so schema changes (like this one) take effect without a full restart.
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Event;
}

export const Event = mongoose.models.Event ?? mongoose.model<IEvent>("Event", EventSchema);

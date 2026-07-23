import mongoose, { Schema, type Document } from "mongoose";

interface IMotionVote {
  for: number;
  against: number;
  abstain: number;
}

export interface IMotion {
  text: string;
  proposedBy: string;
  secondedBy: string;
  objections: string[];
  votes: IMotionVote;
  resolution: "passed" | "rejected" | "tabled";
}

export interface IExecMeeting extends Document {
  clubId: mongoose.Types.ObjectId;
  termId?: mongoose.Types.ObjectId;
  date: Date;
  title: string;
  attendees: string[];
  motions: IMotion[];
  minutesMarkdown: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MotionVoteSchema = new Schema<IMotionVote>(
  {
    for:     { type: Number, default: 0, min: 0 },
    against: { type: Number, default: 0, min: 0 },
    abstain: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const MotionSchema = new Schema<IMotion>(
  {
    text:        { type: String, trim: true, maxlength: 2000, default: "" },
    proposedBy:  { type: String, trim: true, maxlength: 80, default: "" },
    secondedBy:  { type: String, trim: true, maxlength: 80, default: "" },
    objections:  { type: [String], default: [] },
    votes:       { type: MotionVoteSchema, default: () => ({}) },
    resolution:  { type: String, enum: ["passed", "rejected", "tabled"], default: "tabled" },
  },
  { _id: false },
);

const ExecMeetingSchema = new Schema<IExecMeeting>(
  {
    clubId:          { type: Schema.Types.ObjectId, ref: "Club", required: true },
    termId:          { type: Schema.Types.ObjectId, ref: "OfficerTerm" },
    date:            { type: Date, required: true },
    title:           { type: String, trim: true, maxlength: 200, default: "" },
    attendees:       { type: [String], default: [] },
    motions:         { type: [MotionSchema], default: [] },
    minutesMarkdown: { type: String, default: "" },
    publishedAt:     { type: Date },
  },
  { timestamps: true },
);

ExecMeetingSchema.index({ clubId: 1, date: -1 });
ExecMeetingSchema.index({ termId: 1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).ExecMeeting;
}

export const ExecMeeting =
  mongoose.models.ExecMeeting ??
  mongoose.model<IExecMeeting>("ExecMeeting", ExecMeetingSchema);

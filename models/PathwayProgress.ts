import mongoose, { Schema, type Document } from "mongoose";

export interface ILevelCompletion {
  levelName: string;
  completedAt: Date;
}

export interface ISpeechRecord {
  speechTitle: string;
  project: string;
  level: string;
  eventId?: mongoose.Types.ObjectId;
  date: Date;
  evaluatorName: string;
  notes: string;
}

export interface IPathwayProgress extends Document {
  clubId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  pathwayName: string;
  currentLevel: string;
  startDate: Date;
  levelCompletions: ILevelCompletion[];
  speechRecords: ISpeechRecord[];
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LevelCompletionSchema = new Schema<ILevelCompletion>(
  {
    levelName:   { type: String, trim: true, maxlength: 100, default: "" },
    completedAt: { type: Date, required: true },
  },
  { _id: false },
);

const SpeechRecordSchema = new Schema<ISpeechRecord>(
  {
    speechTitle:   { type: String, trim: true, maxlength: 200, default: "" },
    project:       { type: String, trim: true, maxlength: 200, default: "" },
    level:         { type: String, trim: true, maxlength: 50, default: "" },
    eventId:       { type: Schema.Types.ObjectId, ref: "Event" },
    date:          { type: Date, required: true },
    evaluatorName: { type: String, trim: true, maxlength: 80, default: "" },
    notes:         { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: false },
);

const PathwayProgressSchema = new Schema<IPathwayProgress>(
  {
    clubId:           { type: Schema.Types.ObjectId, ref: "Club", required: true },
    memberId:         { type: Schema.Types.ObjectId, ref: "Member", required: true },
    pathwayName:      { type: String, required: true, trim: true, maxlength: 100 },
    currentLevel:     { type: String, trim: true, maxlength: 50, default: "Level 1" },
    startDate:        { type: Date, required: true },
    levelCompletions: { type: [LevelCompletionSchema], default: [] },
    speechRecords:    { type: [SpeechRecordSchema], default: [] },
    isCompleted:      { type: Boolean, default: false },
    completedAt:      { type: Date },
  },
  { timestamps: true },
);

PathwayProgressSchema.index({ clubId: 1, memberId: 1 });
PathwayProgressSchema.index({ memberId: 1, isCompleted: 1 });

export const PathwayProgress =
  mongoose.models.PathwayProgress ??
  mongoose.model<IPathwayProgress>("PathwayProgress", PathwayProgressSchema);

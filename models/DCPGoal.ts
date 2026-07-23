import mongoose, { Schema, type Document } from "mongoose";
import { DCP_GOAL_TYPES, type DCPGoalType } from "@/lib/dcpConstants";

export { DCP_GOAL_TYPES };
export type { DCPGoalType };

export interface IDCPGoal extends Document {
  clubId: mongoose.Types.ObjectId;
  termYear: string;
  goalType: DCPGoalType;
  description: string;
  targetValue: number;
  currentValue: number;
  isAchieved: boolean;
  achievedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DCPGoalSchema = new Schema<IDCPGoal>(
  {
    clubId:       { type: Schema.Types.ObjectId, ref: "Club", required: true },
    termYear:     { type: String, required: true, trim: true, maxlength: 20 },
    goalType:     { type: String, enum: DCP_GOAL_TYPES, required: true },
    description:  { type: String, trim: true, maxlength: 500, default: "" },
    targetValue:  { type: Number, default: 1, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    isAchieved:   { type: Boolean, default: false },
    achievedAt:   { type: Date },
  },
  { timestamps: true },
);

DCPGoalSchema.index({ clubId: 1, termYear: 1 });
DCPGoalSchema.index({ clubId: 1, isAchieved: 1 });

export const DCPGoal =
  mongoose.models.DCPGoal ??
  mongoose.model<IDCPGoal>("DCPGoal", DCPGoalSchema);

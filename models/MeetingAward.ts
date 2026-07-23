import mongoose, { Schema, type Document } from "mongoose";
import { AWARD_CATEGORIES, type AwardCategory } from "@/lib/awardConstants";

export { AWARD_CATEGORIES };
export type { AwardCategory };

export interface IVote {
  voterId: mongoose.Types.ObjectId;
  nomineeId: mongoose.Types.ObjectId;
  nomineeName: string;
}

export interface IMeetingAward extends Document {
  clubId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  category: AwardCategory;
  votes: IVote[];
  winnerId?: mongoose.Types.ObjectId;
  winnerName?: string;
  isFinalized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    voterId:     { type: Schema.Types.ObjectId, ref: "Member", required: true },
    nomineeId:   { type: Schema.Types.ObjectId, ref: "Member", required: true },
    nomineeName: { type: String, trim: true, maxlength: 80, default: "" },
  },
  { _id: false },
);

const MeetingAwardSchema = new Schema<IMeetingAward>(
  {
    clubId:      { type: Schema.Types.ObjectId, ref: "Club", required: true },
    eventId:     { type: Schema.Types.ObjectId, ref: "Event", required: true },
    category:    { type: String, enum: AWARD_CATEGORIES, required: true },
    votes:       { type: [VoteSchema], default: [] },
    winnerId:    { type: Schema.Types.ObjectId, ref: "Member" },
    winnerName:  { type: String, trim: true, maxlength: 80, default: "" },
    isFinalized: { type: Boolean, default: false },
  },
  { timestamps: true },
);

MeetingAwardSchema.index({ clubId: 1, eventId: 1 });
MeetingAwardSchema.index({ eventId: 1, category: 1 }, { unique: true });

export const MeetingAward =
  mongoose.models.MeetingAward ??
  mongoose.model<IMeetingAward>("MeetingAward", MeetingAwardSchema);

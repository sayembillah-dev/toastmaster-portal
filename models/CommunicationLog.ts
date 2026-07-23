import mongoose, { Schema, type Document } from "mongoose";
import {
  COMM_CHANNELS,
  COMM_OUTCOMES,
  type CommChannel,
  type CommOutcome,
} from "@/lib/commLogConstants";

export { COMM_CHANNELS, COMM_OUTCOMES };
export type { CommChannel, CommOutcome };

export interface ICommunicationLog extends Document {
  clubId: mongoose.Types.ObjectId;
  guestId: mongoose.Types.ObjectId;
  contactedById: mongoose.Types.ObjectId;
  contactedByName: string;
  channel: CommChannel;
  outcome: CommOutcome;
  notes: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationLogSchema = new Schema<ICommunicationLog>(
  {
    clubId:          { type: Schema.Types.ObjectId, ref: "Club", required: true },
    guestId:         { type: Schema.Types.ObjectId, ref: "Guest", required: true },
    contactedById:   { type: Schema.Types.ObjectId, ref: "Member", required: true },
    contactedByName: { type: String, trim: true, maxlength: 80, default: "" },
    channel:         { type: String, enum: COMM_CHANNELS, required: true },
    outcome:         { type: String, enum: COMM_OUTCOMES, required: true },
    notes:           { type: String, trim: true, maxlength: 1000, default: "" },
    followUpDate:    { type: Date },
  },
  { timestamps: true },
);

CommunicationLogSchema.index({ clubId: 1, guestId: 1 });
CommunicationLogSchema.index({ guestId: 1, createdAt: -1 });

export const CommunicationLog =
  mongoose.models.CommunicationLog ??
  mongoose.model<ICommunicationLog>("CommunicationLog", CommunicationLogSchema);

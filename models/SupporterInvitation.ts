import mongoose, { Schema, type Document } from "mongoose";
import { INVITATION_STATUSES, type InvitationStatus } from "@/lib/retentionConstants";

export { INVITATION_STATUSES };
export type { InvitationStatus };

export interface ISupporterInvitation extends Document {
  clubId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  supporterId: mongoose.Types.ObjectId;
  invitedById: mongoose.Types.ObjectId;
  invitedByName: string;
  status: InvitationStatus;
  distanceKm?: number;
  message: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupporterInvitationSchema = new Schema<ISupporterInvitation>(
  {
    clubId:        { type: Schema.Types.ObjectId, ref: "Club", required: true },
    eventId:       { type: Schema.Types.ObjectId, ref: "Event", required: true },
    supporterId:   { type: Schema.Types.ObjectId, ref: "EliteSupporter", required: true },
    invitedById:   { type: Schema.Types.ObjectId, ref: "Member", required: true },
    invitedByName: { type: String, trim: true, maxlength: 80, default: "" },
    status:        { type: String, enum: INVITATION_STATUSES, default: "pending" },
    distanceKm:    { type: Number, min: 0 },
    message:       { type: String, trim: true, maxlength: 1000, default: "" },
    respondedAt:   { type: Date },
  },
  { timestamps: true },
);

SupporterInvitationSchema.index({ clubId: 1, eventId: 1 });
SupporterInvitationSchema.index({ supporterId: 1, status: 1 });

export const SupporterInvitation =
  mongoose.models.SupporterInvitation ??
  mongoose.model<ISupporterInvitation>("SupporterInvitation", SupporterInvitationSchema);

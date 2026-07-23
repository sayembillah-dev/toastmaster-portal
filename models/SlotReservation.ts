import mongoose, { Schema, type Document } from "mongoose";
import { SLOT_STATUSES, SLOT_TYPES, type SlotStatus, type SlotType } from "@/lib/slotConstants";

export { SLOT_STATUSES, SLOT_TYPES };
export type { SlotStatus, SlotType };

export interface ISlotReservation extends Document {
  clubId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  slotType: SlotType;
  speechProject?: string;
  speechPathway?: string;
  status: SlotStatus;
  reviewedById?: mongoose.Types.ObjectId;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SlotReservationSchema = new Schema<ISlotReservation>(
  {
    clubId:       { type: Schema.Types.ObjectId, ref: "Club", required: true },
    eventId:      { type: Schema.Types.ObjectId, ref: "Event", required: true },
    memberId:     { type: Schema.Types.ObjectId, ref: "Member", required: true },
    memberName:   { type: String, trim: true, maxlength: 80, default: "" },
    slotType:     { type: String, enum: SLOT_TYPES, required: true },
    speechProject: { type: String, trim: true, maxlength: 200, default: "" },
    speechPathway: { type: String, trim: true, maxlength: 100, default: "" },
    status:        { type: String, enum: SLOT_STATUSES, default: "requested" },
    reviewedById:  { type: Schema.Types.ObjectId, ref: "Member" },
    reviewNote:    { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true },
);

SlotReservationSchema.index({ clubId: 1, eventId: 1 });
SlotReservationSchema.index({ memberId: 1, status: 1 });
SlotReservationSchema.index({ clubId: 1, status: 1 });

export const SlotReservation =
  mongoose.models.SlotReservation ??
  mongoose.model<ISlotReservation>("SlotReservation", SlotReservationSchema);

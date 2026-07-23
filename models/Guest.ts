import mongoose, { Schema, type Document } from "mongoose";
import { FOLLOW_UP_STATUSES, type FollowUpStatus } from "@/lib/guestConstants";

export { FOLLOW_UP_STATUSES };
export type { FollowUpStatus };

export interface IGuest extends Document {
  clubId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  details: string;
  preferredRole: string;
  visitDate: Date;
  followUpStatus: FollowUpStatus;
  notes: string;
  photoUrl: string;
  photoPublicId: string;
  sponsorId?: mongoose.Types.ObjectId;
  sponsorName?: string;
  visitCount: number;
  applicationStatus: "none" | "applied" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuest>(
  {
    clubId:              { type: Schema.Types.ObjectId, ref: "Club", required: true },
    fullName:            { type: String, required: true, trim: true },
    email:               { type: String, lowercase: true, trim: true, default: "" },
    phone:               { type: String, trim: true, default: "" },
    whatsapp:            { type: String, trim: true, default: "" },
    whatsappSameAsPhone: { type: Boolean, default: true },
    details:             { type: String, trim: true, default: "", maxlength: 2000 },
    preferredRole:       { type: String, trim: true, default: "", maxlength: 80 },
    visitDate:           { type: Date, required: true },
    followUpStatus:      { type: String, enum: FOLLOW_UP_STATUSES, default: "new" },
    notes:               { type: String, trim: true, default: "", maxlength: 1000 },
    photoUrl:            { type: String, default: "" },
    photoPublicId:       { type: String, default: "" },
    sponsorId:           { type: Schema.Types.ObjectId, ref: "Member" },
    sponsorName:         { type: String, trim: true, maxlength: 80, default: "" },
    visitCount:          { type: Number, default: 1, min: 1 },
    applicationStatus:   { type: String, enum: ["none", "applied", "approved", "rejected"], default: "none" },
  },
  { timestamps: true },
);

GuestSchema.index({ clubId: 1, fullName: "text", email: "text" });
GuestSchema.index({ clubId: 1, followUpStatus: 1 });

export const Guest =
  mongoose.models.Guest ?? mongoose.model<IGuest>("Guest", GuestSchema);

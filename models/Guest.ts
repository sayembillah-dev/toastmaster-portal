import mongoose, { Schema, type Document } from "mongoose";
import { FOLLOW_UP_STATUSES, type FollowUpStatus } from "@/lib/guestConstants";

export { FOLLOW_UP_STATUSES };
export type { FollowUpStatus };

export interface IGuest extends Document {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  details: string;
  visitDate: Date;
  followUpStatus: FollowUpStatus;
  notes: string;
  photoUrl: string;
  photoPublicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuest>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    whatsappSameAsPhone: { type: Boolean, default: true },
    details: { type: String, trim: true, default: "", maxlength: 2000 },
    visitDate: { type: Date, required: true },
    followUpStatus: { type: String, enum: FOLLOW_UP_STATUSES, default: "new" },
    notes: { type: String, trim: true, default: "", maxlength: 1000 },
    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
  },
  { timestamps: true },
);

GuestSchema.index({ fullName: "text", email: "text" });
GuestSchema.index({ followUpStatus: 1 });

export const Guest =
  mongoose.models.Guest ?? mongoose.model<IGuest>("Guest", GuestSchema);

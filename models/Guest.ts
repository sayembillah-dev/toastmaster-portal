import mongoose, { Schema, type Document } from "mongoose";
import { FOLLOW_UP_STATUSES, COMMUNICATION_CHANNELS, type FollowUpStatus, type CommunicationChannel } from "@/lib/guestConstants";

export { FOLLOW_UP_STATUSES, COMMUNICATION_CHANNELS };
export type { FollowUpStatus, CommunicationChannel };

interface ICommunicationLogEntry {
  channel: CommunicationChannel;
  message: string;
  loggedAt: Date;
}

export interface IGuestAttendanceEntry {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  confirmedAt: Date;
}

export interface IGuest extends Document {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  bio: string;
  linkedinUrl: string;
  preferredRole: string;
  visitDate: Date;
  followUpStatus: FollowUpStatus;
  notes: string;
  photoUrl: string;
  photoPublicId: string;
  communicationLog: ICommunicationLogEntry[];
  attendanceLog: IGuestAttendanceEntry[];
  feePaid: boolean;
  convertedToMemberId: string;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationLogSchema = new Schema<ICommunicationLogEntry>(
  {
    channel: { type: String, enum: COMMUNICATION_CHANNELS, default: "other" },
    message: { type: String, trim: true, maxlength: 500, default: "" },
    loggedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const GuestAttendanceEntrySchema = new Schema<IGuestAttendanceEntry>(
  {
    eventId: { type: String, default: "" },
    eventTitle: { type: String, trim: true, maxlength: 200, default: "" },
    eventDate: { type: Date },
    confirmedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const GuestSchema = new Schema<IGuest>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    whatsappSameAsPhone: { type: Boolean, default: true },
    bio: { type: String, trim: true, default: "", maxlength: 2000 },
    linkedinUrl: { type: String, trim: true, default: "", maxlength: 300 },
    preferredRole: { type: String, trim: true, default: "", maxlength: 80 },
    visitDate: { type: Date, required: true },
    followUpStatus: { type: String, enum: FOLLOW_UP_STATUSES, default: "new" },
    notes: { type: String, trim: true, default: "", maxlength: 1000 },
    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
    communicationLog: { type: [CommunicationLogSchema], default: [] },
    attendanceLog: { type: [GuestAttendanceEntrySchema], default: [] },
    feePaid: { type: Boolean, default: false },
    convertedToMemberId: { type: String, default: "" },
    convertedAt: { type: Date },
  },
  { timestamps: true },
);

GuestSchema.index({ fullName: "text", email: "text" });
GuestSchema.index({ followUpStatus: 1 });

// In dev, HMR re-evaluates modules but Mongoose caches the old model on the connection.
// Delete the stale model so schema changes take effect without a full restart.
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Guest;
}

export const Guest =
  mongoose.models.Guest ?? mongoose.model<IGuest>("Guest", GuestSchema);

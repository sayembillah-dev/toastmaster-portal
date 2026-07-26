import mongoose, { Schema, type Document } from "mongoose";
import { CLUB_ROLES, MEMBER_STATUSES, MEMBER_PAYMENT_STATUSES, ACTIVITY_LOG_TYPES, type ClubRole, type MemberStatus, type MemberPaymentStatus, type ActivityLogType } from "@/lib/memberConstants";

export { CLUB_ROLES, MEMBER_STATUSES, MEMBER_PAYMENT_STATUSES, ACTIVITY_LOG_TYPES };
export type { ClubRole, MemberStatus, MemberPaymentStatus, ActivityLogType };

interface IActivityLogEntry {
  type: ActivityLogType;
  message: string;
  relatedEventId: string;
  occurredAt: Date;
}

export interface IMember extends Document {
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  clubRole: ClubRole;
  paymentStatus: MemberPaymentStatus;
  joinDate: Date;
  bio: string;
  linkedinUrl: string;
  photoUrl: string;
  photoPublicId: string;
  activityLog: IActivityLogEntry[];
  convertedFromGuestId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLogEntry>(
  {
    type: { type: String, enum: ACTIVITY_LOG_TYPES, default: "note" },
    message: { type: String, trim: true, maxlength: 500, default: "" },
    relatedEventId: { type: String, default: "" },
    occurredAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const MemberSchema = new Schema<IMember>(
  {
    membershipNumber: { type: String, trim: true, default: "" },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    status: { type: String, enum: MEMBER_STATUSES, default: "active" },
    clubRole: { type: String, enum: CLUB_ROLES, default: "Member" },
    paymentStatus: { type: String, enum: MEMBER_PAYMENT_STATUSES, default: "unpaid" },
    joinDate: { type: Date, required: true },
    bio: { type: String, trim: true, default: "", maxlength: 1000 },
    linkedinUrl: { type: String, trim: true, default: "", maxlength: 300 },
    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
    activityLog: { type: [ActivityLogSchema], default: [] },
    convertedFromGuestId: { type: String, default: "" },
  },
  { timestamps: true },
);

MemberSchema.index({ membershipNumber: 1 }, { unique: true, sparse: true });
MemberSchema.index({ email: 1 }, { unique: true, sparse: true });
MemberSchema.index({ status: 1, clubRole: 1 });
MemberSchema.index({ fullName: "text", email: "text", membershipNumber: "text" });

// In dev, HMR re-evaluates modules but Mongoose caches the old model on the connection.
// Delete the stale model so schema changes take effect without a full restart.
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Member;
}

export const Member =
  mongoose.models.Member ?? mongoose.model<IMember>("Member", MemberSchema);

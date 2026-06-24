import mongoose, { Schema, type Document } from "mongoose";
import { CLUB_ROLES, MEMBER_STATUSES, type ClubRole, type MemberStatus } from "@/lib/memberConstants";

export { CLUB_ROLES, MEMBER_STATUSES };
export type { ClubRole, MemberStatus };

export interface IMember extends Document {
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  clubRole: ClubRole;
  joinDate: Date;
  bio: string;
  photoUrl: string;
  photoPublicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    membershipNumber: { type: String, trim: true, default: "" },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    status: { type: String, enum: MEMBER_STATUSES, default: "active" },
    clubRole: { type: String, enum: CLUB_ROLES, default: "Member" },
    joinDate: { type: Date, required: true },
    bio: { type: String, trim: true, default: "", maxlength: 1000 },
    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
  },
  { timestamps: true },
);

MemberSchema.index({ membershipNumber: 1 }, { unique: true, sparse: true });
MemberSchema.index({ email: 1 }, { unique: true, sparse: true });
MemberSchema.index({ status: 1, clubRole: 1 });
MemberSchema.index({ fullName: "text", email: "text", membershipNumber: "text" });

export const Member =
  mongoose.models.Member ?? mongoose.model<IMember>("Member", MemberSchema);

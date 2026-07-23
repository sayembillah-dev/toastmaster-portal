import mongoose, { Schema, type Document } from "mongoose";
import { CLUB_ROLES, type ClubRole } from "@/lib/memberConstants";

export interface IOfficerTerm extends Document {
  clubId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  role: ClubRole;
  termStart: Date;
  termEnd: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfficerTermSchema = new Schema<IOfficerTerm>(
  {
    clubId:     { type: Schema.Types.ObjectId, ref: "Club", required: true },
    memberId:   { type: Schema.Types.ObjectId, ref: "Member", required: true },
    memberName: { type: String, trim: true, maxlength: 80, default: "" },
    role:       { type: String, enum: CLUB_ROLES, required: true },
    termStart:  { type: Date, required: true },
    termEnd:    { type: Date, required: true },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true },
);

OfficerTermSchema.index({ clubId: 1, role: 1, isActive: 1 });
OfficerTermSchema.index({ clubId: 1, termEnd: -1 });
OfficerTermSchema.index({ memberId: 1 });

export const OfficerTerm =
  mongoose.models.OfficerTerm ??
  mongoose.model<IOfficerTerm>("OfficerTerm", OfficerTermSchema);

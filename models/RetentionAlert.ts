import mongoose, { Schema, type Document } from "mongoose";
import {
  ALERT_TYPES,
  ALERT_STATUSES,
  type AlertType,
  type AlertStatus,
} from "@/lib/retentionConstants";

export { ALERT_TYPES, ALERT_STATUSES };
export type { AlertType, AlertStatus };

export interface IRetentionAlert extends Document {
  clubId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  alertType: AlertType;
  status: AlertStatus;
  detail: string;
  acknowledgedById?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RetentionAlertSchema = new Schema<IRetentionAlert>(
  {
    clubId:           { type: Schema.Types.ObjectId, ref: "Club", required: true },
    memberId:         { type: Schema.Types.ObjectId, ref: "Member", required: true },
    memberName:       { type: String, trim: true, maxlength: 80, default: "" },
    alertType:        { type: String, enum: ALERT_TYPES, required: true },
    status:           { type: String, enum: ALERT_STATUSES, default: "active" },
    detail:           { type: String, trim: true, maxlength: 500, default: "" },
    acknowledgedById: { type: Schema.Types.ObjectId, ref: "Member" },
    resolvedAt:       { type: Date },
  },
  { timestamps: true },
);

RetentionAlertSchema.index({ clubId: 1, status: 1 });
RetentionAlertSchema.index({ memberId: 1 });
RetentionAlertSchema.index({ clubId: 1, alertType: 1, status: 1 });

export const RetentionAlert =
  mongoose.models.RetentionAlert ??
  mongoose.model<IRetentionAlert>("RetentionAlert", RetentionAlertSchema);

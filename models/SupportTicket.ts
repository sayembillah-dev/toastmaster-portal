import mongoose, { Schema, type Document } from "mongoose";
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/ticketConstants";

export { TICKET_STATUSES, TICKET_PRIORITIES };
export type { TicketStatus, TicketPriority };

export interface ITicketReply {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  clubId: mongoose.Types.ObjectId;
  createdById: mongoose.Types.ObjectId;
  createdByName: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  taggedMemberIds: mongoose.Types.ObjectId[];
  replies: ITicketReply[];
  resolvedById?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TicketReplySchema = new Schema<ITicketReply>(
  {
    authorId:   { type: Schema.Types.ObjectId, ref: "Member", required: true },
    authorName: { type: String, trim: true, maxlength: 80, default: "" },
    content:    { type: String, trim: true, maxlength: 5000, default: "" },
    createdAt:  { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    clubId:          { type: Schema.Types.ObjectId, ref: "Club", required: true },
    createdById:     { type: Schema.Types.ObjectId, ref: "Member", required: true },
    createdByName:   { type: String, trim: true, maxlength: 80, default: "" },
    subject:         { type: String, required: true, trim: true, maxlength: 200 },
    description:     { type: String, trim: true, maxlength: 5000, default: "" },
    status:          { type: String, enum: TICKET_STATUSES, default: "open" },
    priority:        { type: String, enum: TICKET_PRIORITIES, default: "medium" },
    taggedMemberIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    replies:         { type: [TicketReplySchema], default: [] },
    resolvedById:    { type: Schema.Types.ObjectId, ref: "Member" },
    resolvedAt:      { type: Date },
  },
  { timestamps: true },
);

SupportTicketSchema.index({ clubId: 1, status: 1 });
SupportTicketSchema.index({ clubId: 1, createdById: 1 });
SupportTicketSchema.index({ clubId: 1, priority: 1, status: 1 });

export const SupportTicket =
  mongoose.models.SupportTicket ??
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

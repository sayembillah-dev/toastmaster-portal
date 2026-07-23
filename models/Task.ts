import mongoose, { Schema, Document } from "mongoose";
import type { TaskPriority, TaskStatus } from "@/lib/taskConstants";

interface ITask extends Document {
  clubId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedMemberId: string;
  assignedMemberName: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    clubId:             { type: Schema.Types.ObjectId, ref: "Club", required: true },
    title:              { type: String, required: true, trim: true, maxlength: 200 },
    description:        { type: String, trim: true, maxlength: 2000, default: "" },
    priority:           { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status:             { type: String, enum: ["todo", "done"], default: "todo" },
    assignedMemberId:   { type: String, default: "" },
    assignedMemberName: { type: String, trim: true, maxlength: 80, default: "" },
    dueDate:            { type: Date },
  },
  { timestamps: true },
);

TaskSchema.index({ clubId: 1, status: 1, priority: 1 });

export const Task = mongoose.models.Task ?? mongoose.model<ITask>("Task", TaskSchema);

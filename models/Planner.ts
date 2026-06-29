import mongoose, { Schema, Document } from "mongoose";

interface IPlannerRow extends Document {
  date: Date;
  tmod: string;
  ttm: string;
  tableTopicEvaluator: string;
  preparedSpeaker1: string;
  preparedEvaluator1: string;
  preparedSpeaker2: string;
  preparedEvaluator2: string;
  preparedSpeaker3: string;
  preparedEvaluator3: string;
  generalEvaluator: string;
  timer: string;
  ahCounter: string;
  grammarian: string;
  theme: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlannerRowSchema = new Schema<IPlannerRow>(
  {
    date: { type: Date, required: true },
    tmod: { type: String, trim: true, maxlength: 80, default: "" },
    ttm: { type: String, trim: true, maxlength: 80, default: "" },
    tableTopicEvaluator: { type: String, trim: true, maxlength: 80, default: "" },
    preparedSpeaker1: { type: String, trim: true, maxlength: 80, default: "" },
    preparedEvaluator1: { type: String, trim: true, maxlength: 80, default: "" },
    preparedSpeaker2: { type: String, trim: true, maxlength: 80, default: "" },
    preparedEvaluator2: { type: String, trim: true, maxlength: 80, default: "" },
    preparedSpeaker3: { type: String, trim: true, maxlength: 80, default: "" },
    preparedEvaluator3: { type: String, trim: true, maxlength: 80, default: "" },
    generalEvaluator: { type: String, trim: true, maxlength: 80, default: "" },
    timer: { type: String, trim: true, maxlength: 80, default: "" },
    ahCounter: { type: String, trim: true, maxlength: 80, default: "" },
    grammarian: { type: String, trim: true, maxlength: 80, default: "" },
    theme: { type: String, trim: true, maxlength: 200, default: "" },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true },
);

PlannerRowSchema.index({ date: 1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).PlannerRow;
}

export const PlannerRow =
  mongoose.models.PlannerRow ?? mongoose.model<IPlannerRow>("PlannerRow", PlannerRowSchema);

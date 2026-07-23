import mongoose, { Schema, type Document } from "mongoose";
import { TRANSACTION_TYPES, ALL_CATEGORIES, type TransactionType, type TransactionCategory } from "@/lib/fundConstants";

export { TRANSACTION_TYPES, ALL_CATEGORIES };
export type { TransactionType, TransactionCategory };

export interface ITransaction extends Document {
  clubId: mongoose.Types.ObjectId;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: Date;
  memberId?: mongoose.Types.ObjectId;
  memberName?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    clubId:      { type: Schema.Types.ObjectId, ref: "Club", required: true },
    type:        { type: String, enum: TRANSACTION_TYPES, required: true },
    category:    { type: String, enum: ALL_CATEGORIES, required: true },
    amount:      { type: Number, required: true, min: 0.01 },
    description: { type: String, trim: true, default: "", maxlength: 500 },
    date:        { type: Date, required: true },
    memberId:    { type: Schema.Types.ObjectId, ref: "Member" },
    memberName:  { type: String, trim: true, default: "" },
    receiptUrl:  { type: String, default: "" },
  },
  { timestamps: true },
);

TransactionSchema.index({ clubId: 1, date: -1 });
TransactionSchema.index({ clubId: 1, type: 1 });
TransactionSchema.index({ clubId: 1, memberId: 1 });

export const Transaction =
  mongoose.models.Transaction ?? mongoose.model<ITransaction>("Transaction", TransactionSchema);

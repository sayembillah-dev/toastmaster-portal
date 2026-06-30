import mongoose, { Schema, type Document } from "mongoose";

export interface IClubResource extends Document {
  title: string;
  imageUrl: string;
  imagePublicId: string;
  originalFilename: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubResourceSchema = new Schema<IClubResource>(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    originalFilename: { type: String, default: "" },
  },
  { timestamps: true },
);

ClubResourceSchema.index({ title: "text" });
ClubResourceSchema.index({ createdAt: -1 });

export const ClubResource =
  mongoose.models.ClubResource ?? mongoose.model<IClubResource>("ClubResource", ClubResourceSchema);

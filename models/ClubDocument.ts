import mongoose, { Schema, type Document } from "mongoose";

export const DOCUMENT_TYPES = ["file", "link", "text"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface IClubDocument extends Document {
  type: DocumentType;
  title: string;
  // file
  fileUrl: string;
  filePublicId: string;
  originalFilename: string;
  mimeType: string;
  // link
  url: string;
  description: string;
  // text
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubDocumentSchema = new Schema<IClubDocument>(
  {
    type:             { type: String, enum: DOCUMENT_TYPES, required: true },
    title:            { type: String, required: true, trim: true },
    fileUrl:          { type: String, default: "" },
    filePublicId:     { type: String, default: "" },
    originalFilename: { type: String, default: "" },
    mimeType:         { type: String, default: "" },
    url:              { type: String, default: "" },
    description:      { type: String, default: "" },
    content:          { type: String, default: "" },
  },
  { timestamps: true },
);

ClubDocumentSchema.index({ title: "text" });
ClubDocumentSchema.index({ createdAt: -1 });

export const ClubDocument =
  mongoose.models.ClubDocument ?? mongoose.model<IClubDocument>("ClubDocument", ClubDocumentSchema);

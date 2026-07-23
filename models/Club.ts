import mongoose, { Schema, type Document } from "mongoose";
import { CLUB_DEFAULTS } from "@/lib/clubConstants";

export interface IClub extends Document {
  name: string;
  clubNumber: string;
  district: string;
  division: string;
  area: string;
  areaId?: mongoose.Types.ObjectId;
  address: string;
  mapLink: string;
  mission: string;
  timezone: string;
  currency: string;
  logoUrl: string;
  logoPublicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    name:         { type: String, required: true, trim: true, maxlength: 200 },
    clubNumber:   { type: String, trim: true, default: "" },
    district:     { type: String, trim: true, maxlength: 50, default: "" },
    division:     { type: String, trim: true, maxlength: 50, default: "" },
    area:         { type: String, trim: true, maxlength: 50, default: "" },
    areaId:       { type: Schema.Types.ObjectId, ref: "Area" },
    address:      { type: String, trim: true, maxlength: 500, default: "" },
    mapLink:      { type: String, trim: true, maxlength: 500, default: "" },
    mission:      { type: String, trim: true, maxlength: 2000, default: "" },
    timezone:     { type: String, trim: true, default: CLUB_DEFAULTS.timezone },
    currency:     { type: String, trim: true, default: CLUB_DEFAULTS.currency },
    logoUrl:      { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
  },
  { timestamps: true },
);

ClubSchema.index({ clubNumber: 1 }, { unique: true, sparse: true });

export const Club =
  mongoose.models.Club ?? mongoose.model<IClub>("Club", ClubSchema);

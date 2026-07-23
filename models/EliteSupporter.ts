import mongoose, { Schema, type Document } from "mongoose";

export interface IGeoProfile {
  label: string;
  lat: number;
  lng: number;
  address: string;
}

export interface IWeeklyAvailability {
  day: number;        // 0=Sunday … 6=Saturday
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
}

export interface IEliteSupporter extends Document {
  divisionId: string;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  email: string;
  phone: string;
  geoProfiles: IGeoProfile[];
  availability: IWeeklyAvailability[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GeoProfileSchema = new Schema<IGeoProfile>(
  {
    label:   { type: String, trim: true, maxlength: 20, default: "Work" },
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
    address: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { _id: false },
);

const WeeklyAvailabilitySchema = new Schema<IWeeklyAvailability>(
  {
    day:       { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, trim: true, maxlength: 5, default: "09:00" },
    endTime:   { type: String, trim: true, maxlength: 5, default: "17:00" },
  },
  { _id: false },
);

const EliteSupporterSchema = new Schema<IEliteSupporter>(
  {
    divisionId:   { type: String, trim: true, maxlength: 50, required: true },
    memberId:     { type: Schema.Types.ObjectId, ref: "Member", required: true },
    memberName:   { type: String, trim: true, maxlength: 80, default: "" },
    email:        { type: String, lowercase: true, trim: true, default: "" },
    phone:        { type: String, trim: true, default: "" },
    geoProfiles:  { type: [GeoProfileSchema], default: [], validate: [(v: IGeoProfile[]) => v.length <= 2, "Max 2 geo profiles (Work & Home)"] },
    availability: { type: [WeeklyAvailabilitySchema], default: [] },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true },
);

EliteSupporterSchema.index({ divisionId: 1, isActive: 1 });
EliteSupporterSchema.index({ memberId: 1 });

export const EliteSupporter =
  mongoose.models.EliteSupporter ??
  mongoose.model<IEliteSupporter>("EliteSupporter", EliteSupporterSchema);

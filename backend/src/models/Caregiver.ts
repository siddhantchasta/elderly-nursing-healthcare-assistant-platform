import { Model, Schema, Types, model, models } from "mongoose";

export const CAREGIVER_VERIFICATION_STATUSES = ["pending", "verified", "rejected"] as const;

export type CaregiverVerificationStatus = (typeof CAREGIVER_VERIFICATION_STATUSES)[number];

export interface ICaregiver {
  userId: Types.ObjectId;
  qualifications: string;
  rating: number;
  isAvailable: boolean;
  serviceAreas: string[];
  serviceIds: Types.ObjectId[];
  verificationStatus: CaregiverVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const caregiverSchema = new Schema<ICaregiver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    qualifications: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    serviceAreas: {
      type: [String],
      required: true,
      default: [],
    },
    serviceIds: {
      type: [Schema.Types.ObjectId],
      ref: "Service",
      required: true,
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: CAREGIVER_VERIFICATION_STATUSES,
      required: true,
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Caregiver: Model<ICaregiver> = models.Caregiver || model<ICaregiver>("Caregiver", caregiverSchema);

export default Caregiver;
import { Model, Schema, model, models } from "mongoose";

export const SERVICE_CATEGORIES = [
  "nursing_care",
  "elderly_attendant",
  "physiotherapy",
  "post_hospital_care",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface IService {
  category: ServiceCategory;
  serviceName: string;
  description: string;
  duration: string;
  price: number;
  requiredQualification: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    category: {
      type: String,
      enum: SERVICE_CATEGORIES,
      required: true,
      index: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    requiredQualification: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Service: Model<IService> = models.Service || model<IService>("Service", serviceSchema);

export default Service;
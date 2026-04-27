import { Model, Schema, model, models } from "mongoose";

export interface IServiceCategory {
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCategorySchema = new Schema<IServiceCategory>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ServiceCategory: Model<IServiceCategory> =
  models.ServiceCategory || model<IServiceCategory>("ServiceCategory", serviceCategorySchema);

export default ServiceCategory;

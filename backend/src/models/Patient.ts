import { Model, Schema, Types, model, models } from "mongoose";

export interface IPatient {
  userId: Types.ObjectId;
  age: number;
  medicalNeeds: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    medicalNeeds: {
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

const Patient: Model<IPatient> = models.Patient || model<IPatient>("Patient", patientSchema);

export default Patient;
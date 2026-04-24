import { Model, Schema, Types, model, models } from "mongoose";

export const COMPLAINT_STATUSES = ["open", "resolved"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export interface IComplaint {
  bookingId: Types.ObjectId;
  raisedByUserId: Types.ObjectId;
  raisedByRole: "user" | "caregiver";
  message: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    raisedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    raisedByRole: {
      type: String,
      enum: ["user", "caregiver"],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      required: true,
      default: "open",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Complaint: Model<IComplaint> = models.Complaint || model<IComplaint>("Complaint", complaintSchema);

export default Complaint;
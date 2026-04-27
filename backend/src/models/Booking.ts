import { Model, Schema, Types, model, models } from "mongoose";

export const BOOKING_TYPES = ["hourly", "daily", "long_term"] as const;

export const BOOKING_STATUSES = ["pending", "accepted", "rejected", "in_progress", "completed"] as const;

export type BookingType = (typeof BOOKING_TYPES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface IBooking {
  userId: Types.ObjectId;
  patientId: Types.ObjectId;
  caregiverId: Types.ObjectId;
  serviceId: Types.ObjectId;
  bookingType: BookingType;
  status: BookingStatus;
  scheduledAt: Date;
  statusUpdatedAt: Date;
  userRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    caregiverId: {
      type: Schema.Types.ObjectId,
      ref: "Caregiver",
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    bookingType: {
      type: String,
      enum: BOOKING_TYPES,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      required: true,
      default: "pending",
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    statusUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Booking: Model<IBooking> = models.Booking || model<IBooking>("Booking", bookingSchema);

export default Booking;
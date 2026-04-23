import { Model, Schema, Types, model, models } from "mongoose";

export interface ICareNote {
  bookingId: Types.ObjectId;
  caregiverId: Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const careNoteSchema = new Schema<ICareNote>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    caregiverId: {
      type: Schema.Types.ObjectId,
      ref: "Caregiver",
      required: true,
      index: true,
    },
    note: {
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

const CareNote: Model<ICareNote> = models.CareNote || model<ICareNote>("CareNote", careNoteSchema);

export default CareNote;
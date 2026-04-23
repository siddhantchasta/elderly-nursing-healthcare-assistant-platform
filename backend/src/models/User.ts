import { Model, Schema, model, models } from "mongoose";

export const USER_ROLES = ["user", "caregiver", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User: Model<IUser> = models.User || model<IUser>("User", userSchema);

export default User;
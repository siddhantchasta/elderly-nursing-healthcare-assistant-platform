import User, { UserRole } from "@/models/User";
import { hashPassword } from "@/lib/auth";

export const REGISTERABLE_ROLES = ["user", "caregiver"] as const;

export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export interface RegisterInput {
  email: string;
  password: string;
  role: RegisterableRole;
}

export interface RegisteredUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function registerAccount(input: RegisterInput): Promise<RegisteredUser> {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() }).lean();

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  const createdUser = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role,
  });

  return {
    id: createdUser._id.toString(),
    email: createdUser.email,
    role: createdUser.role,
  };
}
import User, { UserRole } from "@/models/User";
import { hashPassword, signAuthToken, verifyPassword } from "@/lib/auth";

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

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  token: string;
  user: RegisteredUser;
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

export async function loginAccount(input: LoginInput): Promise<AuthenticatedUser> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");

  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = signAuthToken({
    sub: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
}
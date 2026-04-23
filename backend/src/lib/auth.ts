import bcrypt from "bcryptjs";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { UserRole } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable in .env.local");
}

const REQUIRED_JWT_SECRET: string = JWT_SECRET;
const TOKEN_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 12);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, REQUIRED_JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, REQUIRED_JWT_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload format");
  }

  const typedPayload = decoded as JwtPayload;
  const subject = typedPayload.sub;
  const role = typedPayload.role;

  if (!subject || typeof role !== "string") {
    throw new Error("Missing required token claims");
  }

  return {
    sub: subject,
    role: role as UserRole,
  };
}
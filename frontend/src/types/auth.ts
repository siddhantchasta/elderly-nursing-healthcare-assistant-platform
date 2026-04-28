export type UserRole = "user" | "caregiver" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
}

export interface RegisterResponseData {
  id: string;
  email: string;
  role: UserRole;
}

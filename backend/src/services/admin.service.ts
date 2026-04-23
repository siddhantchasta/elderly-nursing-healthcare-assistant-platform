import User from "@/models/User";

export interface AdminUserListItem {
  id: string;
  email: string;
  role: "user" | "caregiver" | "admin";
  createdAt: Date;
}

export async function listUsersForAdmin(): Promise<AdminUserListItem[]> {
  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  return users.map((user) => ({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }));
}
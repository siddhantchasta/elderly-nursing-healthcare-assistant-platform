import Booking from "@/models/Booking";
import Caregiver from "@/models/Caregiver";
import User from "@/models/User";

export interface AdminUserListItem {
  id: string;
  email: string;
  role: "user" | "caregiver" | "admin";
  createdAt: Date;
}

export interface AdminKpiSummary {
  registeredUsersCount: number;
  verifiedCaregiversCount: number;
  bookingCompletionRate: number;
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

export async function getAdminKpiSummary(): Promise<AdminKpiSummary> {
  const [registeredUsersCount, verifiedCaregiversCount, totalBookings, completedBookings] = await Promise.all([
    User.countDocuments({}),
    Caregiver.countDocuments({ verificationStatus: "verified" }),
    Booking.countDocuments({}),
    Booking.countDocuments({ status: "completed" }),
  ]);

  const bookingCompletionRate = totalBookings === 0 ? 0 : Number(((completedBookings / totalBookings) * 100).toFixed(2));

  return {
    registeredUsersCount,
    verifiedCaregiversCount,
    bookingCompletionRate,
  };
}
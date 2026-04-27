import Booking, { BOOKING_STATUSES, BookingStatus } from "@/models/Booking";
import Caregiver from "@/models/Caregiver";
import Complaint, { COMPLAINT_STATUSES, ComplaintStatus } from "@/models/Complaint";
import User, { USER_ROLES, UserRole } from "@/models/User";

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

export interface UpdateUserRoleInput {
  userId: string;
  role: UserRole;
}

export interface UpdatedUserRole {
  id: string;
  role: UserRole;
  updatedAt: Date;
}

export interface AdminOverviewReport {
  bookingCountsByStatus: Record<BookingStatus, number>;
  complaintCountsByStatus: Record<ComplaintStatus, number>;
  totalBookings: number;
  totalComplaints: number;
}

export function isValidUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
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

export async function updateUserRole(input: UpdateUserRoleInput): Promise<UpdatedUserRole> {
  const user = await User.findById(input.userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  user.role = input.role;
  await user.save();

  return {
    id: user._id.toString(),
    role: user.role,
    updatedAt: user.updatedAt,
  };
}

export async function getAdminOverviewReport(): Promise<AdminOverviewReport> {
  const bookingCountsByStatus = {} as Record<BookingStatus, number>;
  const complaintCountsByStatus = {} as Record<ComplaintStatus, number>;

  await Promise.all(
    BOOKING_STATUSES.map(async (status) => {
      bookingCountsByStatus[status] = await Booking.countDocuments({ status });
    })
  );

  await Promise.all(
    COMPLAINT_STATUSES.map(async (status) => {
      complaintCountsByStatus[status] = await Complaint.countDocuments({ status });
    })
  );

  const totalBookings = Object.values(bookingCountsByStatus).reduce((sum, count) => sum + count, 0);
  const totalComplaints = Object.values(complaintCountsByStatus).reduce((sum, count) => sum + count, 0);

  return {
    bookingCountsByStatus,
    complaintCountsByStatus,
    totalBookings,
    totalComplaints,
  };
}
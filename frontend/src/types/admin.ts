export interface AdminKpiSummary {
  registeredUsersCount: number;
  verifiedCaregiversCount: number;
  bookingCompletionRate: number;
  averageResponseTimeHours: number;
  monthlyActiveUsers: number;
  userSatisfactionScore: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  role: "user" | "caregiver" | "admin";
  createdAt: string;
}

export interface AdminOverviewReport {
  bookingCountsByStatus: Record<
    "pending" | "accepted" | "rejected" | "in_progress" | "completed",
    number
  >;
  complaintCountsByStatus: Record<"open" | "escalated" | "resolved", number>;
  totalBookings: number;
  totalComplaints: number;
}

export type ComplaintStatus = "open" | "escalated" | "resolved";

export interface ComplaintItem {
  id: string;
  bookingId: string;
  raisedByUserId: string;
  raisedByRole: "user" | "caregiver";
  message: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintPayload {
  bookingId: string;
  message: string;
}

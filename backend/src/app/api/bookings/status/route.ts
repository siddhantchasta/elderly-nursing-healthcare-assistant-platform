import { updateBookingStatusController } from "@/controllers/booking.controller";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  return updateBookingStatusController(request);
}
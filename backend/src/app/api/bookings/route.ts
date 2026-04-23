import {
  createBookingController,
  listBookingHistoryController,
  updateBookingDecisionController,
} from "@/controllers/booking.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createBookingController(request);
}

export async function GET(request: Request) {
  return listBookingHistoryController(request);
}

export async function PATCH(request: Request) {
  return updateBookingDecisionController(request);
}
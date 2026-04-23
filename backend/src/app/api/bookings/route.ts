import { createBookingController } from "@/controllers/booking.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createBookingController(request);
}
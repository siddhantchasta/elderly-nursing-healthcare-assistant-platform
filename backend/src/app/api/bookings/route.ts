import {
  createBookingController,
  listBookingHistoryController,
  updateBookingDecisionController,
} from "@/controllers/booking.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function POST(request: Request) {
  return withCors(await createBookingController(request), request);
}

export async function GET(request: Request) {
  return withCors(await listBookingHistoryController(request), request);
}

export async function PATCH(request: Request) {
  return withCors(await updateBookingDecisionController(request), request);
}

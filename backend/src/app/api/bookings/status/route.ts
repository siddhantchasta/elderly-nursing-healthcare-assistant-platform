import { updateBookingStatusController } from "@/controllers/booking.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function PATCH(request: Request) {
  return withCors(await updateBookingStatusController(request), request);
}

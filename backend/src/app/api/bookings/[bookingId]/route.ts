import { getBookingByIdController } from "@/controllers/booking.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;

  return withCors(await getBookingByIdController(request, bookingId), request);
}

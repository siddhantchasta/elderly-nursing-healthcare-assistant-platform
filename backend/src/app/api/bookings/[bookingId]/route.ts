import { getBookingByIdController } from "@/controllers/booking.controller";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;

  return getBookingByIdController(request, bookingId);
}
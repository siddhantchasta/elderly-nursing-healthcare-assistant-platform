import { rateBookingController } from "@/controllers/booking.controller";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;

  return rateBookingController(request, bookingId);
}

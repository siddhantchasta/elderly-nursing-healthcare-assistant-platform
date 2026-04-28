import { getComplaintByIdController } from "@/controllers/complaint.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    complaintId: string;
  }>;
};

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request, context: RouteContext) {
  const { complaintId } = await context.params;

  return withCors(await getComplaintByIdController(request, complaintId), request);
}

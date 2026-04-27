import { getComplaintByIdController } from "@/controllers/complaint.controller";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    complaintId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { complaintId } = await context.params;

  return getComplaintByIdController(request, complaintId);
}

import { listComplaintsController, updateComplaintStatusController } from "@/controllers/admin.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request) {
  return withCors(await listComplaintsController(request), request);
}

export async function PATCH(request: Request) {
  return withCors(await updateComplaintStatusController(request), request);
}

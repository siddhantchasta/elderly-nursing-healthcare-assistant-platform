import { listComplaintsController, updateComplaintStatusController } from "@/controllers/admin.controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return listComplaintsController(request);
}

export async function PATCH(request: Request) {
  return updateComplaintStatusController(request);
}
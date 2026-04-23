import { listPendingCaregiversController } from "@/controllers/admin.controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return listPendingCaregiversController(request);
}
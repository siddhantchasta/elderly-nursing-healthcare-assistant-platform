import { createComplaintController } from "@/controllers/complaint.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createComplaintController(request);
}
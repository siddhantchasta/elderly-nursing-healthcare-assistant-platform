import {
  createComplaintController,
  listReporterComplaintsController,
} from "@/controllers/complaint.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createComplaintController(request);
}

export async function GET(request: Request) {
  return listReporterComplaintsController(request);
}
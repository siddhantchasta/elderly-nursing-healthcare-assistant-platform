import {
  createComplaintController,
  listReporterComplaintsController,
} from "@/controllers/complaint.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function POST(request: Request) {
  return withCors(await createComplaintController(request), request);
}

export async function GET(request: Request) {
  return withCors(await listReporterComplaintsController(request), request);
}

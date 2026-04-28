import { createServiceController, listServicesController, updateServiceController } from "@/controllers/service.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request) {
  return withCors(await listServicesController(), request);
}

export async function POST(request: Request) {
  return withCors(await createServiceController(request), request);
}

export async function PATCH(request: Request) {
  return withCors(await updateServiceController(request), request);
}

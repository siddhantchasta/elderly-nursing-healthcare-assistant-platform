import { createServiceController, listServicesController, updateServiceController } from "@/controllers/service.controller";

export const runtime = "nodejs";

export async function GET() {
  return listServicesController();
}

export async function POST(request: Request) {
  return createServiceController(request);
}

export async function PATCH(request: Request) {
  return updateServiceController(request);
}
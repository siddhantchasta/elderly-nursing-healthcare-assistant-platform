import { listServicesController } from "@/controllers/service.controller";

export const runtime = "nodejs";

export async function GET() {
  return listServicesController();
}
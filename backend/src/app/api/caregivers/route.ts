import { createCaregiverController, listCaregiversController } from "@/controllers/caregiver.controller";

export const runtime = "nodejs";

export async function GET() {
  return listCaregiversController();
}

export async function POST(request: Request) {
  return createCaregiverController(request);
}
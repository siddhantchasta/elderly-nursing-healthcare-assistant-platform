import {
  createCaregiverController,
  listCaregiversController,
  updateCaregiverProfileController,
} from "@/controllers/caregiver.controller";

export const runtime = "nodejs";

export async function GET() {
  return listCaregiversController();
}

export async function POST(request: Request) {
  return createCaregiverController(request);
}

export async function PATCH(request: Request) {
  return updateCaregiverProfileController(request);
}
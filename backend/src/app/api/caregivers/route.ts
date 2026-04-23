import { listCaregiversController } from "@/controllers/caregiver.controller";

export const runtime = "nodejs";

export async function GET() {
  return listCaregiversController();
}
import { listUserStatusUpdatesController } from "@/controllers/notification.controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return listUserStatusUpdatesController(request);
}

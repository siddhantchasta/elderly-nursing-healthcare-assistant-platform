import { listUsersController, updateUserRoleController } from "@/controllers/admin.controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return listUsersController(request);
}

export async function PATCH(request: Request) {
  return updateUserRoleController(request);
}
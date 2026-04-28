import { loginController } from "@/controllers/auth.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function POST(request: Request) {
  return withCors(await loginController(request), request);
}

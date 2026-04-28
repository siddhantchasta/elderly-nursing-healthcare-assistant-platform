import { createCareNoteController, listCareNotesController } from "@/controllers/careNote.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function POST(request: Request) {
  return withCors(await createCareNoteController(request), request);
}

export async function GET(request: Request) {
  return withCors(await listCareNotesController(request), request);
}

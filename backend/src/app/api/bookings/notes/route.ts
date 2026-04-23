import { createCareNoteController } from "@/controllers/careNote.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createCareNoteController(request);
}
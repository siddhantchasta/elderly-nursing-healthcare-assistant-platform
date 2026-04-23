import { createCareNoteController, listCareNotesController } from "@/controllers/careNote.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createCareNoteController(request);
}

export async function GET(request: Request) {
  return listCareNotesController(request);
}
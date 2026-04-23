import Booking from "@/models/Booking";
import CareNote from "@/models/CareNote";

export interface CreateCareNoteInput {
  bookingId: string;
  caregiverId: string;
  note: string;
}

export interface CreatedCareNote {
  id: string;
  bookingId: string;
  caregiverId: string;
  note: string;
  createdAt: Date;
}

export interface CareNoteListItem {
  id: string;
  bookingId: string;
  caregiverId: string;
  note: string;
  createdAt: Date;
}

export async function createCareNote(input: CreateCareNoteInput): Promise<CreatedCareNote> {
  const booking = await Booking.findById(input.bookingId).lean();

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.caregiverId.toString() !== input.caregiverId) {
    throw new Error("BOOKING_CAREGIVER_MISMATCH");
  }

  if (!["accepted", "in_progress", "completed"].includes(booking.status)) {
    throw new Error("CARE_NOTE_NOT_ALLOWED_FOR_STATUS");
  }

  const createdNote = await CareNote.create({
    bookingId: input.bookingId,
    caregiverId: input.caregiverId,
    note: input.note,
  });

  return {
    id: createdNote._id.toString(),
    bookingId: createdNote.bookingId.toString(),
    caregiverId: createdNote.caregiverId.toString(),
    note: createdNote.note,
    createdAt: createdNote.createdAt,
  };
}

export async function listCareNotesByBooking(bookingId: string): Promise<CareNoteListItem[]> {
  const notes = await CareNote.find({ bookingId }).sort({ createdAt: 1 }).lean();

  return notes.map((note) => ({
    id: note._id.toString(),
    bookingId: note.bookingId.toString(),
    caregiverId: note.caregiverId.toString(),
    note: note.note,
    createdAt: note.createdAt,
  }));
}
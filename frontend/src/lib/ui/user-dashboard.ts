import type { BookingItem } from "@/types/booking";
import type { ComplaintItem } from "@/types/complaint";

/** Shared ElderCare user dashboard design tokens (matches landing + auth). */
export const ud = {
  page: "min-h-screen bg-[#f7f7f5] text-[#111111]",
  content: "mx-auto w-full max-w-6xl",
  card: "rounded-[24px] bg-white p-6 shadow-sm sm:p-8",
  cardMuted: "rounded-[20px] border border-[#e7e7e7] bg-[#fafaf8] p-5",
  cardTitle: "text-lg font-semibold tracking-tight text-[#111111] sm:text-xl",
  cardSubtitle: "mt-1 text-sm leading-relaxed text-[#6d7b76]",
  label: "mb-3 block text-sm font-semibold text-[#111111]",
  input:
    "h-14 w-full rounded-2xl border border-[#d8d8d8] bg-white px-5 text-[15px] text-[#111111] outline-none transition focus:border-[#ff6a3d]",
  select:
    "h-14 w-full rounded-2xl border border-[#d8d8d8] bg-white px-5 text-[15px] text-[#111111] outline-none transition focus:border-[#ff6a3d]",
  textarea:
    "w-full rounded-2xl border border-[#d8d8d8] bg-white px-5 py-4 text-[15px] text-[#111111] outline-none transition focus:border-[#ff6a3d]",
  btnPrimary:
    "inline-flex h-12 items-center justify-center rounded-full bg-[#ff6a3d] px-6 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
  btnSecondary:
    "inline-flex h-11 items-center justify-center rounded-full border border-[#d8d8d8] bg-white px-5 text-sm font-semibold text-[#111111] transition hover:border-[#cad5d2]",
  linkAccent: "font-semibold text-[#ff6a3d] transition hover:text-[#e85a2f]",
  muted: "text-sm text-[#6d7b76]",
  error: "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
  success: "rounded-2xl border border-[#cad5d2] bg-[#eef5f2] px-4 py-3 text-sm text-[#4a6b5c]",
  tableWrap: "mt-6 overflow-x-auto rounded-2xl border border-[#e7e7e7]",
  table: "min-w-full border-collapse",
  th: "border-b border-[#e7e7e7] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ca09a]",
  td: "border-b border-[#f0f0ee] px-4 py-4 text-sm text-[#4b4b4b] align-top",
  tdStrong: "border-b border-[#f0f0ee] px-4 py-4 text-sm font-medium text-[#111111] align-top",
  badge: "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
} as const;

export const BOOKING_STATUS_STYLES: Record<BookingItem["status"], string> = {
  pending: "bg-[#f5efe6] text-[#8a6d3b]",
  accepted: "bg-[#e8f0ec] text-[#4a6b5c]",
  rejected: "bg-[#f5e8e8] text-[#9b4d4d]",
  in_progress: "bg-[#ebe8f5] text-[#5c4a7a]",
  completed: "bg-[#e8f0ec] text-[#3d6b55]",
};

export const COMPLAINT_STATUS_STYLES: Record<ComplaintItem["status"], string> = {
  open: "bg-[#f5efe6] text-[#8a6d3b]",
  escalated: "bg-[#f5e8e8] text-[#9b4d4d]",
  resolved: "bg-[#e8f0ec] text-[#3d6b55]",
};

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

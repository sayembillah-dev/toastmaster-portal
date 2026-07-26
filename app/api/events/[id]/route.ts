import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Event } from "@/models/Event";
import { Guest } from "@/models/Guest";
import { Member } from "@/models/Member";
import { serializeEvent, type LeanEvent } from "@/lib/serializers";
import { eventUpdateSchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

// Guests newly marked present get an attendance-log entry on their Guest record;
// if they've already converted to a Member, the same entry is mirrored onto that Member.
async function logNewlyConfirmedGuestAttendance(
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  previousAttendees: { guestId?: string; present?: boolean }[],
  nextAttendees: { guestId?: string; present?: boolean }[],
) {
  const wasPresent = new Map(
    previousAttendees.filter((a) => a.guestId).map((a) => [a.guestId as string, !!a.present]),
  );
  const newlyConfirmed = nextAttendees.filter((a) => a.guestId && a.present && !wasPresent.get(a.guestId as string));

  for (const a of newlyConfirmed) {
    const confirmedAt = new Date();
    const guest = await Guest.findByIdAndUpdate(
      a.guestId,
      { $push: { attendanceLog: { eventId, eventTitle, eventDate, confirmedAt } } },
      { new: true },
    ).lean() as { convertedToMemberId?: string } | null;

    if (guest?.convertedToMemberId) {
      await Member.findByIdAndUpdate(guest.convertedToMemberId, {
        $push: {
          activityLog: {
            type: "guest_attendance",
            message: `Attended ${eventTitle || "a meeting"} as a guest`,
            relatedEventId: eventId,
            occurredAt: confirmedAt,
          },
        },
      });
    }
  }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const doc = await Event.findById(id).lean();
    if (!doc) return jsonNotFound("Event not found");
    return jsonOk(serializeEvent(doc as unknown as LeanEvent));
  } catch {
    return jsonServerError();
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = eventUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { date, ...rest } = parsed.data;
    const updateData = { ...rest, ...(date ? { date: new Date(date) } : {}) };

    const existing = parsed.data.attendees
      ? await Event.findById(id).select("attendees").lean() as { attendees?: { guestId?: string; present?: boolean }[] } | null
      : null;

    const doc = await Event.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    if (!doc) return jsonNotFound("Event not found");
    const event = doc as unknown as LeanEvent;

    if (existing && parsed.data.attendees) {
      try {
        await logNewlyConfirmedGuestAttendance(
          id,
          event.title || `Meeting #${event.meetingNumber}`,
          event.date,
          existing.attendees ?? [],
          parsed.data.attendees,
        );
      } catch {
        // Best-effort side effect — the event save above already succeeded.
      }
    }

    return jsonOk(serializeEvent(event));
  } catch {
    return jsonServerError();
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const doc = await Event.findByIdAndDelete(id);
    if (!doc) return jsonNotFound("Event not found");
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import { GUEST_FILLABLE_ROLES, AGENDA_ROLE_LABELS, type AgendaRoleKey } from "@/lib/eventConstants";
import { guestTimerUpdateSchema, guestAhCounterUpdateSchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonBadRequest, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ token: string }> };

type LinkedEvent = {
  _id: unknown;
  title: string;
  meetingNumber: number;
  date: Date;
  roles: Record<string, string>;
  timerEntries: unknown[];
  fillerWords: string[];
  ahCounterReport: unknown[];
  guestRoleLinks: { role?: string; token?: string }[];
};

async function findByToken(token: string) {
  const doc = (await Event.findOne({ "guestRoleLinks.token": token }).lean()) as LinkedEvent | null;
  if (!doc) return null;
  const link = doc.guestRoleLinks.find((l) => l.token === token);
  const role = link?.role as AgendaRoleKey | undefined;
  if (!role || !GUEST_FILLABLE_ROLES.includes(role)) return null;
  return { doc, role };
}

function buildPublicDto(doc: LinkedEvent, role: AgendaRoleKey) {
  const base = {
    eventId: String(doc._id),
    eventTitle: doc.title || `Meeting #${doc.meetingNumber}`,
    meetingNumber: doc.meetingNumber ?? 0,
    date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date),
    role,
    roleLabel: AGENDA_ROLE_LABELS[role],
    roleAssigneeName: doc.roles?.[role] ?? "",
  };
  if (role === "timer") {
    return { ...base, timerEntries: doc.timerEntries ?? [] };
  }
  return {
    ...base,
    fillerWords: (doc.fillerWords ?? []).length > 0 ? doc.fillerWords : ["Ah", "Um", "So", "Like"],
    ahCounterReport: doc.ahCounterReport ?? [],
  };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { token } = await params;
    await dbConnect();
    const found = await findByToken(token);
    if (!found) return jsonNotFound("This guest link is invalid or has been revoked");
    return jsonOk(buildPublicDto(found.doc, found.role));
  } catch {
    return jsonServerError();
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    await dbConnect();
    const found = await findByToken(token);
    if (!found) return jsonNotFound("This guest link is invalid or has been revoked");

    const body = await req.json().catch(() => null);

    if (found.role === "timer") {
      const parsed = guestTimerUpdateSchema.safeParse(body);
      if (!parsed.success) return jsonValidationError(parsed.error.flatten());
      const doc = await Event.findOneAndUpdate(
        { "guestRoleLinks.token": token },
        { $set: { timerEntries: parsed.data.timerEntries } },
        { new: true },
      ).lean();
      if (!doc) return jsonNotFound("This guest link is invalid or has been revoked");
      return jsonOk(buildPublicDto(doc as unknown as LinkedEvent, found.role));
    }

    if (found.role === "ahCounter") {
      const parsed = guestAhCounterUpdateSchema.safeParse(body);
      if (!parsed.success) return jsonValidationError(parsed.error.flatten());
      const update: Record<string, unknown> = { ahCounterReport: parsed.data.ahCounterReport };
      if (parsed.data.fillerWords) update.fillerWords = parsed.data.fillerWords;
      const doc = await Event.findOneAndUpdate(
        { "guestRoleLinks.token": token },
        { $set: update },
        { new: true },
      ).lean();
      if (!doc) return jsonNotFound("This guest link is invalid or has been revoked");
      return jsonOk(buildPublicDto(doc as unknown as LinkedEvent, found.role));
    }

    return jsonBadRequest("Unsupported role");
  } catch {
    return jsonServerError();
  }
}

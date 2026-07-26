import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Event } from "@/models/Event";
import { serializeEvent, type LeanEvent } from "@/lib/serializers";
import { guestRoleLinkRequestSchema } from "@/lib/validation";
import { generateGuestToken } from "@/lib/guestAccess";
import { GUEST_FILLABLE_ROLES, AGENDA_ROLE_KEYS } from "@/lib/eventConstants";
import { jsonOk, jsonNotFound, jsonBadRequest, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

// Generate (or regenerate) a public guest link for a role on this event.
export async function POST(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = guestRoleLinkRequestSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { role } = parsed.data;
    if (!GUEST_FILLABLE_ROLES.includes(role)) return jsonBadRequest("This role can't be shared with a guest yet");

    const token = generateGuestToken();
    const doc = await Event.findByIdAndUpdate(
      id,
      {
        $pull: { guestRoleLinks: { role } },
      },
      { new: true },
    );
    if (!doc) return jsonNotFound("Event not found");

    doc.guestRoleLinks.push({ role, token, createdAt: new Date() });
    await doc.save();

    return jsonOk(serializeEvent(doc.toObject() as unknown as LeanEvent));
  } catch {
    return jsonServerError();
  }
}

// Revoke a role's guest link.
export async function DELETE(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    if (!role || !AGENDA_ROLE_KEYS.includes(role as (typeof AGENDA_ROLE_KEYS)[number])) {
      return jsonBadRequest("A valid role is required");
    }

    const doc = await Event.findByIdAndUpdate(
      id,
      { $pull: { guestRoleLinks: { role } } },
      { new: true },
    ).lean();
    if (!doc) return jsonNotFound("Event not found");

    return jsonOk(serializeEvent(doc as unknown as LeanEvent));
  } catch {
    return jsonServerError();
  }
}

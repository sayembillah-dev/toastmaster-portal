import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Event } from "@/models/Event";
import { serializeEvent, type LeanEvent } from "@/lib/serializers";
import { eventUpdateSchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

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

    const doc = await Event.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    if (!doc) return jsonNotFound("Event not found");
    return jsonOk(serializeEvent(doc as unknown as LeanEvent));
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

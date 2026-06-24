import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Guest } from "@/models/Guest";
import { serializeGuest, type LeanGuest } from "@/lib/serializers";
import { guestUpdateSchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const guest = await Guest.findById(id).lean();
    if (!guest) return jsonNotFound("Guest not found");
    return jsonOk(serializeGuest(guest as unknown as LeanGuest));
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
    const parsed = guestUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { visitDate, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (visitDate) update.visitDate = new Date(visitDate);

    const guest = await Guest.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!guest) return jsonNotFound("Guest not found");
    return jsonOk(serializeGuest(guest as unknown as LeanGuest));
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
    const guest = await Guest.findByIdAndDelete(id);
    if (!guest) return jsonNotFound("Guest not found");
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

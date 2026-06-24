import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Guest } from "@/models/Guest";
import { serializeGuest, type LeanGuest } from "@/lib/serializers";
import { guestSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: Record<string, string> = {};
    if (status) filter.followUpStatus = status;

    const guests = await Guest.find(filter).sort({ createdAt: -1 }).lean();
    return jsonOk(guests.map((g) => serializeGuest(g as unknown as LeanGuest)));
  } catch {
    return jsonServerError();
  }
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const body = await req.json().catch(() => null);
    const parsed = guestSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { visitDate, ...rest } = parsed.data;
    const doc = await Guest.create({ ...rest, visitDate: new Date(visitDate) });
    return jsonOk(serializeGuest(doc.toObject() as unknown as LeanGuest), { status: 201 });
  } catch {
    return jsonServerError();
  }
}

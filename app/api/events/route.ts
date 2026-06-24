import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Event } from "@/models/Event";
import { serializeEvent, type LeanEvent } from "@/lib/serializers";
import { eventSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isTemplate = searchParams.get("template") === "true";
    const upcoming = searchParams.get("upcoming") === "true";

    const filter: Record<string, unknown> = { isTemplate };

    if (!isTemplate && upcoming) {
      filter.date = { $gte: new Date() };
    }

    const events = await Event.find(filter).sort({ date: isTemplate ? -1 : 1 }).lean();
    return jsonOk(events.map((e) => serializeEvent(e as unknown as LeanEvent)));
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
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { date, ...rest } = parsed.data;
    const doc = await Event.create({ ...rest, date: new Date(date) });

    return jsonOk(serializeEvent(doc.toObject() as unknown as LeanEvent), { status: 201 });
  } catch {
    return jsonServerError();
  }
}

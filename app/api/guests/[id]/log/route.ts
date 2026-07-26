import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Guest } from "@/models/Guest";
import { serializeGuest, type LeanGuest } from "@/lib/serializers";
import { communicationLogEntrySchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = communicationLogEntrySchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const guest = await Guest.findByIdAndUpdate(
      id,
      { $push: { communicationLog: { ...parsed.data, loggedAt: new Date() } } },
      { new: true },
    ).lean();
    if (!guest) return jsonNotFound("Guest not found");
    return jsonOk(serializeGuest(guest as unknown as LeanGuest));
  } catch {
    return jsonServerError();
  }
}

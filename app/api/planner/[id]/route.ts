import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { PlannerRow } from "@/models/Planner";
import { serializePlannerRow, type LeanPlannerRow } from "@/lib/serializers";
import { plannerRowUpdateSchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = plannerRowUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { date, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (date) update.date = new Date(date);

    const doc = await PlannerRow.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) return jsonNotFound("Planner row not found");

    return jsonOk(serializePlannerRow(doc as unknown as LeanPlannerRow));
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
    const doc = await PlannerRow.findByIdAndDelete(id).lean();
    if (!doc) return jsonNotFound("Planner row not found");

    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { PlannerRow } from "@/models/Planner";
import { serializePlannerRow, type LeanPlannerRow } from "@/lib/serializers";
import { plannerRowSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const rows = await PlannerRow.find().sort({ date: 1 }).lean();
    return jsonOk(rows.map((r) => serializePlannerRow(r as unknown as LeanPlannerRow)));
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
    const parsed = plannerRowSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { date, ...rest } = parsed.data;
    const doc = await PlannerRow.create({ ...rest, date: new Date(date) });

    return jsonOk(serializePlannerRow(doc.toObject() as unknown as LeanPlannerRow), { status: 201 });
  } catch {
    return jsonServerError();
  }
}

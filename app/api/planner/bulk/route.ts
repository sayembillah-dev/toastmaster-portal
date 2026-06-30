import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { PlannerRow } from "@/models/Planner";
import { serializePlannerRow, type LeanPlannerRow } from "@/lib/serializers";
import { plannerRowSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

const bulkSchema = z.object({
  rows: z.array(plannerRowSchema).min(1).max(200),
});

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const body = await req.json().catch(() => null);
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const docs = await PlannerRow.insertMany(
      parsed.data.rows.map(({ date, ...rest }) => ({
        ...rest,
        date: new Date(date),
      })),
    );

    return jsonOk(
      docs.map((d) => serializePlannerRow(d.toObject() as unknown as LeanPlannerRow)),
      { status: 201 },
    );
  } catch {
    return jsonServerError();
  }
}

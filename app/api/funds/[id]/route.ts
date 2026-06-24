import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Transaction } from "@/models/Transaction";
import { serializeTransaction, type LeanTransaction } from "@/lib/serializers";
import { transactionUpdateSchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const t = await Transaction.findById(id).lean();
    if (!t) return jsonNotFound("Transaction not found");
    return jsonOk(serializeTransaction(t as unknown as LeanTransaction));
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
    const parsed = transactionUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { date, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (date) update.date = new Date(date);

    const t = await Transaction.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!t) return jsonNotFound("Transaction not found");
    return jsonOk(serializeTransaction(t as unknown as LeanTransaction));
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
    const t = await Transaction.findByIdAndDelete(id);
    if (!t) return jsonNotFound("Transaction not found");
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Transaction } from "@/models/Transaction";
import { serializeTransaction, type LeanTransaction } from "@/lib/serializers";
import { transactionSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, Date>).$gte = new Date(from);
      if (to) (filter.date as Record<string, Date>).$lte = new Date(to);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    return jsonOk(transactions.map((t) => serializeTransaction(t as unknown as LeanTransaction)));
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
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { date, ...rest } = parsed.data;
    const doc = await Transaction.create({ ...rest, date: new Date(date) });
    return jsonOk(serializeTransaction(doc.toObject() as unknown as LeanTransaction), { status: 201 });
  } catch {
    return jsonServerError();
  }
}

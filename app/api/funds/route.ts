import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Transaction } from "@/models/Transaction";
import { serializeTransaction, type LeanTransaction } from "@/lib/serializers";
import { transactionSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const type     = searchParams.get("type");
    const category = searchParams.get("category");
    const from     = searchParams.get("from");
    const to       = searchParams.get("to");
    const month    = searchParams.get("month");
    const year     = searchParams.get("year");
    const q        = searchParams.get("q")?.trim();
    const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? String(PAGE_SIZE))));

    const filter: Record<string, unknown> = {};

    if (type)     filter.type     = type;
    if (category) filter.category = category;

    // Date range: explicit from/to takes precedence; then year+month
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to)   dateFilter.$lte = new Date(to);
      filter.date = dateFilter;
    } else if (year && month) {
      const y = Number(year), m = Number(month);
      filter.date = { $gte: new Date(y, m - 1, 1), $lte: new Date(y, m, 0, 23, 59, 59, 999) };
    } else if (year) {
      const y = Number(year);
      filter.date = { $gte: new Date(y, 0, 1), $lte: new Date(y, 11, 31, 23, 59, 59, 999) };
    } else if (month) {
      filter.$expr = { $eq: [{ $month: "$date" }, Number(month)] };
    }

    if (q) {
      filter.$or = [
        { description: { $regex: q, $options: "i" } },
        { memberName:  { $regex: q, $options: "i" } },
        { category:    { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * pageSize;
    const [total, docs] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    ]);

    return jsonOk({
      data:       docs.map((t) => serializeTransaction(t as unknown as LeanTransaction)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return jsonServerError();
  }
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const body   = await req.json().catch(() => null);
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { date, ...rest } = parsed.data;
    const doc = await Transaction.create({ ...rest, date: new Date(date) });
    return jsonOk(serializeTransaction(doc.toObject() as unknown as LeanTransaction), { status: 201 });
  } catch {
    return jsonServerError();
  }
}

import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Transaction } from "@/models/Transaction";
import { serializeTransaction, type LeanTransaction } from "@/lib/serializers";
import { transactionSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

const bulkSchema = z.object({
  transactions: z.array(transactionSchema).min(1).max(100),
});

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const body = await req.json().catch(() => null);
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const docs = await Transaction.insertMany(
      parsed.data.transactions.map(({ date, ...rest }) => ({
        ...rest,
        date: new Date(date),
      })),
    );

    return jsonOk(
      docs.map((d) => serializeTransaction(d.toObject() as unknown as LeanTransaction)),
      { status: 201 },
    );
  } catch {
    return jsonServerError();
  }
}

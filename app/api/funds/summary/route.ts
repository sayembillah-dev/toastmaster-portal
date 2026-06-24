import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Transaction } from "@/models/Transaction";
import { jsonOk, jsonServerError } from "@/lib/apiHelpers";
import type { FundSummaryDTO } from "@/lib/serializers";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const [result] = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const summary: FundSummaryDTO = result
      ? {
          totalIncome: result.totalIncome,
          totalExpense: result.totalExpense,
          balance: result.totalIncome - result.totalExpense,
          transactionCount: result.transactionCount,
        }
      : { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 };

    return jsonOk(summary);
  } catch {
    return jsonServerError();
  }
}

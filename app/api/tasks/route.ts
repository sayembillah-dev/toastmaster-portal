import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Task } from "@/models/Task";
import { serializeTask, type LeanTask } from "@/lib/serializers";
import { taskSchema } from "@/lib/validation";
import { jsonOk, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    return jsonOk(tasks.map((t) => serializeTask(t as unknown as LeanTask)));
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
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { dueDate, ...rest } = parsed.data;
    const doc = await Task.create({
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return jsonOk(serializeTask(doc.toObject() as unknown as LeanTask), { status: 201 });
  } catch {
    return jsonServerError();
  }
}

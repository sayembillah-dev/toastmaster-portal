import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Task } from "@/models/Task";
import { serializeTask, type LeanTask } from "@/lib/serializers";
import { taskUpdateSchema } from "@/lib/validation";
import { jsonOk, jsonNotFound, jsonValidationError, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { dueDate, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (dueDate !== undefined) {
      update.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const task = await Task.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!task) return jsonNotFound("Task not found");
    return jsonOk(serializeTask(task as unknown as LeanTask));
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
    const task = await Task.findByIdAndDelete(id);
    if (!task) return jsonNotFound("Task not found");
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

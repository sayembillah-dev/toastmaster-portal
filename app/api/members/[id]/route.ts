import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Member } from "@/models/Member";
import { serializeMember, type LeanMember } from "@/lib/serializers";
import { memberUpdateSchema } from "@/lib/validation";
import {
  jsonOk,
  jsonNotFound,
  jsonValidationError,
  jsonServerError,
  jsonConflict,
} from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const member = await Member.findById(id).lean();
    if (!member) return jsonNotFound("Member not found");
    return jsonOk(serializeMember(member as unknown as LeanMember));
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
    const parsed = memberUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { joinDate, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (joinDate) update.joinDate = new Date(joinDate);

    const member = await Member.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!member) return jsonNotFound("Member not found");
    return jsonOk(serializeMember(member as unknown as LeanMember));
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000) {
      return jsonConflict("A member with that membership number or email already exists");
    }
    return jsonServerError();
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) return jsonNotFound("Member not found");
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

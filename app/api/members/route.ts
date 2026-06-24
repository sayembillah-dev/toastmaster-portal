import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Member } from "@/models/Member";
import { serializeMember, type LeanMember } from "@/lib/serializers";
import { memberSchema } from "@/lib/validation";
import {
  jsonOk,
  jsonValidationError,
  jsonServerError,
  jsonConflict,
} from "@/lib/apiHelpers";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    const filter: Record<string, string> = {};
    if (status) filter.status = status;
    if (role) filter.clubRole = role;

    const members = await Member.find(filter).sort({ fullName: 1 }).lean();
    return jsonOk(members.map((m) => serializeMember(m as unknown as LeanMember)));
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
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const { joinDate, email, membershipNumber, ...rest } = parsed.data;

    const doc = await Member.create({
      ...rest,
      joinDate: new Date(joinDate),
      email: email || "",
      membershipNumber: membershipNumber || "",
    });

    return jsonOk(serializeMember(doc.toObject() as unknown as LeanMember), { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000) {
      return jsonConflict("A member with that membership number or email already exists");
    }
    return jsonServerError();
  }
}

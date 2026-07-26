import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Guest, type IGuestAttendanceEntry } from "@/models/Guest";
import { Member } from "@/models/Member";
import { serializeMember, type LeanMember } from "@/lib/serializers";
import { jsonOk, jsonNotFound, jsonBadRequest, jsonConflict, jsonServerError } from "@/lib/apiHelpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const guest = await Guest.findById(id);
    if (!guest) return jsonNotFound("Guest not found");
    if (guest.convertedToMemberId) {
      return jsonConflict("This guest has already been converted to a member");
    }
    if (!guest.feePaid) {
      return jsonBadRequest("Mark the membership fee as paid before converting this guest");
    }

    const member = await Member.create({
      fullName: guest.fullName,
      email: guest.email,
      phone: guest.phone,
      status: "active",
      clubRole: "Member",
      paymentStatus: "paid",
      joinDate: new Date(),
      bio: guest.bio,
      linkedinUrl: guest.linkedinUrl,
      photoUrl: guest.photoUrl,
      photoPublicId: guest.photoPublicId,
      convertedFromGuestId: String(guest._id),
      activityLog: [
        ...guest.attendanceLog.map((a: IGuestAttendanceEntry) => ({
          type: "guest_attendance" as const,
          message: `Attended ${a.eventTitle || "a meeting"} as a guest`,
          relatedEventId: a.eventId,
          occurredAt: a.confirmedAt,
        })),
        {
          type: "conversion" as const,
          message: "Converted from guest lead to club member",
          relatedEventId: "",
          occurredAt: new Date(),
        },
      ],
    });

    guest.followUpStatus = "joined";
    guest.convertedToMemberId = String(member._id);
    guest.convertedAt = new Date();
    await guest.save();

    return jsonOk(serializeMember(member.toObject() as unknown as LeanMember), { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000) {
      return jsonConflict("A member with that email already exists");
    }
    return jsonServerError();
  }
}

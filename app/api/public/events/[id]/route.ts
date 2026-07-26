import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import { Member } from "@/models/Member";
import { Guest } from "@/models/Guest";
import { serializeEvent, type LeanEvent } from "@/lib/serializers";
import { jsonOk, jsonNotFound, jsonServerError } from "@/lib/apiHelpers";
import { isValidObjectId } from "mongoose";

type Params = { params: Promise<{ id: string }> };

// Roles a guest should get to meet in advance — surfaced as "Meet the Mentors" cards.
const MENTOR_ROLE_KEYS = ["toastmaster", "generalEvaluator", "tableTopicMaster", "tableTopicEvaluator"] as const;

const normalize = (s: string) => s.trim().toLowerCase();
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) return jsonNotFound("Event not found");
    await dbConnect();
    const event = await Event.findOne({ _id: id, isTemplate: false }).lean();
    if (!event) return jsonNotFound("Event not found");
    const dto = serializeEvent(event as unknown as LeanEvent);
    // Strip attendees and guest-role tokens from public response
    const { attendees: _a, guestRoleLinks: _g, ...pub } = dto;

    // Look up bio/LinkedIn for the people filling the highlighted mentor roles,
    // so guests can see who they're about to meet before the meeting.
    const names = new Set<string>();
    for (const key of MENTOR_ROLE_KEYS) {
      const name = dto.roles[key];
      if (name) names.add(normalize(name));
    }
    for (const speaker of dto.speakers) {
      if (speaker.evaluatorName) names.add(normalize(speaker.evaluatorName));
    }

    const mentors: Record<string, { bio: string; linkedinUrl: string; photoUrl: string }> = {};
    if (names.size > 0) {
      const nameMatchers = Array.from(names).map((n) => new RegExp(`^${escapeRegExp(n)}$`, "i"));

      // A mentor role can be filled by either a Member or a Guest (e.g. via a
      // guest role link), so both collections need checking for bio/LinkedIn/photo.
      const [members, guests] = await Promise.all([
        Member.find({ fullName: { $in: nameMatchers } }).select("fullName bio linkedinUrl photoUrl").lean(),
        Guest.find({ fullName: { $in: nameMatchers } }).select("fullName bio linkedinUrl photoUrl").lean(),
      ]);
      for (const g of guests) {
        mentors[normalize(g.fullName)] = {
          bio: g.bio ?? "",
          linkedinUrl: g.linkedinUrl ?? "",
          photoUrl: g.photoUrl ?? "",
        };
      }
      // Members take precedence over guests on a name collision — a converted
      // member's record is the more authoritative/current one.
      for (const m of members) {
        mentors[normalize(m.fullName)] = {
          bio: m.bio ?? "",
          linkedinUrl: m.linkedinUrl ?? "",
          photoUrl: m.photoUrl ?? "",
        };
      }
    }

    return jsonOk({ ...pub, mentors });
  } catch {
    return jsonServerError();
  }
}

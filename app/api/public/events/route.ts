import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import { serializeEvent, type LeanEvent } from "@/lib/serializers";
import { jsonOk, jsonServerError } from "@/lib/apiHelpers";

export async function GET() {
  try {
    await dbConnect();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await Event.find({ isTemplate: false, date: { $gte: today } })
      .sort({ date: 1 })
      .limit(6)
      .lean();
    const dtos = events.map((e) => {
      const dto = serializeEvent(e as unknown as LeanEvent);
      // Strip attendees from public response
      const { attendees: _a, ...pub } = dto;
      return pub;
    });
    return jsonOk(dtos);
  } catch {
    return jsonServerError();
  }
}

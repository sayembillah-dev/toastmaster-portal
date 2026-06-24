import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import { serializeEvent, type LeanEvent } from "@/lib/serializers";
import { jsonOk, jsonNotFound, jsonServerError } from "@/lib/apiHelpers";
import { isValidObjectId } from "mongoose";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) return jsonNotFound("Event not found");
    await dbConnect();
    const event = await Event.findOne({ _id: id, isTemplate: false }).lean();
    if (!event) return jsonNotFound("Event not found");
    const dto = serializeEvent(event as unknown as LeanEvent);
    // Strip attendees from public response
    const { attendees: _a, ...pub } = dto;
    return jsonOk(pub);
  } catch {
    return jsonServerError();
  }
}

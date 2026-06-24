import { dbConnect } from "@/lib/db";
import { Guest } from "@/models/Guest";
import { Event } from "@/models/Event";
import { jsonOk, jsonBadRequest, jsonServerError } from "@/lib/apiHelpers";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const schema = z.object({
  fullName: z.string().min(2, "Full name is required").max(80).trim(),
  email: z.string().email().toLowerCase().optional().or(z.literal("")),
  phone: z.string().max(20).trim().optional().or(z.literal("")),
  whatsapp: z.string().max(20).trim().optional().or(z.literal("")),
  whatsappSameAsPhone: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  details: z.string().max(2000).trim().optional().or(z.literal("")),
  preferredRole: z.string().max(80).trim().optional().or(z.literal("")),
  eventId: z.string().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const form = await req.formData().catch(() => null);
    if (!form) return jsonBadRequest("Invalid form data");

    const raw = Object.fromEntries(form.entries());
    const photoFile = form.get("photo") as File | null;
    const { photo: _photo, ...fields } = raw;

    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return jsonBadRequest(firstError ?? "Invalid input");
    }

    const { whatsappSameAsPhone, eventId, preferredRole, ...rest } = parsed.data;
    const phone = rest.phone || "";

    // Find or create guest — deduplicate by phone
    let guest = phone ? await Guest.findOne({ phone }) : null;
    if (!guest) {
      guest = await Guest.create({
        ...rest,
        whatsapp: whatsappSameAsPhone ? phone : rest.whatsapp ?? "",
        whatsappSameAsPhone,
        preferredRole: preferredRole ?? "",
        visitDate: new Date(),
        followUpStatus: "new",
      });

      if (photoFile && photoFile.size > 0) {
        try {
          const bytes = await photoFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const result = await new Promise<{ secure_url: string; public_id: string }>(
            (resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "ntc/guests", resource_type: "image" },
                (error, res) => {
                  if (error || !res) return reject(error ?? new Error("Upload failed"));
                  resolve(res);
                },
              );
              stream.end(buffer);
            },
          );
          guest!.photoUrl = result.secure_url;
          guest!.photoPublicId = result.public_id;
          await guest!.save();
        } catch {
          // Photo upload failed — guest still saved without photo
        }
      }
    }

    // Add to event attendees if eventId provided
    if (eventId) {
      const guestId = String(guest._id);
      const event = await Event.findOne({ _id: eventId, isTemplate: false });
      if (event) {
        const already = event.attendees.some(
          (a: { guestId: string; phone: string }) => a.guestId === guestId || (phone && a.phone === phone),
        );
        if (!already) {
          event.attendees.push({
            name: guest.fullName,
            email: guest.email || "",
            phone: phone,
            guestId,
            notes: preferredRole ? `Preferred role: ${preferredRole}` : "",
          });
          await event.save();
        }
      }
    }

    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

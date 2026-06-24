import { dbConnect } from "@/lib/db";
import { Guest } from "@/models/Guest";
import { serializeGuest, type LeanGuest } from "@/lib/serializers";
import { jsonOk, jsonBadRequest, jsonServerError } from "@/lib/apiHelpers";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const publicGuestSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(80).trim(),
  email: z.string().email().toLowerCase().optional().or(z.literal("")),
  phone: z.string().max(20).trim().optional().or(z.literal("")),
  whatsapp: z.string().max(20).trim().optional().or(z.literal("")),
  whatsappSameAsPhone: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  details: z.string().max(2000).trim().optional().or(z.literal("")),
  preferredRole: z.string().max(80).trim().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const form = await req.formData().catch(() => null);
    if (!form) return jsonBadRequest("Invalid form data");

    const raw = Object.fromEntries(form.entries());
    const photoFile = form.get("photo") as File | null;
    // Remove photo from fields before validation
    const { photo: _photo, ...fields } = raw;

    const parsed = publicGuestSchema.safeParse(fields);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return jsonBadRequest(firstError ?? "Invalid input");
    }

    const { whatsappSameAsPhone, ...rest } = parsed.data;

    const doc = await Guest.create({
      ...rest,
      whatsapp: whatsappSameAsPhone ? rest.phone ?? "" : rest.whatsapp ?? "",
      whatsappSameAsPhone,
      visitDate: new Date(),
      followUpStatus: "new",
    });

    // Upload photo if provided
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

        doc.photoUrl = result.secure_url;
        doc.photoPublicId = result.public_id;
        await doc.save();
      } catch {
        // Photo upload failed — guest is still saved, just without photo
      }
    }

    return jsonOk(serializeGuest(doc.toObject() as unknown as LeanGuest), { status: 201 });
  } catch {
    return jsonServerError();
  }
}

import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { Guest } from "@/models/Guest";
import { serializeGuest, type LeanGuest } from "@/lib/serializers";
import { jsonOk, jsonBadRequest, jsonNotFound, jsonServerError } from "@/lib/apiHelpers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;

    const existing = await Guest.findById(id);
    if (!existing) return jsonNotFound("Guest not found");

    const form = await req.formData();
    const file = form.get("photo") as File | null;
    if (!file) return jsonBadRequest("No photo file provided");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (existing.photoPublicId) {
      await cloudinary.uploader.destroy(existing.photoPublicId).catch(() => null);
    }

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

    const updated = await Guest.findByIdAndUpdate(
      id,
      { photoUrl: result.secure_url, photoPublicId: result.public_id },
      { new: true },
    ).lean();

    return jsonOk(serializeGuest(updated as unknown as LeanGuest));
  } catch {
    return jsonServerError("Photo upload failed");
  }
}

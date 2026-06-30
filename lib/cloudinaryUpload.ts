import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function saveFile(
  folder: "resources" | "documents",
  file: File,
): Promise<{ publicUrl: string; publicId: string; originalFilename: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `ntc/${folder}`, resource_type: "auto" },
        (err, res) => {
          if (err || !res) reject(err ?? new Error("Upload failed"));
          else resolve(res as { secure_url: string; public_id: string });
        },
      ).end(buffer);
    },
  );

  return {
    publicUrl:        result.secure_url,
    publicId:         result.public_id,
    originalFilename: file.name,
  };
}

export async function deleteFile(publicId: string): Promise<void> {
  if (!publicId || publicId.startsWith("/uploads/")) return;
  const r = await cloudinary.uploader
    .destroy(publicId, { resource_type: "image" })
    .catch(() => null);
  if (r?.result !== "ok") {
    await cloudinary.uploader
      .destroy(publicId, { resource_type: "raw" })
      .catch(() => null);
  }
}

export function getDownloadUrl(publicUrl: string): string {
  if (!publicUrl?.includes("cloudinary.com")) return publicUrl;
  return publicUrl.replace("/upload/", "/upload/fl_attachment/");
}

export { getContentType } from "./localUpload";

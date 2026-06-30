import { writeFile, unlink, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const PUBLIC_DIR = join(process.cwd(), "public");

export async function saveFile(
  subdir: "resources" | "documents",
  file: File,
): Promise<{ publicUrl: string; originalFilename: string }> {
  const dir = join(PUBLIC_DIR, "uploads", subdir);
  await mkdir(dir, { recursive: true });

  const ext = extname(file.name);
  const uniqueName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, uniqueName), buffer);

  return {
    publicUrl: `/uploads/${subdir}/${uniqueName}`,
    originalFilename: file.name,
  };
}

export async function deleteFile(publicUrl: string): Promise<void> {
  if (!publicUrl.startsWith("/uploads/")) return;
  const filePath = join(PUBLIC_DIR, publicUrl);
  await unlink(filePath).catch(() => null);
}

export function getContentType(filename: string, stored?: string): string {
  if (stored) return stored;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    pdf: "application/pdf", txt: "text/plain", csv: "text/csv",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip", mp4: "video/mp4", mp3: "audio/mpeg",
  };
  return map[ext] ?? "application/octet-stream";
}

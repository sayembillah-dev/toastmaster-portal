import { readFile } from "fs/promises";
import { join } from "path";
import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubDocument } from "@/models/ClubDocument";
import { jsonNotFound, jsonBadRequest, jsonServerError } from "@/lib/apiHelpers";
import { getContentType } from "@/lib/localUpload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const doc = await ClubDocument.findById(id).lean();
    if (!doc) return jsonNotFound("Document not found");
    if (doc.type !== "file" || !doc.fileUrl) return jsonBadRequest("Not a downloadable file");

    const filename = doc.originalFilename || doc.title;
    const filePath = join(process.cwd(), "public", doc.fileUrl);
    const buffer   = await readFile(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type":        getContentType(filename, doc.mimeType),
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "_")}"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch {
    return jsonServerError();
  }
}

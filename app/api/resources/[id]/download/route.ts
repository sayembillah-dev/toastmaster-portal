import { readFile } from "fs/promises";
import { join } from "path";
import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubResource } from "@/models/ClubResource";
import { jsonNotFound, jsonServerError } from "@/lib/apiHelpers";
import { getContentType } from "@/lib/localUpload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const doc = await ClubResource.findById(id).lean();
    if (!doc) return jsonNotFound("Resource not found");

    const filename = doc.originalFilename || `${doc.title}.jpg`;
    const filePath = join(process.cwd(), "public", doc.imageUrl);
    const buffer   = await readFile(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type":        getContentType(filename),
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "_")}"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch {
    return jsonServerError();
  }
}

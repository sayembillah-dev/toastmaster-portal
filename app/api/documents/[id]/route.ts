import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubDocument } from "@/models/ClubDocument";
import { jsonOk, jsonNotFound, jsonServerError } from "@/lib/apiHelpers";
import { deleteFile } from "@/lib/cloudinaryUpload";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const doc = await ClubDocument.findById(id);
    if (!doc) return jsonNotFound("Document not found");

    if (doc.filePublicId || doc.fileUrl) await deleteFile(doc.filePublicId || doc.fileUrl);

    await doc.deleteOne();
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

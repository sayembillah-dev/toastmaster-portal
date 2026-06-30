import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubDocument } from "@/models/ClubDocument";
import { jsonNotFound, jsonBadRequest, jsonServerError } from "@/lib/apiHelpers";
import { getDownloadUrl } from "@/lib/cloudinaryUpload";

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

    return Response.redirect(getDownloadUrl(doc.fileUrl));
  } catch {
    return jsonServerError();
  }
}

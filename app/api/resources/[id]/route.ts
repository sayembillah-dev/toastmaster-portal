import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubResource } from "@/models/ClubResource";
import { jsonOk, jsonNotFound, jsonServerError } from "@/lib/apiHelpers";
import { deleteFile } from "@/lib/localUpload";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;

    const doc = await ClubResource.findById(id);
    if (!doc) return jsonNotFound("Resource not found");

    await deleteFile(doc.imageUrl);
    await doc.deleteOne();
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

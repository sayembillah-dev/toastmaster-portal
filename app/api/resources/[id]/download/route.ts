import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubResource } from "@/models/ClubResource";
import { jsonNotFound, jsonServerError } from "@/lib/apiHelpers";
import { getDownloadUrl } from "@/lib/cloudinaryUpload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const doc = await ClubResource.findById(id).lean();
    if (!doc) return jsonNotFound("Resource not found");

    return Response.redirect(getDownloadUrl(doc.imageUrl));
  } catch {
    return jsonServerError();
  }
}

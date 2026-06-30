import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubResource } from "@/models/ClubResource";
import { serializeClubResource, type LeanClubResource } from "@/lib/serializers";
import { jsonOk, jsonBadRequest, jsonServerError } from "@/lib/apiHelpers";
import { saveFile } from "@/lib/cloudinaryUpload";

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const q        = searchParams.get("q")?.trim();
    const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? String(PAGE_SIZE))));

    const filter: Record<string, unknown> = {};
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }];

    const skip = (page - 1) * pageSize;
    const [total, docs] = await Promise.all([
      ClubResource.countDocuments(filter),
      ClubResource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    ]);

    return jsonOk({
      data:       docs.map((r) => serializeClubResource(r as unknown as LeanClubResource)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return jsonServerError();
  }
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const form  = await req.formData();
    const title = (form.get("title") as string | null)?.trim();
    const file  = form.get("image") as File | null;

    if (!title) return jsonBadRequest("Title is required");
    if (!file)  return jsonBadRequest("Image file is required");

    const { publicUrl, publicId, originalFilename } = await saveFile("resources", file);

    const doc = await ClubResource.create({
      title,
      imageUrl:         publicUrl,
      imagePublicId:    publicId,
      originalFilename,
    });

    return jsonOk(serializeClubResource(doc.toObject() as unknown as LeanClubResource), { status: 201 });
  } catch {
    return jsonServerError("Upload failed");
  }
}

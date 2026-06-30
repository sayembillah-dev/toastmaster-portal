import { dbConnect } from "@/lib/db";
import { requireSession } from "@/lib/serverAuth";
import { ClubDocument } from "@/models/ClubDocument";
import { serializeClubDocument, type LeanClubDocument } from "@/lib/serializers";
import { jsonOk, jsonBadRequest, jsonServerError } from "@/lib/apiHelpers";
import { saveFile } from "@/lib/cloudinaryUpload";

const PAGE_SIZE = 15;

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const q        = searchParams.get("q")?.trim();
    const type     = searchParams.get("type");
    const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? String(PAGE_SIZE))));

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (q)    filter.$or  = [{ title: { $regex: q, $options: "i" } }];

    const skip = (page - 1) * pageSize;
    const [total, docs] = await Promise.all([
      ClubDocument.countDocuments(filter),
      ClubDocument.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    ]);

    return jsonOk({
      data:       docs.map((d) => serializeClubDocument(d as unknown as LeanClubDocument)),
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
    const contentType = req.headers.get("content-type") ?? "";

    // ── File upload ──────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const form  = await req.formData();
      const title = (form.get("title") as string | null)?.trim();
      const file  = form.get("file") as File | null;

      if (!title) return jsonBadRequest("Title is required");
      if (!file)  return jsonBadRequest("File is required");

      const { publicUrl, publicId, originalFilename } = await saveFile("documents", file);

      const doc = await ClubDocument.create({
        type:             "file",
        title,
        fileUrl:          publicUrl,
        filePublicId:     publicId,
        originalFilename,
        mimeType:         file.type,
      });

      return jsonOk(serializeClubDocument(doc.toObject() as unknown as LeanClubDocument), { status: 201 });
    }

    // ── Link or text (JSON) ──────────────────────────────────────────────────
    const body = await req.json().catch(() => null);
    if (!body) return jsonBadRequest("Invalid request body");

    const { type, title, url, description, content } = body;

    if (!type || !["link", "text"].includes(type)) return jsonBadRequest("type must be 'link' or 'text'");
    if (!title?.trim()) return jsonBadRequest("Title is required");
    if (type === "link" && !url?.trim()) return jsonBadRequest("URL is required for a link");
    if (type === "text" && !content?.trim()) return jsonBadRequest("Content is required for a text entry");

    const doc = await ClubDocument.create({
      type,
      title:       title.trim(),
      url:         url?.trim() ?? "",
      description: description?.trim() ?? "",
      content:     content?.trim() ?? "",
    });

    return jsonOk(serializeClubDocument(doc.toObject() as unknown as LeanClubDocument), { status: 201 });
  } catch {
    return jsonServerError("Failed to create document");
  }
}

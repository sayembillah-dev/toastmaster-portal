import { signSession, setSessionCookie } from "@/lib/auth";
import { jsonOk, jsonUnauthorized, jsonBadRequest, jsonServerError } from "@/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.password !== "string") {
      return jsonBadRequest("Password is required");
    }

    const expected = process.env.SITE_PASSWORD;
    if (!expected) {
      return jsonServerError("Server is not configured");
    }

    if (body.password !== expected) {
      return jsonUnauthorized("Incorrect password");
    }

    const token = await signSession();
    await setSessionCookie(token);
    return jsonOk({ ok: true });
  } catch {
    return jsonServerError();
  }
}

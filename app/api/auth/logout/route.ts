import { clearSessionCookie } from "@/lib/auth";
import { jsonOk } from "@/lib/apiHelpers";

export async function POST() {
  await clearSessionCookie();
  return jsonOk({ ok: true });
}

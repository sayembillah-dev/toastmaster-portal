import { getSession } from "./auth";
import { jsonUnauthorized } from "./apiHelpers";

export async function requireSession() {
  const session = await getSession();
  if (!session?.authenticated) {
    return { ok: false, response: jsonUnauthorized() } as const;
  }
  return { ok: true } as const;
}

import { randomBytes } from "crypto";

// 24 random bytes (192 bits) as a URL-safe token — the sole credential for a guest role link.
export function generateGuestToken(): string {
  return randomBytes(24).toString("base64url");
}

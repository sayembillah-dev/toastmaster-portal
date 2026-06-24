import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
export const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "ntc_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const secretKey = () => {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(JWT_SECRET);
};

export type SessionPayload = { authenticated: boolean; iat?: number; exp?: number };

export async function signSession(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

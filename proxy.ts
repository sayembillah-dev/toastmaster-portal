import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "ntc_session";

// Pages that redirect to /members when already signed in
const AUTH_PAGES = ["/login"];
// Pages always accessible without auth (exact or prefix matches below)
const PUBLIC_PAGES = ["/", "/join", "/meetings"];
const PUBLIC_PAGE_PREFIXES = ["/meetings/"];
const PUBLIC_API_PREFIXES = ["/api/auth/", "/api/public/"];

async function tokenIsValid(token: string | undefined): Promise<boolean> {
  if (!token || !JWT_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthed = await tokenIsValid(token);

  // Auth pages: bounce to /members if already signed in
  if (AUTH_PAGES.includes(pathname)) {
    if (isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = "/members";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Public pages: always allow through
  if (PUBLIC_PAGES.includes(pathname) || PUBLIC_PAGE_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Public APIs: always allow through
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protected API: 401 JSON
  if (pathname.startsWith("/api/")) {
    if (!isAuthed) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not signed in" } },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // Protected pages: redirect to /login with ?next=
  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|js|css)$).*)",
  ],
};

// TEMPORARY — DELETE AFTER USE. Do not deploy to production.
// Triggers a one-time server-side log of sensitive env vars so their values
// can be read from the Vercel deployment logs (Sensitive vars can't be pulled via CLI).

const TRIGGER_KEY = "recover-envs-a1f9c3";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("key") !== TRIGGER_KEY) {
    return new Response("Not found", { status: 404 });
  }

  console.log("[debug-env] JWT_SECRET:", process.env.JWT_SECRET);
  console.log("[debug-env] JWT_COOKIE_NAME:", process.env.JWT_COOKIE_NAME);
  console.log("[debug-env] MONGODB_URI:", process.env.MONGODB_URI);
  console.log("[debug-env] SITE_PASSWORD:", process.env.SITE_PASSWORD);
  console.log("[debug-env] CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("[debug-env] CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
  console.log("[debug-env] CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);

  return new Response("logged", { status: 200 });
}

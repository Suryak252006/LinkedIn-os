import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function adminDb() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function userDb() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return jar.getAll(); },
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) => jar.set(name, value, options));
          } catch {
            // Server Components cannot write cookies; route handlers can.
          }
        }
      }
    }
  );
}

export async function requireUser() {
  const db = await userDb();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw new Error("UNAUTHORIZED");

  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) throw new Error("OWNER_EMAIL_NOT_CONFIGURED");
  if (user.email?.trim().toLowerCase() !== ownerEmail) {
    throw new Error("UNAUTHORIZED");
  }

  return { db, user };
}

export function authorizedWorker(req: Request) {
  const key = req.headers.get("authorization");
  const expected = process.env.WORKER_SECRET;
  if (!expected || !key || key !== ("Bearer " + expected)) throw new Error("UNAUTHORIZED_WORKER");
}

export function errorResponse(e: unknown) {
  const msg = e instanceof Error ? e.message : "Unexpected error";
  const status = msg.startsWith("UNAUTHORIZED") ? 401 : msg.includes("not found") ? 404 : 400;
  return Response.json({ error: msg }, { status });
}
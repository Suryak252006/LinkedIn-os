import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

  if (!ownerEmail) {
    return NextResponse.redirect(new URL("/login?error=setup", request.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    response.headers.set("Location", new URL("/login?error=auth_failed", request.url).toString());
    return response;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.trim().toLowerCase() !== ownerEmail) {
    await supabase.auth.signOut();
    response.headers.set("Location", new URL("/login?error=unauthorized", request.url).toString());
    return response;
  }

  return response;
}
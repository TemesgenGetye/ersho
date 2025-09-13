import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const supabaseUrl = "https://rzelceaqcdwskuxawrbv.supabase.co/";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZWxjZWFxY2R3c2t1eGF3cmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzAzMzcsImV4cCI6MjA3MzIwNjMzN30.F_BGRgVU-xA9h_-G3h5p32Qqr1CKJG1Adzn4-2_DHmM";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes - let the admin page handle its own authentication
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Don't redirect here - let the admin page handle authentication
    return res;
  }

  // Protect submit-image route
  if (req.nextUrl.pathname === "/submit-image") {
    if (!session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/submit-image"],
};

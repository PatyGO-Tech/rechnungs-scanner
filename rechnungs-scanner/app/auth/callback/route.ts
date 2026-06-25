import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google/OAuth ruft diese Route nach erfolgreichem Login auf.
// Hier wird der Auth-Code gegen eine Nutzer-Session getauscht.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Bei Fehler zurück zum Login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}

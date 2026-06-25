import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pfad = request.nextUrl.pathname;
  const istAuthSeite = pfad.startsWith("/login") || pfad.startsWith("/register");

  // Nicht eingeloggt + nicht auf Auth-Seite -> zum Login
  if (!user && !istAuthSeite) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Eingeloggt + auf Auth-Seite -> zur Hauptseite
  if (user && istAuthSeite) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Alle Routen außer statischen Dateien und der Scan-API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/scan-invoice|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

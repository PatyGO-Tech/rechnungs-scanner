"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });

    if (error) {
      setError("Login fehlgeschlagen: E-Mail oder Passwort falsch.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Google-Login fehlgeschlagen: " + error.message);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #f9e4e4 0%, #f5d5cc 50%, #ecddd8 100%)" }}
    >
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.7)" }}>
        <h1 className="text-2xl font-bold mb-1 text-[#8b5e5e]">Anmelden</h1>
        <p className="text-[#a07878] mb-6 text-sm">Melde dich an, um deine Rechnungen zu sehen.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#a07878] mb-1">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[#8b5e5e] outline-none"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #d4b0aa" }}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#a07878] mb-1">Passwort</label>
            <input
              type="password"
              required
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[#8b5e5e] outline-none"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #d4b0aa" }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm text-[#8b3a3a]" style={{ background: "rgba(255,200,200,0.5)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #c4827a, #d4938a)" }}
          >
            {loading ? "Anmelden..." : "Einloggen"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "#d4b0aa" }} />
          <span className="text-xs text-[#a07878]">oder</span>
          <div className="flex-1 h-px" style={{ background: "#d4b0aa" }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-xl font-semibold text-[#8b5e5e] flex items-center justify-center gap-2 transition-all"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #d4b0aa" }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 13.9-5.3l-6.4-5.4C29.4 34.5 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.4 5.4C41.4 36.5 43.5 30.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
          Mit Google anmelden
        </button>

        <p className="text-sm text-[#a07878] mt-6 text-center">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-[#c4827a] font-semibold underline">
            Registrieren
          </Link>
        </p>
      </div>
    </main>
  );
}

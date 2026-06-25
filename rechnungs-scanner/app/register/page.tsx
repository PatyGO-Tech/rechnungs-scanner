"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [passwort2, setPasswort2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwort !== passwort2) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (passwort.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password: passwort });

    if (error) {
      setError("Registrierung fehlgeschlagen: " + error.message);
      setLoading(false);
      return;
    }

    // Falls E-Mail-Bestätigung aktiv ist, gibt es noch keine Session
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setErfolg(true);
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #f9e4e4 0%, #f5d5cc 50%, #ecddd8 100%)" }}
    >
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.7)" }}>
        <h1 className="text-2xl font-bold mb-1 text-[#8b5e5e]">Registrieren</h1>
        <p className="text-[#a07878] mb-6 text-sm">Erstelle dein Konto für den Rechnungs-Scanner.</p>

        {erfolg ? (
          <div className="p-4 rounded-lg text-sm text-[#8b5e5e]" style={{ background: "rgba(200,255,200,0.4)" }}>
            Konto erstellt! Bitte bestätige ggf. deine E-Mail und{" "}
            <Link href="/login" className="text-[#c4827a] font-semibold underline">
              melde dich an
            </Link>
            .
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
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
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#a07878] mb-1">Passwort bestätigen</label>
              <input
                type="password"
                required
                value={passwort2}
                onChange={(e) => setPasswort2(e.target.value)}
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
              {loading ? "Konto wird erstellt..." : "Registrieren"}
            </button>
          </form>
        )}

        <p className="text-sm text-[#a07878] mt-6 text-center">
          Schon ein Konto?{" "}
          <Link href="/login" className="text-[#c4827a] font-semibold underline">
            Anmelden
          </Link>
        </p>
      </div>
    </main>
  );
}

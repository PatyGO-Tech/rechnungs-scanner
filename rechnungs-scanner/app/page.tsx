"use client";

import { useState } from "react";

interface Position {
  beschreibung: string;
  menge: string | null;
  einzelpreis: string | null;
  gesamtpreis: string | null;
}

interface InvoiceData {
  rechnungsnummer: string | null;
  datum: string | null;
  faelligkeitsdatum: string | null;
  absender: {
    name: string | null;
    adresse: string | null;
    email: string | null;
    telefon: string | null;
  };
  empfaenger: {
    name: string | null;
    adresse: string | null;
  };
  positionen: Position[];
  zwischensumme: string | null;
  steuer: string | null;
  gesamtbetrag: string | null;
  waehrung: string | null;
  zahlungsmethode: string | null;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/scan-invoice", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6" style={{background: "linear-gradient(135deg, #f9e4e4 0%, #f5d5cc 50%, #ecddd8 100%)"}}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[#8b5e5e]">Rechnungs-Scanner</h1>
        <p className="text-[#a07878] mb-8">Lade eine Rechnung hoch – KI extrahiert alle Daten automatisch.</p>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? "border-[#d4938a] bg-[#f5e0dc]" : "border-[#d4b0aa] hover:border-[#c49090]"
          }`}
          style={{background: "rgba(255,255,255,0.5)"}}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <p className="text-[#8b5e5e] font-medium">✓ {file.name}</p>
          ) : (
            <>
              <p className="text-4xl mb-3">📄</p>
              <p className="text-[#8b5e5e]">Rechnung hier ablegen oder klicken</p>
              <p className="text-[#a07878] text-sm mt-1">JPG, PNG, PDF</p>
            </>
          )}
        </div>

        <button
          onClick={handleScan}
          disabled={!file || loading}
          className="mt-4 w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{background: "linear-gradient(135deg, #c4827a, #d4938a)"}}
        >
          {loading ? "Analysiere..." : "Rechnung scannen"}
        </button>

        {error && (
          <div className="mt-6 p-4 rounded-xl text-[#8b3a3a]" style={{background: "rgba(255,200,200,0.5)", border: "1px solid #d4938a"}}>
            Fehler: {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <section className="rounded-xl p-5" style={{background: "rgba(255,255,255,0.6)"}}>
              <h2 className="text-lg font-semibold mb-4 text-[#c4827a]">Rechnungsdaten</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Rechnungsnummer" value={result.rechnungsnummer} />
                <Field label="Datum" value={result.datum} />
                <Field label="Fälligkeitsdatum" value={result.faelligkeitsdatum} />
                <Field label="Zahlungsmethode" value={result.zahlungsmethode} />
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <section className="rounded-xl p-5" style={{background: "rgba(255,255,255,0.6)"}}>
                <h2 className="text-lg font-semibold mb-3 text-[#c4827a]">Absender</h2>
                <div className="space-y-2 text-sm">
                  <Field label="Name" value={result.absender?.name} />
                  <Field label="Adresse" value={result.absender?.adresse} />
                  <Field label="E-Mail" value={result.absender?.email} />
                  <Field label="Telefon" value={result.absender?.telefon} />
                </div>
              </section>
              <section className="rounded-xl p-5" style={{background: "rgba(255,255,255,0.6)"}}>
                <h2 className="text-lg font-semibold mb-3 text-[#c4827a]">Empfänger</h2>
                <div className="space-y-2 text-sm">
                  <Field label="Name" value={result.empfaenger?.name} />
                  <Field label="Adresse" value={result.empfaenger?.adresse} />
                </div>
              </section>
            </div>

            {result.positionen?.length > 0 && (
              <section className="rounded-xl p-5" style={{background: "rgba(255,255,255,0.6)"}}>
                <h2 className="text-lg font-semibold mb-4 text-[#c4827a]">Positionen</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#a07878] border-b border-[#d4b0aa]">
                      <th className="text-left pb-2">Beschreibung</th>
                      <th className="text-right pb-2">Menge</th>
                      <th className="text-right pb-2">Einzelpreis</th>
                      <th className="text-right pb-2">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.positionen.map((p, i) => (
                      <tr key={i} className="border-b border-[#e8ccc8]">
                        <td className="py-2 text-[#8b5e5e]">{p.beschreibung}</td>
                        <td className="text-right py-2 text-[#a07878]">{p.menge ?? "-"}</td>
                        <td className="text-right py-2 text-[#a07878]">{p.einzelpreis ?? "-"}</td>
                        <td className="text-right py-2 text-[#a07878]">{p.gesamtpreis ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <section className="rounded-xl p-5" style={{background: "rgba(255,255,255,0.6)"}}>
              <h2 className="text-lg font-semibold mb-4 text-[#c4827a]">Beträge</h2>
              <div className="space-y-2 text-sm">
                <Field label="Zwischensumme" value={result.zwischensumme} />
                <Field label="Steuer" value={result.steuer} />
                <div className="flex justify-between pt-2 border-t border-[#d4b0aa] font-bold text-[#8b5e5e] text-base">
                  <span>Gesamtbetrag</span>
                  <span>{result.gesamtbetrag ?? "-"} {result.waehrung ?? ""}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#a07878] text-xs uppercase tracking-wide">{label}</span>
      <span className="text-[#8b5e5e]">{value ?? "-"}</span>
    </div>
  );
}

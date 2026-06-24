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
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-white">Rechnungs-Scanner</h1>
        <p className="text-gray-400 mb-8">Lade eine Rechnung hoch – KI extrahiert alle Daten automatisch.</p>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? "border-blue-400 bg-blue-950" : "border-gray-700 hover:border-gray-500"
          }`}
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
            <p className="text-green-400 font-medium">✓ {file.name}</p>
          ) : (
            <>
              <p className="text-4xl mb-3">📄</p>
              <p className="text-gray-300">Rechnung hier ablegen oder klicken</p>
              <p className="text-gray-500 text-sm mt-1">JPG, PNG, PDF</p>
            </>
          )}
        </div>

        <button
          onClick={handleScan}
          disabled={!file || loading}
          className="mt-4 w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Analysiere..." : "Rechnung scannen"}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-950 border border-red-700 rounded-xl text-red-300">
            Fehler: {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <section className="bg-gray-900 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4 text-blue-400">Rechnungsdaten</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Rechnungsnummer" value={result.rechnungsnummer} />
                <Field label="Datum" value={result.datum} />
                <Field label="Fälligkeitsdatum" value={result.faelligkeitsdatum} />
                <Field label="Zahlungsmethode" value={result.zahlungsmethode} />
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <section className="bg-gray-900 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-3 text-blue-400">Absender</h2>
                <div className="space-y-2 text-sm">
                  <Field label="Name" value={result.absender.name} />
                  <Field label="Adresse" value={result.absender.adresse} />
                  <Field label="E-Mail" value={result.absender.email} />
                  <Field label="Telefon" value={result.absender.telefon} />
                </div>
              </section>
              <section className="bg-gray-900 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-3 text-blue-400">Empfänger</h2>
                <div className="space-y-2 text-sm">
                  <Field label="Name" value={result.empfaenger.name} />
                  <Field label="Adresse" value={result.empfaenger.adresse} />
                </div>
              </section>
            </div>

            {result.positionen?.length > 0 && (
              <section className="bg-gray-900 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-4 text-blue-400">Positionen</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left pb-2">Beschreibung</th>
                      <th className="text-right pb-2">Menge</th>
                      <th className="text-right pb-2">Einzelpreis</th>
                      <th className="text-right pb-2">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.positionen.map((p, i) => (
                      <tr key={i} className="border-b border-gray-800">
                        <td className="py-2">{p.beschreibung}</td>
                        <td className="text-right py-2 text-gray-300">{p.menge ?? "-"}</td>
                        <td className="text-right py-2 text-gray-300">{p.einzelpreis ?? "-"}</td>
                        <td className="text-right py-2 text-gray-300">{p.gesamtpreis ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <section className="bg-gray-900 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4 text-blue-400">Beträge</h2>
              <div className="space-y-2 text-sm">
                <Field label="Zwischensumme" value={result.zwischensumme} />
                <Field label="Steuer" value={result.steuer} />
                <div className="flex justify-between pt-2 border-t border-gray-700 font-bold text-white text-base">
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
      <span className="text-gray-500 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-gray-200">{value ?? "-"}</span>
    </div>
  );
}

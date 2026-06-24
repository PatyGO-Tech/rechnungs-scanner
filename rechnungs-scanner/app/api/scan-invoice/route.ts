import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Du bist ein Rechnungs-Analyse-Assistent.
Analysiere die hochgeladene Rechnung und extrahiere alle wichtigen Daten.
Antworte NUR mit einem validen JSON-Objekt, ohne Markdown, ohne Erklärungen.

Das JSON muss exakt dieses Format haben:
{
  "rechnungsnummer": "string oder null",
  "datum": "string oder null",
  "faelligkeitsdatum": "string oder null",
  "absender": {
    "name": "string oder null",
    "adresse": "string oder null",
    "email": "string oder null",
    "telefon": "string oder null"
  },
  "empfaenger": {
    "name": "string oder null",
    "adresse": "string oder null"
  },
  "positionen": [
    {
      "beschreibung": "string",
      "menge": "string oder null",
      "einzelpreis": "string oder null",
      "gesamtpreis": "string oder null"
    }
  ],
  "zwischensumme": "string oder null",
  "steuer": "string oder null",
  "gesamtbetrag": "string oder null",
  "waehrung": "string oder null",
  "zahlungsmethode": "string oder null"
}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const invoiceData = JSON.parse(cleaned);

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error("Fehler beim Scannen:", error);
    return NextResponse.json({ error: "Fehler beim Verarbeiten der Rechnung" }, { status: 500 });
  }
}

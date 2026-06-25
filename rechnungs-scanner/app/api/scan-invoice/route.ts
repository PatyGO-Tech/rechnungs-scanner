import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Erzwingt exakt diese Felder als Structured Output (kein Fließtext möglich)
const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    rechnungsnummer: { type: SchemaType.STRING, nullable: true },
    datum: { type: SchemaType.STRING, nullable: true },
    faelligkeitsdatum: { type: SchemaType.STRING, nullable: true },
    absender: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, nullable: true },
        adresse: { type: SchemaType.STRING, nullable: true },
        email: { type: SchemaType.STRING, nullable: true },
        telefon: { type: SchemaType.STRING, nullable: true },
      },
    },
    empfaenger: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, nullable: true },
        adresse: { type: SchemaType.STRING, nullable: true },
      },
    },
    positionen: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          beschreibung: { type: SchemaType.STRING },
          menge: { type: SchemaType.STRING, nullable: true },
          einzelpreis: { type: SchemaType.STRING, nullable: true },
          gesamtpreis: { type: SchemaType.STRING, nullable: true },
        },
      },
    },
    zwischensumme: { type: SchemaType.STRING, nullable: true },
    steuer: { type: SchemaType.STRING, nullable: true },
    gesamtbetrag: { type: SchemaType.STRING, nullable: true },
    waehrung: { type: SchemaType.STRING, nullable: true },
    zahlungsmethode: { type: SchemaType.STRING, nullable: true },
  },
};

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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    // Bis zu 4 Versuche, falls Google's Server kurz überlastet ist (503)
    let result;
    let lastError;
    for (let versuch = 1; versuch <= 4; versuch++) {
      try {
        result = await model.generateContent([
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
        ]);
        break; // Erfolg, Schleife verlassen
      } catch (err) {
        lastError = err;
        const istUeberlastet = String(err).includes("503") || String(err).includes("overloaded");
        if (istUeberlastet && versuch < 4) {
          // kurz warten und erneut versuchen (1s, 2s, 4s)
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, versuch - 1)));
          continue;
        }
        throw err;
      }
    }
    if (!result) throw lastError;

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const invoiceData = JSON.parse(cleaned);

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error("Fehler beim Scannen:", error);
    const msg = String(error).includes("503") || String(error).includes("overloaded")
      ? "Das KI-Modell ist gerade überlastet. Bitte in ein paar Sekunden erneut versuchen."
      : "Fehler beim Verarbeiten der Rechnung";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

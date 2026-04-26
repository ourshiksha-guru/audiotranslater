import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

const SYSTEM_PROMPTS: Record<string, string> = {
  tanglish:
    "You are an expert translator. Convert the given English text into Tanglish " +
    "(Tamil words written in English script naturally mixed with English). " +
    "Keep the meaning clear and conversational. Preserve technical terms and proper nouns as-is. " +
    "Return ONLY the translated text, no explanation.",
  hinglish:
    "You are an expert translator. Convert the given English text into Hinglish " +
    "(Hindi words written in English script naturally mixed with English). " +
    "Keep the meaning clear and conversational. Preserve technical terms and proper nouns as-is. " +
    "Return ONLY the translated text, no explanation.",
};

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  let body: { segments: Segment[]; targetLang: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { segments, targetLang } = body;
  if (!segments?.length || !targetLang) {
    return NextResponse.json({ error: "Missing segments or targetLang" }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[targetLang];
  if (!systemPrompt) {
    return NextResponse.json({ error: "Unsupported targetLang" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const combined = segments.map((s) => `[${s.id}] ${s.text}`).join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            `Translate each numbered line. Return in the same [id] text format.\n\n${combined}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content ?? "";

    const lineMap: Record<number, string> = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\[(\d+)\]\s*(.+)/);
      if (m) lineMap[parseInt(m[1])] = m[2].trim();
    }

    const translatedSegments: Segment[] = segments.map((s) => ({
      ...s,
      text: lineMap[s.id] ?? s.text,
    }));

    const fullText = translatedSegments.map((s) => s.text).join(" ");

    return NextResponse.json({ text: fullText, segments: translatedSegments, targetLang });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

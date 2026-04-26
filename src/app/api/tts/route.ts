import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

type Voice = "nova" | "shimmer" | "alloy" | "echo" | "fable" | "onyx";

const VOICE_MAP: Record<string, Voice> = {
  tanglish: "nova",
  hinglish: "shimmer",
};

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  let body: { text: string; targetLang: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, targetLang } = body;
  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const voice = VOICE_MAP[targetLang] ?? "nova";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const mp3 = await client.audio.speech.create({
      model: "tts-1-hd",
      voice,
      input: text.slice(0, 4000),
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="tts_${targetLang}.mp3"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

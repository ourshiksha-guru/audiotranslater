import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("audio");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const audioFile = new File([file], "audio.wav", { type: "audio/wav" });

    // verbose_json gives us segment timestamps
    const response = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    } as Parameters<typeof client.audio.transcriptions.create>[0]);

    // response is typed as Transcription — cast to access verbose_json fields
    const raw = response as unknown as {
      text: string;
      language: string;
      segments?: Array<{ start: number; end: number; text: string }>;
    };

    const segments = (raw.segments ?? []).map((seg, i) => ({
      id: i,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }));

    return NextResponse.json({
      text: raw.text,
      segments,
      language: raw.language ?? "unknown",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

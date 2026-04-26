import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 120;

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

    const response = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const segments = (response.segments ?? []).map((seg, i) => ({
      id: i,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }));

    return NextResponse.json({
      text: response.text,
      segments,
      language: response.language ?? "unknown",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

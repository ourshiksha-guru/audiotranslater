"use client";

import { useRef, useState } from "react";
import type { Segment, StepStatus, TargetLang, TranscriptResult, TranslationResult } from "@/lib/types";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconVideo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconFileText() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconHeadphones() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function IconSubtitles() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M7 15h4m4 0h2M7 11h2m4 0h6" />
    </svg>
  );
}

// ── SRT helper ────────────────────────────────────────────────────────────────

function srtTime(sec: number) {
  const ms = Math.round((sec % 1) * 1000);
  const s = Math.floor(sec) % 60;
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function buildSRT(segments: Segment[]) {
  return segments
    .map((s, i) => `${i + 1}\n${srtTime(s.start)} --> ${srtTime(s.end)}\n${s.text}`)
    .join("\n\n");
}

function downloadBlob(content: string, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Status indicator ──────────────────────────────────────────────────────────

function StatusCircle({ status, step }: { status: StepStatus; step: number }) {
  if (status === "complete")
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
        <IconCheck />
      </div>
    );
  if (status === "active")
    return (
      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
        <IconSpinner />
      </div>
    );
  if (status === "error")
    return (
      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        !
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-sm font-semibold flex-shrink-0">
      {step}
    </div>
  );
}

function CheckboxStatus({ status }: { status: StepStatus }) {
  const done = status === "complete";
  return (
    <div
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
        done ? "bg-emerald-500 border-emerald-500" : "border-slate-600 bg-transparent"
      }`}
    >
      {done && <IconCheck />}
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────

interface StepCardProps {
  num: number;
  icon: React.ReactNode;
  title: string;
  status: StepStatus;
  log?: string;
  children?: React.ReactNode;
}

function StepCard({ num, icon, title, status, log, children }: StepCardProps) {
  const borderClass =
    status === "active" ? "card active" :
    status === "complete" ? "card complete" :
    status === "error" ? "card error" :
    "card";

  const statusLabel =
    status === "idle" ? "Waiting" :
    status === "active" ? "In progress…" :
    status === "complete" ? "Done" : "Error";

  const statusClass = `status-badge ${status}`;

  return (
    <div className={borderClass}>
      <div className="flex items-start gap-4">
        <StatusCircle status={status} step={num} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className={`${status === "active" ? "text-indigo-400" : status === "complete" ? "text-emerald-400" : "text-slate-400"}`}>
                {icon}
              </span>
              <h3 className="font-semibold text-white">{title}</h3>
              <CheckboxStatus status={status} />
            </div>
            <span className={statusClass}>{statusLabel}</span>
          </div>
          {log && (
            <p className={`text-xs mt-1 mb-3 ${status === "error" ? "text-red-400" : "text-slate-400"}`}>
              {log}
            </p>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Progress tracker ──────────────────────────────────────────────────────────

const STEP_LABELS = ["Select", "Extract", "Transcribe", "Translate", "TTS"];

function ProgressTracker({ statuses }: { statuses: StepStatus[] }) {
  return (
    <div className="flex items-start justify-between mb-8 px-2">
      {STEP_LABELS.map((label, i) => {
        const st = statuses[i];
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                  st === "complete" ? "bg-emerald-500 text-white" :
                  st === "active" ? "bg-indigo-600 text-white" :
                  st === "error" ? "bg-red-500 text-white" :
                  "bg-slate-800 border border-slate-700 text-slate-500"
                }`}
              >
                {st === "complete" ? <IconCheck /> : st === "active" ? <IconSpinner /> : i + 1}
              </div>
              <span className={`text-xs ${st === "complete" ? "text-emerald-400" : st === "active" ? "text-indigo-400" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`step-connector ${st === "complete" ? "complete" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────

export default function Pipeline() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<TargetLang>("tanglish");

  const [statuses, setStatuses] = useState<StepStatus[]>(["idle", "idle", "idle", "idle", "idle"]);
  const [logs, setLogs] = useState<string[]>(["", "", "", "", ""]);
  const [ffmpegProgress, setFfmpegProgress] = useState(0);

  function setStep(i: number, status: StepStatus, log = "") {
    setStatuses((s) => s.map((v, idx) => (idx === i ? status : v)));
    setLogs((l) => l.map((v, idx) => (idx === i ? log : v)));
  }

  // ── Step 1: Select Video ──────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    setAudioBlob(null);
    setTranscript(null);
    setTranslation(null);
    setTtsUrl(null);
    setStatuses(["complete", "idle", "idle", "idle", "idle"]);
    setLogs([`${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`, "", "", "", ""]);
    setFfmpegProgress(0);
  }

  // ── Step 2: Extract Audio (FFmpeg.wasm) ───────────────────────────────────

  async function handleExtract() {
    if (!videoFile) return;
    setStep(1, "active", "Loading FFmpeg.wasm…");

    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

      const ff = new FFmpeg();

      ff.on("progress", ({ progress }) => {
        setFfmpegProgress(Math.round(progress * 100));
        setLogs((l) => l.map((v, i) => (i === 1 ? `Extracting audio… ${Math.round(progress * 100)}%` : v)));
      });

      ff.on("log", ({ message }) => {
        if (message.includes("error") || message.includes("Error")) {
          console.error("[ffmpeg]", message);
        }
      });

      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setLogs((l) => l.map((v, i) => (i === 1 ? "Extracting audio…" : v)));

      await ff.writeFile("input", await fetchFile(videoFile));
      await ff.exec([
        "-i", "input",
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        "output.wav",
      ]);

      const data = await ff.readFile("output.wav");
      const blob = new Blob([data], { type: "audio/wav" });
      setAudioBlob(blob);
      setStep(1, "complete", `Audio extracted — ${(blob.size / 1024).toFixed(0)} KB`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStep(1, "error", msg);
    }
  }

  // ── Step 3: Transcribe (Whisper via API) ──────────────────────────────────

  async function handleTranscribe() {
    if (!audioBlob) return;
    setStep(2, "active", "Sending to Whisper…");

    try {
      const form = new FormData();
      form.append("audio", audioBlob, "audio.wav");

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(e.error ?? res.statusText);
      }
      const data: TranscriptResult = await res.json();
      setTranscript(data);
      setStep(2, "complete", `${data.segments.length} segments · detected language: ${data.language}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStep(2, "error", msg);
    }
  }

  // ── Step 4: Translate (GPT-4o via API) ───────────────────────────────────

  async function handleTranslate() {
    if (!transcript) return;
    setStep(3, "active", `Translating to ${targetLang}…`);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: transcript.segments, targetLang }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(e.error ?? res.statusText);
      }
      const data: TranslationResult = await res.json();
      setTranslation(data);
      setStep(3, "complete", `Translated ${data.segments.length} segments to ${targetLang}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStep(3, "error", msg);
    }
  }

  // ── Step 5: TTS (OpenAI via API) ─────────────────────────────────────────

  async function handleTTS() {
    if (!translation) return;
    setStep(4, "active", "Generating speech…");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translation.text, targetLang }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(e.error ?? res.statusText);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setTtsUrl(url);
      setStep(4, "complete", "Speech generated — playback & download ready");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStep(4, "error", msg);
    }
  }

  // ── Download helpers ──────────────────────────────────────────────────────

  function downloadTXT(segs: Segment[], label: string) {
    downloadBlob(segs.map((s) => s.text).join("\n\n"), `${label}.txt`);
  }

  function downloadSRT(segs: Segment[], label: string) {
    downloadBlob(buildSRT(segs), `${label}.srt`, "text/srt");
  }

  const allStatuses = statuses;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <ProgressTracker statuses={allStatuses} />

      {/* Language selector */}
      <div className="card flex items-center gap-4">
        <span className="text-slate-400 text-sm font-medium">Target language:</span>
        <div className="flex gap-2">
          {(["tanglish", "hinglish"] as TargetLang[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setTargetLang(lang)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                targetLang === lang
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── STEP 1: Select Video ── */}
      <StepCard num={1} icon={<IconVideo />} title="Select Video" status={statuses[0]} log={logs[0]}>
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
            <IconVideo /> {videoFile ? "Change Video" : "Select Video"}
          </button>
          {videoFile && (
            <span className="text-xs text-slate-400 truncate max-w-xs">{videoFile.name}</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mkv,.ts,.webm,.avi,.mov,.flv"
          className="hidden"
          onChange={handleFileChange}
        />
      </StepCard>

      {/* ── STEP 2: Extract Audio ── */}
      <StepCard num={2} icon={<IconMusic />} title="Extract Audio" status={statuses[1]} log={logs[1]}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              className="btn-primary"
              disabled={!videoFile || statuses[1] === "active"}
              onClick={handleExtract}
            >
              {statuses[1] === "active" ? <IconSpinner /> : <IconMusic />}
              Extract Audio
            </button>
            {audioBlob && (
              <button
                className="btn-ghost"
                onClick={() => {
                  const url = URL.createObjectURL(audioBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "extracted_audio.wav";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <IconDownload /> Download WAV
              </button>
            )}
          </div>
          {statuses[1] === "active" && ffmpegProgress > 0 && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${ffmpegProgress}%` }}
              />
            </div>
          )}
        </div>
      </StepCard>

      {/* ── STEP 3: Transcribe ── */}
      <StepCard num={3} icon={<IconFileText />} title="Transcribe" status={statuses[2]} log={logs[2]}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn-primary"
              disabled={!audioBlob || statuses[2] === "active"}
              onClick={handleTranscribe}
            >
              {statuses[2] === "active" ? <IconSpinner /> : <IconFileText />}
              Transcribe
            </button>
            {transcript && (
              <>
                <button className="btn-ghost" onClick={() => downloadTXT(transcript.segments, "transcript")}>
                  <IconDownload /> Download TXT
                </button>
                <button className="btn-ghost" onClick={() => downloadSRT(transcript.segments, "transcript")}>
                  <IconSubtitles /> Download SRT
                </button>
              </>
            )}
          </div>
          {transcript && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {transcript.text.slice(0, 800)}{transcript.text.length > 800 ? "…" : ""}
              </p>
            </div>
          )}
        </div>
      </StepCard>

      {/* ── STEP 4: Translate ── */}
      <StepCard num={4} icon={<IconGlobe />} title={`Translate → ${targetLang.charAt(0).toUpperCase() + targetLang.slice(1)}`} status={statuses[3]} log={logs[3]}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn-primary"
              disabled={!transcript || statuses[3] === "active"}
              onClick={handleTranslate}
            >
              {statuses[3] === "active" ? <IconSpinner /> : <IconGlobe />}
              Translate
            </button>
            {translation && (
              <>
                <button className="btn-ghost" onClick={() => downloadTXT(translation.segments, `translation_${targetLang}`)}>
                  <IconDownload /> Download TXT
                </button>
                <button className="btn-ghost" onClick={() => downloadSRT(translation.segments, `translation_${targetLang}`)}>
                  <IconSubtitles /> Download SRT
                </button>
              </>
            )}
          </div>
          {translation && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {translation.text.slice(0, 800)}{translation.text.length > 800 ? "…" : ""}
              </p>
            </div>
          )}
        </div>
      </StepCard>

      {/* ── STEP 5: TTS ── */}
      <StepCard num={5} icon={<IconHeadphones />} title="Text-to-Speech" status={statuses[4]} log={logs[4]}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn-primary"
              disabled={!translation || statuses[4] === "active"}
              onClick={handleTTS}
            >
              {statuses[4] === "active" ? <IconSpinner /> : <IconHeadphones />}
              Generate Speech
            </button>
            {ttsUrl && (
              <a
                href={ttsUrl}
                download={`tts_${targetLang}.mp3`}
                className="btn-success"
              >
                <IconDownload /> Download Audio
              </a>
            )}
          </div>
          {ttsUrl && (
            <audio controls className="w-full mt-2 rounded-lg" src={ttsUrl}>
              Your browser does not support audio playback.
            </audio>
          )}
        </div>
      </StepCard>
    </div>
  );
}

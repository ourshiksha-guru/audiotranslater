export type StepId =
  | "select"
  | "extract"
  | "transcribe"
  | "translate"
  | "tts";

export type StepStatus = "idle" | "active" | "complete" | "error";

export interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  text: string;
  segments: Segment[];
  language: string;
}

export interface TranslationResult {
  text: string;
  segments: Segment[];
  targetLang: "tanglish" | "hinglish";
}

export type TargetLang = "tanglish" | "hinglish";

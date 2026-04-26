import Pipeline from "@/components/Pipeline";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-white">AudioTranslater</span>
              <span className="text-slate-500 text-xs ml-2">by OurShiksha</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Video → Transcript → Tanglish / Hinglish
          </div>
        </div>
      </header>

      {/* Pipeline */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Video to Tanglish / Hinglish Audio
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Upload any video, extract audio, auto-transcribe with Whisper, translate
            with GPT-4o, and generate speech — all in one pipeline.
          </p>
        </div>
        <Pipeline />
      </div>
    </main>
  );
}

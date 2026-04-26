import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AudioTranslater — OurShiksha",
  description:
    "Video → Audio → Transcribe → Translate to Tanglish / Hinglish with AI",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

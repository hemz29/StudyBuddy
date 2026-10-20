import type { Metadata, Viewport } from "next";
import { Noto_Sans_Kannada, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const kannada = Noto_Sans_Kannada({ subsets: ["kannada"], weight: ["400", "600", "700"], variable: "--font-kannada" });

// Every page shows a family's own data, so nothing is pre-rendered at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "StudyBuddy Kannada",
  description: "Grade 6 Kannada (3rd language) practice: read, write by hand, get it marked, see progress.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#4f5bd5", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${kannada.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

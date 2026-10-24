import type { Metadata, Viewport } from "next";
import { Montserrat, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

// Montserrat, as in the logo's "Kannada, with confidence": thin headings, light text, medium buttons.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800"], variable: "--font-main" });
const kannada = Noto_Sans_Kannada({ subsets: ["kannada"], weight: ["400", "600", "700"], variable: "--font-kannada" });

// Every page shows a family's own data, so nothing is pre-rendered at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kali Kannada – Kannada, with confidence",
  description: "Grade 6 Kannada (3rd language) practice: read, write by hand, get it marked, see progress.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#5e8b76", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${kannada.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

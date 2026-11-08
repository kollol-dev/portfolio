import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Full SEO / OG metadata is completed in Phase 7.
export const metadata: Metadata = {
  title: "Kollol Chakraborty — Senior Software Engineer",
  description:
    "Portfolio of Kollol Chakraborty, a senior backend-focused software engineer working with Node.js, TypeScript, Python and Go.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-dvh bg-bg text-text">{children}</body>
    </html>
  );
}

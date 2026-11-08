import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/config/site";
import { MotionProvider } from "@/components/ui/MotionProvider";

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

// Site-wide defaults only. The home page's SEO tags (title, description,
// Open Graph, robots) come from the live content in app/page.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}>
      <body className="min-h-dvh bg-bg text-text">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

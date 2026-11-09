import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/config/site";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { color } from "@/styles/tokens3d";

// Type system (see globals.css): Space Grotesk carries headings, interface and
// body; Bodoni Moda italic is the rare editorial accent; Geist Mono is metadata.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: "variable",
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: "400",
  style: "italic", // the serif only ever appears in italic
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide defaults only. The home page's SEO tags (title, description,
// Open Graph, robots) come from the live content in app/page.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: color.bg,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bodoniModa.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh bg-bg text-text">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

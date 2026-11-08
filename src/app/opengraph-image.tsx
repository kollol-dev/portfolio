import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { displayUrl, portfolio } from "@/data/portfolio";

export const alt = "Kollol Chakraborty — Senior Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "public/fonts", file));
const [serif, serifItalic, sans, mono] = await Promise.all([
  font("instrument-serif-latin-400-normal.woff"),
  font("instrument-serif-latin-400-italic.woff"),
  font("geist-sans-latin-400-normal.woff"),
  font("geist-mono-latin-400-normal.woff"),
]);

/** Share card in the site's own typography. */
export default async function Image() {
  const { profile } = portfolio;
  const github = profile.socials.find((s) => s.kind === "github");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(ellipse 70% 80% at 85% 40%, #17171b 0%, #0a0a0c 70%)",
          color: "#ededef",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontFamily: "Geist Mono",
            fontSize: 22,
            color: "#8a8a93",
            letterSpacing: 3,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 4,
              color: "#c8a97e",
            }}
          >
            KC
          </div>
          {profile.title.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Instrument Serif", fontSize: 128, lineHeight: 0.95, letterSpacing: -3 }}>
            {profile.firstName}
          </div>
          <div
            style={{
              fontFamily: "Instrument Serif Italic",
              fontSize: 128,
              lineHeight: 1,
              letterSpacing: -3,
              color: "#c8a97e",
            }}
          >
            {profile.lastName}
          </div>
          <div style={{ marginTop: 32, fontSize: 34, color: "#9a9aa3" }}>{profile.headline}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 28,
            fontFamily: "Geist Mono",
            fontSize: 20,
            color: "#8a8a93",
            letterSpacing: 2,
          }}
        >
          <span>{profile.location.toUpperCase()}</span>
          <span>{github ? displayUrl(github.href).toUpperCase() : profile.email.toUpperCase()}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Instrument Serif Italic", data: serifItalic, style: "normal", weight: 400 },
        { name: "Geist", data: sans, style: "normal", weight: 400 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}

import { ImageResponse } from "next/og";
import { color, palette } from "@/styles/tokens3d";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { displayUrl } from "@/data/portfolio";
import { getContent } from "@/content/store";

export const alt = "Kollol Chakraborty — Senior Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "public/fonts", file));
const [serifItalic, sans, mono] = await Promise.all([
  font("bodoni-moda-latin-400-italic.woff"),
  font("space-grotesk-latin-500-normal.woff"),
  font("geist-mono-latin-400-normal.woff"),
]);

/** Share card in the site's own typography. */
export default async function Image() {
  const { profile } = await getContent();
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
          background: `radial-gradient(ellipse 70% 80% at 85% 40%, ${palette.slateBlue} 0%, ${color.bg} 70%)`,
          color: color.text,
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontFamily: "Geist Mono",
            fontSize: 22,
            color: color.textMuted,
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
              border: `1px solid ${color.lineStrong}`,
              borderRadius: 4,
              color: color.accent,
            }}
          >
            KC
          </div>
          {profile.title.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, lineHeight: 0.95, letterSpacing: -6 }}>
            {profile.firstName}
          </div>
          <div
            style={{
              fontFamily: "Bodoni Moda Italic",
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -1,
              color: color.accent,
            }}
          >
            {profile.lastName}
          </div>
          <div style={{ marginTop: 32, fontSize: 34, color: color.textMuted }}>{profile.headline}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${color.line}`,
            paddingTop: 28,
            fontFamily: "Geist Mono",
            fontSize: 20,
            color: color.textMuted,
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
        { name: "Bodoni Moda Italic", data: serifItalic, style: "normal", weight: 400 },
        { name: "Space Grotesk", data: sans, style: "normal", weight: 500 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}

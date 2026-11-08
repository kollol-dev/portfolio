import { readRawContent } from "@/content/store";
import { getSession } from "@/lib/auth/session";

/** Download all content as JSON (backup). Admin only. */
export async function GET() {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(await readRawContent(), null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="portfolio-content-${date}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}

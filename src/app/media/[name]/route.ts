import { readMedia } from "@/content/store";

/** Serves images uploaded in the dashboard. Names are random and never reused, so cache hard. */
export async function GET(_req: Request, { params }: RouteContext<"/media/[name]">) {
  const { name } = await params;
  const file = await readMedia(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

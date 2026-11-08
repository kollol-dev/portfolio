import { listMedia, MAX_MEDIA_BYTES, saveMedia } from "@/content/store";
import { getSession } from "@/lib/auth/session";

/** Upload an image (multipart field "file"). Admin only. */
export async function POST(request: Request) {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file uploaded." }, { status: 400 });
  if (file.size > MAX_MEDIA_BYTES) return Response.json({ error: "Images must be 5 MB or smaller." }, { status: 413 });
  try {
    const url = await saveMedia(file.name, Buffer.from(await file.arrayBuffer()));
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 400 });
  }
}

/** List uploaded images, newest first. Admin only. */
export async function GET() {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ files: await listMedia() });
}

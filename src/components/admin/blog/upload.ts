/** Upload an image to the media library; returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/admin/media", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
  return data.url;
}

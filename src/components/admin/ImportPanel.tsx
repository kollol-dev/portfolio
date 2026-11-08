"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";
import { importContent } from "@/app/admin/actions";
import { Button } from "./ui";

/** Back up (download) and restore (upload) all content as one JSON file. */
export function ImportPanel() {
  const file = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <a
          href="/admin/export"
          className="inline-flex min-h-9 items-center gap-2 rounded-sm border border-line-strong px-3 text-caption font-medium text-text hover:border-accent hover:text-accent-strong"
        >
          <Download className="size-4" aria-hidden /> Download backup
        </a>
        <Button disabled={pending} onClick={() => file.current?.click()}>
          <Upload className="size-4" aria-hidden /> {pending ? "Importing…" : "Import JSON"}
        </Button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (!confirm(`Replace all content with “${f.name}”? The current content is kept as a revision.`)) return;
            const text = await f.text();
            startTransition(async () => {
              const res = await importContent(text);
              setMessage(
                res.ok ? { ok: true, text: "Imported. The live site is updated." } : { ok: false, text: res.error },
              );
            });
          }}
        />
      </div>
      {message ? (
        <p
          role={message.ok ? "status" : "alert"}
          className={`text-caption ${message.ok ? "text-[#b8dcc7]" : "text-[#f0a3a3]"}`}
        >
          {message.text}
        </p>
      ) : null}
      <p className="text-[0.75rem] text-text-subtle">
        Download a backup before redeploying, and import it afterwards if your host replaced the data folder.
      </p>
    </div>
  );
}

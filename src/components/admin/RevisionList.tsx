"use client";

import { useState, useTransition } from "react";
import { History, RotateCcw } from "lucide-react";
import { restoreRevision } from "@/app/admin/actions";
import type { RevisionInfo } from "@/content/store";
import { Button, LocalTime } from "./ui";

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Previous saved versions, newest first, with one-click restore. */
export function RevisionList({ revisions, limit }: { revisions: RevisionInfo[]; limit?: number }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const shown = limit ? revisions.slice(0, limit) : revisions;

  if (!revisions.length)
    return (
      <p className="text-caption text-text-subtle">No earlier versions yet. Each save keeps the previous one here.</p>
    );

  return (
    <div>
      <ul className="divide-y divide-line">
        {shown.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2.5">
            <History className="size-4 shrink-0 text-text-subtle" aria-hidden />
            <span className="flex-1 text-caption text-text-muted">
              <LocalTime iso={r.savedAt} />
            </span>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => {
                if (!confirm(`Restore the version from ${fmt(r.savedAt)}? The current content is kept as a revision.`))
                  return;
                startTransition(async () => {
                  const res = await restoreRevision(r.id);
                  setMessage(res.ok ? "Restored. The live site is updated." : res.error);
                });
              }}
            >
              <RotateCcw className="size-3.5" aria-hidden /> Restore
            </Button>
          </li>
        ))}
      </ul>
      {message ? (
        <p role="status" className="mt-2 text-caption text-text-muted">
          {message}
        </p>
      ) : null}
    </div>
  );
}

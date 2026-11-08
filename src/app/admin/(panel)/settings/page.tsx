import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { listRevisions, storageInfo } from "@/content/store";
import { getSession } from "@/lib/auth/session";
import { Card } from "@/components/admin/ui";
import { ImportPanel } from "@/components/admin/ImportPanel";
import { RevisionList } from "@/components/admin/RevisionList";

export const metadata: Metadata = { title: "Settings" };

async function Storage() {
  const info = await storageInfo();
  return (
    <div className="grid gap-3 text-caption">
      <p className="text-text-muted">
        Content is saved to <code className="font-mono text-text">{info.dataDir}</code>
      </p>
      {info.usingSeed ? (
        <p className="text-text-subtle">
          Nothing saved from the dashboard yet. The site shows content/portfolio.json from your project.
        </p>
      ) : null}
      {info.customDir ? (
        <p className="flex gap-2 text-[#b8dcc7]">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden /> Using CONTENT_DATA_DIR, so edits survive redeploys.
        </p>
      ) : (
        <p className="flex gap-2 text-[#e0c38a]">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <span>
            This folder is inside the app. Uploading a new zip may replace it. Set{" "}
            <code className="font-mono">CONTENT_DATA_DIR</code> to a folder outside the app (e.g.{" "}
            <code className="font-mono">/home/USER/portfolio-data</code>), or download a backup before each redeploy.
          </span>
        </p>
      )}
    </div>
  );
}

async function Account() {
  const session = await getSession();
  return (
    <div className="grid gap-2 text-caption text-text-muted">
      <p>
        Signed in as <span className="text-text">{session?.u}</span>
        {session ? (
          <span className="text-text-subtle"> · session ends {new Date(session.exp).toLocaleString()}</span>
        ) : null}
      </p>
      <p className="text-text-subtle">
        To change the username or password, run <code className="font-mono text-text">npm run admin:setup</code> and
        update the three environment variables in Hostinger. Changing the password signs out every session.
      </p>
    </div>
  );
}

export default async function SettingsPage() {
  const revisions = await listRevisions();
  return (
    <div className="grid max-w-3xl gap-6 py-6">
      <h1 className="font-display text-h2 text-text">Settings</h1>
      <Card title="Backup & restore">
        <ImportPanel />
      </Card>
      <Card title="Storage">
        <Suspense fallback={<p className="text-caption text-text-faint">Checking…</p>}>
          <Storage />
        </Suspense>
      </Card>
      <Card title={`Version history (${revisions.length})`}>
        <RevisionList revisions={revisions} />
      </Card>
      <Card title="Account">
        <Suspense fallback={<p className="text-caption text-text-faint">Checking…</p>}>
          <Account />
        </Suspense>
      </Card>
    </div>
  );
}

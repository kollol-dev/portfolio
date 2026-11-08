import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import schema from "@content/portfolio.schema.json";
import { getRawContent } from "@/content/store";
import { EDITORS } from "@/content/editors";
import { ContentEditor } from "@/components/admin/ContentEditor";
import type { Schema } from "@/components/admin/SchemaForm";

export function generateStaticParams() {
  return EDITORS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/admin/edit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: EDITORS.find((e) => e.slug === slug)?.label ?? "Edit" };
}

/** Reads the URL param, so it streams inside a Suspense boundary (instant navigation). */
async function Editor({ params }: { params: PageProps<"/admin/edit/[slug]">["params"] }) {
  const { slug } = await params;
  const editor = EDITORS.find((e) => e.slug === slug);
  if (!editor) notFound();
  const raw = await getRawContent();
  const initial = Object.fromEntries(
    editor.keys.map((k) => [k, raw[k] ?? (k === "closingStatement" ? "" : undefined)]),
  );

  return (
    <ContentEditor
      // Remount on navigation between editors so each starts from its own saved state.
      key={editor.slug}
      title={editor.label}
      description={editor.description}
      initial={initial}
      schema={schema as Schema}
    />
  );
}

export default function EditPage({ params }: PageProps<"/admin/edit/[slug]">) {
  return (
    <Suspense fallback={<p className="py-10 text-caption text-text-faint">Loading editor…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

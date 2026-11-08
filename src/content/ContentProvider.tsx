"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Portfolio } from "@/data/portfolio";
import { buildSections, type SectionMeta } from "@/config/sections";

interface ContentValue {
  content: Portfolio;
  sections: readonly SectionMeta[];
  /** Whether any blog post is live (shows the Blog nav link). */
  hasBlog: boolean;
}

const ContentContext = createContext<ContentValue | null>(null);

/**
 * Makes the live content available to client components (nav, ID card, 3D
 * props). The page loads it on the server and passes it in. The 3D canvas
 * receives this context automatically (React Three Fiber bridges it).
 */
export function ContentProvider({
  content,
  hasBlog = false,
  children,
}: {
  content: Portfolio;
  hasBlog?: boolean;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ content, sections: buildSections(content), hasBlog }), [content, hasBlog]);
  return <ContentContext value={value}>{children}</ContentContext>;
}

function useContentValue(): ContentValue {
  const value = useContext(ContentContext);
  if (!value) throw new Error("useContent must be used inside <ContentProvider>");
  return value;
}

export const useContent = () => useContentValue().content;
export const useSections = () => useContentValue().sections;
export const useHasBlog = () => useContentValue().hasBlog;

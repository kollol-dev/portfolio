import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-bg text-text">{children}</div>;
}

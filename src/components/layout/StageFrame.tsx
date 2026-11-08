/**
 * Fixed right-hand stage on desktop. The 3D canvas mounts inside it in
 * Phase 3. Until then (and whenever WebGL is unavailable) it shows a quiet
 * studio backdrop, so the layout never looks broken.
 */
export function StageFrame({ children }: { children?: React.ReactNode }) {
  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 hidden w-1/2 border-l border-line lg:block"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,#17171b_0%,var(--c-bg)_70%)]" />
      <div className="absolute inset-x-[18%] bottom-[14%] h-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.05),transparent)]" />
      <div className="absolute inset-0">{children}</div>
    </aside>
  );
}

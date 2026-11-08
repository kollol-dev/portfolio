import { StageCaption } from "./StageCaption";

/**
 * The 3D stage container.
 * - Desktop (lg+): fixed right half of the viewport, full height.
 * - Mobile/tablet: fixed band under the nav, `--stage-h` tall; collapses to 0
 *   when the reader hides it (html[data-stage="off"]).
 * Decorative: everything it shows is also in the page text.
 */
export function StageFrame({ children }: { children?: React.ReactNode }) {
  return (
    <aside
      id="stage"
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-(--nav-h) z-30 h-(--stage-h) overflow-hidden border-b border-line bg-bg transition-[height] duration-(--dur-slow) ease-out-expo lg:inset-y-0 lg:right-0 lg:left-auto lg:z-0 lg:h-auto lg:w-1/2 lg:border-b-0 lg:border-l"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,#17171b_0%,var(--c-bg)_70%)]" />
      <div className="absolute inset-x-[18%] bottom-[14%] hidden h-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.05),transparent)] lg:block" />
      <div className="absolute inset-0">{children}</div>
      <StageCaption />
      {/* Soft fade where the band meets the scrolling text */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg to-transparent lg:hidden" />
    </aside>
  );
}

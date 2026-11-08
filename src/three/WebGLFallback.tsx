/** Quiet stand-in for the 3D stage when WebGL is missing or crashes. */
export function WebGLFallback({ reason }: { reason: "unsupported" | "error" }) {
  return (
    <div data-stage-fallback className="absolute inset-0 grid place-items-center px-10">
      <div className="max-w-xs text-center">
        <div
          aria-hidden
          className="mx-auto h-24 w-px bg-gradient-to-b from-transparent via-line-strong to-transparent"
        />
        <p className="mt-6 font-mono text-micro tracking-wider text-text-subtle uppercase">
          {reason === "unsupported" ? "3D preview unavailable" : "3D preview paused"}
        </p>
        <p className="mt-3 text-caption text-text-subtle">
          {reason === "unsupported"
            ? "This browser doesn’t support WebGL. Everything on the page still works."
            : "The 3D scene couldn’t load. Everything on the page still works."}
        </p>
      </div>
    </div>
  );
}

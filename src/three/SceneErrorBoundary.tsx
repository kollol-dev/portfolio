"use client";

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

/** Catches GLB load failures and render errors inside the canvas tree. */
export class SceneErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[scene] 3D stage failed, showing fallback:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

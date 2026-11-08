import { create } from "zustand";

const KEY = "kc-stage-hidden";

interface StageState {
  /** Mobile/tablet only: the reader collapsed the 3D band. Desktop always shows it. */
  mobileHidden: boolean;
  setMobileHidden: (v: boolean) => void;
}

export const useStageStore = create<StageState>((set) => ({
  mobileHidden: false,
  setMobileHidden: (v) => {
    set({ mobileHidden: v });
    try {
      localStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      // Storage blocked (private mode etc.) — preference just won't persist.
    }
  },
}));

/** Saved preference, else hidden by default on data-saver connections. */
export function initialMobileHidden(): boolean {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) return saved === "1";
  } catch {
    // ignore
  }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return nav.connection?.saveData === true;
}

"use client";

import { createContext, useContext } from "react";

export type QualityTier = "high" | "low";

/** Rough device capability check, run once on the client. */
export function detectQuality(): QualityTier {
  if (typeof navigator === "undefined") return "high";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return lowMemory || fewCores || saveData || coarse ? "low" : "high";
}

export const QualityContext = createContext<QualityTier>("high");
export const useQuality = () => useContext(QualityContext);

/** Geometry detail per tier. */
export const detail = {
  high: { curve: 10, bevel: 3 },
  low: { curve: 3, bevel: 1 },
} as const;

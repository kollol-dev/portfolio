import type { ComponentType } from "react";
import type { PropId } from "@/config/sections";
import { Book } from "./Book";
import { Certificate } from "./Certificate";
import { IdCard } from "./IdCard";
import { Laptop } from "./Laptop";
import { Phone } from "./Phone";
import { Tablet } from "./Tablet";

export interface PropConfig {
  Component: ComponentType;
  /**
   * Where the prop's origin (bottom centre) sits, in the palm frame:
   * `up` along the palm normal, `fwd` along the fingers, `side` toward the thumb.
   */
  offset: { up: number; fwd: number; side: number };
  /** Pitch in radians after turning to face the camera (+ tips the top toward the viewer). */
  tilt: number;
  scale: number;
}

/** Hand-attachment calibration for each prop. */
export const PROPS: Record<PropId, PropConfig> = {
  idCard: { Component: IdCard, offset: { up: 0.035, fwd: 0.02, side: 0 }, tilt: -0.08, scale: 1.6 },
  tablet: { Component: Tablet, offset: { up: 0.035, fwd: 0.02, side: 0 }, tilt: -0.12, scale: 1 },
  certificate: { Component: Certificate, offset: { up: 0.035, fwd: 0.02, side: 0 }, tilt: -0.1, scale: 1 },
  laptop: { Component: Laptop, offset: { up: 0.008, fwd: 0.02, side: 0 }, tilt: 0.22, scale: 0.95 },
  diploma: { Component: Book, offset: { up: 0.035, fwd: 0.02, side: 0 }, tilt: -0.08, scale: 1 },
  phone: { Component: Phone, offset: { up: 0.035, fwd: 0.02, side: 0 }, tilt: -0.08, scale: 1.3 },
};

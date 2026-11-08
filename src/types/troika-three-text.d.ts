// Minimal typings for the one troika API used directly (drei wraps the rest).
declare module "troika-three-text" {
  export function configureTextBuilder(config: {
    defaultFontURL?: string;
    unicodeFontsURL?: string;
    sdfGlyphSize?: number;
    sdfExponent?: number;
    sdfMargin?: number;
    textureWidth?: number;
    useWorker?: boolean;
  }): void;
}

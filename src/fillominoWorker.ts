import { generateFillomino } from "./fillominoGenerate.ts";
import type { FillominoLevel } from "./fillomino.types.ts";

self.onmessage = (event: MessageEvent<{ width: number; height: number; level: FillominoLevel; seed: number }>) => {
  try {
    const { width, height, level, seed } = event.data;
    self.postMessage({ puzzle: generateFillomino(width, height, level, seed) });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};

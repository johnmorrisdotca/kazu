import { generateHeyawake } from "./heyawakeGenerate.ts";
import type { HeyawakeLevel } from "./heyawake.types.ts";
self.onmessage = (event: MessageEvent<{ width: number; height: number; level: HeyawakeLevel; seed: number }>) => {
  try {
    const { width, height, level, seed } = event.data;
    self.postMessage({ puzzle: generateHeyawake(width, height, level, seed) });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};

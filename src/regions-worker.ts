import { generateRegions } from "./regions-generate.ts";
import type { RegionsLevel } from "./regions.types.ts";

self.onmessage = (event: MessageEvent<{ width: number; height: number; level: RegionsLevel; seed: number }>) => {
  try {
    const { width, height, level, seed } = event.data;
    self.postMessage({ puzzle: generateRegions(width, height, level, seed) });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};

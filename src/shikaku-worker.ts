import { generateShikaku } from "./shikaku-generate.ts";
import type { ShikakuLevel } from "./shikaku.types.ts";
self.onmessage = (event: MessageEvent<{ width: number; height: number; level: ShikakuLevel; seed: number }>) => {
  try { const { width, height, level, seed } = event.data; self.postMessage({ puzzle: generateShikaku(width, height, level, seed) }); }
  catch (error) { self.postMessage({ error: error instanceof Error ? error.message : String(error) }); }
};

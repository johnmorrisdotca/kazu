export type MasyuBoard = { width: number; height: number; pearls: readonly number[] };
export type MasyuPuzzle = MasyuBoard & { seed: number; solution: readonly number[] };
export type MasyuCheck = { ok: boolean; errors: readonly number[] };
export type MasyuSolve = { count: number; solution: readonly number[] | null; complete: boolean; nodes: number };
export type MasyuGame = { board: MasyuBoard; edges: readonly number[]; history: readonly (readonly number[])[]; helped: boolean };
export type MasyuDrawOptions = { edges?: readonly number[]; selected?: number; errors?: readonly number[]; material?: "ivory" | "wood" | "slate"; pieces?: "plain" | "tiles"; language?: "en" | "ja" };
export type MasyuMountOptions = MasyuDrawOptions & { board: MasyuBoard; progress?: string; onChange?: (game: MasyuGame) => void; onFinish?: (game: MasyuGame) => void };
export type MasyuMount = { game: () => MasyuGame; progress: () => string; set: (options: MasyuDrawOptions) => void; restart: () => void; destroy: () => void };

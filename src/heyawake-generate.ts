import { HEYAWAKE_GENERATOR_MOST_CELLS, HEYAWAKE_LEVELS, HEYAWAKE_MOST_ATTEMPTS } from "./heyawake.constants.ts";
import { checkHeyawake, heyawakeNeighbours, roomForCell } from "./heyawake-board.ts";
import { solveHeyawake } from "./heyawake-solve.ts";
import { isKazuSeed, seededRandom, shuffled } from "./random.ts";
import type { HeyawakeBoard, HeyawakeLevel, HeyawakePuzzle, HeyawakeRoom } from "./heyawake.types.ts";

export function generateHeyawake(width = 4, height = width, level: HeyawakeLevel = "easy", seed = 1): HeyawakePuzzle {
  if (![width, height].every(value => Number.isInteger(value) && value >= 4 && value <= 8) || width * height > HEYAWAKE_GENERATOR_MOST_CELLS
    || !HEYAWAKE_LEVELS.includes(level) || !isKazuSeed(seed)) throw new RangeError("Heyawake generation supports 4–8 cells per side and a valid level and seed");
  const random = seededRandom(seed);
  for (let attempt = 0; attempt < HEYAWAKE_MOST_ATTEMPTS; attempt += 1) {
    const roomLimit = Math.min(10, 5 + Math.floor(attempt / 50));
    const rooms = partitionRooms(width, height, random, roomLimit);
    const open: HeyawakeBoard = { width, height, rooms: rooms.map(room => ({ ...room, blacks: null })) };
    const solution = randomSolution(open, random);
    if (!solution) continue;
    const order = shuffled(rooms.map((_, index) => index), random);
    const clueCount = Math.max(2, Math.ceil(rooms.length * ({ easy: 0.95, medium: 0.75, hard: 0.55 }[level])));
    const revealed = new Set(order.slice(0, clueCount));
    const hidden = order.slice(clueCount);
    for (let extra = 0; extra <= hidden.length; extra += 1) {
      const clues = rooms.map((room, index) => ({ ...room, blacks: revealed.has(index) ? countBlacks(room, width, solution) : null }));
      const board: HeyawakeBoard = { width, height, rooms: clues };
      const proof = solveHeyawake(board);
      if (proof.complete && proof.count === 1 && proof.solution && checkHeyawake(board, proof.solution).ok) {
        return { ...board, seed, level, solution: proof.solution };
      }
      if (extra < hidden.length) revealed.add(hidden[extra]!);
    }
  }
  throw new Error("No unique Heyawake found within the generation budget; try another seed or smaller board");
}

function partitionRooms(width: number, height: number, random: () => number, maximumRooms: number): HeyawakeRoom[] {
  const pending: Array<{ x: number; y: number; width: number; height: number }> = [{ x: 0, y: 0, width, height }];
  const rooms: HeyawakeRoom[] = [];
  while (pending.length) {
    const area = pending.pop()!;
    if (rooms.length + pending.length >= maximumRooms || area.width * area.height <= 3) { rooms.push({ ...area, blacks: null }); continue; }
    const canVertical = area.width >= 4, canHorizontal = area.height >= 4;
    if (!canVertical && !canHorizontal) { rooms.push({ ...area, blacks: null }); continue; }
    const vertical = canVertical && (!canHorizontal || random() < 0.5);
    if (vertical) {
      const cut = 1 + Math.floor(random() * (area.width - 1));
      pending.push({ x: area.x + cut, y: area.y, width: area.width - cut, height: area.height });
      pending.push({ x: area.x, y: area.y, width: cut, height: area.height });
    } else {
      const cut = 1 + Math.floor(random() * (area.height - 1));
      pending.push({ x: area.x, y: area.y + cut, width: area.width, height: area.height - cut });
      pending.push({ x: area.x, y: area.y, width: area.width, height: cut });
    }
  }
  return rooms;
}

function randomSolution(board: HeyawakeBoard, random: () => number): boolean[] | null {
  const entries = Array<boolean | null>(board.width * board.height).fill(null);
  const roomIds = roomForCell(board);
  let nodes = 0;
  const visit = (cell: number): boolean => {
    if (++nodes > 12_000) return false;
    if (cell === entries.length) {
      const blackCount = entries.filter(value => value === true).length;
      return blackCount >= 2 && checkHeyawake(board, entries).ok;
    }
    const choices = random() < 0.31 ? [true, false] : [false, true];
    for (const black of choices) {
      if (black && heyawakeNeighbours(board, cell).some(next => entries[next] === true)) continue;
      entries[cell] = black;
      if (partialRoomSpanIsLegal(board, entries, roomIds) && visit(cell + 1)) return true;
      entries[cell] = null;
    }
    return false;
  };
  return visit(0) ? entries.map(value => value === true) : null;
}

function partialRoomSpanIsLegal(board: HeyawakeBoard, entries: readonly (boolean | null)[], roomIds: readonly number[]): boolean {
  const exceeds = (cells: number[]) => {
    let rooms = new Set<number>();
    for (const cell of cells) {
      if (entries[cell] === false) rooms.add(roomIds[cell]!);
      else rooms = new Set();
      if (rooms.size > 2) return true;
    }
    return false;
  };
  for (let y = 0; y < board.height; y += 1) if (exceeds(Array.from({ length: board.width }, (_, x) => y * board.width + x))) return false;
  for (let x = 0; x < board.width; x += 1) if (exceeds(Array.from({ length: board.height }, (_, y) => y * board.width + x))) return false;
  return true;
}

function countBlacks(room: HeyawakeRoom, width: number, solution: readonly boolean[]): number {
  let count = 0;
  for (let y = room.y; y < room.y + room.height; y += 1) for (let x = room.x; x < room.x + room.width; x += 1) if (solution[y * width + x]) count += 1;
  return count;
}

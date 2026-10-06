import { HEYAWAKE_MOST_SIDE } from "./heyawake.constants.ts";
import type { HeyawakeBoard, HeyawakeCheck, HeyawakeRoom } from "./heyawake.types.ts";

export function heyawakeCells(board: HeyawakeBoard, room: HeyawakeRoom): number[] | null {
  if (!room || ![room.x, room.y, room.width, room.height].every(Number.isInteger)
    || room.x < 0 || room.y < 0 || room.width < 1 || room.height < 1
    || room.x + room.width > board.width || room.y + room.height > board.height) return null;
  return Array.from({ length: room.width * room.height }, (_, index) =>
    (room.y + Math.floor(index / room.width)) * board.width + room.x + index % room.width);
}

export function isHeyawakeBoard(value: unknown): value is HeyawakeBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as HeyawakeBoard;
  if (!Number.isInteger(board.width) || board.width < 2 || board.width > HEYAWAKE_MOST_SIDE
    || !Number.isInteger(board.height) || board.height < 2 || board.height > HEYAWAKE_MOST_SIDE
    || !Array.isArray(board.rooms) || board.rooms.length === 0) return false;
  const occupied = new Set<number>();
  for (const room of board.rooms) {
    if (!room || typeof room !== "object"
      || ![room.x, room.y, room.width, room.height].every(Number.isInteger)
      || !(room.blacks === null || Number.isInteger(room.blacks) && room.blacks >= 0 && room.blacks <= room.width * room.height)) return false;
    const cells = heyawakeCells(board, room);
    if (!cells || cells.some(cell => occupied.has(cell))) return false;
    cells.forEach(cell => occupied.add(cell));
  }
  return occupied.size === board.width * board.height;
}

export function heyawakeNeighbours(board: HeyawakeBoard, cell: number): number[] {
  const x = cell % board.width, y = Math.floor(cell / board.width);
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
    .filter(([nx, ny]) => nx! >= 0 && nx! < board.width && ny! >= 0 && ny! < board.height)
    .map(([nx, ny]) => ny! * board.width + nx!);
}

export function roomForCell(board: HeyawakeBoard): number[] {
  const lookup = Array(board.width * board.height).fill(-1) as number[];
  board.rooms.forEach((room, index) => heyawakeCells(board, room)?.forEach(cell => { lookup[cell] = index; }));
  return lookup;
}

export function checkHeyawake(board: HeyawakeBoard, entries: readonly (boolean | null)[]): HeyawakeCheck {
  if (!isHeyawakeBoard(board)) throw new RangeError("Invalid Heyawake board");
  if (!Array.isArray(entries) || entries.length !== board.width * board.height
    || entries.some(value => value !== true && value !== false && value !== null)) throw new RangeError("Invalid Heyawake entries");
  const errors = new Set<number>(), complete = entries.every(value => value !== null), ids = roomForCell(board);
  for (let cell = 0; cell < entries.length; cell += 1) {
    if (entries[cell] !== true) continue;
    if (heyawakeNeighbours(board, cell).some(next => entries[next] === true)) {
      errors.add(cell);
      heyawakeNeighbours(board, cell).filter(next => entries[next] === true).forEach(next => errors.add(next));
    }
  }
  for (let index = 0; index < board.rooms.length; index += 1) {
    const room = board.rooms[index]!;
    const cells = heyawakeCells(board, room)!;
    const marked = cells.filter(cell => entries[cell] === true).length;
    if (room.blacks !== null && (marked > room.blacks || complete && marked !== room.blacks)) cells.forEach(cell => errors.add(cell));
  }
  if (complete) {
    const white = entries.flatMap((value, cell) => value === false ? [cell] : []);
    const reached = new Set<number>();
    if (white.length) {
      const pending = [white[0]!]; reached.add(white[0]!);
      while (pending.length) for (const next of heyawakeNeighbours(board, pending.pop()!)) {
        if (entries[next] === false && !reached.has(next)) { reached.add(next); pending.push(next); }
      }
    }
    if (reached.size !== white.length) white.filter(cell => !reached.has(cell)).forEach(cell => errors.add(cell));
    checkRoomSpans(board, entries, ids, errors);
  }
  return { ok: errors.size === 0 && complete, complete, errors: [...errors].sort((a, b) => a - b) };
}

export function checkRoomSpans(board: HeyawakeBoard, entries: readonly (boolean | null)[], roomIds = roomForCell(board), errors = new Set<number>()): void {
  for (let y = 0; y < board.height; y += 1) {
    let rooms = new Set<number>(), cells: number[] = [];
    for (let x = 0; x <= board.width; x += 1) {
      const cell = y * board.width + x;
      if (x < board.width && entries[cell] === false) {
        cells.push(cell); rooms.add(roomIds[cell]!);
      } else {
        if (rooms.size > 2) cells.forEach(value => errors.add(value));
        rooms = new Set(); cells = [];
      }
    }
  }
  for (let x = 0; x < board.width; x += 1) {
    let rooms = new Set<number>(), cells: number[] = [];
    for (let y = 0; y <= board.height; y += 1) {
      const cell = y * board.width + x;
      if (y < board.height && entries[cell] === false) {
        cells.push(cell); rooms.add(roomIds[cell]!);
      } else {
        if (rooms.size > 2) cells.forEach(value => errors.add(value));
        rooms = new Set(); cells = [];
      }
    }
  }
}

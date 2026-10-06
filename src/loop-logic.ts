import type { Csp } from "./csp.ts";
import { edgeVertices, loopCellEdges, loopEdgeCount, loopVertexEdges } from "./loop-board.ts";
import type { LoopBoard } from "./loop.types.ts";

/**
 * Loop as variables: one per edge, slot 0 for off and slot 1 for on. The pruning rules are the ones
 * a person uses first: a number counts the edges round its square, every corner has none or two edges, and
 * a loop may not close while any other part of it is still to be drawn or while a number is not yet met.
 */
export function loopModel(board: LoopBoard): { csp: Csp } {
  const edges = loopEdgeCount(board), vertexCount = (board.width + 1) * (board.height + 1);
  const at = Array.from({ length: vertexCount }, (_, vertex) => Int32Array.from(loopVertexEdges(board, vertex)));
  const endA = new Int32Array(edges), endB = new Int32Array(edges);
  for (let edge = 0; edge < edges; edge += 1) { const [a, b] = edgeVertices(board, edge); endA[edge] = a; endB[edge] = b; }
  const clues = board.clues.flatMap((clue, cell) => clue === null ? [] : [{ need: clue, edges: Int32Array.from(loopCellEdges(board, cell)!) }]);
  const cluesOf = Array.from({ length: edges }, () => [] as number[]);
  clues.forEach((clue, index) => clue.edges.forEach(edge => cluesOf[edge]!.push(index)));
  const starts = Int32Array.from({ length: edges + 1 }, (_, i) => i * 2);
  const endList = new Int32Array(vertexCount), parent = new Int32Array(vertexCount), degree = new Uint8Array(vertexCount), componentEdges = new Int32Array(vertexCount), openEnds = new Int32Array(vertexCount);
  const vertexQueue = new Int32Array(vertexCount * 8), clueQueue = new Int32Array(clues.length * 8 + 8);
  const vertexQueued = new Uint8Array(vertexCount), clueQueued = new Uint8Array(clues.length);
  const reachable = new Int32Array(vertexCount);
  const findIn = (table: Int32Array, v: number): number => { while (table[v] !== v) { table[v] = table[table[v]!]!; v = table[v]!; } return v; };
  const find = (v: number): number => { while (parent[v] !== v) { parent[v] = parent[parent[v]!]!; v = parent[v]!; } return v; };

  const propagate = (alive: Uint8Array, decided?: number): boolean => {
    let vertexHead = 0, vertexTail = 0, clueHead = 0, clueTail = 0;
    const touch = (e: number): void => {
      const a = endA[e]!, b = endB[e]!;
      if (!vertexQueued[a]) { vertexQueued[a] = 1; vertexQueue[vertexTail++ % vertexQueue.length] = a; }
      if (!vertexQueued[b]) { vertexQueued[b] = 1; vertexQueue[vertexTail++ % vertexQueue.length] = b; }
      for (const index of cluesOf[e]!) if (!clueQueued[index]) { clueQueued[index] = 1; clueQueue[clueTail++ % clueQueue.length] = index; }
    };
    const clear = (): false => { vertexQueued.fill(0); clueQueued.fill(0); return false; };
    if (decided === undefined) for (let e = 0; e < edges; e += 1) touch(e); else touch(decided);
    for (;;) {
      while (vertexHead < vertexTail || clueHead < clueTail) {
        while (vertexHead < vertexTail) {
          const v = vertexQueue[vertexHead++ % vertexQueue.length]!;
          vertexQueued[v] = 0;
          const around = at[v]!;
          let on = 0, open = 0, lastOpen = -1;
          for (let k = 0; k < around.length; k += 1) {
            const e = around[k]!, off = alive[2 * e], onSlot = alive[2 * e + 1];
            if (!off && !onSlot) return clear();
            if (onSlot && !off) on += 1; else if (off && onSlot) { open += 1; lastOpen = e; }
          }
          if (on > 2 || on === 1 && !open) return clear();
          if (on === 2 && open) {
            for (let k = 0; k < around.length; k += 1) { const e = around[k]!; if (alive[2 * e] && alive[2 * e + 1]) { alive[2 * e + 1] = 0; touch(e); } }
          } else if (open === 1 && on < 2) {
            if (on === 1) alive[2 * lastOpen] = 0; else alive[2 * lastOpen + 1] = 0;
            touch(lastOpen);
          }
        }
        while (clueHead < clueTail) {
          const index = clueQueue[clueHead++ % clueQueue.length]!, clue = clues[index]!;
          clueQueued[index] = 0;
          let on = 0, open = 0;
          for (let k = 0; k < 4; k += 1) {
            const e = clue.edges[k]!;
            if (!alive[2 * e] && !alive[2 * e + 1]) return clear();
            if (alive[2 * e + 1] && !alive[2 * e]) on += 1; else if (alive[2 * e] && alive[2 * e + 1]) open += 1;
          }
          if (on > clue.need || on + open < clue.need) return clear();
          if (open && on === clue.need) {
            for (let k = 0; k < 4; k += 1) { const e = clue.edges[k]!; if (alive[2 * e] && alive[2 * e + 1]) { alive[2 * e + 1] = 0; touch(e); } }
          } else if (open && on + open === clue.need) {
            for (let k = 0; k < 4; k += 1) { const e = clue.edges[k]!; if (alive[2 * e] && alive[2 * e + 1]) { alive[2 * e] = 0; touch(e); } }
          }
        }
      }
      // Loops: join the drawn edges into pieces, then forbid an edge that would close a piece too early.
      for (let v = 0; v < vertexCount; v += 1) { parent[v] = v; degree[v] = 0; componentEdges[v] = 0; openEnds[v] = 0; }
      let drawn = 0;
      for (let e = 0; e < edges; e += 1) {
        if (!(alive[2 * e + 1] && !alive[2 * e])) continue;
        drawn += 1;
        const a = endA[e]!, b = endB[e]!;
        degree[a] += 1; degree[b] += 1;
        parent[find(a)] = find(b);
      }
      if (!drawn) {
        // No loop yet: a fully decided empty drawing is not an answer.
        for (let e = 0; e < edges; e += 1) if (alive[2 * e] && alive[2 * e + 1]) return true;
        return false;
      }
      for (let e = 0; e < edges; e += 1) if (alive[2 * e + 1] && !alive[2 * e]) componentEdges[find(endA[e]!)] += 1;
      // Everything drawn must still be able to join up: the edges not ruled out have to connect all of it.
      for (let v = 0; v < vertexCount; v += 1) reachable[v] = v;
      for (let e = 0; e < edges; e += 1) if (alive[2 * e + 1]) reachable[findIn(reachable, endA[e]!)] = findIn(reachable, endB[e]!);
      let anchor = -1;
      for (let e = 0; e < edges; e += 1) {
        if (!(alive[2 * e + 1] && !alive[2 * e])) continue;
        const root = findIn(reachable, endA[e]!);
        if (anchor < 0) anchor = root; else if (root !== anchor) return clear();
      }
      let ends = 0;
      for (let v = 0; v < vertexCount; v += 1) if (degree[v] === 1) { openEnds[find(v)] += 1; endList[ends++] = v; }
      let moved = false;
      for (let v = 0; v < vertexCount; v += 1) {
        if (degree[v] === 0 || find(v) !== v || openEnds[v]) continue;
        if (componentEdges[v] !== drawn) return clear();
        // A finished loop is the whole answer: nothing else may be drawn.
        for (let e = 0; e < edges; e += 1) if (alive[2 * e] && alive[2 * e + 1]) { alive[2 * e + 1] = 0; touch(e); moved = true; }
      }
      // An edge joining the two ends of one piece would close it.
      for (let k = 0; k < ends; k += 1) {
        const a = endList[k]!, around = at[a]!;
        for (let j = 0; j < around.length; j += 1) {
          const e = around[j]!;
          if (!(alive[2 * e] && alive[2 * e + 1])) continue;
          const b = endA[e] === a ? endB[e]! : endA[e]!;
          if (degree[b] !== 1 || find(a) !== find(b)) continue;
          // Closing this edge finishes the loop: allowed only when it is the whole drawing and every number is met.
          let whole = componentEdges[find(a)] === drawn;
          if (whole) {
            for (const clue of clues) {
              let on = 0;
              for (let k2 = 0; k2 < 4; k2 += 1) { const x = clue.edges[k2]!; if (x === e || alive[2 * x + 1] && !alive[2 * x]) on += 1; }
              if (on !== clue.need) { whole = false; break; }
            }
          }
          if (!whole) { alive[2 * e + 1] = 0; touch(e); moved = true; }
        }
      }
      if (!moved) return true;
    }
  };

  const choose = (alive: Uint8Array): number => {
    // Branch where the board is most pinned down: next to a loose end of the drawing, else on the numbered square with the fewest edges left.
    let best = -1, bestScore = 99;
    for (let v = 0; v < vertexCount; v += 1) {
      const around = at[v]!;
      let on = 0, first = -1;
      for (let k = 0; k < around.length; k += 1) {
        const e = around[k]!;
        if (alive[2 * e + 1] && !alive[2 * e]) on += 1; else if (alive[2 * e] && alive[2 * e + 1] && first < 0) first = e;
      }
      if (first >= 0 && on === 1) return first;
    }
    for (const clue of clues) {
      let open = 0, first = -1;
      for (let k = 0; k < 4; k += 1) { const e = clue.edges[k]!; if (alive[2 * e] && alive[2 * e + 1]) { open += 1; if (first < 0) first = e; } }
      if (open && open < bestScore) { bestScore = open; best = first; }
    }
    if (best >= 0) return best;
    for (let e = 0; e < edges; e += 1) if (alive[2 * e] && alive[2 * e + 1]) return e;
    return -1;
  };
  return { csp: { starts, propagate, choose } };
}

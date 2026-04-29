export class Graph {
  constructor() {
    this._adj = new Map();
  }

  get vertexCount() {
    return this._adj.size;
  }

  addVertex(v) {
    if (!this._adj.has(v)) this._adj.set(v, new Set());
  }

  addEdge(u, v) {
    this.addVertex(u);
    this.addVertex(v);
    this._adj.get(u).add(v);
    this._adj.get(v).add(u);
  }

  hasVertex(v) {
    return this._adj.has(v);
  }

  neighbors(v) {
    return this._adj.get(v) ?? new Set();
  }

  sortedVertices() {
    return [...this._adj.keys()].sort((a, b) => a.localeCompare(b));
  }

  bfsShortestPath(src, dst) {
    if (!this._adj.has(src) || !this._adj.has(dst)) return null;
    if (src === dst) return [src];

    const visited = new Set([src]);
    const queue = [[src]];

    while (queue.length) {
      const path = queue.shift();
      const node = path[path.length - 1];

      for (const neighbor of this._adj.get(node)) {
        if (neighbor === dst) return [...path, neighbor];
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  }

  bfsAllPaths(src, dst, maxEdges, maxResults = 500) {
    if (!this._adj.has(src) || !this._adj.has(dst))
      return { paths: [], capped: false };
    if (src === dst) return { paths: [[src]], capped: false };

    const results = [];
    const visited = new Set([src]);
    const path = [src];
    const adj = this._adj;

    function dfs(node, edgesUsed, targetDepth) {
      if (results.length >= maxResults) return;
      for (const neighbor of adj.get(node)) {
        if (results.length >= maxResults) return;
        if (neighbor === dst && edgesUsed + 1 === targetDepth) {
          results.push([...path, neighbor]);
          continue;
        }
        if (!visited.has(neighbor) && edgesUsed + 1 < targetDepth) {
          visited.add(neighbor);
          path.push(neighbor);
          dfs(neighbor, edgesUsed + 1, targetDepth);
          path.pop();
          visited.delete(neighbor);
        }
      }
    }

    // Iterative deepening: explore all paths of depth d before depth d+1,
    // guaranteeing the 500 collected paths are always the shortest ones.
    for (
      let depth = 1;
      depth <= maxEdges && results.length < maxResults;
      depth++
    ) {
      dfs(src, 0, depth);
    }

    return { paths: results, capped: results.length >= maxResults };
  }
}

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

  adjacencyData() {
    return [...this._adj.entries()].map(([k, v]) => [k, [...v]]);
  }

  bfsAllPathsAsync(src, dst, maxEdges, maxResults = 500, onTotal = null) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("./graph.worker.js?v=20260429-2", import.meta.url),
      );
      let settled = false;
      const pathTimeout = setTimeout(() => {
        worker.terminate();
        resolve({ paths: [], capped: true, timedOut: true });
      }, 25_000);
      worker.onmessage = ({ data }) => {
        if (data.type === "paths") {
          clearTimeout(pathTimeout);
          if (!settled) {
            settled = true;
            resolve(data);
          }

          if (!data.capped) {
            worker.terminate();
          } else if (!onTotal) {
            worker.terminate();
          }
          return;
        }

        if (data.type === "total-progress") {
          onTotal?.(data.total, false);
          return;
        }

        if (data.type === "total") {
          worker.terminate();
          onTotal?.(data.total, true);
        }
      };
      worker.onerror = (err) => {
        clearTimeout(pathTimeout);
        worker.terminate();
        reject(err);
      };
      worker.postMessage({
        adj: this.adjacencyData(),
        src,
        dst,
        maxEdges,
        maxResults,
      });
    });
  }

  bfsAllPaths(src, dst, maxEdges) {
    if (!this._adj.has(src) || !this._adj.has(dst)) return [];
    if (src === dst) return [[src]];

    const results = [];
    const visited = new Set([src]);
    const path = [src];
    const adj = this._adj;

    function dfs(node, edgesUsed, targetDepth) {
      for (const neighbor of adj.get(node)) {
        if (neighbor === dst) {
          if (edgesUsed + 1 === targetDepth) {
            results.push([...path, neighbor]);
          }
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
    // guaranteeing results are always ordered shortest first.
    for (let depth = 1; depth <= maxEdges; depth++) {
      dfs(src, 0, depth);
    }

    return results;
  }
}

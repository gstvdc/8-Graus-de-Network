self.onmessage = function ({ data }) {
  const { adj: adjData, src, dst, maxEdges, maxResults } = data;

  const nodeNames = [];
  const nodeIndex = new Map();

  function getIndex(name) {
    let index = nodeIndex.get(name);
    if (index !== undefined) return index;

    index = nodeNames.length;
    nodeIndex.set(name, index);
    nodeNames.push(name);
    return index;
  }

  const tempAdj = [];
  for (const [node, neighbors] of adjData) {
    const nodeIdx = getIndex(node);
    tempAdj[nodeIdx] = neighbors.map((neighbor) => getIndex(neighbor));
  }

  const srcIdx = nodeIndex.get(src);
  const dstIdx = nodeIndex.get(dst);
  if (srcIdx === undefined || dstIdx === undefined) {
    self.postMessage({
      type: "paths",
      paths: [],
      capped: false,
      timedOut: false,
    });
    self.postMessage({ type: "total", total: 0 });
    return;
  }

  if (srcIdx === dstIdx) {
    self.postMessage({
      type: "paths",
      paths: [[src]],
      capped: false,
      timedOut: false,
    });
    self.postMessage({ type: "total", total: 1 });
    return;
  }

  const adj = tempAdj.map((neighbors = []) => Int32Array.from(neighbors));

  function shortestDistancesFrom(startIndex) {
    const distances = new Int16Array(nodeNames.length).fill(-1);
    const queue = new Int32Array(nodeNames.length);
    let head = 0;
    let tail = 0;

    queue[tail++] = startIndex;
    distances[startIndex] = 0;

    while (head < tail) {
      const node = queue[head++];
      const distance = distances[node];
      if (distance >= maxEdges) continue;

      const neighbors = adj[node];
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (distances[neighbor] !== -1) continue;
        distances[neighbor] = distance + 1;
        queue[tail++] = neighbor;
      }
    }

    return distances;
  }

  const distanceToDst = shortestDistancesFrom(dstIdx);
  const shortestPathLength = distanceToDst[srcIdx];

  if (shortestPathLength === -1 || shortestPathLength > maxEdges) {
    self.postMessage({
      type: "paths",
      paths: [],
      capped: false,
      timedOut: false,
    });
    self.postMessage({ type: "total", total: 0 });
    return;
  }

  const indexedResults = [];
  const collectVisited = new Uint8Array(nodeNames.length);
  const collectPath = [srcIdx];
  collectVisited[srcIdx] = 1;

  function dfsCollect(node, edgesUsed, targetDepth) {
    const neighbors = adj[node];
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];

      if (neighbor === dstIdx && edgesUsed + 1 === targetDepth) {
        if (indexedResults.length < maxResults) {
          indexedResults.push([...collectPath, dstIdx]);
        }
        continue;
      }

      if (collectVisited[neighbor] || edgesUsed + 1 >= targetDepth) {
        continue;
      }

      const remainingEdges = targetDepth - (edgesUsed + 1);
      const minDistanceToDst = distanceToDst[neighbor];
      if (minDistanceToDst === -1 || minDistanceToDst > remainingEdges) {
        continue;
      }

      if (minDistanceToDst % 2 !== remainingEdges % 2) {
        continue;
      }

      collectVisited[neighbor] = 1;
      collectPath.push(neighbor);
      dfsCollect(neighbor, edgesUsed + 1, targetDepth);
      collectPath.pop();
      collectVisited[neighbor] = 0;

      if (indexedResults.length >= maxResults) {
        return;
      }
    }
  }

  for (
    let depth = shortestPathLength;
    depth <= maxEdges && indexedResults.length < maxResults;
    depth += 2
  ) {
    dfsCollect(srcIdx, 0, depth);
  }

  self.postMessage({
    type: "paths",
    paths: indexedResults.map((path) => path.map((index) => nodeNames[index])),
    capped: indexedResults.length >= maxResults,
    timedOut: false,
  });

  let total = 0;
  let progressTicks = 0;
  let lastProgressAt = Date.now();
  const countVisited = new Uint8Array(nodeNames.length);
  const nodeStack = new Int32Array(maxEdges + 1);
  const edgeStack = new Int8Array(maxEdges + 1);
  const nextIndexStack = new Int32Array(maxEdges + 1);

  countVisited[srcIdx] = 1;
  nodeStack[0] = srcIdx;
  edgeStack[0] = 0;
  nextIndexStack[0] = 0;

  let depth = 0;
  while (depth >= 0) {
    progressTicks += 1;
    if (progressTicks % 100_000 === 0) {
      const now = Date.now();
      if (now - lastProgressAt >= 250) {
        self.postMessage({ type: "total-progress", total });
        lastProgressAt = now;
      }
    }

    const node = nodeStack[depth];
    const edgesUsed = edgeStack[depth];
    const neighbors = adj[node];

    if (nextIndexStack[depth] >= neighbors.length) {
      countVisited[node] = 0;
      depth -= 1;
      continue;
    }

    const neighbor = neighbors[nextIndexStack[depth]++];
    const nextEdgesUsed = edgesUsed + 1;

    if (nextEdgesUsed > maxEdges) {
      continue;
    }

    if (neighbor === dstIdx) {
      total += 1;
      continue;
    }

    if (countVisited[neighbor]) {
      continue;
    }

    const remainingEdges = maxEdges - nextEdgesUsed;
    const minDistanceToDst = distanceToDst[neighbor];
    if (minDistanceToDst === -1 || minDistanceToDst > remainingEdges) {
      continue;
    }

    depth += 1;
    countVisited[neighbor] = 1;
    nodeStack[depth] = neighbor;
    edgeStack[depth] = nextEdgesUsed;
    nextIndexStack[depth] = 0;
  }

  self.postMessage({ type: "total", total });
};

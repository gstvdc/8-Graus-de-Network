export { renderMeta } from "./meta-view.js";
export { showToast } from "./toast.js";
export { setStatus } from "./status-view.js";
export { populateSidebar } from "./sidebar-view.js";
export {
  showBfsResult,
  showBfs8Result,
  updateBfs8Total,
} from "./results-view.js";
export { toggleAdjacencyList } from "./adjacency-view.js";

export function populateDatalist(actors) {
  const dl = document.getElementById("actorList");
  const fragment = document.createDocumentFragment();
  for (const name of actors) {
    const opt = document.createElement("option");
    opt.value = name;
    fragment.appendChild(opt);
  }
  dl.appendChild(fragment);
}

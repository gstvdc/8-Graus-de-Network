import { CONFIG } from "./config.js";
import {
  getActorInputValues,
  setInputValue,
} from "./input-controls.js";
import {
  showToast,
  showBfsResult,
  showBfs8Result,
  toggleAdjacencyList,
} from "./ui.js";

function actorVertex(name) {
  return `${CONFIG.prefix.actor}${name}`;
}

function withLoading(btn, fn) {
  const originalText = btn.textContent;
  btn.textContent = "Calculando...";
  btn.classList.add("btn-loading");
  btn.disabled = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        fn();
      } finally {
        btn.textContent = originalText;
        btn.classList.remove("btn-loading");
        btn.disabled = false;
      }
    });
  });
}

export function bindSearchControls(graph) {
  const btnBFS = document.getElementById("btnBFS");
  const btnBFS8 = document.getElementById("btnBFS8");
  const btnShow = document.getElementById("btnShow");
  const inputOrigin = document.getElementById("inputOrigin");
  const inputDest = document.getElementById("inputDest");
  const topActorsList = document.getElementById("topActorsList");

  btnBFS.addEventListener("click", () => {
    const { origin, dest } = getActorInputValues();
    if (!origin || !dest) {
      showToast("Preencha os dois atores antes de executar o BFS.");
      return;
    }

    withLoading(btnBFS, () => {
      const path = graph.bfsShortestPath(
        actorVertex(origin),
        actorVertex(dest),
      );
      showBfsResult(path, origin, dest);
    });
  });

  btnBFS8.addEventListener("click", () => {
    const { origin, dest } = getActorInputValues();
    if (!origin || !dest) {
      showToast("Preencha os dois atores antes de executar o BFS.");
      return;
    }

    withLoading(btnBFS8, () => {
      const { paths, capped } = graph.bfsAllPaths(
        actorVertex(origin),
        actorVertex(dest),
        CONFIG.maxDegrees * 2,
      );
      showBfs8Result(paths, origin, dest, capped);
    });
  });

  btnShow.addEventListener("click", () => {
    toggleAdjacencyList(graph);
  });

  topActorsList.addEventListener("click", (event) => {
    const item = event.target.closest(".top-actor-select[data-actor-name]");
    if (!item) return;

    const actorName = item.dataset.actorName;
    const origin = inputOrigin.value.trim();
    const dest = inputDest.value.trim();

    if (!origin) {
      setInputValue(inputOrigin, actorName);
      inputOrigin.focus();
      return;
    }

    if (!dest) {
      setInputValue(inputDest, actorName);
      inputDest.focus();
      return;
    }

    showToast("Remova um ator de origem ou destino antes de adicionar outro.");
  });
}

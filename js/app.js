import { CONFIG } from "./config.js";
import { Graph } from "./graph.js";
import { bindClearInputButtons } from "./input-controls.js";
import { bindSearchControls } from "./search-controller.js";
import { fetchMovies, seedGraph } from "./seed.js";
import {
  renderMeta,
  populateDatalist,
  populateSidebar,
  setStatus,
} from "./ui.js";

const graph = new Graph();

bindClearInputButtons();
bindSearchControls(graph);

(async function init() {
  renderMeta();
  setStatus("Carregando dados...");

  try {
    const movies = await fetchMovies(CONFIG.dataUrl);
    const actors = seedGraph(graph, movies);
    populateDatalist(actors);

    const movieCount = graph
      .sortedVertices()
      .filter((v) => v.startsWith(CONFIG.prefix.movie)).length;
    setStatus(
      `Grafo carregado: ${actors.length} atores e ${movieCount} filmes.`,
    );
    populateSidebar(graph, actors.length, movieCount);
  } catch (err) {
    setStatus(`Erro ao carregar ${CONFIG.dataUrl}: ${err.message}`, true);
  }
})();

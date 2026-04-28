import { CONFIG } from "./config.js";
import { wikiSearchUrl } from "./wiki.js";

const { movie: MOVIE_PREFIX, actor: ACTOR_PREFIX } = CONFIG.prefix;

function renderTimelineNode(vertex) {
  if (vertex.startsWith(ACTOR_PREFIX)) {
    const name = vertex.slice(ACTOR_PREFIX.length);
    return `<a class="tnode tnode--actor tnode-link" href="${wikiSearchUrl(name)}" target="_blank" rel="noopener noreferrer" title="Abrir ${name} na Wikipedia">${name}</a>`;
  }

  const name = vertex.slice(MOVIE_PREFIX.length);
  return `<a class="tnode tnode--movie tnode-link" href="${wikiSearchUrl(name)}" target="_blank" rel="noopener noreferrer" title="Abrir ${name} na Wikipedia"><em>${name}</em></a>`;
}

function renderPath(path) {
  const edgeCount = path.length - 1;
  const degrees = Math.round(edgeCount / 2);
  const plural = degrees !== 1 ? "s" : "";

  const nodesHtml = path
    .map((vertex) => renderTimelineNode(vertex))
    .join('<div class="tconnector"></div>');

  return `<div class="path-timeline">
    <div class="path-degree-badge">
      <span class="degree-number">${degrees}</span>
      <span class="degree-label">grau${plural}</span>
    </div>
    <div class="path-nodes-wrap">
      <div class="timeline-nodes">${nodesHtml}</div>
    </div>
    <p class="path-meta">${edgeCount} arestas &middot; ${degrees} grau${plural} de separa&ccedil;&atilde;o</p>
  </div>`;
}

function renderPathRow(path, index) {
  const edgeCount = path.length - 1;
  const nodesHtml = path
    .map((vertex) => renderTimelineNode(vertex))
    .join('<div class="tconnector"></div>');

  return `<div class="path-row">
    <div class="path-row-header">
      <span class="path-row-title">Caminho ${index + 1}</span>
      <span class="path-row-meta">${edgeCount} arestas</span>
    </div>
    <div class="path-nodes-wrap">
      <div class="timeline-nodes">${nodesHtml}</div>
    </div>
  </div>`;
}

function renderResultContext(originName, destName) {
  return `<div class="result-context">
    <div class="result-context__label">Comparando</div>
    <div class="result-context__route">
      <span class="result-context__actor">${originName}</span>
      <span class="result-context__arrow">&rarr;</span>
      <span class="result-context__actor">${destName}</span>
    </div>
  </div>`;
}

function bindPathGroupToggles(container) {
  container.onclick = (event) => {
    const button = event.target.closest(".path-group-toggle");
    if (!button || !container.contains(button)) return;

    const group = button.closest(".path-group");
    const content = group?.querySelector(".path-group-paths");
    if (!group || !content) return;

    const isCollapsed = group.classList.contains("path-group--collapsed");
    group.classList.toggle("path-group--collapsed", !isCollapsed);
    button.setAttribute("aria-expanded", String(isCollapsed));
    content.hidden = !isCollapsed;
  };
}

export function showBfsResult(path, originName, destName) {
  const card = document.getElementById("bfsCard");
  const container = document.getElementById("bfsResult");
  card.hidden = false;

  if (!path) {
    container.innerHTML = `${renderResultContext(originName, destName)}
    <p class="no-result">
      Nenhum relacionamento encontrado entre
      <strong>${originName}</strong> e <strong>${destName}</strong>.
    </p>`;
  } else {
    container.innerHTML =
      renderResultContext(originName, destName) + renderPath(path);
  }
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function showBfs8Result(paths, originName, destName, capped = false) {
  const card = document.getElementById("bfs8Card");
  const container = document.getElementById("bfs8Result");
  card.hidden = false;

  if (!paths.length) {
    container.innerHTML = `${renderResultContext(originName, destName)}
    <p class="no-result">
      Nenhum relacionamento de até ${CONFIG.maxDegrees} graus encontrado entre
      <strong>${originName}</strong> e <strong>${destName}</strong>.
    </p>`;
  } else {
    const groups = new Map();
    for (const path of paths) {
      const edgeCount = path.length - 1;
      const degrees = Math.round(edgeCount / 2);
      if (!groups.has(degrees)) groups.set(degrees, []);
      groups.get(degrees).push(path);
    }

    const cappedNote = capped
      ? `<p class="result-capped">&#9888; Limitado a 500 caminhos para manter a performance.</p>`
      : "";

    const groupsHtml = [...groups.entries()]
      .map(([degrees, groupPaths]) => {
        const plural = degrees !== 1 ? "s" : "";
        const pathsHtml = groupPaths
          .map((path, index) => renderPathRow(path, index))
          .join("");
        return `<div class="path-group">
          <button class="path-group-toggle" type="button" aria-expanded="true">
            <div class="path-group-header">
              <div class="path-degree-badge">
                <span class="degree-number">${degrees}</span>
                <span class="degree-label">grau${plural}</span>
              </div>
              <span class="path-group-count">${groupPaths.length} caminho${groupPaths.length !== 1 ? "s" : ""}</span>
              <span class="path-group-icon" aria-hidden="true"></span>
            </div>
          </button>
          <div class="path-group-paths">${pathsHtml}</div>
        </div>`;
      })
      .join("");

    container.innerHTML =
      renderResultContext(originName, destName) +
      `<p class="result-count">${paths.length} caminho(s) encontrado(s) em ${groups.size} grupo(s) de grau.</p>` +
      cappedNote +
      groupsHtml;
    bindPathGroupToggles(container);
  }
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

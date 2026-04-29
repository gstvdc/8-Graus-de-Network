import { CONFIG } from "./config.js";
import { wikiSearchUrl } from "./wiki.js";

const { movie: MOVIE_PREFIX, actor: ACTOR_PREFIX } = CONFIG.prefix;

function movieNameFromVertex(vertex) {
  return vertex.slice(MOVIE_PREFIX.length).replace(/^\d+:/, "");
}

function renderTimelineNode(vertex) {
  if (vertex.startsWith(ACTOR_PREFIX)) {
    const name = vertex.slice(ACTOR_PREFIX.length);
    return `<a class="tnode tnode--actor tnode-link" href="${wikiSearchUrl(name)}" target="_blank" rel="noopener noreferrer" title="Abrir ${name} na Wikipedia">${name}</a>`;
  }

  const name = movieNameFromVertex(vertex);
  return `<a class="tnode tnode--movie tnode-link" href="${wikiSearchUrl(name)}" target="_blank" rel="noopener noreferrer" title="Abrir ${name} na Wikipedia"><em>${name}</em></a>`;
}

function renderPath(path) {
  const edgeCount = path.length - 1;
  const degrees = edgeCount;
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
      Nenhum relacionamento de até ${CONFIG.maxDegrees} arestas encontrado entre
      <strong>${originName}</strong> e <strong>${destName}</strong>.
    </p>`;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const CHUNK = 50;
  let rendered = 0;

  const countLabel = capped
    ? `Exibindo os primeiros <strong>${paths.length.toLocaleString("pt-BR")}</strong> caminhos. Total encontrado: <span id="bfs8TotalCount">calculando...</span>`
    : `<strong>${paths.length.toLocaleString("pt-BR")}</strong> caminho(s) encontrado(s)`;

  container.innerHTML =
    renderResultContext(originName, destName) +
    `<p class="result-count" id="bfs8CountLine" data-rendered-count="${paths.length}">${countLabel}</p>` +
    `<div id="bfs8List"></div>` +
    `<div id="bfs8ShowMore"></div>`;

  const list = document.getElementById("bfs8List");
  const showMoreWrap = document.getElementById("bfs8ShowMore");

  bindPathGroupToggles(list);

  function renderChunk() {
    const end = Math.min(rendered + CHUNK, paths.length);
    const chunk = paths.slice(rendered, end);

    // group by degree within this chunk
    const groups = new Map();
    for (let i = 0; i < chunk.length; i++) {
      const path = chunk[i];
      const degrees = path.length - 1;
      if (!groups.has(degrees)) groups.set(degrees, []);
      groups.get(degrees).push({ path, index: rendered + i });
    }

    for (const [degrees, items] of groups) {
      // try to append to an existing open group element
      const existingGroup = list.querySelector(
        `[data-degree="${degrees}"] .path-group-paths`,
      );
      if (existingGroup) {
        existingGroup.insertAdjacentHTML(
          "beforeend",
          items.map(({ path, index }) => renderPathRow(path, index)).join(""),
        );
        const countEl = list.querySelector(
          `[data-degree="${degrees}"] .path-group-count`,
        );
        if (countEl) {
          const current = parseInt(countEl.dataset.count || "0") + items.length;
          countEl.dataset.count = current;
          countEl.textContent = `${current} caminho${current !== 1 ? "s" : ""}`;
        }
      } else {
        const plural = degrees !== 1 ? "s" : "";
        const pathsHtml = items
          .map(({ path, index }) => renderPathRow(path, index))
          .join("");
        list.insertAdjacentHTML(
          "beforeend",
          `<div class="path-group" data-degree="${degrees}">
            <button class="path-group-toggle" type="button" aria-expanded="true">
              <div class="path-group-header">
                <div class="path-degree-badge">
                  <span class="degree-number">${degrees}</span>
                  <span class="degree-label">grau${plural}</span>
                </div>
                <span class="path-group-count" data-count="${items.length}">${items.length} caminho${items.length !== 1 ? "s" : ""}</span>
                <span class="path-group-icon" aria-hidden="true"></span>
              </div>
            </button>
            <div class="path-group-paths">${pathsHtml}</div>
          </div>`,
        );
      }
    }

    rendered = end;

    if (rendered < paths.length) {
      const remaining = paths.length - rendered;
      showMoreWrap.innerHTML = `<button class="show-more-btn" id="btnShowMore">Mostrar mais ${Math.min(CHUNK, remaining)} de ${remaining} restantes</button>`;
      document
        .getElementById("btnShowMore")
        .addEventListener("click", renderChunk);
    } else {
      showMoreWrap.innerHTML = "";
    }
  }

  renderChunk();
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function updateBfs8Total(total, isFinal = true) {
  const countLine = document.getElementById("bfs8CountLine");
  if (!countLine) return;

  const renderedCount = Number(countLine.dataset.renderedCount || "0");
  if (total === null) {
    countLine.innerHTML = `Exibindo os primeiros <strong>${renderedCount.toLocaleString("pt-BR")}</strong> caminhos. Total encontrado: <strong>indisponivel</strong>`;
    return;
  }

  const totalLabel = isFinal
    ? `<strong>${total.toLocaleString("pt-BR")}</strong>`
    : `<strong>${total.toLocaleString("pt-BR")}</strong> <span class="result-capped-inline">em contagem</span>`;

  countLine.innerHTML = `Exibindo os primeiros <strong>${renderedCount.toLocaleString("pt-BR")}</strong> caminhos. Total encontrado: ${totalLabel}`;
}

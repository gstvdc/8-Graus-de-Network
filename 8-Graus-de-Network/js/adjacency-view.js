import { CONFIG } from "./config.js";
import { wikiSearchUrl } from "./wiki.js";

const { movie: MOVIE_PREFIX, actor: ACTOR_PREFIX } = CONFIG.prefix;

export function toggleAdjacencyList(graph) {
  const card = document.getElementById("showCard");
  const isHidden = card.hidden;

  if (isHidden) {
    buildAdjacencyTable(graph);
    bindAdjacencySearch();
  }

  card.hidden = !isHidden;
  if (!card.hidden) card.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildAdjacencyTable(graph) {
  const tbody = document.getElementById("adjBody");
  tbody.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const vertex of graph.sortedVertices()) {
    const tr = document.createElement("tr");
    const isMovie = vertex.startsWith(MOVIE_PREFIX);
    const typeClass = isMovie ? "adj-type-movie" : "adj-type-actor";
    const label = vertex.slice(
      isMovie ? MOVIE_PREFIX.length : ACTOR_PREFIX.length,
    );

    const neighborHtml = [...graph.neighbors(vertex)]
      .map((n) => {
        const nMovie = n.startsWith(MOVIE_PREFIX);
        const cls = nMovie ? "adj-type-movie" : "adj-type-actor";
        const name = n.slice(nMovie ? MOVIE_PREFIX.length : ACTOR_PREFIX.length);
        return `<a class="adj-link ${cls}" href="${wikiSearchUrl(name)}" target="_blank" rel="noopener noreferrer">${name}</a>`;
      })
      .join(", ");

    tr.innerHTML = `<td class="${typeClass}"><a class="adj-link ${typeClass}" href="${wikiSearchUrl(label)}" target="_blank" rel="noopener noreferrer">${label}</a></td><td>${neighborHtml}</td>`;
    tr.dataset.search = label.toLowerCase();
    fragment.appendChild(tr);
  }
  tbody.appendChild(fragment);
}

function bindAdjacencySearch() {
  const input = document.getElementById("adjSearch");
  const countEl = document.getElementById("adjSearchCount");
  const tbody = document.getElementById("adjBody");

  input.value = "";
  updateAdjFilter("", tbody, countEl);

  const handler = () => updateAdjFilter(input.value, tbody, countEl);
  input.removeEventListener("input", input._adjHandler);
  input._adjHandler = handler;
  input.addEventListener("input", handler);
}

function updateAdjFilter(query, tbody, countEl) {
  const term = query.trim().toLowerCase();
  const rows = tbody.querySelectorAll("tr");
  let visible = 0;

  for (const row of rows) {
    const match = !term || row.dataset.search.includes(term);
    row.classList.toggle("adj-row-hidden", !match);
    if (match) visible++;
  }

  countEl.textContent = term
    ? `${visible} resultado(s)`
    : `${rows.length} vértices`;
}

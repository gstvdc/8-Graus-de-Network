import { CONFIG } from "./config.js";
import { wikiSearchUrl } from "./wiki.js";

const { actor: ACTOR_PREFIX } = CONFIG.prefix;

export function populateSidebar(graph, actorCount, movieCount) {
  document.getElementById("statActors").textContent =
    actorCount.toLocaleString("pt-BR");
  document.getElementById("statMovies").textContent =
    movieCount.toLocaleString("pt-BR");

  let totalDegreeSum = 0;
  for (const v of graph.sortedVertices()) {
    totalDegreeSum += graph.neighbors(v).size;
  }
  const totalEdges = Math.round(totalDegreeSum / 2);
  const totalVertices = actorCount + movieCount;
  const avgDeg =
    totalVertices > 0 ? (totalDegreeSum / totalVertices).toFixed(1) : "\u2014";

  document.getElementById("statEdges").textContent =
    totalEdges.toLocaleString("pt-BR");
  document.getElementById("statAvgDeg").textContent = avgDeg;

  const topActors = graph
    .sortedVertices()
    .filter((v) => v.startsWith(ACTOR_PREFIX))
    .map((v) => ({
      name: v.slice(ACTOR_PREFIX.length),
      degree: graph.neighbors(v).size,
    }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 10);

  const list = document.getElementById("topActorsList");
  list.innerHTML = topActors
    .map(
      ({ name, degree }, i) =>
        `<li>
          <div class="top-actor-item">
            <button class="top-actor-select" data-actor-name="${name}" type="button">
              <span class="top-actor-rank">${i + 1}</span>
              <span class="top-actor-main">
                <span class="top-actor-name">${name}</span>
              </span>
              <span class="top-actor-degree">${degree}</span>
            </button>
            <a
              class="top-actor-wiki"
              href="${wikiSearchUrl(name)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir ${name} na Wikipedia"
              title="Wikipedia"
            >W</a>
          </div>
        </li>`,
    )
    .join("");
}

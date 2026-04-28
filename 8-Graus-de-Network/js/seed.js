import { CONFIG } from "./config.js";

const { movie: MOVIE_PREFIX, actor: ACTOR_PREFIX } = CONFIG.prefix;

export function seedGraph(graph, movies) {
  const actorSet = new Set();

  for (const movie of movies) {
    if (!movie.title || !Array.isArray(movie.cast) || !movie.cast.length)
      continue;

    const movieVertex = `${MOVIE_PREFIX}${movie.title}`;

    for (const actor of movie.cast) {
      if (!actor) continue;
      const actorVertex = `${ACTOR_PREFIX}${actor}`;
      graph.addEdge(movieVertex, actorVertex);
      actorSet.add(actor);
    }
  }

  return [...actorSet].sort((a, b) => a.localeCompare(b));
}

export async function fetchMovies(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

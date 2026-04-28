export function wikiSearchUrl(name) {
  return `https://pt.wikipedia.org/wiki/Especial:Pesquisar?search=${encodeURIComponent(name)}`;
}

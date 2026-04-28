# 8 Graus de Network

Aplicação web que encontra o relacionamento mais próximo entre dois atores usando busca em largura (BFS) sobre um grafo de filmes.

## Como funciona

Cada ator e cada filme é um vértice. Uma aresta conecta um ator ao filme em que atuou. O algoritmo BFS percorre esse grafo para encontrar o caminho mínimo entre dois atores.

## Funcionalidades

- **BFS — Caminho Mínimo:** encontra o menor caminho entre dois atores
- **BFS — Até 8 Graus:** encontra todos os caminhos com até 8 arestas entre os atores
- **Mostrar Grafo:** exibe a lista de adjacências com busca por vértice

## Como executar

Serve os arquivos com qualquer servidor HTTP local (necessário para ES Modules):

```bash
npx serve .
```

Acesse `http://localhost:3000` no navegador.

## Estrutura

```
├── index.html
├── latest_movies.json
├── css/styles.css
├── imgs/unesc.png
└── js/
    ├── config.js
    ├── graph.js
    ├── seed.js
    ├── ui.js
    └── app.js
```

## Autores

- Gustavo da Cunha Constante
- João Victor Nunes Peruchi

**UNESC — Ciência da Computação — Teoria de Grafos**  
Prof. André Faria Ruaro

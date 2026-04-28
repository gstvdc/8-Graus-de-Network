import { CONFIG } from "./config.js";

export function renderMeta() {
  const { institution, course, subject, professor, authors } = CONFIG.meta;

  document.getElementById("meta-institution").textContent = institution;
  document.getElementById("meta-course").textContent = course;
  document.getElementById("meta-subject").textContent = subject;
  document.getElementById("meta-professor").textContent = professor;

  const ul = document.getElementById("meta-authors");
  for (const name of authors) {
    const li = document.createElement("li");
    li.textContent = name;
    ul.appendChild(li);
  }
}

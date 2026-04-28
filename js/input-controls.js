export function bindClearInputButtons() {
  for (const btn of document.querySelectorAll(".input-clear")) {
    const input = document.getElementById(btn.dataset.target);
    if (!input) continue;

    const syncClearButton = () => {
      btn.hidden = input.value === "";
    };

    syncClearButton();
    input.addEventListener("input", syncClearButton);
    input.addEventListener("change", syncClearButton);
    btn.addEventListener("click", () => {
      input.value = "";
      syncClearButton();
      input.focus();
    });
  }
}

export function setInputValue(input, value) {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function getActorInputValues() {
  const origin = document.getElementById("inputOrigin").value.trim();
  const dest = document.getElementById("inputDest").value.trim();
  return { origin, dest };
}

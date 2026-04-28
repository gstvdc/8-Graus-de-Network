let toastTimer;

export function showToast(message, type = "warning") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  window.clearTimeout(toastTimer);
  container.innerHTML = "";

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("toast--visible");
    window.setTimeout(() => {
      if (toast.parentNode === container) {
        container.innerHTML = "";
      }
    }, 220);
  }, 2600);
}

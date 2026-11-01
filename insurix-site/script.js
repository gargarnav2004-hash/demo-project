// Mobile navigation toggle (mirrors the original React header state).
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

function setMenuOpen(open) {
  navLinks.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => {
  setMenuOpen(!navLinks.classList.contains("open"));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

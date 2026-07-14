export function flashElement(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.classList.add("guard-flash");
  window.setTimeout(() => el.classList.remove("guard-flash"), 3000);
}

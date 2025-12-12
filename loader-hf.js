/* =========================================================
   Expiriti - loader-hf.js (Header/Footer) - Eficiente
   - Sin HEAD checks
   - Base correcta en GitHub Pages y dominio propio
   - Cache en sessionStorage
   ========================================================= */
(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  const isGh = location.hostname.endsWith("github.io");
  const firstSeg = location.pathname.split("/")[1] || "";
  const repoBase = (isGh && firstSeg) ? `/${firstSeg}/` : "/";

  // Convierte "IMG/a.webp" o "SISTEMAS/x.html" a URL absoluta desde la raíz del sitio
  const abs = (p) => {
    if (!p) return "";
    if (/^(https?:)?\/\//i.test(p) || p.startsWith("mailto:") || p.startsWith("tel:")) return p;
    return new URL(repoBase + p.replace(/^\/+/, ""), location.origin).href;
  };

  // Ruta absoluta al parcial (siempre desde /PARTIALS/ en raíz del sitio)
  const partialURL = (name) => abs(`PARTIALS/${name}`);

  // Cache por sesión (rápido y suficiente para navegación)
  const getCached = (k) => {
    try { return sessionStorage.getItem(k); } catch { return null; }
  };
  const setCached = (k, v) => {
    try { sessionStorage.setItem(k, v); } catch {}
  };

  async function fetchPartial(name){
    const key = `ex:partial:${name}:v1`;
    const cached = getCached(key);
    if (cached) return cached;

    const r = await fetch(partialURL(name), { cache: "force-cache" });
    if (!r.ok) throw new Error(`No se pudo cargar ${name} (${r.status})`);
    const html = await r.text();
    setCached(key, html);
    return html;
  }

  function hydrate(scope){
    // Imágenes con data-src
    $$("[data-src]", scope).forEach(el => {
      // Sólo si no tiene src real
      if (el.tagName === "IMG" && !el.getAttribute("src")){
        el.setAttribute("src", abs(el.getAttribute("data-src")));
      }
    });

    // Links con data-href
    $$("[data-href]", scope).forEach(el => {
      if (el.tagName === "A"){
        el.setAttribute("href", abs(el.getAttribute("data-href")));
      }
    });

    // Año footer
    const y = $("#gf-year", scope) || $("#year", scope);
    if (y) y.textContent = new Date().getFullYear();
  }

  async function run(){
    const hp = $("#header-placeholder");
    const fp = $("#footer-placeholder");

    // Si no hay placeholders, no hacemos nada
    if (!hp && !fp) return;

    // Cargar en paralelo
    const [h, f] = await Promise.all([
      hp ? fetchPartial("global-header.html") : Promise.resolve(""),
      fp ? fetchPartial("global-footer.html") : Promise.resolve("")
    ]);

    if (hp) hp.outerHTML = h;
    if (fp) fp.outerHTML = f;

    // Hidratar sólo header/footer (no todo el DOM)
    const header = $("header.gh") || $("header");
    const footer = $("footer.gf") || $("footer");
    if (header) hydrate(header);
    if (footer) hydrate(footer);
  }

  // defer ya espera parseo; igual protegemos
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

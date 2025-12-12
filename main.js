'use strict';

/* =========================================================
   Helpers base
========================================================= */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* =========================================================
   Resolución de rutas (GitHub Pages + subcarpetas)
========================================================= */
const isGh = location.hostname.endsWith('github.io');
const firstSeg = location.pathname.split('/')[1] || '';
const repoBase = (isGh && firstSeg) ? '/' + firstSeg : '';
const inSubdir =
  location.pathname.includes('/SISTEMAS/') ||
  location.pathname.includes('/SERVICIOS/');

function prefix(path) {
  if (!path || /^https?:\/\//i.test(path)) return path;

  if (isGh) {
    return (repoBase + '/' + path).replace(/\/+/g, '/');
  }
  return ((inSubdir ? '../' : '') + path).replace(/\/+/g, '/');
}

/* =========================================================
   Loader ÚNICO de Header / Footer
========================================================= */
async function loadPartials() {
  const hp = document.getElementById('header-placeholder');
  const fp = document.getElementById('footer-placeholder');
  if (!hp && !fp) return;

  const tryFetch = async (paths) => {
    for (const p of paths) {
      try {
        const r = await fetch(p);
        if (r.ok) return await r.text();
      } catch {}
    }
    return '';
  };

  const headerHTML = await tryFetch([
    prefix('PARTIALS/global-header.html'),
    prefix('../PARTIALS/global-header.html')
  ]);

  const footerHTML = await tryFetch([
    prefix('PARTIALS/global-footer.html'),
    prefix('../PARTIALS/global-footer.html')
  ]);

  if (hp && headerHTML) hp.outerHTML = headerHTML;
  if (fp && footerHTML) fp.outerHTML = footerHTML;

  // Ajuste automático de rutas
  $$('[data-src]').forEach(el => el.src = prefix(el.dataset.src));
  $$('[data-href]').forEach(el => el.href = prefix(el.dataset.href));

  const y = document.getElementById('gf-year');
  if (y) y.textContent = new Date().getFullYear();
}

/* =========================================================
   Cards clickeables (productos / sistemas)
========================================================= */
function initClickableCards() {
  $$('[data-href]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      location.href = prefix(card.dataset.href);
    });
  });
}

/* =========================================================
   Tabs de productos
========================================================= */
function initProductTabs() {
  const tabs = $$('.prod-tabs .tab');
  const panels = $$('.panel-productos');
  if (!tabs.length || !panels.length) return;

  const activate = (btn) => {
    const id = btn.dataset.target;
    if (!id) return;
    tabs.forEach(t => t.classList.toggle('active', t === btn));
    panels.forEach(p => {
      const show = p.id === id;
      p.classList.toggle('hidden', !show);
      p.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  };

  tabs.forEach(b => b.addEventListener('click', () => activate(b)));
  activate(tabs[0]);
}

/* =========================================================
   Filtros de promos / features
========================================================= */
function initPromoFilters() {
  const btns = $$('.pill[data-filter]');
  const items = $$('.feature-grid [class*="tag-"]');
  if (!btns.length || !items.length) return;

  btns.forEach(b => {
    b.addEventListener('click', () => {
      btns.forEach(x => x.classList.toggle('active', x === b));
      const f = b.dataset.filter;
      items.forEach(it => {
        it.style.display = it.classList.contains('tag-' + f) ? '' : 'none';
      });
    });
  });
}

/* =========================================================
   Formulario WhatsApp
========================================================= */
function initContactForm() {
  const f = document.getElementById('contactForm');
  if (!f) return;

  f.addEventListener('submit', e => {
    e.preventDefault();
    const lines = [
      'Hola, vengo de la página de Expiriti.',
      f.nombre?.value && `Nombre: ${f.nombre.value}`,
      f.correo?.value && `Correo: ${f.correo.value}`,
      f.telefono?.value && `Teléfono: ${f.telefono.value}`,
      f.interes?.value && `Interés: ${f.interes.value}`,
      f.detalle?.value
    ].filter(Boolean);

    const url = `https://wa.me/525568437918?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank');
  });
}

/* =========================================================
   YouTube Lite Embeds
========================================================= */
function pauseAllYT() {
  $$('iframe[src*="youtube"]').forEach(f => {
    try {
      f.contentWindow.postMessage(JSON.stringify({
        event: 'command', func: 'pauseVideo'
      }), '*');
    } catch {}
  });
}

function enhanceLiteEmbeds(root = document) {
  $$('.yt-lite[data-ytid]:not([data-ready])', root).forEach(b => {
    const id = b.dataset.ytid;
    b.innerHTML = `
      <button class="yt-lite-inner" type="button">
        <span class="yt-lite-thumb"
          style="background-image:url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')"></span>
        <span class="yt-lite-play"></span>
      </button>`;
    b.dataset.ready = '1';

    b.addEventListener('click', () => {
      if (b.dataset.loaded) return;
      pauseAllYT();
      b.innerHTML = `
        <iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1"
          allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      b.dataset.loaded = '1';
    });
  });
}

/* =========================================================
   INIT GLOBAL
========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  initClickableCards();
  initProductTabs();
  initPromoFilters();
  initContactForm();
  enhanceLiteEmbeds(document);
});

'use strict';

/* =========================================================
   Helpers
========================================================= */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* =========================================================
   Rutas (GitHub Pages + subcarpetas)
========================================================= */
const isGh = location.hostname.endsWith('github.io');
const firstSeg = location.pathname.split('/')[1] || '';
const repoBase = (isGh && firstSeg) ? '/' + firstSeg : '';
const inSubdir = location.pathname.includes('/SISTEMAS/') || location.pathname.includes('/SERVICIOS/');

function prefix(p){
  if (!p || /^https?:\/\//i.test(p) || p.startsWith('mailto:') || p.startsWith('tel:')) return p;
  if (isGh) return (repoBase + '/' + p).replace(/\/+/g,'/');
  return ((inSubdir ? '../' : '') + p).replace(/\/+/g,'/');
}

/* =========================================================
   Loader ÚNICO de header/footer (sin HEAD) + fix rutas
   Optimizado para PageSpeed:
   - 2 fetch paralelos
   - cache: force-cache
   - rutas determinísticas (1 por contexto)
========================================================= */
async function loadPartials(){
  const hp = document.getElementById('header-placeholder');
  const fp = document.getElementById('footer-placeholder');
  if (!hp && !fp) return;

  // Rutas determinísticas:
  // - En index:  PARTIALS/...
  // - En subcarpetas: ../PARTIALS/...
  const base = inSubdir ? '../' : '';
  const headerURL = prefix(base + 'PARTIALS/global-header.html');
  const footerURL = prefix(base + 'PARTIALS/global-footer.html');

  const [h, f] = await Promise.all([
    fetch(headerURL, { cache: 'force-cache' }).then(r => r.ok ? r.text() : ''),
    fetch(footerURL, { cache: 'force-cache' }).then(r => r.ok ? r.text() : '')
  ]);

  if (hp && h) hp.outerHTML = h;
  if (fp && f) fp.outerHTML = f;

  // microtick para que el DOM se asiente
  await Promise.resolve();

  // Resolver rutas dentro de parciales
  $$('.js-abs-src[data-src]').forEach(img => { img.src = prefix(img.dataset.src); });
  $$('.js-abs-href[data-href]').forEach(a => {
    const raw = a.dataset.href; if (!raw) return;
    const [path, hash] = raw.split('#');
    a.href = prefix(path) + (hash ? '#'+hash : '');
  });

  $$('.js-img[data-src]').forEach(img => { img.src = prefix(img.dataset.src); });
  $$('.js-link[data-href]').forEach(a => { a.href = prefix(a.dataset.href); });

  const y = document.getElementById('gf-year');
  if (y) y.textContent = new Date().getFullYear();
}

/* =========================================================
   Delegación: click en [data-href] (1 listener)
========================================================= */
function initDelegatedHref(){
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-href]');
    if (!el) return;
    if (e.target.closest('a,button')) return;
    const href = el.getAttribute('data-href');
    if (!href) return;
    location.href = prefix(href);
  }, { passive: true });
}

/* =========================================================
   Pills: filtrar feature cards por tag-*
========================================================= */
function initPillFilters(){
  const btns = $$('.pillbar .pill[data-filter]');
  const grid = $('.feature-grid');
  if (!btns.length || !grid) return;

  const cards = $$('.feature-grid .fcard', grid);
  if (!cards.length) return;

  const setFilter = (type) => {
    btns.forEach(b => {
      const on = b.dataset.filter === type;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    cards.forEach(c => {
      c.style.display = c.classList.contains('tag-' + type) ? '' : 'none';
    });
  };

  btns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));
  const active = btns.find(b => b.classList.contains('active')) || btns[0];
  if (active) setFilter(active.dataset.filter);
}

/* =========================================================
   YouTube Lite (para .reel-embed y .yt-wrap)
   Optimizado:
   - crea botón de preview
   - solo “prepara” cuando está cerca del viewport (IO)
========================================================= */
function pauseAllYouTube(){
  $$('iframe[src*="youtube.com/embed"], iframe[src*="youtube-nocookie.com/embed"]').forEach(f => {
    try{
      f.contentWindow.postMessage(JSON.stringify({ event:'command', func:'pauseVideo', args:'' }), '*');
    } catch {}
  });
}

function buildLite(el){
  if (!el || el.dataset.ytReady === '1') return;
  const id = el.dataset.ytid;
  if (!id) return;

  const title = el.dataset.title || 'Reproducir video';
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  el.innerHTML = `
    <button class="yt-lite-inner" type="button" aria-label="${title}">
      <span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span>
      <span class="yt-lite-play"></span>
    </button>`;
  el.dataset.ytReady = '1';

  el.addEventListener('click', () => {
    if (el.dataset.ytLoaded === '1') return;
    pauseAllYouTube();
    const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    el.innerHTML = `
      <iframe class="yt-iframe" src="${src}" title="${title}" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>`;
    el.dataset.ytLoaded = '1';
  }, { passive: true });
}

function initVideoEmbedsLazy(){
  const targets = [
    ...$$('.reel-embed[data-ytid]'),
    ...$$('.yt-wrap[data-ytid]')
  ];
  if (!targets.length) return;

  // Fallback si no hay IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    targets.forEach(buildLite);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(ent => {
      if (!ent.isIntersecting) return;
      buildLite(ent.target);
      obs.unobserve(ent.target);
    });
  }, { root: null, rootMargin: '300px 0px', threshold: 0.01 });

  targets.forEach(t => io.observe(t));
}

/* =========================================================
   Carrusel genérico .carousel
   - muestra 1 slide a la vez (display none)
   - dots autogenerados si faltan
========================================================= */
function initCarousels(){
  $$('.carousel').forEach(carousel => {
    const track = $('.carousel-track', carousel);
    if (!track) return;

    const slides = $$('.carousel-slide', track);
    if (slides.length <= 1) return;

    const prev = $('.prev', carousel);
    const next = $('.next', carousel);
    const nav  = $('.carousel-nav', carousel);

    let idx = 0;

    const ensureDots = () => {
      if (!nav) return [];
      let dots = $$('.dot', nav);
      if (dots.length === slides.length) return dots;

      nav.innerHTML = '';
      slides.forEach((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Grupo ${i+1}`);
        d.addEventListener('click', () => go(i));
        nav.appendChild(d);
      });
      return $$('.dot', nav);
    };

    let dots = ensureDots();

    const go = (i) => {
      idx = ((i % slides.length) + slides.length) % slides.length;
      slides.forEach((s, k) => {
        const on = k === idx;
        s.style.display = on ? '' : 'none';
        s.classList.toggle('active', on);
      });
      dots.forEach((d, k) => d.classList.toggle('active', k === idx));

      // Pausa videos al cambiar slide (si ya hay iframes)
      if ($$('iframe', carousel).length) pauseAllYouTube();
    };

    prev && prev.addEventListener('click', () => go(idx - 1));
    next && next.addEventListener('click', () => go(idx + 1));

    // Estado inicial
    go(0);
  });
}

/* =========================================================
   listSlider (beneficios)
========================================================= */
function initListSliders(){
  $$('.listSlider').forEach(sl => {
    const track = $('.listTrack', sl);
    if (!track) return;

    const pages = $$('.listPage', track);
    if (pages.length <= 1) return;

    const prev = $('.prev', sl);
    const next = $('.next', sl);
    let idx = 0;

    const go = (i) => {
      idx = ((i % pages.length) + pages.length) % pages.length;
      pages.forEach((p, k) => p.style.display = (k === idx ? '' : 'none'));
    };

    prev && prev.addEventListener('click', () => go(idx - 1));
    next && next.addEventListener('click', () => go(idx + 1));
    go(0);
  });
}

/* =========================================================
   carouselX (integraciones)
========================================================= */
function initCarouselX(){
  $$('.carouselX').forEach(root => {
    const track = $('.track', root);
    if (!track) return;

    const items = $$('.sys', track);
    if (items.length <= 1) return;

    const step = Math.max(1, parseInt(root.getAttribute('data-step') || '3', 10));
    const prev = $('.prev', root);
    const next = $('.next', root);
    const dotsWrap = $('.group-dots', root);

    let page = 0;
    const pageCount = Math.ceil(items.length / step);

    const renderDots = () => {
      if (!dotsWrap) return [];
      dotsWrap.innerHTML = '';
      for (let i = 0; i < pageCount; i++) {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Página ${i+1}`);
        d.addEventListener('click', () => go(i));
        dotsWrap.appendChild(d);
      }
      return $$('.dot', dotsWrap);
    };

    const dots = renderDots();

    const go = (p) => {
      page = ((p % pageCount) + pageCount) % pageCount;
      const start = page * step;
      const end = start + step;
      items.forEach((it, i) => it.style.display = (i >= start && i < end) ? '' : 'none');
      dots.forEach((d, i) => d.classList.toggle('active', i === page));
    };

    prev && prev.addEventListener('click', () => go(page - 1));
    next && next.addEventListener('click', () => go(page + 1));
    go(0);
  });
}

/* =========================================================
   TOC (mapa)
========================================================= */
function initTOC(){
  const toc = document.getElementById('toc');
  if (!toc) return;

  const toggle = document.getElementById('tocToggle') || $('.toc-toggle', toc);
  const closeBtn = $('.toc-close', toc);

  const open  = () => toc.classList.remove('collapsed');
  const close = () => toc.classList.add('collapsed');

  toggle && toggle.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);

  $$('a[href^="#"]', toc).forEach(a => a.addEventListener('click', close));
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  // 1) parciales primero (para que header/footer existan)
  await loadPartials();

  // 2) init livianos / delegados
  initDelegatedHref();
  initPillFilters();
  initTOC();

  // 3) UI con DOM ya armado
  initListSliders();
  initCarouselX();
  initCarousels();

  // 4) YouTube lite perezoso
  initVideoEmbedsLazy();
});

// =========================================================
// Expiriti — Servicios (Soporte): JS independiente
// No requiere main.js. Incluye helpers defensivos.
// =========================================================

(function(){
  "use strict";

  // ---------- Helpers mínimos ----------
  const $   = (sel, ctx=document) => ctx.querySelector(sel);
  const $$  = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const on  = (el, ev, fn) => el && el.addEventListener(ev, fn);

  // ---------- Año en footer ----------
  (function(){
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  })();

  // ---------- Menú móvil ----------
  (function(){
    const burger = $('#burger');
    const mobile = $('#mobileMenu');
    if (!burger || !mobile) return;
    on(burger, 'click', ()=> mobile.classList.toggle('open'));
  })();

  // ---------- TOC (Mapa flotante) ----------
  (function(){
    const toc = $('#toc');
    if(!toc) return;
    const openBtn  = $('#tocToggle');
    const closeBtn = $('.toc-close', toc);
    if(!openBtn || !closeBtn) return;

    on(openBtn, 'click', (e)=>{ e.stopPropagation(); toc.classList.toggle('collapsed'); });
    on(closeBtn, 'click', ()=> toc.classList.add('collapsed'));
    $$('.toc a', toc).forEach(a=> on(a, 'click', ()=> toc.classList.add('collapsed')));
    on(document, 'click', (e)=>{ if(!toc.contains(e.target) && e.target !== openBtn) toc.classList.add('collapsed'); });
  })();

  // ---------- Anclas suaves con compensación de header ----------
  (function(){
    const header = document.querySelector('header');
    const offset = ()=> (header ? header.getBoundingClientRect().height + 8 : 80);
    $$('.toc a[href^="#"], nav a[href^="#"]').forEach(a=>{
      on(a, 'click', (e)=>{
        const id = a.getAttribute('href');
        if(!id || id === '#') return;
        const target = document.querySelector(id);
        if(!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - offset();
        window.scrollTo({ top, behavior: 'smooth' });
        history.pushState(null, '', id);
      });
    });
  })();

  // ---------- Galería portada (carousel simple) ----------
  (function(){
    const root  = $('#carousel1');
    if(!root) return;
    const track = $('.carousel-track', root);
    const dots  = $$('.dot', root);
    const prev  = $('.arrowCircle.prev', root);
    const next  = $('.arrowCircle.next', root);
    let idx = 0;

    function setActive(i){
      if (!track || !dots.length) return;
      idx = (i + dots.length) % dots.length;
      dots.forEach((d,di)=> d.classList.toggle('active', di===idx));
      track.scrollTo({ left: track.clientWidth * idx, behavior:'smooth' });
    }
    dots.forEach((d,i)=> on(d, 'click', ()=> setActive(i)));
    on(prev, 'click', ()=> setActive(idx-1));
    on(next, 'click', ()=> setActive(idx+1));
    on(track, 'scroll', ()=>{
      const i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((d,di)=> d.classList.toggle('active', di===i));
      idx = i;
    });
    on(window, 'resize', ()=> setActive(idx));
    setActive(0);
  })();

  // ---------- Slider “¿Por qué elegirnos?” (por páginas) ----------
  (function(){
    const wrap  = document.querySelector('#beneficios .listSlider');
    if(!wrap) return;
    const track = $('.listTrack', wrap);
    const prev  = $('.prev', wrap);
    const next  = $('.next', wrap);
    if(!track || !prev || !next) return;

    let page = 0;
    const total = track.children.length;
    function go(i){
      page = (i + total) % total;
      track.scrollTo({ left: wrap.clientWidth * page, behavior:'smooth' });
    }
    on(prev, 'click', ()=> go(page-1));
    on(next, 'click', ()=> go(page+1));
    on(window, 'resize', ()=> go(page));
  })();

  // ---------- Carrusel de sistemas (cards horizontales reusables) ----------
  (function(){
    $$('.carouselX').forEach(root=>{
      const track    = $('.track', root);
      const prev     = $('.arrowCircle.prev', root);
      const next     = $('.arrowCircle.next', root);
      const dotsWrap = $('.group-dots', root);
      if(!track) return;

      const items = $$('.sys', track);
      let itemsPerPage = 3;

      const updateItemsPerPage = () => {
        if (window.innerWidth <= 680) itemsPerPage = 1;
        else if (window.innerWidth <= 980) itemsPerPage = 2;
        else itemsPerPage = 3;
      };
      updateItemsPerPage();

      const groupsCount = () => Math.max(1, Math.ceil(items.length / itemsPerPage));
      const groupW = () => track.clientWidth / itemsPerPage * Math.min(items.length, itemsPerPage);

      function getScrollAmount(i){
        if (itemsPerPage === 1 && items[i]) {
          return items[i].offsetLeft - (track.clientWidth - items[i].clientWidth) / 2;
        }
        return i * groupW();
      }

      function updateCarouselStyles(){
        items.forEach(item => {
          item.style.flexBasis = `calc((100% - ${12 * (itemsPerPage - 1)}px) / ${itemsPerPage})`;
        });
      }
      updateCarouselStyles();

      const shouldShow = groupsCount() > 1;
      if (prev) prev.style.display = shouldShow ? '' : 'none';
      if (next) next.style.display = shouldShow ? '' : 'none';
      if (dotsWrap) dotsWrap.style.display = shouldShow ? '' : 'none';
      if (!shouldShow) return;

      let dots = [];
      function setDot(i){ dots.forEach((d,idx)=> d.classList.toggle('active', idx===i)); }
      function goTo(i){
        track.scrollTo({ left: getScrollAmount(i), behavior:'smooth' });
        setDot(i);
      }

      if (dotsWrap){
        dotsWrap.innerHTML = '';
        dots = Array.from({length: groupsCount()}, (_,i)=>{
          const b = document.createElement('button');
          b.className = 'dot' + (i===0 ? ' active' : '');
          b.setAttribute('aria-label', `Ir al grupo ${i+1}`);
          on(b, 'click', ()=> goTo(i));
          dotsWrap.appendChild(b);
          return b;
        });
      }

      let idx = 0;
      on(prev, 'click', ()=> { idx = Math.max(0, idx-1); goTo(idx); });
      on(next, 'click', ()=> { idx = Math.min(dots.length-1, idx+1); goTo(idx); });

      on(window, 'resize', ()=>{
        updateItemsPerPage();
        updateCarouselStyles();
        goTo(idx);
      });

      goTo(0);
    });
  })();

  // ---------- Filtros por píldoras (hora / póliza / garantía) ----------
  (function(){
    const pills = $$('.pill');
    const cards = $$('.feature-grid .fcard');
    if(!pills.length || !cards.length) return;

    function apply(filter){
      cards.forEach(c=>{
        const show =
          (filter==='hora'     && c.classList.contains('tag-hora'))     ||
          (filter==='poliza'   && c.classList.contains('tag-poliza'))   ||
          (filter==='garantia' && c.classList.contains('tag-garantia'));
        c.style.display = show ? '' : 'none';
      });
    }
    pills.forEach(p=>{
      on(p, 'click', ()=>{
        pills.forEach(x=> x.classList.remove('active'));
        p.classList.add('active');
        apply(p.dataset.filter);
      });
    });
    apply('hora'); // filtro inicial (ajústalo si lo deseas)
  })();

  // ---------- FAQ acordeón (uno abierto a la vez) ----------
  (function(){
    const wrap = $('#faqWrap');
    if(!wrap) return;
    const items = $$('.faq-item', wrap);
    items.forEach(d=>{
      on(d, 'toggle', ()=>{
        if(d.open){ items.forEach(o=>{ if(o!==d) o.removeAttribute('open'); }); }
      });
    });
  })();

  // ---------- (Opcional) Bloque “Aplica a” por servicio ----------
  // Usa data-apply="contabilidad,nominas,comercial,..." en cada .fcard
  (function(){
    const SYS_ICONS = {
      contabilidad:{src:'../IMG/contabilidad.webp',alt:'CONTPAQi Contabilidad'},
      nominas:{src:'../IMG/nominas.webp',alt:'CONTPAQi Nóminas'},
      comercial:{src:'../IMG/comercial.webp',alt:'CONTPAQi Comercial'},
      bancos:{src:'../IMG/bancos.webp',alt:'CONTPAQi Bancos'},
      contabiliza:{src:'../IMG/contabiliza.webp',alt:'CONTPAQi Contabiliza'},
      personia:{src:'../IMG/personia.webp',alt:'CONTPAQi Personia'},
      vende:{src:'../IMG/vende.webp',alt:'CONTPAQi Vende'},
      analiza:{src:'../IMG/analiza.webp',alt:'CONTPAQi Analiza'},
      despachos:{src:'../IMG/despachos.webp',alt:'CONTPAQi Despachos'}
    };

    $$('.feature-grid .fcard[data-apply]').forEach(card=>{
      if($('.aplica-wrap', card)) return; // evita duplicado
      const list = (card.getAttribute('data-apply')||'')
        .split(',').map(s=>s.trim()).filter(Boolean);
      if(!list.length) return;

      const wrap = document.createElement('div');
      wrap.className = 'aplica-wrap';

      const title = document.createElement('div');
      title.className = 'aplica-title';
      title.textContent = 'Aplica a:';
      wrap.appendChild(title);

      const icons = document.createElement('div');
      icons.className = 'aplica-sistemas';

      list.forEach(key=>{
        const info = SYS_ICONS[key];
        if(!info) return;
        const img = document.createElement('img');
        img.src = info.src; img.alt = info.alt; icons.appendChild(img);
      });

      wrap.appendChild(icons);
      card.appendChild(wrap);
    });
  })();

  // ---------- (Opcional) Tarjetas <article.sys> con data-href ----------
  (function(){
    $$('.carouselX .sys[data-href]').forEach(card=>{
      card.style.cursor = 'pointer';
      on(card, 'click', ()=>{
        const url = card.getAttribute('data-href');
        if(url) window.location.href = url;
      });
    });
  })();

})();

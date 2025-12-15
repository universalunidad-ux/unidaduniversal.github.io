// =========================================================
// Expiriti - mainservicios.js
// Servicios (Soporte, Pólizas, Cursos, Migraciones, etc.)
// Parciales + TOC + Carruseles + Filtros + FAQ + YouTube pause
// =========================================================

(function(){
  "use strict";

  // -------- Helpers básicos --------
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // =========================================================
  // 1) Servicios complementarios: <li> completo como link
  // =========================================================
  (function(){
    $$('#servicios-complementarios .svc-link[data-url]').forEach(li=>{
      const go = () => {
        const url = li.getAttribute('data-url');
        if (url) window.location.href = url;
      };
      li.addEventListener('click', go);
      li.addEventListener('keydown', e=>{
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });
  })();

  // =========================================================
  // 2) Carga de parciales (header/footer) + normalización rutas
  // =========================================================
  (async function loadPartials(){
    const exists = async (u) => {
      try {
        const r = await fetch(u, { method:"HEAD" });
        return r.ok;
      } catch {
        return false;
      }
    };

    const pickFirst = async (paths) => {
      for (const p of paths){
        if (await exists(p)) return p;
      }
      return paths[0];
    };

    const isGh      = location.hostname.endsWith("github.io");
    const firstSeg  = location.pathname.split("/")[1] || "";
    const repoBase  = (isGh && firstSeg) ? ("/" + firstSeg) : "";
    const inSubDir  = /\/(SISTEMAS|SERVICIOS)\//i.test(location.pathname);

    function prefix(p){
      if (!p || /^https?:\/\//i.test(p)) return p;
      if (isGh) return (repoBase + "/" + p).replace(/\/+/g, "/");
      const depth = inSubDir ? "../" : "";
      return (depth + p).replace(/\/+/g, "/");
    }

    const headerURL = await pickFirst([
      "../PARTIALS/global-header.html",
      "./PARTIALS/global-header.html",
      `${repoBase}/PARTIALS/global-header.html`,
      "/PARTIALS/global-header.html"
    ]);
    const footerURL = await pickFirst([
      "../PARTIALS/global-footer.html",
      "./PARTIALS/global-footer.html",
      `${repoBase}/PARTIALS/global-footer.html`,
      "/PARTIALS/global-footer.html"
    ]);

    let headerHTML = "";
    let footerHTML = "";
    try{
      [headerHTML, footerHTML] = await Promise.all([
        fetch(headerURL).then(r=>r.text()),
        fetch(footerURL).then(r=>r.text())
      ]);
    }catch(e){
      console.warn("No se pudieron cargar parciales de header/footer", e);
    }

    const hp = $("#header-placeholder");
    const fp = $("#footer-placeholder");
    if (hp && headerHTML) hp.outerHTML = headerHTML;
    if (fp && footerHTML) fp.outerHTML = footerHTML;

    // Normalización de rutas declarativas dentro de parciales
    $$(".js-abs-src[data-src]").forEach(img=>{
      img.src = prefix(img.getAttribute("data-src"));
    });
    $$(".js-abs-href[data-href]").forEach(a=>{
      const p = a.getAttribute("data-href");
      if (!p) return;
      const [path, hash] = p.split("#");
      a.href = prefix(path) + (hash ? ("#" + hash) : "");
    });

    $$(".js-img[data-src]").forEach(img=>{
      img.src = prefix(img.getAttribute("data-src"));
    });
    $$(".js-link[data-href]").forEach(a=>{
      a.href = prefix(a.getAttribute("data-href"));
    });

    const y = $("#gf-year");
    if (y) y.textContent = new Date().getFullYear();
  })();

  // =========================================================
  // 3) TOC flotante (índice) — mapa del sitio
  // =========================================================
  (function(){
    const toc      = $("#toc");
    const openBtn  = $("#tocToggle");
    const closeBtn = toc?.querySelector(".toc-close");
    if (!toc || !openBtn || !closeBtn) return;

    openBtn.addEventListener("click", e=>{
      e.stopPropagation();
      toc.classList.toggle("collapsed");
    });

    closeBtn.addEventListener("click", ()=> toc.classList.add("collapsed"));

    toc.querySelectorAll("a").forEach(a=>{
      a.addEventListener("click", ()=> toc.classList.add("collapsed"));
    });

    document.addEventListener("click", e=>{
      if (!toc.contains(e.target) && e.target !== openBtn){
        toc.classList.add("collapsed");
      }
    });
  })();

  // =========================================================
  // 4) Carrusel genérico (.carousel) — dots + flechas
  //    EXCLUYE reels (id^="carouselReels") y NO toca .reel-title
  // =========================================================
  (function(){
    function initCarousel(root){
      const track = root.querySelector(".carousel-track");
      const prev  = root.querySelector(".arrowCircle.prev");
      const next  = root.querySelector(".arrowCircle.next");
      let dots    = [...root.querySelectorAll(".carousel-nav .dot")];
      let i = 0;
      let len = dots.length || (track?.children?.length || 0);

      if(!track || !len) return;

      function paint(idx){
        dots.forEach((d,di)=>d.classList.toggle("active",di===idx));
      }

      function toggleUI(){
        const multi = len > 1;
        if (prev) prev.style.display = multi ? "" : "none";
        if (next) next.style.display = multi ? "" : "none";
        const nav = root.querySelector(".carousel-nav");
        if (nav) nav.style.display = multi ? "" : "none";
      }

      function set(n){
        i = (n + len) % len;
        const w = track.clientWidth || root.clientWidth || 1;
        paint(i);
        track.scrollTo({left:w * i, behavior:"smooth"});
        toggleUI();
      }

      dots.forEach((d,idx)=>d.addEventListener("click",()=>{
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        set(idx);
      }));
      prev && prev.addEventListener("click",()=>{
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        set(i-1);
      });
      next && next.addEventListener("click",()=>{
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        set(i+1);
      });

      track.addEventListener("scroll",()=>{
        const w = track.clientWidth || 1;
        const n = Math.round(track.scrollLeft / w);
        if(n!==i){
          i=n;
          paint(i);
        }
      });

      window.addEventListener("resize",()=>set(i));
      set(0);
    }

    document.querySelectorAll('.carousel:not([id^="carouselReels"])').forEach(initCarousel);
  })();

  // =========================================================
  // 5) List slider (“beneficios”) - CORREGIDO
  // =========================================================
  (function(){
    document.querySelectorAll(".listSlider").forEach(w=>{
      const track = w.querySelector(".listTrack");
      const prev  = w.querySelector(".arrowCircle.prev");
      const next  = w.querySelector(".arrowCircle.next");
      if(!track || !prev || !next) return;

      let i = 0;
      const pages = track.children;
      const len = pages.length;

      function go(n){
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        i = (n + len) % len;

        // ancho visible real del track
        const width = track.clientWidth || 1;
        track.scrollTo({ left: width * i, behavior: "smooth" });
      }

      prev.addEventListener("click", () => go(i - 1));
      next.addEventListener("click", () => go(i + 1));
      window.addEventListener("resize", () => setTimeout(() => go(i), 100));
      go(0);
    });
  })();

  // =========================================================
  // 6) Píldoras (filtros de servicios)
  // =========================================================
  (function(){
    const pills = [...document.querySelectorAll(".pill")];
    const cards = [...document.querySelectorAll(".feature-grid .fcard")];
    if(!pills.length || !cards.length) return;

    function apply(tag){
      cards.forEach(card=>{
        if (!tag){ card.style.display = ""; return; }
        card.style.display = card.classList.contains("tag-"+tag) ? "" : "none";
      });
    }

    pills.forEach(p=>{
      p.addEventListener("click", ()=>{
        pills.forEach(x=>x.classList.remove("active"));
        p.classList.add("active");
        apply(p.dataset.filter || "");
      });
    });

    const first = pills[0];
    if (first){
      first.classList.add("active");
      apply(first.dataset.filter || "");
    }
  })();

  // =========================================================
  // 7) FAQ: solo uno abierto a la vez
  // =========================================================
  (function(){
    const wrap = document.getElementById("faqWrap");
    if(!wrap) return;
    [...wrap.querySelectorAll(".faq-item")].forEach(item=>{
      item.addEventListener("toggle",()=>{
        if(item.open){
          [...wrap.querySelectorAll(".faq-item")].forEach(o=>{
            if(o !== item) o.removeAttribute("open");
          });
        }
      });
    });
  })();

  // =========================================================
  // 8) Carrusel de tarjetas horizontales (.carouselX) — dots + flechas
  //    (Esto corrige “Plataformas que Integramos” y “Sistemas que Soportamos”)
  // =========================================================
  (function(){
    function ensureUI(root){
      let prev = root.querySelector(".arrowCircle.prev");
      let next = root.querySelector(".arrowCircle.next");
      if(!prev){
        prev = document.createElement("button");
        prev.className = "arrowCircle prev";
        prev.setAttribute("aria-label","Anterior");
        prev.innerHTML = '<span class="chev">‹</span>';
        root.appendChild(prev);
      }
      if(!next){
        next = document.createElement("button");
        next.className = "arrowCircle next";
        next.setAttribute("aria-label","Siguiente");
        next.innerHTML = '<span class="chev">›</span>';
        root.appendChild(next);
      }
      let dotsWrap = root.querySelector(".group-dots");
      if(!dotsWrap){
        dotsWrap = document.createElement("div");
        dotsWrap.className = "group-dots";
        root.appendChild(dotsWrap);
      }
      return { prev, next, dotsWrap };
    }

    document.querySelectorAll(".carouselX").forEach(root=>{
      const track = root.querySelector(".track");
      if(!track) return;

      const items = [...root.querySelectorAll(".sys")];
      if (!items.length) return;

      // Si un .sys tiene data-href → se vuelve clicable
      items.forEach(it=>{
        const href = it.getAttribute("data-href");
        if(!href) return;
        it.setAttribute("role","link");
        it.setAttribute("tabindex","0");
        const go = () => window.open(href,"_blank","noopener");
        it.addEventListener("click", go);
        it.addEventListener("keydown", e=>{
          if(e.key === "Enter" || e.key === " "){
            e.preventDefault();
            go();
          }
        });
      });

      const { prev, next, dotsWrap } = ensureUI(root);

      const stepDesktop = parseInt(root.getAttribute("data-step") || "3", 10) || 3;
      const perView = () => (window.innerWidth <= 980 ? 1 : stepDesktop);
      const viewportW = () => track.clientWidth || root.clientWidth || 1;

      const pageCount = () => {
        const w = viewportW();
        const total = Math.ceil(items.length / Math.max(1, perView()));
        // fallback por si el layout todavía no mide bien:
        return Math.max(1, total || 1);
      };

      function buildDots(){
        dotsWrap.innerHTML = "";
        const total = pageCount();
        const arr = [...Array(total)].map((_,j)=>{
          const b = document.createElement("button");
          b.className = "dot" + (j===0 ? " active" : "");
          b.setAttribute("aria-label","Ir a página "+(j+1));
          b.addEventListener("click",()=>{
            if (window.pauseAllYTIframes) window.pauseAllYTIframes();
            go(j);
          });
          dotsWrap.appendChild(b);
          return b;
        });
        return arr;
      }

      let dots = buildDots();
      let idx  = 0;

      function paint(j){
        dots.forEach((d,i)=>d.classList.toggle("active", i===j));
      }

      function toggleUI(){
        const multi = pageCount() > 1;
        prev.style.display     = multi ? "" : "none";
        next.style.display     = multi ? "" : "none";
        dotsWrap.style.display = multi ? "" : "none";
      }

      function go(j){
        const total = pageCount();
        idx = ((j % total) + total) % total;

        // mover por “páginas” (en escritorio avanza de step en step)
        const startIdx = Math.min(idx * perView(), items.length - 1);
        const first    = items[startIdx];
        const baseLeft = first ? first.offsetLeft - (items[0]?.offsetLeft || 0) : 0;

        const maxLeft = Math.max(0, track.scrollWidth - viewportW());
        const left    = Math.min(Math.max(0, baseLeft), maxLeft);

        track.scrollTo({left, behavior:"smooth"});
        paint(idx);
        toggleUI();
      }

      prev.addEventListener("click",()=>{
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        go(idx-1);
      });
      next.addEventListener("click",()=>{
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        go(idx+1);
      });

      // Ajustes robustos
      function hardRefresh(){
        dots = buildDots();
        idx = 0;
        track.scrollTo({ left: 0, behavior: "auto" });
        paint(0);
        toggleUI();
      }

      window.addEventListener("resize",()=>{
        // recalcula páginas y mantiene idx dentro
        dots = buildDots();
        setTimeout(()=>go(Math.min(idx, pageCount()-1)), 0);
      });

      window.addEventListener("load", ()=> setTimeout(hardRefresh, 0));
      window.addEventListener("pageshow", ()=> setTimeout(hardRefresh, 0));
      setTimeout(hardRefresh, 350);

      // Estado inicial
      toggleUI();
      go(0);
    });
  })();

  // =========================================================
  // 9) GESTOR YOUTUBE — pausa reels al cambiar
  // =========================================================
  (function(){
    if (!window.exPlayers) window.exPlayers = [];

    if (!window.pauseAllYTIframes) {
      window.pauseAllYTIframes = function(exceptPlayer){
        window.exPlayers.forEach(p=>{
          if (!p || p === exceptPlayer) return;
          try{
            if (typeof p.getPlayerState === "function" &&
                typeof p.pauseVideo     === "function"){
              const s = p.getPlayerState();
              if (s === 1 || s === 3) p.pauseVideo();
            }
          }catch(e){}
        });
      };
    }

    function onPlayerStateChange(event){
      if (event.data === 1){
        window.pauseAllYTIframes(event.target);
      }
    }

    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){
      if (typeof prevOnReady === "function") prevOnReady();

      document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe=>{
        if (iframe.dataset.ytInit) return;
        iframe.dataset.ytInit = "1";

        let src = iframe.src;
        if (!src.includes("enablejsapi=1")){
          src += (src.includes("?") ? "&" : "?") + "enablejsapi=1";
          iframe.src = src;
        }

        if (window.YT && window.YT.Player){
          const player = new YT.Player(iframe, {
            events:{ onStateChange:onPlayerStateChange }
          });
          window.exPlayers.push(player);
        }
      });
    };

    if (!window.YT || !window.YT.Player){
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    } else {
      window.onYouTubeIframeAPIReady();
    }
  })();

  // =========================================================
  // 10) Carrusel de REELS (título único + oculta flechas si 1 reel)
  //      - Siempre deja 1 solo .reel-title visible
  //      - Si no hay reels o hay 1 → oculta flechas y dots
  // =========================================================
  (function(){
    function ensureDots(root, slides){
      const nav = root.querySelector(".carousel-nav");
      if (!nav) return [];
      // Si ya hay dots en HTML, respeta; si no, los crea.
      let dots = [...nav.querySelectorAll(".dot")];
      if (dots.length === slides.length) return dots;

      nav.innerHTML = "";
      dots = slides.map((_,i)=>{
        const b = document.createElement("button");
        b.className = "dot" + (i===0 ? " active" : "");
        b.type = "button";
        b.setAttribute("aria-label", "Ir al reel " + (i+1));
        nav.appendChild(b);
        return b;
      });
      return dots;
    }

    document.querySelectorAll('.carousel[id^="carouselReels"]').forEach(root => {
      const scope  = root.closest('aside') || root;
      const track  = root.querySelector('.carousel-track');
      const slides = [...(track?.querySelectorAll('.carousel-slide') || [])];
      const prev   = root.querySelector('.arrowCircle.prev');
      const next   = root.querySelector('.arrowCircle.next');
      const nav    = root.querySelector('.carousel-nav');

      if(!track || !slides.length){
        // No hay reels → oculta UI
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
        if (nav)  nav.style.display  = "none";
        return;
      }

      // TÍTULO ÚNICO: usa el primero y oculta el resto
      const reelTitles = [...scope.querySelectorAll('.reel-title')];
      let titleEl = reelTitles[0] || null;
      if (reelTitles.length > 1){
        reelTitles.slice(1).forEach(el => { el.style.display = "none"; });
      }
      if (titleEl){
        titleEl.style.display = "";
        titleEl.classList.add("active");
      }

      // Dots: asegurar que coincidan con cantidad de slides
      const dots = ensureDots(root, slides);

      // Extraer títulos desde: data-title (reel-embed o slide) o title del iframe
      const titles = slides.map(sl => {
        const wrap = sl.querySelector('.reel-embed');
        const ifr  = sl.querySelector('iframe');
        return (wrap?.dataset?.title) || (sl.dataset?.title) || (ifr?.getAttribute('title')) || '';
      });

      let idx = 0;

      function toggleUI(){
        const multi = slides.length > 1;
        if (prev) prev.style.display = multi ? "" : "none";
        if (next) next.style.display = multi ? "" : "none";
        if (nav)  nav.style.display  = multi ? "" : "none";
      }

      function paint(){
        dots.forEach((d, di) => d.classList.toggle('active', di === idx));
        slides.forEach((sl, si) => sl.classList.toggle('is-active', si === idx));
        if (titleEl){
          titleEl.textContent = titles[idx] || "";
        }
      }

      function setActive(i){
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        idx = (i + slides.length) % slides.length;
        const w = track.clientWidth || root.clientWidth || 1;
        track.scrollTo({ left: w * idx, behavior: 'smooth' });
        paint();
        toggleUI();
      }

      dots.forEach((d, i) => d.addEventListener('click', () => setActive(i)));
      prev?.addEventListener('click', () => setActive(idx - 1));
      next?.addEventListener('click', () => setActive(idx + 1));

      track.addEventListener('scroll', () => {
        const w = track.clientWidth || 1;
        const i = Math.round(track.scrollLeft / w);
        if (i !== idx && i >= 0 && i < slides.length) {
          idx = i;
          paint();
        }
      });

      window.addEventListener('resize', () => setActive(idx));

      // Estado inicial
      toggleUI();
      setActive(0);
    });
  })();

})(); // fin IIFE global

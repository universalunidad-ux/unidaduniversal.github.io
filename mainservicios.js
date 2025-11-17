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
  //    OJO: excluye los reels (id^="carouselReels")
  // =========================================================
  (function(){
    function initCarousel(root, onChange){
      const track = root.querySelector(".carousel-track");
      const prev  = root.querySelector(".arrowCircle.prev");
      const next  = root.querySelector(".arrowCircle.next");
      let dots    = [...root.querySelectorAll(".carousel-nav .dot")];
      let i = 0;
      let len = dots.length || (track?.children?.length || 0);

      function paint(idx){
        if (!dots.length) return;
        dots.forEach((d,di)=>d.classList.toggle("active",di===idx));
      }

      function set(n){
        if(!track || !len) return;
        i = (n + len) % len;
        paint(i);
        track.scrollTo({left:track.clientWidth * i, behavior:"smooth"});
        onChange && onChange(i);
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

      track && track.addEventListener("scroll",()=>{
        const n = Math.round(track.scrollLeft/track.clientWidth);
        if(n!==i){ i=n; paint(i); onChange&&onChange(i); }
      });

      window.addEventListener("resize",()=>set(i));
      set(0);
    }

    // Vincula títulos .reel-title si existen cerca,
    // pero SOLO para .carousel que NO sean reels
    document.querySelectorAll('.carousel:not([id^="carouselReels"])').forEach(car=>{
      const sel = car.getAttribute("data-titles");
      let titles = null;
      if (sel) titles = [...document.querySelectorAll(sel)];
      else {
        const scope = car.closest("aside,.card,.body,section,div") || document;
        titles = [...scope.querySelectorAll(".reel-title")];
      }
      if(!titles?.length) titles = null;
      initCarousel(car, idx=>{
        if (titles){
          titles.forEach((t,i)=>t.classList.toggle("active", i===idx));
        }
      });
    });
  })();

  // =========================================================
  // 5) List slider (“¿Por qué elegir nuestro Soporte?”)
  // =========================================================
  (function(){
    document.querySelectorAll(".listSlider").forEach(w=>{
      const track = w.querySelector(".listTrack");
      const prev  = w.querySelector(".arrowCircle.prev");
      const next  = w.querySelector(".arrowCircle.next");
      if(!track || !prev || !next) return;

      let i   = 0;
      const len = track.children.length;

      function go(n){
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        i = (n + len) % len;
        track.scrollTo({left: w.clientWidth * i, behavior:"smooth"});
      }

      prev.addEventListener("click",()=>go(i-1));
      next.addEventListener("click",()=>go(i+1));
      window.addEventListener("resize",()=>go(i));

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
  // 8) Carrusel de sistemas (.carouselX) — Auto UI + dots
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

      items.forEach(it=>{
        it.setAttribute("role","link");
        it.setAttribute("tabindex","0");
        const go = () => {
          const href = it.getAttribute("data-href");
          if(href) window.open(href,"_blank","noopener");
        };
        it.addEventListener("click", go);
        it.addEventListener("keydown", e=>{
          if(e.key === "Enter" || e.key === " "){
            e.preventDefault();
            go();
          }
        });
      });

      const { prev, next, dotsWrap } = ensureUI(root);

      const perView   = () => (window.innerWidth <= 980 ? 1 : 3);
      const viewportW = () => track.clientWidth || root.clientWidth || 1;
      const pageCount = () => Math.max(1, Math.ceil((track.scrollWidth - 1) / viewportW()));

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

      function go(j){
        const total = pageCount();
        idx = ((j % total) + total) % total;

        const startIdx = Math.min(idx * perView(), items.length - 1);
        const first    = items[startIdx];
        let baseLeft = (idx === 0)
          ? 0
          : (first ? first.offsetLeft - (track.firstElementChild?.offsetLeft || 0)
                   : idx * viewportW());

        const maxLeft = Math.max(0, track.scrollWidth - viewportW());
        const left    = Math.min(Math.max(0, baseLeft), maxLeft);

        track.scrollTo({left, behavior:"smooth"});
        paint(idx);
        toggleUI();
      }

      function toggleUI(){
        const multi = pageCount() > 1;
        prev.style.display     = multi ? "" : "none";
        next.style.display     = multi ? "" : "none";
        dotsWrap.style.display = multi ? "" : "none";
      }

      prev.addEventListener("click",()=>{
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        go(idx-1);
      });
      next.addEventListener("click",()=>{
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        go(idx+1);
      });

      track.addEventListener("scroll",()=>{
        const i = Math.round(track.scrollLeft / viewportW());
        if(i !== idx){
          idx = i;
          paint(idx);
        }
      });

      window.addEventListener("resize",()=>{
        const nowPages = pageCount();
        if(dots.length !== nowPages) dots = buildDots();
        setTimeout(()=>go(idx), 0);
      });

      function resetStart(){
        track.scrollLeft = 0;
        idx = 0;
        paint(0);
        toggleUI();
      }

      requestAnimationFrame(resetStart);
      window.addEventListener('load', ()=> setTimeout(resetStart, 0));
      window.addEventListener('pageshow', resetStart);
      setTimeout(resetStart, 350);

      track.style.overflowX      = "auto";
      track.style.scrollBehavior = "smooth";
      toggleUI();
      go(0);
      setTimeout(()=> track.scrollTo({ left: 0, behavior: "auto" }), 50);
    });
  })();

  // =========================================================
  // 9) GESTOR YOUTUBE — pausa reels al cambiar
  //     - Si un reel empieza a reproducirse, pausa los demás
  //     - Si cambias de slide / haces click en otro reel, se pausa el anterior
  // =========================================================
  (function(){
    // Si ya existe en otra parte (otra página), respétalo
    if (!window.exPlayers) window.exPlayers = [];

    if (!window.pauseAllYTIframes) {
      window.pauseAllYTIframes = function(exceptPlayer){
        window.exPlayers.forEach(p=>{
          if (!p || p === exceptPlayer) return;
          try{
            if (typeof p.getPlayerState === "function" &&
                typeof p.pauseVideo     === "function"){
              const s = p.getPlayerState();
              if (s === 1 || s === 3) p.pauseVideo(); // 1=Playing, 3=Buffering
            }
          }catch(e){}
        });
      };
    }

    function onPlayerStateChange(event){
      // Cuando este player comienza a reproducirse → pausa el resto
      if (event.data === 1){
        window.pauseAllYTIframes(event.target);
      }
    }

    // Encadenar si ya hay otra callback global
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

    // Cargar API de YouTube si no está
    if (!window.YT || !window.YT.Player){
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    } else {
      // Si ya estaba cargada la API, inicializamos de inmediato
      window.onYouTubeIframeAPIReady();
    }
  })();

  // =========================================================
  // 10) Carrusel de REELS (Shopify vibes + pausa YouTube)
  //      - Usa .is-active para animación CSS
  //      - Pausa el video anterior al cambiar
  // =========================================================
  (function(){
    document.querySelectorAll('.carousel[id^="carouselReels"]').forEach(root => {
      const scope       = root.closest('aside') || root;
      const track       = root.querySelector('.carousel-track');
      const slides      = [...(track?.querySelectorAll('.carousel-slide') || [])];
      const dots        = [...root.querySelectorAll('.carousel-nav .dot')];
      const prev        = root.querySelector('.arrowCircle.prev');
      const next        = root.querySelector('.arrowCircle.next');
      const reelTitles  = [...scope.querySelectorAll('.reel-title')];
      let idx = 0;

      const titles = slides.map(sl => {
        const wrap = sl.querySelector('.reel-embed');
        const ifr  = sl.querySelector('iframe');
        return (wrap?.dataset?.title) || (sl.dataset?.title) || (ifr?.getAttribute('title')) || '';
      });

      function paintUI() {
        // dots
        dots.forEach((d, di) => d.classList.toggle('active', di === idx));
        // títulos
        reelTitles.forEach(t => t.classList.remove('active'));
        if (reelTitles.length > 0) {
          if (titles[idx]) reelTitles[0].textContent = titles[idx];
          reelTitles[0].classList.add('active');
          if (reelTitles[1]) {
            const nextIdx = (idx + 1) % titles.length;
            if (titles[nextIdx]) reelTitles[1].textContent = titles[nextIdx];
          }
        }
      }

      function setActive(i) {
        if (window.pauseAllYTIframes) window.pauseAllYTIframes(); // pausa el reel anterior

        if (!dots.length || !slides.length) return;
        idx = (i + dots.length) % dots.length;

        const w = track.clientWidth || root.clientWidth || 1;
        track.scrollTo({ left: w * idx, behavior: 'smooth' });

        // marcar slide activo para animación CSS (Shopify/Dribbble feel)
        slides.forEach((sl, si) => sl.classList.toggle('is-active', si === idx));

        paintUI();
      }

      dots.forEach((d, i) => d.addEventListener('click', () => setActive(i)));
      prev?.addEventListener('click', () => setActive(idx - 1));
      next?.addEventListener('click', () => setActive(idx + 1));

      track?.addEventListener('scroll', () => {
        const w = track.clientWidth || 1;
        const i = Math.round(track.scrollLeft / w);
        if (i !== idx && i >= 0 && i < dots.length) {
          idx = i;
          paintUI();
          slides.forEach((sl, si) => sl.classList.toggle('is-active', si === idx));
        }
      });

      window.addEventListener('resize', () => setActive(idx));

      // Estado inicial
      setActive(0);
    });
  })();

})(); // fin IIFE global

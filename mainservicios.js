// =========================================================
// Expiriti - mainservicios.js (REEMPLAZO COMPLETO)
// Servicios (Soporte, Pólizas, Cursos, Migraciones, etc.)
// Parciales + TOC + Carruseles + Filtros + FAQ + YouTube pause
// + FIX: Reels títulos 1-línea + ocultar flechas si no aplica
// + FIX: carouselX solo link si existe data-href
// =========================================================

(function(){
  "use strict";

  // -------- Helpers básicos --------
const Q  = (sel, ctx=document) => ctx.querySelector(sel);
const QA = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));


  // =========================================================
  // 1) Servicios complementarios: <li> completo como link
  // =========================================================
  (function(){
    QA('#servicios-complementarios .svc-link[data-url]').forEach(li=>{
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
//    FIX: user-site en ambos hostnames + sin múltiples requests
// =========================================================
(async function loadPartials(){
  const D = document;

  const inSubDir = /\/(SISTEMAS|SERVICIOS)\//i.test(location.pathname);
  const rel = inSubDir ? "../" : "";

  const isGh = location.hostname.endsWith("github.io");
  const isUserSite =
    isGh && (
      location.hostname === "unidaduniversal.github.io" ||
      location.hostname === "universalunidad-ux.github.io"
    );

  // En user-site SIEMPRE es raíz ("/PARTIALS/...")
  const headerURL = isUserSite ? "/PARTIALS/global-header.html" : (rel + "PARTIALS/global-header.html");
  const footerURL = isUserSite ? "/PARTIALS/global-footer.html" : (rel + "PARTIALS/global-footer.html");

  const abs = (p) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    if (/^(mailto:|tel:|data:)/i.test(p)) return p;
    if (p.startsWith("/")) return p;
    return (isUserSite ? ("/" + p) : (rel + p)).replace(/\/+/g, "/");
  };

  const hp = D.getElementById("header-placeholder");
  const fp = D.getElementById("footer-placeholder");

  try{
    if (hp){
      const r = await fetch(headerURL, { cache: "no-store" });
      if (r.ok) hp.outerHTML = await r.text();
      else console.warn("[partials] header 404:", headerURL, r.status);
    }
    if (fp){
      const r = await fetch(footerURL, { cache: "no-store" });
      if (r.ok) fp.outerHTML = await r.text();
      else console.warn("[partials] footer 404:", footerURL, r.status);
    }
  } catch(e){
    console.warn("[partials] error cargando parciales", e);
  }

  // Normalización declarativa dentro del DOM ya insertado
  D.querySelectorAll(".js-abs-src[data-src]").forEach(img=>{
    const v = img.getAttribute("data-src");
    if (v && !img.getAttribute("src")) img.setAttribute("src", abs(v));
  });

  D.querySelectorAll(".js-abs-href[data-href]").forEach(a=>{
    const raw = a.getAttribute("data-href");
    if (!raw) return;
    const [path, hash] = raw.split("#");
    a.href = abs(path) + (hash ? ("#" + hash) : "");
  });

  const y = D.getElementById("gf-year");
  if (y) y.textContent = new Date().getFullYear();

  // Si tu header tiene initGlobalHeader(), ejecútalo
  if (typeof window.initGlobalHeader === "function") {
    try { window.initGlobalHeader(); } catch(e) {}
  }
})();


  // =========================================================
  // 3) TOC flotante (índice) — mapa del sitio
  // =========================================================
  (function(){
const toc      = Q("#toc");
const openBtn  = Q("#tocToggle");

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
  // 4) List slider (“beneficios”) - estable
  // =========================================================
  (function(){
    QA(".listSlider").forEach(w=>{
      const track = w.querySelector(".listTrack");
      const prev  = w.querySelector(".arrowCircle.prev");
      const next  = w.querySelector(".arrowCircle.next");
      if(!track || !prev || !next) return;

      let i = 0;
      const pages = track.children;
      const len = pages.length || 0;
      if (!len) return;

      function go(n){
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();
        i = (n + len) % len;
        const width = track.clientWidth || 1;
        track.scrollTo({ left: width * i, behavior: "smooth" });
      }

      prev.addEventListener("click", () => go(i - 1));
      next.addEventListener("click", () => go(i + 1));

      window.addEventListener("resize", () => setTimeout(() => go(i), 80));
      go(0);
    });
  })();

  // =========================================================
  // 5) Píldoras (filtros de servicios)
  // =========================================================
  (function(){
    const pills = QA(".pill");
    const cards = QA(".feature-grid .fcard");
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
  // 6) FAQ: solo uno abierto a la vez
  // =========================================================
  (function(){
    const wrap = Q("#faqWrap");
    if(!wrap) return;
    QA(".faq-item", wrap).forEach(item=>{
      item.addEventListener("toggle",()=>{
        if(item.open){
          QA(".faq-item", wrap).forEach(o=>{
            if(o !== item) o.removeAttribute("open");
          });
        }
      });
    });
  })();

  // =========================================================
  // 7) Carrusel de sistemas (.carouselX) — UI + dots + FIX links
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

    QA(".carouselX").forEach(root=>{
      const track = root.querySelector(".track");
      if(!track) return;

      const items = QA(".sys", root);
      if (!items.length) return;

      // FIX: SOLO hacer click-link si existe data-href
      items.forEach(it=>{
        const href = it.getAttribute("data-href");
        if (!href) return; // plataformas puede no tener links

        it.setAttribute("role","link");
        it.setAttribute("tabindex","0");
        const go = () => window.open(href, "_blank", "noopener");
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

      function toggleUI(){
        const multi = pageCount() > 1;
        prev.style.display     = multi ? "" : "none";
        next.style.display     = multi ? "" : "none";
        dotsWrap.style.display = multi ? "" : "none";
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

      track.style.overflowX      = "auto";
      track.style.scrollBehavior = "smooth";

      toggleUI();
      go(0);
    });
  })();

  // =========================================================
  // 8) GESTOR YOUTUBE — pausa reels al cambiar
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

      QA('iframe[src*="youtube"]').forEach(iframe=>{
        if (iframe.dataset.ytInit) return;
        iframe.dataset.ytInit = "1";

        let src = iframe.src || "";
        if (src && !src.includes("enablejsapi=1")){
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
  // 9) Carrusel de REELS (título 1-línea + ocultar flechas si no aplica)
  // =========================================================
  (function(){
    function ensureDots(root, count){
      let nav = root.querySelector(".carousel-nav");
      if (!nav){
        nav = document.createElement("div");
        nav.className = "carousel-nav";
        nav.setAttribute("aria-label", "Paginación de reels");
        root.appendChild(nav);
      }
      nav.innerHTML = "";
      for (let i=0;i<count;i++){
        const b = document.createElement("button");
        b.className = "dot" + (i===0 ? " active" : "");
        b.type = "button";
        b.setAttribute("aria-label", `Ir al reel ${i+1}`);
        nav.appendChild(b);
      }
      return [...nav.querySelectorAll(".dot")];
    }

    function findTitleEl(scope){
      // Preferido: el que tenga data-reel-title
      let t = scope.querySelector("[data-reel-title]");
      if (t) return t;

      // Fallback: primer .reel-title
      const all = [...scope.querySelectorAll(".reel-title")];
      if (!all.length) return null;

      // Oculta extras por seguridad
      all.slice(1).forEach(x => x.style.display = "none");
      return all[0];
    }

    QA('.carousel[id^="carouselReels"]').forEach(root => {
      const scope  = root.closest("aside") || root;
      const track  = root.querySelector(".carousel-track");
      const slides = [...(track?.querySelectorAll(".carousel-slide") || [])];
      const prev   = root.querySelector(".arrowCircle.prev");
      const next   = root.querySelector(".arrowCircle.next");

      if (!track || !slides.length) {
        // Sin slides: oculta UI
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
        const nav = root.querySelector(".carousel-nav");
        if (nav) nav.style.display = "none";
        const t = findTitleEl(scope);
        if (t) t.textContent = "";
        return;
      }

      // Títulos por slide
      const titles = slides.map(sl => {
        const dt = sl.getAttribute("data-title");
        if (dt) return dt.trim();
        const wrap = sl.querySelector(".reel-embed");
        const wdt = wrap?.getAttribute("data-title");
        if (wdt) return wdt.trim();
        const ifr = sl.querySelector("iframe");
        const it  = ifr?.getAttribute("title");
        return (it || "").trim();
      });

      // Dots: si no existen o no coinciden, crear
      let dots = [...root.querySelectorAll(".carousel-nav .dot")];
      if (dots.length !== slides.length){
        dots = ensureDots(root, slides.length);
      }

      // UI: si solo hay 1 reel, no muestres flechas ni dots
      const multi = slides.length > 1;
      if (prev) prev.style.display = multi ? "" : "none";
      if (next) next.style.display = multi ? "" : "none";
      const nav = root.querySelector(".carousel-nav");
      if (nav) nav.style.display = multi ? "" : "none";

      // Título 1-línea (estilo index)
      const titleEl = findTitleEl(scope);

      let idx = 0;

      function paint(){
        dots.forEach((d, di)=> d.classList.toggle("active", di===idx));
        slides.forEach((sl, si)=> sl.classList.toggle("is-active", si===idx));
        if (titleEl){
          titleEl.textContent = titles[idx] || "";
        }
      }

      function setActive(i){
        if (window.pauseAllYTIframes) window.pauseAllYTIframes();

        idx = (i + slides.length) % slides.length;
        const w = track.clientWidth || root.clientWidth || 1;
        track.scrollTo({ left: w * idx, behavior: "smooth" });
        paint();
      }

      dots.forEach((d,i)=> d.addEventListener("click", ()=> setActive(i)));
      prev?.addEventListener("click", ()=> setActive(idx-1));
      next?.addEventListener("click", ()=> setActive(idx+1));

      track.addEventListener("scroll", ()=>{
        const w = track.clientWidth || 1;
        const i = Math.round(track.scrollLeft / w);
        if (i !== idx && i >= 0 && i < slides.length){
          idx = i;
          paint();
        }
      });

      window.addEventListener("resize", ()=> setActive(idx));

      // Init
      setActive(0);
    });
  })();

})(); // fin IIFE global

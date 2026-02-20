// =========================================================
// Expiriti - mainservicios.js (FINAL CONSOLIDADO)
// Parciales + TOC + Carruseles + Filtros + FAQ
// YouTube: pausa entre videos + YT-Lite (poster + click => iframe)
// FIX: Reels title visible (force .active)
// FIX: carouselX solo link si existe data-href
// =========================================================
(function(){
  "use strict";

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
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
  })();

  // =========================================================
  // 2) Carga de parciales (header/footer) + normalización rutas
  // =========================================================
  (async function loadPartials(){
    const D = document;

    const inSubDir = /\/(SISTEMAS|SERVICIOS)\//i.test(location.pathname);
    const relLocal = inSubDir ? "../" : "";

    const isGh = location.hostname.endsWith("github.io");
    const firstSeg = location.pathname.split("/")[1] || "";
    const base = (isGh && firstSeg) ? ("/" + firstSeg) : "";

    const headerURL = isGh ? (base + "/PARTIALS/global-header.html") : (relLocal + "PARTIALS/global-header.html");
    const footerURL = isGh ? (base + "/PARTIALS/global-footer.html") : (relLocal + "PARTIALS/global-footer.html");

    const abs = (p) => {
      if (!p) return p;
      if (/^https?:\/\//i.test(p)) return p;
      if (/^(mailto:|tel:|data:)/i.test(p)) return p;
      if (p.startsWith("/")) return p;
      if (isGh) return (base + "/" + p).replace(/\/+/g, "/");
      return (relLocal + p).replace(/\/+/g, "/");
    };

    const hp = D.getElementById("header-placeholder");
    const fp = D.getElementById("footer-placeholder");

    try{
      if (hp){
const V = "2025.12.28-1"; // súbelo cuando publiques cambios
const withV = (u)=> u + (u.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(V);

const r = await fetch(withV(headerURL), { cache: "force-cache" });
        if (r.ok) hp.outerHTML = await r.text();
        else console.warn("[partials] header 404:", headerURL, r.status);
      }
      if (fp){
        const r = await fetch(footerURL, { cache: "no-store" });
        if (r.ok) fp.outerHTML = await r.text();
        else console.warn("[partials] footer 404:", footerURL, r.status);
      }
    }catch(e){
      console.warn("[partials] error cargando parciales", e);
    }

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

    if (typeof window.initGlobalHeader === "function") {
      try { window.initGlobalHeader(); } catch(e) {}
    }
  })();

  // =========================================================
  // 3) TOC flotante
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
  // 4) listSlider (“beneficios”)
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
  // 5) Píldoras (filtros)
  // =========================================================
(function(){const C="__span2",upd=s=>{const g=Q(".feature-grid",s);if(!g)return;const c=QA(".fcard",g);c.forEach(x=>x.classList.remove(C));const v=c.filter(x=>x.offsetParent!==null&&getComputedStyle(x).display!=="none"&&!x.hidden);if(v.length&&v.length%2===1)v[v.length-1].classList.add(C)};QA("#caracteristicas").forEach(s=>{const p=QA(".pillbar .pill",s),g=Q(".feature-grid",s);if(!p.length||!g)return;const c=QA(".fcard",g),a=t=>{c.forEach(x=>{x.style.display=!t||x.classList.contains("tag-"+t)?"":"none"});upd(s)};p.forEach(b=>b.addEventListener("click",()=>{p.forEach(x=>x.classList.remove("active"));b.classList.add("active");a(b.dataset.filter||"")}));const f=p[0];f?(f.classList.add("active"),a(f.dataset.filter||"")):upd(s)})})();


  // =========================================================
  // 6) FAQ: solo uno abierto
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
  // 7) Carrusel de sistemas (.carouselX) — UI + dots + links opcionales
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

      // SOLO click-link si existe data-href
      items.forEach(it=>{
        const href = it.getAttribute("data-href");
        if (!href) return;

        it.setAttribute("role","link");
        it.setAttribute("tabindex","0");
        const go = () => window.open(href, "_blank", "noopener");
        it.addEventListener("click", go);
        it.addEventListener("keydown", e=>{
          if(e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); }
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

      function paint(j){ dots.forEach((d,i)=>d.classList.toggle("active", i===j)); }

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
        if(i !== idx){ idx = i; paint(idx); }
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
  // 8) Gestor YouTube (pausa entre videos) + carga lazy API
  // =========================================================
  (function(){
    if (!window.exPlayers) window.exPlayers = [];

    if (!window.pauseAllYTIframes) {
      window.pauseAllYTIframes = function(exceptPlayer){
        (window.exPlayers || []).forEach(p=>{
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
      if (event.data === 1) window.pauseAllYTIframes(event.target);
    }

    function initYTPlayers(){
      if (!(window.YT && window.YT.Player)) return;

      document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe=>{
        if (iframe.dataset.ytInit) return;
        iframe.dataset.ytInit = "1";

        let src = iframe.src || "";
        if (src && !src.includes("enablejsapi=1")){
          src += (src.includes("?") ? "&" : "?") + "enablejsapi=1";
          iframe.src = src;
        }

        try{
          const player = new YT.Player(iframe, {
            events:{ onStateChange:onPlayerStateChange }
          });
          window.exPlayers.push(player);
        }catch(e){}
      });
    }

    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){
      if (typeof prevOnReady === "function") prevOnReady();
      initYTPlayers();
    };

    function loadYTApiOnce(){
      if (window.__YT_API_LOADING__ || (window.YT && window.YT.Player)) return;
      window.__YT_API_LOADING__ = true;

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    document.addEventListener("pointerdown", loadYTApiOnce, { once:true, passive:true });
    document.addEventListener("keydown", loadYTApiOnce, { once:true });

    // expone init para YT-Lite (si ya hay API cargada)
    window.__initYTPlayersExpiriti__ = initYTPlayers;
  })();

  // =========================================================
  // 9) Carrusel REELS (título 1-línea + oculta flechas si 1)
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
      let t = scope.querySelector("[data-reel-title]");
      if (t) return t;

      const all = [...scope.querySelectorAll(".reel-title")];
      if (!all.length) return null;
      all.slice(1).forEach(x => x.style.display = "none");
      return all[0];
    }

    QA('.carousel[id^="carouselReels"]').forEach(root => {
      const scope  = root.closest("aside") || root;
      const track  = root.querySelector(".carousel-track");
      const slides = [...(track?.querySelectorAll(".carousel-slide") || [])];
      const prev   = root.querySelector(".arrowCircle.prev");
      const next   = root.querySelector(".arrowCircle.next");

      const titleEl = findTitleEl(scope);
      if (titleEl) titleEl.classList.add("active"); // FIX: siempre visible

      if (!track || !slides.length) {
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
        const nav = root.querySelector(".carousel-nav");
        if (nav) nav.style.display = "none";
        if (titleEl) titleEl.textContent = "";
        return;
      }

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

      let dots = [...root.querySelectorAll(".carousel-nav .dot")];
      if (dots.length !== slides.length){
        dots = ensureDots(root, slides.length);
      }

      const multi = slides.length > 1;
      if (prev) prev.style.display = multi ? "" : "none";
      if (next) next.style.display = multi ? "" : "none";
      const nav = root.querySelector(".carousel-nav");
      if (nav) nav.style.display = multi ? "" : "none";

      let idx = 0;

      function paint(){
        dots.forEach((d, di)=> d.classList.toggle("active", di===idx));
        slides.forEach((sl, si)=> sl.classList.toggle("is-active", si===idx));
        if (titleEl) titleEl.textContent = titles[idx] || "";
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
      setActive(0);
    });
  })();

  // =========================================================
  // 10) YT-LITE (ytLite) — poster + click => iframe
  // =========================================================
  (function(){
    function buildPoster(id){
      return [
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      ];
    }

    function setPoster(el, id){
      const hasInline = (el.getAttribute("style") || "").includes("--yt-poster");
      if (hasInline) return;

      const urls = buildPoster(id);
      el.style.setProperty("--yt-poster", `url('${urls[1]}')`);

      const img = new Image();
      img.onload  = () => el.style.setProperty("--yt-poster", `url('${urls[0]}')`);
      img.onerror = () => {};
      img.src = urls[0];
    }

    function ensureYTApiLoaded(){
      if (window.__YT_API_LOADING__ || (window.YT && window.YT.Player)) return;
      window.__YT_API_LOADING__ = true;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    function mountIframe(el, id){
      if (!id) return;
      if (el.classList.contains("is-playing")) return;

      if (window.pauseAllYTIframes) window.pauseAllYTIframes();

      const origin = encodeURIComponent(location.origin);
      const src =
        `https://www.youtube-nocookie.com/embed/${id}` +
        `?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1` +
        `&enablejsapi=1&origin=${origin}`;

      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = el.getAttribute("data-title") || "Video";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.loading = "eager";

      el.classList.add("is-playing");
      el.appendChild(iframe);

      // Carga API (ya hubo click)
      ensureYTApiLoaded();

      // Si YA existe la API, registra el player nuevo
      if (window.YT && window.YT.Player && typeof window.__initYTPlayersExpiriti__ === "function"){
        try { window.__initYTPlayersExpiriti__(); } catch(e) {}
      } else {
        // si está cargando, vuelve a intentar cuando ya esté
        setTimeout(()=> {
          if (window.YT && window.YT.Player && typeof window.__initYTPlayersExpiriti__ === "function"){
            try { window.__initYTPlayersExpiriti__(); } catch(e) {}
          }
        }, 800);
      }
    }

    function init(){
      document.querySelectorAll(".ytLite[data-ytid]").forEach(el=>{
        const id = el.getAttribute("data-ytid");
        if (!id) return;

        setPoster(el, id);

        const go = () => mountIframe(el, id);

        el.addEventListener("click", (e)=>{
          if (e.target && e.target.closest && e.target.closest("a")) return;
          go();
        });

        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.addEventListener("keydown", (e)=>{
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
        });

        const btn = el.querySelector(".ytPlay");
        if (btn) btn.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); go(); });
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once:true });
    } else {
      init();
    }
  })();
  // paginador de servicios complementarios
(()=>{const e=document.querySelector("#servicios-complementarios");if(!e)return;const t=matchMedia("(min-width:981px)"),n=e.querySelector(".card.body");if(!n)return;const r=[...e.querySelectorAll(".svc-grid>.svc-list")];if(r.length<2)return;const i=n.querySelector(".svc-prev"),c=n.querySelector(".svc-next");if(!i||!c)return;let a=0,o=3,l=0,s=[[],[]];const d=()=>{s=r.map(e=>[...e.querySelectorAll(":scope>li")]),l=Math.max(s[0].length,s[1].length)},u=()=>Math.max(1,Math.ceil(l/o)),h=()=>{if(!t.matches){i.hidden=c.hidden=!0,s.flat().forEach(e=>e.style.display="");return}const e=u();a=Math.max(0,Math.min(a,e-1));for(let t=0;t<2;t++)s[t].forEach((n,r)=>{const i=a*o,c=i+o;n.style.display=r>=i&&r<c?"":"none"});i.hidden=c.hidden=e<=1,i.disabled=a<=0,c.disabled=a>=e-1},m=()=>{d(),h()};i.addEventListener("click",()=>{a--,h()}),c.addEventListener("click",()=>{a++,h()}),t.addEventListener?.("change",h),window.addEventListener("resize",()=>{if(!t.matches)return;h()}),m()})();

  
})(); // FIN

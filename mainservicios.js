// =========================================================
// Expiriti - mainservicios.js
// Servicios (Soporte, Pólizas, Cursos, Migraciones, etc.)
// Parciales + TOC + Carruseles + Filtros + FAQ
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
  //    (adaptado de tu mainservicios.js original)
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
    // Soporta /SISTEMAS/ y /SERVICIOS/ como subcarpetas
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
  // 4) Carrusel genérico (.carousel con .carousel-track y .carousel-nav .dot)
  //    → Copia del motor de main.js (funciona bien ahí)
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
        const n = Math.round(track.scrollLeft / track.clientWidth);
        if(n!==i){ i=n; paint(i); onChange&&onChange(i); }
      });

      window.addEventListener("resize",()=>set(i));
      set(0);
    }

    // Vincula títulos .reel-title si existen en el mismo scope
    document.querySelectorAll(".carousel").forEach(car=>{
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
  //    → Igual al de main.js, pero sin cosas extra
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
  //    Para Soporte: data-filter="hora" | "poliza" | "garantia"
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

    // Estado inicial: primer pill
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
  // 8) Carrusel de sistemas (.carouselX) — Copia de main.js
  //     Auto UI + dots + flechas + accesible
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

      // Cada tarjeta como "link" accesible, por si en el futuro les pones data-href
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

      // Mantener dots sincronizados si el usuario hace scroll con trackpad
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

      // Estado inicial
      requestAnimationFrame(resetStart);
      window.addEventListener('load', ()=> setTimeout(resetStart, 0));
      window.addEventListener('pageshow', resetStart);
      setTimeout(resetStart, 350);

      track.style.overflowX       = "auto";
      track.style.scrollBehavior  = "smooth";
      toggleUI();
      go(0);
      setTimeout(()=> track.scrollTo({ left: 0, behavior: "auto" }), 50);
    });
  })();

})(); // fin IIFE global

// =========================================================
// Expiriti - mainservicios.js
// Páginas de servicios (Soporte, Pólizas, Cursos, Migraciones, etc.)
// Glow UI + parciales + carruseles + filtros + FAQ
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
      li.addEventListener('click', ()=>{
        const url = li.getAttribute('data-url');
        if (url) window.location.href = url;
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
  // 3) TOC flotante (índice)
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
  // 4) Carrusel genérico (.carousel con .carousel-track, .dot)
  //    Flechas + dots (scroll horizontal nativo del navegador)
  // =========================================================
  (function(){
    $$(".carousel").forEach(root=>{
      const track = root.querySelector(".carousel-track");
      const dots  = [...root.querySelectorAll(".carousel-nav .dot")];
      const prev  = root.querySelector(".arrowCircle.prev");
      const next  = root.querySelector(".arrowCircle.next");
      if (!track || !dots.length) return;

      let idx = 0;

      function setActive(i){
        idx = (i + dots.length) % dots.length;
        dots.forEach((d,di)=>d.classList.toggle("active", di === idx));
        track.scrollTo({
          left: track.clientWidth * idx,
          behavior: "smooth"
        });
      }

      dots.forEach((d,i)=> d.addEventListener("click", ()=> setActive(i)));
      prev?.addEventListener("click", ()=> setActive(idx - 1));
      next?.addEventListener("click", ()=> setActive(idx + 1));

      // Cuando se usa el trackpad / scroll horizontal, actualiza dots
      track.addEventListener("scroll", ()=>{
        const i = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((d,di)=> d.classList.toggle("active", di === i));
        idx = i;
      });

      window.addEventListener("resize", ()=> setActive(idx));

      setActive(0);
    });
  })();

  // =========================================================
  // 5) Slider beneficios (#beneficios .listSlider)
  // =========================================================
  (function(){
    const wrap = $("#beneficios .listSlider");
    if (!wrap) return;

    const track = wrap.querySelector(".listTrack");
    const prev  = wrap.querySelector(".prev");
    const next  = wrap.querySelector(".next");
    if (!track) return;

    let page  = 0;
    const total = track.children.length || 1;

    function go(i){
      page = (i + total) % total;
      track.scrollTo({
        left: wrap.clientWidth * page,
        behavior: "smooth"
      });
    }

    prev?.addEventListener("click", ()=> go(page - 1));
    next?.addEventListener("click", ()=> go(page + 1));

    // Si el usuario arrastra con trackpad, ajustamos la página “activa”
    track.addEventListener("scroll", ()=>{
      const i = Math.round(track.scrollLeft / wrap.clientWidth);
      page = i;
    });

    window.addEventListener("resize", ()=> go(page));

    go(0);
  })();

  // =========================================================
  // 6) Carrusel sistemas (.carouselX) — responsive + dots
  // =========================================================
  (function(){
    $$(".carouselX").forEach(root=>{
      const track    = root.querySelector(".track");
      const prev     = root.querySelector(".arrowCircle.prev");
      const next     = root.querySelector(".arrowCircle.next");
      const dotsWrap = root.querySelector(".group-dots");
      if (!track) return;

      const items = track.querySelectorAll(".sys");
      if (!items.length) return;

      let itemsPerPage = 3;
      let idx = 0;
      let dots = [];
      let groupOffsets = [];

      const updateItemsPerPage = () => {
        if (window.innerWidth <= 680)      itemsPerPage = 1;
        else if (window.innerWidth <= 980) itemsPerPage = 2;
        else                               itemsPerPage = 3;
      };

      const updateItemWidth = () => {
        items.forEach(item=>{
          const gap = 14; // mismo gap que en CSS
          item.style.flexBasis =
            `calc((100% - ${gap * (itemsPerPage - 1)}px) / ${itemsPerPage})`;
        });
      };

      const groupsCount = () =>
        Math.max(1, Math.ceil(items.length / itemsPerPage));

      const computeGroupOffsets = () => {
        groupOffsets = [];
        const gCount = groupsCount();
        for (let g = 0; g < gCount; g++){
          const firstIndex = g * itemsPerPage;
          const item       = items[firstIndex] || items[items.length - 1];
          groupOffsets.push(item.offsetLeft);
        }
      };

      const setDot = (i) => {
        dots.forEach((d,idxDot)=> d.classList.toggle("active", idxDot === i));
      };

      const goTo = (i) => {
        const gCount = groupsCount();
        const target = Math.max(0, Math.min(i, gCount - 1));
        const left   = groupOffsets[target] ?? 0;
        track.scrollTo({ left, behavior:"smooth" });
        idx = target;
        setDot(idx);
      };

      const setupDots = () => {
        const gCount = groupsCount();
        const showControls = gCount > 1;
        if (prev)     prev.style.display     = showControls ? "" : "none";
        if (next)     next.style.display     = showControls ? "" : "none";
        if (dotsWrap) dotsWrap.style.display = showControls ? "" : "none";
        dots = [];

        if (!showControls || !dotsWrap) return;

        dotsWrap.innerHTML = "";
        for (let i = 0; i < gCount; i++){
          const b = document.createElement("button");
          b.className = "dot" + (i === 0 ? " active" : "");
          b.addEventListener("click", ()=> goTo(i));
          dotsWrap.appendChild(b);
          dots.push(b);
        }
      };

      // Init
      updateItemsPerPage();
      updateItemWidth();
      computeGroupOffsets();
      setupDots();
      goTo(0);

      prev?.addEventListener("click", ()=>{
        idx = Math.max(0, idx - 1);
        goTo(idx);
      });
      next?.addEventListener("click", ()=>{
        const maxIdx = groupsCount() - 1;
        idx = Math.min(maxIdx, idx + 1);
        goTo(idx);
      });

      // Cuando el usuario hace scroll con trackpad, actualizamos el dot activo
      track.addEventListener("scroll", ()=>{
        if (!groupOffsets.length) return;
        const scroll = track.scrollLeft;
        let nearest = 0;
        let minDiff = Infinity;
        groupOffsets.forEach((off, i)=>{
          const diff = Math.abs(scroll - off);
          if (diff < minDiff){
            minDiff = diff;
            nearest = i;
          }
        });
        idx = nearest;
        setDot(idx);
      });

      window.addEventListener("resize", ()=>{
        updateItemsPerPage();
        updateItemWidth();
        computeGroupOffsets();
        setupDots();
        goTo(idx);
      });
    });
  })();

  // =========================================================
  // 7) Píldoras (filtros de servicios)
  // =========================================================
  (function(){
    const pills = $$(".pill");
    const cards = $$(".feature-grid .fcard");
    if (!pills.length || !cards.length) return;

    function apply(filter){
      cards.forEach(c=>{
        if (!filter){ c.style.display = ""; return; }
        const show =
          (filter === "hora"     && c.classList.contains("tag-hora"))     ||
          (filter === "poliza"   && c.classList.contains("tag-poliza"))   ||
          (filter === "garantia" && c.classList.contains("tag-garantia"));
        c.style.display = show ? "" : "none";
      });
    }

    pills.forEach(p=>{
      p.addEventListener("click", ()=>{
        pills.forEach(x=> x.classList.remove("active"));
        p.classList.add("active");
        apply(p.dataset.filter || "");
      });
    });

    // Estado inicial recomendado
    const first = pills[0];
    if (first){
      first.classList.add("active");
      apply(first.dataset.filter || "");
    }
  })();

  // =========================================================
  // 8) FAQ acordeón (uno abierto a la vez)
  // =========================================================
  (function(){
    const wrap  = $("#faqWrap");
    if (!wrap) return;

    const items = [...wrap.querySelectorAll(".faq-item")];
    items.forEach(d=>{
      d.addEventListener("toggle", ()=>{
        if (!d.open) return;
        items.forEach(o=>{
          if (o !== d) o.removeAttribute("open");
        });
      });
    });
  })();

})(); // fin IIFE global

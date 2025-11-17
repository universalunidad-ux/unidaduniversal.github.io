// =========================================================
// Expiriti - mainservicios.js (CORREGIDO)
// Arregla el scroll-vertical y la paginación del carrusel .carouselX
// =========================================================

(function(){
  "use strict";

  // -------- Helpers básicos --------
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // ---------------------------------------------------------
  // --- ARREGLO 1: Scroll horizontal más agresivo ---
  // Esta versión es más "agresiva" con el e.preventDefault()
  // para asegurar que SÓLO mueva el carrusel y no la página.
  // ---------------------------------------------------------
  function enableHorizontalWheelScroll(scroller){
    if (!scroller) return;
    scroller.addEventListener("wheel", (e)=>{
      // Solo actuar si el scroll es principalmente vertical
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; 
      
      // Frenar el scroll vertical de la página INMEDIATAMENTE
      e.preventDefault(); 
      e.stopPropagation(); // Y detener el evento (no avisar a la página)

      // Aplicar ese scroll vertical al scroll horizontal
      scroller.scrollLeft += e.deltaY;
    }, { passive:false }); // passive:false es crucial para que funcione preventDefault
  }

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
  // (Este módulo será ELIMINADO por tu 'build.js' en producción)
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

    // Normalización de rutas declarativas
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
  // =========================================================
  (function(){
    $$(".carousel").forEach(root=>{
      const track = root.querySelector(".carousel-track");
      const dots  = [...root.querySelectorAll(".carousel-nav .dot")];
      const prev  = root.querySelector(".arrowCircle.prev");
      const next  = root.querySelector(".arrowCircle.next");
      if (!track || !dots.length) return;

      enableHorizontalWheelScroll(track);

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

      // Este listener SÍ estaba bien y actualizaba los puntos en scroll
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
    $$(".listSlider").forEach(wrap => { // Aplicar a todos los .listSlider
      const track = wrap.querySelector(".listTrack");
      const prev  = wrap.querySelector(".prev");
      const next  = wrap.querySelector(".next");
      if (!track) return;
  
      enableHorizontalWheelScroll(track);
  
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
      window.addEventListener("resize", ()=> go(page));
  
      go(0);
    });
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

      enableHorizontalWheelScroll(track);

      const items = track.querySelectorAll(".sys");
      if (!items.length) return;

      let itemsPerPage = 3;
      let dots = []; // Mover dots aquí para que sea accesible por el listener de scroll

      const updateItemsPerPage = () => {
        if (window.innerWidth <= 680)      itemsPerPage = 1;
        else if (window.innerWidth <= 980) itemsPerPage = 2;
        else                               itemsPerPage = 3;
      };

      const updateItemWidth = () => {
        items.forEach(item=>{
          const gap = 12; // mismo gap que en CSS
          item.style.flexBasis =
            `calc((100% - ${gap * (itemsPerPage - 1)}px) / ${itemsPerPage})`;
        });
      };

      const groupsCount = () =>
        Math.max(1, Math.ceil(items.length / itemsPerPage));

      function setDot(i){
        dots.forEach((d,idx)=> d.classList.toggle("active", idx === i));
      }

      function offsetForGroup(i){
        const firstIndex = i * itemsPerPage;
        const item       = items[firstIndex] || items[0];
        // fallback simple si offsetLeft da 0
        if (item?.offsetLeft) {
            return item.offsetLeft;
        }
        return (track.clientWidth / itemsPerPage) * i;
      }
      
      function buildDots() {
          dotsWrap.innerHTML = "";
          dots = Array.from({ length: groupsCount() }, (_,i)=>{
            const b = document.createElement("button");
            b.className = "dot" + (i === 0 ? " active" : "");
            b.addEventListener("click", ()=> goTo(i));
            dotsWrap.appendChild(b);
            return b;
          });
      }

      function goTo(i){
        const target = Math.max(0, Math.min(i, dots.length - 1));
        const left   = offsetForGroup(target);
        track.scrollTo({ left, behavior:"smooth" });
        setDot(target);
        idx = target;
      }

      let idx = 0;
      
      buildDots(); // Construir dots al inicio
      updateItemsPerPage();
      updateItemWidth();

      const showControls = groupsCount() > 1;
      if (prev)     prev.style.display     = showControls ? "" : "none";
      if (next)     next.style.display     = showControls ? "" : "none";
      if (dotsWrap) dotsWrap.style.display = showControls ? "" : "none";
      if (!showControls) return;


      prev?.addEventListener("click", ()=>{
        idx = Math.max(0, idx - 1);
        goTo(idx);
      });
      next?.addEventListener("click", ()=>{
        idx = Math.min(dots.length - 1, idx + 1);
        goTo(idx);
      });

      // ---------------------------------------------------------------
      // --- ARREGLO 2: AÑADIR EL LISTENER DE SCROLL que faltaba ---
      // ---------------------------------------------------------------
      // Usamos 'debounce' para no disparar esto 1000 veces por segundo
      let scrollTimer;
      track.addEventListener("scroll", () => {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
              const currentScroll = track.scrollLeft;
              let closestGroup = 0;
              let minDiff = Infinity;
              
              // Encuentra el "grupo" (dot) más cercano a la posición actual
              for (let i = 0; i < dots.length; i++) {
                  const groupOffset = offsetForGroup(i);
                  const diff = Math.abs(currentScroll - groupOffset);
                  
                  if (diff < (minDiff - 1)) { // -1 para dar "preferencia" al actual
                      minDiff = diff;
                      closestGroup = i;
                  }
              }

              if (closestGroup !== idx) {
                  setDot(closestGroup);
                  idx = closestGroup; // Actualiza el índice
              }
          }, 100); // 100ms de espera
      });

      window.addEventListener("resize", ()=>{
        updateItemsPerPage();
        updateItemWidth();
        buildDots(); // Re-construir dots si el número de grupos cambia
        goTo(idx);
      });

      goTo(0);
    });
  })();

  // =========================================================
  // 7) Píldoras (filtros de servicios)
  // =========================================================
  (function(){
    const pills = $$(".pillbar .pill[data-filter]"); // <-- Más específico
    const cards = $$(".feature-grid .fcard");
    if (!pills.length || !cards.length) return;

    // ---------------------------------------------------------------
    // --- ARREGLO 3: Lógica de filtros declarativa ---
    // ---------------------------------------------------------------
    function apply(filter){
      cards.forEach(c=>{
        // Si el filtro está vacío (data-filter=""), muestra todo
        // Si no, muestra solo las tarjetas que tienen esa clase (tag)
        const show = !filter || c.classList.contains(filter);
        c.style.display = show ? "" : "none";
      });
    }

    pills.forEach(p=>{
      p.addEventListener("click", ()=>{
        pills.forEach(x=> x.classList.remove("active"));
        p.classList.add("active");
        apply(p.dataset.filter); // 'filter' ya no es 'hora', sino 'tag-hora'
      });
    });

    // Estado inicial (basado en el primer pill que ya esté 'active')
    const activePill = $(".pillbar .pill.active") || pills[0];
    if (activePill){
      activePill.classList.add("active");
      apply(activePill.dataset.filter);
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

/* =========================================================
   Expiriti - main.js — Escritorio + Carruseles + Reels (YouTube pause)
   [CORREGIDO, ORDENADO Y COMENTADO]
   ========================================================= */

/* =========================================================
   1) UTILIDADES GLOBALES
   ---------------------------------------------------------
   - $$fmt  → formateo de moneda MXN
   - $$     → querySelector corto
   - $all   → querySelectorAll como array
   ========================================================= */
(function(){
  const money = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });

  // Formatea número a moneda MXN (redondear)
  window.$$fmt = v => money.format(Math.round(Number(v || 0)));

  // Atajos de selección en DOM
  window.$$   = (sel, ctx = document) => ctx.querySelector(sel);
  window.$all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
})();

/* =========================================================
   2) AÑO EN FOOTER + MENÚ MÓVIL (BURGEr)
   ========================================================= */
(function(){
  // Año dinámico en el elemento #year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Menú móvil: botón burger + contenedor menú
  const b = document.getElementById("burger");
  const m = document.getElementById("mobileMenu");
  if (b && m){
    b.addEventListener("click", () => m.classList.toggle("open"));
  }
})();

/* =========================================================
   3) CARRUSEL GENÉRICO
   ---------------------------------------------------------
   Estructura esperada:
   .carousel
     .carousel-track (slides horizontales)
     .carousel-nav .dot (puntos de paginación)
     .arrowCircle.prev / .arrowCircle.next
   NO aplica a carruseles de Reels (filtrados por id).
   ========================================================= */
(function(){
  function initCarousel(root, onChange){
    const track = root.querySelector(".carousel-track");
    const prev  = root.querySelector(".arrowCircle.prev");
    const next  = root.querySelector(".arrowCircle.next");
    let dots    = [...root.querySelectorAll(".carousel-nav .dot")];

    // Número de “páginas” = cantidad de dots o hijos del track
    let i = 0;
    let len = dots.length || (track?.children?.length || 0);

    // Pinta el dot activo
    function paint(idx){
      if (!dots.length) return;
      dots.forEach((d, di) => d.classList.toggle("active", di === idx));
    }

    // Mueve el carrusel al índice n
    function set(n){
      if (!track || !len) return;
      i = (n + len) % len;
      paint(i);
      track.scrollTo({
        left: track.clientWidth * i,
        behavior: "smooth"
      });
      onChange && onChange(i);
    }

    // Eventos sobre dots
    dots.forEach((d, idx) => d.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      set(idx);
    }));

    // Flechas prev/next
    prev && prev.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      set(i - 1);
    });
    next && next.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      set(i + 1);
    });

    // Recalcular slide activo cuando se hace scroll manual
    track && track.addEventListener("scroll", () => {
      const n = Math.round(track.scrollLeft / track.clientWidth);
      if (n !== i){
        i = n;
        paint(i);
        onChange && onChange(i);
      }
    });

    // Recalcular en resize
    window.addEventListener("resize", () => set(i));

    // Estado inicial
    set(0);
  }

  // Vincula títulos .reel-title si existen en el mismo “scope”
  document.querySelectorAll(".carousel:not([id^='carouselReels'])").forEach(car => {
    const sel = car.getAttribute("data-titles");
    let titles = null;

    if (sel){
      titles = [...document.querySelectorAll(sel)];
    } else {
      const scope = car.closest(".card, .body, aside, section, div") || document;
      titles = [...scope.querySelectorAll(".reel-title")];
    }

    if (!titles?.length) titles = null;

    // Inicializa carrusel con callback para activar títulos
    initCarousel(car, idx => {
      if (titles){
        titles.forEach((t, i) => t.classList.toggle("active", i === idx));
      }
    });
  });
})();

/* =========================================================
   4) HARD RESET DE SCROLL PARA .carouselX .track
   ---------------------------------------------------------
   Evita “saltos” raros cuando el navegador recuerda scroll.
   ========================================================= */
(function(){
  const tracks = document.querySelectorAll(".carouselX .track");
  if (!tracks.length) return;

  function forceStart(track){
    if (!track) return;
    const prev = track.style.scrollBehavior;
    track.style.scrollBehavior = "auto";
    track.scrollLeft = 0;

    requestAnimationFrame(() => {
      track.scrollLeft = 0;
    });

    setTimeout(() => {
      track.scrollLeft = 0;
      track.style.scrollBehavior = prev || "";
    }, 80);
  }

  tracks.forEach(forceStart);

  // Desactivar restauración de scroll por History API
  try {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  } catch(_){}

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) tracks.forEach(forceStart);
  });

  window.addEventListener("resize", () => tracks.forEach(forceStart));
})();

/* =========================================================
   5) LIST SLIDER (“¿Por qué usar…?”)
   ---------------------------------------------------------
   Estructura:
   .listSlider
     .listTrack (hijos = ítems)
     .arrowCircle.prev / .arrowCircle.next
   ========================================================= */
(function(){
  document.querySelectorAll(".listSlider").forEach(w => {
    const track = w.querySelector(".listTrack");
    const prev  = w.querySelector(".arrowCircle.prev");
    const next  = w.querySelector(".arrowCircle.next");
    if (!track || !prev || !next) return;

    let i   = 0;
    let len = track.children.length;

    function go(n){
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      i = (n + len) % len;
      track.scrollTo({
        left: w.clientWidth * i,
        behavior: "smooth"
      });
    }

    prev.addEventListener("click", () => go(i - 1));
    next.addEventListener("click", () => go(i + 1));
    window.addEventListener("resize", () => go(i));
  });
})();

/* =========================================================
   6) PÍLDORAS (FILTROS DE FEATURES)
   ---------------------------------------------------------
   Estructura:
   .pill(data-filter="nomina")
   .feature-grid .fcard.tag-nomina
   ========================================================= */
(function(){
  const pills = [...document.querySelectorAll(".pill")];
  const cards = [...document.querySelectorAll(".feature-grid .fcard")];
  if (!pills.length || !cards.length) return;

  function apply(tag){
    cards.forEach(card => {
      card.style.display = card.classList.contains("tag-" + tag) ? "" : "none";
    });
  }

  pills.forEach(p => {
    p.addEventListener("click", () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      apply(p.dataset.filter);
    });
  });

  // Valor inicial (fallback: "nomina")
  apply(pills[0]?.dataset.filter || "nomina");
})();

/* =========================================================
   7) FAQ: SOLO UN <details> ABIERTO A LA VEZ
   ========================================================= */
(function(){
  const wrap = document.getElementById("faqWrap");
  if (!wrap) return;

  [...wrap.querySelectorAll(".faq-item")].forEach(item => {
    item.addEventListener("toggle", () => {
      if (item.open){
        [...wrap.querySelectorAll(".faq-item")].forEach(o => {
          if (o !== item) o.removeAttribute("open");
        });
      }
    });
  });
})();

/* =========================================================
   8) CARRUSEL DE SISTEMAS (.carouselX)
   ---------------------------------------------------------
   - Auto-crea flechas y dots si no existen.
   - Responsive: muestra 1 o 3 tarjetas según ancho.
   - Cada .sys tiene click / teclado para ir a data-href.
   ========================================================= */
(function(){
  // Asegura UI mínima (prev/next + group-dots)
  function ensureUI(root){
    let prev = root.querySelector(".arrowCircle.prev");
    let next = root.querySelector(".arrowCircle.next");

    if (!prev){
      prev = document.createElement("button");
      prev.className = "arrowCircle prev";
      prev.setAttribute("aria-label", "Anterior");
      prev.innerHTML = '<span class="chev">‹</span>';
      root.appendChild(prev);
    }
    if (!next){
      next = document.createElement("button");
      next.className = "arrowCircle next";
      next.setAttribute("aria-label", "Siguiente");
      next.innerHTML = '<span class="chev">›</span>';
      root.appendChild(next);
    }

    let dotsWrap = root.querySelector(".group-dots");
    if (!dotsWrap){
      dotsWrap = document.createElement("div");
      dotsWrap.className = "group-dots";
      root.appendChild(dotsWrap);
    }

    return { prev, next, dotsWrap };
  }

  document.querySelectorAll(".carouselX").forEach(root => {
    const track = root.querySelector(".track");
    if (!track) return;

    const items = [...root.querySelectorAll(".sys")];

    /* -----------------------------------------------------
       8.1) LÓGICA CLICK / DOBLE TOQUE EN CADA .sys
       ----------------------------------------------------- */
    items.forEach(it => {
      it.setAttribute("role", "link");
      it.setAttribute("tabindex", "0");

      let touchedOnce = false; // Control de primer toque en móvil
      const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

      const go = () => {
        const href = it.getAttribute("data-href");
        if (!href) return;
        // SIEMPRE abrir en nueva pestaña
        window.open(href, "_blank", "noopener");
      };

      // CLICK
      it.addEventListener("click", (e) => {
        e.preventDefault();

        // En móvil, primer toque solo muestra hover “Ver más”
        if (isMobile()){
          if (!touchedOnce){
            touchedOnce = true;
            it.classList.add("show-hover");
            setTimeout(() => { touchedOnce = false; }, 2000);
            return;
          }
        }

        // Segundo toque o escritorio → abrir página
        go();
      });

      // Accesibilidad: ENTER / SPACE
      it.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " "){
          e.preventDefault();
          go();
        }
      });
    });

    /* -----------------------------------------------------
       8.2) LÓGICA DE PÁGINAS / DOTS DEL CARRUSEL
       ----------------------------------------------------- */
    const { prev, next, dotsWrap } = ensureUI(root);

    const perView   = () => (window.innerWidth <= 980 ? 1 : 3);
    const viewportW = () => track.clientWidth || root.clientWidth || 1;
    const pageCount = () => Math.max(1, Math.ceil((track.scrollWidth - 1) / viewportW()));

    function buildDots(){
      dotsWrap.innerHTML = "";
      const total = pageCount();
      const arr = [...Array(total)].map((_, j) => {
        const b = document.createElement("button");
        b.className = "dot" + (j === 0 ? " active" : "");
        b.setAttribute("aria-label", "Ir a página " + (j + 1));
        b.addEventListener("click", () => {
          if (window.pauseAllYTIframes) window.pauseAllYTIframes();
          go(j); // go del carrusel (no confundir con go() de .sys)
        });
        dotsWrap.appendChild(b);
        return b;
      });
      return arr;
    }

    let dots = buildDots();
    let idx  = 0;

    function paint(j){
      dots.forEach((d, i) => d.classList.toggle("active", i === j));
    }

    // Mover carrusel de sistemas a página j
    function go(j){
      const total = pageCount();
      idx = ((j % total) + total) % total;

      const startIdx = Math.min(idx * perView(), items.length - 1);
      const first    = items[startIdx];

      let baseLeft = (idx === 0)
        ? 0
        : (first ? first.offsetLeft - (track.firstElementChild?.offsetLeft || 0) : idx * viewportW());

      const maxLeft = Math.max(0, track.scrollWidth - viewportW());
      const left    = Math.min(Math.max(0, baseLeft), maxLeft);

      track.scrollTo({ left, behavior: "smooth" });
      paint(idx);
      toggleUI();
    }

    // Ocultar flechas/dots si solo hay 1 página
    function toggleUI(){
      const multi = pageCount() > 1;
      prev.style.display     = multi ? "" : "none";
      next.style.display     = multi ? "" : "none";
      dotsWrap.style.display = multi ? "" : "none";
    }

    // Eventos flechas
    prev.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      go(idx - 1);
    });
    next.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      go(idx + 1);
    });

    // Sincronizar índice con scroll manual
    track.addEventListener("scroll", () => {
      const i = Math.round(track.scrollLeft / viewportW());
      if (i !== idx){
        idx = i;
        paint(idx);
      }
    });

    // Rebuild dots en resize
    window.addEventListener("resize", () => {
      const now = pageCount();
      if (dots.length !== now) dots = buildDots();
      setTimeout(() => go(idx), 0);
    });

    // Resets fuertes al inicio / load / pageshow
    function resetStart(){
      track.scrollLeft = 0;
      idx = 0;
      paint(0);
      toggleUI();
    }
    requestAnimationFrame(resetStart);
    window.addEventListener("load", () => setTimeout(resetStart, 0));
    window.addEventListener("pageshow", resetStart);
    setTimeout(resetStart, 350);

    // Config básica
    track.style.overflowX     = "auto";
    track.style.scrollBehavior = "smooth";
    toggleUI();
    go(0);
    setTimeout(() => track.scrollTo({ left: 0, behavior: "auto" }), 50);
  });
})();

/* =========================================================
   9) GESTOR UNIFICADO DE YOUTUBE
   ---------------------------------------------------------
   - Pausa todos los players cuando uno empieza.
   - Inicializa iframes existentes.
   - Lazy load con .yt-wrap / .reel-embed[data-ytid].
   ========================================================= */
(function(){
  // 1. Almacén global de reproductores
  window.exPlayers = [];

  // 2. Función Global de Pausa (expuesta a otros módulos)
  window.pauseAllYTIframes = function(exceptPlayer){
    window.exPlayers.forEach(p => {
      if (p && p !== exceptPlayer && typeof p.pauseVideo === "function"){
        try {
          const s = p.getPlayerState();
          if (s === 1 || s === 3) p.pauseVideo(); // 1=Playing, 3=Buffering
        } catch(e){}
      }
    });
  };

  // Handler de cambio de estado: pausa otros si uno reproduce
  function onPlayerStateChange(event){
    if (event.data === 1){ 
      window.pauseAllYTIframes(event.target);
    }
  }

  // 3. Inicializador API YouTube
  window.onYouTubeIframeAPIReady = function(){
    // A) Inicializar iframes ya presentes en DOM
    document.querySelectorAll('iframe[src*="youtube"]').forEach((iframe) => {
      if (iframe.dataset.ytInit) return;
      iframe.dataset.ytInit = "1";

      // Asegurar enablejsapi=1
      let src = iframe.src;
      if (!src.includes("enablejsapi=1")){
        src += (src.includes("?") ? "&" : "?") + "enablejsapi=1";
        iframe.src = src;
      }
      
      const p = new YT.Player(iframe, {
        events: { "onStateChange": onPlayerStateChange }
      });
      window.exPlayers.push(p);
    });
  };

  // Cargar script de API si no existe
  if (!window.YT){
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  /* ------------------------------------------------------
     9.A) LÓGICA REELS (CARRUSEL CON TÍTULO DINÁMICO)
     ------------------------------------------------------ */
  document.querySelectorAll('.carousel[id^="carouselReels"]').forEach(root => {
    const scope  = root.closest("aside") || root;
    const track  = root.querySelector(".carousel-track");
    const slides = [...(track?.querySelectorAll(".carousel-slide") || [])];
    const dots   = [...root.querySelectorAll(".carousel-nav .dot")];
    const prev   = root.querySelector(".arrowCircle.prev");
    const next   = root.querySelector(".arrowCircle.next");
    const reelTitles = [...scope.querySelectorAll(".reel-title")];
    let idx = 0;

    // Títulos de cada slide (prioridad: data-title en .reel-embed)
    const titles = slides.map(sl => {
      const wrap = sl.querySelector(".reel-embed"); // Nuevo wrapper
      const ifr  = sl.querySelector("iframe");
      return (wrap?.dataset?.title) || (sl.dataset?.title) || (ifr?.getAttribute("title")) || "";
    });

    function paintUI(){
      dots.forEach((d, di) => d.classList.toggle("active", di === idx));
      reelTitles.forEach((t) => t.classList.remove("active"));

      if (reelTitles.length > 0){
        if (titles[idx]) reelTitles[0].textContent = titles[idx];
        reelTitles[0].classList.add("active");

        // Segundo título opcional para animación
        if (reelTitles[1]){
          const nextIdx = (idx + 1) % titles.length;
          if (titles[nextIdx]) reelTitles[1].textContent = titles[nextIdx];
        }
      }
    }

    function setActive(i){
      window.pauseAllYTIframes(); // Pausa todo al mover
      if (!dots.length || !slides.length) return;

      idx = (i + dots.length) % dots.length;
      const w = track.clientWidth || root.clientWidth || 1;
      track.scrollTo({ left: w * idx, behavior: "smooth" });
      paintUI();
    }

    dots.forEach((d, i) => d.addEventListener("click", () => setActive(i)));
    prev?.addEventListener("click", () => setActive(idx - 1));
    next?.addEventListener("click", () => setActive(idx + 1));
    
    track?.addEventListener("scroll", () => {
      const w = track.clientWidth || 1;
      const i = Math.round(track.scrollLeft / w);
      if (i !== idx && i >= 0 && i < dots.length){
        idx = i;
        paintUI();
      }
    });

    window.addEventListener("resize", () => setActive(idx));

    // Estado inicial
    setActive(0);
  });

  /* ------------------------------------------------------
     9.B) LÓGICA LAZY LOAD (.yt-wrap / .reel-embed[data-ytid])
     ------------------------------------------------------ */
  function mountLazyEmbed(wrapper){
    if (wrapper.dataset.ytMounted) return;
    const ytid = wrapper.getAttribute("data-ytid");
    if (!ytid) return;
    
    // Portada (thumbnail)
    const thumb = new Image();
    thumb.src = `https://i.ytimg.com/vi/${ytid}/maxresdefault.jpg`;
    thumb.alt = "Video thumbnail";
    thumb.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;cursor:pointer;";

    // Botón de Play
    const playBtn = document.createElement("button");
    playBtn.setAttribute("aria-label", "Reproducir");
    playBtn.style.cssText = "position:absolute;inset:0;margin:auto;width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;background:rgba(0,0,0,0.6);transition:transform 0.2s;";
    playBtn.innerHTML = '<div style="margin-left:4px;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:18px solid white;"></div>';
    
    playBtn.onmouseenter = () => playBtn.style.transform = "scale(1.1)";
    playBtn.onmouseleave = () => playBtn.style.transform = "scale(1)";

    // Contenedor para overlay (thumb + botón)
    const ph = document.createElement("div");
    ph.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center;";
    ph.appendChild(thumb);
    ph.appendChild(playBtn);
    wrapper.appendChild(ph);

    // Monta iframe real cuando se hace click
    function loadIframe(){
      wrapper.dataset.ytMounted = "1";

      // div temporal para la API de YT
      const tempId  = "yt-player-" + Math.random().toString(36).substr(2, 9);
      const tempDiv = document.createElement("div");
      tempDiv.id = tempId;
      
      wrapper.innerHTML = ""; 
      wrapper.appendChild(tempDiv);

      setTimeout(() => {
        const player = new YT.Player(tempId, {
          videoId: ytid,
          playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
          events: { onStateChange: onPlayerStateChange }
        });
        window.exPlayers.push(player);
      }, 10);
    }

    playBtn.addEventListener("click", loadIframe);
    thumb.addEventListener("click", loadIframe);
  }

  // Inicializa todos los wrappers lazy de YouTube
  function initYouTubeEmbeds(){
    document
      .querySelectorAll(".yt-wrap[data-ytid], .reel-embed[data-ytid]")
      .forEach(mountLazyEmbed);
  }

  document.addEventListener("DOMContentLoaded", initYouTubeEmbeds);
})();

/* =========================================================
   10) COMPLEMENTOS CALCULADORA ESCRITORIO
   ---------------------------------------------------------
   - Maneja 2º y 3er sistema.
   - Render de tabla combinada.
   - Integra con CalculadoraContpaqi.* (calculadora.js)
   ========================================================= */
(function(){
  document.addEventListener("DOMContentLoaded", function(){
    const app = document.getElementById("app");
    const PRIMARY = app?.dataset?.system?.trim();
    if (!PRIMARY) return;

    const moneyMX = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    });

    const fmt = v => moneyMX.format(Math.round(Number(v || 0)));
    const hasPrices = name => !!(window.preciosContpaqi && window.preciosContpaqi[name]);

    // Catálogo de sistemas (logos + nombres + si aplican descuentos)
    window.CATALOG_SISTEMAS = window.CATALOG_SISTEMAS || [
      { name: "CONTPAQi Contabilidad",        img: "../IMG/contabilidad.webp" },
      { name: "CONTPAQi Bancos",              img: "../IMG/bancos.webp" },
      { name: "CONTPAQi Nóminas",             img: "../IMG/nominas.webp" },
      { name: "CONTPAQi XML en Línea",        img: "../IMG/xml.webp",  noDiscount: true },
      { name: "CONTPAQi Comercial PRO",       img: "../IMG/comercialpro.webp" },
      { name: "CONTPAQi Comercial PREMIUM",   img: "../IMG/comercialpremium.webp" },
      { name: "CONTPAQi Factura Electrónica", img: "../IMG/factura.webp" }
    ];

    // Calcula “precio desde” en base al objeto preciosContpaqi
    function getPrecioDesde(systemName){
      const db = (window.preciosContpaqi && window.preciosContpaqi[systemName]) || null;
      if (!db) return null;

      if (db.anual?.MultiRFC?.precio_base || db.anual?.MultiRFC?.renovacion)
        return Number(db.anual.MultiRFC.precio_base || db.anual.MultiRFC.renovacion || 0);

      if (db.anual?.MonoRFC?.precio_base || db.anual?.MonoRFC?.renovacion)
        return Number(db.anual.MonoRFC.precio_base || db.anual.MonoRFC.renovacion || 0);

      if (db.tradicional?.actualizacion?.precio_base)
        return Number(db.tradicional.actualizacion.precio_base);

      return null;
    }

    // Render de iconos de sistemas a elegir (picker 2º / 3º)
    function renderSistemasPicker(containerId, exclude = new Set(), activeName = null){
      const wrap = document.getElementById(containerId);
      if (!wrap) return;

      wrap.innerHTML = "";
      if (PRIMARY) exclude.add(PRIMARY);

      window.CATALOG_SISTEMAS.forEach(item => {
        if (exclude.has(item.name)) return;
        const precio = getPrecioDesde(item.name);

        const btn = document.createElement("button");
        btn.className = "sys-icon";
        btn.type = "button";
        btn.dataset.sys = item.name;
        btn.title       = item.name;

        btn.innerHTML = `
          ${item.noDiscount ? '<small class="sin15">sin -15%</small>' : ""}
          <img src="${item.img}" alt="${item.name}">
          <strong>${item.name.replace("CONTPAQi ","")}</strong>
          <small class="sys-price">${precio != null ? "desde " + fmt(precio) : "precio no disp."}</small>
        `;

        if (activeName && activeName === item.name) btn.classList.add("active");
        wrap.appendChild(btn);
      });
    }

    // Tabla combinada de totales (primario + secundarios)
    function renderCombinedTable(rows){
      const wrap  = document.getElementById("combined-wrap");
      const tbody = document.getElementById("combined-table-body");
      if (!wrap || !tbody) return;

      tbody.innerHTML = "";
      rows.forEach(([concepto, importe]) => {
        const tr  = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        td1.textContent = concepto;
        td2.textContent = importe;
        td2.style.textAlign = "right";
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
      });
      wrap.hidden = false;
    }

    // Referencias a zonas de la calculadora
    const row    = document.getElementById("calc-row");
    const slot2  = document.getElementById("calc-slot-2") || document.getElementById("calc-secondary");
    const slot3  = document.getElementById("calc-tertiary");
    const addMore = document.getElementById("add-more-panel");
    const pick2   = document.getElementById("icons-sec-sys");
    const pick3   = document.getElementById("icons-third-sys");
    if (!row) return;

    const selected = { secondary: null, tertiary: null };
    const selectedSet = () => new Set([selected.secondary, selected.tertiary].filter(Boolean));

    // Render inicial de pickers (excluyendo primario)
    const initialExclude = new Set(PRIMARY ? [PRIMARY] : []);
    renderSistemasPicker("icons-sec-sys",   initialExclude);
    renderSistemasPicker("icons-third-sys", initialExclude);

    function refreshPickers(){
      const ex = selectedSet();
      if (PRIMARY) ex.add(PRIMARY);
      renderSistemasPicker("icons-sec-sys",   ex, selected.secondary);
      renderSistemasPicker("icons-third-sys", ex, selected.tertiary);
    }

    function showAddMoreIfReady(){
      if (addMore) addMore.style.display = selected.secondary ? "" : "none";
    }

    // Click en iconos del 2º sistema
    pick2?.addEventListener("click", e => {
      const btn = e.target.closest(".sys-icon");
      if (!btn) return;

      const sys = btn.dataset.sys;
      if (!hasPrices(sys)) return;

      selected.secondary = sys;
      selected.tertiary  = (selected.tertiary === sys ? null : selected.tertiary);

      if (slot2 && slot2.id === "calc-slot-2"){
        slot2.className = "calc-container";
        slot2.id        = "calc-secondary";
      }

      if (window.CalculadoraContpaqi?.setSecondarySystem){
        window.CalculadoraContpaqi.setSecondarySystem(sys, {
          secondarySelector: "#calc-secondary",
          combinedSelector:  "#combined-wrap",
          onCombined:        renderCombinedTable
        });
      }

      refreshPickers();
      showAddMoreIfReady();
    });

    // Click en iconos del 3er sistema
    pick3?.addEventListener("click", e => {
      const btn = e.target.closest(".sys-icon");
      if (!btn) return;

      const sys = btn.dataset.sys;
      if (!hasPrices(sys)) return;
      if (sys === selected.secondary) return; // No permitir duplicar

      selected.tertiary = sys;
      if (slot3) slot3.style.display = "block";

      if (window.CalculadoraContpaqi?.setTertiarySystem){
        window.CalculadoraContpaqi.setTertiarySystem(sys, {
          tertiarySelector: "#calc-tertiary",
          combinedSelector: "#combined-wrap",
          onCombined:       renderCombinedTable
        });
      }

      if (addMore) addMore.style.display = "none";
      row.classList.add("has-three");
      refreshPickers();
    });

    // Callback externo para cuando la calculadora genere tabla combinada
    if (window.CalculadoraContpaqi?.onCombinedSet){
      window.CalculadoraContpaqi.onCombinedSet(renderCombinedTable);
    }

    // Inicializar calculadora primaria
    if (window.CalculadoraContpaqi?.init){
      document.body.setAttribute("data-calc", "escritorio");
      window.CalculadoraContpaqi.init({
        systemName:      PRIMARY,
        primarySelector: "#calc-primary",
        combinedSelector:"#combined-wrap"
      });
    } else {
      console.warn("CalculadoraContpaqi.init no disponible (asegura calculadora.js?v=13)");
    }
  });
})();

/* =========================================================
   11) COMPACTADOR FORMULARIO + UNIÓN “INSTALACIÓN + SERVICIOS”
   ---------------------------------------------------------
   - Reordena campos licencia/tipo/usuarios/instalación
     a una cuadrícula .controls-grid.
   - Junta selects de instalación + servicios en un solo bloque.
   ========================================================= */
(function () {
  function pickByLabel(container, regex){
    const labels = [...container.querySelectorAll("label")];
    const lb = labels.find(l => regex.test((l.textContent || "").trim().toLowerCase()));
    if (!lb) return null;
    return lb.closest(".field") || lb.closest(".row") || lb.closest(".instalacion-box") || lb.closest(".inst-wrap") || lb.parentElement;
  }

  function pickSelect(container, selectorList){
    for (const sel of selectorList){
      const el = container.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // Compactar campos en .controls-grid
  function compactar(container){
    if (!container) return;
    if (container.querySelector("form.calc-form")) return;

    // Si ya existe .controls-grid, sólo unir instalación+servicios
    if (container.querySelector(".controls-grid")){
      unirInstalacionServicios(container);
      return;
    }

    const bLic = pickByLabel(container, /^licencia/);
    const bTipo = pickByLabel(container, /^tipo/);
    const bUsu = pickByLabel(container, /^usuarios?/);
    let bInst = container.querySelector(".inst-wrap") || pickByLabel(container, /instalaci/);

    if (!bInst){
      const anyChk = container.querySelector('input[type="checkbox"]');
      bInst = anyChk ? (anyChk.closest(".instalacion-box") || anyChk.closest(".field") || anyChk.parentElement) : null;
    }

    const bloques = [bLic, bTipo, bUsu, bInst].filter(Boolean);
    bloques.forEach(b => b?.classList?.add("field"));

    // Si falta alguno de los 4, no reordenar
    if (!bLic || !bTipo || !bUsu || !bInst) return;

    const grid = document.createElement("div");
    grid.className = "controls-grid";
    grid.append(bLic, bTipo, bUsu, bInst);
    container.insertBefore(grid, container.firstElementChild);
    unirInstalacionServicios(container);
  }

  // Junta selects de instalación + servicios en .instalacion-box
  function unirInstalacionServicios(container){
    if (!container) return;
    if (container.querySelector(".inst-wrap .instalacion-box")) return;

    const selInst = pickSelect(container, [
      "select#instalacion",
      'select[name*="instal"]',
      'select[data-field*="instal"]'
    ]);
    const selServ = pickSelect(container, [
      "select#servicios",
      "select#ervicios",
      'select[name*="servi"]',
      'select[data-field*="servi"]'
    ]);

    if (!selInst || !selServ) return;
    if (selInst.closest(".instalacion-box") || selServ.closest(".instalacion-box")) return;

    let wrap = container.querySelector(".inst-wrap");
    if (!wrap){
      wrap = document.createElement("div");
      wrap.className = "inst-wrap";
      const form = selInst.closest("form") || container.querySelector("form") || container;
      form.appendChild(wrap);
    }

    const box = document.createElement("div");
    box.className = "instalacion-box";

    const instLbl = (selInst.labels && selInst.labels[0]) ? selInst.labels[0] : null;
    const servLbl = (selServ.labels && selServ.labels[0]) ? selServ.labels[0] : null;

    if (instLbl) box.appendChild(instLbl);
    box.appendChild(selInst);
    if (servLbl) box.appendChild(servLbl);
    box.appendChild(selServ);

    wrap.appendChild(box);

    if (!wrap.querySelector(".inst-hint")){
      const hint = document.createElement("small");
      hint.className = "inst-hint";
      hint.textContent = "Selecciona instalación y servicios en un solo paso.";
      wrap.appendChild(hint);
    }
  }

  // Punto de entrada: contenedor principal de la calculadora
  const target = document.getElementById("calc-primary");
  if (!target) return;

  const tryCompact = () => {
    const container = document.querySelector(".calc-container") || target;
    if (!container) return;
    if (container.querySelector("form.calc-form")) return;
    compactar(container);
  };

  tryCompact();
  requestAnimationFrame(tryCompact);

  const mo = new MutationObserver(() => tryCompact());
  mo.observe(target, { childList: true, subtree: true });

  window.addEventListener("calc-recompute", tryCompact);
  window.addEventListener("calc-render",   tryCompact);

  setTimeout(tryCompact,  500);
  setTimeout(tryCompact, 1200);
})();

/* =========================================================
   12) 🧭 AUTODIAG: CARRUSELES / LISTAS HORIZONTALES
   ---------------------------------------------------------
   - No cambia nada visual, sólo lanza warnings en consola
     para ayudarte a depurar problemas de scroll.
   ========================================================= */
(function(){
  const selectors = [".carouselX .track", ".icons-wrap"];
  const found = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));

  found.forEach((el, i) => {
    const cs   = getComputedStyle(el);
    const name = el.className || el.id || `track#${i}`;
    const warn = (msg, val) => console.warn(`⚠️ [${name}] ${msg}`, val);

    if (el.scrollWidth <= el.clientWidth + 2)
      warn("No tiene scroll real (scrollWidth ≈ clientWidth)", { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });

    if ((cs.scrollSnapType && cs.scrollSnapType !== "none") || el.style.scrollSnapType)
      warn("scroll-snap-type activo → puede bloquear el primer item", cs.scrollSnapType);

    if (cs.justifyContent.includes("center"))
      warn("justify-content:center detectado → puede impedir scroll hacia la izquierda", cs.justifyContent);

    if (cs.direction === "rtl")
      warn("direction:rtl detectado → puede invertir o romper scrollLeft", cs.direction);

    const rect  = el.getBoundingClientRect();
    const probe = document.elementsFromPoint(rect.left + 10, rect.top + rect.height / 2);
    const blocker = probe.find(n =>
      n !== el && !el.contains(n) && getComputedStyle(n).pointerEvents !== "none"
    );
    if (blocker)
      warn("Elemento sobre la orilla izquierda (posible overlay con z-index alto)", blocker);

    if (el.scrollLeft > 5)
      warn("scrollLeft inicial ≠ 0", el.scrollLeft);

    // Helpers para aplicar fixes desde consola:
    el._diagFix = {
      noSnap: () => {
        el.style.scrollSnapType = "none";
        el.querySelectorAll("*").forEach(n => n.style.scrollSnapAlign = "none");
        console.log(`✅ Snap desactivado en ${name}`);
      },
      flexStart: () => {
        el.style.justifyContent = "flex-start";
        console.log(`✅ justify-content:flex-start aplicado en ${name}`);
      },
      forceLTR: () => {
        el.style.direction = "ltr";
        console.log(`✅ direction:ltr aplicado en ${name}`);
      },
      resetScroll: () => {
        el.scrollTo({ left: 0, behavior: "auto" });
        console.log(`✅ scrollLeft restablecido en ${name}`);
      }
    };
  });
})();

/* =========================================================
   13) 🗺️ TOC / MAPA DEL SITIO (aside#toc)
   ---------------------------------------------------------
   ESTRUCTURA QUE USA ESTE SCRIPT:
   <aside id="toc" class="toc collapsed">
     <button id="tocToggle" class="toc-toggle">🗺️ Mapa</button>
     <button class="toc-close">×</button>
     ...
     <a href="#caracteristicas">...</a>
     ...
   </aside>

   - Abre/cierra el panel al hacer clic en los botones.
   - Cierra al hacer clic en un link interno.
   - Cierra con tecla ESC.
   - No rompe nada si el #toc no existe.
   ========================================================= */
(function(){
  const toc       = document.getElementById("toc");
  if (!toc) return; // Si no hay TOC, no hacemos nada

  const openBtn   = document.getElementById("tocToggle") || toc.querySelector(".toc-toggle");
  const closeBtn  = toc.querySelector(".toc-close");
  const tocLinks  = toc.querySelectorAll("a[href^='#']");

  // La clase "collapsed" indica que está cerrado
  const OPEN_CLASS  = "open";        // opcional, por si la usas en CSS
  const CLOSED_CLASS = "collapsed";  // ya la tienes en el HTML

  function openToc(){
    toc.classList.remove(CLOSED_CLASS);
    if (OPEN_CLASS) toc.classList.add(OPEN_CLASS);
  }

  function closeToc(){
    toc.classList.add(CLOSED_CLASS);
    if (OPEN_CLASS) toc.classList.remove(OPEN_CLASS);
  }

  function toggleToc(){
    if (toc.classList.contains(CLOSED_CLASS)){
      openToc();
    } else {
      closeToc();
    }
  }

  // Abrir TOC al hacer clic en el botón de mapa
  if (openBtn){
    openBtn.addEventListener("click", function(e){
      e.preventDefault();
      toggleToc();
    });
  }

  // Cerrar con el botón "x"
  if (closeBtn){
    closeBtn.addEventListener("click", function(e){
      e.preventDefault();
      closeToc();
    });
  }

  // Cerrar cuando el usuario hace clic en alguno de los links internos
  tocLinks.forEach(link => {
    link.addEventListener("click", () => {
      // Dejar que el navegador haga el scroll al anchor
      // y luego cerrar el mapa
      closeToc();
    });
  });

  // Cerrar con tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape"){
      closeToc();
    }
  });
})();

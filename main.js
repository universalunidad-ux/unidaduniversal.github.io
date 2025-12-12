/* =========================================================
   Expiriti - main.js — Escritorio + Carruseles + Reels (YouTube pause)
   [CORREGIDO: IMÁGENES FOOTER VISIBLES]
   ========================================================= */

/* =========================================================
   0) PARTIALS: Header/Footer dinámicos (GitHub Pages + local)
   ---------------------------------------------------------
   Requisitos en HTML:
   <div id="header-placeholder"></div>
   ...
   <div id="footer-placeholder"></div>
========================================================= */
(function(){
  async function exists(u){
    try { const r = await fetch(u, { method:"HEAD", cache:"no-store" }); return r.ok; }
    catch { return false; }
  }
  async function pickFirst(paths){
    for (const p of paths) if (await exists(p)) return p;
    return paths[0];
  }

  const isGh = location.hostname.endsWith("github.io");
  const firstSeg = location.pathname.split("/")[1] || "";
  const repoBase = (isGh && firstSeg) ? ("/" + firstSeg) : "";

  const inSistemas  = location.pathname.includes("/SISTEMAS/");
  const inServicios = location.pathname.includes("/SERVICIOS/");
  const depth = (inSistemas || inServicios) ? "../" : "";

  function prefix(p){
    if (!p || /^https?:\/\//i.test(p) || p.startsWith("mailto:") || p.startsWith("tel:")) return p;
    if (isGh) return (repoBase + "/" + p).replace(/\/+/g, "/");
    return (depth + p).replace(/\/+/g, "/");
  }

  async function loadPartials(){
    const hp = document.getElementById("header-placeholder");
    const fp = document.getElementById("footer-placeholder");
    if (!hp && !fp) return;

    const headerURL = await pickFirst([
      prefix("PARTIALS/global-header.html"),
      depth + "PARTIALS/global-header.html",
      "./PARTIALS/global-header.html",
      "/PARTIALS/global-header.html"
    ]);

    const footerURL = await pickFirst([
      prefix("PARTIALS/global-footer.html"),
      depth + "PARTIALS/global-footer.html",
      "./PARTIALS/global-footer.html",
      "/PARTIALS/global-footer.html"
    ]);

    const [hRes, fRes] = await Promise.all([
      hp ? fetch(headerURL, { cache:"no-store" }) : Promise.resolve(null),
      fp ? fetch(footerURL, { cache:"no-store" }) : Promise.resolve(null),
    ]);

    if (hp && hRes && hRes.ok){
      hp.outerHTML = await hRes.text();
    } else if (hp){
      console.warn("Header no cargó. URL probada:", headerURL);
    }

    if (fp && fRes && fRes.ok){
      fp.outerHTML = await fRes.text();
    } else if (fp){
      console.warn("Footer no cargó. URL probada:", footerURL);
    }

    // Microtick para que el DOM “asiente”
    await Promise.resolve();

    // Fix rutas en header/footer Y MOSTRAR IMÁGENES
    document.querySelectorAll(".js-abs-src[data-src]").forEach(img=>{
      img.src = prefix(img.getAttribute("data-src"));
      // CORRECCIÓN: Forzar opacidad a 1 para que se vean
      img.style.opacity = "1";
    });

    document.querySelectorAll(".js-abs-href[data-href]").forEach(a=>{
      const p = a.getAttribute("data-href"); if (!p) return;
      const [path, hash] = p.split("#");
      a.href = prefix(path) + (hash ? ("#" + hash) : "");
    });

    document.querySelectorAll(".js-img[data-src]").forEach(img=>{
      img.src = prefix(img.getAttribute("data-src"));
    });
    document.querySelectorAll(".js-link[data-href]").forEach(a=>{
      a.href = prefix(a.getAttribute("data-href"));
    });

    const y = document.getElementById("gf-year") || document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", loadPartials);
})();

/* =========================================================
   1) UTILIDADES GLOBALES
   ========================================================= */
(function(){
  const money = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
  window.$$fmt = v => money.format(Math.round(Number(v || 0)));
  window.$$   = (sel, ctx = document) => ctx.querySelector(sel);
  window.$all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
})();

/* =========================================================
   2) AÑO EN FOOTER + MENÚ MÓVIL (BURGEr)
   ========================================================= */
(function(){
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  const b = document.getElementById("burger");
  const m = document.getElementById("mobileMenu");
  if (b && m){
    b.addEventListener("click", () => m.classList.toggle("open"));
  }
})();

/* =========================================================
   3) CARRUSEL GENÉRICO
   ========================================================= */
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
      dots.forEach((d, di) => d.classList.toggle("active", di === idx));
    }
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
    dots.forEach((d, idx) => d.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      set(idx);
    }));
    prev && prev.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      set(i - 1);
    });
    next && next.addEventListener("click", () => {
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      set(i + 1);
    });
    track && track.addEventListener("scroll", () => {
      const n = Math.round(track.scrollLeft / track.clientWidth);
      if (n !== i){
        i = n;
        paint(i);
        onChange && onChange(i);
      }
    });
    window.addEventListener("resize", () => set(i));
    set(0);
  }

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
    initCarousel(car, idx => {
      if (titles){
        titles.forEach((t, i) => t.classList.toggle("active", i === idx));
      }
    });
  });
})();

/* =========================================================
   4) HARD RESET DE SCROLL PARA .carouselX .track
   ========================================================= */
(function(){
  const tracks = document.querySelectorAll(".carouselX .track");
  if (!tracks.length) return;
  function forceStart(track){
    if (!track) return;
    const prev = track.style.scrollBehavior;
    track.style.scrollBehavior = "auto";
    track.scrollLeft = 0;
    requestAnimationFrame(() => { track.scrollLeft = 0; });
    setTimeout(() => {
      track.scrollLeft = 0;
      track.style.scrollBehavior = prev || "";
    }, 80);
  }
  tracks.forEach(forceStart);
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch(_){}
  window.addEventListener("pageshow", (e) => { if (e.persisted) tracks.forEach(forceStart); });
  window.addEventListener("resize", () => tracks.forEach(forceStart));
})();

/* =========================================================
   5) LIST SLIDER
   ========================================================= */
(function(){
  document.querySelectorAll(".listSlider").forEach(w => {
    const track = w.querySelector(".listTrack");
    const prev  = w.querySelector(".arrowCircle.prev");
    const next  = w.querySelector(".arrowCircle.next");
    if (!track || !prev || !next) return;
    let i = 0;
    let len = track.children.length;
    function go(n){
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      i = (n + len) % len;
      track.scrollTo({ left: w.clientWidth * i, behavior: "smooth" });
    }
    prev.addEventListener("click", () => go(i - 1));
    next.addEventListener("click", () => go(i + 1));
    window.addEventListener("resize", () => go(i));
  });
})();

/* =========================================================
   6) PÍLDORAS (FILTROS)
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
  apply(pills[0]?.dataset.filter || "nomina");
})();

/* =========================================================
   7) FAQ
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
   ========================================================= */
(function(){
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
    
    // 8.1 CLICKS
    items.forEach(it => {
      it.setAttribute("role", "link");
      it.setAttribute("tabindex", "0");
      let touchedOnce = false;
      const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
      const go = () => {
        const href = it.getAttribute("data-href");
        if (!href) return;
        window.open(href, "_blank", "noopener");
      };
      it.addEventListener("click", (e) => {
        e.preventDefault();
        if (isMobile()){
          if (!touchedOnce){
            touchedOnce = true;
            it.classList.add("show-hover");
            setTimeout(() => { touchedOnce = false; }, 2000);
            return;
          }
        }
        go();
      });
      it.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); }
      });
    });

    // 8.2 NAV
    const { prev, next, dotsWrap } = ensureUI(root);
    const perView   = () => (window.innerWidth <= 980 ? 1 : 3);
    const viewportW = () => track.clientWidth || root.clientWidth || 1;
    const pageCount = () => Math.max(1, Math.ceil((track.scrollWidth - 1) / viewportW()));

    function buildDots(){
      dotsWrap.innerHTML = "";
      const total = pageCount();
      return [...Array(total)].map((_, j) => {
        const b = document.createElement("button");
        b.className = "dot" + (j === 0 ? " active" : "");
        b.setAttribute("aria-label", "Ir a página " + (j + 1));
        b.addEventListener("click", () => {
          if (window.pauseAllYTIframes) window.pauseAllYTIframes();
          go(j);
        });
        dotsWrap.appendChild(b);
        return b;
      });
    }
    let dots = buildDots();
    let idx  = 0;

    function paint(j){ dots.forEach((d, i) => d.classList.toggle("active", i === j)); }
    function go(j){
      const total = pageCount();
      idx = ((j % total) + total) % total;
      const startIdx = Math.min(idx * perView(), items.length - 1);
      const first    = items[startIdx];
      let baseLeft = (idx === 0) ? 0 : (first ? first.offsetLeft - (track.firstElementChild?.offsetLeft || 0) : idx * viewportW());
      const maxLeft = Math.max(0, track.scrollWidth - viewportW());
      const left    = Math.min(Math.max(0, baseLeft), maxLeft);
      track.scrollTo({ left, behavior: "smooth" });
      paint(idx);
      toggleUI();
    }
    function toggleUI(){
      const multi = pageCount() > 1;
      prev.style.display     = multi ? "" : "none";
      next.style.display     = multi ? "" : "none";
      dotsWrap.style.display = multi ? "" : "none";
    }
    prev.addEventListener("click", () => { if (window.pauseAllYTIframes) window.pauseAllYTIframes(); go(idx - 1); });
    next.addEventListener("click", () => { if (window.pauseAllYTIframes) window.pauseAllYTIframes(); go(idx + 1); });
    track.addEventListener("scroll", () => {
      const i = Math.round(track.scrollLeft / viewportW());
      if (i !== idx){ idx = i; paint(idx); }
    });
    window.addEventListener("resize", () => {
      const now = pageCount();
      if (dots.length !== now) dots = buildDots();
      setTimeout(() => go(idx), 0);
    });
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

    track.style.overflowX     = "auto";
    track.style.scrollBehavior = "smooth";
    toggleUI();
    go(0);
    setTimeout(() => track.scrollTo({ left: 0, behavior: "auto" }), 50);
  });
})();

/* =========================================================
   9) GESTOR UNIFICADO YOUTUBE
   ========================================================= */
(function(){
  window.exPlayers = [];
  window.pauseAllYTIframes = function(exceptPlayer){
    window.exPlayers.forEach(p => {
      if (p && p !== exceptPlayer && typeof p.pauseVideo === "function"){
        try {
          const s = p.getPlayerState();
          if (s === 1 || s === 3) p.pauseVideo();
        } catch(e){}
      }
    });
  };
  function onPlayerStateChange(event){
    if (event.data === 1){ window.pauseAllYTIframes(event.target); }
  }
  window.onYouTubeIframeAPIReady = function(){
    document.querySelectorAll('iframe[src*="youtube"]').forEach((iframe) => {
      if (iframe.dataset.ytInit) return;
      iframe.dataset.ytInit = "1";
      let src = iframe.src;
      if (!src.includes("enablejsapi=1")){
        src += (src.includes("?") ? "&" : "?") + "enablejsapi=1";
        iframe.src = src;
      }
      const p = new YT.Player(iframe, { events: { "onStateChange": onPlayerStateChange } });
      window.exPlayers.push(p);
    });
  };
  if (!window.YT){
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  // 9.A REELS
  document.querySelectorAll('.carousel[id^="carouselReels"]').forEach(root => {
    const scope  = root.closest("aside") || root;
    const track  = root.querySelector(".carousel-track");
    const slides = [...(track?.querySelectorAll(".carousel-slide") || [])];
    const dots   = [...root.querySelectorAll(".carousel-nav .dot")];
    const prev   = root.querySelector(".arrowCircle.prev");
    const next   = root.querySelector(".arrowCircle.next");
    const reelTitles = [...scope.querySelectorAll(".reel-title")];
    let idx = 0;
    const titles = slides.map(sl => {
      const wrap = sl.querySelector(".reel-embed");
      const ifr  = sl.querySelector("iframe");
      return (wrap?.dataset?.title) || (sl.dataset?.title) || (ifr?.getAttribute("title")) || "";
    });
    function paintUI(){
      dots.forEach((d, di) => d.classList.toggle("active", di === idx));
      reelTitles.forEach((t) => t.classList.remove("active"));
      if (reelTitles.length > 0){
        if (titles[idx]) reelTitles[0].textContent = titles[idx];
        reelTitles[0].classList.add("active");
        if (reelTitles[1]){
          const nextIdx = (idx + 1) % titles.length;
          if (titles[nextIdx]) reelTitles[1].textContent = titles[nextIdx];
        }
      }
    }
    function setActive(i){
      window.pauseAllYTIframes();
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
      if (i !== idx && i >= 0 && i < dots.length){ idx = i; paintUI(); }
    });
    window.addEventListener("resize", () => setActive(idx));
    setActive(0);
  });

  // 9.B LAZY LOAD
  function mountLazyEmbed(wrapper){
    if (wrapper.dataset.ytMounted) return;
    const ytid = wrapper.getAttribute("data-ytid");
    if (!ytid) return;
    if (!wrapper.style.position || wrapper.style.position === "static") wrapper.style.position = "relative";
    wrapper.style.overflow = "hidden";
    wrapper.style.backgroundColor = "#000";

    const thumb = document.createElement("img");
    thumb.alt = "Miniatura de video";
    thumb.loading = "lazy";
    thumb.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;cursor:pointer";
    const sources = [
      `https://i.ytimg.com/vi/${ytid}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${ytid}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`
    ];
    let srcIndex = 0;
    function tryNextSrc(){
      if (srcIndex >= sources.length) return;
      thumb.src = sources[srcIndex++];
    }
    thumb.addEventListener("error", tryNextSrc);
    tryNextSrc();
    wrapper.appendChild(thumb);

    const overlayBtn = document.createElement("button");
    overlayBtn.type = "button";
    overlayBtn.setAttribute("aria-label", "Reproducir video en YouTube");
    overlayBtn.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:none;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center";
    const iconWrap = document.createElement("div");
    iconWrap.innerHTML = `<svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><rect x="1" y="7" width="66" height="36" rx="12" fill="#FF0000"></rect><polygon points="28,17 28,31 42,24" fill="#FFFFFF"></polygon></svg>`;
    overlayBtn.appendChild(iconWrap);
    wrapper.appendChild(overlayBtn);

    overlayBtn.addEventListener("mouseenter", () => { iconWrap.style.transform = "scale(1.08)"; iconWrap.style.transition = "transform 0.15s ease-out"; });
    overlayBtn.addEventListener("mouseleave", () => { iconWrap.style.transform = "scale(1)"; });

    function loadIframe(){
      wrapper.dataset.ytMounted = "1";
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
    overlayBtn.addEventListener("click", loadIframe);
    thumb.addEventListener("click", loadIframe);
  }
  function initYouTubeEmbeds(){
    document.querySelectorAll(".yt-wrap[data-ytid], .reel-embed[data-ytid]").forEach(mountLazyEmbed);
  }
  document.addEventListener("DOMContentLoaded", initYouTubeEmbeds);
})();

/* =========================================================
   10) CALCULADORA
   ========================================================= */
(function(){
  document.addEventListener("DOMContentLoaded", function(){
    const app = document.getElementById("app");
    const PRIMARY = app?.dataset?.system?.trim();
    if (!PRIMARY) return;

    const moneyMX = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
    const fmt = v => moneyMX.format(Math.round(Number(v || 0)));
    const hasPrices = name => !!(window.preciosContpaqi && window.preciosContpaqi[name]);

    window.CATALOG_SISTEMAS = window.CATALOG_SISTEMAS || [
      { name: "CONTPAQi Contabilidad",        img: "../IMG/contabilidadsq.webp" },
      { name: "CONTPAQi Bancos",              img: "../IMG/bancossq.webp" },
      { name: "CONTPAQi Nóminas",             img: "../IMG/nominassq.webp" },
      { name: "CONTPAQi XML en Línea",        img: "../IMG/xmlsq.webp",  noDiscount: true },
      { name: "CONTPAQi Comercial PRO",       img: "../IMG/comercialprosq.webp" },
      { name: "CONTPAQi Comercial PREMIUM",   img: "../IMG/comercialpremiumsq.webp" },
      { name: "CONTPAQi Factura Electrónica", img: "../IMG/facturasq.webp" }
    ];

    function getPrecioDesde(systemName){
      const db = (window.preciosContpaqi && window.preciosContpaqi[systemName]) || null;
      if (!db) return null;
      if (db.anual?.MultiRFC?.precio_base || db.anual?.MultiRFC?.renovacion) return Number(db.anual.MultiRFC.precio_base || db.anual.MultiRFC.renovacion || 0);
      if (db.anual?.MonoRFC?.precio_base || db.anual?.MonoRFC?.renovacion) return Number(db.anual.MonoRFC.precio_base || db.anual.MonoRFC.renovacion || 0);
      if (db.tradicional?.actualizacion?.precio_base) return Number(db.tradicional.actualizacion.precio_base);
      return null;
    }

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

    const row    = document.getElementById("calc-row");
    const slot2  = document.getElementById("calc-slot-2") || document.getElementById("calc-secondary");
    const slot3  = document.getElementById("calc-tertiary");
    const addMore = document.getElementById("add-more-panel");
    const pick2   = document.getElementById("icons-sec-sys");
    const pick3   = document.getElementById("icons-third-sys");
    if (!row) return;

    const selected = { secondary: null, tertiary: null };
    const selectedSet = () => new Set([selected.secondary, selected.tertiary].filter(Boolean));
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

    pick3?.addEventListener("click", e => {
      const btn = e.target.closest(".sys-icon");
      if (!btn) return;
      const sys = btn.dataset.sys;
      if (!hasPrices(sys)) return;
      if (sys === selected.secondary) return;
      selected.tertiary = sys;
      if (slot3) slot3.style.display = "block";
      if (window.CalculadoraContpaqi?.setTertiarySystem){
        window.CalculadoraContpaqi.setTertiarySystem(sys, {
          tertiarySelector: "#calc-tertiary",
          combinedSelector: "#combined-wrap",
          onCombined:        renderCombinedTable
        });
      }
      if (addMore) addMore.style.display = "none";
      row.classList.add("has-three");
      refreshPickers();
    });

    if (window.CalculadoraContpaqi?.onCombinedSet){
      window.CalculadoraContpaqi.onCombinedSet(renderCombinedTable);
    }
    if (window.CalculadoraContpaqi?.init){
      document.body.setAttribute("data-calc", "escritorio");
      window.CalculadoraContpaqi.init({
        systemName:       PRIMARY,
        primarySelector: "#calc-primary",
        combinedSelector:"#combined-wrap"
      });
    } else {
      console.warn("CalculadoraContpaqi.init no disponible");
    }
  });
})();

/* =========================================================
   11) COMPACTADOR FORMULARIO
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
  function compactar(container){
    if (!container) return;
    if (container.querySelector("form.calc-form")) return;
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
    if (!bLic || !bTipo || !bUsu || !bInst) return;

    const grid = document.createElement("div");
    grid.className = "controls-grid";
    grid.append(bLic, bTipo, bUsu, bInst);
    container.insertBefore(grid, container.firstElementChild);
    unirInstalacionServicios(container);
  }
  function unirInstalacionServicios(container){
    if (!container) return;
    if (container.querySelector(".inst-wrap .instalacion-box")) return;
    const selInst = pickSelect(container, ["select#instalacion", 'select[name*="instal"]', 'select[data-field*="instal"]']);
    const selServ = pickSelect(container, ["select#servicios", "select#ervicios", 'select[name*="servi"]', 'select[data-field*="servi"]']);
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
  window.addEventListener("calc-render",    tryCompact);
  setTimeout(tryCompact,  500);
  setTimeout(tryCompact, 1200);
})();

/* =========================================================
   12) AUTODIAG
   ========================================================= */
(function(){
  const selectors = [".carouselX .track", ".icons-wrap"];
  const found = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));
  found.forEach((el, i) => {
    const cs   = getComputedStyle(el);
    const name = el.className || el.id || `track#${i}`;
    const warn = (msg, val) => console.warn(`⚠️ [${name}] ${msg}`, val);
    if (el.scrollWidth <= el.clientWidth + 2) warn("No tiene scroll real", { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
    if ((cs.scrollSnapType && cs.scrollSnapType !== "none") || el.style.scrollSnapType) warn("scroll-snap-type activo", cs.scrollSnapType);
    if (cs.justifyContent.includes("center")) warn("justify-content:center detectado", cs.justifyContent);
    if (cs.direction === "rtl") warn("direction:rtl detectado", cs.direction);
    const rect  = el.getBoundingClientRect();
    const probe = document.elementsFromPoint(rect.left + 10, rect.top + rect.height / 2);
    const blocker = probe.find(n => n !== el && !el.contains(n) && getComputedStyle(n).pointerEvents !== "none");
    if (blocker) warn("Elemento sobre la orilla izquierda", blocker);
    if (el.scrollLeft > 5) warn("scrollLeft inicial ≠ 0", el.scrollLeft);
    el._diagFix = {
      noSnap: () => { el.style.scrollSnapType = "none"; el.querySelectorAll("*").forEach(n => n.style.scrollSnapAlign = "none"); console.log(`✅ Snap desactivado en ${name}`); },
      flexStart: () => { el.style.justifyContent = "flex-start"; console.log(`✅ justify-content:flex-start aplicado en ${name}`); },
      forceLTR: () => { el.style.direction = "ltr"; console.log(`✅ direction:ltr aplicado en ${name}`); },
      resetScroll: () => { el.scrollTo({ left: 0, behavior: "auto" }); console.log(`✅ scrollLeft restablecido en ${name}`); }
    };
  });
})();

/* =========================================================
   13) TOC
   ========================================================= */
(function(){
  const toc = document.getElementById("toc");
  if (!toc) return;
  const openBtn  = document.getElementById("tocToggle") || toc.querySelector(".toc-toggle");
  const closeBtn = toc.querySelector(".toc-close");
  const tocLinks = toc.querySelectorAll("a[href^='#']");
  const OPEN_CLASS = "open";
  const CLOSED_CLASS = "collapsed";
  function openToc(){ toc.classList.remove(CLOSED_CLASS); if (OPEN_CLASS) toc.classList.add(OPEN_CLASS); }
  function closeToc(){ toc.classList.add(CLOSED_CLASS); if (OPEN_CLASS) toc.classList.remove(OPEN_CLASS); }
  function toggleToc(){ if (toc.classList.contains(CLOSED_CLASS)){ openToc(); } else { closeToc(); } }
  if (openBtn){ openBtn.addEventListener("click", function(e){ e.preventDefault(); toggleToc(); }); }
  if (closeBtn){ closeBtn.addEventListener("click", function(e){ e.preventDefault(); closeToc(); }); }
  tocLinks.forEach(link => { link.addEventListener("click", () => { closeToc(); }); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape"){ closeToc(); } });
})();

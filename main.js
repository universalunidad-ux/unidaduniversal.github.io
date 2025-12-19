(() => {
  "use strict";
  if (window.__EXP_MAIN_FINAL__) return;
  window.__EXP_MAIN_FINAL__ = 1;

  const D = document, W = window;

  /* =========================================================
     0) PARTIALS + NORMALIZACIÓN DE RUTAS (GH Pages + local)
     - Soporta: .js-abs-src[data-src], .js-abs-href[data-href]
     - Soporta: .js-img[data-src], .js-link[data-href]
     - Año: #gf-year o #year
     ========================================================= */
  (() => {
    const exists = async (u) => {
      try { const r = await fetch(u, { method: "HEAD", cache: "no-store" }); return r.ok; }
      catch { return false; }
    };

    const pick = async (arr) => {
      for (const u of arr) if (await exists(u)) return u;
      return arr[0];
    };

    const isGh = location.hostname.endsWith("github.io");
    const firstSeg = location.pathname.split("/")[1] || "";
    const repoBase = (isGh && firstSeg) ? ("/" + firstSeg) : "";
    const inSub = /\/(SISTEMAS|SERVICIOS)\//i.test(location.pathname);
    const rel = inSub ? "../" : "";

    const abs = (p) => {
      if (!p) return p;
      if (/^https?:\/\//i.test(p)) return p;
      if (/^(mailto:|tel:|data:)/i.test(p)) return p;
      return (isGh ? (repoBase + "/" + p) : (rel + p)).replace(/\/+/g, "/");
    };

    const normalize = (root = D) => {
      root.querySelectorAll(".js-abs-src[data-src]").forEach((img) => {
        const ds = img.getAttribute("data-src");
        if (!ds) return;
        const fin = abs(ds);
        if (!img.getAttribute("src")) img.setAttribute("src", fin);
        img.style.opacity = "1";
      });

      root.querySelectorAll(".js-abs-href[data-href]").forEach((a) => {
        const p = a.getAttribute("data-href");
        if (!p) return;
        const parts = p.split("#");
        const pth = parts[0] || "";
        const hash = parts[1] || "";
        a.href = abs(pth) + (hash ? ("#" + hash) : "");
      });

      root.querySelectorAll(".js-img[data-src]").forEach((img) => {
        const ds = img.getAttribute("data-src");
        if (!ds) return;
        if (!img.getAttribute("src")) img.setAttribute("src", abs(ds));
      });

      root.querySelectorAll(".js-link[data-href]").forEach((a) => {
        const dh = a.getAttribute("data-href");
        if (!dh) return;
        if (!a.getAttribute("href")) a.setAttribute("href", dh);
      });

      const y = (root.getElementById && root.getElementById("gf-year")) ||
                D.getElementById("gf-year") ||
                (root.getElementById && root.getElementById("year")) ||
                D.getElementById("year");
      if (y) y.textContent = new Date().getFullYear();
    };

    const loadPartials = async () => {
      const hp = D.getElementById("header-placeholder");
      const fp = D.getElementById("footer-placeholder");

      if (!hp && !fp) { normalize(D); return; }

      const headerURL = await pick([
        abs("PARTIALS/global-header.html"),
        rel + "PARTIALS/global-header.html",
        "./PARTIALS/global-header.html",
        "/PARTIALS/global-header.html"
      ]);

      const footerURL = await pick([
        abs("PARTIALS/global-footer.html"),
        rel + "PARTIALS/global-footer.html",
        "./PARTIALS/global-footer.html",
        "/PARTIALS/global-footer.html"
      ]);

      let hh = "", fh = "";
      try {
        const hr = hp ? await fetch(headerURL, { cache: "no-store" }) : null;
        const fr = fp ? await fetch(footerURL, { cache: "no-store" }) : null;
        if (hp && hr && hr.ok) hh = await hr.text();
        if (fp && fr && fr.ok) fh = await fr.text();
      } catch (e) {
        console.warn("No se pudieron cargar parciales", e);
      }

      if (hp && hh) hp.outerHTML = hh;
      if (fp && fh) fp.outerHTML = fh;

      normalize(D);
    };

    const boot = () => loadPartials();
    D.readyState === "loading"
      ? D.addEventListener("DOMContentLoaded", boot, { once: true })
      : boot();

    W.addEventListener("pageshow", () => { try { normalize(D); } catch {} });
  })();

  /* =========================================================
     1) UTILIDADES (SIN $ / $$ conflict)
     ========================================================= */
  (() => {
    const money = new Intl.NumberFormat("es-MX", {
      style: "currency", currency: "MXN", maximumFractionDigits: 0
    });
    W.$$fmt = (v) => money.format(Math.round(Number(v || 0)));
    if (!W.Q)  W.Q  = (s, ctx = D) => ctx.querySelector(s);
    if (!W.QA) W.QA = (s, ctx = D) => Array.from(ctx.querySelectorAll(s));
  })();

  /* =========================================================
     2) AÑO + BURGER
     ========================================================= */
  (() => {
    const y = D.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    const b = D.getElementById("burger");
    const m = D.getElementById("mobileMenu");
    if (b && m) b.addEventListener("click", () => m.classList.toggle("open"));
  })();

  /* =========================================================
     3) YOUTUBE MANAGER (pause real + lazy + hook iframes)
     - NO duplicados
     - NO código suelto
     ========================================================= */
  (() => {
    if (W.__EXP_YT_MGR__) return;
    W.__EXP_YT_MGR__ = 1;

    W.exPlayers = W.exPlayers || [];

    W.pauseAllYTIframes = function (except) {
      (W.exPlayers || []).forEach((p) => {
        if (!p || p === except || typeof p.pauseVideo !== "function") return;
        try {
          const s = p.getPlayerState();
          if (s === 1 || s === 3) p.pauseVideo();
        } catch {}
      });
    };

    const onState = (e) => { if (e && e.data === 1) W.pauseAllYTIframes(e.target); };

    const ensureAPI = () => {
      if (W.__EXP_YT_API_REQ__) return;
      W.__EXP_YT_API_REQ__ = 1;
      const s = D.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      D.head.appendChild(s);
    };

    const whenYT = (cb) => {
      if (W.YT && W.YT.Player) { cb(); return; }
      ensureAPI();
      let t = 0;
      const it = setInterval(() => {
        t++;
        if (W.YT && W.YT.Player) { clearInterval(it); cb(); return; }
        if (t > 80) clearInterval(it);
      }, 100);
    };

    const registerIframe = (ifr) => {
      if (!ifr || ifr.dataset.ytInit) return;
      ifr.dataset.ytInit = "1";

      let src = ifr.src || "";
      if (src && !src.includes("enablejsapi=1")) {
        src += (src.includes("?") ? "&" : "?") + "enablejsapi=1";
        ifr.src = src;
      }

      try {
        const p = new YT.Player(ifr, { events: { onStateChange: onState } });
        W.exPlayers.push(p);
      } catch {}
    };

    const poster = (id) => [
      `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    ];

    const markReady = (wrap) => { if (wrap && wrap.classList) wrap.classList.add("is-ready");   wrap.classList.add("has-iframe"); };

    const mountLazy = (wrap) => {
      if (!wrap || wrap.dataset.ytMounted) return;

      /* Si YA hay iframe en el HTML, NO ponemos overlay (fix doble play) */
      const existing = wrap.querySelector("iframe");
      if (existing) {
        wrap.dataset.ytMounted = "1";
          wrap.classList.add("has-iframe"); 
        existing.addEventListener("load", () => markReady(wrap), { once: true });
        setTimeout(() => markReady(wrap), 120);
        whenYT(() => registerIframe(existing));
        return;
      }

      const id = wrap.getAttribute("data-ytid");
      if (!id) return;

      wrap.dataset.ytMounted = "0";
      if (!wrap.style.position || wrap.style.position === "static") wrap.style.position = "relative";
      wrap.style.overflow = "hidden";
      wrap.style.backgroundColor = "#000";

      const img = D.createElement("img");
      img.alt = "Miniatura de video";
      img.loading = "lazy";
      img.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;cursor:pointer";
      const srcs = poster(id);
      let k = 0;
      const next = () => { if (k < srcs.length) img.src = srcs[k++]; };
      img.addEventListener("error", next);
      next();
      wrap.appendChild(img);

      const btn = D.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Reproducir video");
      btn.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:none;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center";
      btn.innerHTML = '<svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><rect x="1" y="7" width="66" height="36" rx="12" fill="#FF0000"></rect><polygon points="28,17 28,31 42,24" fill="#FFFFFF"></polygon></svg>';
      wrap.appendChild(btn);

      const load = () => {
        if (wrap.dataset.ytMounted === "1") return;
        wrap.dataset.ytMounted = "1";

        W.pauseAllYTIframes();
        wrap.innerHTML = "";

        const ifr = D.createElement("iframe");
        ifr.loading = "lazy";
        ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        ifr.allowFullscreen = true;
        ifr.title = wrap.getAttribute("data-title") || "YouTube video";
        ifr.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1&vq=hd1080`;
        wrap.appendChild(ifr);
wrap.classList.add("has-iframe"); // <<--- AÑADE ESTO

        
        ifr.addEventListener("load", () => markReady(wrap), { once: true });
        setTimeout(() => markReady(wrap), 200);
        whenYT(() => registerIframe(ifr));
      };

      btn.addEventListener("click", load);
      img.addEventListener("click", load);
    };

    const init = () => {
      /* Wrappers lazy */
      D.querySelectorAll(".yt-wrap[data-ytid],.reel-embed[data-ytid]").forEach(mountLazy);

      /* Iframes ya existentes */
      D.querySelectorAll('iframe[src*="youtube"],iframe[src*="youtube-nocookie"]').forEach((ifr) => {
        const wrap = ifr.closest(".yt-wrap,.reel-embed");
        if (wrap) {
          ifr.addEventListener("load", () => markReady(wrap), { once: true });
          setTimeout(() => markReady(wrap), 120);
        }
        whenYT(() => registerIframe(ifr));
      });
    };

    W.onYouTubeIframeAPIReady = function () {
      D.querySelectorAll('iframe[src*="youtube"],iframe[src*="youtube-nocookie"]').forEach(registerIframe);
    };

    D.readyState === "loading"
      ? D.addEventListener("DOMContentLoaded", init, { once: true })
      : init();
  })();

  /* =========================================================
     4) CARRUSEL UNIVERSAL (.carousel)
     ========================================================= */
  (() => {
    const pause = () => { if (W.pauseAllYTIframes) W.pauseAllYTIframes(); };

    const syncDots = (root, len) => {
      const nav = root.querySelector(".carousel-nav");
      if (!nav) return [];
      let dots = Array.from(nav.querySelectorAll(".dot"));

      while (dots.length < len) {
        const b = D.createElement("button");
        b.type = "button";
        b.className = "dot";
        b.setAttribute("aria-label", `Ir al reel ${dots.length + 1}`);
        nav.appendChild(b);
        dots.push(b);
      }
      while (dots.length > len) {
        const x = dots.pop();
        if (x) x.remove();
      }
      return dots;
    };

    const hide = (root, len) => {
      const prev = root.querySelector(".arrowCircle.prev");
      const next = root.querySelector(".arrowCircle.next");
      const nav  = root.querySelector(".carousel-nav");
      const single = len <= 1;
      if (prev) { prev.disabled = single; prev.style.display = single ? "none" : ""; }
      if (next) { next.disabled = single; next.style.display = single ? "none" : ""; }
      if (nav)  nav.style.display = single ? "none" : "";
      root.toggleAttribute("data-single", single);
    };

    const titlesFor = (car) => {
      const sel = car.getAttribute("data-titles");
      if (sel) {
        const n = Array.from(D.querySelectorAll(sel));
        if (n.length) return n;
      }
      const scope = car.closest(".card,.body,aside,section,div") || D;
      const t = Array.from(scope.querySelectorAll(".reel-title"));
      return t.length ? t : null;
    };

    const initCar = (root, onChange) => {
      const track = root.querySelector(".carousel-track");
      if (!track || root.dataset.cInit === "1") return;
      root.dataset.cInit = "1";

      const prev = root.querySelector(".arrowCircle.prev");
      const next = root.querySelector(".arrowCircle.next");
      const slides = Array.from(track.querySelectorAll(":scope > .carousel-slide"));
      const len = slides.length;

      let dots = syncDots(root, len);
      hide(root, len);

      if (len <= 1) {
        if (dots[0]) dots[0].classList.add("active");
        if (onChange) onChange(0);
        return;
      }

      let i = 0;
      const paint = (idx) => dots.forEach((d, di) => d.classList.toggle("active", di === idx));

      const set = (n, behavior) => {
        const beh = behavior || "smooth";
        i = (n + len) % len;
        paint(i);
        track.scrollTo({ left: track.clientWidth * i, behavior: beh });
        if (onChange) onChange(i);
      };

      dots.forEach((d, idx) => d.addEventListener("click", () => { pause(); set(idx); }));
      if (prev) prev.addEventListener("click", () => { pause(); set(i - 1); });
      if (next) next.addEventListener("click", () => { pause(); set(i + 1); });

      track.addEventListener("scroll", () => {
        if (!track.clientWidth) return;
        const n = Math.round(track.scrollLeft / track.clientWidth);
        if (n !== i) {
          i = Math.max(0, Math.min(len - 1, n));
          paint(i);
          if (onChange) onChange(i);
        }
      });

      W.addEventListener("resize", () => set(i, "auto"));
      set(0, "auto");
    };

    const boot = () => {
      D.querySelectorAll(".carousel").forEach((car) => {
        const titles = titlesFor(car);
        initCar(car, (idx) => {
          if (titles) titles.forEach((t, k) => t.classList.toggle("active", k === idx));
        });
      });
    };

    D.readyState === "loading"
      ? D.addEventListener("DOMContentLoaded", boot, { once: true })
      : boot();
  })();

  /* =========================================================
     5) HARD RESET .carouselX .track (scrollLeft = 0)
     ========================================================= */
  (() => {
    const tracks = D.querySelectorAll(".carouselX .track");
    if (!tracks.length) return;

    const force = (t) => {
      if (!t) return;
      const prev = t.style.scrollBehavior;
      t.style.scrollBehavior = "auto";
      t.scrollLeft = 0;
      requestAnimationFrame(() => { t.scrollLeft = 0; });
      setTimeout(() => {
        t.scrollLeft = 0;
        t.style.scrollBehavior = prev || "";
      }, 80);
    };

    tracks.forEach(force);
    try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch {}

    W.addEventListener("pageshow", (e) => { if (e.persisted) tracks.forEach(force); });
    W.addEventListener("resize", () => tracks.forEach(force));
  })();

  /* =========================================================
     6) LIST SLIDER (.listSlider)
     ========================================================= */
  (() => {
    D.querySelectorAll(".listSlider").forEach((w) => {
      const t = w.querySelector(".listTrack");
      const p = w.querySelector(".arrowCircle.prev");
      const n = w.querySelector(".arrowCircle.next");
      if (!t || !p || !n) return;

      let i = 0;
      const len = t.children.length || 1;

      const go = (x) => {
        if (W.pauseAllYTIframes) W.pauseAllYTIframes();
        i = (x + len) % len;
        t.scrollTo({ left: w.clientWidth * i, behavior: "smooth" });
      };

      p.addEventListener("click", () => go(i - 1));
      n.addEventListener("click", () => go(i + 1));
      W.addEventListener("resize", () => go(i));
    });
  })();


  /* =========================================================
   X) ICONS-CAROUSEL (panel -15%): flechas scroll
   ========================================================= */
(() => {
  const boot = () => {
    D.querySelectorAll(".icons-carousel").forEach((wrap) => {
      const track = wrap.querySelector(".icons-wrap");
      const prev = wrap.querySelector(".arrowCircle.prev");
      const next = wrap.querySelector(".arrowCircle.next");
      if (!track || !prev || !next) return;

      const step = () => Math.max(220, Math.floor(track.clientWidth * 0.8));

      prev.addEventListener("click", () => {
        if (W.pauseAllYTIframes) W.pauseAllYTIframes();
        track.scrollBy({ left: -step(), behavior: "smooth" });
      });

      next.addEventListener("click", () => {
        if (W.pauseAllYTIframes) W.pauseAllYTIframes();
        track.scrollBy({ left: step(), behavior: "smooth" });
      });
    });
  };

  D.readyState === "loading"
    ? D.addEventListener("DOMContentLoaded", boot, { once: true })
    : boot();
})();

  /* =========================================================
     7) PÍLDORAS (filtros cards)
     ========================================================= */
  (() => {
    const pills = Array.from(D.querySelectorAll(".pill"));
    const cards = Array.from(D.querySelectorAll(".feature-grid .fcard"));
    if (!pills.length || !cards.length) return;

    const apply = (tag) => {
      cards.forEach((c) => { c.style.display = c.classList.contains("tag-" + tag) ? "" : "none"; });
    };

    pills.forEach((p) => p.addEventListener("click", () => {
      pills.forEach((x) => x.classList.remove("active"));
      p.classList.add("active");
      apply(p.dataset.filter);
    }));

    apply((pills[0] && pills[0].dataset.filter) ? pills[0].dataset.filter : "nomina");
  })();

  /* =========================================================
     8) FAQ (solo uno abierto)
     ========================================================= */
  (() => {
    const wrap = D.getElementById("faqWrap");
    if (!wrap) return;
    Array.from(wrap.querySelectorAll(".faq-item")).forEach((it) => {
      it.addEventListener("toggle", () => {
        if (!it.open) return;
        Array.from(wrap.querySelectorAll(".faq-item")).forEach((o) => {
          if (o !== it) o.removeAttribute("open");
        });
      });
    });
  })();

  /* =========================================================
     9) CAROUSEL SISTEMAS (.carouselX)
     ========================================================= */
  (() => {
    const ensureUI = (root) => {
      let prev = root.querySelector(".arrowCircle.prev");
      let next = root.querySelector(".arrowCircle.next");
      if (!prev) {
        prev = D.createElement("button");
        prev.className = "arrowCircle prev";
        prev.setAttribute("aria-label", "Anterior");
        prev.innerHTML = '<span class="chev">‹</span>';
        root.appendChild(prev);
      }
      if (!next) {
        next = D.createElement("button");
        next.className = "arrowCircle next";
        next.setAttribute("aria-label", "Siguiente");
        next.innerHTML = '<span class="chev">›</span>';
        root.appendChild(next);
      }
      let dotsWrap = root.querySelector(".group-dots");
      if (!dotsWrap) {
        dotsWrap = D.createElement("div");
        dotsWrap.className = "group-dots";
        root.appendChild(dotsWrap);
      }
      return { prev, next, dotsWrap };
    };

    D.querySelectorAll(".carouselX").forEach((root) => {
      if (root.dataset.cxInit === "1") return;
      root.dataset.cxInit = "1";

      const track = root.querySelector(".track");
      if (!track) return;

      const items = Array.from(root.querySelectorAll(".sys"));

      items.forEach((it) => {
        it.setAttribute("role", "link");
        it.setAttribute("tabindex", "0");
        let touched = false;

        const isMob = () => W.matchMedia("(max-width: 768px)").matches;
        const go = () => {
          const href = it.getAttribute("data-href");
          if (href) W.open(href, "_blank", "noopener");
        };

        it.addEventListener("click", (e) => {
          e.preventDefault();
          if (isMob() && !touched) {
            touched = true;
            it.classList.add("show-hover");
            setTimeout(() => { touched = false; }, 2000);
            return;
          }
          go();
        });

        it.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
        });
      });

      const ui = ensureUI(root);
      const prev = ui.prev, next = ui.next, dotsWrap = ui.dotsWrap;

      const perView = () => (W.innerWidth <= 980 ? 1 : 3);
      const viewportW = () => (track.clientWidth || root.clientWidth || 1);
      const pageCount = () => Math.max(1, Math.ceil((track.scrollWidth - 1) / viewportW()));

      let idx = 0, dots = [];

      const build = () => {
        dotsWrap.innerHTML = "";
        const total = pageCount();
        dots = Array.from({ length: total }).map((_, j) => {
          const b = D.createElement("button");
          b.className = "dot" + (j === 0 ? " active" : "");
          b.setAttribute("aria-label", "Ir a página " + (j + 1));
          b.addEventListener("click", () => { if (W.pauseAllYTIframes) W.pauseAllYTIframes(); go(j); });
          dotsWrap.appendChild(b);
          return b;
        });
      };

      const paint = (j) => dots.forEach((d, i) => d.classList.toggle("active", i === j));

      const toggle = () => {
        const multi = pageCount() > 1;
        prev.style.display = multi ? "" : "none";
        next.style.display = multi ? "" : "none";
        dotsWrap.style.display = multi ? "" : "none";
      };

      const go = (j) => {
        const total = pageCount();
        idx = ((j % total) + total) % total;

        const startIdx = Math.min(idx * perView(), items.length - 1);
        const first = items[startIdx];

        const baseLeft = idx === 0
          ? 0
          : (first ? (first.offsetLeft - (track.firstElementChild ? track.firstElementChild.offsetLeft : 0)) : idx * viewportW());

        const maxLeft = Math.max(0, track.scrollWidth - viewportW());
        track.scrollTo({ left: Math.min(Math.max(0, baseLeft), maxLeft), behavior: "smooth" });

        paint(idx);
        toggle();
      };

      build();

      prev.addEventListener("click", () => { if (W.pauseAllYTIframes) W.pauseAllYTIframes(); go(idx - 1); });
      next.addEventListener("click", () => { if (W.pauseAllYTIframes) W.pauseAllYTIframes(); go(idx + 1); });

      track.addEventListener("scroll", () => {
        const i = Math.round(track.scrollLeft / viewportW());
        if (i !== idx) { idx = i; paint(idx); }
      });

      W.addEventListener("resize", () => {
        const now = pageCount();
        if (dots.length !== now) build();
        setTimeout(() => go(idx), 0);
      });

      const reset = () => { track.scrollLeft = 0; idx = 0; paint(0); toggle(); };

      requestAnimationFrame(reset);
      W.addEventListener("load", () => setTimeout(reset, 0));
      W.addEventListener("pageshow", reset);
      setTimeout(reset, 350);

      track.style.overflowX = "auto";
      track.style.scrollBehavior = "smooth";
      toggle();
      go(0);
      setTimeout(() => track.scrollTo({ left: 0, behavior: "auto" }), 50);
    });
  })();

  /* =========================================================
     10) CALCULADORA (hooks secundarios / terciarios)
     ========================================================= */
  (() => {
    D.addEventListener("DOMContentLoaded", () => {
      const app = D.getElementById("app");
      const PRIMARY = (app && app.dataset && app.dataset.system) ? String(app.dataset.system).trim() : "";
      if (!PRIMARY) return;

      const moneyMX = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
      const fmt = (v) => moneyMX.format(Math.round(Number(v || 0)));
      const hasPrices = (n) => !!(W.preciosContpaqi && W.preciosContpaqi[n]);

      W.CATALOG_SISTEMAS = W.CATALOG_SISTEMAS || [
        { name: "CONTPAQi Contabilidad", img: "../IMG/contabilidadsq.webp" },
        { name: "CONTPAQi Bancos", img: "../IMG/bancossq.webp" },
        { name: "CONTPAQi Nóminas", img: "../IMG/nominassq.webp" },
        { name: "CONTPAQi XML en Línea", img: "../IMG/xmlsq.webp", noDiscount: true },
        { name: "CONTPAQi Comercial PRO", img: "../IMG/comercialprosq.webp" },
        { name: "CONTPAQi Comercial PREMIUM", img: "../IMG/comercialpremiumsq.webp" },
        { name: "CONTPAQi Factura Electrónica", img: "../IMG/facturasq.webp" }
      ];

      const getPrecioDesde = (name) => {
        const db = (W.preciosContpaqi && W.preciosContpaqi[name]) ? W.preciosContpaqi[name] : null;
        if (!db) return null;

        if (db.anual && db.anual.MultiRFC && (db.anual.MultiRFC.precio_base || db.anual.MultiRFC.renovacion)) {
          return Number(db.anual.MultiRFC.precio_base || db.anual.MultiRFC.renovacion || 0);
        }
        if (db.anual && db.anual.MonoRFC && (db.anual.MonoRFC.precio_base || db.anual.MonoRFC.renovacion)) {
          return Number(db.anual.MonoRFC.precio_base || db.anual.MonoRFC.renovacion || 0);
        }
        if (db.tradicional && db.tradicional.actualizacion && db.tradicional.actualizacion.precio_base) {
          return Number(db.tradicional.actualizacion.precio_base || 0);
        }
        return null;
      };

      const renderPicker = (id, exclude, active) => {
        const wrap = D.getElementById(id);
        if (!wrap) return;

        wrap.innerHTML = "";
        if (PRIMARY) exclude.add(PRIMARY);

        W.CATALOG_SISTEMAS.forEach((item) => {
          if (exclude.has(item.name)) return;

          const precio = getPrecioDesde(item.name);
          const btn = D.createElement("button");
          btn.className = "sys-icon";
          btn.type = "button";
          btn.dataset.sys = item.name;
          btn.title = item.name;

          btn.innerHTML =
            (item.noDiscount ? '<small class="sin15">sin -15%</small>' : "") +
            `<img src="${item.img}" alt="${item.name}">` +
            `<strong>${item.name.replace("CONTPAQi ", "")}</strong>` +
            `<small class="sys-price">${precio != null ? ("desde " + fmt(precio)) : "precio no disp."}</small>`;

          if (active && active === item.name) btn.classList.add("active");
          wrap.appendChild(btn);
        });
      };

      const renderCombined = (rows) => {
        const wrap = D.getElementById("combined-wrap");
        const tbody = D.getElementById("combined-table-body");
        if (!wrap || !tbody) return;

        tbody.innerHTML = "";
        rows.forEach((pair) => {
          const c = pair[0], imp = pair[1];
          const tr = D.createElement("tr");
          const td1 = D.createElement("td");
          const td2 = D.createElement("td");
          td1.textContent = c;
          td2.textContent = imp;
          td2.style.textAlign = "right";
          tr.appendChild(td1);
          tr.appendChild(td2);
          tbody.appendChild(tr);
        });

        wrap.hidden = false;
      };

      const row = D.getElementById("calc-row");
      if (!row) return;

      const slot2 = D.getElementById("calc-slot-2") || D.getElementById("calc-secondary");
      const slot3 = D.getElementById("calc-tertiary");
      const addMore = D.getElementById("add-more-panel");
      const pick2 = D.getElementById("icons-sec-sys");
      const pick3 = D.getElementById("icons-third-sys");

      const selected = { secondary: null, tertiary: null };
      const setSel = () => new Set([selected.secondary, selected.tertiary].filter(Boolean));

      renderPicker("icons-sec-sys", new Set([PRIMARY]), null);
      renderPicker("icons-third-sys", new Set([PRIMARY]), null);

      const refresh = () => {
        const ex = setSel();
        ex.add(PRIMARY);
        renderPicker("icons-sec-sys", ex, selected.secondary);
        renderPicker("icons-third-sys", ex, selected.tertiary);
      };

      const showMore = () => { if (addMore) addMore.style.display = selected.secondary ? "" : "none"; };

      if (pick2) pick2.addEventListener("click", (e) => {
        const btn = e.target.closest(".sys-icon");
        if (!btn) return;
        const sys = btn.dataset.sys;
        if (!hasPrices(sys)) return;

        selected.secondary = sys;
        if (selected.tertiary === sys) selected.tertiary = null;

        if (slot2 && slot2.id === "calc-slot-2") { slot2.className = "calc-container"; slot2.id = "calc-secondary"; }

        if (W.CalculadoraContpaqi && W.CalculadoraContpaqi.setSecondarySystem) {
          W.CalculadoraContpaqi.setSecondarySystem(sys, {
            secondarySelector: "#calc-secondary",
            combinedSelector: "#combined-wrap",
            onCombined: renderCombined
          });
        }

        refresh();
        showMore();
      });

      if (pick3) pick3.addEventListener("click", (e) => {
        const btn = e.target.closest(".sys-icon");
        if (!btn) return;

        const sys = btn.dataset.sys;
        if (!hasPrices(sys) || sys === selected.secondary) return;

        selected.tertiary = sys;
        if (slot3) slot3.style.display = "block";

        if (W.CalculadoraContpaqi && W.CalculadoraContpaqi.setTertiarySystem) {
          W.CalculadoraContpaqi.setTertiarySystem(sys, {
            tertiarySelector: "#calc-tertiary",
            combinedSelector: "#combined-wrap",
            onCombined: renderCombined
          });
        }

        if (addMore) addMore.style.display = "none";
        row.classList.add("has-three");
        refresh();
      });

      if (W.CalculadoraContpaqi && W.CalculadoraContpaqi.onCombinedSet) {
        W.CalculadoraContpaqi.onCombinedSet(renderCombined);
      }

      if (W.CalculadoraContpaqi && W.CalculadoraContpaqi.init) {
        D.body.setAttribute("data-calc", "escritorio");
        W.CalculadoraContpaqi.init({
          systemName: PRIMARY,
          primarySelector: "#calc-primary",
          combinedSelector: "#combined-wrap"
        });
      } else {
        console.warn("CalculadoraContpaqi.init no disponible");
      }
    });
  })();

  /* =========================================================
     11) COMPACTADOR (reacomoda UI calc si viene “suelta”)
     ========================================================= */
  (() => {
    const pickByLabel = (c, rx) => {
      const labels = Array.from(c.querySelectorAll("label"));
      const lb = labels.find((l) => rx.test(String(l.textContent || "").trim().toLowerCase()));
      if (!lb) return null;
      return lb.closest(".field") || lb.closest(".row") || lb.closest(".instalacion-box") || lb.closest(".inst-wrap") || lb.parentElement;
    };

    const pickSelect = (c, arr) => {
      for (const s of arr) { const el = c.querySelector(s); if (el) return el; }
      return null;
    };

    const unir = (c) => {
      if (!c || c.querySelector(".inst-wrap .instalacion-box")) return;

      const inst = pickSelect(c, ["select#instalacion", 'select[name*="instal"]', 'select[data-field*="instal"]']);
      const serv = pickSelect(c, ["select#servicios", "select#ervicios", 'select[name*="servi"]', 'select[data-field*="servi"]']);
      if (!inst || !serv) return;
      if (inst.closest(".instalacion-box") || serv.closest(".instalacion-box")) return;

      let wrap = c.querySelector(".inst-wrap");
      if (!wrap) {
        wrap = D.createElement("div");
        wrap.className = "inst-wrap";
        (inst.closest("form") || c.querySelector("form") || c).appendChild(wrap);
      }

      const box = D.createElement("div");
      box.className = "instalacion-box";

      const il = inst.labels && inst.labels[0] ? inst.labels[0] : null;
      const sl = serv.labels && serv.labels[0] ? serv.labels[0] : null;
      if (il) box.appendChild(il);
      box.appendChild(inst);
      if (sl) box.appendChild(sl);
      box.appendChild(serv);

      wrap.appendChild(box);

      if (!wrap.querySelector(".inst-hint")) {
        const h = D.createElement("small");
        h.className = "inst-hint";
        h.textContent = "Selecciona instalación y servicios en un solo paso.";
        wrap.appendChild(h);
      }
    };

    const compact = (c) => {
      if (!c || c.querySelector("form.calc-form")) return;

      if (c.querySelector(".controls-grid")) { unir(c); return; }

      const bLic = pickByLabel(c, /^licencia/);
      const bTipo = pickByLabel(c, /^tipo/);
      const bUsu  = pickByLabel(c, /^usuarios?/);

      let bInst = c.querySelector(".inst-wrap") || pickByLabel(c, /instalaci/);
      if (!bInst) {
        const any = c.querySelector('input[type="checkbox"]');
        bInst = any ? (any.closest(".instalacion-box") || any.closest(".field") || any.parentElement) : null;
      }

      const blocks = [bLic, bTipo, bUsu, bInst].filter(Boolean);
      blocks.forEach((b) => { if (b && b.classList) b.classList.add("field"); });

      if (!bLic || !bTipo || !bUsu || !bInst) return;

      const g = D.createElement("div");
      g.className = "controls-grid";
      g.append(bLic, bTipo, bUsu, bInst);

      c.insertBefore(g, c.firstElementChild);
      unir(c);
    };

    const target = D.getElementById("calc-primary");
    if (!target) return;

    const run = () => {
      const c = D.querySelector(".calc-container") || target;
      if (!c || c.querySelector("form.calc-form")) return;
      compact(c);
    };

    run();
    requestAnimationFrame(run);

    new MutationObserver(run).observe(target, { childList: true, subtree: true });
    W.addEventListener("calc-recompute", run);
    W.addEventListener("calc-render", run);
    setTimeout(run, 500);
    setTimeout(run, 1200);
  })();

  /* =========================================================
     12) AUTODIAG (console helpers)
     ========================================================= */
  (() => {
    const sels = [".carouselX .track", ".icons-wrap"];
    const found = sels.flatMap((s) => Array.from(D.querySelectorAll(s)));

    found.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const name = el.className || el.id || ("track#" + i);

      const warn = (m, v) => console.warn("⚠️ [" + name + "] " + m, v);

      if (el.scrollWidth <= el.clientWidth + 2) warn("No tiene scroll real", { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
      if ((cs.scrollSnapType && cs.scrollSnapType !== "none") || el.style.scrollSnapType) warn("scroll-snap-type activo", cs.scrollSnapType);
      if (String(cs.justifyContent || "").includes("center")) warn("justify-content:center detectado", cs.justifyContent);
      if (cs.direction === "rtl") warn("direction:rtl detectado", cs.direction);
      if (el.scrollLeft > 5) warn("scrollLeft inicial ≠ 0", el.scrollLeft);

      el._diagFix = {
        noSnap: () => {
          el.style.scrollSnapType = "none";
          el.querySelectorAll("*").forEach((n) => { n.style.scrollSnapAlign = "none"; });
          console.log("✅ Snap desactivado en " + name);
        },
        flexStart: () => { el.style.justifyContent = "flex-start"; console.log("✅ justify-content:flex-start aplicado en " + name); },
        forceLTR: () => { el.style.direction = "ltr"; console.log("✅ direction:ltr aplicado en " + name); },
        resetScroll: () => { el.scrollTo({ left: 0, behavior: "auto" }); console.log("✅ scrollLeft restablecido en " + name); }
      };
    });
  })();

  /* =========================================================
     13) TOC
     ========================================================= */
  (() => {
    const toc = D.getElementById("toc");
    if (!toc) return;

    const openBtn = D.getElementById("tocToggle") || toc.querySelector(".toc-toggle");
    const closeBtn = toc.querySelector(".toc-close");
    const links = toc.querySelectorAll("a[href^='#']");
    const OPEN = "open";
    const CLOSED = "collapsed";

    const open = () => { toc.classList.remove(CLOSED); toc.classList.add(OPEN); };
    const close = () => { toc.classList.add(CLOSED); toc.classList.remove(OPEN); };
    const toggle = () => { toc.classList.contains(CLOSED) ? open() : close(); };

    if (openBtn) openBtn.addEventListener("click", (e) => { e.preventDefault(); toggle(); });
    if (closeBtn) closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
    links.forEach((a) => a.addEventListener("click", close));
    D.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  })();

})();

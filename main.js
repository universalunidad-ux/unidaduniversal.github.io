/* =========================================================
   Expiriti - main.js — Escritorio + Carruseles + Reels (YouTube pause)
   ========================================================= */

/* ---------- Utils ---------- */
(function(){
  const money = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
  window.$$fmt = v => money.format(Math.round(Number(v||0)));
  window.$$  = (sel, ctx=document) => ctx.querySelector(sel);
  window.$all = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
})();

/* ---------- Año + menú móvil ---------- */
(function(){
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
  const b = document.getElementById("burger"), m = document.getElementById("mobileMenu");
  if (b && m) b.addEventListener("click", () => m.classList.toggle("open"));
})();

/* ---------- Carrusel genérico (.carousel con .carousel-track y .carousel-nav .dot) ---------- */
(function(){
  function initCarousel(root, onChange){
    const track = root.querySelector(".carousel-track");
    const prev  = root.querySelector(".arrowCircle.prev");
    const next  = root.querySelector(".arrowCircle.next");
    let dots    = [...root.querySelectorAll(".carousel-nav .dot")];
    let i=0, len = dots.length || (track?.children?.length||0);

    function paint(idx){
      if (!dots.length) return;
      dots.forEach((d,di)=>d.classList.toggle("active",di===idx));
    }
    function set(n){
      if(!track||!len) return;
      i=(n+len)%len;
      paint(i);
      track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
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

  // Vincula títulos .reel-title si existen en el mismo "scope" (para carouseles de imágenes/videos excepto reels)
  document.querySelectorAll(".carousel:not([id^='carouselReels'])").forEach(car=>{
    const sel = car.getAttribute("data-titles");
    let titles = null;
    if (sel) titles = [...document.querySelectorAll(sel)];
    else {
      const scope = car.closest(".card,.body,aside,section,div")||document;
      titles = [...scope.querySelectorAll(".reel-title")];
    }
    if(!titles?.length) titles=null;
    initCarousel(car, idx=>{ if(titles){ titles.forEach((t,i)=>t.classList.toggle("active",i===idx)); } });
  });
})();

/* ---------- Hard reset de scroll para .carouselX (evita “salto”) ---------- */
(function(){
  const tracks = document.querySelectorAll('.carouselX .track');
  if(!tracks.length) return;

  function forceStart(track){
    if(!track) return;
    const prev = track.style.scrollBehavior;
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = 0;
    requestAnimationFrame(()=>{ track.scrollLeft = 0; });
    setTimeout(()=>{ track.scrollLeft = 0; track.style.scrollBehavior = prev || ''; }, 80);
  }

  tracks.forEach(forceStart);
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch(_){}
  window.addEventListener('pageshow', (e)=>{ if (e.persisted) tracks.forEach(forceStart); });
  window.addEventListener('resize', ()=> tracks.forEach(forceStart));
})();

/* ---------- List slider (“¿Por qué usar…?”) ---------- */
(function(){
  document.querySelectorAll(".listSlider").forEach(w=>{
    const track=w.querySelector(".listTrack");
    const prev=w.querySelector(".arrowCircle.prev");
    const next=w.querySelector(".arrowCircle.next");
    if(!track||!prev||!next) return;
    let i=0, len=track.children.length;
    function go(n){
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      i=(n+len)%len; track.scrollTo({left:w.clientWidth*i,behavior:"smooth"});
    }
    prev.addEventListener("click",()=>go(i-1));
    next.addEventListener("click",()=>go(i+1));
    window.addEventListener("resize",()=>go(i));
  });
})();

/* ---------- Píldoras (filtros) ---------- */
(function(){
  const pills=[...document.querySelectorAll(".pill")];
  const cards=[...document.querySelectorAll(".feature-grid .fcard")];
  if(!pills.length||!cards.length) return;
  function apply(tag){ cards.forEach(card=>{ card.style.display = card.classList.contains("tag-"+tag) ? "" : "none"; }); }
  pills.forEach(p=>{
    p.addEventListener("click",()=>{
      pills.forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
      apply(p.dataset.filter);
    });
  });
  apply(pills[0]?.dataset.filter||"nomina");
})();

/* ---------- FAQ: solo uno abierto ---------- */
(function(){
  const wrap=document.getElementById("faqWrap");
  if(!wrap) return;
  [...wrap.querySelectorAll(".faq-item")].forEach(item=>{
    item.addEventListener("toggle",()=>{
      if(item.open){ [...wrap.querySelectorAll(".faq-item")].forEach(o=>{ if(o!==item) o.removeAttribute("open"); }); }
    });
  });
})();

/* ---------- Carrusel de sistemas (.carouselX) — Auto UI + FIX ---------- */
(function(){
  function ensureUI(root){
    // Flechas
    let prev = root.querySelector(".arrowCircle.prev");
    let next = root.querySelector(".arrowCircle.next");
    if(!prev){
      prev = document.createElement("button");
      prev.className = "arrowCircle prev"; prev.setAttribute("aria-label","Anterior");
      prev.innerHTML = '<span class="chev">‹</span>';
      root.appendChild(prev);
    }
    if(!next){
      next = document.createElement("button");
      next.className = "arrowCircle next"; next.setAttribute("aria-label","Siguiente");
      next.innerHTML = '<span class="chev">›</span>';
      root.appendChild(next);
    }
    // Dots
    let dotsWrap = root.querySelector(".group-dots");
    if(!dotsWrap){
      dotsWrap = document.createElement("div");
      dotsWrap.className = "group-dots";
      root.appendChild(dotsWrap);
    }
    return { prev, next, dotsWrap };
  }

  document.querySelectorAll(".carouselX").forEach(root=>{
    const track=root.querySelector(".track");
    if(!track) return;

    // Click en tarjetas
    const items=[...root.querySelectorAll(".sys")];
    items.forEach(it=>{
      it.setAttribute("role","link"); it.setAttribute("tabindex","0");
      const go=()=>{const href=it.getAttribute("data-href"); if(href) window.open(href,"_blank","noopener");};
      it.addEventListener("click",go);
      it.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } });
    });

    const { prev, next, dotsWrap } = ensureUI(root);

    const perView   = () => (window.innerWidth<=980 ? 1 : 3);
    const viewportW = () => track.clientWidth || root.clientWidth || 1;

    // Total de páginas basado en ancho scrolleable real
    const pageCount = () => Math.max(1, Math.ceil((track.scrollWidth - 1) / viewportW()));

    function buildDots(){
      dotsWrap.innerHTML="";
      const total = pageCount();
      const arr=[...Array(total)].map((_,j)=>{
        const b=document.createElement("button");
        b.className="dot"+(j===0?" active":"");
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

    let dots=buildDots(), idx=0;
    function paint(j){ dots.forEach((d,i)=>d.classList.toggle("active",i===j)); }

    function go(j){
      const total = pageCount();
      idx = ((j % total) + total) % total;

      // Calcula el primer ítem visible de esa página y alinea por offsetLeft
      const startIdx = Math.min(idx * perView(), items.length - 1);
      const first    = items[startIdx];

      // Si es la primera página, ancla a 0 para evitar offsets residuales
      let baseLeft = (idx === 0)
        ? 0
        : (first ? first.offsetLeft - (track.firstElementChild?.offsetLeft || 0) : idx * viewportW());

      const maxLeft = Math.max(0, track.scrollWidth - viewportW());
      const left    = Math.min(Math.max(0, baseLeft), maxLeft);

      track.scrollTo({left, behavior:"smooth"});
      paint(idx);
      toggleUI();
    }

    function toggleUI(){
      const multi=pageCount()>1;
      prev.style.display = multi ? "" : "none";
      next.style.display = multi ? "" : "none";
      dotsWrap.style.display = multi ? "" : "none";
    }

    prev.addEventListener("click",()=>{ if (window.pauseAllYTIframes) window.pauseAllYTIframes(); go(idx-1); });
    next.addEventListener("click",()=>{ if (window.pauseAllYTIframes) window.pauseAllYTIframes(); go(idx+1); });

    track.addEventListener("scroll",()=>{
      const i = Math.round(track.scrollLeft / viewportW());
      if(i !== idx){ idx=i; paint(idx); }
    });

    window.addEventListener("resize",()=>{
      const now = pageCount();
      if(dots.length !== now) dots = buildDots();
      setTimeout(()=>go(idx), 0); // re-alinea tras cambio de ancho
    });

    // Fuerza inicio en la primera página
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

    track.style.overflowX = "auto";
    track.style.scrollBehavior = "smooth";

    toggleUI(); go(0);
    setTimeout(()=> track.scrollTo({ left: 0, behavior: "auto" }), 50);
  });
})();

/* ---------- Reels (id^="carouselReels*") + pausa global de YouTube ---------- */
(function(){
  document.querySelectorAll('.carousel[id^="carouselReels"]').forEach(root=>{
    const scope  = root.closest('aside') || root;
    const track  = root.querySelector('.carousel-track');
    const slides = [...(track?.querySelectorAll('.carousel-slide')||[])];
    const dots   = [...root.querySelectorAll('.carousel-nav .dot')];
    const prev   = root.querySelector('.arrowCircle.prev');
    const next   = root.querySelector('.arrowCircle.next');
    const reelTitles = [...scope.querySelectorAll('.reel-title')];
    let idx = 0;

    const titles = slides.map(sl=>{
      const wrap = sl.querySelector('.reel-embed');
      const dt   = wrap?.dataset?.title || sl.dataset?.title || '';
      if (dt) return dt;
      const ifr = sl.querySelector('iframe');
      return ifr?.getAttribute('title') || '';
    });

    function paintUI(){
      dots.forEach((d,di)=>d.classList.toggle('active', di===idx));
      reelTitles.forEach((t)=>t.classList.remove('active'));
      if (reelTitles.length === 1){
        reelTitles[0].textContent = titles[idx] || reelTitles[0].textContent;
        reelTitles[0].classList.add('active');
      } else if (reelTitles.length >= 2){
        const nextIdx = (idx + 1) % titles.length;
        reelTitles[0].textContent = titles[idx]     || reelTitles[0].textContent;
        reelTitles[1].textContent = titles[nextIdx] || reelTitles[1].textContent;
        reelTitles[0].classList.add('active');
      }
    }

    function setActive(i){
      if (window.pauseAllYTIframes) window.pauseAllYTIframes();
      if(!dots.length || !slides.length) return;
      idx = (i + dots.length) % dots.length;
      const slideWidth = track.clientWidth || root.clientWidth || 1;
      track.scrollTo({ left: slideWidth * idx, behavior: 'smooth' });
      paintUI();
    }

    dots.forEach((d,i)=>d.addEventListener('click',()=>setActive(i)));
    prev?.addEventListener('click',()=>setActive(idx-1));
    next?.addEventListener('click',()=>setActive(idx+1));
    track?.addEventListener('scroll',()=>{
      const w = track.clientWidth || 1;
      const i = Math.round(track.scrollLeft / w);
      if(i !== idx && i >= 0 && i < dots.length){ idx = i; paintUI(); }
    });
    window.addEventListener('resize',()=>setActive(idx));
    setActive(0);
  });

  // Carga API YouTube si hace falta (para compatibilidad)
  if(!window.YT){
    const tag=document.createElement('script');
    tag.src="https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
  let players=[];
  const prevReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function(){
    if (typeof prevReady === 'function') { try{ prevReady(); }catch(_){} }
    document.querySelectorAll('iframe[src*="youtube"]').forEach((el)=>{
      try{
        const p=new YT.Player(el,{
          events:{ 'onStateChange':(e)=>{
            if(e.data===1){ players.forEach(pl=>{ if(pl!==p) pl.pauseVideo(); }); }
          }}
        });
        players.push(p);
      }catch(_){}
    });
  };
})();

/* === YouTube Embeds: normalizador + lazy (nocookie) ===================== */
(function(){
  const YT_PARAMS = "enablejsapi=1&rel=0&modestbranding=1&controls=1&fs=1";
  const selWrappers = [".reel-embed", ".yt-wrap"]; // 9:16 y 16:9 ya los tienes en CSS

  function toNoCookie(urlOrId){
    if (!urlOrId) return null;
    if (!/^(http|\/\/)/i.test(urlOrId)) return `https://www.youtube-nocookie.com/embed/${urlOrId}?${YT_PARAMS}`;
    try{
      const u = new URL(urlOrId, location.href);
      let id = u.searchParams.get("v");
      if (!id) {
        const m = u.pathname.match(/\/(embed|shorts)\/([^\/\?\&]+)/) || (u.hostname==="youtu.be" && u.pathname.match(/^\/([^\/\?\&]+)/));
        id = m && m[2] || m && m[1] || null;
      }
      return id ? `https://www.youtube-nocookie.com/embed/${id}?${YT_PARAMS}` : null;
    }catch(e){ return null; }
  }

  function normalizeExistingIframes(scope=document){
    scope.querySelectorAll("iframe[src*='youtube'], iframe[src*='youtu.be']").forEach(ifr=>{
      const newSrc = toNoCookie(ifr.getAttribute("src"));
      if (newSrc) ifr.src = newSrc;
      ifr.setAttribute("loading","lazy");
      ifr.setAttribute("allow","accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      ifr.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
      ifr.allowFullscreen = true;
      ifr.removeAttribute("width"); ifr.removeAttribute("height"); ifr.style.width=""; ifr.style.height="";
    });
  }

  function mountLazyEmbed(wrapper){
    if (wrapper.dataset.ytMounted) return;
    const ytid = wrapper.getAttribute("data-ytid");
    if (!ytid) return;
    wrapper.dataset.ytMounted = "1";

    const thumb = new Image();
    thumb.src = `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`;
    thumb.alt = "Video thumbnail";
    thumb.style.display="block";
    thumb.style.width="100%";
    thumb.style.height="100%";
    thumb.style.objectFit="cover";

    const play = document.createElement("button");
    play.type="button";
    play.setAttribute("aria-label","Reproducir video");
    Object.assign(play.style,{
      position:"absolute", inset:"0", margin:"auto", width:"64px", height:"64px",
      borderRadius:"50%", border:"0", cursor:"pointer", background:"rgba(0,0,0,.55)"
    });
    const tri = document.createElement("div");
    Object.assign(tri.style,{
      margin:"auto", width:0, height:0, borderTop:"12px solid transparent",
      borderBottom:"12px solid transparent", borderLeft:"20px solid white",
      transform:"translateX(4px)"
    });
    play.appendChild(tri);

    const ph = document.createElement("div");
    Object.assign(ph.style,{position:"relative", width:"100%", height:"100%", borderRadius:"12px", overflow:"hidden"});
    ph.appendChild(thumb); ph.appendChild(play);
    wrapper.appendChild(ph);

    function loadIframe(){
      if (window.pauseAllYTIframes) window.pauseAllYTIframes(); // 👈 pausa lo anterior
      if (wrapper.querySelector("iframe")) return;
      const iframe = document.createElement("iframe");
      iframe.src = toNoCookie(ytid);
      iframe.title = wrapper.getAttribute("data-title") || "YouTube video";
      iframe.setAttribute("frameborder","0");
      iframe.setAttribute("allow","accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("loading","lazy");
      iframe.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
      iframe.allowFullscreen = true;
      Object.assign(iframe.style,{position:"absolute", inset:"0", width:"100%", height:"100%"});
      wrapper.innerHTML="";
      wrapper.appendChild(iframe);
    }

    play.addEventListener("click", loadIframe, {once:true});

    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if (e.isIntersecting) { loadIframe(); io.disconnect(); } });
    }, {root:null, rootMargin:"200px", threshold:0.01});
    io.observe(wrapper);
  }

  function initYouTubeEmbeds(scope=document){
    normalizeExistingIframes(scope);
    selWrappers.forEach(sel=>{
      scope.querySelectorAll(`${sel}[data-ytid]`).forEach(mountLazyEmbed);
    });
  }

  function postToYT(iframe, cmd){ try{ iframe.contentWindow.postMessage(JSON.stringify(cmd), "*"); }catch(e){} }
  function pauseAllYTIframes(scope=document){
    scope.querySelectorAll("iframe[src*='youtube-nocookie.com/embed/']").forEach(ifr=>{
      postToYT(ifr, {event:"command", func:"pauseVideo", args:""});
    });
  }

  window.initYouTubeEmbeds = initYouTubeEmbeds;
  window.pauseAllYTIframes = pauseAllYTIframes;

  document.addEventListener("DOMContentLoaded", ()=> initYouTubeEmbeds());
})();

/* =========================================================
   Complementos calculadora ESCRITORIO: 2º/3º sistema + resumen
   ========================================================= */
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    // Solo para ESCRITORIO
    const app = document.getElementById('app');
    const PRIMARY = app?.dataset?.system?.trim();
    if (!PRIMARY) return;

    const moneyMX = new Intl.NumberFormat("es-MX", { style:"currency", currency:"MXN", maximumFractionDigits:0 });
    const fmt = v => moneyMX.format(Math.round(Number(v||0)));
    const hasPrices = name => !!(window.preciosContpaqi && window.preciosContpaqi[name]);

    // Catálogo de sistemas para el picker (ajusta rutas si hace falta)
    window.CATALOG_SISTEMAS = window.CATALOG_SISTEMAS || [
      { name: "CONTPAQi Contabilidad",       img: "../IMG/contabilidad.webp" },
      { name: "CONTPAQi Bancos",             img: "../IMG/bancos.webp" },
      { name: "CONTPAQi Nóminas",            img: "../IMG/nominas.webp" },
      { name: "CONTPAQi XML en Línea",       img: "../IMG/xml.webp",  noDiscount: true },
      { name: "CONTPAQi Comercial PRO",      img: "../IMG/comercialpro.webp" },
      { name: "CONTPAQi Comercial PREMIUM",  img: "../IMG/comercialpremium.webp" },
      { name: "CONTPAQi Factura Electrónica",img: "../IMG/factura.webp" }
    ];

    function getPrecioDesde(systemName){
      const db = (window.preciosContpaqi && window.preciosContpaqi[systemName]) || null;
      if(!db) return null;
      if (db.anual?.MultiRFC?.precio_base || db.anual?.MultiRFC?.renovacion)
        return Number(db.anual.MultiRFC.precio_base || db.anual.MultiRFC.renovacion || 0);
      if (db.anual?.MonoRFC?.precio_base || db.anual?.MonoRFC?.renovacion)
        return Number(db.anual.MonoRFC.precio_base || db.anual.MonoRFC.renovacion || 0);
      if (db.tradicional?.actualizacion?.precio_base)
        return Number(db.tradicional.actualizacion.precio_base);
      return null;
    }

    function renderSistemasPicker(containerId, exclude = new Set(), activeName = null){
      const wrap = document.getElementById(containerId);
      if(!wrap) return;
      wrap.innerHTML = "";
      if (PRIMARY) exclude.add(PRIMARY);

      window.CATALOG_SISTEMAS.forEach(item=>{
        if (exclude.has(item.name)) return;
        const precio = getPrecioDesde(item.name);
        const btn = document.createElement("button");
        btn.className = "sys-icon";
        btn.type = "button";
        btn.dataset.sys = item.name;
        btn.title = item.name;
        btn.innerHTML = `
          ${item.noDiscount ? '<small class="sin15">sin -15%</small>' : ''}
          <img src="${item.img}" alt="${item.name}">
          <strong>${item.name.replace('CONTPAQi ','')}</strong>
          <small class="sys-price">${precio != null ? 'desde '+fmt(precio) : 'precio no disp.'}</small>
        `;
        if (activeName && activeName === item.name) btn.classList.add('active');
        wrap.appendChild(btn);
      });
    }

    function renderCombinedTable(rows){
      const wrap=document.getElementById('combined-wrap');
      const tbody=document.getElementById('combined-table-body');
      if(!wrap||!tbody) return;
      tbody.innerHTML='';
      rows.forEach(([concepto, importe])=>{
        const tr=document.createElement('tr');
        const td1=document.createElement('td'); td1.textContent=concepto;
        const td2=document.createElement('td'); td2.textContent=importe; td2.style.textAlign='right';
        tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
      });
      wrap.hidden=false;
    }

    const row   = document.getElementById('calc-row');
    const slot2 = document.getElementById('calc-slot-2') || document.getElementById('calc-secondary');
    const slot3 = document.getElementById('calc-tertiary');
    const addMore = document.getElementById('add-more-panel');
    const pick2 = document.getElementById('icons-sec-sys');
    const pick3 = document.getElementById('icons-third-sys');
    if(!row) return;

    const selected = { secondary: null, tertiary: null };
    const selectedSet = ()=> new Set([selected.secondary, selected.tertiary].filter(Boolean));

    // Render inicial pickers
    const initialExclude = new Set(PRIMARY ? [PRIMARY] : []);
    renderSistemasPicker("icons-sec-sys", initialExclude);
    renderSistemasPicker("icons-third-sys", initialExclude);

    function refreshPickers(){
      const ex = selectedSet();
      if(PRIMARY) ex.add(PRIMARY);
      renderSistemasPicker("icons-sec-sys", ex, selected.secondary);
      renderSistemasPicker("icons-third-sys", ex, selected.tertiary);
    }
    function showAddMoreIfReady(){
      if(addMore) addMore.style.display = selected.secondary ? '' : 'none';
    }

    // Secundaria
    pick2?.addEventListener('click', e=>{
      const btn=e.target.closest('.sys-icon'); if(!btn) return;
      const sys=btn.dataset.sys; if(!hasPrices(sys)) return;
      selected.secondary = sys;
      selected.tertiary  = selected.tertiary === sys ? null : selected.tertiary;

      if (slot2 && slot2.id === 'calc-slot-2') { slot2.className='calc-container'; slot2.id='calc-secondary'; }

      if (window.CalculadoraContpaqi?.setSecondarySystem){
        window.CalculadoraContpaqi.setSecondarySystem(sys,{
          secondarySelector:'#calc-secondary',
          combinedSelector:'#combined-wrap',
          onCombined:renderCombinedTable
        });
      }
      refreshPickers();
      showAddMoreIfReady();
    });

    // Terciaria
    pick3?.addEventListener('click', e=>{
      const btn=e.target.closest('.sys-icon'); if(!btn) return;
      const sys=btn.dataset.sys; if(!hasPrices(sys)) return;
      if (sys === selected.secondary) return;
      selected.tertiary = sys;
      if (slot3) slot3.style.display='block';

      if (window.CalculadoraContpaqi?.setTertiarySystem){
        window.CalculadoraContpaqi.setTertiarySystem(sys,{
          tertiarySelector:'#calc-tertiary',
          combinedSelector:'#combined-wrap',
          onCombined:renderCombinedTable
        });
      }
      if(addMore) addMore.style.display='none';
      row.classList.add('has-three');
      refreshPickers();
    });

    if (window.CalculadoraContpaqi?.onCombinedSet){
      window.CalculadoraContpaqi.onCombinedSet(renderCombinedTable);
    }

    // Inicializa la calculadora ESCRITORIO principal
    if (window.CalculadoraContpaqi?.init){
      document.body.setAttribute('data-calc','escritorio');
      window.CalculadoraContpaqi.init({
        systemName: PRIMARY,
        primarySelector: '#calc-primary',
        combinedSelector:'#combined-wrap'
      });
    } else {
      console.warn('CalculadoraContpaqi.init no disponible (asegura calculadora.js?v=13)');
    }
  });
})();

/* =========================================================
   Compactador + Unión “Instalación + Servicios (opcional)”
   (No altera la v13 moderna, solo legacy si aparece)
   ========================================================= */
(function () {
  function pickByLabel(container, regex){
    const labels = [...container.querySelectorAll('label')];
    const lb = labels.find(l => regex.test((l.textContent||'').trim().toLowerCase()));
    if (!lb) return null;
    return lb.closest('.field') || lb.closest('.row') || lb.closest('.instalacion-box') || lb.closest('.inst-wrap') || lb.parentElement;
  }
  function pickSelect(container, selectorList){
    for(const sel of selectorList){
      const el = container.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function compactar(container){
    if (!container) return;

    // ⛔️ Si es la calculadora moderna v13, no reordenamos nada.
    if (container.querySelector('form.calc-form')) return;

    // Si ya existe la grilla compactada previa, solo une instalación+servicios y sal.
    if (container.querySelector('.controls-grid')) {
      unirInstalacionServicios(container);
      return;
    }

    // detectar bloques por label
    const bLic = pickByLabel(container, /^licencia/);
    const bTipo= pickByLabel(container, /^tipo/);
    const bUsu = pickByLabel(container, /^usuarios?/);

    let bInst = container.querySelector('.inst-wrap') || pickByLabel(container, /instalaci/);
    if (!bInst) {
      const anyChk = container.querySelector('input[type="checkbox"]');
      bInst = anyChk ? (anyChk.closest('.instalacion-box') || anyChk.closest('.field') || anyChk.parentElement) : null;
    }

    const bloques = [bLic, bTipo, bUsu, bInst].filter(Boolean);
    bloques.forEach(b => b?.classList?.add('field'));
    if (!bLic || !bTipo || !bUsu || !bInst) return;

    const grid = document.createElement('div');
    grid.className = 'controls-grid';
    grid.append(bLic, bTipo, bUsu, bInst);
    container.insertBefore(grid, container.firstElementChild);

    // Une instalación + servicios si aplica
    unirInstalacionServicios(container);
  }

  function unirInstalacionServicios(container){
    if (!container) return;
    if (container.querySelector('.inst-wrap .instalacion-box')) return;

    const selInst = pickSelect(container, [
      'select#instalacion',
      'select[name*="instal"]',
      'select[data-field*="instal"]'
    ]);
    const selServ = pickSelect(container, [
      'select#servicios', 'select#ervicios',
      'select[name*="servi"]',
      'select[data-field*="servi"]'
    ]);

    if (!selInst || !selServ) return;
    if (selInst.closest('.instalacion-box') || selServ.closest('.instalacion-box')) return;

    let wrap = container.querySelector('.inst-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'inst-wrap';
      const form = selInst.closest('form') || container.querySelector('form') || container;
      form.appendChild(wrap);
    }
    const box = document.createElement('div');
    box.className = 'instalacion-box';

    const instLbl = (selInst.labels && selInst.labels[0]) ? selInst.labels[0] : null;
    const servLbl = (selServ.labels && selServ.labels[0]) ? selServ.labels[0] : null;

    if (instLbl) box.appendChild(instLbl);
    box.appendChild(selInst);
    if (servLbl) box.appendChild(servLbl);
    box.appendChild(selServ);

    wrap.appendChild(box);

    if (!wrap.querySelector('.inst-hint')) {
      const hint = document.createElement('small');
      hint.className = 'inst-hint';
      hint.textContent = 'Selecciona instalación y servicios en un solo paso.';
      wrap.appendChild(hint);
    }
  }

  const target = document.getElementById('calc-primary');
  if (!target) return;

  const tryCompact = () => {
    const container = document.querySelector('.calc-container') || target;
    if (!container) return;
    if (container.querySelector('form.calc-form')) return; // v13: no tocar
    compactar(container);
  };

  tryCompact();
  requestAnimationFrame(tryCompact);

  const mo = new MutationObserver(() => tryCompact());
  mo.observe(target, { childList: true, subtree: true });

  window.addEventListener('calc-recompute', tryCompact);
  window.addEventListener('calc-render', tryCompact);

  setTimeout(tryCompact, 500);
  setTimeout(tryCompact, 1200);
})();

/* =========================================================
   🧭 Expiriti – AutoDiag Carruseles / Listas Horizontales
   ========================================================= */
(function(){
  const selectors = [".carouselX .track", ".icons-wrap"];
  const found = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));

  found.forEach((el, i) => {
    const cs = getComputedStyle(el);
    const name = el.className || el.id || `track#${i}`;
    const warn = (msg, val) => console.warn(`⚠️ [${name}] ${msg}`, val);

    if (el.scrollWidth <= el.clientWidth + 2)
      warn("No tiene scroll real (scrollWidth ≈ clientWidth)", {scrollWidth: el.scrollWidth, clientWidth: el.clientWidth});

    if ((cs.scrollSnapType && cs.scrollSnapType !== "none") || el.style.scrollSnapType)
      warn("scroll-snap-type activo → puede bloquear el primer item", cs.scrollSnapType);

    if (cs.justifyContent.includes("center"))
      warn("justify-content:center detectado → puede impedir scroll hacia la izquierda", cs.justifyContent);

    if (cs.direction === "rtl")
      warn("direction:rtl detectado → puede invertir o romper scrollLeft", cs.direction);

    const rect = el.getBoundingClientRect();
    const probe = document.elementsFromPoint(rect.left + 10, rect.top + rect.height/2);
    const blocker = probe.find(n => n !== el && !el.contains(n) && getComputedStyle(n).pointerEvents !== "none");
    if (blocker)
      warn("Elemento sobre la orilla izquierda (posible overlay con z-index alto)", blocker);

    if (el.scrollLeft > 5)
      warn("scrollLeft inicial ≠ 0", el.scrollLeft);

    el._diagFix = {
      noSnap: () => { el.style.scrollSnapType="none"; el.querySelectorAll("*").forEach(n=>n.style.scrollSnapAlign="none"); console.log(`✅ Snap desactivado en ${name}`); },
      flexStart: () => { el.style.justifyContent="flex-start"; console.log(`✅ justify-content:flex-start aplicado en ${name}`); },
      forceLTR: () => { el.style.direction="ltr"; console.log(`✅ direction:ltr aplicado en ${name}`); },
      resetScroll: () => { el.scrollTo({left:0,behavior:"auto"}); console.log(`✅ scrollLeft restablecido en ${name}`); }
    };
  });
})();

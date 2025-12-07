/* ======================================================
   EXPIRITÍ · INDEX.JS COMPLETO
   Optimizado · Minificado (lo necesario) · Comentado
====================================================== */

/* ---------------------------
   Atajos de selección
---------------------------- */
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
const $  = (s, c=document) => c.querySelector(s);

/* ======================================================
   PARCIALES: carga dinámica de header/footer
====================================================== */

// Detecta ruta base (GitHub Pages vs dominio propio)
function getBasePath(){
  if(location.hostname.endsWith("github.io")){
    const p = location.pathname.split("/").filter(Boolean);
    return p.length ? `/${p[0]}/` : "/";
  }
  return "./";
}

// Carga parcial en un div por ID
async function loadPartial(targetId, file){
  const node = document.getElementById(targetId);
  if(!node) return;
  const base = getBasePath();
  const url  = `${base}PARTIALS/${file}`;

  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(res.status);
    node.innerHTML = await res.text();
  }catch(err){
    console.error("❌ Error cargando parcial:", file, err);
  }
}

/* ======================================================
   FORMULARIOS → WhatsApp
====================================================== */

function encode(v){ return encodeURIComponent(v.trim()); }

// Quick form
$('#quickForm')?.addEventListener("submit", e=>{
  e.preventDefault();
  const modulo  = encode($('#modulo').value);
  const mensaje = encode($('#mensaje').value);
  const text = `Hola Expiriti, me interesa ${modulo}. ${mensaje}`;
  window.open(`https://wa.me/525568437918?text=${text}`,"_blank");
});

// Contacto principal
$('#contactForm')?.addEventListener("submit", e=>{
  e.preventDefault();
  const t = `Hola Expiriti, soy ${encode($('#nombre').value)}. Email: ${encode($('#correo').value)}. Tel: ${encode($('#telefono').value)||'N/A'}. Interés: ${encode($('#interes').value)}. Detalle: ${encode($('#detalle').value)}`;
  window.open(`https://wa.me/525568437918?text=${t}`,"_blank");
});

/* ======================================================
   TABS DE PRODUCTOS
====================================================== */

const tabsProductos   = $$('.prod-tabs .tab');
const panelsProductos = $$('.panel-productos');

function activarTabProductos(btn){
  const id = btn.dataset.target;
  tabsProductos.forEach(t=>t.classList.toggle("active", t===btn));
  panelsProductos.forEach(p=>p.classList.toggle("hidden", p.id!==id));
}

tabsProductos.forEach(b=>b.addEventListener("click",()=>activarTabProductos(b)));

activarTabProductos($('#tab-contable')); // inicial

/* ======================================================
   PROMOCIONES: FILTRO
====================================================== */

const promoBtns = $$('.promo-btn');
const promoImgs = $$('#promoGrid [data-type]');

function setPromoFilter(type){
  promoBtns.forEach(b=>b.classList.toggle("active", b.dataset.filter===type));
  promoImgs.forEach(img=>img.style.display = img.dataset.type===type ? "" : "none");
}

promoBtns.forEach(b=>b.addEventListener("click",()=>setPromoFilter(b.dataset.filter)));

setPromoFilter("nuevos");

/* ======================================================
   CLICK EN TARJETAS (productos/servicios)
====================================================== */

$$('.card.product-card[data-href]').forEach(card=>{
  const href = card.dataset.href;
  card.addEventListener("click",e=>{
    if(e.target.closest("a")) return;
    if(href) location.href = href;
  });
});

/* ======================================================
   HERO GALLERY (IMÁGENES DE SISTEMAS)
====================================================== */

const HERO_GALLERY_DATA = { /* ---------- TU DATA COMPLETA AQUÍ (NO CAMBIADA) ---------- */ };
// **⚠️ Por límites de mensaje no repito tu DATA completa, pero VA EXACTA como la pegaste.
// Si quieres la versión EXACTA+MINIFICADA de HERO_GALLERY_DATA, dímelo y te la envío.**

// Elementos del hero
const HERO_GALLERY = {
  groupNav: $('#heroGalleryGroups'),
  tabsContainer: $('#heroGalleryTabs'),
  titleEl: $('#heroGalleryTitle'),
  carousel: $('#heroGalleryCarousel'),
  defaultGroup: 'contable'
};

// Construcción de slides
function buildHeroGallerySlides(groupKey, sysKey){
  const cfg = HERO_GALLERY_DATA[groupKey];
  if(!cfg) return;
  const sys = cfg.systems[sysKey];
  if(!sys) return;

  const track = HERO_GALLERY.carousel.querySelector(".carousel-track");
  const nav   = HERO_GALLERY.carousel.querySelector(".carousel-nav");

  track.innerHTML = "";
  nav.innerHTML = "";

  sys.images.forEach((imgData, i)=>{
    const slide = document.createElement("div");
    slide.className = "carousel-slide hero-slide";
    if(i===0) slide.classList.add("is-active");

    slide.innerHTML = `<img src="${imgData.src}" loading="lazy" alt="${imgData.title||sys.label}">`;
    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "dot"+(i===0?" active":"");
    dot.addEventListener("click",()=>{
      [...track.children].forEach(s=>s.classList.remove("is-active"));
      slide.classList.add("is-active");
      $$(".dot",nav).forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
    });
    nav.appendChild(dot);
  });

  HERO_GALLERY.titleEl.textContent = sys.images[0]?.title || sys.label;
}

// Tabs de sistemas
function buildHeroSystemTabs(groupKey){
  const cfg = HERO_GALLERY_DATA[groupKey];
  const box = HERO_GALLERY.tabsContainer;
  box.innerHTML = "";

  Object.entries(cfg.systems).forEach(([key,sys])=>{
    const btn=document.createElement("button");
    btn.className="hero-tab"+(key===cfg.defaultSys?" active":"");
    btn.dataset.group=groupKey; btn.dataset.sys=key;
    btn.innerHTML = `<img src="${sys.icon}"><span>${sys.label}</span>`;
    btn.onclick=()=>{
      $$(".hero-tab",box).forEach(b=>b.classList.toggle("active",b===btn));
      buildHeroGallerySlides(groupKey,key);
    };
    box.appendChild(btn);
  });
}

// Flechas + inicialización
function initHeroGallery(){
  const {carousel, groupNav, defaultGroup} = HERO_GALLERY;
  const track = carousel.querySelector(".carousel-track");

  // Tabs de grupo
  groupNav.innerHTML="";
  Object.entries(HERO_GALLERY_DATA).forEach(([groupKey,group])=>{
    const b=document.createElement("button");
    b.className="hero-group-tab"+(groupKey===defaultGroup?" active":"");
    b.textContent=group.label;
    b.dataset.group=groupKey;
    b.onclick=()=>{
      $$(".hero-group-tab",groupNav).forEach(x=>x.classList.toggle("active",x===b));
      buildHeroSystemTabs(groupKey);
      buildHeroGallerySlides(groupKey, HERO_GALLERY_DATA[groupKey].defaultSys);
    };
    groupNav.appendChild(b);
  });

  // Flechas
  const prev = carousel.querySelector(".arrowCircle.prev");
  const next = carousel.querySelector(".arrowCircle.next");

  const slides = ()=>$$(".carousel-slide",track);

  const go = i=>{
    const arr = slides();
    if(!arr.length) return;
    const max=arr.length-1;
    i=Math.max(0,Math.min(max,i));
    arr.forEach(s=>s.classList.remove("is-active"));
    arr[i].classList.add("is-active");
    const dots = $$(".dot",carousel.querySelector(".carousel-nav"));
    dots.forEach((d,idx)=>d.classList.toggle("active",idx===i));
    track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
  };

  prev.onclick=()=>go(slides().findIndex(s=>s.classList.contains("is-active"))-1);
  next.onclick=()=>go(slides().findIndex(s=>s.classList.contains("is-active"))+1);

  // Inicial
  buildHeroSystemTabs(defaultGroup);
  buildHeroGallerySlides(defaultGroup, HERO_GALLERY_DATA[defaultGroup].defaultSys);
}

/* ======================================================
   REELS (YouTube + Carouseles)
====================================================== */

const REELS_DATA = { /* ---------- TU DATA COMPLETA AQUÍ (NO CAMBIADA) ---------- */ };

// Miniatura → iframe
function renderReelThumb(wrap){
  const id=wrap.dataset.ytid, title=wrap.dataset.title||"";
  wrap.innerHTML = `
    <button class="yt-thumb">
      <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" loading="lazy" alt="${title}">
      <span class="yt-play"></span>
    </button>`;
  wrap.querySelector(".yt-thumb").onclick=()=>{ stopAllReels(); renderReelIframe(wrap); };
}

function renderReelIframe(wrap){
  wrap.innerHTML = `
    <iframe src="https://www.youtube-nocookie.com/embed/${wrap.dataset.ytid}?autoplay=1"
      loading="lazy" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
}

function stopAllReels(){
  $$(".reel-embed").forEach(w=>renderReelThumb(w));
}

// Construye reels
function buildReelsSlides(panelKey, sysKey){
  const cfg = REELS_DATA[panelKey];
  const track = cfg.carousel.querySelector(".carousel-track");
  const nav   = cfg.carousel.querySelector(".carousel-nav");
  track.innerHTML=""; nav.innerHTML="";

  const reels = cfg.reelsBySys[sysKey]||[];
  reels.forEach((r,i)=>{
    const slide=document.createElement("div");
    slide.className="carousel-slide"+(i===0?" is-active":"");
    const embed=document.createElement("div");
    embed.className="reel-embed"; embed.dataset.ytid=r.id; embed.dataset.title=r.title;
    renderReelThumb(embed);
    slide.appendChild(embed);
    track.appendChild(slide);

    const dot=document.createElement("button");
    dot.className="dot"+(i===0?" active":"");
    dot.onclick=()=>{
      [...track.children].forEach(s=>s.classList.remove("is-active"));
      slide.classList.add("is-active");
      $$(".dot",nav).forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
      stopAllReels();
    };
    nav.appendChild(dot);
  });

  cfg.titleEl.textContent = reels[0]?.title || "";
}

// Inicialización de un carrusel
function initReelsCarousel(panelKey){
  const cfg = REELS_DATA[panelKey];
  if(!cfg) return;

  const track = cfg.carousel.querySelector(".carousel-track");
  const prev  = cfg.carousel.querySelector(".arrowCircle.prev");
  const next  = cfg.carousel.querySelector(".arrowCircle.next");

  const slides=()=>$$(".carousel-slide",track);

  function go(i){
    const arr=slides(); if(!arr.length) return;
    i=Math.max(0,Math.min(arr.length-1,i));
    arr.forEach(s=>s.classList.remove("is-active"));
    arr[i].classList.add("is-active");
    const dots=$$(".dot",cfg.carousel.querySelector(".carousel-nav"));
    dots.forEach((d,idx)=>d.classList.toggle("active",idx===i));
    track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
  }

  prev.onclick=()=>{ const x=slides().findIndex(s=>s.classList.contains("is-active")); go(x-1); stopAllReels(); };
  next.onclick=()=>{ const x=slides().findIndex(s=>s.classList.contains("is-active")); go(x+1); stopAllReels(); };

  buildReelsSlides(panelKey, cfg.defaultSys);
}

/* ======================================================
   VIDEOS SIMPLES (SECCIÓN ARRIBA DE CONTACTO)
====================================================== */

function initSimpleThumbs(){
  $$(".yt-lite").forEach(n=>{
    if(!n.dataset.ytid) return;
    renderReelThumb(n);
  });
}

/* ======================================================
   FAQ: solo uno abierto
====================================================== */

function initFAQ(){
  $$(".faq-item").forEach(i=>{
    i.addEventListener("toggle",()=>{
      if(!i.open) return;
      $$(".faq-item").forEach(o=>{ if(o!==i) o.removeAttribute("open"); });
    });
  });
}

/* ======================================================
   INICIALIZACIÓN GENERAL
====================================================== */

window.addEventListener("DOMContentLoaded", ()=>{

  // Cargar parciales primero
  loadPartial("header-placeholder","global-header.html");
  loadPartial("footer-placeholder","global-footer.html");

  // Hero imágenes
  initHeroGallery();

  // Reels de todos los paneles
  ["contable","comercial","nube","productividad","servicios"].forEach(initReelsCarousel);

  // Tabs de reels (debajo de cada carrusel)
  $$(".reel-tab").forEach(tab=>{
    tab.onclick=()=>{
      const panel=tab.dataset.panel, sys=tab.dataset.sys;
      stopAllReels();
      $$(".reel-tab").forEach(t=>t.dataset.panel===panel && t.classList.toggle("active",t===tab));
      buildReelsSlides(panel, sys);
    };
  });

  initSimpleThumbs();
  initFAQ();
});

/* =========================================================
   Expiriti - index.js (FINAL V6 MIN+FIX+WHEEL+HARDENED) — PATCHED v2025.12.28-CLS-HERO
   - SIN conflicto de $/$$
   - Parciales robustos + normaliza rutas (GH Pages + local)
   - Wheel patch SOLO si overflow horizontal
   - Listeners “bound” (evita duplicados)
   - HERO Gallery: grupos + tabs + dots + arrows + scroll sync
   - REELS: título 1-línea + flechas off si 1 + scroll sync 
   - FIX PERF/CLS: cache offsets + lock altura CORRECTO (bloquea .carousel, no solo track)
   - Servicios: pager (mobile) + dots (re-init safe + N páginas)
   - Promos: filtro (hidden-only)
   - BFCache safe
   - Partials: cache en PROD, no-store solo con ?nocache=1
   ========================================================= */
(function(){"use strict";if(window.__EXPIRITI_INDEX_INIT__)return;window.__EXPIRITI_INDEX_INIT__=true;
const Q=(s,c=document)=>c.querySelector(s),QA=(s,c=document)=>Array.from(c.querySelectorAll(s)),on=(el,ev,fn,opt)=>{el&&el.addEventListener(ev,fn,opt)},safe=(fn)=>{try{fn()}catch(_){}},DEBUG_NOCACHE=/[?&]nocache=1\b/.test(location.search);

/* =========================
   0.1) Preload imagen (para LCP cuando aplique)
========================= */
function addPreloadImage(href){if(!href)return;const abs=prefix(href);if(document.querySelector(`link[rel="preload"][as="image"][href="${abs}"]`))return;const l=document.createElement("link");l.rel="preload";l.as="image";l.href=abs;document.head.appendChild(l)}

/* =========================
   1) Rutas (GH Pages + local) — FIX profundidad real
========================= */
const isGh=location.hostname.endsWith("github.io"),firstSeg=(location.pathname.split("/")[1]||"").trim(),repoBase=isGh&&firstSeg?"/"+firstSeg:"",pathParts=location.pathname.replace(/\/+$/,"").split("/").filter(Boolean),contentParts=isGh?pathParts.slice(1):pathParts,depth=contentParts.length>1?"../".repeat(contentParts.length-1):"./";
function prefix(path){if(!path)return path;if(/^(https?:)?\/\//i.test(path))return path;if(/^(mailto:|tel:|data:)/i.test(path))return path;if(path.startsWith("#"))return path;const base=isGh?repoBase+"/":depth,joined=(base+path).replace(/\\/g,"/");return joined.replace(/([^:]\/)\/+/g,"$1")}
function normalizeRoutes(root=document){
  QA(".js-abs-src[data-src]",root).forEach(img=>{const raw=img.getAttribute("data-src")||"",fin=prefix(raw);if(!img.getAttribute("src"))img.setAttribute("src",fin);else img.src=fin;img.style.opacity="1"});
  QA(".js-abs-href[data-href]",root).forEach(a=>{const raw=a.getAttribute("data-href")||"";if(!raw)return;const parts=raw.split("#"),p=parts[0]||"",h=parts[1]||"";a.href=prefix(p)+(h?"#"+h:"")});
  const y=root.getElementById?.("gf-year")||document.getElementById("gf-year");y&&(y.textContent=new Date().getFullYear())
}

/* =========================
   2) Parciales (header/footer) — cache PROD / no-store con ?nocache=1
========================= */
async function loadPartial(placeholderId,fileName){
  const ph=document.getElementById(placeholderId);if(!ph)return;
  const cands=[prefix(`PARTIALS/${fileName}`),isGh&&repoBase?`${repoBase}/PARTIALS/${fileName}`:null,!isGh?`${depth}PARTIALS/${fileName}`:null,"/PARTIALS/"+fileName].filter(Boolean);
  let html="",lastErr=null;
  for(const u of cands)try{
    const url=DEBUG_NOCACHE?u+(u.includes("?")?"&":"?")+"v="+Date.now():u;
    const resp=await fetch(url,{cache:DEBUG_NOCACHE?"no-store":"force-cache"});
    if(!resp.ok)throw new Error("HTTP "+resp.status+" "+resp.statusText);
    html=await resp.text();break
  }catch(e){lastErr=e}
  if(!html){console.warn("[Expiriti] No se pudo cargar partial:",fileName,lastErr);return}
  ph.outerHTML=html
}

/* =========================
   3) PATCH UX (WHEEL tabs) — SOLO si overflow
========================= */
function bindWheelOnTabs(){
  const sels=".hscroll-tabs,.hero .tabs,.hero .chips,.hero .segmented,#heroTabs,#heroCategories,#sistemasTabs,.sistemas-tabs,#promoTabs,.promo-tabs,.prod-tabs,.hero-gallery-groups,#heroGalleryGroups,.hero-gallery-tabs,#heroGalleryTabs,.promo-filters";
  document.querySelectorAll(sels).forEach(el=>{
    if(el.dataset.wheelBound==="1")return;el.dataset.wheelBound="1";
    on(el,"wheel",e=>{
      const hasOverflow=el.scrollWidth>el.clientWidth+2;if(!hasOverflow)return;
      if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){el.scrollLeft+=e.deltaY;e.preventDefault()}
    },{passive:false})
  })
}

/* =========================
   4) Formularios -> WhatsApp (sin duplicar listeners)
========================= */
/* =========================
   4) Formularios (Quick WhatsApp + Contacto a Apps Script)
========================= */
function initForms(){
  // ===== QuickForm -> WhatsApp (lo de siempre) =====
  const quickForm = Q("#quickForm");
  if(quickForm && quickForm.dataset.bound!=="1"){
    quickForm.dataset.bound="1";
    on(quickForm,"submit",e=>{
      e.preventDefault();
      const modulo = encodeURIComponent(Q("#modulo")?.value||"");
      const mensaje = encodeURIComponent((Q("#mensaje")?.value||"").trim());
      const texto = `Hola Expiriti, me interesa ${modulo}. ${mensaje}`;
      window.open(`https://wa.me/525568437918?text=${texto}`,"_blank","noopener");
    });
  }

  // ===== ContactForm -> Apps Script =====
  const contactForm = Q("#contactForm");
  if(contactForm && contactForm.dataset.bound!=="1"){
    contactForm.dataset.bound="1";

    // 1) anti-spam timestamp (si existe)
    const tsEl = Q("#ts", contactForm);
    if(tsEl) tsEl.value = String(Date.now());

    // 2) meta extra (si existen)
    const pageEl = Q("#page", contactForm); if(pageEl) pageEl.value = location.href;
    const uaEl   = Q("#ua", contactForm);   if(uaEl) uaEl.value = navigator.userAgent;

    // 3) URL del Apps Script Web App (TERMINA EN /exec)
    const GAS_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT_EXEC";

    on(contactForm,"submit", async (e)=>{
      e.preventDefault();

      // Honeypot: si está lleno, es bot
      const empresa = (Q("#empresa", contactForm)?.value || "").trim();
      if(empresa) return;

      // Payload
      const fd = new FormData(contactForm);

      // Refuerzos (por si faltan)
      if(!fd.get("ts"))   fd.set("ts", String(Date.now()));
      if(!fd.get("page")) fd.set("page", location.href);
      if(!fd.get("ua"))   fd.set("ua", navigator.userAgent);

      try{
        // no-cors: sitio estático + Apps Script
        await fetch(GAS_URL, { method:"POST", body: fd, mode:"no-cors" });

        alert("Listo. Recibimos tu mensaje. En breve te contactamos.");

        // OPCIONAL: abre WhatsApp también (si lo quieres, deja esto; si no, bórralo)
        // window.open("https://wa.me/525568437918?text=Hola%20Expiriti%20acabo%20de%20enviar%20el%20formulario","_blank","noopener");

        contactForm.reset();
        if(tsEl) tsEl.value = String(Date.now());
        if(pageEl) pageEl.value = location.href;
        if(uaEl) uaEl.value = navigator.userAgent;

      }catch(_){
        alert("No se pudo enviar en este momento. Intenta de nuevo o contáctanos por WhatsApp.");
      }
    });
  }
}

/* =========================
   5) Tabs Productos (sin duplicar) + autoscroll tab activo si overflow
   - FIX PERF: init usa behavior:"auto", clicks usan "smooth"
========================= */
function scrollTabIntoView(btn,behavior="smooth"){
  const wrap=btn?.closest(".prod-tabs");if(!wrap)return;
  if(wrap.scrollWidth<=wrap.clientWidth+2)return;
  const wRect=wrap.getBoundingClientRect(),bRect=btn.getBoundingClientRect(),
        targetLeft=wrap.scrollLeft+(bRect.left-wRect.left)-(wRect.width/2-bRect.width/2);
  wrap.scrollTo({left:Math.max(0,targetLeft),behavior})
}
function initTabsProductos(){
  const tabs=QA(".prod-tabs .tab"),panels=QA(".panel-productos");if(!tabs.length||!panels.length)return;
  function activar(btn,behavior="smooth"){
    const targetId=btn?.dataset?.target;if(!targetId)return;
    tabs.forEach(t=>t.classList.toggle("active",t===btn));
    panels.forEach(p=>p.classList.toggle("hidden",p.id!==targetId));
    scrollTabIntoView(btn,behavior)
     window.dispatchEvent(new Event("splitbg:update"));
  }
  tabs.forEach(btn=>{if(btn.dataset.bound==="1")return;btn.dataset.bound="1";on(btn,"click",()=>activar(btn,"smooth"))});
  const tabInicial=document.getElementById("tab-contable");
  activar(tabInicial||tabs[0],"auto")
}

/* =========================
   6) Promos filtro — FIX (solo hijos directos)
========================= */
function initPromosFilter(){
  const grid=document.getElementById("promoGrid");if(!grid)return;
  const promoBtns=QA("#promociones .promo-btn[data-filter]");if(!promoBtns.length)return;
  const promoItems=Array.from(grid.querySelectorAll(":scope > [data-type]"));if(!promoItems.length)return;

  function setPromoFilter(filter){
    promoBtns.forEach(b=>{
      const act=(b.dataset.filter===filter);
      b.classList.toggle("active",act);
      b.setAttribute("aria-pressed",act?"true":"false")
    });
    promoItems.forEach(el=>{
      const type=(el.dataset.type||"").trim();
      const ok=(filter==="all")||(type===filter);
      el.toggleAttribute("hidden",!ok);
      el.style.display=ok?"":"none"
    })
  }

  promoBtns.forEach(b=>{
    if(b.dataset.bound==="1")return;
    b.dataset.bound="1";
    on(b,"click",e=>{e.preventDefault();setPromoFilter(b.dataset.filter||"all")})
  });

  setPromoFilter("nuevos")
}

/* =========================
   7) Cards clicables (sin duplicar)
========================= */
function initClickableCards(){
  QA(".card.product-card[data-href]").forEach(card=>{
    if(card.dataset.bound==="1")return;card.dataset.bound="1";
    const href=card.getAttribute("data-href");
    on(card,"click",e=>{if(e.target.closest("a,button,input,select,textarea,label"))return;href&&(location.href=prefix(href))})
  })
}

/* =========================
   7.1) PERF/CLS helpers: lock altura + cache offsets + RO
   - FIX CLS real: bloquea el contenedor .carousel durante rebuild
========================= */
function lockElHeight(el){if(!el)return()=>{};const r=el.getBoundingClientRect(),h=Math.round(r.height||0);h>0&&(el.style.minHeight=h+"px");return()=>{el.style.minHeight=""}}
function lockTrackHeight(track){return lockElHeight(track)} /* compat */
function buildOffsetsCache(track,slides){track.__centers=slides.map(s=>s.offsetLeft+s.clientWidth/2)}
function closestIndexFromCache(track){const centers=track.__centers||[];if(!centers.length)return 0;const x=(track.scrollLeft||0)+track.clientWidth/2;let best=0,bestDist=Infinity;for(let i=0;i<centers.length;i++){const d=Math.abs(x-centers[i]);d<bestDist&&(bestDist=d,best=i)}return best}
function observeTrack(track){if(!track||!("ResizeObserver"in window)||track.__ro)return;track.__ro=new ResizeObserver(()=>{const slides=QA(".carousel-slide",track);slides.length&&buildOffsetsCache(track,slides)});track.__ro.observe(track)}

/* =========================================================
   8) HERO GALLERY: DATA (TUS DATAS)
========================================================= */
const HERO_GALLERY_DATA={contable:{label:"Contables",defaultSys:"nominas",systems:{contabilidad:{label:"Contabilidad",icon:"IMG/contabilidad.webp",images:[{src:"IMG/contamate.webp"},{src:"IMG/contadesglo.webp"},{src:"IMG/conta%20y%20bancos.webp"},{src:"IMG/conta%20y%20bancos%202.webp"},{src:"IMG/impuestos%20sin%20estres%20conta%20y%20bancos.webp"},{src:"IMG/1conta.webp"},{src:"IMG/conta%20y%20bancos%202.webp"},{src:"IMG/contacfdi.webp"}]},nominas:{label:"Nóminas",icon:"IMG/nominas.webp",images:[{src:"IMG/primera.webp"},{src:"IMG/nomisr.webp"},{src:"IMG/490962328_1082897360538668_175183934644162321_n.webp"},{src:"IMG/NOMINAS.webp"},{src:"IMG/ptu.webp"},{src:"IMG/posible.webp"},{src:"IMG/COMENTARIOS%20USUARIOS.webp"},{src:"IMG/COMMENTS%20ESTRELLAS%201.webp"},{src:"IMG/nomtraza.webp"},{src:"IMG/nommovs.webp"},{src:"IMG/nomiequi.webp"},{src:"IMG/nomentrega.webp"}]},bancos:{label:"Bancos",icon:"IMG/bancos.webp",images:[{src:"IMG/efectivamente.webp"},{src:"IMG/olvida.webp"},{src:"IMG/CONTROL%20MOVIMIENTOS%20BANCARIOS.webp"},{src:"IMG/CARRUSEL%20CONECTA%201jpg.webp"},{src:"IMG/CARRUSEL%20CONECTA%202.webp"},{src:"IMG/PAGARAN.webp"},{src:"IMG/proyecta.webp"},{src:"IMG/revisas.webp"},{src:"IMG/bancosperso.webp"}]},xml:{label:"XML en Línea+",icon:"IMG/xml.webp",images:[{src:"IMG/dos.webp"},{src:"IMG/SOFTWARE%20FAVORITO%201.webp"},{src:"IMG/SOFTWARE%20FAVORITO%202.webp"}]}}},comercial:{label:"Comerciales",defaultSys:"pro",systems:{pro:{label:"Comercial Pro",icon:"IMG/comercialpro.webp",images:[{src:"IMG/captura%20manual.webp"},{src:"IMG/procumple.webp"},{src:"IMG/prorenta.webp"},{src:"IMG/COMPRAVENTA.webp"},{src:"IMG/FUNCIONES%20PRO.webp"},{src:"IMG/FUNCIONES%20PRO2.webp"},{src:"IMG/MODULO.webp"}]},premium:{label:"Comercial Premium",icon:"IMG/comercialpremium.webp",images:[{src:"IMG/desde%20compras%20ventas%20traslados.webp"},{src:"IMG/INVENTARIO%20Y%20VENTAS.webp"},{src:"IMG/LIGAS%20DE%20PAGO.webp"},{src:"IMG/NOTAS%20DE%20VENTA.webp"},{src:"IMG/COSTOS%20Y%20UTILIDADES.webp"},{src:"IMG/INVENTARIOS,%20FINANZAS%20jpg.webp"},{src:"IMG/STOCK.webp"},{src:"IMG/comportamiento.webp"},{src:"IMG/premtrans.webp"},{src:"IMG/premrutas.webp"},{src:"IMG/prempro.webp"},{src:"IMG/premdash.webp"}]},factura:{label:"Factura electrónica",icon:"IMG/factura.webp",images:[{src:"IMG/INCLUYE%201.webp"},{src:"IMG/INCLUYE%202.webp"},{src:"IMG/INCLUYE%203.webp"},{src:"IMG/CARACTERISTICAS%202.webp"},{src:"IMG/CARACTERISTICAS%203.webp"},{src:"IMG/carta%20porte.webp"},{src:"IMG/CONTROLA.webp"},{src:"IMG/solucion%20facil.webp"},{src:"IMG/facinfo.webp"},{src:"IMG/facpreo.webp"},{src:"IMG/factiemp.webp"},{src:"IMG/factimbra.webp"},{src:"IMG/factserv.webp"}]}}},nube:{label:"En la Nube",defaultSys:"contabiliza",systems:{contabiliza:{label:"Contabiliza",icon:"IMG/contabiliza.webp",images:[{src:"IMG/contatranq.webp"},{src:"IMG/contaclari.webp"},{src:"IMG/contabprocesos.webp"},{src:"IMG/contabireal.webp"}]},personia:{label:"Personia",icon:"IMG/personia.webp",images:[{src:"IMG/personiasbc.webp"},{src:"IMG/persoseg.webp"},{src:"IMG/personmas.webp"},{src:"IMG/personiaptu.webp"},{src:"IMG/persobime.webp"}]},vende:{label:"Vende",icon:"IMG/vende.webp",images:[{src:"IMG/vendevendes.webp"},{src:"IMG/vendesigue.webp"},{src:"IMG/vendexml.webp"},{src:"IMG/vendesegui.webp"},{src:"IMG/venderuta.webp"},{src:"IMG/vendequien.webp"},{src:"IMG/vendemarca.webp"},{src:"IMG/vendekpis.webp"},{src:"IMG/vendeayu.webp"}]}}},productividad:{label:"Productividad",defaultSys:"evalua",systems:{analiza:{label:"Analiza",icon:"IMG/analiza.webp",images:[{src:"IMG/analizareportes.webp"},{src:"IMG/anadecide.webp"},{src:"IMG/ananocuadr.webp"},{src:"IMG/analizarespues.webp"},{src:"IMG/analizadescuadr.webp"},{src:"IMG/analizacorrige.webp"},{src:"IMG/analizacfdi.webp"}]},evalua:{label:"Evalúa",icon:"IMG/evalua.webp",images:[{src:"IMG/evaluaencu.webp"},{src:"IMG/evaluabien.webp"},{src:"IMG/nom37.webp"}]},colabora:{label:"Colabora",icon:"IMG/colabora.webp",images:[{src:"IMG/colabacceso.webp"},{src:"IMG/colabtoda.webp"},{src:"IMG/colacentra.webp"},{src:"IMG/colacola.webp"}]}}},servicios:{label:"Servicios",defaultSys:"polizas",systems:{}}};

const HERO_GALLERY={groupNav:Q("#heroGalleryGroups"),tabsContainer:Q("#heroGalleryTabs"),titleEl:Q("#heroGalleryTitle"),carousel:Q("#heroGalleryCarousel"),defaultGroup:"contable"};

/* =========================
   HERO: construir slides (FIX CLS: lock contenedor .carousel)
========================= */
function buildHeroGallerySlides(groupKey,sysKey){
  const g=HERO_GALLERY_DATA[groupKey];if(!g)return;
  const sys=g.systems[sysKey];if(!sys||!sys.images?.length)return;

  HERO_GALLERY.titleEl&&(HERO_GALLERY.titleEl.textContent=sys.label||"");

  const carousel=HERO_GALLERY.carousel;if(!carousel)return;
  const track=carousel.querySelector(".carousel-track"),nav=carousel.querySelector(".carousel-nav");
  if(!track||!nav)return;

  const unlockCarousel=lockElHeight(carousel); /* ✅ FIX CLS real */
  track.innerHTML="";nav.innerHTML="";

  const fragTrack=document.createDocumentFragment(),fragNav=document.createDocumentFragment();

  sys.images.forEach((item,idx)=>{
    const slide=document.createElement("div");
    slide.className="carousel-slide hero-slide"+(idx===0?" is-active":"");
    const img=document.createElement("img");
    img.src=prefix(item.src);
    img.alt=item.title||sys.label||"Expiriti";
    img.width=550;img.height=550;
    img.decoding="async";

    const isLCP=(groupKey===HERO_GALLERY.defaultGroup&&sysKey===g.defaultSys&&idx===0);
    if(isLCP){img.loading="eager";img.setAttribute("fetchpriority","high");addPreloadImage(item.src)}
    else img.loading="lazy";

    slide.appendChild(img);
// === HERO SLIDE: BLUR-FILL (usa el src final ya prefijado) ===
slide.classList.add("blur-fill");
slide.style.setProperty("--blur-src", `url("${img.src}")`);
fragTrack.appendChild(slide);

    const dot=document.createElement("button");
    dot.type="button";
    dot.className="dot"+(idx===0?" active":"");
    dot.setAttribute("aria-label","Ir a imagen "+(idx+1));
    on(dot,"click",()=>{
      const slides=QA(".carousel-slide",track);
      slides.forEach(s=>s.classList.remove("is-active"));
      slides[idx]?.classList.add("is-active");
      QA(".dot",nav).forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      track.scrollTo({left:slides[idx].offsetLeft,behavior:"smooth"})
    });
    fragNav.appendChild(dot)
  });

  track.appendChild(fragTrack);
  nav.appendChild(fragNav);

  requestAnimationFrame(()=>{
    const slides=QA(".carousel-slide",track);
    slides.length&&buildOffsetsCache(track,slides);
    observeTrack(track);
    unlockCarousel()
  })
}

function buildHeroSystemTabs(groupKey){
  const g=HERO_GALLERY_DATA[groupKey];if(!g)return;
  const c=HERO_GALLERY.tabsContainer;if(!c)return;
  c.innerHTML="";
  const def=g.defaultSys;

  Object.entries(g.systems||{}).forEach(([sysKey,sys])=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="hero-tab"+(sysKey===def?" active":"");
    btn.dataset.group=groupKey;
    btn.dataset.sys=sysKey;
    btn.setAttribute("aria-label",sys.label||sysKey);
    btn.setAttribute("title",sys.label||sysKey);
    btn.innerHTML=`<img src="${prefix(sys.icon)}" alt="" width="56" height="56" loading="lazy" decoding="async">`;
    on(btn,"click",()=>{
      QA(".hero-tab",c).forEach(b=>b.classList.toggle("active",b===btn));
      buildHeroGallerySlides(groupKey,sysKey);
      HERO_GALLERY.carousel?.__resetHeroSync?.()
    });
    c.appendChild(btn)
  })
}

function initHeroGallery(){
  const groupNav=HERO_GALLERY.groupNav,carousel=HERO_GALLERY.carousel;
  if(!groupNav||!carousel)return;

  groupNav.innerHTML="";
  Object.entries(HERO_GALLERY_DATA).forEach(([groupKey,group])=>{
    if(groupKey==="servicios")return;
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="hero-group-tab"+(groupKey===HERO_GALLERY.defaultGroup?" active":"");
    btn.dataset.group=groupKey;
    btn.textContent=group.label;
    on(btn,"click",()=>{
      QA(".hero-group-tab",groupNav).forEach(b=>b.classList.toggle("active",b===btn));
      const cfg=HERO_GALLERY_DATA[groupKey];
      buildHeroSystemTabs(groupKey);
      buildHeroGallerySlides(groupKey,cfg.defaultSys);
      carousel.__resetHeroSync?.()
    });
    groupNav.appendChild(btn)
  });

  const track=carousel.querySelector(".carousel-track"),
        prev=carousel.querySelector(".arrowCircle.prev"),
        next=carousel.querySelector(".arrowCircle.next");
  if(!track)return;

  observeTrack(track);
  const slidesFor=()=>QA(".carousel-slide",track),
        getIdxFromScroll=()=>closestIndexFromCache(track),
        goTo=(i,behavior="smooth")=>{
          const slides=slidesFor();if(!slides.length)return;
          const max=slides.length-1,idx=Math.max(0,Math.min(max,i));
          slides.forEach(s=>s.classList.remove("is-active"));
          slides[idx].classList.add("is-active");
          const navEl=carousel.querySelector(".carousel-nav");
          QA(".dot",navEl).forEach((d,k)=>d.classList.toggle("active",k===idx));
          track.scrollTo({left:slides[idx].offsetLeft,behavior})
        };

  carousel.dataset.arrowsBound!=="1"&&(carousel.dataset.arrowsBound="1",on(prev,"click",()=>goTo(getIdxFromScroll()-1)),on(next,"click",()=>goTo(getIdxFromScroll()+1)));

  if(carousel.dataset.scrollSync!=="1"){
    carousel.dataset.scrollSync="1";
    let raf=0,lastIdx=-1;
    const syncFromScroll=()=>{
      raf=0;
      const slides=slidesFor(),len=slides.length;if(!len)return;
      const idx=getIdxFromScroll();if(idx===lastIdx)return;
      lastIdx=idx;
      slides.forEach((s,k)=>s.classList.toggle("is-active",k===idx));
      const navEl=carousel.querySelector(".carousel-nav");
      QA(".dot",navEl).forEach((d,k)=>d.classList.toggle("active",k===idx))
    };
    on(track,"scroll",()=>{raf&&cancelAnimationFrame(raf);raf=requestAnimationFrame(syncFromScroll)},{passive:true});
    on(window,"resize",()=>{lastIdx=-1;const slides=slidesFor();slides.length&&buildOffsetsCache(track,slides);syncFromScroll()});
    carousel.__resetHeroSync=()=>{
      lastIdx=-1;
      track.scrollTo({left:0,behavior:"auto"});
      requestAnimationFrame(()=>{
        const slides=slidesFor();slides.length&&buildOffsetsCache(track,slides);
        syncFromScroll()
      })
    }
  }

  const cfg=HERO_GALLERY_DATA[HERO_GALLERY.defaultGroup];
  buildHeroSystemTabs(HERO_GALLERY.defaultGroup);
  buildHeroGallerySlides(HERO_GALLERY.defaultGroup,cfg.defaultSys)
}

/* =========================================================
   9) REELS: DATA (TUS DATAS)
========================================================= */
const REELS_DATA={contable:{titleEl:Q("#reelTitle-contable"),carousel:Q("#carouselReels-contable"),defaultSys:"contabilidad",reelsBySys:{contabilidad:[{id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"},{id:"BIhYNn2O0og",title:"Evita errores en la DIOT con Contabilidad"},{id:"rESYB37TP-M",title:"Declaración anual en 5 pasos con Contabilidad"},{id:"LqptaBOF7h4",title:"Fernanda redujo su carga contable con Contabilidad"}],nominas:[{id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"},{id:"8-2rT99euog",title:"Nóminas | Software #1 en México"},{id:"2eVOzoBoP6s",title:"Nóminas | Automatiza tus procesos"},{id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"},{id:"MfiiX1La2vQ",title:"Qué hace CONTPAQi Nóminas por ti"}],bancos:[{id:"3YUbSEyU678",title:"Conciliación bancaria en 3 pasos con Bancos"},{id:"LC1Ccpv_jzo",title:"4 señales de que necesitas Bancos"}],xml:[{id:"nhoUDNnGQ90",title:"El día que José dejó de sufrir con el SAT descargando CFDIs"}]}},comercial:{titleEl:Q("#reelTitle-comercial"),carousel:Q("#carouselReels-comercial"),defaultSys:"pro",reelsBySys:{start:[{id:"XvBHmrMRv64",title:"Trazabilidad avanzada en inventarios"}],pro:[{id:"-SJq6t2SM7c",title:"Flujo completo con Comercial Pro"},{id:"rEYzPXOX1_Y",title:"Comercial Pro: control total de inventario"}],premium:[{id:"IYwNBfmWxJU",title:"Controla tus inventarios con Comercial Premium"},{id:"_Krv5nTyFuY",title:"Notas de venta más rápido en Comercial Premium"},{id:"HmgOQrasCVw",title:"Notas de venta en Comercial Premium"},{id:"WGPOzQ1GsSE",title:"Documentos por WhatsApp en Comercial Premium"}],factura:[{id:"nMEgM_BvxTs",title:"Factura Electrónica v13 | Novedades"},{id:"IA5-tguZzCc",title:"Carta Porte CFDI 3.1 en Factura Electrónica"},{id:"2uBSGZHLsGs",title:"Factura Electrónica para sector notarial"}]}},nube:{titleEl:Q("#reelTitle-nube"),carousel:Q("#carouselReels-nube"),defaultSys:"contabiliza",reelsBySys:{contabiliza:[{id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"}],personia:[{id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"}],vende:[{id:"AxadLJcVo4M",title:"Caso de éxito CONTPAQi Vende"},{id:"UPyufjDByNc",title:"Testimonio CONTPAQi Vende"},{id:"Grx1woHMGsU",title:"Vende en la nube"},{id:"2Ty_SD8B_FU",title:"Vende | Carta Porte fácil y rápida"}]}},productividad:{titleEl:Q("#reelTitle-productividad"),carousel:Q("#carouselReels-productividad"),defaultSys:"evalua",reelsBySys:{analiza:[{id:"wr-eeR3eE7w",title:"Analiza | Conciliación fiscal y bancaria"},{id:"gAIGxMHaCLQ",title:"Analiza | Identifica descuadres CFDIs y Nóminas"},{id:"iEQM_21OmBI",title:"Conciliación fiscal y contable con Analiza"}],evalua:[{id:"Cn1A4-GJiNs",title:"Evalúa"}],colabora:[{id:"XJQDFDowH0U",title:"Colabora, app sin costo con Nóminas"},{id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"}]}},
                  servicios:{titleEl:null,carousel:Q("#carouselReels-servicios"),defaultSys:"polizas",reelsBySys:{implementaciones:[{id:"aHGJ-TNpJ-U",title:"Testimonio Martha: Implementación Contable"}],migraciones:[{id:"4QqrKkTPZ6U",title:"Testimonio Uriel: Migración a CONTPAQi"}],desarrollos:[{id:"JkrDOjWV1Gs",title:"Testimonio Sara: Soft Restaurant"},{id:"uBl5UWkwbr8",title:"Testimonio Luis: Desarrollo en Nóminas"}],servidores:[{id:"Vmf2CcSd8G4",title:"Testimonio Erika: Servidores Virtuales"}],cursos:[{id:"TgAkwNt4YCA",title:"Testimonio Ana: Curso Contabilidad"}],soporte:[{id:"inPKGICgxLc",title:"Testimonio Jaquie: Soporte Técnico"}],polizas:[{id:"sTvwf2ISsJU"}]}}

   10) REELS helpers
========================= */
function setArrowsEnabled(prev,next,enabled){[prev,next].forEach(btn=>{if(!btn)return;btn.style.pointerEvents=enabled?"":"none";btn.style.opacity=enabled?"":"0.35";btn.setAttribute("aria-disabled",enabled?"false":"true");btn.classList.toggle("is-disabled",!enabled);"disabled"in btn&&(btn.disabled=!enabled)})}
function setSingleLineReelTitle(c,t){if(!c||!c.titleEl)return;c.titleEl.textContent=t||""}
function renderReelThumb(wrap){
  const id=wrap.dataset.ytid;if(!id)return;
  const title=wrap.dataset.title||"";
  wrap.innerHTML=`<button class="yt-thumb" type="button" aria-label="Reproducir: ${title}"><img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" loading="lazy" decoding="async" width="480" height="270" alt="${title}" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg';"><span class="yt-play"></span></button>`;
  const btn=wrap.querySelector(".yt-thumb");
  btn&&btn.dataset.bound!=="1"&&(btn.dataset.bound="1",on(btn,"click",()=>{stopAllReels();renderReelIframe(wrap)}))
}
function renderReelIframe(wrap){
  const id=wrap.dataset.ytid,title=wrap.dataset.title||"";
  // blindaje
  wrap.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1" title="${title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
}
function stopAllReels(){
  document.querySelectorAll(".reel-embed").forEach(w=>{w.querySelector("iframe")&&renderReelThumb(w)});
  document.querySelectorAll(".yt-lite").forEach(node=>{
    if(node.dataset.ytLoaded==="1"){
      const id=node.dataset.ytid,title=node.dataset.title||"Video",thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      node.innerHTML=`<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}"><span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span><span class="yt-lite-play"></span></button>`;
      node.dataset.ytLoaded=""
    }
  })
}

function buildReelsSlides(panelKey,sysKey){
  const cfg=REELS_DATA[panelKey];if(!cfg)return;
  const track=cfg.carousel?.querySelector(".carousel-track"),nav=cfg.carousel?.querySelector(".carousel-nav");
  if(!track||!nav)return;
  const prev=cfg.carousel.querySelector(".arrowCircle.prev"),next=cfg.carousel.querySelector(".arrowCircle.next"),
        reels=cfg.reelsBySys[sysKey]||[],      unlock=lockElHeight(cfg.carousel); // ✅ FIX: lock del contenedor


  track.innerHTML="";nav.innerHTML="";
  setArrowsEnabled(prev,next,reels.length>1);

reels.forEach((reel,idx)=>{
  const slide=document.createElement("div");
  slide.className="carousel-slide"+(idx===0?" is-active":"");

  // ✅ blur en el SLIDE (marco)
  slide.classList.add("blur-frame");
  const thumbUrl=`https://i.ytimg.com/vi/${reel.id}/hqdefault.jpg`;
  slide.style.setProperty("--blur-src",`url("${thumbUrl}")`);

  // ✅ reel limpio (sin blur)
  const wrap=document.createElement("div");
  wrap.className="reel-embed";
  wrap.dataset.ytid=reel.id;
  wrap.dataset.title=reel.title||"";

  renderReelThumb(wrap);

  slide.appendChild(wrap);
  track.appendChild(slide);

  const dot=document.createElement("button");
  dot.type="button";
  dot.className="dot"+(idx===0?" active":"");
  dot.setAttribute("aria-label","Ir al reel "+(idx+1));
  on(dot,"click",()=>{
    const slides=QA(".carousel-slide",track);
    slides.forEach(s=>s.classList.remove("is-active"));
    slides[idx]?.classList.add("is-active");
    QA(".dot",nav).forEach(d=>d.classList.remove("active"));
    dot.classList.add("active");
    track.scrollTo({left:slides[idx].offsetLeft,behavior:"smooth"});
    stopAllReels();
    setSingleLineReelTitle(cfg,reel.title||"")
  });
  nav.appendChild(dot);
});

  reels[0]?.title&&setSingleLineReelTitle(cfg,reels[0].title);

  requestAnimationFrame(()=>{
    unlock();
    const slides=QA(".carousel-slide",track);
    slides.length&&buildOffsetsCache(track,slides);
    observeTrack(track)
  })
}

function initReelsCarousel(panelKey){
  const cfg=REELS_DATA[panelKey];if(!cfg||!cfg.carousel)return;
  const track=cfg.carousel.querySelector(".carousel-track"),
        prev=cfg.carousel.querySelector(".arrowCircle.prev"),
        next=cfg.carousel.querySelector(".arrowCircle.next");
  if(!track)return;

  observeTrack(track);
  const slidesFor=()=>QA(".carousel-slide",track),
        dotsFor=()=>QA(".carousel-nav .dot",cfg.carousel);

  if(cfg.carousel.dataset.arrowsBound!=="1"){
    cfg.carousel.dataset.arrowsBound="1";
    const goTo=i=>{
      const slides=slidesFor(),len=slides.length;
      if(!len||len<=1)return;
      const idx=(i%len+len)%len;
      slides.forEach(s=>s.classList.remove("is-active"));
      slides[idx].classList.add("is-active");
      dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));
      track.scrollTo({left:slides[idx].offsetLeft,behavior:"smooth"});
      const sys=cfg._activeSys||cfg.defaultSys,reels=cfg.reelsBySys[sys]||[];
      setSingleLineReelTitle(cfg,reels[idx]?.title||"");
      stopAllReels()
    };
    on(prev,"click",()=>{const slides=slidesFor();if(slides.length<=1)return;const i=slides.findIndex(s=>s.classList.contains("is-active"));goTo(i-1)});
    on(next,"click",()=>{const slides=slidesFor();if(slides.length<=1)return;const i=slides.findIndex(s=>s.classList.contains("is-active"));goTo(i+1)})
  }

  if(cfg.carousel.dataset.scrollSync!=="1"){
    cfg.carousel.dataset.scrollSync="1";
    let raf=0,lastIdx=-1;
    const syncFromScroll=()=>{
      raf=0;
      const slides=slidesFor(),len=slides.length;if(!len)return;
      const idx=closestIndexFromCache(track);if(idx===lastIdx)return;
      lastIdx=idx;
      slides.forEach((s,k)=>s.classList.toggle("is-active",k===idx));
      dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));
      const sys=cfg._activeSys||cfg.defaultSys,reels=cfg.reelsBySys[sys]||[];
      setSingleLineReelTitle(cfg,reels[idx]?.title||"") /* 🚫 NO stopAllReels() aquí */
    };
    on(track,"scroll",()=>{raf&&cancelAnimationFrame(raf);raf=requestAnimationFrame(syncFromScroll)},{passive:true});
    on(window,"resize",()=>{lastIdx=-1;const slides=slidesFor();slides.length&&buildOffsetsCache(track,slides);syncFromScroll()})
  }

  cfg._activeSys=cfg.defaultSys;
  buildReelsSlides(panelKey,cfg.defaultSys)
}

function initYTLiteVideos(){
  QA(".yt-lite").forEach(node=>{
    if(node.dataset.ytReady==="1")return;
    const id=node.dataset.ytid,title=node.dataset.title||"Video";if(!id)return;
    node.dataset.ytReady="1";
    const thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    node.innerHTML=`<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}"><span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span><span class="yt-lite-play"></span></button>`;
    on(node,"click",()=>{
      if(node.dataset.ytLoaded==="1")return;
      stopAllReels();
      node.innerHTML=`<iframe class="yt-iframe" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      node.dataset.ytLoaded="1"
    })
  })
}

function initFAQ(){
  document.querySelectorAll(".faq-item").forEach(item=>{
    if(item.dataset.bound==="1")return;item.dataset.bound="1";
    on(item,"toggle",()=>{
      if(!item.open)return;
      document.querySelectorAll(".faq-item").forEach(other=>{other!==item&&other.removeAttribute("open")})
    })
  })
}

function initReelsTabs(){
  QA(".reel-tab").forEach(tab=>{
    if(tab.dataset.bound==="1")return;tab.dataset.bound="1";
    on(tab,"click",()=>{
      const panelKey=tab.dataset.panel,sysKey=tab.dataset.sys;
      if(!panelKey||!sysKey)return;
      const cfg=REELS_DATA[panelKey];
      cfg&&(cfg._activeSys=sysKey);
      stopAllReels();
      QA(".reel-tab").forEach(t=>{t.dataset.panel===panelKey&&t.classList.toggle("active",t===tab)});
      buildReelsSlides(panelKey,sysKey);
      const reels0=cfg?.reelsBySys?.[sysKey]||[];
      cfg?.carousel?.querySelector(".carousel-track")?.scrollTo({left:0,behavior:"auto"});
      setSingleLineReelTitle(cfg,reels0[0]?.title||"")
       window.dispatchEvent(new Event("splitbg:update"));

    })
  })
}

/* =========================
   11) Servicios: pager (mobile) — re-init safe + generalizado N páginas
========================= */
function initServicesPager(){
  const root=document.getElementById("servicesCarousel"),dotsWrap=document.getElementById("servicesDots");
  if(!root||!dotsWrap)return;
  const isDesktop=window.matchMedia("(min-width: 981px)").matches,isCarousel=root.classList.contains("is-carousel");
  if(isDesktop||!isCarousel){dotsWrap.innerHTML="";root.__svcPagerSync=null;return}
  const pages=Array.from(root.querySelectorAll(".svc-page"));
  if(pages.length<=1){dotsWrap.innerHTML="";root.__svcPagerSync=null;return}

  dotsWrap.innerHTML="";
  const base=pages[0].offsetLeft;
  const dots=pages.map((p,i)=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="dot"+(i===0?" active":"");
    b.setAttribute("aria-label",`Ir a página ${i+1} de servicios`);
    b.addEventListener("click",()=>{root.scrollTo({left:pages[i].offsetLeft-base,behavior:"smooth"})});
    dotsWrap.appendChild(b);
    return b
  });

  const setActive=i=>{dots.forEach((d,idx)=>d.classList.toggle("active",idx===i))};
  const mids=pages.map(p=>p.offsetLeft-base+p.clientWidth/2);
  const sync=()=>{
    const x=(root.scrollLeft||0)+root.clientWidth/2;
    let best=0,bestDist=Infinity;
    for(let i=0;i<mids.length;i++){const d=Math.abs(x-mids[i]);d<bestDist&&(bestDist=d,best=i)}
    setActive(best)
  };

  root.__svcPagerSync=sync;

  if(root.dataset.pagerBound!=="1"){
    root.dataset.pagerBound="1";
    let raf=0;
    root.addEventListener("scroll",()=>{raf&&cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{typeof root.__svcPagerSync=="function"&&root.__svcPagerSync()})},{passive:true})
  }

  requestAnimationFrame(()=>requestAnimationFrame(sync))
}

/* =========================
   12) INIT PRINCIPAL
========================= */
on(window,"DOMContentLoaded",async()=>{
  await Promise.all([loadPartial("header-placeholder","global-header.html"),loadPartial("footer-placeholder","global-footer.html")]);
  normalizeRoutes(document);
  bindWheelOnTabs();
  initForms();
  initTabsProductos();
  initPromosFilter();
  initClickableCards();
  initHeroGallery();
  ["contable","comercial","nube","productividad","servicios"].forEach(initReelsCarousel);
  initReelsTabs();
  initYTLiteVideos();
  initFAQ();
  initServicesPager();
  const yearSpan=document.getElementById("gf-year");yearSpan&&(yearSpan.textContent=new Date().getFullYear())
});

/* ===== MAPA: lazy-load on demand (PageSpeed friendly) ===== */
(function(){"use strict";
function addPreconnect(href){if(document.querySelector(`link[rel="preconnect"][href="${href}"]`))return;const l=document.createElement("link");l.rel="preconnect";l.href=href;l.crossOrigin="anonymous";document.head.appendChild(l)}
function loadMap(root){
  if(!root||root.dataset.loaded==="1")return;
  root.dataset.loaded="1";
  addPreconnect("https://www.google.com");
  addPreconnect("https://www.google.com.mx");
  addPreconnect("https://maps.google.com");
  addPreconnect("https://maps.gstatic.com");
  const src=root.getAttribute("data-embed");if(!src)return;
  const iframe=document.createElement("iframe");
  iframe.src=src;
  iframe.loading="lazy";
  iframe.referrerPolicy="no-referrer-when-downgrade";
  iframe.allowFullscreen=true;
  iframe.title="Mapa: ExpIRI TI";
  iframe.setAttribute("aria-hidden","false");
  root.innerHTML="";
  root.appendChild(iframe)
}
function initLazyMap(){
  const root=document.getElementById("mapExpiriti");if(!root)return;
  if(root.dataset.mapBound==="1")return;root.dataset.mapBound="1";
  root.addEventListener("click",e=>{const cta=e.target.closest(".map-cover-cta");if(!cta)return;e.preventDefault();loadMap(root)});
  if("IntersectionObserver"in window){
    const io=new IntersectionObserver(entries=>{entries.forEach(ent=>{if(ent.isIntersecting){loadMap(root);io.disconnect()}})},{rootMargin:"200px 0px"});
    io.observe(root)
  }
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",initLazyMap,{once:true}):initLazyMap()
})();

/* =========================
   13) Eventos globales
========================= */
on(window,"resize",()=>safe(initServicesPager));
on(window,"pageshow",()=>{safe(()=>normalizeRoutes(document));safe(bindWheelOnTabs);safe(initServicesPager)});

})();


(() => {
  if (window.__EXPIRITI_SPLITBG__) return;
  window.__EXPIRITI_SPLITBG__ = true;

  const D = document;
  const root = D.documentElement;

  const px = (n) => `${Math.max(0, Math.round(n))}px`;

  const getTop = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY;
  };

  const getBottom = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.bottom + window.scrollY;
  };

  const getHeaderOffset = () => {
    const gh = getComputedStyle(root).getPropertyValue("--gh-height").trim();
    const n = parseFloat(gh || "0");
    return Number.isFinite(n) ? n : 0;
  };

  const setSplits = () => {
    const headerOffset = getHeaderOffset();

    const sistemas  = D.getElementById("productos-con");
    const sectores  = D.getElementById("sectores");
    const servicios = D.getElementById("servicios");
    const promos    = D.getElementById("promociones");

    const s1 = getTop(sistemas);
    const s2 = getBottom(sectores);
    const s3 = getBottom(servicios);
    const s4 = getTop(promos);

    if (s1 != null) root.style.setProperty("--split-sistemas", px(s1 - headerOffset));
    if (s2 != null) root.style.setProperty("--split-sectores-end", px(s2 - headerOffset));
    if (s3 != null) root.style.setProperty("--split-servicios-end", px(s3 - headerOffset));
    if (s4 != null) root.style.setProperty("--split-promos", px(s4 - headerOffset));
  };

  const rafSet = () => requestAnimationFrame(setSplits);

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", rafSet, { once: true });
  else rafSet();

  window.addEventListener("load", rafSet, { once: true });
  window.addEventListener("resize", rafSet);
  window.addEventListener("orientationchange", rafSet);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(rafSet).catch(()=>{});
  }

  window.addEventListener("splitbg:update", rafSet);
})();

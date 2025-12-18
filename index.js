/* Expiriti index.js (FINAL V5 - 1 LÍNEA EN TÍTULO REELS + FLECHAS LOOP/DISABLE + SERVICIOS DEFAULT PÓLIZAS) */
(function(){
"use strict";
if(window.__EXPIRITI_INIT__) return; window.__EXPIRITI_INIT__=true;

/* =========================
   Helpers DOM + Rutas
   ========================= */
const qa=(s,c=document)=>Array.from(c.querySelectorAll(s));
const q =(s,c=document)=>c.querySelector(s);
// ✅ Alias para tu código existente (porque usas $ y $$ en todo el archivo)
const $  = q;
const $$ = qa;
   
   

function getBasePath(){
  const p=location.pathname;
  return (p.includes("/SISTEMAS/")||p.includes("/SERVICIOS/")||p.includes("/PDFS/")||p.includes("/CSS/")) ? "../" : "./";
}
function absAsset(path){
  if(!path) return path;
  if(/^https?:\/\//i.test(path)) return path;
  if(path.startsWith("#")) return path;
  const base=getBasePath();
  return (base==="../" && !path.startsWith("../")) ? (base+path) : path;
}

/* =========================
   Parciales (header/footer)
   ========================= */
async function loadPartial(placeholderId,fileName){
  try{
    const base=getBasePath();
    const target=document.getElementById(placeholderId);
    if(!target) return;
    const resp=await fetch(`${base}PARTIALS/${fileName}?v=${Date.now()}`);
    if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
    target.innerHTML=await resp.text();
  }catch(err){
    console.error(`Error cargando parcial ${fileName}:`,err);
  }
}

/* =========================
   Header: links absolutos + burger + activo
   ========================= */
function initHeaderLogic(){
  const base=getBasePath();

  $$('.js-abs-href[data-href]').forEach(a=>{
    const raw=a.getAttribute("data-href")||"";
    const parts=raw.split("#");
    const path=parts[0], hash=parts[1];
    if(base==="../" && !raw.startsWith("http") && !raw.startsWith("#")){
      a.href=base+path+(hash?"#"+hash:"");
    }else a.href=raw;
  });

  $$('.js-abs-src[data-src]').forEach(img=>{
    const raw=img.getAttribute("data-src")||"";
    img.src=absAsset(raw);
    img.onload=()=>{img.style.opacity="1";};
    if(img.complete) img.style.opacity="1";
  });

  const burger=$("#gh-burger"), nav=$(".gh-nav");
  if(burger&&nav){
    burger.addEventListener("click",()=>{
      nav.classList.toggle("open");
      burger.textContent=nav.classList.contains("open")?"✕":"≡";
    });
  }

  const P=location.pathname.toUpperCase(), H=location.hash;
  let sec="inicio";
  if(P.includes("/SISTEMAS/")) sec="sistemas";
  else if(P.includes("/SERVICIOS/")) sec="servicios";
  else if(H==="#servicios") sec="servicios";
  else if(H==="#promociones") sec="promociones";
  else if(H==="#productos"||H==="#productos-con") sec="sistemas";
  else if(H==="#contacto") sec="contacto";
  else if(P.includes("/NOSOTROS")) sec="nosotros";

  $$("[data-section]").forEach(a=>a.classList.toggle("gh-active",a.getAttribute("data-section")===sec));
}

/* =========================
   Formularios -> WhatsApp
   ========================= */
$("#quickForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const modulo=encodeURIComponent($("#modulo")?.value||"");
  const mensaje=encodeURIComponent(($("#mensaje")?.value||"").trim());
  const texto=`Hola Expiriti, me interesa ${modulo}. ${mensaje}`;
  window.open(`https://wa.me/525568437918?text=${texto}`,"_blank");
});
$("#contactForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const nombre=encodeURIComponent(($("#nombre")?.value||"").trim());
  const correo=encodeURIComponent(($("#correo")?.value||"").trim());
  const telefono=encodeURIComponent(($("#telefono")?.value||"").trim());
  const interes=encodeURIComponent($("#interes")?.value||"");
  const detalle=encodeURIComponent(($("#detalle")?.value||"").trim());
  const texto=`Hola Expiriti, soy ${nombre}. Email: ${correo}. Tel: ${telefono||"N/A"}. Interés: ${interes}. Detalle: ${detalle}`;
  window.open(`https://wa.me/525568437918?text=${texto}`,"_blank");
});

/* =========================
   Tabs Productos
   ========================= */
const tabsProductos=$$(".prod-tabs .tab");
const panelsProductos=$$(".panel-productos");
function activarTabProductos(btn){
  const targetId=btn.dataset.target;
  tabsProductos.forEach(t=>t.classList.toggle("active",t===btn));
  panelsProductos.forEach(p=>p.classList.toggle("hidden",p.id!==targetId));
}
tabsProductos.forEach(btn=>btn.addEventListener("click",()=>activarTabProductos(btn)));
const tabInicial=document.getElementById("tab-contable");
if(tabInicial) activarTabProductos(tabInicial);
/* =========================
   Promos filtro (img + figure)
   ========================= */

const promoBtns = $$(".promo-btn");
const promoItems = $$("#promoGrid [data-type]");

function setPromoFilter(filter){
  promoBtns.forEach(b => b.classList.toggle("active", b.dataset.filter === filter));

  promoItems.forEach(el => {
    const ok = (filter === "all") || (el.dataset.type === filter);
    el.style.display = ok ? "" : "none";
  });
}

promoBtns.forEach(b => b.addEventListener("click", () => setPromoFilter(b.dataset.filter)));
if(promoBtns.length) setPromoFilter("nuevos");


/* =========================
   Cards clicables
   ========================= */
$$(".card.product-card[data-href]").forEach(card=>{
  const href=card.getAttribute("data-href");
  card.addEventListener("click",e=>{
    if(e.target.closest("a")) return;
    if(href) location.href=absAsset(href);
  });
});

/* =========================
   HERO GALLERY: DATA
   ========================= */
const HERO_GALLERY_DATA={
  contable:{label:"Contables",defaultSys:"nominas",systems:{
    contabilidad:{label:"Contabilidad",icon:"IMG/contabilidadsq.webp",images:[
      {src:"IMG/contamate.webp"},
       {src:"IMG/contadesglo.webp"},
       {src:"IMG/conta%20y%20bancos.webp"},
       {src:"IMG/conta%20y%20bancos%20.webp"},
      {src:"IMG/impuestos%20sin%20estres%20conta%20y%20bancos.webp"},
      {src:"IMG/1conta.webp"},
      {src:"IMG/conta%20y%20bancos%202.webp"},
      {src:"IMG/contacfdi.webp"}
     
    ]},
    nominas:{label:"Nóminas",icon:"IMG/nominassq.webp",images:[
      {src:"IMG/primera.webp"},
             {src:"IMG/nomisr.webp"},
      {src:"IMG/490962328_1082897360538668_175183934644162321_n.webp"},
      {src:"IMG/NOMINAS.webp"},
      {src:"IMG/ptu.webp"},
      {src:"IMG/posible.webp"},
      {src:"IMG/COMENTARIOS%20USUARIOS.webp"},
      {src:"IMG/COMMENTS%20ESTRELLAS%201.webp"},
      {src:"IMG/nomtraza.webp"},
      {src:"IMG/nommovs.webp"},
      {src:"IMG/nomiequi.webp"},
      {src:"IMG/nomentrega.webp"}
    ]},
    bancos:{label:"Bancos",icon:"IMG/bancossq.webp",images:[
      {src:"IMG/efectivamente.webp"},
      {src:"IMG/olvida.webp"},
      {src:"IMG/CONTROL%20MOVIMIENTOS%20BANCARIOS.webp"},
      {src:"IMG/CARRUSEL%20CONECTA%201jpg.webp"},
      {src:"IMG/CARRUSEL%20CONECTA%202.webp"},
      {src:"IMG/PAGARAN.webp"},
      {src:"IMG/proyecta.webp"},
      {src:"IMG/revisas.webp"},
      {src:"IMG/bancosperso.webp"}
    ]},
    xml:{label:"XML en Línea+",icon:"IMG/xmlsq.webp",images:[
      {src:"IMG/dos.webp"},
      {src:"IMG/SOFTWARE%20FAVORITO%201.webp"},
      {src:"IMG/SOFTWARE%20FAVORITO%202.webp"}
    ]}
  }},

comercial:{label:"Comerciales",defaultSys:"pro",systems:{
  pro:{label:"Comercial Pro",icon:"IMG/comercialprosq.webp",images:[
    {src:"IMG/captura%20manual.webp"},
    {src:"IMG/procumple.webp"},
    {src:"IMG/prorenta.webp"},
    {src:"IMG/COMPRAVENTA.webp"},
    {src:"IMG/FUNCIONES%20PRO.webp"},
    {src:"IMG/FUNCIONES%20PRO2.webp"},
    {src:"IMG/MODULO.webp"}
  ]},
  premium:{label:"Comercial Premium",icon:"IMG/comercialpremiumsq.webp",images:[
    {src:"IMG/desde%20compras%20ventas%20traslados.webp"},
    {src:"IMG/INVENTARIO%20Y%20VENTAS.webp"},
    {src:"IMG/LIGAS%20DE%20PAGO.webp"},
    {src:"IMG/NOTAS%20DE%20VENTA.webp"},
    {src:"IMG/COSTOS%20Y%20UTILIDADES.webp"},
    {src:"IMG/INVENTARIOS,%20FINANZAS%20jpg.webp"},
    {src:"IMG/STOCK.webp"},
    {src:"IMG/comportamiento.webp"},
    {src:"IMG/premtrans.webp"},
    {src:"IMG/premrutas.webp"},
    {src:"IMG/prempro.webp"},
    {src:"IMG/premdash.webp"}
  ]},
  factura:{label:"Factura electrónica",icon:"IMG/facturasq.webp",images:[
    {src:"IMG/INCLUYE%201.webp"},
    {src:"IMG/INCLUYE%202.webp"},
    {src:"IMG/INCLUYE%203.webp"},
    {src:"IMG/CARACTERISTICAS%202.webp"},
    {src:"IMG/CARACTERISTICAS%203.webp"},
    {src:"IMG/carta%20porte.webp"},
    {src:"IMG/CONTROLA.webp"},
    {src:"IMG/solucion%20facil.webp"},
    {src:"IMG/facinfo.webp"},
    {src:"IMG/facpreo.webp"},
    {src:"IMG/factiemp.webp"},
    {src:"IMG/factimbra.webp"},
    {src:"IMG/factserv.webp"}
  ]}
}},

   
   nube:{label:"En la Nube",defaultSys:"analiza",systems:{
    analiza:{label:"Analiza",icon:"IMG/analiza.webp",images:[
           {src:"IMG/analizareportes.webp"},
       {src:"IMG/anadecide.webp"},
      {src:"IMG/ananocuadr.webp"},
      {src:"IMG/analizarespues.webp"},
      {src:"IMG/analizadescuadr.webp"},
      {src:"IMG/analizacorrige.webp"},
      {src:"IMG/analizacfdi.webp"}
    ]},
    contabiliza:{label:"Contabiliza",icon:"IMG/contabiliza.webp",images:[
      {src:"IMG/contatranq.webp"},
      {src:"IMG/contaclari.webp"},
      {src:"IMG/contabprocesos.webp"},
      {src:"IMG/contabireal.webp"}
    ]},

    vende:{label:"Vende",icon:"IMG/vende.webp",images:[
      {src:"IMG/vendevendes.webp"},
      {src:"IMG/vendesigue.webp"},
      {src:"IMG/vendexml.webp"},
      {src:"IMG/vendesegui.webp"},
      {src:"IMG/venderuta.webp"},
      {src:"IMG/vendequien.webp"},
      {src:"IMG/vendemarca.webp"},
      {src:"IMG/vendekpis.webp"},
      {src:"IMG/vendeayu.webp"}
    ]}
  }},
  productividad:{label:"Productividad",defaultSys:"evalua",systems:{
    evalua:{label:"Evalúa",icon:"IMG/evalua.webp",images:[
      {src:"IMG/evaluaencu.webp"},
      {src:"IMG/evaluabien.webp"},
      {src:"IMG/nom37.webp"}
    ]},
    colabora:{label:"Colabora",icon:"IMG/colabora.webp",images:[
      {src:"IMG/colabacceso.webp"},
      {src:"IMG/colabtoda.webp"},
      {src:"IMG/colacentra.webp"},
      {src:"IMG/colacola.webp"}
    ]},
    personia:{label:"Personia",icon:"IMG/personia.webp",images:[
      {src:"IMG/personiasbc.webp"},
      {src:"IMG/persoseg.webp"},
      {src:"IMG/personmas.webp"},
      {src:"IMG/personiaptu.webp"},
      {src:"IMG/persobime.webp"}
    ]}
  }},
  servicios:{label:"Servicios",defaultSys:"polizas",systems:{}}
};

const HERO_GALLERY={
  groupNav:$("#heroGalleryGroups"),
  tabsContainer:$("#heroGalleryTabs"),
  titleEl:$("#heroGalleryTitle"),
  carousel:$("#heroGalleryCarousel"),
  defaultGroup:"contable"
};

function buildHeroGallerySlides(groupKey,sysKey){
  const g=HERO_GALLERY_DATA[groupKey]; if(!g) return;
  const sys=g.systems[sysKey]; if(!sys||!sys.images?.length) return;
  const {carousel,defaultGroup}=HERO_GALLERY; if(!carousel) return;
  const track=carousel.querySelector(".carousel-track");
  const nav=carousel.querySelector(".carousel-nav");
  if(!track||!nav) return;

  track.innerHTML=""; nav.innerHTML="";
  sys.images.forEach((item,idx)=>{
    const slide=document.createElement("div");
    slide.className="carousel-slide hero-slide"+(idx===0?" is-active":"");
    const img=document.createElement("img");
    img.src=absAsset(item.src);
    img.alt=item.title||sys.label;
    img.width=550; img.height=550; img.decoding="async";
    const isLCP=(groupKey===defaultGroup && sysKey===g.defaultSys && idx===0);
    if(isLCP){ img.loading="eager"; img.setAttribute("fetchpriority","high"); }
    else img.loading="lazy";
    slide.appendChild(img);
    track.appendChild(slide);

    const dot=document.createElement("button");
    dot.type="button";
    dot.className="dot"+(idx===0?" active":"");
    dot.setAttribute("aria-label","Ir a imagen "+(idx+1));
    dot.addEventListener("click",()=>{
      const slides=$$(".carousel-slide",track);
      slides.forEach(s=>s.classList.remove("is-active"));
      slides[idx]?.classList.add("is-active");
      $$(".dot",nav).forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
    });
    nav.appendChild(dot);
  });
}

function buildHeroSystemTabs(groupKey){
  const g=HERO_GALLERY_DATA[groupKey]; if(!g) return;
  const c=HERO_GALLERY.tabsContainer; if(!c) return;
  c.innerHTML="";
  const def=g.defaultSys;

  if(g.systems) {
    Object.entries(g.systems).forEach(([sysKey,sys])=>{
      const btn=document.createElement("button");
      btn.type="button";
      btn.className="hero-tab"+(sysKey===def?" active":"");
      btn.dataset.group=groupKey; btn.dataset.sys=sysKey;
      btn.innerHTML=`<img src="${absAsset(sys.icon)}" alt="${sys.label}" width="56" height="56" loading="lazy" decoding="async"><span>${sys.label}</span>`;
      btn.addEventListener("click",()=>{
        $$(".hero-tab",c).forEach(b=>b.classList.toggle("active",b===btn));
        buildHeroGallerySlides(groupKey,sysKey);
      });
      c.appendChild(btn);
    });
  }
}

function initHeroGallery(){
  const {groupNav,defaultGroup,carousel}=HERO_GALLERY;
  if(!groupNav||!carousel) return;

  groupNav.innerHTML="";
  Object.entries(HERO_GALLERY_DATA).forEach(([groupKey,group])=>{
    if(groupKey==="servicios") return;
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="hero-group-tab"+(groupKey===defaultGroup?" active":"");
    btn.dataset.group=groupKey;
    btn.textContent=group.label;
    btn.addEventListener("click",()=>{
      $$(".hero-group-tab",groupNav).forEach(b=>b.classList.toggle("active",b===btn));
      const cfg=HERO_GALLERY_DATA[groupKey];
      buildHeroSystemTabs(groupKey);
      buildHeroGallerySlides(groupKey,cfg.defaultSys);
    });
    groupNav.appendChild(btn);
  });

  const track=carousel.querySelector(".carousel-track");
  const prev=carousel.querySelector(".arrowCircle.prev");
  const next=carousel.querySelector(".arrowCircle.next");
  const slidesFor=()=>$$(".carousel-slide",track);

  const goTo=i=>{
    const slides=slidesFor(); if(!slides.length) return;
    const max=slides.length-1;
    const idx=Math.max(0,Math.min(max,i));
    slides.forEach(s=>s.classList.remove("is-active"));
    slides[idx].classList.add("is-active");
    $$(".dot",carousel.querySelector(".carousel-nav")).forEach((d,k)=>d.classList.toggle("active",k===idx));
    track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
  };

  prev?.addEventListener("click",()=>{ const i=slidesFor().findIndex(s=>s.classList.contains("is-active")); goTo(i-1); });
  next?.addEventListener("click",()=>{ const i=slidesFor().findIndex(s=>s.classList.contains("is-active")); goTo(i+1); });

  const cfg=HERO_GALLERY_DATA[defaultGroup];
  buildHeroSystemTabs(defaultGroup);
  buildHeroGallerySlides(defaultGroup,cfg.defaultSys);
}

/* =========================
   REELS: DATA
   - OJO: "titleEl" aquí es el ELEMENTO DE LA 2DA LÍNEA actual (#reelTitle-...)
     y lo vamos a ocultar para que solo quede 1 línea (la de arriba) pero dinámica.
   ========================= */
const REELS_DATA={
  contable:{
    titleEl:$("#reelTitle-contable"),
    carousel:$("#carouselReels-contable"),
    defaultSys:"contabilidad",
    reelsBySys:{
      contabilidad:[
        {id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"},
        {id:"BIhYNn2O0og",title:"Evita errores en la DIOT con Contabilidad"},
        {id:"rESYB37TP-M",title:"Declaración anual en 5 pasos con Contabilidad"},
        {id:"LqptaBOF7h4",title:"Fernanda redujo su carga contable con Contabilidad"}
      ],
      nominas:[
        {id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"},
        {id:"8-2rT99euog",title:"Nóminas | Software #1 en México"},
        {id:"2eVOzoBoP6s",title:"Nóminas | Automatiza tus procesos"},
        {id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"},
        {id:"MfiiX1La2vQ",title:"Qué hace CONTPAQi Nóminas por ti"}
      ],
      bancos:[
        {id:"3YUbSEyU678",title:"Conciliación bancaria en 3 pasos con Bancos"},
        {id:"LC1Ccpv_jzo",title:"4 señales de que necesitas Bancos"}
      ],
      xml:[
        {id:"nhoUDNnGQ90",title:"El día que José dejó de sufrir con el SAT descargando CFDIs"}
      ]
    }
  },

  comercial:{
    titleEl:$("#reelTitle-comercial"),
    carousel:$("#carouselReels-comercial"),
    defaultSys:"pro",
    reelsBySys:{

  start:[
        {id:"XvBHmrMRv64",title:"Trazabilidad avanzada en inventarios"}
      ],

     
       
      pro:[
        {id:"-SJq6t2SM7c",title:"Flujo completo con Comercial Pro"},
         {id:"rEYzPXOX1_Y",title:"Comercial Pro: control total de inventario"}
      ],
      premium:[
        {id:"IYwNBfmWxJU",title:"Controla tus inventarios con Comercial Premium"},
        {id:"_Krv5nTyFuY",title:"Notas de venta más rápido en Comercial Premium"},
        {id:"HmgOQrasCVw",title:"Notas de venta en Comercial Premium"},
        {id:"WGPOzQ1GsSE",title:"Documentos por WhatsApp en Comercial Premium"}
      ],
      factura:[
        {id:"nMEgM_BvxTs",title:"Factura Electrónica v13 | Novedades"},
        {id:"IA5-tguZzCc",title:"Carta Porte CFDI 3.1 en Factura Electrónica"},
        {id:"2uBSGZHLsGs",title:"Factura Electrónica para sector notarial"}
      ]
    }
  },

  nube:{
    titleEl:$("#reelTitle-nube"),
    carousel:$("#carouselReels-nube"),
    defaultSys:"analiza",
    reelsBySys:{
      analiza:[
        {id:"wr-eeR3eE7w",title:"Analiza | Conciliación fiscal y bancaria"},
        {id:"gAIGxMHaCLQ",title:"Analiza | Identifica descuadres CFDIs y Nóminas"},
        {id:"iEQM_21OmBI",title:"Conciliación fiscal y contable con Analiza"}
      ],
      contabiliza:[{id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"}],
      despachos:[
{id:"TsyBKkhwvew", title:"CONTPAQi Despachos"},
      ],
      vende:[
                    {id:"AxadLJcVo4M",title:"Caso de éxito CONTPAQi Vende"},
         {id:"UPyufjDByNc",title:"Testimonio CONTPAQi Vende"},
        {id:"Grx1woHMGsU",title:"Vende en la nube"},
        {id:"2Ty_SD8B_FU",title:"Vende | Carta Porte fácil y rápida"}

      ]
    }
  },

  productividad:{
titleEl: $("#reelTitle-productividad"),
carousel: $("#carouselReels-productividad"),
defaultSys: "evalua",
reelsBySys: {
  evalua: [
    { id: "Cn1A4-GJiNs", title: "Evalúa" },
      ],
      colabora:[
        {id:"XJQDFDowH0U",title:"Colabora, app sin costo con Nóminas"},
        {id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"}
      ],
      personia:[{id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"}]
    }
  },

  servicios:{
    titleEl:$("#reelTitle-servicios"),
    carousel:$("#carouselReels-servicios"),
    defaultSys:"polizas", /* ✅ DEFAULT: PÓLIZAS */
    reelsBySys:{
      implementaciones:[
        {id:"aHGJ-TNpJ-U",title:"Testimonio Martha: Implementación Contable"}
      ],
      migraciones:[
        {id:"4QqrKkTPZ6U",title:"Testimonio Uriel: Migración a CONTPAQi"}
      ],
      desarrollos:[
        {id:"JkrDOjWV1Gs",title:"Testimonio Sara: Soft Restaurant"},
        {id:"uBl5UWkwbr8",title:"Testimonio Luis: Desarrollo en Nóminas"}

      ],
      servidores:[
        {id:"Vmf2CcSd8G4",title:"Testimonio Erika: Servidores Virtuales"}
      ],
      cursos:[
        {id:"TgAkwNt4YCA",title:"Testimonio Ana: Curso Contabilidad"}
      ],
      soporte:[
        {id:"inPKGICgxLc",title:"Testimonio Jaquie: Soporte Técnico"}
      ],
      polizas:[
        {id:"sTvwf2ISsJU",title:"Póliza: ¿Qué incluye una póliza anual de soporte Expiriti?"}
        // Si luego me pasas otro link de póliza, lo agrego aquí como 2do reel
        // {id:"REEMPLAZAR_ID_POLIZA_2",title:"Cómo se cotiza una póliza: usuarios, sistemas y empresas"}
      ]
    }
  }

};

/* =========================
   REELS: utilidades de UI
   - 1 sola línea: el título del reel se pinta en la línea 1
   - la línea 2 (#reelTitle-...) se oculta
   ========================= */
function setArrowsEnabled(prev,next,enabled){
  [prev,next].forEach(btn=>{
    if(!btn) return;
    btn.style.pointerEvents = enabled ? "" : "none";
    btn.style.opacity = enabled ? "" : "0.35";
    btn.setAttribute("aria-disabled", enabled ? "false" : "true");
    btn.classList.toggle("is-disabled", !enabled);
    // Por si el botón tiene disabled real (depende de tu HTML)
    if("disabled" in btn) btn.disabled = !enabled;
  });
}

function setSingleLineReelTitle(cfg, title){
  const t = (title || "").trim();
  if(!t) return;

  // Queremos poner el título en la "línea 1" (con el estilo que hoy dice "Reels por ...")
  // y ocultar la "línea 2" (cfg.titleEl).
  const subtitle = cfg?.titleEl || null;

  // Cachear el heading una vez que lo encontremos
  if(!cfg._headingEl){
    let heading = null;

    // Caso ideal: subtitle existe y su anterior sibling es la línea 1 (lo más común en tu layout)
    if(subtitle && subtitle.previousElementSibling){
      heading = subtitle.previousElementSibling;
    }

    // Fallback: buscar algo razonable en el contenedor inmediato
    if(!heading && subtitle && subtitle.parentElement){
      heading = subtitle.parentElement.querySelector(".reels-kicker, .reels-heading, h2, h3");
    }

    // Último fallback: buscar cerca del carrusel
    if(!heading && cfg.carousel){
      const host = cfg.carousel.parentElement || cfg.carousel;
      heading = host.querySelector(".reels-kicker, .reels-heading, h2, h3");
    }

    cfg._headingEl = heading || null;
  }

  if(cfg._headingEl){
    cfg._headingEl.textContent = t;
  }

  // Ocultar la 2da línea si existe
  if(subtitle){
    subtitle.textContent = "";
    subtitle.style.display = "none";
    subtitle.setAttribute("aria-hidden","true");
  }
}

/* =========================
   REELS: render thumb/iframe
   ========================= */
function renderReelThumb(wrap){
  const id=wrap.dataset.ytid; if(!id) return;
  const title=wrap.dataset.title||"";
  wrap.innerHTML=`<button class="yt-thumb" type="button" aria-label="Reproducir: ${title}">
    <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" loading="lazy" decoding="async" width="480" height="270"
      alt="${title}" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg';">
    <span class="yt-play"></span>
  </button>`;
  const btn = wrap.querySelector(".yt-thumb");
  if(btn) btn.addEventListener("click",()=>{ stopAllReels(); renderReelIframe(wrap); });
}

function renderReelIframe(wrap){
  const id = wrap.dataset.ytid;
  const title = wrap.dataset.title || "";
  wrap.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1"
      title="${title}"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
    ></iframe>
  `;
}

/* =========================
   stopAllReels() (reels + yt-lite)
   ========================= */
function stopAllReels(){
  // 1) Detener REELS (verticales)
  document.querySelectorAll(".reel-embed").forEach(w=>{
    if(w.querySelector("iframe")){
      renderReelThumb(w);
    }
  });

  // 2) Detener videos horizontales (.yt-lite)
  document.querySelectorAll(".yt-lite").forEach(node=>{
    if(node.dataset.ytLoaded === "1"){
      const id = node.dataset.ytid;
      const title = node.dataset.title || "Video";
      const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

      node.innerHTML = `<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}">
        <span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span>
        <span class="yt-lite-play"></span>
      </button>`;

      node.dataset.ytLoaded = "";
    }
  });
}

/* =========================
   REELS: construir slides + dots
   (Actualiza título 1-línea + habilita/deshabilita flechas)
   ========================= */
function buildReelsSlides(panelKey, sysKey){
  const cfg=REELS_DATA[panelKey]; if(!cfg) return;
  const track=cfg.carousel?.querySelector(".carousel-track");
  const nav=cfg.carousel?.querySelector(".carousel-nav");
  if(!track||!nav) return;

  const prev = cfg.carousel.querySelector(".arrowCircle.prev");
  const next = cfg.carousel.querySelector(".arrowCircle.next");

  const reels = (cfg.reelsBySys[sysKey] || []);
  track.innerHTML=""; nav.innerHTML="";

  // Habilitar/Deshabilitar flechas según cantidad
  setArrowsEnabled(prev, next, reels.length > 1);

  reels.forEach((reel,idx)=>{
    const slide=document.createElement("div");
    slide.className="carousel-slide"+(idx===0?" is-active":"");
    const wrap=document.createElement("div");
    wrap.className="reel-embed";
    wrap.dataset.ytid=reel.id;
    wrap.dataset.title=reel.title;
    renderReelThumb(wrap);
    slide.appendChild(wrap);
    track.appendChild(slide);

    const dot=document.createElement("button");
    dot.type="button";
    dot.className="dot"+(idx===0?" active":"");
    dot.setAttribute("aria-label","Ir al reel "+(idx+1));
    dot.addEventListener("click",()=>{
      $$(".carousel-slide",track).forEach(s=>s.classList.remove("is-active"));
      $$(".carousel-slide",track)[idx]?.classList.add("is-active");
      $$(".dot",nav).forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
      stopAllReels();
      setSingleLineReelTitle(cfg, reel.title || "");
    });
    nav.appendChild(dot);
  });

  // Set título inicial (1 sola línea)
  if(reels[0]?.title) setSingleLineReelTitle(cfg, reels[0].title);
}

/* =========================
   REELS: init carrusel con loop infinito
   ========================= */
function initReelsCarousel(panelKey){
  const cfg=REELS_DATA[panelKey]; if(!cfg||!cfg.carousel) return;

  const track=cfg.carousel.querySelector(".carousel-track");
  const prev=cfg.carousel.querySelector(".arrowCircle.prev");
  const next=cfg.carousel.querySelector(".arrowCircle.next");
  if(!track) return;

  const slidesFor=()=>$$(".carousel-slide",track);
  const dotsFor=()=>$$(".carousel-nav .dot",cfg.carousel);

  const goTo=(i)=>{
    const slides=slidesFor();
    const len=slides.length;
    if(!len) return;

    // Si solo hay 1, no hacer nada
    if(len <= 1) return;

    // Loop infinito
    const idx = ((i % len) + len) % len;

    slides.forEach(s=>s.classList.remove("is-active"));
    slides[idx].classList.add("is-active");
    dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));
    track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});

    // Título 1-línea
    const sys = cfg._activeSys || cfg.defaultSys;
    const reels = (cfg.reelsBySys[sys] || []);
    setSingleLineReelTitle(cfg, reels[idx]?.title || "");
    stopAllReels();
  };

  prev?.addEventListener("click",()=>{
    const slides=slidesFor();
    if(slides.length <= 1) return;
    const i=slides.findIndex(s=>s.classList.contains("is-active"));
    goTo(i-1);
  });

  next?.addEventListener("click",()=>{
    const slides=slidesFor();
    if(slides.length <= 1) return;
    const i=slides.findIndex(s=>s.classList.contains("is-active"));
    goTo(i+1);
  });

  cfg._activeSys = cfg.defaultSys;
  buildReelsSlides(panelKey, cfg.defaultSys);
}

/* =========================
   YT Lite (sección #videos)
   ========================= */
function initYTLiteVideos(){
  $$(".yt-lite").forEach(node=>{
    if(node.dataset.ytReady==="1") return;
    const id=node.dataset.ytid, title=node.dataset.title||"Video";
    if(!id) return;

    node.dataset.ytReady="1";
    const thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    node.innerHTML=`<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}">
      <span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span>
      <span class="yt-lite-play"></span>
    </button>`;

    node.addEventListener("click",()=>{
      if(node.dataset.ytLoaded==="1") return;
      stopAllReels();
      node.innerHTML=`<iframe class="yt-iframe"
        src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
        title="${title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      node.dataset.ytLoaded="1";
    });
  });
}

/* =========================
   FAQ (solo 1 abierto)
   ========================= */
function initFAQ(){
  document.querySelectorAll(".faq-item").forEach(item=>{
    item.addEventListener("toggle",()=>{
      if(!item.open) return;
      document.querySelectorAll(".faq-item").forEach(other=>{
        if(other!==item) other.removeAttribute("open");
      });
    });
  });
}

/* =========================
   Init principal
   ========================= */
window.addEventListener("DOMContentLoaded",async()=>{
  await Promise.all([
    loadPartial("header-placeholder","global-header.html"),
    loadPartial("footer-placeholder","global-footer.html")
  ]);
  // initHeaderLogic(); // NO: el header partial ya lo hace
  initHeroGallery();


  // init carouseles de reels
  ["contable","comercial","nube","productividad","servicios"].forEach(initReelsCarousel);

  // tabs de reels
  $$(".reel-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      const panelKey=tab.dataset.panel, sysKey=tab.dataset.sys;
      if(!panelKey||!sysKey) return;

      const cfg = REELS_DATA[panelKey];
      if(cfg) cfg._activeSys = sysKey;

      stopAllReels();

      // active tab por panel
      $$(".reel-tab").forEach(t=>{
        if(t.dataset.panel===panelKey) t.classList.toggle("active",t===tab);
      });

      buildReelsSlides(panelKey, sysKey);
    });
  });

  initYTLiteVideos();
  initFAQ();

  const yearSpan=document.getElementById("gf-year");
  if(yearSpan) yearSpan.textContent=new Date().getFullYear();
});
})();

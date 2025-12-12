/* Expiriti index.js (COMPLETO + COMPACTO, con comentarios por secciones) */
(function(){
"use strict";
if(window.__EXPIRITI_INIT__) return; window.__EXPIRITI_INIT__=true;

/* =========================
   Helpers DOM + Rutas
   ========================= */
const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const $=(s,c=document)=>c.querySelector(s);

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

  // hrefs en parciales: <a class="js-abs-href" data-href="SISTEMAS/contabilidad.html#x">
  $$('.js-abs-href[data-href]').forEach(a=>{
    const raw=a.getAttribute("data-href")||"";
    const parts=raw.split("#");
    const path=parts[0], hash=parts[1];
    if(base==="../" && !raw.startsWith("http") && !raw.startsWith("#")){
      a.href=base+path+(hash?"#"+hash:"");
    }else a.href=raw;
  });

  // imgs en parciales: <img class="js-abs-src" data-src="IMG/logo.webp">
  $$('.js-abs-src[data-src]').forEach(img=>{
    const raw=img.getAttribute("data-src")||"";
    img.src=absAsset(raw);
    img.onload=()=>{img.style.opacity="1";};
    if(img.complete) img.style.opacity="1";
  });

  // burger
  const burger=$("#gh-burger"), nav=$(".gh-nav");
  if(burger&&nav){
    burger.addEventListener("click",()=>{
      nav.classList.toggle("open");
      burger.textContent=nav.classList.contains("open")?"✕":"≡";
    });
  }

  // activo por sección (si tu header usa data-section)
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
   Tabs Productos (4 paneles)
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
   Promos filtro
   ========================= */
const promoBtns=$$(".promo-btn");
const promoImgs=$$('#promoGrid [data-type]');
function setPromoFilter(type){
  promoBtns.forEach(b=>b.classList.toggle("active",b.dataset.filter===type));
  promoImgs.forEach(img=>{img.style.display=(img.dataset.type===type)?"":"none";});
}
promoBtns.forEach(b=>b.addEventListener("click",()=>setPromoFilter(b.dataset.filter)));
if(promoBtns.length) setPromoFilter("nuevos");

/* =========================
   Cards clicables (data-href)
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
      {src:"IMG/contamate.webp",title:"Contabilidad · Auxiliares y balanza"},
      {src:"IMG/3conta.webp",title:"Contabilidad · Pólizas y reportes"},
      {src:"IMG/conta%20ybancos.webp",title:"Contabilidad · Auxiliares y balanza"},
      {src:"IMG/impuestos%20sin%20estres%20conta%20y%20bancos.webp",title:"Impuestos sin estrés"},
      {src:"IMG/1conta.webp",title:"Contabilidad · Auxiliares y balanza"},
      {src:"IMG/conta%20y%20bancos%202.webp",title:"Contabilidad · Auxiliares y balanza"},
      {src:"IMG/contacfdi.webp",title:"Contabilidad · Auxiliares y balanza"},
      {src:"IMG/contadesglo.webp",title:"Contabilidad · Auxiliares y balanza"}
    ]},
    nominas:{label:"Nóminas",icon:"IMG/nominassq.webp",images:[
      {src:"IMG/primera.webp",title:"Nóminas · Bitácora de operaciones"},
      {src:"IMG/490962328_1082897360538668_175183934644162321_n.webp",title:"Nóminas · Recibos y timbrado"},
      {src:"IMG/NOMINAS.webp",title:"Nóminas · Recibos y timbrado"},
      {src:"IMG/ptu.webp",title:"Nóminas · Calcula PTU con precisión"},
      {src:"IMG/posible.webp",title:"Nóminas · Conexión INFONAVIT"},
      {src:"IMG/COMENTARIOS%20USUARIOS.webp",title:"Nóminas · Calcula PTU con precisión"},
      {src:"IMG/COMMENTS%20ESTRELLAS%201.webp",title:"Nóminas · Calcula PTU con precisión"},
      {src:"IMG/nomtraza.webp",title:"Nóminas · Recibos y timbrado"},
      {src:"IMG/nommovs.webp",title:"Nóminas · Recibos y timbrado"},
      {src:"IMG/nomisr.webp",title:"Nóminas · Recibos y timbrado"},
      {src:"IMG/nomiequi.webp",title:"Nóminas · Recibos y timbrado"},
      {src:"IMG/nomentrega.webp",title:"Nóminas · Recibos y timbrado"}
    ]},
    bancos:{label:"Bancos",icon:"IMG/bancossq.webp",images:[
      {src:"IMG/efectivamente.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/olvida.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/CONTROL%20MOVIMIENTOS%20BANCARIOS.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/CARRUSEL%20CONECTA%201jpg.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/CARRUSEL%20CONECTA%202.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/PAGARAN.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/proyecta.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/revisas.webp",title:"Bancos · Conciliación bancaria"},
      {src:"IMG/bancosperso.webp",title:"Bancos · Conciliación bancaria"}
    ]},
    xml:{label:"XML en Línea+",icon:"IMG/xmlsq.webp",images:[
      {src:"IMG/dos.webp",title:"XML en Línea+ · Descarga de CFDI"},
      {src:"IMG/SOFTWARE%20FAVORITO%201.webp",title:"XML en Línea+ · Descarga de CFDI"},
      {src:"IMG/SOFTWARE%20FAVORITO%202.webp",title:"XML en Línea+ · Descarga de CFDI"}
    ]}
  }},
  comercial:{label:"Comerciales",defaultSys:"start",systems:{
    start:{label:"Comercial Start",icon:"IMG/comercialstartsq.webp",images:[
      {src:"IMG/comercialstart.webp",title:"Start · Ventas e inventario básico"}
    ]},
    pro:{label:"Comercial Pro",icon:"IMG/comercialprosq.webp",images:[
      {src:"IMG/captura%20manual.webp",title:"Pro · Operaciones de alto volumen"},
      {src:"IMG/procumple.webp",title:"Pro · Operaciones de alto volumen"},
      {src:"IMG/prorenta.webp",title:"Pro · Operaciones de alto volumen"},
      {src:"IMG/COMPRAVENTA.webp",title:"Pro · Operaciones de alto volumen"},
      {src:"IMG/FUNCIONES%20%PRO.webp",title:"Pro · Operaciones de alto volumen"},
      {src:"IMG/FUNCIONES%20%PRO2.webp",title:"Pro · Operaciones de alto volumen"},
      {src:"IMG/MODULO.webp",title:"Pro · Operaciones de alto volumen"}
    ]},
    premium:{label:"Comercial Premium",icon:"IMG/comercialpremiumsq.webp",images:[
      {src:"IMG/desde%20compras%20ventas%20traslados.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/INVENTARIO%20Y%20VENTAS.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/LIGAS%20DE%20PAGO.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/NOTAS%20DE%20VENTA.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/COSTOS%20Y%20UTILIDADES.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/INVENTARIOS,%20FINANZAS%20jpg.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/STOCK.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/comportamiento.webp",title:"Premium · Políticas y listas de precio"},
      {src:"IMG/premtrans.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/premrutas.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/prempro.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/premdash.webp",title:"Factura electrónica · Timbrado CFDI 4.0"}
    ]},
    factura:{label:"Factura electrónica",icon:"IMG/facturasq.webp",images:[
      {src:"IMG/INCLUYE%201.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/INCLUYE%202.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/INCLUYE%203.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/CARACTERISTICAS%202.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/CARACTERISTICAS%203.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/carta%20porte.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/CONTROLA.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/solucion%20facil.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/facinfo.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/facpreo.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/factiemp.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/factimbra.webp",title:"Factura electrónica · Timbrado CFDI 4.0"},
      {src:"IMG/factserv.webp",title:"Factura electrónica · Timbrado CFDI 4.0"}
    ]}
  }},
  nube:{label:"En la Nube",defaultSys:"analiza",systems:{
    analiza:{label:"Analiza",icon:"IMG/analiza.webp",images:[
      {src:"IMG/04%20Analiza%20discrepancias.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/04%20Analiza%20reportes.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/anadecide.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/ananocuadr.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/analizarespues.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/analizareportes.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/analizadescuadr.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/analizacorrige.webp",title:"Analiza · Dashboard ejecutivo"},
      {src:"IMG/analizacfdi.webp",title:"Analiza · Dashboard ejecutivo"}
    ]},
    contabiliza:{label:"Contabiliza",icon:"IMG/contabiliza.webp",images:[
      {src:"IMG/contatranq.webp",title:"Contabiliza · Contabilidad en la nube"},
      {src:"IMG/contaclari.webp",title:"Contabiliza · Contabilidad en la nube"},
      {src:"IMG/contabprocesos.webp",title:"Contabiliza · Contabilidad en la nube"},
      {src:"IMG/contabireal.webp",title:"Contabiliza · Contabilidad en la nube"}
    ]},
    despachos:{label:"Despachos",icon:"IMG/despachos.webp",images:[
      {src:"IMG/despachos.webp",title:"Despachos · Gestión de despachos en la nube"}
    ]},
    vende:{label:"Vende",icon:"IMG/vende.webp",images:[
      {src:"IMG/vendevendes.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/vendesigue.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/vendexml.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/vendesegui.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/venderuta.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/vendequien.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/vendemarca.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/vendekpis.webp",title:"Vende · Punto de venta en la nube"},
      {src:"IMG/vendeayu.webp",title:"Vende · Punto de venta en la nube"}
    ]}
  }},
  productividad:{label:"Productividad",defaultSys:"evalua",systems:{
    evalua:{label:"Evalúa",icon:"IMG/evalua.webp",images:[
      {src:"IMG/evaluaencu.webp",title:"Evalúa · Encuestas y clima laboral"},
      {src:"IMG/evaluabien.webp",title:"Evalúa · Encuestas y clima laboral"},
      {src:"IMG/nom37.webp",title:"Evalúa · Encuestas y clima laboral"}
    ]},
    colabora:{label:"Colabora",icon:"IMG/colabora.webp",images:[
      {src:"IMG/colabacceso.webp",title:"Colabora · App sin costo para tu equipo"},
      {src:"IMG/colabtoda.webp",title:"Colabora · App sin costo para tu equipo"},
      {src:"IMG/colacentra.webp",title:"Colabora · App sin costo para tu equipo"},
      {src:"IMG/colacola.webp",title:"Colabora · App sin costo para tu equipo"}
    ]},
    personia:{label:"Personia",icon:"IMG/personia.webp",images:[
      {src:"IMG/personiaseg.webp",title:"Personia · Expedientes de empleados"},
      {src:"IMG/personmas.webp",title:"Personia · Expedientes de empleados"},
      {src:"IMG/personiaptu.webp",title:"Personia · Expedientes de empleados"},
      {src:"IMG/persobime.webp",title:"Personia · Expedientes de empleados"}
    ]}
  }}
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
  const {carousel,titleEl,defaultGroup}=HERO_GALLERY; if(!carousel) return;
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
      if(titleEl) titleEl.textContent=item.title||sys.label;
    });
    nav.appendChild(dot);
  });

  if(titleEl) titleEl.textContent=sys.images[0]?.title||sys.label;
}

function buildHeroSystemTabs(groupKey){
  const g=HERO_GALLERY_DATA[groupKey]; if(!g) return;
  const c=HERO_GALLERY.tabsContainer; if(!c) return;
  c.innerHTML="";
  const def=g.defaultSys;

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

function initHeroGallery(){
  const {groupNav,defaultGroup,carousel}=HERO_GALLERY;
  if(!groupNav||!carousel) return;

  groupNav.innerHTML="";
  Object.entries(HERO_GALLERY_DATA).forEach(([groupKey,group])=>{
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
  const dotsFor=()=>$$(".dot",carousel.querySelector(".carousel-nav"));
  const goTo=i=>{
    const slides=slidesFor(); if(!slides.length) return;
    const max=slides.length-1; const idx=Math.max(0,Math.min(max,i));
    slides.forEach(s=>s.classList.remove("is-active"));
    slides[idx].classList.add("is-active");
    dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));
    track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
    const g=HERO_GALLERY_DATA[$(".hero-group-tab.active",groupNav)?.dataset.group||defaultGroup];
    const activeSys=$(".hero-tab.active",HERO_GALLERY.tabsContainer)?.dataset.sys||g.defaultSys;
    const title=g.systems[activeSys]?.images?.[idx]?.title;
    if(HERO_GALLERY.titleEl) HERO_GALLERY.titleEl.textContent=title||"";
  };
  prev?.addEventListener("click",()=>{ const i=slidesFor().findIndex(s=>s.classList.contains("is-active")); goTo(i-1); });
  next?.addEventListener("click",()=>{ const i=slidesFor().findIndex(s=>s.classList.contains("is-active")); goTo(i+1); });

  // estado inicial
  const cfg=HERO_GALLERY_DATA[defaultGroup];
  buildHeroSystemTabs(defaultGroup);
  buildHeroGallerySlides(defaultGroup,cfg.defaultSys);
}

/* =========================
   REELS: DATA
   ========================= */
const REELS_DATA={
  contable:{titleEl:$("#reelTitle-contable"),carousel:$("#carouselReels-contable"),defaultSys:"contabilidad",reelsBySys:{
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
  }},
  comercial:{titleEl:$("#reelTitle-comercial"),carousel:$("#carouselReels-comercial"),defaultSys:"start",reelsBySys:{
    start:[
      {id:"dQw4w9WgXcQ",title:"Comercial Start | Reel 1"},
      {id:"9bZkp7q19f0",title:"Comercial Start | Reel 2"},
      {id:"3JZ_D3ELwOQ",title:"Comercial Start | Reel 3"}
    ],
    pro:[
      {id:"rEYzPXOX1_Y",title:"Comercial Pro: control total de inventario"},
      {id:"-SJq6t2SM7c",title:"Flujo completo con Comercial Pro"},
      {id:"5AowfYsAm4E",title:"Trazabilidad avanzada en inventarios"}
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
  }},
  nube:{titleEl:$("#reelTitle-nube"),carousel:$("#carouselReels-nube"),defaultSys:"analiza",reelsBySys:{
    analiza:[
      {id:"wr-eeR3eE7w",title:"Analiza | Conciliación fiscal y bancaria"},
      {id:"gAIGxMHaCLQ",title:"Analiza | Identifica descuadres CFDIs y Nóminas"},
      {id:"iEQM_21OmBI",title:"Conciliación fiscal y contable con Analiza"}
    ],
    contabiliza:[{id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"}],
    despachos:[
      {id:"KBEOTwnFXQ4",title:"Gestión de Despachos en la nube"},
      {id:"aqz-KE-bpKQ",title:"Control de obligaciones con Despachos"}
    ],
    vende:[
      {id:"2Ty_SD8B_FU",title:"Vende | Carta Porte fácil y rápida"},
      {id:"UPyufjDByNc",title:"Testimonio CONTPAQi Vende"},
      {id:"Grx1woHMGsU",title:"Vende en la nube"}
    ]
  }},
  productividad:{titleEl:$("#reelTitle-productividad"),carousel:$("#carouselReels-productividad"),defaultSys:"evalua",reelsBySys:{
    evalua:[
      {id:"REEMPLAZAR_ID_1",title:"Reel Evalúa 1"},
      {id:"REEMPLAZAR_ID_2",title:"Reel Evalúa 2"},
      {id:"REEMPLAZAR_ID_3",title:"Reel Evalúa 3"}
    ],
    colabora:[
      {id:"XJQDFDowH0U",title:"Colabora, app sin costo con Nóminas"},
      {id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"}
    ],
    personia:[{id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"}]
  }},
  servicios:{titleEl:$("#reelTitle-servicios"),carousel:$("#carouselReels-servicios"),defaultSys:"implementaciones",reelsBySys:{
    implementaciones:[{id:"aHGJ-TNpJ-U",title:"Testimonio Martha: Implementación Contable"}],
    migraciones:[{id:"JkrDOjWV1Gs",title:"Migración de datos a CONTPAQi"}],
    desarrollos:[
      {id:"JkrDOjWV1Gs",title:"Testimonio Sara: Soft Restaurant"},
      {id:"uBl5UWkwbr8",title:"Testimonio Luis: Desarrollo en Nóminas"},
      {id:"f-F10-F6rnM",title:"Testimonio Alex: Integración CONTPAQi API"}
    ],
    servidores:[{id:"Grx1woHMGsU",title:"Servidores Virtuales para CONTPAQi"}],
    cursos:[{id:"TgAkwNt4YCA",title:"Testimonio Ana: Curso Contabilidad"}],
    soporte:[{id:"IoHjV2QG_3U",title:"Testimonio Marco: Soporte eficaz"}]
  }}
};

function renderReelThumb(wrap){
  const id=wrap.dataset.ytid; if(!id) return;
  const title=wrap.dataset.title||"";
  wrap.innerHTML=`<button class="yt-thumb" type="button" aria-label="Reproducir: ${title}">
    <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" loading="lazy" decoding="async" width="480" height="270"
      alt="${title}" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg';">
    <span class="yt-play"></span>
  </button>`;
  wrap.querySelector(".yt-thumb")?.addEventListener("click",()=>{ stopAllReels(); renderReelIframe(wrap); });
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

   
}
function stopAllReels(){
  document.querySelectorAll(".reel-embed").forEach(w=>{
    if(!w.dataset.ytid) return;
    renderReelThumb(w);
  });
}

function buildReelsSlides(panelKey,sysKey){
  const cfg=REELS_DATA[panelKey]; if(!cfg) return;
  const track=cfg.carousel?.querySelector(".carousel-track");
  const nav=cfg.carousel?.querySelector(".carousel-nav");
  if(!track||!nav) return;

  const reels=(cfg.reelsBySys[sysKey]||[]);
  track.innerHTML=""; nav.innerHTML="";

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
      if(cfg.titleEl) cfg.titleEl.textContent=reel.title||"";
    });
    nav.appendChild(dot);
  });

  if(cfg.titleEl) cfg.titleEl.textContent=reels[0]?.title||"";
}

function initReelsCarousel(panelKey){
  const cfg=REELS_DATA[panelKey]; if(!cfg||!cfg.carousel) return;
  const track=cfg.carousel.querySelector(".carousel-track");
  const prev=cfg.carousel.querySelector(".arrowCircle.prev");
  const next=cfg.carousel.querySelector(".arrowCircle.next");
  const slidesFor=()=>$$(".carousel-slide",track);
  const dotsFor=()=>$$(".carousel-nav .dot",cfg.carousel);

  const goTo=i=>{
    const slides=slidesFor(); if(!slides.length) return;
    const max=slides.length-1; const idx=Math.max(0,Math.min(max,i));
    slides.forEach(s=>s.classList.remove("is-active"));
    slides[idx].classList.add("is-active");
    dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));
    track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
    stopAllReels();
  };

  prev?.addEventListener("click",()=>{ const i=slidesFor().findIndex(s=>s.classList.contains("is-active")); goTo(i-1); });
  next?.addEventListener("click",()=>{ const i=slidesFor().findIndex(s=>s.classList.contains("is-active")); goTo(i+1); });

  buildReelsSlides(panelKey,cfg.defaultSys);
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

  initHeaderLogic();
  initHeroGallery();

  ["contable","comercial","nube","productividad","servicios"].forEach(initReelsCarousel);

  // tabs de reels
  $$(".reel-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      const panelKey=tab.dataset.panel, sysKey=tab.dataset.sys;
      if(!panelKey||!sysKey) return;
      stopAllReels();
      $$(".reel-tab").forEach(t=>{ if(t.dataset.panel===panelKey) t.classList.toggle("active",t===tab); });
      buildReelsSlides(panelKey,sysKey);
    });
  });

  initYTLiteVideos();     // (ANTES tenías initSimpleThumbs() y eso tronaba)
  initFAQ();

  const yearSpan=document.getElementById("gf-year");
  if(yearSpan) yearSpan.textContent=new Date().getFullYear();
});
})();

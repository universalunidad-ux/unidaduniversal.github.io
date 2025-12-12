/* =========================================================
   Expiriti · JS ÚNICO COMPLETO (Hero + Reels + Forms + Header)
   - Un solo IIFE
   - Candado anti doble init
   ========================================================= */
(function(){
"use strict";
if(window.__EXPIRITI_INIT__)return;window.__EXPIRITI_INIT__=true;

/* ---------- Helpers ---------- */
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));

/* ---------- Base path (para páginas dentro de /SISTEMAS/ o /SERVICIOS/) ---------- */
function getBasePath(){
  const p=location.pathname;
  return(/\/(SISTEMAS|SERVICIOS|PDFS|CSS)\//.test(p))?"../":"./";
}

/* ---------- Partials ---------- */
async function loadPartial(id,file){
  try{
    const el=document.getElementById(id); if(!el)return;
    const url=`${getBasePath()}PARTIALS/${file}?v=${Date.now()}`;
    const r=await fetch(url);
    if(r.ok) el.innerHTML=await r.text();
  }catch(e){console.error("Partial error:",file,e);}
}

/* ---------- Header logic ---------- */
function initHeader(){
  const base=getBasePath();

  /* data-href => href correcto según carpeta */
  $$(".js-abs-href[data-href]").forEach(a=>{
    const raw=a.getAttribute("data-href")||"";
    const parts=raw.split("#"),path=parts[0],hash=parts[1];
    if(base==="../"&&!raw.startsWith("http")&&!raw.startsWith("#")){
      a.href=base+path+(hash?"#"+hash:"");
    }else a.href=raw;
  });

  /* data-src => src correcto según carpeta */
  $$(".js-abs-src[data-src]").forEach(img=>{
    const raw=img.getAttribute("data-src")||"";
    img.src=(base==="../"&&!raw.startsWith("http"))?base+raw:raw;
    img.onload=()=>img.style.opacity="1";
    if(img.complete)img.style.opacity="1";
  });

  /* burger */
  const burger=$("#gh-burger"),nav=$(".gh-nav");
  if(burger&&nav){
    burger.addEventListener("click",()=>{
      nav.classList.toggle("open");
      burger.textContent=nav.classList.contains("open")?"✕":"≡";
    });
  }

  /* active state */
  const p=location.pathname.toUpperCase(),h=location.hash;
  let sec="inicio";
  if(p.includes("/SISTEMAS/"))sec="sistemas";
  else if(p.includes("/SERVICIOS/"))sec="servicios";
  else if(h==="#servicios")sec="servicios";
  else if(h==="#promociones")sec="promociones";
  else if(h==="#productos"||h==="#productos-con")sec="sistemas";
  else if(h==="#contacto")sec="contacto";
  else if(p.includes("/NOSOTROS"))sec="nosotros";
  $$("[data-section]").forEach(a=>a.classList.toggle("gh-active",a.getAttribute("data-section")===sec));
}

/* ---------- Forms (WhatsApp) ---------- */
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

/* ---------- Product Tabs ---------- */
(function(){
  const tabs=$$(".prod-tabs .tab"),panels=$$(".panel-productos");
  if(!tabs.length||!panels.length)return;
  const go=btn=>{
    const id=btn.dataset.target; if(!id)return;
    tabs.forEach(t=>t.classList.toggle("active",t===btn));
    panels.forEach(p=>p.classList.toggle("hidden",p.id!==id));
  };
  tabs.forEach(t=>t.addEventListener("click",()=>go(t)));
  go(document.getElementById("tab-contable")||tabs[0]);
})();

/* ---------- Promo Filter ---------- */
(function(){
  const btns=$$(".promo-btn"),imgs=$$('#promoGrid [data-type]');
  if(!btns.length||!imgs.length)return;
  const set=t=>{
    btns.forEach(b=>b.classList.toggle("active",b.dataset.filter===t));
    imgs.forEach(img=>img.style.display=img.dataset.type===t?"":"none");
  };
  btns.forEach(b=>b.addEventListener("click",()=>set(b.dataset.filter)));
  set("nuevos");
})();

/* ---------- Clickable cards ---------- */
$$(".card.product-card[data-href], .product-card[data-href]").forEach(card=>{
  const href=card.getAttribute("data-href")||card.dataset.href;
  card.addEventListener("click",e=>{
    if(e.target.closest("a"))return;
    if(href)location.href=href;
  });
});

/* =========================================================
   HERO GALLERY DATA (TU INFO COMPLETA)
   ========================================================= */
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
    start:{label:"Comercial Start",icon:"IMG/comercialstartsq.webp",images:[{src:"IMG/comercialstart.webp",title:"Start · Ventas e inventario básico"}]},
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
    despachos:{label:"Despachos",icon:"IMG/despachos.webp",images:[{src:"IMG/despachos.webp",title:"Despachos · Gestión de despachos en la nube"}]},
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

/* =========================================================
   HERO GALLERY (render)
   ========================================================= */
const HERO={nav:$("#heroGalleryGroups"),tabs:$("#heroGalleryTabs"),title:$("#heroGalleryTitle"),car:$("#heroGalleryCarousel"),def:"contable"};
function heroSlides(groupKey,sysKey){
  const base=getBasePath();
  const cfg=HERO_GALLERY_DATA[groupKey]; if(!cfg)return;
  const sys=cfg.systems[sysKey]; if(!sys||!sys.images?.length)return;
  const track=$(".carousel-track",HERO.car),nav=$(".carousel-nav",HERO.car);
  if(!track||!nav)return;
  track.innerHTML=""; nav.innerHTML="";
  sys.images.forEach((it,i)=>{
    const slide=document.createElement("div");
    slide.className="carousel-slide hero-slide"+(i===0?" is-active":"");
    const img=document.createElement("img");
    img.src=(base==="../")?base+it.src:it.src;
    img.alt=it.title||sys.label;
    img.decoding="async";
    img.loading=(i===0&&groupKey===HERO.def&&sysKey===cfg.defaultSys)?"eager":"lazy";
    if(img.loading==="eager") img.setAttribute("fetchpriority","high");
    slide.appendChild(img);
    track.appendChild(slide);

    const dot=document.createElement("button");
    dot.type="button";
    dot.className="dot"+(i===0?" active":"");
    dot.setAttribute("aria-label","Ir a imagen "+(i+1));
    dot.addEventListener("click",()=>{
      $$(".carousel-slide",track).forEach(s=>s.classList.remove("is-active"));
      slide.classList.add("is-active");
      $$(".dot",nav).forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
    });
    nav.appendChild(dot);
  });
  HERO.title && (HERO.title.textContent=sys.images[0]?.title||sys.label);
}
function heroTabs(groupKey){
  const base=getBasePath();
  const cfg=HERO_GALLERY_DATA[groupKey]; if(!cfg||!HERO.tabs)return;
  HERO.tabs.innerHTML="";
  Object.entries(cfg.systems).forEach(([sysKey,sys])=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="hero-tab"+(sysKey===cfg.defaultSys?" active":"");
    const icon=(base==="../")?base+sys.icon:sys.icon;
    btn.innerHTML=`<img src="${icon}" alt="${sys.label}" width="56" height="56" loading="lazy" decoding="async"><span>${sys.label}</span>`;
    btn.addEventListener("click",()=>{
      $$(".hero-tab",HERO.tabs).forEach(b=>b.classList.toggle("active",b===btn));
      heroSlides(groupKey,sysKey);
    });
    HERO.tabs.appendChild(btn);
  });
}
function initHero(){
  if(!HERO.nav||!HERO.car)return;
  HERO.nav.innerHTML="";
  Object.entries(HERO_GALLERY_DATA).forEach(([g,group])=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="hero-group-tab"+(g===HERO.def?" active":"");
    btn.textContent=group.label;
    btn.addEventListener("click",()=>{
      $$(".hero-group-tab",HERO.nav).forEach(b=>b.classList.toggle("active",b===btn));
      heroTabs(g);
      heroSlides(g,group.defaultSys);
    });
    HERO.nav.appendChild(btn);
  });
  heroTabs(HERO.def);
  heroSlides(HERO.def,HERO_GALLERY_DATA[HERO.def].defaultSys);

  const track=$(".carousel-track",HERO.car);
  const prev=$(".arrowCircle.prev",HERO.car);
  const next=$(".arrowCircle.next",HERO.car);
  const slidesFor=()=>$$(".carousel-slide",track);
  const dotsFor=()=>$$(".dot",$(".carousel-nav",HERO.car));
  const goTo=i=>{
    const s=slidesFor(); if(!s.length)return;
    const idx=Math.max(0,Math.min(s.length-1,i));
    s.forEach(x=>x.classList.remove("is-active"));
    s[idx].classList.add("is-active");
    dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));
    track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
  };
  prev?.addEventListener("click",()=>goTo(slidesFor().findIndex(x=>x.classList.contains("is-active"))-1));
  next?.addEventListener("click",()=>goTo(slidesFor().findIndex(x=>x.classList.contains("is-active"))+1));
}

/* =========================================================
   REELS DATA (TU INFO COMPLETA)
   ========================================================= */
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
    xml:[{id:"nhoUDNnGQ90",title:"El día que José dejó de sufrir con el SAT descargando CFDIs"}]
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

/* ---------- Reels rendering ---------- */
function renderReelThumb(w){
  const id=w.dataset.ytid,title=w.dataset.title||"";
  w.innerHTML=`<button class="yt-thumb" type="button" aria-label="Reproducir: ${title}">
    <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" loading="lazy" decoding="async" width="480" height="270"
      alt="${title}" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg';">
    <span class="yt-play"></span></button>`;
  w.querySelector(".yt-thumb")?.addEventListener("click",()=>{stopAllReels();renderReelIframe(w);});
}
function renderReelIframe(w){
  const id=w.dataset.ytid,title=w.dataset.title||"";
  w.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1"
    title="${title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}
function stopAllReels(){
  $$(".reel-embed").forEach(w=>w.dataset.ytid&&renderReelThumb(w));
}
function buildReelsSlides(panelKey,sysKey){
  const cfg=REELS_DATA[panelKey]; if(!cfg)return;
  const {carousel,titleEl,reelsBySys}=cfg;
  const track=carousel?.querySelector(".carousel-track");
  const nav=carousel?.querySelector(".carousel-nav");
  if(!track||!nav)return;
  const reels=reelsBySys[sysKey]||[];
  track.innerHTML=""; nav.innerHTML="";
  reels.forEach((reel,idx)=>{
    const slide=document.createElement("div");
    slide.className="carousel-slide"+(idx===0?" is-active":"");
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
    dot.addEventListener("click",()=>{
      $$(".carousel-slide",track).forEach(s=>s.classList.remove("is-active"));
      slide.classList.add("is-active");
      $$(".dot",nav).forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
      stopAllReels();
    });
    nav.appendChild(dot);
  });
  if(titleEl)titleEl.textContent=reels[0]?.title||"";
}
function initReelsCarousel(panelKey){
  const cfg=REELS_DATA[panelKey]; if(!cfg||!cfg.carousel)return;
  const car=cfg.carousel,track=$(".carousel-track",car);
  const slidesFor=()=>$$(".carousel-slide",track);
  const navDots=()=>$$(".carousel-nav .dot",car);
  const goTo=i=>{
    const s=slidesFor(); if(!s.length)return;
    const idx=Math.max(0,Math.min(s.length-1,i));
    s.forEach(x=>x.classList.remove("is-active"));
    s[idx].classList.add("is-active");
    navDots().forEach((d,k)=>d.classList.toggle("active",k===idx));
    track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
  };
  $(".arrowCircle.prev",car)?.addEventListener("click",()=>{stopAllReels();goTo(slidesFor().findIndex(x=>x.classList.contains("is-active"))-1);});
  $(".arrowCircle.next",car)?.addEventListener("click",()=>{stopAllReels();goTo(slidesFor().findIndex(x=>x.classList.contains("is-active"))+1);});
  buildReelsSlides(panelKey,cfg.defaultSys);
}

/* ---------- Videos normales tipo yt-lite (si los usas fuera de reels) ---------- */
function initYTLiteVideos(){
  $$(".yt-lite").forEach(node=>{
    if(node.dataset.ytReady==="1")return;
    const id=node.dataset.ytid,title=node.dataset.title||"Video";
    if(!id)return;
    node.dataset.ytReady="1";
    const thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    node.innerHTML=`<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}">
      <span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span>
      <span class="yt-lite-play"></span></button>`;
    node.addEventListener("click",()=>{
      if(node.dataset.ytLoaded==="1")return;
      stopAllReels();
      node.innerHTML=`<iframe class="yt-iframe"
        src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
        title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      node.dataset.ytLoaded="1";
    });
  });
}

/* ---------- FAQ ---------- */
function initFAQ(){
  $$(".faq-item").forEach(item=>{
    item.addEventListener("toggle",()=>{
      if(!item.open)return;
      $$(".faq-item").forEach(o=>o!==item&&o.removeAttribute("open"));
    });
  });
}

/* =========================================================
   INIT
   ========================================================= */
addEventListener("DOMContentLoaded",async()=>{
  await Promise.all([
    loadPartial("header-placeholder","global-header.html"),
    loadPartial("footer-placeholder","global-footer.html")
  ]);
  initHeader();
  initHero();
  ["contable","comercial","nube","productividad","servicios"].forEach(initReelsCarousel);

  /* tabs de reels (si tienes botones .reel-tab) */
  $$(".reel-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      const panel=tab.dataset.panel,sys=tab.dataset.sys;
      if(!panel||!sys)return;
      stopAllReels();
      $$(".reel-tab").forEach(t=>{
        if(t.dataset.panel===panel)t.classList.toggle("active",t===tab);
      });
      buildReelsSlides(panel,sys);
    });
  });

  initYTLiteVideos();
  initFAQ();
  const y=$("#gf-year"); if(y)y.textContent=new Date().getFullYear();
});

})();

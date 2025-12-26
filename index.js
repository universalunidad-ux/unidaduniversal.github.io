/* =========================================================
   Expiriti - index.js (FINAL V6 MIN+FIX+WHEEL+HARDENED) — PATCHED
   - SIN conflicto de $/$$
   - Parciales robustos + normaliza rutas (GH Pages + local)
   - Wheel patch SOLO si hay overflow horizontal
   - Listeners “bound” (evita duplicados)
   - HERO Gallery: grupos + tabs + dots + arrows + scroll sync (FIX offsetLeft)
   - REELS: título 1-línea (FIX determinístico) + flechas off si 1 + scroll/trackpad sync
   - Servicios: pager 2x2 (mobile) + dots (FIX width)
   - Promos: filtro (FIX hidden + display)
   - BFCache safe
   ========================================================= */
(function(){ "use strict";
  if(window.__EXPIRITI_INDEX_INIT__) return; window.__EXPIRITI_INDEX_INIT__=true;

  /* =========================
     0) Helpers DOM (SIN $/$$)
  ========================= */
  const Q=(s,c=document)=>c.querySelector(s), QA=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const on=(el,ev,fn,opt)=>{ if(el) el.addEventListener(ev,fn,opt); };
  const safe=(fn)=>{ try{ fn(); }catch(_){ } };

  /* =========================
     1) Rutas (GH Pages + local) — FIX profundidad real
     - Antes: depth basado en /SISTEMAS|SERVICIOS|PDFS/ (limitado)
     - Ahora: depth real por # de segmentos (más robusto)
  ========================= */
  const isGh=location.hostname.endsWith("github.io");
  const firstSeg=(location.pathname.split("/")[1]||"").trim();
  const repoBase=(isGh && firstSeg)?("/"+firstSeg):"";

  const pathParts=location.pathname.replace(/\/+$/,"").split("/").filter(Boolean);
  const contentParts=isGh?pathParts.slice(1):pathParts;          // quita repo en GH
  const depth=(contentParts.length>1)?"../".repeat(contentParts.length-1):"./";

  function prefix(path){
    if(!path) return path;
    if(/^(https?:)?\/\//i.test(path)) return path;
    if(/^(mailto:|tel:|data:)/i.test(path)) return path;
    if(path.startsWith("#")) return path;
    const base=isGh?(repoBase+"/"):depth;
    const joined=(base+path).replace(/\\/g,"/");
    return joined.replace(/([^:]\/)\/+/g,"$1");
  }

  function normalizeRoutes(root=document){
    QA(".js-abs-src[data-src]",root).forEach(img=>{
      const raw=img.getAttribute("data-src")||"", fin=prefix(raw);
      if(!img.getAttribute("src")) img.setAttribute("src",fin); else img.src=fin;
      img.style.opacity="1";
    });
    QA(".js-abs-href[data-href]",root).forEach(a=>{
      const raw=a.getAttribute("data-href")||""; if(!raw) return;
      const parts=raw.split("#"), p=parts[0]||"", h=parts[1]||"";
      a.href=prefix(p)+(h?("#"+h):"");
    });
    const y=root.getElementById?.("gf-year")||document.getElementById("gf-year");
    if(y) y.textContent=new Date().getFullYear();
  }

  /* =========================
     2) Parciales (header/footer)
  ========================= */
  async function loadPartial(placeholderId,fileName){
    const ph=document.getElementById(placeholderId); if(!ph) return;
    const cands=[
      prefix(`PARTIALS/${fileName}`),
      (isGh && repoBase?`${repoBase}/PARTIALS/${fileName}`:null),
      (!isGh?`${depth}PARTIALS/${fileName}`:null),
      `/PARTIALS/${fileName}`
    ].filter(Boolean);

    let html="", lastErr=null;
    for(const u of cands){
      try{
        const url=u+(u.includes("?")?"&":"?")+"v="+Date.now();
        const resp=await fetch(url,{cache:"no-store"});
        if(!resp.ok) throw new Error("HTTP "+resp.status+" "+resp.statusText);
        html=await resp.text(); break;
      }catch(e){ lastErr=e; }
    }
    if(!html){ console.warn("[Expiriti] No se pudo cargar partial:",fileName,lastErr); return; }
    ph.outerHTML=html;
  }

  /* =========================
     3) PATCH UX (WHEEL tabs) — SOLO si overflow
  ========================= */
  function bindWheelOnTabs(){
    const sels=".hscroll-tabs,.hero .tabs,.hero .chips,.hero .segmented,#heroTabs,#heroCategories,#sistemasTabs,.sistemas-tabs,#promoTabs,.promo-tabs,.prod-tabs,.hero-gallery-groups,#heroGalleryGroups,.hero-gallery-tabs,#heroGalleryTabs,.promo-filters";
    document.querySelectorAll(sels).forEach(el=>{
      if(el.dataset.wheelBound==="1") return; el.dataset.wheelBound="1";
      on(el,"wheel",(e)=>{
        const hasOverflow=(el.scrollWidth>el.clientWidth+2);
        if(!hasOverflow) return;
        if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){
          el.scrollLeft+=e.deltaY; e.preventDefault();
        }
      },{passive:false});
    });
  }

  /* =========================
     4) Formularios -> WhatsApp (sin duplicar listeners)
  ========================= */
  function initForms(){
    const quickForm=Q("#quickForm");
    if(quickForm && quickForm.dataset.bound!=="1"){
      quickForm.dataset.bound="1";
      on(quickForm,"submit",(e)=>{
        e.preventDefault();
        const modulo=encodeURIComponent((Q("#modulo")?.value||""));
        const mensaje=encodeURIComponent(((Q("#mensaje")?.value||"")).trim());
        const texto=`Hola Expiriti, me interesa ${modulo}. ${mensaje}`;
        window.open(`https://wa.me/525568437918?text=${texto}`,"_blank","noopener");
      });
    }

    const contactForm=Q("#contactForm");
    if(contactForm && contactForm.dataset.bound!=="1"){
      contactForm.dataset.bound="1";
      on(contactForm,"submit",(e)=>{
        e.preventDefault();
        const nombre=encodeURIComponent(((Q("#nombre")?.value||"")).trim());
        const correo=encodeURIComponent(((Q("#correo")?.value||"")).trim());
        const telefono=encodeURIComponent(((Q("#telefono")?.value||"")).trim());
        const interes=encodeURIComponent((Q("#interes")?.value||""));
        const detalle=encodeURIComponent(((Q("#detalle")?.value||"")).trim());
        const texto=`Hola Expiriti, soy ${nombre}. Email: ${correo}. Tel: ${telefono||"N/A"}. Interés: ${interes}. Detalle: ${detalle}`;
        window.open(`https://wa.me/525568437918?text=${texto}`,"_blank","noopener");
      });
    }
  }

  /* =========================
     5) Tabs Productos (sin duplicar)
  ========================= */

  function scrollTabIntoView(btn){
    const wrap = btn?.closest(".prod-tabs");
    if(!wrap) return;

    // Solo si hay overflow horizontal real
    if(wrap.scrollWidth <= wrap.clientWidth + 2) return;

    const wRect = wrap.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();

    // Centrar el botón dentro del contenedor
    const targetLeft =
      wrap.scrollLeft + (bRect.left - wRect.left) - (wRect.width/2 - bRect.width/2);

    wrap.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }

  function initTabsProductos(){
    const tabs = QA(".prod-tabs .tab");
    const panels = QA(".panel-productos");
    if(!tabs.length || !panels.length) return;

    function activar(btn){
      const targetId = btn?.dataset?.target;
      if(!targetId) return;

      tabs.forEach(t => t.classList.toggle("active", t === btn));
      panels.forEach(p => p.classList.toggle("hidden", p.id !== targetId));

      scrollTabIntoView(btn); // ✅ auto-scroll del tab activo (cuando hay overflow)
    }

    tabs.forEach(btn=>{
      if(btn.dataset.bound==="1") return;
      btn.dataset.bound="1";
      on(btn,"click",()=>activar(btn));
    });

    const tabInicial = document.getElementById("tab-contable");
    activar(tabInicial || tabs[0]);
  }


            
  /* =========================
     6) Promos filtro — FIX hidden + display:none
  ========================= */
  function initPromosFilter(){
    const promoBtns=QA(".promo-btn");
    const promoItems=QA("#promoGrid [data-type]");
    if(!promoBtns.length||!promoItems.length) return;

    function setPromoFilter(filter){
      promoBtns.forEach(b=>{
        const act=(b.dataset.filter===filter);
        b.classList.toggle("active",act);
        b.setAttribute("aria-pressed",act?"true":"false");
      });
      promoItems.forEach(el=>{
        const type=(el.dataset.type||"").trim();
        const ok=(filter==="all")||(type===filter);
        el.toggleAttribute("hidden",!ok);
        el.style.display=ok?"":"none";
      });
    }

    promoBtns.forEach(b=>{
      if(b.dataset.bound==="1") return; b.dataset.bound="1";
      on(b,"click",()=>setPromoFilter(b.dataset.filter||"all"));
    });

    setPromoFilter("nuevos");
  }

  /* =========================
     7) Cards clicables (sin duplicar)
  ========================= */
  function initClickableCards(){
    QA(".card.product-card[data-href]").forEach(card=>{
      if(card.dataset.bound==="1") return; card.dataset.bound="1";
      const href=card.getAttribute("data-href");
      on(card,"click",(e)=>{
        if(e.target.closest("a,button,input,select,textarea,label")) return;
        if(href) location.href=prefix(href);
      });
    });
  }

  /* =========================================================
     8) HERO GALLERY: DATA (TUS DATAS)
  ========================================================= */
  const HERO_GALLERY_DATA={
    contable:{label:"Contables",defaultSys:"nominas",systems:{
      contabilidad:{label:"Contabilidad",icon:"IMG/contabilidad.webp",images:[
        {src:"IMG/contamate.webp"},{src:"IMG/contadesglo.webp"},{src:"IMG/conta%20y%20bancos.webp"},
        {src:"IMG/conta%20y%20bancos%202.webp"},{src:"IMG/impuestos%20sin%20estres%20conta%20y%20bancos.webp"},
        {src:"IMG/1conta.webp"},{src:"IMG/conta%20y%20bancos%202.webp"},{src:"IMG/contacfdi.webp"}
      ]},
      nominas:{label:"Nóminas",icon:"IMG/nominas.webp",images:[
        {src:"IMG/primera.webp"},{src:"IMG/nomisr.webp"},{src:"IMG/490962328_1082897360538668_175183934644162321_n.webp"},
        {src:"IMG/NOMINAS.webp"},{src:"IMG/ptu.webp"},{src:"IMG/posible.webp"},{src:"IMG/COMENTARIOS%20USUARIOS.webp"},
        {src:"IMG/COMMENTS%20ESTRELLAS%201.webp"},{src:"IMG/nomtraza.webp"},{src:"IMG/nommovs.webp"},
        {src:"IMG/nomiequi.webp"},{src:"IMG/nomentrega.webp"}
      ]},
      bancos:{label:"Bancos",icon:"IMG/bancos.webp",images:[
        {src:"IMG/efectivamente.webp"},{src:"IMG/olvida.webp"},{src:"IMG/CONTROL%20MOVIMIENTOS%20BANCARIOS.webp"},
        {src:"IMG/CARRUSEL%20CONECTA%201jpg.webp"},{src:"IMG/CARRUSEL%20CONECTA%202.webp"},{src:"IMG/PAGARAN.webp"},
        {src:"IMG/proyecta.webp"},{src:"IMG/revisas.webp"},{src:"IMG/bancosperso.webp"}
      ]},
      xml:{label:"XML en Línea+",icon:"IMG/xml.webp",images:[
        {src:"IMG/dos.webp"},{src:"IMG/SOFTWARE%20FAVORITO%201.webp"},{src:"IMG/SOFTWARE%20FAVORITO%202.webp"}
      ]}
    }},
    comercial:{label:"Comerciales",defaultSys:"pro",systems:{
      pro:{label:"Comercial Pro",icon:"IMG/comercialpro.webp",images:[
        {src:"IMG/captura%20manual.webp"},{src:"IMG/procumple.webp"},{src:"IMG/prorenta.webp"},
        {src:"IMG/COMPRAVENTA.webp"},{src:"IMG/FUNCIONES%20PRO.webp"},{src:"IMG/FUNCIONES%20PRO2.webp"},
        {src:"IMG/MODULO.webp"}
      ]},
      premium:{label:"Comercial Premium",icon:"IMG/comercialpremium.webp",images:[
        {src:"IMG/desde%20compras%20ventas%20traslados.webp"},{src:"IMG/INVENTARIO%20Y%20VENTAS.webp"},
        {src:"IMG/LIGAS%20DE%20PAGO.webp"},{src:"IMG/NOTAS%20DE%20VENTA.webp"},{src:"IMG/COSTOS%20Y%20UTILIDADES.webp"},
        {src:"IMG/INVENTARIOS,%20FINANZAS%20jpg.webp"},{src:"IMG/STOCK.webp"},{src:"IMG/comportamiento.webp"},
        {src:"IMG/premtrans.webp"},{src:"IMG/premrutas.webp"},{src:"IMG/prempro.webp"},{src:"IMG/premdash.webp"}
      ]},
      factura:{label:"Factura electrónica",icon:"IMG/factura.webp",images:[
        {src:"IMG/INCLUYE%201.webp"},{src:"IMG/INCLUYE%202.webp"},{src:"IMG/INCLUYE%203.webp"},
        {src:"IMG/CARACTERISTICAS%202.webp"},{src:"IMG/CARACTERISTICAS%203.webp"},{src:"IMG/carta%20porte.webp"},
        {src:"IMG/CONTROLA.webp"},{src:"IMG/solucion%20facil.webp"},{src:"IMG/facinfo.webp"},{src:"IMG/facpreo.webp"},
        {src:"IMG/factiemp.webp"},{src:"IMG/factimbra.webp"},{src:"IMG/factserv.webp"}
      ]}
    }},
    nube:{label:"En la Nube",defaultSys:"analiza",systems:{
      analiza:{label:"Analiza",icon:"IMG/analiza.webp",images:[
        {src:"IMG/analizareportes.webp"},{src:"IMG/anadecide.webp"},{src:"IMG/ananocuadr.webp"},
        {src:"IMG/analizarespues.webp"},{src:"IMG/analizadescuadr.webp"},{src:"IMG/analizacorrige.webp"},
        {src:"IMG/analizacfdi.webp"}
      ]},
      contabiliza:{label:"Contabiliza",icon:"IMG/contabiliza.webp",images:[
        {src:"IMG/contatranq.webp"},{src:"IMG/contaclari.webp"},{src:"IMG/contabprocesos.webp"},{src:"IMG/contabireal.webp"}
      ]},
      vende:{label:"Vende",icon:"IMG/vende.webp",images:[
        {src:"IMG/vendevendes.webp"},{src:"IMG/vendesigue.webp"},{src:"IMG/vendexml.webp"},{src:"IMG/vendesegui.webp"},
        {src:"IMG/venderuta.webp"},{src:"IMG/vendequien.webp"},{src:"IMG/vendemarca.webp"},{src:"IMG/vendekpis.webp"},
        {src:"IMG/vendeayu.webp"}
      ]}
    }},
    productividad:{label:"Productividad",defaultSys:"evalua",systems:{
      evalua:{label:"Evalúa",icon:"IMG/evalua.webp",images:[
        {src:"IMG/evaluaencu.webp"},{src:"IMG/evaluabien.webp"},{src:"IMG/nom37.webp"}
      ]},
      colabora:{label:"Colabora",icon:"IMG/colabora.webp",images:[
        {src:"IMG/colabacceso.webp"},{src:"IMG/colabtoda.webp"},{src:"IMG/colacentra.webp"},{src:"IMG/colacola.webp"}
      ]},
      personia:{label:"Personia",icon:"IMG/personia.webp",images:[
        {src:"IMG/personiasbc.webp"},{src:"IMG/persoseg.webp"},{src:"IMG/personmas.webp"},{src:"IMG/personiaptu.webp"},
        {src:"IMG/persobime.webp"}
      ]}
    }},
    servicios:{label:"Servicios",defaultSys:"polizas",systems:{}}
  };

  const HERO_GALLERY={
    groupNav:Q("#heroGalleryGroups"),
    tabsContainer:Q("#heroGalleryTabs"),
    titleEl:Q("#heroGalleryTitle"),
    carousel:Q("#heroGalleryCarousel"),
    defaultGroup:"contable"
  };

  function buildHeroGallerySlides(groupKey,sysKey){
    const g=HERO_GALLERY_DATA[groupKey]; if(!g) return;
    const sys=g.systems[sysKey]; if(!sys || !sys.images?.length) return;

    if(HERO_GALLERY.titleEl) HERO_GALLERY.titleEl.textContent=sys.label||"";
    const carousel=HERO_GALLERY.carousel; if(!carousel) return;

    const track=carousel.querySelector(".carousel-track");
    const nav=carousel.querySelector(".carousel-nav");
    if(!track || !nav) return;

    track.innerHTML=""; nav.innerHTML="";

    sys.images.forEach((item,idx)=>{
      const slide=document.createElement("div");
      slide.className="carousel-slide hero-slide"+(idx===0?" is-active":"");

      const img=document.createElement("img");
      img.src=prefix(item.src);
      img.alt=item.title||sys.label||"Expiriti";
      img.width=550; img.height=550; img.decoding="async";

      const isLCP=(groupKey===HERO_GALLERY.defaultGroup && sysKey===g.defaultSys && idx===0);
      if(isLCP){ img.loading="eager"; img.setAttribute("fetchpriority","high"); } else img.loading="lazy";

      slide.appendChild(img); track.appendChild(slide);

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
        /* FIX: offsetLeft en vez de clientWidth*idx */
        track.scrollTo({ left: slides[idx].offsetLeft, behavior:"smooth" });
      });

      nav.appendChild(dot);
    });
  }

function buildHeroSystemTabs(groupKey){
  const g=HERO_GALLERY_DATA[groupKey]; if(!g) return;
  const c=HERO_GALLERY.tabsContainer; if(!c) return;
  c.innerHTML="";
  const def=g.defaultSys;

  Object.entries(g.systems||{}).forEach(([sysKey,sys])=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="hero-tab"+(sysKey===def?" active":"");
    btn.dataset.group=groupKey; btn.dataset.sys=sysKey;

    // ✅ SOLO ICONO (sin texto redundante), accesible por aria-label
    btn.setAttribute("aria-label", sys.label || sysKey);
    btn.setAttribute("title", sys.label || sysKey); // opcional
    btn.innerHTML =
      `<img src="${prefix(sys.icon)}" alt="" width="56" height="56" loading="lazy" decoding="async">`;

    on(btn,"click",()=>{
      QA(".hero-tab",c).forEach(b=>b.classList.toggle("active",b===btn));
      buildHeroGallerySlides(groupKey,sysKey);
      HERO_GALLERY.carousel?.__resetHeroSync?.();
    });
    c.appendChild(btn);
  });
}


  function initHeroGallery(){
    const groupNav=HERO_GALLERY.groupNav;
    const carousel=HERO_GALLERY.carousel;
    if(!groupNav || !carousel) return;

    groupNav.innerHTML="";
    Object.entries(HERO_GALLERY_DATA).forEach(([groupKey,group])=>{
      if(groupKey==="servicios") return;
      const btn=document.createElement("button");
      btn.type="button";
      btn.className="hero-group-tab"+(groupKey===HERO_GALLERY.defaultGroup?" active":"");
      btn.dataset.group=groupKey; btn.textContent=group.label;

      on(btn,"click",()=>{
        QA(".hero-group-tab",groupNav).forEach(b=>b.classList.toggle("active",b===btn));
        const cfg=HERO_GALLERY_DATA[groupKey];
        buildHeroSystemTabs(groupKey);
        buildHeroGallerySlides(groupKey,cfg.defaultSys);
        carousel.__resetHeroSync?.();
      });

      groupNav.appendChild(btn);
    });

    const track=carousel.querySelector(".carousel-track");
    const prev=carousel.querySelector(".arrowCircle.prev");
    const next=carousel.querySelector(".arrowCircle.next");
    if(!track) return;

    const slidesFor=()=>QA(".carousel-slide",track);

    const getIdxFromScroll=()=>{
      const slides=slidesFor(), len=slides.length; if(!len) return 0;
      const w=track.clientWidth||1;
      return Math.max(0,Math.min(len-1,Math.round((track.scrollLeft||0)/w)));
    };

    const goTo=(i,behavior="smooth")=>{
      const slides=slidesFor(); if(!slides.length) return;
      const max=slides.length-1, idx=Math.max(0,Math.min(max,i));
      slides.forEach(s=>s.classList.remove("is-active"));
      slides[idx].classList.add("is-active");
      const navEl=carousel.querySelector(".carousel-nav");
      QA(".dot",navEl).forEach((d,k)=>d.classList.toggle("active",k===idx));
      /* FIX: offsetLeft */
      track.scrollTo({ left: slides[idx].offsetLeft, behavior });
    };

    if(carousel.dataset.arrowsBound!=="1"){
      carousel.dataset.arrowsBound="1";
      on(prev,"click",()=>goTo(getIdxFromScroll()-1));
      on(next,"click",()=>goTo(getIdxFromScroll()+1));
    }

    if(carousel.dataset.scrollSync!=="1"){
      carousel.dataset.scrollSync="1";
      let raf=0,lastIdx=-1;

      const syncFromScroll=()=>{
        raf=0;
        const slides=slidesFor(), len=slides.length; if(!len) return;
        const idx=getIdxFromScroll(); if(idx===lastIdx) return;
        lastIdx=idx;
        slides.forEach((s,k)=>s.classList.toggle("is-active",k===idx));
        const navEl=carousel.querySelector(".carousel-nav");
        QA(".dot",navEl).forEach((d,k)=>d.classList.toggle("active",k===idx));
      };

      on(track,"scroll",()=>{
        if(raf) cancelAnimationFrame(raf);
        raf=requestAnimationFrame(syncFromScroll);
      },{passive:true});

      on(window,"resize",()=>{ lastIdx=-1; syncFromScroll(); });

      carousel.__resetHeroSync=()=>{
        lastIdx=-1;
        track.scrollTo({left:0,behavior:"auto"});
        syncFromScroll();
      };
    }

    const cfg=HERO_GALLERY_DATA[HERO_GALLERY.defaultGroup];
    buildHeroSystemTabs(HERO_GALLERY.defaultGroup);
    buildHeroGallerySlides(HERO_GALLERY.defaultGroup,cfg.defaultSys);
  }

  /* =========================================================
     9) REELS: DATA (TUS DATAS)
  ========================================================= */
  const REELS_DATA={
    contable:{titleEl:Q("#reelTitle-contable"),carousel:Q("#carouselReels-contable"),defaultSys:"contabilidad",reelsBySys:{
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
    comercial:{titleEl:Q("#reelTitle-comercial"),carousel:Q("#carouselReels-comercial"),defaultSys:"pro",reelsBySys:{
      start:[{id:"XvBHmrMRv64",title:"Trazabilidad avanzada en inventarios"}],
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
    }},
    nube:{titleEl:Q("#reelTitle-nube"),carousel:Q("#carouselReels-nube"),defaultSys:"analiza",reelsBySys:{
      analiza:[
        {id:"wr-eeR3eE7w",title:"Analiza | Conciliación fiscal y bancaria"},
        {id:"gAIGxMHaCLQ",title:"Analiza | Identifica descuadres CFDIs y Nóminas"},
        {id:"iEQM_21OmBI",title:"Conciliación fiscal y contable con Analiza"}
      ],
      contabiliza:[{id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"}],
      despachos:[{id:"TsyBKkhwvew",title:"CONTPAQi Despachos"}],
      vende:[
        {id:"AxadLJcVo4M",title:"Caso de éxito CONTPAQi Vende"},
        {id:"UPyufjDByNc",title:"Testimonio CONTPAQi Vende"},
        {id:"Grx1woHMGsU",title:"Vende en la nube"},
        {id:"2Ty_SD8B_FU",title:"Vende | Carta Porte fácil y rápida"}
      ]
    }},
    productividad:{titleEl:Q("#reelTitle-productividad"),carousel:Q("#carouselReels-productividad"),defaultSys:"evalua",reelsBySys:{
      evalua:[{id:"Cn1A4-GJiNs",title:"Evalúa"}],
      colabora:[
        {id:"XJQDFDowH0U",title:"Colabora, app sin costo con Nóminas"},
        {id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"}
      ],
      personia:[{id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"}]
    }},
    servicios:{titleEl:Q("#reelTitle-servicios"),carousel:Q("#carouselReels-servicios"),defaultSys:"polizas",reelsBySys:{
      implementaciones:[{id:"aHGJ-TNpJ-U",title:"Testimonio Martha: Implementación Contable"}],
      migraciones:[{id:"4QqrKkTPZ6U",title:"Testimonio Uriel: Migración a CONTPAQi"}],
      desarrollos:[
        {id:"JkrDOjWV1Gs",title:"Testimonio Sara: Soft Restaurant"},
        {id:"uBl5UWkwbr8",title:"Testimonio Luis: Desarrollo en Nóminas"}
      ],
      servidores:[{id:"Vmf2CcSd8G4",title:"Testimonio Erika: Servidores Virtuales"}],
      cursos:[{id:"TgAkwNt4YCA",title:"Testimonio Ana: Curso Contabilidad"}],
      soporte:[{id:"inPKGICgxLc",title:"Testimonio Jaquie: Soporte Técnico"}],
      polizas:[{id:"sTvwf2ISsJU",title:"Póliza: ¿Qué incluye una póliza anual de soporte Expiriti?"}]
    }}
  };

  /* =========================
     10) REELS helpers
  ========================= */
  function setArrowsEnabled(prev,next,enabled){
    [prev,next].forEach(btn=>{
      if(!btn) return;
      btn.style.pointerEvents=enabled?"":"none";
      btn.style.opacity=enabled?"":"0.35";
      btn.setAttribute("aria-disabled",enabled?"false":"true");
      btn.classList.toggle("is-disabled",!enabled);
      if("disabled" in btn) btn.disabled=!enabled;
    });
  }

  /* FIX: Título reels determinístico (no “adivina” headings, no oculta H4 por error) */
  function setSingleLineReelTitle(cfg,title){
    const t=(title||"").trim(), el=cfg?.titleEl||null;
    if(!el) return;
    el.textContent=t;
    el.style.display="";
    el.removeAttribute("aria-hidden");
  }

  function renderReelThumb(wrap){
    const id=wrap.dataset.ytid; if(!id) return;
    const title=wrap.dataset.title||"";
    wrap.innerHTML=
      `<button class="yt-thumb" type="button" aria-label="Reproducir: ${title}">
        <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" loading="lazy" decoding="async" width="480" height="270" alt="${title}"
             onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg';">
        <span class="yt-play"></span>
      </button>`;
    const btn=wrap.querySelector(".yt-thumb");
    if(btn && btn.dataset.bound!=="1"){
      btn.dataset.bound="1";
      on(btn,"click",()=>{ stopAllReels(); renderReelIframe(wrap); });
    }
  }

  function renderReelIframe(wrap){
    const id=wrap.dataset.ytid;
    const title=wrap.dataset.title||"";
    wrap.innerHTML=
      `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1"
               title="${title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }

  function stopAllReels(){
    document.querySelectorAll(".reel-embed").forEach(w=>{
      if(w.querySelector("iframe")) renderReelThumb(w);
    });
    document.querySelectorAll(".yt-lite").forEach(node=>{
      if(node.dataset.ytLoaded==="1"){
        const id=node.dataset.ytid, title=node.dataset.title||"Video";
        const thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        node.innerHTML=
          `<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}">
            <span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span>
            <span class="yt-lite-play"></span>
          </button>`;
        node.dataset.ytLoaded="";
      }
    });
  }

  function buildReelsSlides(panelKey,sysKey){
    const cfg=REELS_DATA[panelKey]; if(!cfg) return;
    const track=cfg.carousel?.querySelector(".carousel-track");
    const nav=cfg.carousel?.querySelector(".carousel-nav");
    if(!track || !nav) return;

    const prev=cfg.carousel.querySelector(".arrowCircle.prev");
    const next=cfg.carousel.querySelector(".arrowCircle.next");

    const reels=(cfg.reelsBySys[sysKey]||[]);
    track.innerHTML=""; nav.innerHTML="";
    setArrowsEnabled(prev,next,reels.length>1);

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

      on(dot,"click",()=>{
        const slides=QA(".carousel-slide",track);
        slides.forEach(s=>s.classList.remove("is-active"));
        slides[idx]?.classList.add("is-active");
        QA(".dot",nav).forEach(d=>d.classList.remove("active"));
        dot.classList.add("active");
        track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
        stopAllReels();
        setSingleLineReelTitle(cfg,reel.title||"");
      });

      nav.appendChild(dot);
    });

    if(reels[0]?.title) setSingleLineReelTitle(cfg,reels[0].title);
  }

  function initReelsCarousel(panelKey){
    const cfg=REELS_DATA[panelKey];
    if(!cfg || !cfg.carousel) return;

    const track=cfg.carousel.querySelector(".carousel-track");
    const prev=cfg.carousel.querySelector(".arrowCircle.prev");
    const next=cfg.carousel.querySelector(".arrowCircle.next");
    if(!track) return;

    const slidesFor=()=>QA(".carousel-slide",track);
    const dotsFor=()=>QA(".carousel-nav .dot",cfg.carousel);

    if(cfg.carousel.dataset.arrowsBound!=="1"){
      cfg.carousel.dataset.arrowsBound="1";

      const goTo=(i)=>{
        const slides=slidesFor(), len=slides.length;
        if(!len || len<=1) return;
        const idx=((i%len)+len)%len;

        slides.forEach(s=>s.classList.remove("is-active"));
        slides[idx].classList.add("is-active");
        dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));

        track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});

        const sys=cfg._activeSys||cfg.defaultSys;
        const reels=(cfg.reelsBySys[sys]||[]);
        setSingleLineReelTitle(cfg,reels[idx]?.title||"");
        stopAllReels();
      };

      on(prev,"click",()=>{
        const slides=slidesFor(); if(slides.length<=1) return;
        const i=slides.findIndex(s=>s.classList.contains("is-active"));
        goTo(i-1);
      });

      on(next,"click",()=>{
        const slides=slidesFor(); if(slides.length<=1) return;
        const i=slides.findIndex(s=>s.classList.contains("is-active"));
        goTo(i+1);
      });
    }

    if(cfg.carousel.dataset.scrollSync!=="1"){
      cfg.carousel.dataset.scrollSync="1";
      let raf=0,lastIdx=-1;

      const syncFromScroll=()=>{
        raf=0;
        const slides=slidesFor(), len=slides.length; if(!len) return;
        const w=track.clientWidth||1;
        const idx=Math.max(0,Math.min(len-1,Math.round((track.scrollLeft||0)/w)));
        if(idx===lastIdx) return;
        lastIdx=idx;

        slides.forEach((s,k)=>s.classList.toggle("is-active",k===idx));
        dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));

        const sys=cfg._activeSys||cfg.defaultSys;
        const reels=(cfg.reelsBySys[sys]||[]);
        setSingleLineReelTitle(cfg,reels[idx]?.title||"");
        stopAllReels();
      };

      on(track,"scroll",()=>{
        if(raf) cancelAnimationFrame(raf);
        raf=requestAnimationFrame(syncFromScroll);
      },{passive:true});

      on(window,"resize",()=>{ lastIdx=-1; syncFromScroll(); });
    }

    cfg._activeSys=cfg.defaultSys;
    buildReelsSlides(panelKey,cfg.defaultSys);
  }

  function initYTLiteVideos(){
    QA(".yt-lite").forEach(node=>{
      if(node.dataset.ytReady==="1") return;
      const id=node.dataset.ytid;
      const title=node.dataset.title||"Video";
      if(!id) return;

      node.dataset.ytReady="1";
      const thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

      node.innerHTML=
        `<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}">
          <span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span>
          <span class="yt-lite-play"></span>
        </button>`;

      on(node,"click",()=>{
        if(node.dataset.ytLoaded==="1") return;
        stopAllReels();
        node.innerHTML=
          `<iframe class="yt-iframe" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
                   title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                   allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
        node.dataset.ytLoaded="1";
      });
    });
  }

  function initFAQ(){
    document.querySelectorAll(".faq-item").forEach(item=>{
      if(item.dataset.bound==="1") return; item.dataset.bound="1";
      on(item,"toggle",()=>{
        if(!item.open) return;
        document.querySelectorAll(".faq-item").forEach(other=>{
          if(other!==item) other.removeAttribute("open");
        });
      });
    });
  }

  function initReelsTabs(){
    QA(".reel-tab").forEach(tab=>{
      if(tab.dataset.bound==="1") return; tab.dataset.bound="1";
      on(tab,"click",()=>{
        const panelKey=tab.dataset.panel, sysKey=tab.dataset.sys;
        if(!panelKey || !sysKey) return;

        const cfg=REELS_DATA[panelKey];
        if(cfg) cfg._activeSys=sysKey;

        stopAllReels();
        QA(".reel-tab").forEach(t=>{
          if(t.dataset.panel===panelKey) t.classList.toggle("active",t===tab);
        });

        buildReelsSlides(panelKey,sysKey);

        const reels0=(cfg?.reelsBySys?.[sysKey]||[]);
        cfg?.carousel?.querySelector(".carousel-track")?.scrollTo({left:0,behavior:"auto"});
        setSingleLineReelTitle(cfg,reels0[0]?.title||"");
      });
    });
  }

  /* =========================
     11) Servicios: pager 2x2 (mobile) — FIX width
  ========================= */

            function initServicesPager(){
  const root = document.getElementById("servicesCarousel");  // .cards-services
  const dotsWrap = document.getElementById("servicesDots");  // .svc-dots
  if(!root || !dotsWrap) return;

  const isDesktop = window.matchMedia("(min-width: 981px)").matches;
  const isCarousel = root.classList.contains("is-carousel");
  if(isDesktop || !isCarousel){
    dotsWrap.innerHTML = "";
    return;
  }

  const pages = Array.from(root.querySelectorAll(".svc-page"));
  if(pages.length <= 1){
    dotsWrap.innerHTML = "";
    return;
  }

  // ===== construir dots
  dotsWrap.innerHTML = "";
  const dots = pages.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dot" + (i === 0 ? " active" : "");
    b.setAttribute("aria-label", `Ir a página ${i+1} de servicios`);
    b.addEventListener("click", () => {
      // GAP-SAFE: ir por offsetLeft real de la página
      root.scrollTo({ left: pages[i].offsetLeft, behavior: "smooth" });
    });
    dotsWrap.appendChild(b);
    return b;
  });

  const setActive = (i) => dots.forEach((d, idx) => d.classList.toggle("active", idx === i));

  // ===== sync por "página más cercana" (no por división de widths)
  let raf = 0;
  const sync = () => {
    const x = root.scrollLeft;
    let best = 0;
    let bestDist = Infinity;

    for(let i=0;i<pages.length;i++){
      const dist = Math.abs(pages[i].offsetLeft - x);
      if(dist < bestDist){ bestDist = dist; best = i; }
    }
    setActive(best);
  };

  if(root.dataset.pagerBound !== "1"){
    root.dataset.pagerBound = "1";
    root.addEventListener("scroll", () => {
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive:true });
  }

  // Arranque estable (2 rafs para fuentes/imagenes)
  requestAnimationFrame(() => requestAnimationFrame(sync));
}

  /* =========================
     12) INIT PRINCIPAL
  ========================= */
  on(window,"DOMContentLoaded",async ()=>{
    await Promise.all([
      loadPartial("header-placeholder","global-header.html"),
      loadPartial("footer-placeholder","global-footer.html")
    ]);

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

    const yearSpan=document.getElementById("gf-year");
    if(yearSpan) yearSpan.textContent=new Date().getFullYear();
  });

/* ===== MAPA: lazy-load on demand (PageSpeed friendly) ===== */
(function(){
  "use strict";

function addPreconnect(href){
  if(document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  const l=document.createElement("link");
  l.rel="preconnect";
  l.href=href;
  l.crossOrigin="anonymous";
  document.head.appendChild(l);
}


  function loadMap(root){
    if(!root || root.dataset.loaded==="1") return;
    root.dataset.loaded="1";

    addPreconnect("https://www.google.com");
    addPreconnect("https://www.google.com.mx");
    addPreconnect("https://maps.google.com");
    addPreconnect("https://maps.gstatic.com");

    const src=root.getAttribute("data-embed");
    if(!src) return;

    const iframe=document.createElement("iframe");
    iframe.src=src;
    iframe.loading="lazy";
    iframe.referrerPolicy="no-referrer-when-downgrade";
    iframe.allowFullscreen=true;
    iframe.title="Mapa: ExpIRI TI";
    iframe.setAttribute("aria-hidden","false");

    root.innerHTML="";
    root.appendChild(iframe);
  }

function initLazyMap(){
  const root=document.getElementById("mapExpiriti");
  if(!root) return;

  if(root.dataset.mapBound==="1") return;
  root.dataset.mapBound="1";

  root.addEventListener("click",(e)=>{
    const cta=e.target.closest(".map-cover-cta");
    if(!cta) return;
    e.preventDefault();
    loadMap(root);
  });

  if("IntersectionObserver" in window){
    const io=new IntersectionObserver((entries)=>{
      entries.forEach(ent=>{
        if(ent.isIntersecting){
          loadMap(root);
          io.disconnect();
        }
      });
    }, { rootMargin:"200px 0px" });
    io.observe(root);
  }
}


   
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", initLazyMap, { once:true });
  }else{
    initLazyMap();
  }
})();



            
            
  /* =========================
     13) Eventos globales
  ========================= */
  on(window,"resize",()=> safe(initServicesPager));

  /* BFCache: al volver atrás, re-normaliza + re-bindea wheel + pager */
  on(window,"pageshow",()=>{
    safe(()=>normalizeRoutes(document));
    safe(bindWheelOnTabs);
    safe(initServicesPager);
  });

})();

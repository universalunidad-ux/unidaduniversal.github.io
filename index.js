/* =========================================================
 Expiriti — index.js (MIN + COMMS) v2026.01.20
 - Core init + rutas + parciales + forms + tabs + promos + hero + reels + servicios
 - SplitBG + Tab center + Smart swipe patch
========================================================= */
(function(){"use strict";if(window.__EXPIRITI_INDEX_INIT__)return;window.__EXPIRITI_INDEX_INIT__=!0;
const Q=(s,c=document)=>c.querySelector(s),QA=(s,c=document)=>Array.from(c.querySelectorAll(s)),on=(el,ev,fn,opt)=>{el&&el.addEventListener(ev,fn,opt)},safe=fn=>{try{fn()}catch(_){}},DEBUG_NOCACHE=/[?&]nocache=1\b/.test(location.search);

/* 0) preload image (LCP) */
function addPreloadImage(href){if(!href)return;const abs=prefix(href);if(document.querySelector(`link[rel="preload"][as="image"][href="${abs}"]`))return;const l=document.createElement("link");l.rel="preload";l.as="image";l.href=abs;document.head.appendChild(l)}

/* 1) rutas GH Pages + local */
const isGh=location.hostname.endsWith("github.io"),firstSeg=(location.pathname.split("/")[1]||"").trim(),repoBase=isGh&&firstSeg?"/"+firstSeg:"",pathParts=location.pathname.replace(/\/+$/,"").split("/").filter(Boolean),contentParts=isGh?pathParts.slice(1):pathParts,depth=contentParts.length>1?"../".repeat(contentParts.length-1):"./";
function prefix(path){if(!path)return path;if(/^(https?:)?\/\//i.test(path))return path;if(/^(mailto:|tel:|data:)/i.test(path))return path;if(path.startsWith("#"))return path;const base=isGh?repoBase+"/":depth,joined=(base+path).replace(/\\/g,"/");return joined.replace(/([^:]\/)\/+/g,"$1")}
function normalizeRoutes(root=document){QA(".js-abs-src[data-src]",root).forEach(img=>{const raw=img.getAttribute("data-src")||"",fin=prefix(raw);if(!img.getAttribute("src"))img.setAttribute("src",fin);else img.src=fin;img.style.opacity="1"});QA(".js-abs-href[data-href]",root).forEach(a=>{const raw=a.getAttribute("data-href")||"";if(!raw)return;const parts=raw.split("#"),p=parts[0]||"",h=parts[1]||"";a.href=prefix(p)+(h?"#"+h:"")});const y=root.getElementById?.("gf-year")||document.getElementById("gf-year");y&&(y.textContent=new Date().getFullYear())}

/* 2) parciales header/footer (cache prod, no-store con ?nocache=1) */
async function loadPartial(placeholderId,fileName){const ph=document.getElementById(placeholderId);if(!ph)return;const cands=[prefix(`PARTIALS/${fileName}`),isGh&&repoBase?`${repoBase}/PARTIALS/${fileName}`:null,!isGh?`${depth}PARTIALS/${fileName}`:null,"/PARTIALS/"+fileName].filter(Boolean);let html="",lastErr=null;for(const u of cands)try{const url=DEBUG_NOCACHE?u+(u.includes("?")?"&":"?")+"v="+Date.now():u;const resp=await fetch(url,{cache:DEBUG_NOCACHE?"no-store":"force-cache"});if(!resp.ok)throw new Error("HTTP "+resp.status+" "+resp.statusText);html=await resp.text();break}catch(e){lastErr=e}if(!html){console.warn("[Expiriti] No se pudo cargar partial:",fileName,lastErr);return}ph.outerHTML=html}

/* 3) La rueda vertical conserva el scroll de página; deltaX sigue siendo nativo. */
function bindWheelOnTabs(){/* intencionalmente nativo */}

/* 4) forms: quick whatsapp + contact (Apps Script) */
function initForms(){const quickForm=Q("#quickForm");if(quickForm&&quickForm.dataset.bound!=="1"){quickForm.dataset.bound="1";on(quickForm,"submit",e=>{e.preventDefault();const modulo=encodeURIComponent(Q("#modulo")?.value||""),mensaje=encodeURIComponent((Q("#mensaje")?.value||"").trim()),texto=`Hola ExpIRI Ti, me interesa ${modulo}. ${mensaje}`;window.open(`https://wa.me/525568437918?text=${texto}`,"_blank","noopener")})}const contactForm=Q("#contactForm");if(contactForm&&contactForm.dataset.bound!=="1"){contactForm.dataset.bound="1";const tsEl=Q("#ts",contactForm);tsEl&&(tsEl.value=String(Date.now()));const pageEl=Q("#page",contactForm);pageEl&&(pageEl.value=location.href);const uaEl=Q("#ua",contactForm);uaEl&&(uaEl.value=navigator.userAgent);const GAS_URL="PEGA_AQUI_TU_URL_DE_APPS_SCRIPT_EXEC";const GAS_OK=/^https:\/\//i.test(GAS_URL);const buildWaText=fd=>{const g=k=>(fd.get(k)||"").toString().trim();const partes=["Hola ExpIRI Ti, quiero información."];g("nombre")&&partes.push("Nombre: "+g("nombre"));g("correo")&&partes.push("Correo: "+g("correo"));g("telefono")&&partes.push("Tel: "+g("telefono"));g("interes")&&partes.push("Interés: "+g("interes"));g("detalle")&&partes.push("Detalle: "+g("detalle"));return encodeURIComponent(partes.join("\n"))};on(contactForm,"submit",async e=>{e.preventDefault();const empresa=(Q("#empresa",contactForm)?.value||"").trim();if(empresa)return;const fd=new FormData(contactForm);fd.get("ts")||fd.set("ts",String(Date.now()));fd.get("page")||fd.set("page",location.href);fd.get("ua")||fd.set("ua",navigator.userAgent);if(!GAS_OK){window.open("https://wa.me/525568437918?text="+buildWaText(fd),"_blank","noopener");return}try{await fetch(GAS_URL,{method:"POST",body:fd,mode:"no-cors"});alert("Listo. Recibimos tu mensaje. En breve te contactamos.");contactForm.reset();tsEl&&(tsEl.value=String(Date.now()));pageEl&&(pageEl.value=location.href);uaEl&&(uaEl.value=navigator.userAgent)}catch(_){window.open("https://wa.me/525568437918?text="+buildWaText(fd),"_blank","noopener")}})}}

/* 5) tabs productos + autoscroll tab activo */
function scrollTabIntoView(btn,behavior="smooth"){const wrap=btn?.closest(".prod-tabs");if(!wrap)return;if(wrap.scrollWidth<=wrap.clientWidth+2)return;const wRect=wrap.getBoundingClientRect(),bRect=btn.getBoundingClientRect(),targetLeft=wrap.scrollLeft+(bRect.left-wRect.left)-(wRect.width/2-bRect.width/2);wrap.scrollTo({left:Math.max(0,targetLeft),behavior})}
function initTabsProductos(){const tabs=QA(".prod-tabs .tab"),panels=QA(".panel-productos");if(!tabs.length||!panels.length)return;function activar(btn,behavior="smooth"){const targetId=btn?.dataset?.target;if(!targetId)return;tabs.forEach(t=>t.classList.toggle("active",t===btn));panels.forEach(p=>p.classList.toggle("hidden",p.id!==targetId));scrollTabIntoView(btn,behavior);window.dispatchEvent(new Event("splitbg:update"))}tabs.forEach(btn=>{if(btn.dataset.bound==="1")return;btn.dataset.bound="1";on(btn,"click",()=>activar(btn,"smooth"))});const tabInicial=document.getElementById("tab-contable");activar(tabInicial||tabs[0],"auto")}

/* 6) promos filter (solo hijos directos) */
function initPromosFilter(){const grid=document.getElementById("promoGrid");if(!grid)return;const promoBtns=QA("#promociones .promo-btn[data-filter]");if(!promoBtns.length)return;const promoItems=Array.from(grid.querySelectorAll(":scope > [data-type]"));if(!promoItems.length)return;function setPromoFilter(filter){promoBtns.forEach(b=>{const act=b.dataset.filter===filter;b.classList.toggle("active",act);b.setAttribute("aria-pressed",act?"true":"false")});promoItems.forEach(el=>{const type=(el.dataset.type||"").trim(),ok=filter==="all"||type===filter;el.toggleAttribute("hidden",!ok);el.style.display=ok?"":"none"})}promoBtns.forEach(b=>{if(b.dataset.bound==="1")return;b.dataset.bound="1";on(b,"click",e=>{e.preventDefault();setPromoFilter(b.dataset.filter||"all")})});setPromoFilter("nuevos")}

/* 7) cards clicables */
function initClickableCards(){QA(".card.product-card[data-href]").forEach(card=>{if(card.dataset.bound==="1")return;card.dataset.bound="1";const href=card.getAttribute("data-href");on(card,"click",e=>{if(e.target.closest("a,button,input,select,textarea,label"))return;href&&(location.href=prefix(href))})})}

/* 7.1) PERF/CLS helpers (lock + cache centers + RO) */
function lockElHeight(el){if(!el)return()=>{};const r=el.getBoundingClientRect(),h=Math.round(r.height||0);h>0&&(el.style.minHeight=h+"px");return()=>{el.style.minHeight=""}}
function lockTrackHeight(track){return lockElHeight(track)}
function buildOffsetsCache(track,slides){track.__centers=slides.map(s=>s.offsetLeft+s.clientWidth/2)}
function closestIndexFromCache(track){const centers=track.__centers||[];if(!centers.length)return 0;const x=(track.scrollLeft||0)+track.clientWidth/2;let best=0,bestDist=1/0;for(let i=0;i<centers.length;i++){const d=Math.abs(x-centers[i]);d<bestDist&&(bestDist=d,best=i)}return best}
function observeTrack(track){if(!track||!("ResizeObserver"in window)||track.__ro)return;track.__ro=new ResizeObserver(()=>{const slides=QA(".carousel-slide",track);slides.length&&buildOffsetsCache(track,slides)});track.__ro.observe(track)}

/* 8) HERO gallery data */
const HERO_GALLERY_DATA={contable:{label:"Contables",defaultSys:"nominas",systems:{contabilidad:{label:"Contabilidad",icon:"IMG/contabilidad.webp",images:[{src:"IMG/contamate.webp"},{src:"IMG/contadesglo.webp"},{src:"IMG/conta%20y%20bancos.webp"},{src:"IMG/conta%20y%20bancos%202.webp"},{src:"IMG/impuestos%20sin%20estres%20conta%20y%20bancos.webp"},{src:"IMG/1conta.webp"}]},nominas:{label:"Nóminas",icon:"IMG/nominas.webp",images:[{src:"IMG/primera.webp"},{src:"IMG/nomisr.webp"},{src:"IMG/490962328_1082897360538668_175183934644162321_n.webp"},{src:"IMG/NOMINAS.webp"},{src:"IMG/ptu.webp"},{src:"IMG/posible.webp"}]},bancos:{label:"Bancos",icon:"IMG/bancos.webp",images:[{src:"IMG/efectivamente.webp"},{src:"IMG/olvida.webp"},{src:"IMG/CONTROL%20MOVIMIENTOS%20BANCARIOS.webp"},{src:"IMG/CARRUSEL%20CONECTA%201jpg.webp"},{src:"IMG/CARRUSEL%20CONECTA%202.webp"},{src:"IMG/PAGARAN.webp"}]},xml:{label:"XML en Línea+",icon:"IMG/xml.webp",images:[{src:"IMG/dos.webp"},{src:"IMG/SOFTWARE%20FAVORITO%201.webp"},{src:"IMG/SOFTWARE%20FAVORITO%202.webp"}]}}},comercial:{label:"Comerciales",defaultSys:"pro",systems:{pro:{label:"Comercial Pro",icon:"IMG/comercialpro.webp",images:[{src:"IMG/captura%20manual.webp"},{src:"IMG/procumple.webp"},{src:"IMG/prorenta.webp"},{src:"IMG/COMPRAVENTA.webp"},{src:"IMG/FUNCIONES%20PRO.webp"},{src:"IMG/FUNCIONES%20PRO2.webp"}]},premium:{label:"Comercial Premium",icon:"IMG/comercialpremium.webp",images:[{src:"IMG/desde%20compras%20ventas%20traslados.webp"},{src:"IMG/INVENTARIO%20Y%20VENTAS.webp"},{src:"IMG/LIGAS%20DE%20PAGO.webp"},{src:"IMG/NOTAS%20DE%20VENTA.webp"},{src:"IMG/COSTOS%20Y%20UTILIDADES.webp"},{src:"IMG/INVENTARIOS,%20FINANZAS%20jpg.webp"}]},factura:{label:"Factura electrónica",icon:"IMG/factura.webp",images:[{src:"IMG/INCLUYE%201.webp"},{src:"IMG/INCLUYE%202.webp"},{src:"IMG/INCLUYE%203.webp"},{src:"IMG/CARACTERISTICAS%202.webp"},{src:"IMG/CARACTERISTICAS%203.webp"},{src:"IMG/carta%20porte.webp"}]}}},nube:{label:"En la Nube",defaultSys:"contabiliza",systems:{contabiliza:{label:"Contabiliza",icon:"IMG/contabiliza.webp",images:[{src:"IMG/contatranq.webp"},{src:"IMG/contaclari.webp"},{src:"IMG/contabprocesos.webp"},{src:"IMG/contabireal.webp"}]},personia:{label:"Personia",icon:"IMG/personia.webp",images:[{src:"IMG/personiasbc.webp"},{src:"IMG/persoseg.webp"},{src:"IMG/personmas.webp"},{src:"IMG/personiaptu.webp"},{src:"IMG/persobime.webp"}]},vende:{label:"Vende",icon:"IMG/vende.webp",images:[{src:"IMG/vendevendes.webp"},{src:"IMG/vendesigue.webp"},{src:"IMG/vendexml.webp"},{src:"IMG/vendesegui.webp"},{src:"IMG/venderuta.webp"},{src:"IMG/vendequien.webp"}]},colabora:{label:"Colabora",icon:"IMG/colabora.webp",images:[{src:"IMG/colabacceso.webp"},{src:"IMG/colabtoda.webp"},{src:"IMG/colacentra.webp"},{src:"IMG/colacola.webp"}]}}},productividad:{label:"Productividad",defaultSys:"analiza",systems:{analiza:{label:"Analiza",icon:"IMG/analiza.webp",images:[{src:"IMG/analizareportes.webp"},{src:"IMG/anadecide.webp"},{src:"IMG/ananocuadr.webp"},{src:"IMG/analizarespues.webp"},{src:"IMG/analizadescuadr.webp"},{src:"IMG/analizacorrige.webp"},{src:"IMG/analizacfdi.webp"}]},evalua:{label:"Evalúa",icon:"IMG/evalua.webp",images:[{src:"IMG/evaluaencu.webp"},{src:"IMG/evaluabien.webp"},{src:"IMG/nom37.webp"}]},optimiza:{label:"Optimiza",icon:"IMG/optimiza.webp",images:[{src:"IMG/optimiza.webp"}]},anticipa:{label:"Anticipa",icon:"IMG/anticipa.webp",images:[{src:"IMG/anticipa.webp"}]}}},servicios:{label:"Servicios",defaultSys:"polizas",systems:{}}};
const HERO_GALLERY={groupNav:Q("#heroGalleryGroups"),tabsContainer:Q("#heroGalleryTabs"),titleEl:Q("#heroGalleryTitle"),carousel:Q("#heroGalleryCarousel"),defaultGroup:"contable"};

/* 8.1) HERO build slides (lock .carousel para CLS) */
function buildHeroGallerySlides(groupKey,sysKey){const g=HERO_GALLERY_DATA[groupKey];if(!g)return;const sys=g.systems[sysKey];if(!sys||!sys.images?.length)return;HERO_GALLERY.titleEl&&(HERO_GALLERY.titleEl.textContent=sys.label||"");const carousel=HERO_GALLERY.carousel;if(!carousel)return;const track=carousel.querySelector(".carousel-track"),nav=carousel.querySelector(".carousel-nav");if(!track||!nav)return;const unlockCarousel=lockElHeight(carousel);track.innerHTML="";nav.innerHTML="";const fragTrack=document.createDocumentFragment(),fragNav=document.createDocumentFragment();sys.images.forEach((item,idx)=>{const slide=document.createElement("div");slide.className="carousel-slide hero-slide"+(idx===0?" is-active":"");const img=document.createElement("img");img.src=prefix(item.src);img.alt=item.title||sys.label||"Expiriti";img.width=600;img.height=600;img.decoding="async";const isLCP=groupKey===HERO_GALLERY.defaultGroup&&sysKey===g.defaultSys&&idx===0;if(isLCP){img.loading="eager";img.setAttribute("fetchpriority","high");addPreloadImage(item.src)}else img.loading="lazy";slide.appendChild(img);fragTrack.appendChild(slide);const dot=document.createElement("button");dot.type="button";dot.className="dot"+(idx===0?" active":"");dot.setAttribute("aria-label","Ir a imagen "+(idx+1));on(dot,"click",()=>{const slides=QA(".carousel-slide",track);slides.forEach(s=>s.classList.remove("is-active"));slides[idx]?.classList.add("is-active");QA(".dot",nav).forEach(d=>d.classList.remove("active"));dot.classList.add("active");track.scrollTo({left:slides[idx].offsetLeft,behavior:"smooth"})});fragNav.appendChild(dot)});track.appendChild(fragTrack);nav.appendChild(fragNav);requestAnimationFrame(()=>{const slides=QA(".carousel-slide",track);slides.length&&buildOffsetsCache(track,slides);observeTrack(track);unlockCarousel()})}
function buildHeroSystemTabs(groupKey){const g=HERO_GALLERY_DATA[groupKey];if(!g)return;const c=HERO_GALLERY.tabsContainer;if(!c)return;c.innerHTML="";const def=g.defaultSys;Object.entries(g.systems||{}).forEach(([sysKey,sys])=>{const btn=document.createElement("button");btn.type="button";btn.className="hero-tab"+(sysKey===def?" active":"");btn.dataset.group=groupKey;btn.dataset.sys=sysKey;btn.setAttribute("aria-label",sys.label||sysKey);btn.setAttribute("title",sys.label||sysKey);btn.innerHTML=`<img src="${prefix(sys.icon)}" alt="" width="56" height="56" loading="lazy" decoding="async">`;on(btn,"click",()=>{QA(".hero-tab",c).forEach(b=>b.classList.toggle("active",b===btn));buildHeroGallerySlides(groupKey,sysKey);HERO_GALLERY.carousel?.__resetHeroSync?.()});c.appendChild(btn)})}
function initHeroGallery(){const groupNav=HERO_GALLERY.groupNav,carousel=HERO_GALLERY.carousel;if(!groupNav||!carousel)return;groupNav.innerHTML="";Object.entries(HERO_GALLERY_DATA).forEach(([groupKey,group])=>{if(groupKey==="servicios")return;const btn=document.createElement("button");btn.type="button";btn.className="hero-group-tab"+(groupKey===HERO_GALLERY.defaultGroup?" active":"");btn.dataset.group=groupKey;btn.textContent=group.label;on(btn,"click",()=>{QA(".hero-group-tab",groupNav).forEach(b=>b.classList.toggle("active",b===btn));const cfg=HERO_GALLERY_DATA[groupKey];buildHeroSystemTabs(groupKey);buildHeroGallerySlides(groupKey,cfg.defaultSys);carousel.__resetHeroSync?.()});groupNav.appendChild(btn)});const track=carousel.querySelector(".carousel-track"),prev=carousel.querySelector(".arrowCircle.prev"),next=carousel.querySelector(".arrowCircle.next");if(!track)return;observeTrack(track);const slidesFor=()=>QA(".carousel-slide",track),getIdxFromScroll=()=>closestIndexFromCache(track),goTo=(i,behavior="smooth")=>{const slides=slidesFor();if(!slides.length)return;const max=slides.length-1,idx=Math.max(0,Math.min(max,i));slides.forEach(s=>s.classList.remove("is-active"));slides[idx].classList.add("is-active");const navEl=carousel.querySelector(".carousel-nav");QA(".dot",navEl).forEach((d,k)=>d.classList.toggle("active",k===idx));track.scrollTo({left:slides[idx].offsetLeft,behavior})};carousel.dataset.arrowsBound!=="1"&&(carousel.dataset.arrowsBound="1",on(prev,"click",()=>goTo(getIdxFromScroll()-1)),on(next,"click",()=>goTo(getIdxFromScroll()+1)));if(carousel.dataset.scrollSync!=="1"){carousel.dataset.scrollSync="1";let raf=0,lastIdx=-1;const syncFromScroll=()=>{raf=0;const slides=slidesFor(),len=slides.length;if(!len)return;const idx=getIdxFromScroll();if(idx===lastIdx)return;lastIdx=idx;slides.forEach((s,k)=>s.classList.toggle("is-active",k===idx));const navEl=carousel.querySelector(".carousel-nav");QA(".dot",navEl).forEach((d,k)=>d.classList.toggle("active",k===idx))};on(track,"scroll",()=>{raf&&cancelAnimationFrame(raf);raf=requestAnimationFrame(syncFromScroll)},{passive:!0});on(window,"resize",()=>{lastIdx=-1;const slides=slidesFor();slides.length&&buildOffsetsCache(track,slides);syncFromScroll()});carousel.__resetHeroSync=()=>{lastIdx=-1;track.scrollTo({left:0,behavior:"auto"});requestAnimationFrame(()=>{const slides=slidesFor();slides.length&&buildOffsetsCache(track,slides);syncFromScroll()})}}const cfg=HERO_GALLERY_DATA[HERO_GALLERY.defaultGroup];buildHeroSystemTabs(HERO_GALLERY.defaultGroup);buildHeroGallerySlides(HERO_GALLERY.defaultGroup,cfg.defaultSys)}

/* 9) REELS data */
const REELS_DATA={contable:{titleEl:Q("#reelTitle-contable"),carousel:Q("#carouselReels-contable"),defaultSys:"contabilidad",reelsBySys:{contabilidad:[{id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"},{id:"BIhYNn2O0og",title:"Evita errores en la DIOT con Contabilidad"},{id:"rESYB37TP-M",title:"Declaración anual en 5 pasos con Contabilidad"},{id:"LqptaBOF7h4",title:"Fernanda redujo su carga contable con Contabilidad"}],nominas:[{id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"},{id:"8-2rT99euog",title:"Nóminas | Software #1 en México"},{id:"2eVOzoBoP6s",title:"Nóminas | Automatiza tus procesos"},{id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"},{id:"MfiiX1La2vQ",title:"Qué hace CONTPAQi Nóminas por ti"}],bancos:[{id:"3YUbSEyU678",title:"Conciliación bancaria en 3 pasos con Bancos"},{id:"LC1Ccpv_jzo",title:"4 señales de que necesitas Bancos"}],xml:[{id:"nhoUDNnGQ90",title:"El día que José dejó de sufrir con el SAT descargando CFDIs"}]}},comercial:{titleEl:Q("#reelTitle-comercial"),carousel:Q("#carouselReels-comercial"),defaultSys:"pro",reelsBySys:{start:[{id:"XvBHmrMRv64",title:"Trazabilidad avanzada en inventarios"}],pro:[{id:"-SJq6t2SM7c",title:"Flujo completo con Comercial Pro"},{id:"rEYzPXOX1_Y",title:"Comercial Pro: control total de inventario"}],premium:[{id:"IYwNBfmWxJU",title:"Controla tus inventarios con Comercial Premium"},{id:"_Krv5nTyFuY",title:"Notas de venta más rápido en Comercial Premium"},{id:"HmgOQrasCVw",title:"Notas de venta en Comercial Premium"},{id:"WGPOzQ1GsSE",title:"Documentos por WhatsApp en Comercial Premium"}],factura:[{id:"nMEgM_BvxTs",title:"Factura Electrónica v13 | Novedades"},{id:"IA5-tguZzCc",title:"Carta Porte CFDI 3.1 en Factura Electrónica"},{id:"2uBSGZHLsGs",title:"Factura Electrónica para sector notarial"}]}},nube:{titleEl:Q("#reelTitle-nube"),carousel:Q("#carouselReels-nube"),defaultSys:"contabiliza",reelsBySys:{contabiliza:[{id:"yblBsFFv6bc",title:"Contabilidad y Contabiliza te ayudan en la DIOT"}],personia:[{id:"gae67GDse30",title:"Nóminas y Personia | Checador por GPS"}],vende:[{id:"AxadLJcVo4M",title:"Caso de éxito CONTPAQi Vende"},{id:"UPyufjDByNc",title:"Testimonio CONTPAQi Vende"},{id:"Grx1woHMGsU",title:"Vende en la nube"},{id:"2Ty_SD8B_FU",title:"Vende | Carta Porte fácil y rápida"}],colabora:[{id:"XJQDFDowH0U",title:"Colabora, app sin costo con Nóminas"},{id:"nLRgiOPQM80",title:"App Colabora gratis con Nóminas"}]}},productividad:{titleEl:Q("#reelTitle-productividad"),carousel:Q("#carouselReels-productividad"),defaultSys:"analiza",reelsBySys:{analiza:[{id:"wr-eeR3eE7w",title:"Analiza | Conciliación fiscal y bancaria"},{id:"gAIGxMHaCLQ",title:"Analiza | Identifica descuadres CFDIs y Nóminas"},{id:"iEQM_21OmBI",title:"Conciliación fiscal y contable con Analiza"}],evalua:[{id:"Cn1A4-GJiNs",title:"Evalúa"}],optimiza:[{id:"iVFSWCEOu_c",title:"Optimiza | Comienza a usar Optimiza"},{id:"M2wUCMsQ2b4",title:"Optimiza | Integración con CONTPAQi Bancos"}],anticipa:[{id:"Cn1A4-GJiNs",title:"Anticipa | Blindaje fiscal preventivo"}]}},servicios:{titleEl:null,carousel:Q("#carouselReels-servicios"),defaultSys:"polizas",reelsBySys:{implementaciones:[{id:"aHGJ-TNpJ-U",title:"Testimonio Martha: Implementación Contable"}],migraciones:[{id:"4QqrKkTPZ6U",title:"Testimonio Uriel: Migración a CONTPAQi"}],desarrollos:[{id:"JkrDOjWV1Gs",title:"Testimonio Sara: Soft Restaurant"},{id:"uBl5UWkwbr8",title:"Testimonio Luis: Desarrollo en Nóminas"}],servidores:[{id:"Vmf2CcSd8G4",title:"Testimonio Erika: Servidores Virtuales"}],cursos:[{id:"TgAkwNt4YCA",title:"Testimonio Ana: Curso Contabilidad"}],soporte:[{id:"inPKGICgxLc",title:"Testimonio Jaquie: Soporte Técnico"}],polizas:[{id:"sTvwf2ISsJU"}]}}};

/* 10) reels helpers + render */
function setArrowsEnabled(prev,next,enabled){[prev,next].forEach(btn=>{if(!btn)return;btn.style.pointerEvents=enabled?"":"none";btn.style.opacity=enabled?"":"0.35";btn.setAttribute("aria-disabled",enabled?"false":"true");btn.classList.toggle("is-disabled",!enabled);"disabled"in btn&&(btn.disabled=!enabled)})}
function setSingleLineReelTitle(c,t){if(!c||!c.titleEl)return;c.titleEl.textContent=t||""}
function renderReelThumb(wrap){const id=wrap.dataset.ytid;if(!id)return;const title=wrap.dataset.title||"";wrap.innerHTML=`<button class="yt-thumb" type="button" aria-label="Reproducir: ${title}"><img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" loading="lazy" decoding="async" width="480" height="270" alt="${title}" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg';"><span class="yt-play"></span></button>`;const btn=wrap.querySelector(".yt-thumb");btn&&btn.dataset.bound!=="1"&&(btn.dataset.bound="1",on(btn,"click",()=>{stopAllReels();renderReelIframe(wrap)}))}
function renderReelIframe(wrap){const id=wrap.dataset.ytid,title=wrap.dataset.title||"";wrap.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1" title="${title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`}
function stopAllReels(){document.querySelectorAll(".reel-embed").forEach(w=>{w.querySelector("iframe")&&renderReelThumb(w)});document.querySelectorAll(".yt-lite").forEach(node=>{if(node.dataset.ytLoaded==="1"){const id=node.dataset.ytid,title=node.dataset.title||"Video",thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;node.innerHTML=`<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}"><span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span><span class="yt-lite-play"></span></button>`;node.dataset.ytLoaded=""}})}
function buildReelsSlides(panelKey,sysKey){const cfg=REELS_DATA[panelKey];if(!cfg)return;const track=cfg.carousel?.querySelector(".carousel-track"),nav=cfg.carousel?.querySelector(".carousel-nav");if(!track||!nav)return;const prev=cfg.carousel.querySelector(".arrowCircle.prev"),next=cfg.carousel.querySelector(".arrowCircle.next"),reels=cfg.reelsBySys[sysKey]||[],unlock=lockElHeight(cfg.carousel);track.innerHTML="";nav.innerHTML="";setArrowsEnabled(prev,next,reels.length>1);reels.forEach((reel,idx)=>{const slide=document.createElement("div");slide.className="carousel-slide"+(idx===0?" is-active":"");slide.classList.add("blur-frame");const thumbUrl=`https://i.ytimg.com/vi/${reel.id}/hqdefault.jpg`;slide.style.setProperty("--blur-src",`url("${thumbUrl}")`);const wrap=document.createElement("div");wrap.className="reel-embed";wrap.dataset.ytid=reel.id;wrap.dataset.title=reel.title||"";renderReelThumb(wrap);slide.appendChild(wrap);track.appendChild(slide);const dot=document.createElement("button");dot.type="button";dot.className="dot"+(idx===0?" active":"");dot.setAttribute("aria-label","Ir al reel "+(idx+1));on(dot,"click",()=>{const slides=QA(".carousel-slide",track);slides.forEach(s=>s.classList.remove("is-active"));slides[idx]?.classList.add("is-active");QA(".dot",nav).forEach(d=>d.classList.remove("active"));dot.classList.add("active");track.scrollTo({left:slides[idx].offsetLeft,behavior:"smooth"});stopAllReels();panelKey!=="servicios"&&setSingleLineReelTitle(cfg,reel.title||"")});nav.appendChild(dot)});panelKey!=="servicios"&&reels[0]?.title&&setSingleLineReelTitle(cfg,reels[0].title);requestAnimationFrame(()=>{unlock();const slides=QA(".carousel-slide",track);slides.length&&buildOffsetsCache(track,slides);observeTrack(track)})}
function initReelsCarousel(panelKey){const cfg=REELS_DATA[panelKey];if(!cfg||!cfg.carousel)return;const track=cfg.carousel.querySelector(".carousel-track"),prev=cfg.carousel.querySelector(".arrowCircle.prev"),next=cfg.carousel.querySelector(".arrowCircle.next");if(!track)return;observeTrack(track);const slidesFor=()=>QA(".carousel-slide",track),dotsFor=()=>QA(".carousel-nav .dot",cfg.carousel);if(cfg.carousel.dataset.arrowsBound!=="1"){cfg.carousel.dataset.arrowsBound="1";const goTo=i=>{const slides=slidesFor(),len=slides.length;if(!len||len<=1)return;const idx=(i%len+len)%len;slides.forEach(s=>s.classList.remove("is-active"));slides[idx].classList.add("is-active");dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));track.scrollTo({left:slides[idx].offsetLeft,behavior:"smooth"});const sys=cfg._activeSys||cfg.defaultSys,reels=cfg.reelsBySys[sys]||[];panelKey!=="servicios"&&setSingleLineReelTitle(cfg,reels[idx]?.title||"");stopAllReels()};on(prev,"click",()=>{const slides=slidesFor();if(slides.length<=1)return;const i=slides.findIndex(s=>s.classList.contains("is-active"));goTo(i-1)});on(next,"click",()=>{const slides=slidesFor();if(slides.length<=1)return;const i=slides.findIndex(s=>s.classList.contains("is-active"));goTo(i+1)})}if(cfg.carousel.dataset.scrollSync!=="1"){cfg.carousel.dataset.scrollSync="1";let raf=0,lastIdx=-1;const syncFromScroll=()=>{raf=0;const slides=slidesFor(),len=slides.length;if(!len)return;const idx=closestIndexFromCache(track);if(idx===lastIdx)return;lastIdx=idx;slides.forEach((s,k)=>s.classList.toggle("is-active",k===idx));dotsFor().forEach((d,k)=>d.classList.toggle("active",k===idx));const sys=cfg._activeSys||cfg.defaultSys,reels=cfg.reelsBySys[sys]||[];panelKey!=="servicios"&&setSingleLineReelTitle(cfg,reels[idx]?.title||"")};on(track,"scroll",()=>{raf&&cancelAnimationFrame(raf);raf=requestAnimationFrame(syncFromScroll)},{passive:!0});on(window,"resize",()=>{lastIdx=-1;const slides=slidesFor();slides.length&&buildOffsetsCache(track,slides);syncFromScroll()})}cfg._activeSys=cfg.defaultSys;buildReelsSlides(panelKey,cfg.defaultSys)}
function initYTLiteVideos(){QA(".yt-lite").forEach(node=>{if(node.dataset.ytReady==="1")return;const id=node.dataset.ytid,title=node.dataset.title||"Video";if(!id)return;node.dataset.ytReady="1";const thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;node.innerHTML=`<button class="yt-lite-inner" type="button" aria-label="Reproducir: ${title}"><span class="yt-lite-thumb" style="background-image:url('${thumb}')"></span><span class="yt-lite-play"></span></button>`;on(node,"click",()=>{if(node.dataset.ytLoaded==="1")return;stopAllReels();node.innerHTML=`<iframe class="yt-iframe" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;node.dataset.ytLoaded="1"})})}
function initFAQ(){document.querySelectorAll(".faq-item").forEach(item=>{if(item.dataset.bound==="1")return;item.dataset.bound="1";on(item,"toggle",()=>{if(!item.open)return;document.querySelectorAll(".faq-item").forEach(other=>{other!==item&&other.removeAttribute("open")})})})}
function initReelsTabs(){QA(".reel-tab").forEach(tab=>{if(tab.dataset.bound==="1")return;tab.dataset.bound="1";on(tab,"click",()=>{const panelKey=tab.dataset.panel,sysKey=tab.dataset.sys;if(!panelKey||!sysKey)return;const cfg=REELS_DATA[panelKey];cfg&&(cfg._activeSys=sysKey);stopAllReels();QA(".reel-tab").forEach(t=>{t.dataset.panel===panelKey&&t.classList.toggle("active",t===tab)});buildReelsSlides(panelKey,sysKey);const reels0=cfg?.reelsBySys?.[sysKey]||[];cfg?.carousel?.querySelector(".carousel-track")?.scrollTo({left:0,behavior:"auto"});panelKey!=="servicios"&&setSingleLineReelTitle(cfg,reels0[0]?.title||"");window.dispatchEvent(new Event("splitbg:update"))})})}
function initTOC(){const toc=Q("#toc");if(!toc||toc.dataset.bound==="1")return;toc.dataset.bound="1";const toggle=Q("#tocToggle",toc),closeBtn=Q(".toc-close",toc),links=QA('a[href^="#"]',toc),open=()=>{toc.classList.remove("collapsed");toc.classList.add("open");toggle&&toggle.setAttribute("aria-label","Cerrar mapa");toggle&&toggle.setAttribute("aria-expanded","true")},close=()=>{toc.classList.add("collapsed");toc.classList.remove("open");toggle&&toggle.setAttribute("aria-label","Abrir mapa");toggle&&toggle.setAttribute("aria-expanded","false")},toggleTOC=()=>{toc.classList.contains("collapsed")?open():close()};on(toggle,"click",e=>{e.preventDefault();e.stopPropagation();toggleTOC()});on(closeBtn,"click",e=>{e.preventDefault();e.stopPropagation();close()});links.forEach(a=>on(a,"click",()=>close()));on(document,"click",e=>{toc.contains(e.target)||close()});on(document,"keydown",e=>{"Escape"===e.key&&close()});close()}

            
/* 11) services pager (mobile) */
function initServicesPager(){const root=document.getElementById("servicesCarousel"),dotsWrap=document.getElementById("servicesDots");if(!root||!dotsWrap)return;const isDesktop=window.matchMedia("(min-width: 981px)").matches,isCarousel=root.classList.contains("is-carousel");if(isDesktop||!isCarousel){dotsWrap.innerHTML="";root.__svcPagerSync=null;return}const pages=Array.from(root.querySelectorAll(".svc-page"));if(pages.length<=1){dotsWrap.innerHTML="";root.__svcPagerSync=null;return}dotsWrap.innerHTML="";const base=pages[0].offsetLeft,dots=pages.map((p,i)=>{const b=document.createElement("button");b.type="button";b.className="dot"+(i===0?" active":"");b.setAttribute("aria-label",`Ir a página ${i+1} de servicios`);b.addEventListener("click",()=>{root.scrollTo({left:pages[i].offsetLeft-base,behavior:"smooth"})});dotsWrap.appendChild(b);return b});const setActive=i=>{dots.forEach((d,idx)=>d.classList.toggle("active",idx===i))},mids=pages.map(p=>p.offsetLeft-base+p.clientWidth/2),sync=()=>{const x=(root.scrollLeft||0)+root.clientWidth/2;let best=0,bestDist=1/0;for(let i=0;i<mids.length;i++){const d=Math.abs(x-mids[i]);d<bestDist&&(bestDist=d,best=i)}setActive(best)};root.__svcPagerSync=sync;if(root.dataset.pagerBound!=="1"){root.dataset.pagerBound="1";let raf=0;root.addEventListener("scroll",()=>{raf&&cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{typeof root.__svcPagerSync=="function"&&root.__svcPagerSync()})},{passive:!0})}requestAnimationFrame(()=>requestAnimationFrame(sync))}

/* 12) INIT principal */
on(window,"DOMContentLoaded",async()=>{await Promise.all([loadPartial("header-placeholder","global-header.html"),loadPartial("footer-placeholder","global-footer.html")]);normalizeRoutes(document);bindWheelOnTabs();initForms();initTabsProductos();initPromosFilter();initClickableCards();initTOC();initHeroGallery();["contable","comercial","nube","productividad","servicios"].forEach(initReelsCarousel);initReelsTabs();initYTLiteVideos();initFAQ();initServicesPager();const yearSpan=document.getElementById("gf-year");yearSpan&&(yearSpan.textContent=new Date().getFullYear())});

/* 12.1) mapa: lazy load PSI */
(function(){"use strict";function addPreconnect(href){if(document.querySelector(`link[rel="preconnect"][href="${href}"]`))return;const l=document.createElement("link");l.rel="preconnect";l.href=href;l.crossOrigin="anonymous";document.head.appendChild(l)}function loadMap(root){if(!root||root.dataset.loaded==="1")return;root.dataset.loaded="1";addPreconnect("https://www.google.com");addPreconnect("https://www.google.com.mx");addPreconnect("https://maps.google.com");addPreconnect("https://maps.gstatic.com");const src=root.getAttribute("data-embed");if(!src)return;const iframe=document.createElement("iframe");iframe.src=src;iframe.loading="lazy";iframe.referrerPolicy="no-referrer-when-downgrade";iframe.allowFullscreen=!0;iframe.title="Mapa: ExpIRI Ti";iframe.setAttribute("aria-hidden","false");root.innerHTML="";root.appendChild(iframe)}function initLazyMap(){const root=document.getElementById("mapExpiriti");if(!root)return;if(root.dataset.mapBound==="1")return;root.dataset.mapBound="1";root.addEventListener("click",e=>{const cta=e.target.closest(".map-cover-cta");if(!cta)return;e.preventDefault();loadMap(root)});if("IntersectionObserver"in window){const io=new IntersectionObserver(entries=>{entries.forEach(ent=>{if(ent.isIntersecting){loadMap(root);io.disconnect()}})},{rootMargin:"200px 0px"});io.observe(root)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",initLazyMap,{once:!0}):initLazyMap()})();

/* 13) eventos globales */
on(window,"resize",()=>safe(initServicesPager));
on(window,"pageshow",()=>{safe(()=>normalizeRoutes(document));safe(bindWheelOnTabs);safe(initServicesPager)});
})(); /* END main IIFE */

/* =========================================================
 SplitBG — calcula splits para fondos por secciones
========================================================= */
(()=>{if(window.__EXPIRITI_SPLITBG__)return;window.__EXPIRITI_SPLITBG__=!0;const D=document,root=D.documentElement,px=n=>`${Math.max(0,Math.round(n))}px`,getTop=el=>{if(!el)return null;const r=el.getBoundingClientRect();return r.top+window.scrollY},getBottom=el=>{if(!el)return null;const r=el.getBoundingClientRect();return r.bottom+window.scrollY},getHeaderOffset=()=>{const gh=getComputedStyle(root).getPropertyValue("--gh-height").trim(),n=parseFloat(gh||"0");return Number.isFinite(n)?n:0},setSplits=()=>{const headerOffset=getHeaderOffset(),sistemas=D.getElementById("productos-con"),sectores=D.getElementById("sectores"),servicios=D.getElementById("servicios"),promos=D.getElementById("promociones"),s1=getTop(sistemas),s2=getBottom(sectores),s3=getBottom(servicios),s4=getTop(promos);s1!=null&&root.style.setProperty("--split-sistemas",px(s1-headerOffset));s2!=null&&root.style.setProperty("--split-sectores-end",px(s2-headerOffset));s3!=null&&root.style.setProperty("--split-servicios-end",px(s3-headerOffset));s4!=null&&root.style.setProperty("--split-promos",px(s4-headerOffset))},rafSet=()=>requestAnimationFrame(setSplits);D.readyState==="loading"?D.addEventListener("DOMContentLoaded",rafSet,{once:!0}):rafSet();window.addEventListener("load",rafSet,{once:!0});window.addEventListener("resize",rafSet);window.addEventListener("orientationchange",rafSet);document.fonts&&document.fonts.ready&&document.fonts.ready.then(rafSet).catch(()=>{});window.addEventListener("splitbg:update",rafSet)})();

/* =========================================================
 Patch — centrar tab activo (HERO + productos) sin duplicar
========================================================= */
(()=>{if(window.__IX_TAB_CENTER__)return;window.__IX_TAB_CENTER__=1;function centerIntoView(el){try{el.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"})}catch(e){}}document.addEventListener("click",e=>{const t=e.target.closest(".hero-gallery-groups .hero-group-tab");t&&centerIntoView(t)},{passive:!0});document.addEventListener("click",e=>{const t=e.target.closest(".prod-tabs .tab");t&&centerIntoView(t)},{passive:!0})})();

/* =========================================================
 PATCH v2026.01.13 — SMART SWIPE + ARROWS MOBILE (INDEX)
========================================================= */
(()=>{"use strict";if(window.__EXPIRITI_SWIPE_PATCH__)return;window.__EXPIRITI_SWIPE_PATCH__=!0;const $$=(s,c=document)=>Array.from(c.querySelectorAll(s)),clamp=(v,min,max)=>Math.max(min,Math.min(max,v));function scrollByPage(t,d){const w=t.clientWidth||320;t.scrollBy({left:d*w,behavior:"smooth"})}function ensureArrows(c){const t=c.querySelector(".carousel-track"),p=c.querySelector(".arrowCircle.prev"),n=c.querySelector(".arrowCircle.next");if(!t||!p||!n)return;p.style.display="";n.style.display="";p.hidden=!1;n.hidden=!1;p.__boundArrow||(p.addEventListener("click",()=>scrollByPage(t,-1),{passive:!0}),p.__boundArrow=!0);n.__boundArrow||(n.addEventListener("click",()=>scrollByPage(t,1),{passive:!0}),n.__boundArrow=!0);const s=()=>{const m=Math.max(0,t.scrollWidth-t.clientWidth),x=t.scrollLeft;p.disabled=x<=2;n.disabled=x>=m-2;const h=m>4;p.style.opacity=h?"":"0";n.style.opacity=h?"":"0";p.style.pointerEvents=h?"":"none";n.style.pointerEvents=h?"":"none"};t.__boundArrowSync||(t.addEventListener("scroll",s,{passive:!0}),window.addEventListener("resize",s,{passive:!0}),t.__boundArrowSync=!0,setTimeout(s,0))}function bindSmartSwipe(t){if(!t||t.__smartSwipeBound)return;t.__smartSwipeBound=!0;t.style.touchAction="pan-y";let d=!1,x0=0,y0=0,l0=0,i=0;const TH=10,R=1.15;function down(e){d=!0;i=0;x0=e.clientX;y0=e.clientY;l0=t.scrollLeft;try{t.setPointerCapture(e.pointerId)}catch(_){}}function move(e){if(!d)return;const dx=e.clientX-x0,dy=e.clientY-y0;if(i===0){if(Math.abs(dx)<TH&&Math.abs(dy)<TH)return;if(Math.abs(dx)>Math.abs(dy)*R)i=1;else{i=-1;return}}if(i===1){e.preventDefault();const m=Math.max(0,t.scrollWidth-t.clientWidth);t.scrollLeft=clamp(l0-dx,0,m)}}function up(e){d=!1;i=0;try{t.releasePointerCapture(e.pointerId)}catch(_){}}t.addEventListener("pointerdown",down,{passive:!0});t.addEventListener("pointermove",move,{passive:!1});t.addEventListener("pointerup",up,{passive:!0});t.addEventListener("pointercancel",up,{passive:!0})}const hero=document.getElementById("heroGalleryCarousel");if(hero){const ht=hero.querySelector(".carousel-track");bindSmartSwipe(ht)}$$(".carousel[id^='carouselReels-']").forEach(c=>{bindSmartSwipe(c.querySelector(".carousel-track"));ensureArrows(c)})})();

/* =========================================================
 Expiriti — INDEX FIX PACK (JS) v2026.01.21 Swipe real (pointer + touch fallback) Nunca bloquear scroll vertical salvo gesto horizontal claro
========================================================= */



/* =========================================================
 Expiriti — PATCH v2026.01.22 (JS)
 OBJ: “Kill-switch” de interceptores de swipe (pointer/touch) en tracks
      => el navegador maneja pan-y vs pan-x nativo (UX estándar)
 NOTA: esto evita la situación “no hace nada” en diagonales.
========================================================= */
(()=>{"use strict";if(window.__EXPIRITI_GESTURE_NATIVE__)return;window.__EXPIRITI_GESTURE_NATIVE__=1;
const SEL=".page-index .carousel-track,.page-index #heroGalleryCarousel .carousel-track";
function killInterceptors(el){
  if(!el||el.dataset.nativeGestures==="1")return;el.dataset.nativeGestures="1";
  const stop=e=>{try{e.stopImmediatePropagation()}catch(_){try{e.stopPropagation()}catch(__){}}};
  /* Captura: bloquea handlers anteriores (normalmente en burbuja) sin tocar el default scroll */
  ["pointerdown","pointermove","pointerup","pointercancel","touchstart","touchmove","touchend","touchcancel"].forEach(ev=>{
    el.addEventListener(ev,stop,{capture:true,passive:true});
  });
  /* Asegura que CSS no limite el gesto */
  el.style.touchAction="auto";
}
function init(){document.querySelectorAll(SEL).forEach(killInterceptors)}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init,{once:true}):init();
window.addEventListener("pageshow",init,{passive:true});
})();
(()=>{const boot=()=>{const root=document.querySelector("#interestUi"),sel=document.querySelector("#interes"),msg=document.querySelector("#interestCurrent"),form=document.querySelector("#contactForm");if(!root||!sel)return;const modeBtns=[...root.querySelectorAll(".interest-mode")],catBtns=[...root.querySelectorAll(".interest-cat")],modePanels=[...root.querySelectorAll("[data-mode-panel]")],sysGroups=[...root.querySelectorAll("[data-sysgroup]")],pickBtns=[...root.querySelectorAll(".interest-system,.interest-service")],setMode=m=>{root.dataset.mode=m;modeBtns.forEach(b=>{const on=b.dataset.mode===m;b.classList.toggle("is-active",on);b.setAttribute("aria-selected",on?"true":"false")});modePanels.forEach(p=>p.hidden=p.dataset.modePanel!==m)},setCat=c=>{root.dataset.syscat=c;catBtns.forEach(b=>{const on=b.dataset.syscat===c;b.classList.toggle("is-active",on);b.setAttribute("aria-selected",on?"true":"false")});sysGroups.forEach(g=>{const on=g.dataset.sysgroup===c;g.hidden=!on;g.classList.toggle("is-active",on)})},setValue=btn=>{pickBtns.forEach(b=>b.classList.remove("is-active"));btn.classList.add("is-active");sel.value=btn.dataset.value||"";msg.textContent=sel.value?`Seleccionado: ${sel.value}`:"Selecciona un sistema o servicio.";msg.classList.remove("is-error")};modeBtns.forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));catBtns.forEach(b=>b.addEventListener("click",()=>setCat(b.dataset.syscat)));pickBtns.forEach(b=>b.addEventListener("click",()=>setValue(b)));form&&form.addEventListener("submit",e=>{if(sel.value)return;e.preventDefault();msg.textContent="Selecciona un sistema o servicio para continuar.";msg.classList.add("is-error");root.scrollIntoView({behavior:"smooth",block:"center"})});setMode(root.dataset.mode||"sistemas");setCat(root.dataset.syscat||"contables")};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot,{once:true}):boot()})();

/* EXPIRITI GLOBAL HEADER FINAL BIND */
(()=>{if(window.__EXP_GH_FINAL_BIND__)return;window.__EXP_GH_FINAL_BIND__=1;const D=document,W=window,Q=(s,c=D)=>c.querySelector(s),QA=(s,c=D)=>[...c.querySelectorAll(s)],isGh=location.hostname.endsWith("github.io"),seg=(location.pathname.split("/")[1]||"").trim(),repoBase=isGh&&seg?"/"+seg:"",parts=location.pathname.replace(/\/+$/,"").split("/").filter(Boolean),contentParts=isGh?parts.slice(1):parts,depth=contentParts.length>1?"../".repeat(contentParts.length-1):"./",path=p=>{if(!p)return p;if(/^(https?:)?\/\//i.test(p)||/^(mailto:|tel:|data:)/i.test(p)||p.startsWith("#"))return p;if(p.startsWith("/"))return isGh?repoBase+p:p;return((isGh?repoBase+"/":depth)+p).replace(/([^:]\/)\/+/g,"$1")};function assets(root=D){QA(".js-img[data-src]",root).forEach(img=>{const raw=img.dataset.src;if(raw){img.src=path(raw);img.style.opacity="1"}});QA(".js-link[data-href]",root).forEach(a=>{const raw=a.dataset.href;if(raw)a.href=path(raw)});QA('a[href^="/"]',root).forEach(a=>a.href=path(a.getAttribute("href")));QA('img[src^="/"]',root).forEach(img=>img.src=path(img.getAttribute("src")));D.body.classList.add("has-gh");const y=Q("#gf-year");y&&(y.textContent=new Date().getFullYear())}function drawer(open){const h=Q("#gh-header"),dr=Q("#gh-drawer"),dim=Q("#gh-dim"),bg=Q("#gh-burger");if(!h||!dr||!dim||!bg)return;if(open){dr.hidden=false;dim.hidden=false;requestAnimationFrame(()=>{D.documentElement.classList.add("gh-open");D.body.classList.add("gh-open");dr.setAttribute("aria-hidden","false");bg.setAttribute("aria-expanded","true");D.body.style.overflow="hidden";assets(dr)})}else{D.documentElement.classList.remove("gh-open");D.body.classList.remove("gh-open");dr.setAttribute("aria-hidden","true");bg.setAttribute("aria-expanded","false");D.body.style.overflow="";setTimeout(()=>{if(!D.documentElement.classList.contains("gh-open")){dr.hidden=true;dim.hidden=true}},220)}}function mobileSystems(cat){const root=Q("#gh-msys"),track=Q("#gh-sysswipe");if(!root||!track)return;const order=["contables","comerciales","nube","prod"],i=Math.max(0,order.indexOf(cat));QA(".gh-cat",root).forEach(b=>{const on=(b.dataset.cat||"")===cat;b.classList.toggle("is-active",on);b.setAttribute("aria-selected",on?"true":"false")});track.scrollTo({left:i*(track.clientWidth||1),behavior:"smooth"});QA(".gh-sysdots .dot",root).forEach((d,k)=>d.classList.toggle("is-active",k===i))}function mobileServices(dir=1){const tr=Q("#gh-msvc .gh-svctrack");if(!tr)return;tr.scrollBy({left:dir*(tr.clientWidth||1),behavior:"smooth"})}function bind(){const h=Q("#gh-header");if(!h)return;assets(h);assets(D);if(!D.__ghFinalClicks){D.__ghFinalClicks=1;D.addEventListener("click",e=>{const b=e.target.closest("#gh-burger");if(b){e.preventDefault();e.stopImmediatePropagation();drawer(!D.documentElement.classList.contains("gh-open"));return}const c=e.target.closest("#gh-close,#gh-dim");if(c){e.preventDefault();e.stopImmediatePropagation();drawer(false);return}const t=e.target.closest("#gh-theme");if(t){e.preventDefault();e.stopImmediatePropagation();const cur=D.documentElement.getAttribute("data-theme")||localStorage.getItem("expiriti_theme")||"light",next=cur==="light"?"dark":"light";D.documentElement.setAttribute("data-theme",next);localStorage.setItem("expiriti_theme",next);t.setAttribute("aria-pressed",next==="dark"?"true":"false");return}const cat=e.target.closest("#gh-msys .gh-cat[data-cat]");if(cat){e.preventDefault();e.stopImmediatePropagation();mobileSystems(cat.dataset.cat);return}const svPrev=e.target.closest("#gh-msvc .gh-svcarrow.prev"),svNext=e.target.closest("#gh-msvc .gh-svcarrow.next");if(svPrev||svNext){e.preventDefault();e.stopImmediatePropagation();mobileServices(svPrev?-1:1);return}const link=e.target.closest("a.js-link[data-href]");if(link){const raw=link.dataset.href,want=path(raw);link.href=want;e.preventDefault();e.stopImmediatePropagation();if(link.closest("#gh-drawer"))drawer(false);if(e.metaKey||e.ctrlKey||link.target==="_blank")W.open(want,"_blank","noopener");else location.href=want;return}},true);D.addEventListener("keydown",e=>{if(e.key==="Escape")drawer(false)},{passive:true})}if(!D.__ghFinalHover){D.__ghFinalHover=1;QA("#gh-header .gh-dd-wrap").forEach(w=>{let tm=0;const open=()=>{if(W.matchMedia("(max-width:1023px)").matches)return;clearTimeout(tm);QA("#gh-header .gh-dd-wrap").forEach(x=>x!==w&&x.classList.remove("gh-open"));w.classList.add("gh-open")},close=()=>{clearTimeout(tm);tm=setTimeout(()=>w.classList.remove("gh-open"),160)};w.addEventListener("mouseenter",open);w.addEventListener("mouseleave",close)})}}const boot=()=>{bind();setTimeout(bind,120);setTimeout(bind,450)};D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:true}):boot();W.addEventListener("pageshow",boot,{passive:true})})();

/* EXPIRITI PROMO BANNER MENSUAL v2 (lee /data/promociones.json; falla en silencio)
   Aprobado 2026-07: arriba SOLO el mes (kicker); el CTA "Pide tu Promo" va DEBAJO del grid de imágenes. */
(()=>{if(window.__EXP_PROMO_BANNER__)return;window.__EXP_PROMO_BANNER__=1;
const boot=async()=>{const slot=document.getElementById("promoBannerSlot");if(!slot)return;
try{
  const url="/data/promociones.json?d="+(new Date).toISOString().slice(0,10);
  const r=await fetch(url,{cache:"no-cache"});if(!r.ok)return;
  const p=await r.json();if(!p||p.activo!==true)return;
  const hoy=(new Date).toISOString().slice(0,10);
  if(p.fechaInicio&&hoy<p.fechaInicio)return;
  if(p.fechaFin&&hoy>p.fechaFin)return;
  if(p.mes){const m=document.createElement("p");m.className="pb-mes";m.textContent=p.mes;slot.replaceChildren(m)}
  const grid=document.getElementById("promoGrid");
  if(grid&&p.ctaUrl&&!document.getElementById("promoCtaAfter")){
    const wrap=document.createElement("div");wrap.id="promoCtaAfter";wrap.style.cssText="display:flex;justify-content:center;margin-top:16px";
    const a=document.createElement("a");a.className="btn btn-grad-green";a.href=p.ctaUrl;a.textContent=p.ctaTexto||"Pide tu Promo";
    if(/^https?:/i.test(p.ctaUrl)){a.target="_blank";a.rel="noopener"}
    wrap.appendChild(a);grid.insertAdjacentElement("afterend",wrap);
  }
}catch(_){/* si el JSON falla, la página sigue normal */}};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot,{once:true}):boot()})();

/* EXPIRITI BURGER SWIPE BLINDAJE (aprobado 2026-07): dots/categorías sincronizados al deslizar
   y pill de categoría centrada al tocarla, sin duplicar listeners ni tocar la lógica existente. */
(()=>{if(window.__EXP_BURGER_SYNC__)return;window.__EXP_BURGER_SYNC__=1;
const D=document;
function bindSys(){
  const root=D.getElementById("gh-msys"),track=D.getElementById("gh-sysswipe");
  if(!root||!track||track.__ixSync)return;track.__ixSync=1;
  const order=["contables","comerciales","nube","prod"];
  const bar=root.querySelector(".gh-catbar");
  const center=btn=>{if(!btn||!bar)return;const left=btn.offsetLeft-(bar.clientWidth-btn.clientWidth)/2;bar.scrollTo({left:Math.max(0,left),behavior:"smooth"})};
  const sync=()=>{const w=track.clientWidth||1;const i=Math.max(0,Math.min(order.length-1,Math.round(track.scrollLeft/w)));
    root.querySelectorAll(".gh-cat").forEach(b=>{const on=(b.dataset.cat||"")===order[i];b.classList.toggle("is-active",on);b.setAttribute("aria-selected",on?"true":"false");if(on)center(b)});
    root.querySelectorAll(".gh-sysdots .dot").forEach((d,k)=>d.classList.toggle("is-active",k===i))};
  let raf=0;track.addEventListener("scroll",()=>{raf||(raf=requestAnimationFrame(()=>{raf=0;sync()}))},{passive:true});
  root.querySelectorAll(".gh-sysdots .dot").forEach((d,k)=>{d.__ixBound||(d.__ixBound=1,d.addEventListener("click",e=>{e.preventDefault();track.scrollTo({left:k*(track.clientWidth||1),behavior:"smooth"})}))});
}
function bindSvc(){
  const root=D.getElementById("gh-msvc"),track=D.getElementById("gh-svctrack");
  if(!root||!track||track.__ixSync)return;track.__ixSync=1;
  const sync=()=>{const pages=track.querySelectorAll(".gh-svcpage").length||1;const w=track.clientWidth||1;const i=Math.max(0,Math.min(pages-1,Math.round(track.scrollLeft/w)));
    root.querySelectorAll(".gh-svcdots .dot").forEach((d,k)=>d.classList.toggle("is-active",k===i))};
  let raf=0;track.addEventListener("scroll",()=>{raf||(raf=requestAnimationFrame(()=>{raf=0;sync()}))},{passive:true});
  root.querySelectorAll(".gh-svcdots .dot").forEach((d,k)=>{d.__ixBound||(d.__ixBound=1,d.addEventListener("click",e=>{e.preventDefault();track.scrollTo({left:k*(track.clientWidth||1),behavior:"smooth"})}))});
}
const boot=()=>{bindSys();bindSvc()};
D.addEventListener("click",e=>{e.target.closest("#gh-burger")&&setTimeout(boot,260)},true);
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",()=>setTimeout(boot,400),{once:true}):setTimeout(boot,400);
})();

/* EXPIRITI CONTACT ANCHOR OFFSET FIX */
(()=>{if(window.__EXP_CONTACT_ANCHOR_FIX__)return;window.__EXP_CONTACT_ANCHOR_FIX__=1;const go=()=>{const el=document.querySelector("#contacto");if(!el)return;const h=document.querySelector("#gh-header")?.getBoundingClientRect().height||68;const y=el.getBoundingClientRect().top+scrollY-h-10;scrollTo({top:Math.max(0,y),behavior:"smooth"})};document.addEventListener("click",e=>{const a=e.target.closest('a[href$="#contacto"],a[data-href$="#contacto"]');if(!a)return;const raw=a.getAttribute("href")||a.dataset.href||"";if(!raw.includes("#contacto"))return;if(location.pathname.endsWith("/")||location.pathname.endsWith("/index.html")||location.pathname==="/index.html"){e.preventDefault();e.stopImmediatePropagation();history.replaceState(null,"","#contacto");go()}},true);window.addEventListener("load",()=>{if(location.hash==="#contacto")setTimeout(go,80)},{once:true})})();

/* Axis-aware wheel: vertical-dominant diagonals stay on the page; horizontal input remains native. */

/* __EXP_T12AR4_FORM_OWNER__ */
(()=>{
  const mq=matchMedia("(max-width:780px)");

  const apply=()=>{

    document
      .querySelectorAll(
        "#contactForm .contact-top-grid"
      )
      .forEach(grid=>{

        grid.style.setProperty(
          "display",
          "grid",
          "important"
        );

        grid.style.setProperty(
          "grid-template-columns",
          mq.matches
            ?"minmax(0,1fr)"
            :"repeat(3,minmax(0,1fr))",
          "important"
        );

        grid.style.setProperty(
          "gap",
          "14px",
          "important"
        );

        grid.style.setProperty(
          "width",
          "100%",
          "important"
        );


        grid
          .querySelectorAll(
            ".contact-field"
          )
          .forEach(field=>{

            field.style.setProperty(
              "width",
              "auto",
              "important"
            );

            field.style.setProperty(
              "min-width",
              "0",
              "important"
            );

            field.style.setProperty(
              "max-width",
              "none",
              "important"
            );
          });


        ["#nombre","#correo","#telefono"]
          .forEach(sel=>{

            const input=
              grid.querySelector(sel);

            if(!input)return;

            input.style.setProperty(
              "display",
              "block",
              "important"
            );

            input.style.setProperty(
              "width",
              "100%",
              "important"
            );

            input.style.setProperty(
              "min-width",
              "0",
              "important"
            );

            input.style.setProperty(
              "max-width",
              "none",
              "important"
            );

            input.style.setProperty(
              "box-sizing",
              "border-box",
              "important"
            );
          });
      });
  };


  const boot=()=>{

    apply();

    if(mq.addEventListener){
      mq.addEventListener(
        "change",
        apply
      );
    }else if(mq.addListener){
      mq.addListener(apply);
    }
  };


  if(document.readyState==="loading"){

    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {once:true}
    );

  }else{

    boot();
  }
})();
/* END___EXP_T12AR4_FORM_OWNER__ */

/* __EXP_T12AR4_DARK_OWNER__ */
(()=>{
  const id=
    "exp-t12ar4-dark";

  if(
    document.getElementById(id)
  )return;

  const s=
    document.createElement(
      "style"
    );

  s.id=id;

  s.textContent=`
    html[data-theme="dark"]
    .hero .hero-piece.gradient-word,
    html[data-theme="dark"]
    .hero .hero-piece.gradient-word .hero-lock{
      color:#fff!important;
      -webkit-text-fill-color:#fff!important;
      background-image:none!important;
    }
  `;

  document.head.appendChild(s);
})();
/* END___EXP_T12AR4_DARK_OWNER__ */

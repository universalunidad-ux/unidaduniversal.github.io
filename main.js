 /* =========================================================
 Expiriti - main.js (FINAL) — MINIFICADO + COMENTARIOS (CORREGIDO)
 - Partials robustos (GH user-site + local/subcarpetas) + normaliza rutas
 - FIX: .js-link[data-href] ahora pasa por abs() y SIEMPRE setea href
 - FIX: .js-img[data-src] ahora SIEMPRE setea src (data-src manda)
 - Partials: cache normal en PROD, no-store solo con ?nocache=1
 - YouTube manager: lazy + pause real + sin overlays duplicados
 - Carrusel universal .carousel + títulos:
   * REELS: usa .reel-title (solo 1 visible con .active)
   * VIDEOS: barra superior “verde” (solo títulos) + oculta .yt-title blancos
 - CarouselX sistemas + ListSlider + Calculadora + Iconos -15%
 - SIN duplicados + FIX markReady + SIN recursión
========================================================= */
(()=>{"use strict";if(window.__EXP_MAIN_FINAL__)return;window.__EXP_MAIN_FINAL__=1;
const D=document,W=window;

/* =========================================================
 0) PARTIALS + NORMALIZACIÓN (GH Pages user-site + local/subcarpetas)
========================================================= */
(()=>{const inSub=/\/(SISTEMAS|SERVICIOS)\//i.test(location.pathname),rel=inSub?"../":"";
const isGhUserSite=location.hostname==="unidaduniversal.github.io"||location.hostname==="universalunidad-ux.github.io";
const headerURL=isGhUserSite?"/PARTIALS/global-header.html":(rel+"PARTIALS/global-header.html");
const footerURL=isGhUserSite?"/PARTIALS/global-footer.html":(rel+"PARTIALS/global-footer.html");

/* abs(): normaliza rutas de parciales (data-src/data-href) */
const abs=(p)=>{if(!p)return p;
if(/^https?:\/\//i.test(p))return p;
if(/^(mailto:|tel:|data:)/i.test(p))return p;
if(p.startsWith("/"))return p;                 /* ya absoluto */
if(isGhUserSite)return ("/"+p).replace(/\/+/g,"/");
return (rel+p).replace(/\/+/g,"/");            /* local/subcarpetas */
};

const normalize=(root=D)=>{
/* imágenes absolutas desde data-src */
root.querySelectorAll(".js-abs-src[data-src]").forEach(img=>{
const ds=img.getAttribute("data-src");if(!ds)return;
img.setAttribute("src",abs(ds));img.style.opacity="1";
});
/* links absolutos desde data-href */
root.querySelectorAll(".js-abs-href[data-href]").forEach(a=>{
const dh=a.getAttribute("data-href");if(!dh)return;
const [path,hash]=dh.split("#");a.href=abs(path||"")+(hash?("#"+hash):"");
});
/* FIX: js-img SIEMPRE setea src (data-src manda) */
root.querySelectorAll(".js-img[data-src]").forEach(img=>{
const ds=img.getAttribute("data-src");if(!ds)return;
img.setAttribute("src",abs(ds));
});
/* FIX: js-link SIEMPRE setea href y pasa por abs() */
root.querySelectorAll(".js-link[data-href]").forEach(a=>{
const dh=a.getAttribute("data-href");if(!dh)return;
const [path,hash]=dh.split("#");a.setAttribute("href",abs(path||"")+(hash?("#"+hash):""));
});

/* año footer */
const y=(root.getElementById&&root.getElementById("gf-year"))||D.getElementById("gf-year")||(root.getElementById&&root.getElementById("year"))||D.getElementById("year");
if(y)y.textContent=(new Date).getFullYear();
};

const loadPartials=async()=>{
const hp=D.getElementById("header-placeholder"),fp=D.getElementById("footer-placeholder");
if(!hp&&!fp){normalize(D);return}

const noCache=/(?:\?|&)nocache=1\b/.test(location.search);
const fetchOpts=noCache?{cache:"no-store"}:{cache:"force-cache"};

try{
if(hp){const hr=await fetch(headerURL,fetchOpts);hr.ok?hp.outerHTML=await hr.text():console.warn("[partials] header no cargó:",headerURL,hr.status)}
if(fp){const fr=await fetch(footerURL,fetchOpts);fr.ok?fp.outerHTML=await fr.text():console.warn("[partials] footer no cargó:",footerURL,fr.status)}
}catch(e){console.warn("[partials] error cargando parciales",e)}

normalize(D);

/* init del header si existe */
if(typeof W.initGlobalHeader==="function"){try{W.initGlobalHeader()}catch(e){console.warn("initGlobalHeader error",e)}}
};

const boot=()=>loadPartials();
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:true}):boot();

/* BFCache */
W.addEventListener("pageshow",()=>{try{normalize(D)}catch{}});

W.__EXP_ABS__=abs; /* opcional debug */
})();

/* =========================================================
 1) UTILIDADES (SIN $/$$)
========================================================= */
(()=>{const money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
W.$$fmt=v=>money.format(Math.round(Number(v||0)));
if(!W.Q)W.Q=(s,ctx=D)=>ctx.querySelector(s);
if(!W.QA)W.QA=(s,ctx=D)=>Array.from(ctx.querySelectorAll(s));
})();
/* =========================================================
 1.5) CATALOGO SISTEMAS (GLOBAL SIEMPRE)
 - Se define SIEMPRE aunque la calculadora aún no monte
========================================================= */
(()=>{ 
  W.CATALOG_SISTEMAS = W.CATALOG_SISTEMAS || [
    {name:"CONTPAQi Contabilidad",img:"../IMG/contabilidadsq.webp"},
    {name:"CONTPAQi Bancos",img:"../IMG/bancossq.webp"},
    {name:"CONTPAQi Nóminas",img:"../IMG/nominassq.webp"},
    {name:"CONTPAQi XML en Línea",img:"../IMG/xmlsq.webp",noDiscount:!0},
    {name:"CONTPAQi Comercial PRO",img:"../IMG/comercialprosq.webp"},
    {name:"CONTPAQi Comercial PREMIUM",img:"../IMG/comercialpremiumsq.webp"},
    {name:"CONTPAQi Factura Electrónica",img:"../IMG/facturasq.webp"}
  ];
})();

/* =========================================================
 3) YOUTUBE MANAGER (pause real + lazy + hook iframes)
========================================================= */
(()=>{if(W.__EXP_YT_MGR__)return;W.__EXP_YT_MGR__=1;W.exPlayers=W.exPlayers||[];
W.pauseAllYTIframes=function(except){(W.exPlayers||[]).forEach(p=>{if(!p||p===except||typeof p.pauseVideo!=="function")return;
try{const s=p.getPlayerState();if(s===1||s===3)p.pauseVideo()}catch{}})};
const onState=e=>{if(e&&e.data===1)W.pauseAllYTIframes(e.target)};
const ensureAPI=()=>{if(W.__EXP_YT_API_REQ__)return;W.__EXP_YT_API_REQ__=1;const s=D.createElement("script");s.src="https://www.youtube.com/iframe_api";D.head.appendChild(s)};
const whenYT=cb=>{if(W.YT&&W.YT.Player){cb();return}ensureAPI();let t=0;const it=setInterval(()=>{t++;if(W.YT&&W.YT.Player){clearInterval(it);cb();return}if(t>80)clearInterval(it)},100)};
const registerIframe=ifr=>{if(!ifr||ifr.dataset.ytInit)return;ifr.dataset.ytInit="1";let src=ifr.src||"";
if(src&&!src.includes("enablejsapi=1")){src+=(src.includes("?")?"&":"?")+"enablejsapi=1";ifr.src=src}
try{const p=new YT.Player(ifr,{events:{onStateChange:onState}});W.exPlayers.push(p)}catch{}};
const poster=id=>[`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,`https://i.ytimg.com/vi/${id}/sddefault.jpg`,`https://i.ytimg.com/vi/${id}/hqdefault.jpg`];
const markReady=wrap=>{if(!wrap||!wrap.classList)return;wrap.classList.add("is-ready");wrap.classList.add("has-iframe")};

const mountLazy=wrap=>{if(!wrap||wrap.dataset.ytMounted)return;
const existing=wrap.querySelector("iframe");
if(existing){wrap.dataset.ytMounted="1";wrap.classList.add("has-iframe");
existing.addEventListener("load",()=>markReady(wrap),{once:!0});setTimeout(()=>markReady(wrap),120);whenYT(()=>registerIframe(existing));return}
const id=wrap.getAttribute("data-ytid");if(!id)return;

wrap.dataset.ytMounted="0";
if(!wrap.style.position||wrap.style.position==="static")wrap.style.position="relative";
wrap.style.overflow="hidden";wrap.style.backgroundColor="#000";

const img=D.createElement("img");img.alt="Miniatura de video";img.loading="lazy";
img.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;cursor:pointer";
const srcs=poster(id);let k=0;const next=()=>{if(k<srcs.length)img.src=srcs[k++]};img.addEventListener("error",next);next();wrap.appendChild(img);

const btn=D.createElement("button");btn.type="button";btn.setAttribute("aria-label","Reproducir video");
btn.style.cssText="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:none;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center";
btn.innerHTML='<svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><rect x="1" y="7" width="66" height="36" rx="12" fill="#FF0000"></rect><polygon points="28,17 28,31 42,24" fill="#FFFFFF"></polygon></svg>';
wrap.appendChild(btn);

const load=()=>{if(wrap.dataset.ytMounted==="1")return;wrap.dataset.ytMounted="1";W.pauseAllYTIframes();wrap.innerHTML="";
const ifr=D.createElement("iframe");ifr.loading="lazy";
ifr.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";ifr.allowFullscreen=!0;
ifr.title=wrap.getAttribute("data-title")||"YouTube video";
ifr.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1&vq=hd1080`;
wrap.appendChild(ifr);wrap.classList.add("has-iframe");
ifr.addEventListener("load",()=>markReady(wrap),{once:!0});setTimeout(()=>markReady(wrap),200);whenYT(()=>registerIframe(ifr))};

btn.addEventListener("click",load);img.addEventListener("click",load);
};

const init=()=>{D.querySelectorAll(".yt-wrap[data-ytid],.reel-embed[data-ytid]").forEach(mountLazy);
D.querySelectorAll('iframe[src*="youtube"],iframe[src*="youtube-nocookie"]').forEach(ifr=>{const wrap=ifr.closest(".yt-wrap,.reel-embed");
if(wrap){ifr.addEventListener("load",()=>markReady(wrap),{once:!0});setTimeout(()=>markReady(wrap),120)}whenYT(()=>registerIframe(ifr))})};

/* FIX: encadena onYouTubeIframeAPIReady si ya existía */
const prevReady=W.onYouTubeIframeAPIReady;
W.onYouTubeIframeAPIReady=function(){try{prevReady&&prevReady()}catch{};D.querySelectorAll('iframe[src*="youtube"],iframe[src*="youtube-nocookie"]').forEach(registerIframe)};

D.readyState==="loading"?D.addEventListener("DOMContentLoaded",init,{once:!0}):init();
})();

/* =========================================================
 4) CARRUSEL UNIVERSAL (.carousel)
 - Reels: alterna .reel-title.active
 - Videos (#carouselVideos): barra superior 2-cols + oculta .yt-title blancos
 - Quita “Reels Destacados: …” SOLO en reels
========================================================= */
(()=>{const pause=()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes()};

const syncDots=(root,len)=>{const nav=root.querySelector(".carousel-nav");if(!nav)return[];
let dots=[...nav.querySelectorAll(".dot")];
for(;dots.length<len;){const b=D.createElement("button");b.type="button";b.className="dot";b.setAttribute("aria-label",`Ir al slide ${dots.length+1}`);nav.appendChild(b);dots.push(b)}
for(;dots.length>len;){const x=dots.pop();x&&x.remove()}return dots};

const hideUI=(root,len)=>{const prev=root.querySelector(".arrowCircle.prev"),next=root.querySelector(".arrowCircle.next"),nav=root.querySelector(".carousel-nav");
const single=len<=1;
if(prev){prev.disabled=single;prev.style.display=single?"none":""}
if(next){next.disabled=single;next.style.display=single?"none":""}
if(nav)nav.style.display=single?"none":"";
root.toggleAttribute("data-single",single);
};

const titlesFor=(car)=>{
const sel=car.getAttribute("data-titles");
if(sel){const n=[...D.querySelectorAll(sel)];if(n.length)return n}
const aside=car.closest("aside");
if(aside){const t=[...aside.querySelectorAll(":scope > .reel-title")];return t.length?t:null}
const parent=car.parentElement||D;
const t=[...parent.querySelectorAll(".reel-title")];
return t.length?t:null;
};

const slideReelTitle=(slide)=>{if(!slide)return"";
const w=slide.querySelector(".reel-embed[data-title],.yt-wrap[data-title]");
if(w){const s=(w.getAttribute("data-title")||"").trim();if(s)return s}
const ifr=slide.querySelector("iframe[title]");
if(ifr){const s=(ifr.getAttribute("title")||"").trim();if(s)return s}
const h=slide.querySelector("h4,h3");
return h?(h.textContent||"").trim():"";
};

const ensureVideosBar=(car)=>{if(!car||car.dataset.vbarInit==="1")return;car.dataset.vbarInit="1";
const track=car.querySelector(".carousel-track");if(!track)return;
const bar=D.createElement("div");bar.className="yt-titlesbar";bar.setAttribute("role","presentation");
const left=D.createElement("div"),right=D.createElement("div");left.className="yt-tab";right.className="yt-tab";
bar.append(left,right);track.parentElement.insertBefore(bar,track);car._vbar={bar,left,right};
};

const slideVideoTitles=(slide)=>{if(!slide)return[];
const h=[...slide.querySelectorAll(".yt-title")].map(x=>(x.textContent||"").trim()).filter(Boolean);if(h.length)return h;
const d=[...slide.querySelectorAll(".yt-wrap[data-title],.reel-embed[data-title]")].map(x=>(x.getAttribute("data-title")||"").trim()).filter(Boolean);if(d.length)return d;
const f=[...slide.querySelectorAll("iframe[title]")].map(x=>(x.getAttribute("title")||"").trim()).filter(Boolean);if(f.length)return f;
return[];
};

const updateVideosBar=(car,idx)=>{if(!car||car.id!=="carouselVideos")return;
ensureVideosBar(car);
car.querySelectorAll(".yt-title").forEach(h=>h.classList.add("yt-title--hidden"));
const track=car.querySelector(".carousel-track");
const slides=track?[...track.querySelectorAll(":scope > .carousel-slide")]:[];
if(!slides.length)return;
const slide=slides[idx]||slides[0];
const titles=slideVideoTitles(slide);
const a=titles[0]||"",b=titles[1]||"";
const v=car._vbar;if(!v)return;
v.left.textContent=a;v.right.textContent=b;
v.right.style.display=b?"":"none";
v.bar.style.gridTemplateColumns=b?"1fr 1fr":"1fr";
};

const initCar=(root,onChange)=>{const track=root.querySelector(".carousel-track");if(!track||root.dataset.cInit==="1")return;root.dataset.cInit="1";
const prev=root.querySelector(".arrowCircle.prev"),next=root.querySelector(".arrowCircle.next");
const slides=[...track.querySelectorAll(":scope > .carousel-slide")],len=slides.length;
let dots=syncDots(root,len);hideUI(root,len);
let i=0,paint=n=>dots.forEach((d,di)=>d.classList.toggle("active",di===n));
const set=(n,beh)=>{i=(n+len)%len;paint(i);track.scrollTo({left:track.clientWidth*i,behavior:beh||"smooth"});onChange&&onChange(i)};
if(len<=1){paint(0);onChange&&onChange(0);return}
dots.forEach((d,idx)=>d.addEventListener("click",()=>{pause();set(idx)}));
prev&&prev.addEventListener("click",()=>{pause();set(i-1)});
next&&next.addEventListener("click",()=>{pause();set(i+1)});
track.addEventListener("scroll",()=>{if(!track.clientWidth)return;
const n=Math.round(track.scrollLeft/track.clientWidth);
if(n!==i){i=Math.max(0,Math.min(len-1,n));paint(i);onChange&&onChange(i)}});
W.addEventListener("resize",()=>set(i,"auto"));
set(0,"auto");
};

const boot=()=>{D.querySelectorAll(".carousel").forEach(car=>{
const titles=titlesFor(car);

/* oculta “Reels Destacados…” SOLO en reels */
if(titles&&titles.length&&car.id!=="carouselVideos"){
const aside=car.closest("aside");
if(aside){const h=aside.querySelector(":scope > h4.title-gradient");if(h)h.style.display="none"}
}

initCar(car,(idx)=>{
/* Reels */
if(titles&&car.id!=="carouselVideos"){
const track=car.querySelector(".carousel-track");
const slides=track?[...track.querySelectorAll(":scope > .carousel-slide")]:[];
const slide=slides[idx]||slides[0];
if(titles.length===1){
const txt=slideReelTitle(slide);if(txt)titles[0].textContent=txt;
titles[0].classList.add("active");
}else titles.forEach((t,k)=>t.classList.toggle("active",k===idx));
}
/* Videos */
if(car.id==="carouselVideos")updateVideosBar(car,idx);
});

/* Inicial */
if(titles&&car.id!=="carouselVideos"&&titles.length===1){
const track=car.querySelector(".carousel-track");
const slides=track?[...track.querySelectorAll(":scope > .carousel-slide")]:[];
const txt=slideReelTitle(slides[0]);if(txt)titles[0].textContent=txt;
titles[0].classList.add("active");
}
if(car.id==="carouselVideos")updateVideosBar(car,0);
})};

D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
})();

/* =========================================================
 5) HARD RESET .carouselX .track (scrollLeft = 0)
========================================================= */
(()=>{const tracks=D.querySelectorAll(".carouselX .track");if(!tracks.length)return;
const force=t=>{if(!t)return;const prev=t.style.scrollBehavior;t.style.scrollBehavior="auto";t.scrollLeft=0;requestAnimationFrame(()=>{t.scrollLeft=0});
setTimeout(()=>{t.scrollLeft=0;t.style.scrollBehavior=prev||""},80)};
tracks.forEach(force);try{if("scrollRestoration"in history)history.scrollRestoration="manual"}catch{}
W.addEventListener("pageshow",e=>{if(e.persisted)tracks.forEach(force)});
W.addEventListener("resize",()=>tracks.forEach(force));
})();

/* =========================================================
 6) LIST SLIDER (.listSlider)
========================================================= */
(()=>{D.querySelectorAll(".listSlider").forEach(w=>{const t=w.querySelector(".listTrack"),p=w.querySelector(".arrowCircle.prev"),n=w.querySelector(".arrowCircle.next");
if(!t||!p||!n)return;let i=0,len=t.children.length||1;
const go=x=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();i=(x+len)%len;t.scrollTo({left:w.clientWidth*i,behavior:"smooth"})};
p.addEventListener("click",()=>go(i-1));n.addEventListener("click",()=>go(i+1));W.addEventListener("resize",()=>go(i));
})})();

/* =========================================================
 10.5) ICONS CAROUSEL (-15%) + CENTRADO VERTICAL
========================================================= */
(()=>{const enhanceOne=wrap=>{if(!wrap||wrap.dataset.icInit==="1")return;wrap.dataset.icInit="1";
const slot=wrap.closest("#calc-slot-2,.calc-container,.placeholder")||wrap.parentElement;
const note=(slot&&slot.querySelector)?slot.querySelector(".note"):null;if(note)note.classList.add("note-center");
let host=wrap.closest(".icons-carousel");if(!host){host=D.createElement("div");host.className="icons-carousel";wrap.parentElement.insertBefore(host,wrap);host.appendChild(wrap)}
const mkBtn=(cls,label,chev)=>{const b=D.createElement("button");b.type="button";b.className=`arrowCircle ${cls}`;b.setAttribute("aria-label",label);b.innerHTML=`<span class="chev">${chev}</span>`;return b};
let prev=host.querySelector(".arrowCircle.prev"),next=host.querySelector(".arrowCircle.next");
if(!prev){prev=mkBtn("prev","Anterior","‹");host.appendChild(prev)}
if(!next){next=mkBtn("next","Siguiente","›");host.appendChild(next)}
const step=()=>Math.max(220,Math.round(((wrap.querySelector(".sys-icon")?.offsetWidth)||200)+18));
const scrollByX=dir=>wrap.scrollBy({left:step()*dir,behavior:"smooth"});
prev.addEventListener("click",()=>scrollByX(-1));next.addEventListener("click",()=>scrollByX(1));
const paint=()=>{const canScroll=wrap.scrollWidth>wrap.clientWidth+4;
prev.style.display=canScroll?"":"none";next.style.display=canScroll?"":"none";
const c=wrap.closest(".calc-container")||slot;if(c)c.classList.toggle("has-icons",wrap.children.length>0)};
paint();W.addEventListener("resize",paint);new MutationObserver(paint).observe(wrap,{childList:!0,subtree:!1});
};
const boot=()=>{enhanceOne(D.getElementById("icons-sec-sys"));enhanceOne(D.getElementById("icons-third-sys"))};
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:!0}):boot();
})();

/* =========================================================
 7) PÍLDORAS (filtros cards)
========================================================= */
(()=>{const pills=Array.from(D.querySelectorAll(".pill")),cards=Array.from(D.querySelectorAll(".feature-grid .fcard"));
if(!pills.length||!cards.length)return;
const apply=tag=>cards.forEach(c=>{c.style.display=c.classList.contains("tag-"+tag)?"":"none"});
pills.forEach(p=>p.addEventListener("click",()=>{pills.forEach(x=>x.classList.remove("active"));p.classList.add("active");apply(p.dataset.filter)}));
apply((pills[0]&&pills[0].dataset.filter)?pills[0].dataset.filter:"nomina");
})();

/* =========================================================
 8) FAQ (solo uno abierto)
========================================================= */
(()=>{const wrap=D.getElementById("faqWrap");if(!wrap)return;
Array.from(wrap.querySelectorAll(".faq-item")).forEach(it=>{it.addEventListener("toggle",()=>{if(!it.open)return;
Array.from(wrap.querySelectorAll(".faq-item")).forEach(o=>{if(o!==it)o.removeAttribute("open")})
})})
})();

/* =========================================================
 9) CAROUSEL SISTEMAS (.carouselX)
========================================================= */
(()=>{const ensureUI=root=>{let prev=root.querySelector(".arrowCircle.prev"),next=root.querySelector(".arrowCircle.next");
if(!prev){prev=D.createElement("button");prev.className="arrowCircle prev";prev.setAttribute("aria-label","Anterior");prev.innerHTML='<span class="chev">‹</span>';root.appendChild(prev)}
if(!next){next=D.createElement("button");next.className="arrowCircle next";next.setAttribute("aria-label","Siguiente");next.innerHTML='<span class="chev">›</span>';root.appendChild(next)}
let dotsWrap=root.querySelector(".group-dots");if(!dotsWrap){dotsWrap=D.createElement("div");dotsWrap.className="group-dots";root.appendChild(dotsWrap)}
return{prev,next,dotsWrap}};
D.querySelectorAll(".carouselX").forEach(root=>{if(root.dataset.cxInit==="1")return;root.dataset.cxInit="1";
const track=root.querySelector(".track");if(!track)return;
const items=Array.from(root.querySelectorAll(".sys"));
items.forEach(it=>{it.setAttribute("role","link");it.setAttribute("tabindex","0");let touched=!1;
const isMob=()=>W.matchMedia("(max-width: 768px)").matches;
const go=()=>{
  const href=it.getAttribute("data-href");
  if(!href) return;

  const abs = (W.__EXP_ABS__ ? W.__EXP_ABS__(href) : href);
  /* Misma pestaña = 0 bloqueos y UX más natural */
  location.href = abs;
};
it.addEventListener("click",e=>{e.preventDefault();if(isMob()&&!touched){touched=!0;it.classList.add("show-hover");setTimeout(()=>{touched=!1},2e3);return}go()});
it.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}})
});
const ui=ensureUI(root),prev=ui.prev,next=ui.next,dotsWrap=ui.dotsWrap;
const perView=()=>W.innerWidth<=980?1:3;
const viewportW=()=>track.clientWidth||root.clientWidth||1;
const pageCount=()=>Math.max(1,Math.ceil((track.scrollWidth-1)/viewportW()));
let idx=0,dots=[];
const build=()=>{dotsWrap.innerHTML="";const total=pageCount();
dots=Array.from({length:total}).map((_,j)=>{const b=D.createElement("button");b.className="dot"+(j===0?" active":"");b.setAttribute("aria-label","Ir a página "+(j+1));
b.addEventListener("click",()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();go(j)});dotsWrap.appendChild(b);return b})};
const paint=j=>dots.forEach((d,i)=>d.classList.toggle("active",i===j));
const toggle=()=>{const multi=pageCount()>1;prev.style.display=multi?"":"none";next.style.display=multi?"":"none";dotsWrap.style.display=multi?"":"none"};
const go=j=>{const total=pageCount();idx=((j%total)+total)%total;
const startIdx=Math.min(idx*perView(),items.length-1),first=items[startIdx];
const baseLeft=idx===0?0:(first?(first.offsetLeft-(track.firstElementChild?track.firstElementChild.offsetLeft:0)):idx*viewportW());
const maxLeft=Math.max(0,track.scrollWidth-viewportW());
track.scrollTo({left:Math.min(Math.max(0,baseLeft),maxLeft),behavior:"smooth"});paint(idx);toggle()};
build();
prev.addEventListener("click",()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();go(idx-1)});
next.addEventListener("click",()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();go(idx+1)});
track.addEventListener("scroll",()=>{const i=Math.round(track.scrollLeft/viewportW());if(i!==idx){idx=i;paint(idx)}});
W.addEventListener("resize",()=>{const now=pageCount();if(dots.length!==now)build();setTimeout(()=>go(idx),0)});
const reset=()=>{track.scrollLeft=0;idx=0;paint(0);toggle()};
requestAnimationFrame(reset);W.addEventListener("load",()=>setTimeout(reset,0));W.addEventListener("pageshow",reset);setTimeout(reset,350);
track.style.overflowX="auto";track.style.scrollBehavior="smooth";toggle();go(0);setTimeout(()=>track.scrollTo({left:0,behavior:"auto"}),50);
})});
})();

/* =========================================================
 10) CALCULADORA (hooks secundarios / terciarios) — ROBUSTO
 - Corre aunque la sección llegue tarde (parciales/inyección)
 - Se monta UNA sola vez por página (dataset flag)
========================================================= */
(()=>{

  const bootCalc = () => {
    // evita re-montajes
    if (D.documentElement.dataset.calcHooksInit === "1") return;

    const app = D.getElementById("app");
    const row = D.getElementById("calc-row");
    const pick2 = D.getElementById("icons-sec-sys");
    const pick3 = D.getElementById("icons-third-sys");

    // si aún no está la sección, salir sin marcar init (para reintentar)
    if (!app || !row || !pick2) return;

    const PRIMARY = (app.dataset.system || "").trim();
    if (!PRIMARY) return;

    // ya están los nodos base => marcamos init para no duplicar listeners
    D.documentElement.dataset.calcHooksInit = "1";

    const moneyMX=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
    const fmt=v=>moneyMX.format(Math.round(Number(v||0)));
    const hasPrices=n=>!!(W.preciosContpaqi&&W.preciosContpaqi[n]);

    // Define catálogo SIEMPRE aquí (ahora sí quedará en window)
    W.CATALOG_SISTEMAS = W.CATALOG_SISTEMAS || [
      {name:"CONTPAQi Contabilidad",img:"../IMG/contabilidadsq.webp"},
      {name:"CONTPAQi Bancos",img:"../IMG/bancossq.webp"},
      {name:"CONTPAQi Nóminas",img:"../IMG/nominassq.webp"},
      {name:"CONTPAQi XML en Línea",img:"../IMG/xmlsq.webp",noDiscount:!0},
      {name:"CONTPAQi Comercial PRO",img:"../IMG/comercialprosq.webp"},
      {name:"CONTPAQi Comercial PREMIUM",img:"../IMG/comercialpremiumsq.webp"},
      {name:"CONTPAQi Factura Electrónica",img:"../IMG/facturasq.webp"}
    ];

    const getPrecioDesde=name=>{
      const db=(W.preciosContpaqi&&W.preciosContpaqi[name])?W.preciosContpaqi[name]:null;
      if(!db) return null;
      if(db.anual&&db.anual.MultiRFC&&(db.anual.MultiRFC.precio_base||db.anual.MultiRFC.renovacion))
        return Number(db.anual.MultiRFC.precio_base||db.anual.MultiRFC.renovacion||0);
      if(db.anual&&db.anual.MonoRFC&&(db.anual.MonoRFC.precio_base||db.anual.MonoRFC.renovacion))
        return Number(db.anual.MonoRFC.precio_base||db.anual.MonoRFC.renovacion||0);
      if(db.tradicional&&db.tradicional.actualizacion&&db.tradicional.actualizacion.precio_base)
        return Number(db.tradicional.actualizacion.precio_base||0);
      return null;
    };

    const renderPicker=(id,exclude,active)=>{
      const wrap=D.getElementById(id);
      if(!wrap) return;
      wrap.innerHTML="";
      if(PRIMARY) exclude.add(PRIMARY);

      W.CATALOG_SISTEMAS.forEach(item=>{
        if(exclude.has(item.name)) return;
        const precio=getPrecioDesde(item.name);

        const btn=D.createElement("button");
        btn.className="sys-icon";
        btn.type="button";
        btn.dataset.sys=item.name;
        btn.title=item.name;

        btn.innerHTML =
          (item.noDiscount?'<small class="sin15">sin -15%</small>':"")+
          `<img src="${item.img}" alt="${item.name}">
           <strong>${item.name.replace("CONTPAQi ","")}</strong>
           <small class="sys-price">${precio!=null?("desde "+fmt(precio)):"precio no disp."}</small>`;

        if(active&&active===item.name) btn.classList.add("active");
        wrap.appendChild(btn);
      });
    };

    const renderCombined=rows=>{
      const wrap=D.getElementById("combined-wrap");
      const tbody=D.getElementById("combined-table-body");
      if(!wrap||!tbody) return;
      tbody.innerHTML="";
      rows.forEach(pair=>{
        const tr=D.createElement("tr");
        const td1=D.createElement("td");
        const td2=D.createElement("td");
        td1.textContent=pair[0];
        td2.textContent=pair[1];
        td2.style.textAlign="right";
        tr.appendChild(td1); tr.appendChild(td2);
        tbody.appendChild(tr);
      });
      wrap.hidden=!1;
    };

    const slot2=D.getElementById("calc-slot-2");
    let secondary=D.getElementById("calc-secondary");

    const ensureSecondary=()=>{
      if(secondary) return secondary;
      if(!slot2||!slot2.parentNode) return null;
      secondary=D.createElement("div");
      secondary.id="calc-secondary";
      secondary.className="calc-container";
      secondary.setAttribute("aria-label","Calculadora secundaria");
      secondary.style.display="none";
      slot2.insertAdjacentElement("afterend",secondary);
      return secondary;
    };

    const showSecondary=()=>{
      ensureSecondary();
      if(slot2) slot2.style.display="none";
      if(secondary) secondary.style.display="block";
    };

    const slot3=D.getElementById("calc-tertiary");
    const addMore=D.getElementById("add-more-panel");

    const selected={secondary:null,tertiary:null};
    const setSel=()=>new Set([selected.secondary,selected.tertiary].filter(Boolean));

    const showMore=()=>{ if(addMore) addMore.style.display = selected.secondary ? "" : "none"; };

    const refresh=()=>{
      const ex=setSel();
      renderPicker("icons-sec-sys",ex,selected.secondary);
      renderPicker("icons-third-sys",ex,selected.tertiary);
    };

    refresh();
    showMore();

    // listeners
    pick2.addEventListener("click",e=>{
      const btn=e.target.closest(".sys-icon"); if(!btn) return;
      const sys=btn.dataset.sys;

      // OJO: aquí NO exijas precios para pintar; solo para calcular
      selected.secondary=sys;
      if(selected.tertiary===sys) selected.tertiary=null;

      ensureSecondary();

      if(W.CalculadoraContpaqi && W.CalculadoraContpaqi.setSecondarySystem){
        W.CalculadoraContpaqi.setSecondarySystem(sys,{
          secondarySelector:"#calc-secondary",
          combinedSelector:"#combined-wrap",
          onCombined:renderCombined
        });
      }

      showSecondary();
      refresh();
      showMore();
    });

    if(pick3) pick3.addEventListener("click",e=>{
      const btn=e.target.closest(".sys-icon"); if(!btn) return;
      const sys=btn.dataset.sys;
      if(sys===selected.secondary) return;

      selected.tertiary=sys;
      if(slot3) slot3.style.display="block";

      if(W.CalculadoraContpaqi && W.CalculadoraContpaqi.setTertiarySystem){
        W.CalculadoraContpaqi.setTertiarySystem(sys,{
          tertiarySelector:"#calc-tertiary",
          combinedSelector:"#combined-wrap",
          onCombined:renderCombined
        });
      }

      if(addMore) addMore.style.display="none";
      row.classList.add("has-three");
      refresh();
    });

    if(W.CalculadoraContpaqi && W.CalculadoraContpaqi.onCombinedSet)
      W.CalculadoraContpaqi.onCombinedSet(renderCombined);

    if(W.CalculadoraContpaqi && W.CalculadoraContpaqi.init){
      D.body.setAttribute("data-calc","escritorio");
      W.CalculadoraContpaqi.init({systemName:PRIMARY,primarySelector:"#calc-primary",combinedSelector:"#combined-wrap"});
    } else {
      console.warn("CalculadoraContpaqi.init no disponible");
    }
  };

  // 1) intenta ya
  bootCalc();

  // 2) intenta en load/pageshow
  W.addEventListener("load", bootCalc);
  W.addEventListener("pageshow", bootCalc);

  // 3) observa DOM por si la sección llega tarde (parciales)
  const mo = new MutationObserver(() => bootCalc());
  mo.observe(D.documentElement, { childList:true, subtree:true });

})();


 

/* =========================================================
 11) COMPACTADOR (reacomoda UI calc si viene “suelta”)
========================================================= */
(()=>{const pickByLabel=(c,rx)=>{const labels=Array.from(c.querySelectorAll("label"));
const lb=labels.find(l=>rx.test(String(l.textContent||"").trim().toLowerCase()));if(!lb)return null;
return lb.closest(".field")||lb.closest(".row")||lb.closest(".instalacion-box")||lb.closest(".inst-wrap")||lb.parentElement};
const pickSelect=(c,arr)=>{for(const s of arr){const el=c.querySelector(s);if(el)return el}return null};
const unir=c=>{if(!c||c.querySelector(".inst-wrap .instalacion-box"))return;
const inst=pickSelect(c,["select#instalacion",'select[name*="instal"]','select[data-field*="instal"]']);
const serv=pickSelect(c,["select#servicios","select#ervicios",'select[name*="servi"]','select[data-field*="servi"]']);
if(!inst||!serv)return;if(inst.closest(".instalacion-box")||serv.closest(".instalacion-box"))return;
let wrap=c.querySelector(".inst-wrap");if(!wrap){wrap=D.createElement("div");wrap.className="inst-wrap";(inst.closest("form")||c.querySelector("form")||c).appendChild(wrap)}
const box=D.createElement("div");box.className="instalacion-box";
const il=inst.labels&&inst.labels[0]?inst.labels[0]:null,sl=serv.labels&&serv.labels[0]?serv.labels[0]:null;
if(il)box.appendChild(il);box.appendChild(inst);if(sl)box.appendChild(sl);box.appendChild(serv);wrap.appendChild(box);
if(!wrap.querySelector(".inst-hint")){const h=D.createElement("small");h.className="inst-hint";h.textContent="Selecciona instalación y servicios en un solo paso.";wrap.appendChild(h)}};
const compact=c=>{if(!c||c.querySelector("form.calc-form"))return;
if(c.querySelector(".controls-grid")){unir(c);return}
const bLic=pickByLabel(c,/^licencia/),bTipo=pickByLabel(c,/^tipo/),bUsu=pickByLabel(c,/^usuarios?/);
let bInst=c.querySelector(".inst-wrap")||pickByLabel(c,/instalaci/);
if(!bInst){const any=c.querySelector('input[type="checkbox"]');bInst=any?(any.closest(".instalacion-box")||any.closest(".field")||any.parentElement):null}
const blocks=[bLic,bTipo,bUsu,bInst].filter(Boolean);blocks.forEach(b=>{if(b&&b.classList)b.classList.add("field")});
if(!bLic||!bTipo||!bUsu||!bInst)return;
const g=D.createElement("div");g.className="controls-grid";g.append(bLic,bTipo,bUsu,bInst);
c.insertBefore(g,c.firstElementChild);
unir(c);
};
const target=D.getElementById("calc-primary");if(!target)return;
const run=()=>{const c=D.querySelector(".calc-container")||target;if(!c||c.querySelector("form.calc-form"))return;compact(c)};
run();requestAnimationFrame(run);new MutationObserver(run).observe(target,{childList:!0,subtree:!0});
W.addEventListener("calc-recompute",run);W.addEventListener("calc-render",run);setTimeout(run,500);setTimeout(run,1200);
})();

/* =========================================================
 12) AUTODIAG (helpers consola)
========================================================= */
(()=>{const sels=[".carouselX .track",".icons-wrap"],found=sels.flatMap(s=>Array.from(D.querySelectorAll(s)));
found.forEach((el,i)=>{const cs=getComputedStyle(el),name=el.className||el.id||("track#"+i);
const warn=(m,v)=>console.warn("⚠️ ["+name+"] "+m,v);
if(el.scrollWidth<=el.clientWidth+2)warn("No tiene scroll real",{scrollWidth:el.scrollWidth,clientWidth:el.clientWidth});
if((cs.scrollSnapType&&cs.scrollSnapType!=="none")||el.style.scrollSnapType)warn("scroll-snap-type activo",cs.scrollSnapType);
if(String(cs.justifyContent||"").includes("center"))warn("justify-content:center detectado",cs.justifyContent);
if(cs.direction==="rtl")warn("direction:rtl detectado",cs.direction);
if(el.scrollLeft>5)warn("scrollLeft inicial ≠ 0",el.scrollLeft);
el._diagFix={noSnap:()=>{el.style.scrollSnapType="none";el.querySelectorAll("*").forEach(n=>{n.style.scrollSnapAlign="none"});console.log("✅ Snap desactivado en "+name)},
flexStart:()=>{el.style.justifyContent="flex-start";console.log("✅ justify-content:flex-start aplicado en "+name)},
forceLTR:()=>{el.style.direction="ltr";console.log("✅ direction:ltr aplicado en "+name)},
resetScroll:()=>{el.scrollTo({left:0,behavior:"auto"});console.log("✅ scrollLeft restablecido en "+name)}};
})})();

/* =========================================================
 13) TOC
========================================================= */
(()=>{const toc=D.getElementById("toc");if(!toc)return;
const openBtn=D.getElementById("tocToggle")||toc.querySelector(".toc-toggle");
const closeBtn=toc.querySelector(".toc-close");
const links=toc.querySelectorAll("a[href^='#']");
const OPEN="open",CLOSED="collapsed";
const open=()=>{toc.classList.remove(CLOSED);toc.classList.add(OPEN)};
const close=()=>{toc.classList.add(CLOSED);toc.classList.remove(OPEN)};
const toggle=()=>{toc.classList.contains(CLOSED)?open():close()};
openBtn&&openBtn.addEventListener("click",e=>{e.preventDefault();toggle()});
closeBtn&&closeBtn.addEventListener("click",e=>{e.preventDefault();close()});
links.forEach(a=>a.addEventListener("click",close));
D.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
})();

/* =========================================================
 14) Expiriti: reel-fit (OPCIONAL) — ahora gateado (solo si hay reels/videos)
========================================================= */
(()=>{if(!D.querySelector(".reel-embed,.yt-wrap"))return;
const root=D.documentElement;
const apply=()=>{const vh=W.visualViewport?W.visualViewport.height:W.innerHeight;
const reserve=Math.max(220,Math.min(320,Math.round(vh*0.28)));
const max=Math.max(320,Math.min(640,vh-reserve));
root.style.setProperty("--reel-h-mid",Math.round(max*0.78)+"px");
root.style.setProperty("--reel-h-max",Math.round(max)+"px");
};
apply();
W.addEventListener("resize",apply,{passive:true});
W.visualViewport&&W.visualViewport.addEventListener("resize",apply,{passive:true});
})();


/* =========================================================
   Expiriti — SISTEMAS: reel-title marquee (JS)
   - Activa scroll solo si el texto no cabe
   - Duplica contenido para loop limpio
   - Observa cambios de .active
========================================================= */
(function(){
  const SEL = '.page-sistemas .reel-title';
  const SPEED = 80; // px por segundo (ajusta si quieres)

  function setup(title){
    if(title.__marqueeInit) return;
    title.__marqueeInit = true;

    const text = title.textContent.trim();
    title.textContent = '';

    const wrap = document.createElement('span');
    wrap.className = 'marquee';

    const a = document.createElement('span');
    a.textContent = text;

    const b = document.createElement('span');
    b.textContent = text;

    wrap.append(a,b);
    title.appendChild(wrap);

    requestAnimationFrame(()=>measure(title, wrap, a));
  }

  function measure(title, wrap, a){
    const wText = a.scrollWidth;
    const wBox  = title.clientWidth;

    if(wText > wBox){
      title.classList.add('is-marquee');
      const dur = Math.max(6, Math.round((wText / SPEED)));
      title.style.setProperty('--mq-dur', dur + 's');
    }else{
      title.classList.remove('is-marquee');
      title.style.removeProperty('--mq-dur');
    }
  }

  function refresh(){
    document.querySelectorAll(SEL).forEach(t=>{
      if(t.classList.contains('active')){
        setup(t);
      }else{
        t.classList.remove('is-marquee');
      }
    });
  }

  // primera pasada
  refresh();

  // observa cambios de .active (cuando el JS del carrusel cambia el título)
  const obs = new MutationObserver(refresh);
  obs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});

  // re-medir en resize
  window.addEventListener('resize', ()=>setTimeout(refresh,150));
})();

/* =========================================================
 Expiriti — REEL TITLE MARQUEE (A11Y SAFE) v2026.01.07
 - Target: .reel-title.active (Sistemas/Servicios)
 - Si reduce-motion: NO anima, solo overflow-x:auto
 - Si hay overflow: duplica texto y anima loop
 - Reacciona a cambios de .active y a cambios de texto
========================================================= */
(()=>{if(window.__EX_REEL_MARQ__)return;window.__EX_REEL_MARQ__=1;
const D=document,W=window,RED=()=>W.matchMedia&&W.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SEL=".reel-title",SCOPE=".page-sistemas,.page-servicios";

const mk=(t)=>{if(!t||t.__mq)return;t.__mq=1;
t.classList.add("__mqHost");t.style.position=t.style.position||"relative";
};
const teardown=(t)=>{if(!t)return;t.classList.remove("__mqRun");t.style.removeProperty("--mq-dur");
const tr=t.querySelector(".__mqTrack");if(tr){t.textContent=tr.getAttribute("data-text")||t.textContent||""}
};
const apply=(t)=>{if(!t)return;mk(t);
const txt=(t.textContent||"").trim();if(!txt){teardown(t);return}
if(RED()){t.classList.add("__mqA11y");/* scroll manual */return}
t.classList.remove("__mqA11y");

/* Rebuild solo si cambió el texto o no hay track */
const cur=t.querySelector(".__mqTrack");const curTxt=cur?cur.getAttribute("data-text"):"";
if(!cur||curTxt!==txt){
t.textContent="";
const track=D.createElement("span");track.className="__mqTrack";track.setAttribute("data-text",txt);
const a=D.createElement("span");a.className="__mqTxt";a.textContent=txt;
const gap=D.createElement("span");gap.className="__mqGap";gap.textContent=" \u00A0 \u00A0 \u00A0 ";
const b=D.createElement("span");b.className="__mqTxt";b.textContent=txt;
track.append(a,gap,b);t.append(track);
}

/* Medición */
requestAnimationFrame(()=>{const tr=t.querySelector(".__mqTrack");if(!tr){return}
const a=tr.querySelector(".__mqTxt");if(!a){return}
const cw=t.clientWidth||1,sw=a.scrollWidth||1;const of=Math.max(0,sw-cw);
if(of<=2){t.classList.remove("__mqRun");t.style.removeProperty("--mq-dur");return}
t.classList.add("__mqRun");
/* 8..16s según overflow (similar a tu fórmula) */
const sec=Math.min(16,Math.max(8,8+(of/40)));
t.style.setProperty("--mq-dur",sec.toFixed(2)+"s");
});
};

const refresh=()=>{D.querySelectorAll(SCOPE+" "+SEL).forEach(t=>{
if(t.classList.contains("active"))apply(t); else teardown(t);
})};

/* Observa SOLO títulos (class/text) */
const boot=()=>{refresh();
const nodes=[...D.querySelectorAll(SCOPE+" "+SEL)];
if(!nodes.length)return;
const mo=new MutationObserver(()=>refresh());
nodes.forEach(n=>mo.observe(n,{attributes:!0,attributeFilter:["class"],characterData:!0,childList:!0,subtree:!0}));
W.addEventListener("resize",()=>setTimeout(refresh,150),{passive:!0});
};

D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:!0}):boot();
})();


/* =========================================================
  PATCH v2026.01.07 — VIDEOS: agrupar en slides de 2
  - 1 video => slide single centrado
  - 5 videos => 2-2-1 (último centrado)
  - NO borra videos; solo reestructura DOM del carrusel
========================================================= */
(()=>{"use strict";const D=document,W=window;
const q=(s,c=D)=>c.querySelector(s),qa=(s,c=D)=>Array.from(c.querySelectorAll(s));

function groupVideos2(){
  const car=D.getElementById("carouselVideos");
  if(!car||car.dataset.grp2==="1")return;
  const track=q(".carousel-track",car);
  if(!track)return;

  // Si ya están en .carousel-slide, no rearmar
  const hasSlides=qa(":scope > .carousel-slide",track).length>0;
  if(hasSlides){car.dataset.grp2="1";return}

  const kids=qa(":scope > *",track).filter(n=>n.nodeType===1);
  if(!kids.length){car.dataset.grp2="1";return}

  // Detecta items "reales" (cards/embeds). Excluye barras u otros nodos si existieran
  const items=kids.filter(n=>!n.classList.contains("carousel-nav")&&!n.classList.contains("yt-titlesbar"));

  // Limpia track y reconstruye en slides
  track.innerHTML="";
  for(let i=0;i<items.length;i+=2){
    const slide=D.createElement("div");
    slide.className="carousel-slide vid-slide";
    const a=items[i]; const b=items[i+1];

    slide.appendChild(a);
    if(b) slide.appendChild(b);
    if(!b) slide.classList.add("is-single");

    track.appendChild(slide);
  }
  car.dataset.grp2="1";
}

// corre temprano + reintentos por si el DOM llega tarde
const boot=()=>{groupVideos2()};
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
W.addEventListener("load",boot);
W.addEventListener("pageshow",boot);
new MutationObserver(()=>groupVideos2()).observe(D.documentElement,{childList:true,subtree:true});
})();

/* =========================================================
  PATCH v2026.01.07 — CAROUSELX (#integra): páginas por items/perView
  - Flechas funcionales
  - Click card => data-href (ya lo tienes; aquí no se rompe)
  - Si hay 1 o 2 sistemas: centrar y ocultar flechas/dots (menos de 3)
========================================================= */
(()=>{"use strict";const D=document,W=window;
const qa=(s,c=D)=>Array.from(c.querySelectorAll(s));

function patchCarouselX(root){
  if(!root||root.dataset.cxPatch==="1")return;
  const track=root.querySelector(".track");
  if(!track)return;

  const items=qa(".sys",root);
  const prev=root.querySelector(".arrowCircle.prev");
  const next=root.querySelector(".arrowCircle.next");
  const dotsWrap=root.querySelector(".group-dots");
  if(!prev||!next||!dotsWrap||!items.length){root.dataset.cxPatch="1";return}

  const perView=()=>W.innerWidth<=980?1:3;
  const totalPages=()=>Math.max(1,Math.ceil(items.length/perView()));
  const viewportW=()=>track.clientWidth||root.clientWidth||1;

  // centrar si <3 items y ocultar UI
  const applyFew=()=>{
    const few=items.length<3;
    if(few){
      prev.style.display="none"; next.style.display="none"; dotsWrap.style.display="none";
      track.style.justifyContent="center";
      track.style.scrollSnapType="none";
      track.style.overflowX="hidden"; // evita “scroll fantasma” si 1-2
    }else{
      track.style.justifyContent="flex-start";
      track.style.overflowX="auto";
    }
  };

  // reconstruir dots por páginas reales (items/perView)
  let dots=[],idx=0;
  const buildDots=()=>{
    dotsWrap.innerHTML="";
    const total=totalPages();
    dots=Array.from({length:total}).map((_,j)=>{
      const b=D.createElement("button");
      b.type="button";
      b.className="dot"+(j===0?" active":"");
      b.setAttribute("aria-label","Ir a página "+(j+1));
      b.addEventListener("click",()=>go(j));
      dotsWrap.appendChild(b);
      return b;
    });
  };
  const paint=j=>dots.forEach((d,i)=>d.classList.toggle("active",i===j));

  const toggleUI=()=>{
    applyFew();
    const multi=items.length>=3 && totalPages()>1;
    prev.style.display=multi?"":"none";
    next.style.display=multi?"":"none";
    dotsWrap.style.display=multi?"":"none";
  };

  const go=j=>{
    const total=totalPages();
    idx=((j%total)+total)%total;
    const start=idx*perView();
    const el=items[Math.min(start,items.length-1)];
    const base=(el?el.offsetLeft:idx*viewportW());
    const max=Math.max(0,track.scrollWidth-viewportW());
    track.scrollTo({left:Math.min(Math.max(0,base),max),behavior:"smooth"});
    paint(idx);toggleUI();
  };

  // Reemplaza handlers de flechas (sin duplicar: asigna onclick)
  prev.onclick=()=>go(idx-1);
  next.onclick=()=>go(idx+1);

  buildDots();
  toggleUI();
  go(0);

  W.addEventListener("resize",()=>{
    const before=dots.length;
    const now=totalPages();
    if(before!==now) buildDots();
    toggleUI();
    setTimeout(()=>go(idx),0);
  },{passive:true});

  root.dataset.cxPatch="1";
}

function boot(){
  // Enfoca especialmente #integra, pero aplica a cualquier carouselX si quieres
  const integra=D.querySelector("#integra .carouselX")||D.querySelector("#integra.carouselX");
  if(integra) patchCarouselX(integra);
}
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
window.addEventListener("load",boot);
window.addEventListener("pageshow",boot);
})();

/* =========================================================
  PATCH v2026.01.07 — ICONS: centrar si <3 y no hay scroll
========================================================= */
(()=>{"use strict";const D=document,W=window;
function patchIcons(id){
  const wrap=D.getElementById(id);
  if(!wrap||wrap.dataset.icPatch==="1")return;

  const paint=()=>{
    const n=wrap.children.length||0;
    const canScroll=wrap.scrollWidth>wrap.clientWidth+4;
    wrap.classList.toggle("is-centered",!canScroll && n>0 && n<3);
  };

  paint();
  W.addEventListener("resize",paint,{passive:true});
  new MutationObserver(paint).observe(wrap,{childList:true});
  wrap.dataset.icPatch="1";
}
const boot=()=>{patchIcons("icons-sec-sys");patchIcons("icons-third-sys")};
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
W.addEventListener("load",boot);
W.addEventListener("pageshow",boot);
})();

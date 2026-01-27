// main.js (al inicio)
if (/[?&]freeze=1\b/.test(location.search)) {
  document.body.classList.add('debug-freeze');
}

/* =========================================================
 Expiriti - main.js (FINAL) v2026.01.08-r2 (COMPACTO + COMENTARIOS)
 - FIX: evita que 1 error rompa TODO (módulos con try/catch)
 - FIX: bloque 10 (CALC) rearmado (cierre de llaves seguro)
 - GATE: Calc/Compact/Icons solo si DOM esperado existe
========================================================= */
window.__EXP_SAFE__=/(?:\?|&)safe=1\b/.test(location.search);

(()=>{"use strict";
if(window.__EXP_SAFE__){console.warn("[SAFE MODE] main.js detenido");return;}
if(window.__EXP_MAIN_FINAL__)return;window.__EXP_MAIN_FINAL__=1;

const D=document,W=window;
const TRY=(name,fn)=>{try{fn()}catch(e){console.warn("[main.js] módulo falló:",name,e)}};

/* =========================================================
 0) BASE + PARTIALS + NORMALIZACIÓN (GH Pages + subcarpetas)
========================================================= */
TRY("base+partials",()=>{
  const isGh=/\.github\.io$/i.test(location.hostname);
  const metaBase=D.querySelector('meta[name="expiriti-base"]')?.getAttribute("content")||"";
  const cleanBase=b=>{b=(b||"").trim();if(!b)return"";if(!b.startsWith("/"))b="/"+b;return b.endsWith("/")?b:(b+"/")};
  let BASE=cleanBase(metaBase);
  if(isGh&&!BASE){
    const seg=(location.pathname||"/").split("/").filter(Boolean)[0]||"";
    BASE=seg?("/"+seg+"/"):"/";
  }
  if(!BASE)BASE="/";

   const inSub=/\/(SISTEMAS|SERVICIOS)\//i.test(location.pathname);
  const rel=inSub?"../":"";

  const abs=p=>{
    if(!p) return p;
    if(/^https?:\/\//i.test(p))return p;
    if(/^(mailto:|tel:|data:|blob:|javascript:)/i.test(p))return p;

    // ✅ NUEVO: si ya es relativo explícito, no lo “dobles”
    if(p.startsWith("../") || p.startsWith("./")) return p.replace(/\/+/g,"/");

    if(p.startsWith("/")) return (isGh?(BASE+p.slice(1)):p).replace(/\/+/g,"/");
    return (isGh?(BASE+p):(rel+p)).replace(/\/+/g,"/");
  };



  const headerURL=abs("PARTIALS/global-header.html");
  const footerURL=abs("PARTIALS/global-footer.html");

  const normalize=(root=D)=>{
    root.querySelectorAll(".js-abs-src[data-src]").forEach(img=>{const ds=img.getAttribute("data-src");if(!ds)return;img.src=abs(ds);img.style.opacity="1"});
    root.querySelectorAll(".js-abs-href[data-href]").forEach(a=>{const dh=a.getAttribute("data-href");if(!dh)return;const [path,hash]=dh.split("#");a.href=abs(path||"")+(hash?("#"+hash):"")});
    root.querySelectorAll(".js-img[data-src]").forEach(img=>{const ds=img.getAttribute("data-src");if(!ds)return;img.src=abs(ds)});
    root.querySelectorAll(".js-link[data-href]").forEach(a=>{const dh=a.getAttribute("data-href");if(!dh)return;const [path,hash]=dh.split("#");a.href=abs(path||"")+(hash?("#"+hash):"")});
    const y=(root.getElementById&&root.getElementById("gf-year"))||D.getElementById("gf-year")||(root.getElementById&&root.getElementById("year"))||D.getElementById("year");
    if(y)y.textContent=(new Date).getFullYear();
  };

  const loadPartials=async()=>{
    const hp=D.getElementById("header-placeholder"),fp=D.getElementById("footer-placeholder");
    if(!hp&&!fp){normalize(D);return;}
    const noCache=/(?:\?|&)nocache=1\b/.test(location.search);
    const fetchOpts=noCache?{cache:"no-store"}:{cache:"force-cache"};
    try{
      if(hp){
        const hr=await fetch(headerURL,fetchOpts);
        hr.ok?hp.outerHTML=await hr.text():console.warn("[partials] header no cargó:",headerURL,hr.status);
      }
      if(fp){
        const fr=await fetch(footerURL,fetchOpts);
        fr.ok?fp.outerHTML=await fr.text():console.warn("[partials] footer no cargó:",footerURL,fr.status);
      }
    }catch(e){console.warn("[partials] error cargando parciales",e);}
    normalize(D);
    if(typeof W.initGlobalHeader==="function"){try{W.initGlobalHeader()}catch(e){console.warn("initGlobalHeader error",e)}}
  };

  const boot=()=>loadPartials();
  D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:!0}):boot();
  W.addEventListener("pageshow",()=>{try{normalize(D)}catch{}},{passive:!0});

  W.__EXP_ABS__=abs;
  W.__EXP_BASE__=BASE;
});

/* =========================================================
 1.5) CATALOGO SISTEMAS (GLOBAL)
========================================================= */
TRY("catalog_sistemas",()=>{
  W.CATALOG_SISTEMAS=W.CATALOG_SISTEMAS||[
    {name:"CONTPAQi Contabilidad",img:"IMG/contabilidadsq.webp"},
    {name:"CONTPAQi Bancos",img:"IMG/bancossq.webp"},
    {name:"CONTPAQi Nóminas",img:"IMG/nominassq.webp"},
    {name:"CONTPAQi XML en Línea",img:"IMG/xmlsq.webp",noDiscount:!0},
    {name:"CONTPAQi Comercial PRO",img:"IMG/comercialprosq.webp"},
    {name:"CONTPAQi Comercial PREMIUM",img:"IMG/comercialpremiumsq.webp"},
    {name:"CONTPAQi Factura Electrónica",img:"IMG/facturasq.webp"}
  ].map(x=>({ ...x, img:(W.__EXP_ABS__?W.__EXP_ABS__(x.img):x.img) }));
});

/* =========================================================
 2) VIDEOS: AGRUPAR EN SLIDES DE 2 (solo si existe #carouselVideos)
========================================================= */
TRY("videos_group2",()=>{
  const q=(s,c=D)=>c.querySelector(s),qa=(s,c=D)=>Array.from(c.querySelectorAll(s));

  const groupVideos2=()=>{
    const car=D.getElementById("carouselVideos");
    if(!car||car.dataset.grp2==="1")return;

    const track=q(".carousel-track",car);
    if(!track){car.dataset.grp2="1";return;}

    if(qa(":scope > .carousel-slide",track).length){car.dataset.grp2="1";return;}

    const kids=qa(":scope > *",track).filter(n=>n&&n.nodeType===1);
    const items=kids.filter(n=>!n.classList.contains("carousel-nav")&&!n.classList.contains("yt-titlesbar"));
    if(!items.length){car.dataset.grp2="1";return;}

    track.innerHTML="";
    for(let i=0;i<items.length;i+=2){
      const slide=D.createElement("div");
      slide.className="carousel-slide vid-slide";
      slide.appendChild(items[i]);
      if(items[i+1]) slide.appendChild(items[i+1]);
      else slide.classList.add("is-single");
      track.appendChild(slide);
    }

    car.dataset.grp2="1";
    if(car._grpObs){ try{car._grpObs.disconnect()}catch{} car._grpObs=null; }
  };

  const boot=()=>groupVideos2();

  D.readyState==="loading"
    ? D.addEventListener("DOMContentLoaded",boot,{once:!0})
    : boot();

  W.addEventListener("load",boot,{passive:!0});
  W.addEventListener("pageshow",boot,{passive:!0});

  const car=D.getElementById("carouselVideos");
  if(car && !car._grpObs){
    car._grpObs=new MutationObserver(()=>groupVideos2());
    car._grpObs.observe(car,{childList:!0,subtree:!0});
  }
});

/* =========================================================
 3) YOUTUBE MANAGER (pause real + lazy + hook iframes)
========================================================= */
TRY("yt_manager",()=>{
  if(W.__EXP_YT_MGR__)return;W.__EXP_YT_MGR__=1;W.exPlayers=W.exPlayers||[];
  W.pauseAllYTIframes=function(except){
    (W.exPlayers||[]).forEach(p=>{
      if(!p||p===except||typeof p.pauseVideo!=="function")return;
      try{const s=p.getPlayerState();if(s===1||s===3)p.pauseVideo()}catch{}
    });
  };
  const onState=e=>{if(e&&e.data===1)W.pauseAllYTIframes(e.target)};
  const ensureAPI=()=>{if(W.__EXP_YT_API_REQ__)return;W.__EXP_YT_API_REQ__=1;const s=D.createElement("script");s.src="https://www.youtube.com/iframe_api";D.head.appendChild(s)};
  const whenYT=cb=>{if(W.YT&&W.YT.Player){cb();return}ensureAPI();let t=0;const it=setInterval(()=>{t++;if(W.YT&&W.YT.Player){clearInterval(it);cb();return}if(t>80)clearInterval(it)},100)};
  const registerIframe=ifr=>{
    if(!ifr||ifr.dataset.ytInit)return;ifr.dataset.ytInit="1";
    let src=ifr.src||"";
    if(src&&!src.includes("enablejsapi=1")){src+=(src.includes("?")?"&":"?")+"enablejsapi=1";ifr.src=src}
    try{const p=new YT.Player(ifr,{events:{onStateChange:onState}});W.exPlayers.push(p)}catch{}
  };
const poster=id=>[
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/default.jpg`,
  `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
];

  const markReady=wrap=>{if(!wrap||!wrap.classList)return;wrap.classList.add("is-ready","has-iframe")};

  const mountLazy=wrap=>{
    if(!wrap||wrap.dataset.ytMounted)return;
    const existing=wrap.querySelector("iframe");
    if(existing){
      wrap.dataset.ytMounted="1";wrap.classList.add("has-iframe");
      existing.addEventListener("load",()=>markReady(wrap),{once:!0});setTimeout(()=>markReady(wrap),120);
      whenYT(()=>registerIframe(existing));
      return;
    }
    const id=wrap.getAttribute("data-ytid");if(!id)return;
    wrap.dataset.ytMounted="0";
    if(!wrap.style.position||wrap.style.position==="static")wrap.style.position="relative";
    wrap.style.overflow="hidden";wrap.style.backgroundColor="#000";

    const img=D.createElement("img");
    img.alt="Miniatura de video";img.loading="lazy";
    img.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;cursor:pointer";
const srcs=poster(id);
let k=0;
const next=()=>{
  if(k < srcs.length){ img.src = srcs[k++]; return; }
  wrap.classList.add("yt-no-thumb");
};
img.addEventListener("error", next);
next();


    wrap.appendChild(img);

    const btn=D.createElement("button");
    btn.type="button";btn.setAttribute("aria-label","Reproducir video");
    btn.style.cssText="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:none;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center";
    btn.innerHTML='<svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><rect x="1" y="7" width="66" height="36" rx="12" fill="#FF0000"></rect><polygon points="28,17 28,31 42,24" fill="#FFFFFF"></polygon></svg>';
    wrap.appendChild(btn);

    const load=()=>{
      if(wrap.dataset.ytMounted==="1")return;wrap.dataset.ytMounted="1";
      W.pauseAllYTIframes();
      wrap.innerHTML="";
      const ifr=D.createElement("iframe");
      ifr.loading="lazy";
      ifr.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      ifr.allowFullscreen=!0;
      ifr.title=wrap.getAttribute("data-title")||"YouTube video";
      ifr.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1&vq=hd1080`;
      wrap.appendChild(ifr);wrap.classList.add("has-iframe");
      ifr.addEventListener("load",()=>markReady(wrap),{once:!0});setTimeout(()=>markReady(wrap),200);
      whenYT(()=>registerIframe(ifr));
    };
    btn.addEventListener("click",load);img.addEventListener("click",load);
  };

  const init=()=>{
    D.querySelectorAll(".yt-wrap[data-ytid],.reel-embed[data-ytid]").forEach(mountLazy);
    D.querySelectorAll('iframe[src*="youtube"],iframe[src*="youtube-nocookie"]').forEach(ifr=>{
      const wrap=ifr.closest(".yt-wrap,.reel-embed");
      if(wrap){ifr.addEventListener("load",()=>markReady(wrap),{once:!0});setTimeout(()=>markReady(wrap),120)}
      whenYT(()=>registerIframe(ifr));
    });
  };

  const prevReady=W.onYouTubeIframeAPIReady;
  W.onYouTubeIframeAPIReady=function(){
    try{prevReady&&prevReady()}catch{}
    D.querySelectorAll('iframe[src*="youtube"],iframe[src*="youtube-nocookie"]').forEach(registerIframe);
  };

  D.readyState==="loading"?D.addEventListener("DOMContentLoaded",init,{once:!0}):init();
});

/* =========================================================
 4) CARRUSEL UNIVERSAL (.carousel)
========================================================= */
TRY("carousel_universal",()=>{
  const pause=()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes()};

  const syncDots=(root,len)=>{
    const nav=root.querySelector(".carousel-nav"); if(!nav) return [];
    let dots=[...nav.querySelectorAll(".dot")];
    for(;dots.length<len;){
      const b=D.createElement("button");
      b.type="button"; b.className="dot";
      b.setAttribute("aria-label",`Ir al slide ${dots.length+1}`);
      nav.appendChild(b); dots.push(b);
    }
    for(;dots.length>len;){ const x=dots.pop(); x&&x.remove(); }
    return dots;
  };

  const hideUI=(root,len)=>{
    const prev=root.querySelector(".arrowCircle.prev"),
          next=root.querySelector(".arrowCircle.next"),
          nav =root.querySelector(".carousel-nav");
    const single=len<=1;
    if(prev){prev.disabled=single; prev.style.display=single?"none":"";}
    if(next){next.disabled=single; next.style.display=single?"none":"";}
    if(nav) nav.style.display=single?"none":"";
    root.toggleAttribute("data-single",single);
  };

  const titlesFor=car=>{
    const sel=car.getAttribute("data-titles");
    if(sel){ const n=[...D.querySelectorAll(sel)]; if(n.length) return n; }
    const aside=car.closest("aside");
    if(aside){ const t=[...aside.querySelectorAll(":scope > .reel-title")]; return t.length?t:null; }
    const parent=car.parentElement||D;
    const t=[...parent.querySelectorAll(".reel-title")];
    return t.length?t:null;
  };

  const slideReelTitle=slide=>{
    if(!slide) return "";
    const w=slide.querySelector(".reel-embed[data-title],.yt-wrap[data-title]");
    if(w){ const s=(w.getAttribute("data-title")||"").trim(); if(s) return s; }
    const ifr=slide.querySelector("iframe[title]");
    if(ifr){ const s=(ifr.getAttribute("title")||"").trim(); if(s) return s; }
    const h=slide.querySelector("h4,h3");
    return h?(h.textContent||"").trim():"";
  };

/* =========================================================
  REEL TITLE MARQUEE (auto)
  - Si el título es largo, se convierte en marquee animado
========================================================= */
const applyMarquee=h4=>{if(!h4||h4.dataset.mqInit==="1")return;const t=(h4.textContent||"").trim();if(!t)return;h4.innerHTML=t;requestAnimationFrame(()=>{const sw=h4.scrollWidth,cw=h4.clientWidth;if(sw<=cw+8){h4.classList.remove("is-marquee");return}const tr=document.createElement("span");tr.className="__mqTrack";const a=document.createElement("span");a.textContent=t;const b=document.createElement("span");b.textContent=t;tr.append(a,b);h4.innerHTML="";h4.appendChild(tr);h4.style.setProperty("--mq-dur",Math.min(18,Math.max(10,t.length*.22))+"s");h4.classList.add("is-marquee");h4.dataset.mqInit="1"})};

/* =========================================================
  VIDEOS BAR (solo #carouselVideos)
========================================================= */
const ensureVideosBar=car=>{if(!car||car.dataset.vbarInit==="1")return;car.dataset.vbarInit="1";const track=car.querySelector(".carousel-track");if(!track)return;const bar=D.createElement("div");bar.className="yt-titlesbar";bar.setAttribute("role","presentation");const l=D.createElement("div"),r=D.createElement("div");l.className="yt-tab";r.className="yt-tab";bar.append(l,r);track.parentElement.insertBefore(bar,track);car._vbar={bar,left:l,right:r}};

const slideVideoTitles=slide=>{if(!slide)return[];const h=[...slide.querySelectorAll(".yt-title")].map(x=>(x.textContent||"").trim()).filter(Boolean);if(h.length)return h;const d=[...slide.querySelectorAll(".yt-wrap[data-title],.reel-embed[data-title]")].map(x=>(x.getAttribute("data-title")||"").trim()).filter(Boolean);if(d.length)return d;return[...slide.querySelectorAll("iframe[title]")].map(x=>(x.getAttribute("title")||"").trim()).filter(Boolean)};

const updateVideosBar=(car,idx)=>{if(!car||car.id!=="carouselVideos")return;ensureVideosBar(car);car.querySelectorAll(".yt-title").forEach(h=>h.classList.add("yt-title--hidden"));const track=car.querySelector(".carousel-track"),slides=track?[...track.querySelectorAll(":scope > .carousel-slide")]:[];if(!slides.length)return;const slide=slides[idx]||slides[0],tt=slideVideoTitles(slide),a=tt[0]||"",b=tt[1]||"",v=car._vbar;if(!v)return;v.left.textContent=a;v.right.textContent=b;v.right.style.display=b?"":"none";v.bar.style.gridTemplateColumns=b?"1fr 1fr":"1fr"};

/* =========================================================
  CAROUSEL INIT (core)
========================================================= */
const initCar=(root,onChange)=>{
  const track=root.querySelector(".carousel-track");
  if(!track||root.dataset.cInit==="1")return;
  root.dataset.cInit="1";

  const prev=root.querySelector(".arrowCircle.prev"),
        next=root.querySelector(".arrowCircle.next");

  const slides=[...track.querySelectorAll(":scope > .carousel-slide")];
  const len=slides.length;

  let dots=syncDots(root,len);
  hideUI(root,len);

  let i=0,lock=0;
  const paint=n=>dots.forEach((d,di)=>d.classList.toggle("active",di===n));
  const leftFor=n=>(slides[n]?.offsetLeft)||0;

  const set=(n,beh)=>{
    if(len<=0)return;
    i=(n+len)%len;paint(i);
    lock=1;
    track.scrollTo({left:leftFor(i),behavior:beh||"smooth"});
    setTimeout(()=>{lock=0},120);
    onChange&&onChange(i);
  };

  if(len<=1){paint(0);onChange&&onChange(0);return;}

  dots.forEach((d,idx)=>d.addEventListener("click",()=>{pause();set(idx)}));
  prev&&prev.addEventListener("click",()=>{pause();set(i-1)});
  next&&next.addEventListener("click",()=>{pause();set(i+1)});

  track.addEventListener("scroll",()=>{
    if(lock)return;
    const pos=track.scrollLeft;
    let best=0,dist=1e18;
    for(let k=0;k<len;k++){
      const dd=Math.abs(leftFor(k)-pos);
      if(dd<dist){dist=dd;best=k;}
    }
    if(best!==i){i=best;paint(i);onChange&&onChange(i);}
  },{passive:!0});

  set(0,"auto");
};

/* =========================================================
  BOOT (single owner)
  - 1 initCar por carrusel
  - Marquee titles solo si titles.length===1
========================================================= */
const boot=()=>{
  D.querySelectorAll(".carousel").forEach(car=>{
    const titles=titlesFor(car);

    /* (1) callback al cambiar slide */
    initCar(car,idx=>{
      if(titles&&car.id!=="carouselVideos"){
        const track=car.querySelector(".carousel-track"),
              slides=track?[...track.querySelectorAll(":scope > .carousel-slide")]:[],
              slide=slides[idx]||slides[0];

        if(titles.length===1){
          const txt=slideReelTitle(slide);
          if(txt){
            titles[0].dataset.mqInit="0";
            titles[0].textContent=txt;
            applyMarquee(titles[0]);
          }
          titles[0].classList.add("active");
        }else{
          titles.forEach((t,k)=>t.classList.toggle("active",k===idx));
        }
      }

      if(car.id==="carouselVideos")updateVideosBar(car,idx);
    });

    /* (2) pintado inicial título único */
    if(titles&&car.id!=="carouselVideos"&&titles.length===1){
      const track=car.querySelector(".carousel-track"),
            slides=track?[...track.querySelectorAll(":scope > .carousel-slide")]:[],
            txt=slideReelTitle(slides[0]);

      if(txt){
        titles[0].dataset.mqInit="0";
        titles[0].textContent=txt;
        applyMarquee(titles[0]);
      }
      titles[0].classList.add("active");
    }

    /* (3) pintado inicial videos bar */
    if(car.id==="carouselVideos")updateVideosBar(car,0);
  });
};

/* =========================================================
  DOM READY
========================================================= */
D.readyState==="loading"
  ? D.addEventListener("DOMContentLoaded",boot,{once:!0})
  : boot();


/* =========================================================
 6) LIST SLIDER (.listSlider)
========================================================= */
TRY("listSlider",()=>{
  D.querySelectorAll(".listSlider").forEach(w=>{
    const t=w.querySelector(".listTrack"),p=w.querySelector(".arrowCircle.prev"),n=w.querySelector(".arrowCircle.next");
    if(!t||!p||!n)return;
    let i=0,len=t.children.length||1;
    const go=x=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();i=(x+len)%len;t.scrollTo({left:w.clientWidth*i,behavior:"smooth"})};
    p.addEventListener("click",()=>go(i-1));
    n.addEventListener("click",()=>go(i+1));
    W.addEventListener("resize",()=>go(i),{passive:!0});
  });
});

/* =========================================================
 9) CAROUSEL SISTEMAS (.carouselX) — SINGLE OWNER
========================================================= */
TRY("carouselX",()=>{
  const QA=(s,c=D)=>Array.from(c.querySelectorAll(s));
  const abs=p=>W.__EXP_ABS__?W.__EXP_ABS__(p):p;
  const ensureUI=r=>{
    let p=r.querySelector(".arrowCircle.prev"),n=r.querySelector(".arrowCircle.next"),d=r.querySelector(".group-dots");
    if(!p){p=D.createElement("button");p.type="button";p.className="arrowCircle prev";p.setAttribute("aria-label","Anterior");p.innerHTML='<span class="chev">‹</span>';r.appendChild(p)}
    if(!n){n=D.createElement("button");n.type="button";n.className="arrowCircle next";n.setAttribute("aria-label","Siguiente");n.innerHTML='<span class="chev">›</span>';r.appendChild(n)}
    if(!d){d=D.createElement("div");d.className="group-dots";d.setAttribute("aria-label","Paginación carrusel");r.appendChild(d)}
    return{p,n,d};
  };

  QA(".carouselX").forEach(root=>{
    if(root.dataset.cxInit==="1")return;root.dataset.cxInit="1";
    const track=root.querySelector(".track");if(!track)return;
    const items=QA(".sys",root);if(!items.length)return;
    const ui=ensureUI(root),prev=ui.p,next=ui.n,dotsWrap=ui.d;
    const isMob=()=>W.matchMedia&&W.matchMedia("(max-width: 768px)").matches;

    items.forEach(it=>{
      it.setAttribute("role","link");it.setAttribute("tabindex","0");
      let touched=0;
      const nav=()=>{const href=it.getAttribute("data-href");if(!href)return;location.href=abs(href)};
      it.addEventListener("click",e=>{
        e.preventDefault();
        if(isMob()&&!touched){
          touched=1;it.classList.add("show-hover");
          setTimeout(()=>{touched=0;it.classList.remove("show-hover")},2000);
          return;
        }
        nav();
      },{passive:!1});
      it.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();nav()}});
    });

    const perView=()=>W.innerWidth<=980?1:3;
    const vw=()=>track.clientWidth||root.clientWidth||1;
    const pages=()=>Math.max(1,Math.ceil((track.scrollWidth-1)/vw()));

    let idx=0,dots=[];
    const build=()=>{
      dotsWrap.innerHTML="";
      const total=pages();
      dots=Array.from({length:total}).map((_,j)=>{
        const b=D.createElement("button");b.type="button";b.className="dot"+(j===0?" active":"");
        b.setAttribute("aria-label","Ir a página "+(j+1));
        b.addEventListener("click",()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();go(j)},{passive:!0});
        dotsWrap.appendChild(b);
        return b;
      });
    };
    const paint=j=>dots.forEach((d,i)=>d.classList.toggle("active",i===j));
    const toggle=()=>{
      const few=items.length<3;
      if(few){
        prev.style.display="none";next.style.display="none";dotsWrap.style.display="none";
        track.style.justifyContent="center";track.style.scrollSnapType="none";track.style.overflowX="hidden";
        return;
      }
      track.style.justifyContent="flex-start";track.style.overflowX="auto";
      const multi=pages()>1;
      prev.style.display=multi?"":"none";next.style.display=multi?"":"none";dotsWrap.style.display=multi?"":"none";
    };
    const go=j=>{
      const total=pages();idx=((j%total)+total)%total;
      const start=Math.min(idx*perView(),items.length-1),el=items[start];
      const base=idx===0?0:(el?el.offsetLeft-(track.firstElementChild?track.firstElementChild.offsetLeft:0):idx*vw());
      const max=Math.max(0,track.scrollWidth-vw());
      track.scrollTo({left:Math.min(Math.max(0,base),max),behavior:"smooth"});
      paint(idx);toggle();
    };

    build();toggle();go(0);

    prev.addEventListener("click",()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();go(idx-1)},{passive:!0});
    next.addEventListener("click",()=>{W.pauseAllYTIframes&&W.pauseAllYTIframes();go(idx+1)},{passive:!0});
    track.addEventListener("scroll",()=>{const w=vw();if(!w)return;const i=Math.round(track.scrollLeft/w);if(i!==idx){idx=Math.max(0,Math.min(pages()-1,i));paint(idx)}},{passive:!0});
    W.addEventListener("resize",()=>{const now=pages();if(dots.length!==now)build();toggle();requestAnimationFrame(()=>go(idx))},{passive:!0});
    requestAnimationFrame(()=>{track.scrollTo({left:0,behavior:"auto"});idx=0;paint(0);toggle()});
    W.addEventListener("pageshow",e=>{if(e&&e.persisted){track.scrollTo({left:0,behavior:"auto"});idx=0;paint(0);toggle()}});
  });
});

/* =========================================================
 10) CALCULADORA — COMPAT (NO DUPLICA)
  - calculadora.js es SINGLE OWNER
  - main.js solo dispara eventos (recompute/render)
========================================================= */
TRY("calc_hooks",()=>{
  const hasCalcDom=()=>{
    const app=D.getElementById("app");
    if(!app) return false;
    return !!((app.dataset.system||"").trim() && D.getElementById("calc-row"));
  };

  const kick=()=>{
    if(!hasCalcDom()) return;
    try{ W.dispatchEvent(new Event("calc-recompute")); }catch{}
    try{ W.dispatchEvent(new Event("calc-render")); }catch{}
  };

  D.readyState==="loading"
    ? D.addEventListener("DOMContentLoaded",kick,{once:!0})
    : kick();

  W.addEventListener("pageshow",kick,{passive:!0});
});


/* =========================================================
 10.5) ICONS CAROUSEL (-15%) — SOLO si existen pickers
  - Robusto: si los .sys-icon aparecen después, se auto-activa
========================================================= */
TRY("icons_carousel",()=>{
  const enhanceOne=wrap=>{
    if(!wrap) return;

    const ensure=()=>{
      if(wrap.dataset.icInit==="1") return;
      if(!wrap.querySelector(".sys-icon")) return; // aún no hay iconos → espera
      wrap.dataset.icInit="1";

      const slot=wrap.closest("#calc-slot-2,.calc-container,.placeholder")||wrap.parentElement;
      const note=slot&&slot.querySelector?slot.querySelector(".note"):null; if(note)note.classList.add("note-center");

      let host=wrap.closest(".icons-carousel");
      if(!host){host=D.createElement("div");host.className="icons-carousel";wrap.parentElement.insertBefore(host,wrap);host.appendChild(wrap)}

      const mkBtn=(cls,label,chev)=>{const b=D.createElement("button");b.type="button";b.className=`arrowCircle ${cls}`;b.setAttribute("aria-label",label);b.innerHTML=`<span class="chev">${chev}</span>`;return b};
      let prev=host.querySelector(".arrowCircle.prev"),next=host.querySelector(".arrowCircle.next");
      if(!prev){prev=mkBtn("prev","Anterior","‹");host.appendChild(prev)}
      if(!next){next=mkBtn("next","Siguiente","›");host.appendChild(next)}

      const step=()=>Math.max(220,Math.round(((wrap.querySelector(".sys-icon")?.offsetWidth)||200)+18));
      const scrollByX=dir=>wrap.scrollBy({left:step()*dir,behavior:"smooth"});
      prev.addEventListener("click",()=>scrollByX(-1));
      next.addEventListener("click",()=>scrollByX(1));

      const paint=()=>{
        const canScroll=wrap.scrollWidth>wrap.clientWidth+4;
        prev.style.display=canScroll?"":"none"; next.style.display=canScroll?"":"none";
        const c=wrap.closest(".calc-container")||slot; if(c) c.classList.toggle("has-icons",wrap.children.length>0);
      };
      paint(); W.addEventListener("resize",paint,{passive:!0});
      new MutationObserver(paint).observe(wrap,{childList:!0,subtree:!1});
    };

    // Observa el wrap siempre: cuando aparezcan botones, se activa
    if(!wrap.dataset.icObs){
      wrap.dataset.icObs="1";
      new MutationObserver(()=>ensure()).observe(wrap,{childList:!0,subtree:!1});
    }
    ensure();
  };

  const boot=()=>{
    enhanceOne(D.getElementById("icons-sec-sys"));
    enhanceOne(D.getElementById("icons-third-sys"));
  };

  D.readyState==="loading"?D.addEventListener("DOMContentLoaded",boot,{once:!0}):boot();
  W.addEventListener("calc-render",boot,{passive:!0});
  W.addEventListener("calc-recompute",boot,{passive:!0});
});

/* =========================================================
 7) PÍLDORAS (filtros cards)
========================================================= */
TRY("pills",()=>{
  const pills=[...D.querySelectorAll(".pill")],cards=[...D.querySelectorAll(".feature-grid .fcard")];
  if(!pills.length||!cards.length)return;
  const apply=tag=>cards.forEach(c=>{c.style.display=c.classList.contains("tag-"+tag)?"":"none"});
  pills.forEach(p=>p.addEventListener("click",()=>{pills.forEach(x=>x.classList.remove("active"));p.classList.add("active");apply(p.dataset.filter)}));
  apply(pills[0]?.dataset.filter||"nomina");
});

/* =========================================================
 8) FAQ (solo uno abierto)
========================================================= */
TRY("faq",()=>{
  const wrap=D.getElementById("faqWrap");if(!wrap)return;
  [...wrap.querySelectorAll(".faq-item")].forEach(it=>it.addEventListener("toggle",()=>{
    if(!it.open)return;
    [...wrap.querySelectorAll(".faq-item")].forEach(o=>{if(o!==it)o.removeAttribute("open")});
  }));
});

/* =========================================================
 13) TOC (FIX “no abre”)
========================================================= */
TRY("toc",()=>{
  const e=D.getElementById("toc");if(!e)return;
  const t=D.getElementById("tocToggle")||e.querySelector(".toc-toggle"),
        n=e.querySelector(".toc-close"),
        c=Array.from(e.querySelectorAll("a[href^='#']"));
  const O="open",R="collapsed",isOpen=()=>e.classList.contains(O)&&!e.classList.contains(R);
  const set=a=>{e.classList.toggle(O,!!a);e.classList.toggle(R,!a);e.setAttribute("aria-hidden",a?"false":"true");t&&t.setAttribute("aria-expanded",a?"true":"false")};
  const open=()=>set(!0),close=()=>set(!1),toggle=()=>isOpen()?close():open();
  set(!e.classList.contains(R));
  t&&t.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();toggle()},{passive:!1});
  n&&n.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();close()},{passive:!1});
  c.forEach(a=>a.addEventListener("click",close,{passive:!0}));
  D.addEventListener("keydown",ev=>{if(ev.key==="Escape")close()});
  D.addEventListener("click",ev=>{
    if(!isOpen())return;
    const trg=ev.target;
    if(e.contains(trg))return;
    if(t&&t.contains(trg))return;
    close();
  });
});

})(); /* FIN IIFE PRINCIPAL */


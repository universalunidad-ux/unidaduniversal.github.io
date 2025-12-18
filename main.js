/* Expiriti - main.js FINAL (minificado, sin duplicados, pause real, lazy correcto) */
(function(){if(window.__EXPIRITI_MAIN__)return;window.__EXPIRITI_MAIN__=1;
/* ================= PARTIALS + RUTAS ================= */
(async function(){const d=document,w=window;const isGh=location.hostname.endsWith("github.io");const seg=location.pathname.split("/")[1]||"";const repo=isGh&&seg?"/"+seg:"";const inSub=/\/(SISTEMAS|SERVICIOS)\//i.test(location.pathname);const depth=inSub?"../":"";const pref=p=>!p||/^https?:\/\//i.test(p)||/^mailto:|^tel:|^data:/.test(p)?p:isGh?(repo+"/"+p).replace(/\/+/g,"/"):(depth+p).replace(/\/+/g,"/");
async function ex(u){try{return(await fetch(u,{method:"HEAD",cache:"no-store"})).ok}catch{return!1}}
async function pick(a){for(const p of a)if(await ex(p))return p;return a[0]}
function norm(root){root.querySelectorAll(".js-abs-src[data-src]").forEach(i=>{const s=i.dataset.src;if(!i.src)i.src=pref(s);i.style.opacity=1});
root.querySelectorAll(".js-abs-href[data-href]").forEach(a=>{const p=a.dataset.href||"";const[x,h]=p.split("#");a.href=pref(x)+(h?"#"+h:"")});
["gf-year","year"].forEach(id=>{const y=root.getElementById?.(id)||d.getElementById(id);if(y)y.textContent=new Date().getFullYear()})}
async function load(){const hp=d.getElementById("header-placeholder"),fp=d.getElementById("footer-placeholder");if(!hp&&!fp){norm(d);return}
const h=await pick([pref("PARTIALS/global-header.html"),depth+"PARTIALS/global-header.html","./PARTIALS/global-header.html","/PARTIALS/global-header.html"]);
const f=await pick([pref("PARTIALS/global-footer.html"),depth+"PARTIALS/global-footer.html","./PARTIALS/global-footer.html","/PARTIALS/global-footer.html"]);
let hh="",ff="";try{const[rh,rf]=await Promise.all([hp?fetch(h,{cache:"no-store"}):null,fp?fetch(f,{cache:"no-store"}):null]);if(hp&&rh?.ok)hh=await rh.text();if(fp&&rf?.ok)ff=await rf.text()}catch{}
if(hp&&hh)hp.outerHTML=hh;if(fp&&ff)fp.outerHTML=ff;norm(d);w.dispatchEvent(new CustomEvent("expiriti:partials:ready"))}
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",load,{once:1});else load();w.addEventListener("pageshow",()=>{try{norm(d)}catch{}});w.__expiritiPrefix=pref})();
/* ================= UTIL ================= */
(function(){const f=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});window.$$fmt=v=>f.format(Math.round(Number(v||0)));
window.Q||(window.Q=(s,c=document)=>c.querySelector(s));window.QA||(window.QA=(s,c=document)=>Array.from(c.querySelectorAll(s)))})();
/* ================= HEADER MOBILE ================= */
(function(){const b=document.getElementById("burger"),m=document.getElementById("mobileMenu");b&&m&&b.addEventListener("click",()=>m.classList.toggle("open"))})();
/* ================= YOUTUBE CORE (PAUSE REAL) ================= */
(function(){const w=window;w.exPlayers=[];w.pauseAllYTIframes=function(x){w.exPlayers.forEach(p=>{if(p&&p!==x&&p.pauseVideo)try{const s=p.getPlayerState();(s===1||s===3)&&p.pauseVideo()}catch{}})};
function onState(e){e.data===1&&w.pauseAllYTIframes(e.target)}
w.onYouTubeIframeAPIReady=function(){document.querySelectorAll('iframe[src*="youtube"]').forEach(i=>{if(i.dataset.ytInit)return;i.dataset.ytInit=1;
if(!i.src.includes("enablejsapi=1"))i.src+=(i.src.includes("?")?"&":"?")+"enablejsapi=1";const p=new YT.Player(i,{events:{onStateChange:onState}});w.exPlayers.push(p)})};
if(!w.YT){const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s)}
const poster=id=>`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const src=id=>`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
function ensure(el){const id=el.dataset.ytid;if(!id)return;el.dataset.poster=1;el.style.setProperty("--yt-poster",`url("${poster(id)}")`)}
function mount(el){if(el.dataset.mounted)return;const id=el.dataset.ytid;if(!id)return;ensure(el);
const f=document.createElement("iframe");f.loading="lazy";f.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";f.allowFullscreen=1;
f.title=el.dataset.title||"YouTube video";f.src=src(id);f.addEventListener("load",()=>el.classList.add("is-ready"),{once:1});
el.appendChild(f);el.dataset.mounted=1}
function initYT(){document.querySelectorAll(".reel-embed[data-ytid]").forEach(e=>{ensure(e);mount(e)});
const vids=[...document.querySelectorAll(".yt-wrap[data-ytid]")];vids.forEach(ensure);
if(!("IntersectionObserver"in window)){vids.forEach(mount);return}
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){mount(en.target);io.unobserve(en.target)}}),{rootMargin:"700px 0px"});
vids.forEach(v=>io.observe(v))}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",initYT,{once:1}):initYT()})();
/* ================= CAROUSEL UNIVERSAL ================= */
(function(){function sync(root,len){const nav=root.querySelector(".carousel-nav");if(!nav)return[];let d=[...nav.querySelectorAll(".dot")];
while(d.length<len){const b=document.createElement("button");b.type="button";b.className="dot";nav.appendChild(b);d.push(b)}
while(d.length>len)d.pop().remove();return d}
function hide(root,len){[".arrowCircle.prev",".arrowCircle.next",".carousel-nav"].forEach(s=>{const e=root.querySelector(s);if(e)e.style.display=len<=1?"none":""})}
function init(root){const t=root.querySelector(".carousel-track");if(!t)return;const slides=[...t.querySelectorAll(":scope>.carousel-slide")];const len=slides.length;
let dots=sync(root,len);hide(root,len);if(len<=1){dots[0]?.classList.add("active");return}
let i=0;const set=n=>{i=(n+len)%len;dots.forEach((d,j)=>d.classList.toggle("active",j===i));
t.scrollTo({left:t.clientWidth*i,behavior:"smooth"})};
dots.forEach((d,j)=>d.addEventListener("click",()=>{window.pauseAllYTIframes();set(j)}));
root.querySelector(".arrowCircle.prev")?.addEventListener("click",()=>{window.pauseAllYTIframes();set(i-1)});
root.querySelector(".arrowCircle.next")?.addEventListener("click",()=>{window.pauseAllYTIframes();set(i+1)});
t.addEventListener("scroll",()=>{const n=Math.round(t.scrollLeft/t.clientWidth);if(n!==i){i=n;dots.forEach((d,j)=>d.classList.toggle("active",j===i))}});
window.addEventListener("resize",()=>set(i));set(0)}
const boot=()=>document.querySelectorAll(".carousel").forEach(init);
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot()})();
/* ================= FIN ================= */
})();

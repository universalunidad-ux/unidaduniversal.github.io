/* Expiriti - main.js (Personia) */
// Año + menú móvil
(function(){
  var y=document.getElementById("year");
  if(y) y.textContent=new Date().getFullYear();
  var b=document.getElementById("burger"),m=document.getElementById("mobileMenu");
  if(b&&m) b.addEventListener("click",()=>m.classList.toggle("open"));
})();

// Carrusel genérico (.carousel) + sincronización opcional de títulos
(function(){
  function initCarousel(root, onChange){
    const track=root.querySelector(".carousel-track");
    const dots=[...root.querySelectorAll(".carousel-nav .dot")];
    const prev=root.querySelector(".arrowCircle.prev");
    const next=root.querySelector(".arrowCircle.next");
    let i=0, len=dots.length||(track?.children?.length||0);
    function set(n){
      if(!track||!len) return;
      i=(n+len)%len;
      dots.length&&dots.forEach((d,idx)=>d.classList.toggle("active",idx===i));
      track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
      onChange&&onChange(i);
    }
    dots.forEach((d,idx)=>d.addEventListener("click",()=>set(idx)));
    prev&&prev.addEventListener("click",()=>set(i-1));
    next&&next.addEventListener("click",()=>set(i+1));
    track&&track.addEventListener("scroll",()=>{const n=Math.round(track.scrollLeft/track.clientWidth); if(n!==i){i=n; dots.forEach((d,idx)=>d.classList.toggle("active",idx===i)); onChange&&onChange(i);}});
    window.addEventListener("resize",()=>set(i));
    set(0);
  }

  document.querySelectorAll(".carousel").forEach(car=>{
    // Títulos: usa data-titles=".reel-title" si está; si no, intenta buscarlos cerca
    const sel=car.getAttribute("data-titles");
    let titles=null;
    if(sel){ titles=[...document.querySelectorAll(sel)]; }
    else {
      // intenta en el contenedor padre (card/aside)
      const scope=car.closest(".card,.body,aside,section,div")||document;
      titles=[...scope.querySelectorAll(".reel-title")];
    }
    if(!titles.length) titles=null;
    initCarousel(car, idx=>{ if(titles){ titles.forEach((t,i)=>t.classList.toggle("active",i===idx)); } });
  });
})();

// List slider (“¿Por qué usar…?”)
(function(){
  document.querySelectorAll(".listSlider").forEach(w=>{
    const track=w.querySelector(".listTrack");
    const prev=w.querySelector(".arrowCircle.prev");
    const next=w.querySelector(".arrowCircle.next");
    if(!track||!prev||!next) return;
    let i=0, len=track.children.length;
    function go(n){ i=(n+len)%len; track.scrollTo({left:w.clientWidth*i,behavior:"smooth"}); }
    prev.addEventListener("click",()=>go(i-1));
    next.addEventListener("click",()=>go(i+1));
    window.addEventListener("resize",()=>go(i));
  });
})();

// Píldoras (filtros)
(function(){
  const pills=[...document.querySelectorAll(".pill")];
  const cards=[...document.querySelectorAll(".feature-grid .fcard")];
  if(!pills.length||!cards.length) return;
  function apply(tag){
    cards.forEach(card=>{
      const show = card.classList.contains("tag-"+tag);
      card.style.display = show ? "" : "none";
    });
  }
  pills.forEach(p=>{
    p.addEventListener("click",()=>{
      pills.forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
      apply(p.dataset.filter);
    });
  });
  apply(pills[0]?.dataset.filter||"nomina");
})();

// FAQ: solo uno abierto
(function(){
  const wrap=document.getElementById("faqWrap");
  if(!wrap) return;
  [...wrap.querySelectorAll(".faq-item")].forEach(item=>{
    item.addEventListener("toggle",()=>{
      if(item.open){
        [...wrap.querySelectorAll(".faq-item")].forEach(o=>{ if(o!==item) o.removeAttribute("open"); });
      }
    });
  });
})();

// Carrusel de sistemas (.carouselX) con accesibilidad + dots dinámicos
(function(){
  document.querySelectorAll(".carouselX").forEach(root=>{
    const track=root.querySelector(".track");
    const prev=root.querySelector(".arrowCircle.prev");
    const next=root.querySelector(".arrowCircle.next");
    const dotsWrap=root.querySelector(".group-dots");
    const items=[...root.querySelectorAll(".sys")];
    if(!track||!prev||!next||!dotsWrap||!items.length) return;

    // Accesibilidad + navegación con teclado
    items.forEach(it=>{
      it.setAttribute("role","link");
      it.setAttribute("tabindex","0");
      const go=()=>{const href=it.getAttribute("data-href"); if(href) window.location.href=href;};
      it.addEventListener("click",go);
      it.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } });
    });

    const perView=()=> (window.innerWidth<=980 ? 1 : 3);
    const pages = ()=> Math.max(1, Math.ceil(items.length / perView()));
    const viewportW = ()=> track.clientWidth;

    function buildDots(){
      dotsWrap.innerHTML="";
      const arr=[...Array(pages())].map((_,j)=>{
        const b=document.createElement("button");
        b.className="dot"+(j===0?" active":"");
        b.setAttribute("aria-label","Ir a página "+(j+1));
        b.addEventListener("click",()=>go(j));
        dotsWrap.appendChild(b);
        return b;
      });
      return arr;
    }

    let dots=buildDots(), idx=0;
    function paint(j){ dots.forEach((d,i)=>d.classList.toggle("active",i===j)); }
    function go(j){
      const total=pages();
      idx=((j%total)+total)%total;
      track.scrollTo({left:viewportW()*idx,behavior:"smooth"});
      paint(idx); toggleUI();
    }

    function toggleUI(){
      const multi=pages()>1;
      prev.style.display = multi ? "" : "none";
      next.style.display = multi ? "" : "none";
      dotsWrap.style.display = multi ? "" : "none";
    }

    prev.addEventListener("click",()=>go(idx-1));
    next.addEventListener("click",()=>go(idx+1));

    window.addEventListener("resize",()=>{
      const need=dots.length, now=pages();
      if(need!==now){ dots=buildDots(); }
      go(idx);
    });

    toggleUI(); go(0);
  });
})();

// TOC flotante (opcional)
(function(){
  const toc=document.getElementById("toc");
  const trigger=document.getElementById("tocToggle");
  const closeBtn=toc?.querySelector(".toc-close");
  if(!toc||!trigger||!closeBtn) return;
  trigger.addEventListener("click",e=>{ e.stopPropagation(); toc.classList.toggle("collapsed"); });
  closeBtn.addEventListener("click",()=>toc.classList.add("collapsed"));
  toc.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>toc.classList.add("collapsed")));
  document.addEventListener("click",e=>{ if(!toc.contains(e.target) && e.target!==trigger) toc.classList.add("collapsed"); });
})();

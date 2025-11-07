<script>
/* =========================================================
   Expiriti - main.js (Personia) — Complemento a calculadora.js v13
   ========================================================= */

/* ---------- Utils ---------- */
(function(){
  const money = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
  window.$$fmt = v => money.format(Math.round(Number(v||0)));
  window.$$ = (sel, ctx=document) => ctx.querySelector(sel);
  window.$all = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
})();

/* ---------- Año + menú móvil ---------- */
(function(){
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
  const b = document.getElementById("burger"), m = document.getElementById("mobileMenu");
  if (b && m) b.addEventListener("click", () => m.classList.toggle("open"));
})();

/* ---------- Carrusel genérico ---------- */
(function(){
  function initCarousel(root, onChange){
    const track = root.querySelector(".carousel-track");
    const dots  = [...root.querySelectorAll(".carousel-nav .dot")];
    const prev  = root.querySelector(".arrowCircle.prev");
    const next  = root.querySelector(".arrowCircle.next");
    let i=0, len=dots.length || (track?.children?.length||0);

    function set(n){
      if(!track||!len) return;
      i=(n+len)%len;
      if (dots.length) dots.forEach((d,idx)=>d.classList.toggle("active",idx===i));
      track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});
      onChange && onChange(i);
    }
    dots.forEach((d,idx)=>d.addEventListener("click",()=>set(idx)));
    prev && prev.addEventListener("click",()=>set(i-1));
    next && next.addEventListener("click",()=>set(i+1));
    track && track.addEventListener("scroll",()=>{
      const n = Math.round(track.scrollLeft/track.clientWidth);
      if(n!==i){ i=n; dots.forEach((d,idx)=>d.classList.toggle("active",idx===i)); onChange&&onChange(i); }
    });
    window.addEventListener("resize",()=>set(i));
    set(0);
  }

  document.querySelectorAll(".carousel:not(#carouselReels)").forEach(car=>{
    const sel = car.getAttribute("data-titles");
    let titles = null;
    if (sel) titles = [...document.querySelectorAll(sel)];
    else {
      const scope = car.closest(".card,.body,aside,section,div")||document;
      titles = [...scope.querySelectorAll(".reel-title")];
    }
    if(!titles.length) titles=null;
    initCarousel(car, idx=>{ if(titles){ titles.forEach((t,i)=>t.classList.toggle("active",i===idx)); } });
  });
})();

/* ---------- List slider (“¿Por qué usar…?”) ---------- */
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

/* ---------- Píldoras (filtros) ---------- */
(function(){
  const pills=[...document.querySelectorAll(".pill")];
  const cards=[...document.querySelectorAll(".feature-grid .fcard")];
  if(!pills.length||!cards.length) return;
  function apply(tag){ cards.forEach(card=>{ card.style.display = card.classList.contains("tag-"+tag) ? "" : "none"; }); }
  pills.forEach(p=>{
    p.addEventListener("click",()=>{
      pills.forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
      apply(p.dataset.filter);
    });
  });
  apply(pills[0]?.dataset.filter||"nomina");
})();

/* ---------- FAQ: solo uno abierto ---------- */
(function(){
  const wrap=document.getElementById("faqWrap");
  if(!wrap) return;
  [...wrap.querySelectorAll(".faq-item")].forEach(item=>{
    item.addEventListener("toggle",()=>{
      if(item.open){ [...wrap.querySelectorAll(".faq-item")].forEach(o=>{ if(o!==item) o.removeAttribute("open"); }); }
    });
  });
})();

/* ---------- Carrusel de sistemas (.carouselX) ---------- */
(function(){
  document.querySelectorAll(".carouselX").forEach(root=>{
    const track=root.querySelector(".track");
    const prev=root.querySelector(".arrowCircle.prev");
    const next=root.querySelector(".arrowCircle.next");
    const dotsWrap=root.querySelector(".group-dots");
    const items=[...root.querySelectorAll(".sys")];
    if(!track||!prev||!next||!dotsWrap||!items.length) return;

    // Accesibilidad + teclado
    items.forEach(it=>{
      it.setAttribute("role","link");
      it.setAttribute("tabindex","0");
      const go=()=>{const href=it.getAttribute("data-href"); if(href) window.open(href,"_blank","noopener")};
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

/* ---------- Reels (scoped) + pausa global de YouTube ---------- */
(function(){
  const root = document.getElementById('carouselReels');
  if(root){
    const scope = root.closest('aside') || root;
    const track = root.querySelector('.carousel-track');
    const slides = [...track.querySelectorAll('.carousel-slide')];
    const dots = [...root.querySelectorAll('.carousel-nav .dot')];
    const prev = root.querySelector('.arrowCircle.prev');
    const next = root.querySelector('.arrowCircle.next');
    const reelTitles = [...scope.querySelectorAll('.reel-title')];
    let idx = 0;
    function setActive(i){
      if(!dots.length || !slides.length) return;
      idx = (i + dots.length) % dots.length;
      dots.forEach((d,di)=>d.classList.toggle('active', di===idx));
      reelTitles.forEach((t,ti)=>t.classList.toggle('active', ti===idx));
      const slideWidth = track.clientWidth;
      track.scrollTo({ left: slideWidth * idx, behavior: 'smooth' });
    }
    dots.forEach((d,i)=>d.addEventListener('click',()=>setActive(i)));
    prev?.addEventListener('click',()=>setActive(idx-1));
    next?.addEventListener('click',()=>setActive(idx+1));
    track.addEventListener('scroll',()=>{
      const w = track.clientWidth || 1;
      const i = Math.round(track.scrollLeft / w);
      if(i !== idx && i >= 0 && i < dots.length){
        idx = i;
        dots.forEach((d,di)=>d.classList.toggle('active', di===idx));
        reelTitles.forEach((t,ti)=>t.classList.toggle('active', ti===idx));
      }
    });
    window.addEventListener('resize',()=>setActive(idx));
    setActive(0);
  }

  // pausa global
  if(!window.YT){
    const tag=document.createElement('script');
    tag.src="https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
  let players=[];
  window.onYouTubeIframeAPIReady = function(){
    document.querySelectorAll('iframe[src*="youtube"]').forEach((el)=>{
      try{
        const p=new YT.Player(el,{
          events:{ 'onStateChange':(e)=>{
            if(e.data===1){ players.forEach(pl=>{ if(pl!==p) pl.pauseVideo(); }); }
          }}
        });
        players.push(p);
      }catch(err){}
    });
  };
})();

/* =========================================================
   Calculadora NUBE (independiente del legacy de escritorio)
   ========================================================= */
const CalculadoraNube = (function(){
  function init({ systemName, mountSelector = '#calc-primary', onCombined = null, combinedSelector = null }){
    const root = document.querySelector(mountSelector);
    if(!root) return console.warn('calc-nube: no mount target');

    const db = (window.preciosContpaqi?.[systemName] || {}).nube || null;
    if(!db) return console.warn('calc-nube: no price table for', systemName);

    const addOnGlobalKeys = new Set(['usuario_adicional','xml_historicos','espacio_adicional']);
    const PLANES = Object.keys(db).filter(k => typeof db[k] === 'object' && !addOnGlobalKeys.has(k));

    const state = { plan: PLANES[0]||null, usuarios:null, empleados:null };

    const $ = (sel, ctx=root)=> (ctx||root).querySelector(sel);
    const mxn = window.$$fmt;

    function planInfo(){ return db[state.plan] || {}; }
    function incUsers(){ return planInfo().usuarios_incluidos; }
    function incEmpl(){ return planInfo().empleados_incluidos; }
    const usuarioAdic = ()=> Number(db.usuario_adicional || 0);
    const empleadoAdic = ()=> Number(planInfo().empleado_adicional || 0);

    root.classList.add('calc-container','calc-nube');
    root.innerHTML = `
      <h4 style="margin:0 0 8px">Calcula tu plan en la nube</h4>
      <div class="grid-nube">
        <div>
          <label class="control-label">Plan</label>
          <select id="nube-plan"></select>
        </div>
        <div id="nube-usuarios-wrap" style="display:none">
          <label class="control-label">Usuarios</label>
          <input id="nube-usuarios" type="number" min="1" step="1" value="1">
          <small class="hint" id="nube-usuarios-hint"></small>
        </div>
        <div id="nube-empleados-wrap" style="display:none">
          <label class="control-label">Empleados</label>
          <input id="nube-empleados" type="number" min="0" step="1" value="0">
          <small class="hint" id="nube-empleados-hint"></small>
        </div>
        <div id="nube-espacio-wrap" style="display:none">
          <label class="control-label">Espacio adicional</label>
          <select id="nube-espacio"></select>
          <small class="hint">Costo mensual según tamaño.</small>
        </div>
      </div>
      <table class="calc-nube-table">
        <thead><tr><th>Concepto</th><th style="text-align:right">Importe</th></tr></thead>
        <tbody id="nube-tbody"></tbody>
        <tfoot><tr><td style="font-weight:700">Total</td><td id="nube-total" style="text-align:right;font-weight:700"></td></tr></tfoot>
      </table>
    `;

    const selPlan = $('#nube-plan');
    PLANES.forEach(p=>{ const opt=document.createElement('option'); opt.value=p; opt.textContent=p; selPlan.appendChild(opt); });
    state.plan = selPlan.value;

    const espacioWrap = $('#nube-espacio-wrap');
    const selEspacio  = $('#nube-espacio');
    if (db.espacio_adicional && typeof db.espacio_adicional === 'object'){
      espacioWrap.style.display='';
      selEspacio.innerHTML = `<option value="">Sin extra</option>`;
      Object.keys(db.espacio_adicional).forEach(k=>{
        const opt=document.createElement('option');
        opt.value=k; opt.textContent = `${k} (+${mxn(db.espacio_adicional[k])})`;
        selEspacio.appendChild(opt);
      });
    }

    function syncInputs(){
      const incU = incUsers();
      const incE = incEmpl();

      const $uwrap = $('#nube-usuarios-wrap'), $u = $('#nube-usuarios'), $uh = $('#nube-usuarios-hint');
      if (typeof incU === 'number'){
        $uwrap.style.display='';
        if (state.usuarios == null) state.usuarios = incU;
        $u.value = state.usuarios;
        $uh.textContent = `Incluye ${incU}. Usuario adicional: ${usuarioAdic()? mxn(usuarioAdic()): '–'}.`;
      } else { $uwrap.style.display='none'; state.usuarios=null; }

      const $ewrap = $('#nube-empleados-wrap'), $e = $('#nube-empleados'), $eh = $('#nube-empleados-hint');
      if (typeof incE === 'number'){
        $ewrap.style.display='';
        if (state.empleados == null || state.empleados < incE) state.empleados = incE;
        $e.value = state.empleados;
        $eh.textContent = `Incluye ${incE}. Empleado adicional: ${empleadoAdic()? mxn(empleadoAdic()): '–'}.`;
      } else { $ewrap.style.display='none'; state.empleados=null; }
    }

    const tbody = $('#nube-tbody');
    const totalEl = $('#nube-total');

    function recalc(){
      const p = planInfo();
      const rows = [];
      let total = 0;

      const base = Number(p.precio_base || 0);
      rows.push(['Plan '+state.plan, mxn(base)]);
      total += base;

      if (typeof incUsers()==='number'){
        const inc = incUsers();
        const want = Math.max(inc, Number(state.usuarios||inc));
        const extra = Math.max(0, want - inc);
        const uAd = usuarioAdic();
        if (extra>0 && uAd>0){ rows.push([`Usuarios adicionales (${extra})`, mxn(extra*uAd)]); total += extra*uAd; }
      }

      if (typeof incEmpl()==='number'){
        const inc = incEmpl();
        const want = Math.max(inc, Number(state.empleados||inc));
        const extra = Math.max(0, want - inc);
        const eAd = empleadoAdic();
        if (extra>0 && eAd>0){ rows.push([`Empleados adicionales (${extra})`, mxn(extra*eAd)]); total += extra*eAd; }
      }

      if (selEspacio && selEspacio.value){
        const precioEsp = Number((db.espacio_adicional||{})[selEspacio.value]||0);
        if (precioEsp>0){ rows.push([`Espacio adicional (${selEspacio.value})`, mxn(precioEsp)]); total += precioEsp; }
      }

      tbody.innerHTML='';
      rows.forEach(([c,v])=>{
        const tr=document.createElement('tr');
        const td1=document.createElement('td'); td1.textContent=c;
        const td2=document.createElement('td'); td2.textContent=v; td2.style.textAlign='right';
        tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
      });
      totalEl.textContent = mxn(total);

      if (onCombined && combinedSelector){
        onCombined([ [`${systemName} — ${state.plan}`, mxn(total)] ]);
      }
    }

    selPlan.addEventListener('change', ()=>{ state.plan = selPlan.value; state.usuarios=null; state.empleados=null; syncInputs(); recalc(); });
    $('#nube-usuarios')?.addEventListener('input', e=>{ const v=parseInt(e.target.value||0,10); state.usuarios=Math.max(1,v||1); recalc(); });
    $('#nube-empleados')?.addEventListener('input', e=>{ const v=parseInt(e.target.value||0,10); state.empleados=Math.max(0,v||0); recalc(); });
    selEspacio?.addEventListener('change', ()=>recalc());

    syncInputs(); recalc();
    return { recalc };
  }

  return { init };
})();

/* =========================================================
   Preferencia temprana por NUBE (evita auto-init de v13)
   ========================================================= */
(function earlyPreferNube(){
  function detectSystemNameSync(){
    const node = document.querySelector('[data-system]');
    if (node?.dataset?.system) return node.dataset.system.trim();
    const app = document.getElementById('app');
    if (app?.dataset?.system) return app.dataset.system.trim();
    const h1 = document.querySelector('h1');
    if (h1?.textContent && /CONTPAQi\s+/i.test(h1.textContent)) return h1.textContent.trim();
    const t = document.title || '';
    const m = t.match(/CONTPAQi\s+[^\|]+/i);
    if (m) return m[0].trim();
    return null;
  }
  const sys = detectSystemNameSync();
  if (!sys) return;
  const S = (window.preciosContpaqi||{})[sys] || {};
  if (S.nube){
    window.__EXPIRITI_FORCE_NUBE__ = true;           // bandera global para que v13 NO auto-inicialice
    document.body?.setAttribute('data-calc','nube'); // útil si tu CSS lo usa
  }
})();

/* =========================================================
   AutoCalcSwitcher — decide Nube vs (deja) Escritorio (v13)
   ========================================================= */
(function(){
  function detectSystemName(){
    const node = document.querySelector('[data-system]');
    if (node?.dataset?.system) return node.dataset.system.trim();
    const app = document.getElementById('app');
    if (app?.dataset?.system) return app.dataset.system.trim();
    const h1 = document.querySelector('h1');
    if (h1?.textContent && /CONTPAQi\s+/i.test(h1.textContent)) return h1.textContent.trim();
    const t = document.title || '';
    const m = t.match(/CONTPAQi\s+[^\|]+/i);
    if (m) return m[0].trim();
    return null;
  }

  function mountNube(sys){
    document.body.setAttribute('data-calc','nube');
    const mount = '#calc-primary';

    const render = ()=>CalculadoraNube.init({
      systemName: sys,
      mountSelector: mount,
      combinedSelector: '#combined-wrap',
      onCombined(rows){
        const wrap=$('#combined-wrap'), tbody=$('#combined-table-body');
        if(!wrap||!tbody) return;
        tbody.innerHTML='';
        rows.forEach(([c,v])=>{
          const tr=document.createElement('tr');
          const td1=document.createElement('td'); td1.textContent=c;
          const td2=document.createElement('td'); td2.textContent=v; td2.style.textAlign='right';
          tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
        });
        wrap.hidden=false;
      }
    });

    // Render inmediato
    render();

    // Guard contra “inject” del legacy: si aparece una tabla/form de escritorio en #calc-primary, reponemos Nube
    const host = document.querySelector(mount);
    if (!host) return;
    const obs = new MutationObserver(()=>{
      const legacyBits = host.querySelector('.calc-table, .calc-form, table.calc-table');
      const nubeReady  = host.querySelector('.calc-nube');
      if (legacyBits && !nubeReady){
        render();
      }
    });
    obs.observe(host, { childList:true, subtree:true });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const sys = detectSystemName();
    if(!sys){ console.warn('AutoCalcSwitcher: no pude detectar el sistema.'); return; }

    const S = window.preciosContpaqi?.[sys] || {};
    const hasNube = !!S.nube;
    const hasDesk = !!(S.escritorio || S.anual || S.tradicional);

    // Punto de montaje para ambos caminos
    const mount = '#calc-primary';

    if (hasNube){
      mountNube(sys);
      return;
    }

    if (hasDesk){
      // Delegamos en v13 existente
      if (window.CalculadoraContpaqi && typeof window.CalculadoraContpaqi.init === 'function'){
        window.CalculadoraContpaqi.init({
          systemName: sys,
          primarySelector: mount,
          combinedSelector: '#combined-wrap'
        });
      } else {
        console.warn('AutoCalcSwitcher: no encontré CalculadoraContpaqi.init (v13).');
      }
      return;
    }

    const root = document.querySelector(mount);
    if (root) root.innerHTML = `<p class="hint">No hay tabla de Nube ni de Escritorio definida para “${sys}”.</p>`;
  });
})();
</script>

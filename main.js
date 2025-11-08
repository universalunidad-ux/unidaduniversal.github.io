/* =========================================================
   Expiriti - main.js (Personia) — Unificado Nube + Escritorio + Fixes
   ========================================================= */

/* ---------- Utils ---------- */
(function(){
  const money = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
  window.$$fmt = v => money.format(Math.round(Number(v||0)));
  window.$$  = (sel, ctx=document) => ctx.querySelector(sel);
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
    const prev  = root.querySelector(".arrowCircle.prev");
    const next  = root.querySelector(".arrowCircle.next");
    let dots  = [...root.querySelectorAll(".carousel-nav .dot")];
    let i=0, len = dots.length || (track?.children?.length||0);

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
    if(!titles?.length) titles=null;
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

/* ---------- Carrusel de sistemas (.carouselX) — Auto UI + FIX de páginas ---------- */
(function(){
  function ensureUI(root){
    // Flechas
    let prev = root.querySelector(".arrowCircle.prev");
    let next = root.querySelector(".arrowCircle.next");
    if(!prev){
      prev = document.createElement("button");
      prev.className = "arrowCircle prev"; prev.setAttribute("aria-label","Anterior");
      prev.innerHTML = '<span class="chev">‹</span>';
      root.appendChild(prev);
    }
    if(!next){
      next = document.createElement("button");
      next.className = "arrowCircle next"; next.setAttribute("aria-label","Siguiente");
      next.innerHTML = '<span class="chev">›</span>';
      root.appendChild(next);
    }
    // Dots
    let dotsWrap = root.querySelector(".group-dots");
    if(!dotsWrap){
      dotsWrap = document.createElement("div");
      dotsWrap.className = "group-dots";
      root.appendChild(dotsWrap);
    }
    return { prev, next, dotsWrap };
  }

  document.querySelectorAll(".carouselX").forEach(root=>{
    const track=root.querySelector(".track");
    if(!track) return;

    // Click en tarjetas
    const items=[...root.querySelectorAll(".sys")];
    items.forEach(it=>{
      it.setAttribute("role","link"); it.setAttribute("tabindex","0");
      const go=()=>{const href=it.getAttribute("data-href"); if(href) window.open(href,"_blank","noopener")};
      it.addEventListener("click",go);
      it.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } });
    });

    const { prev, next, dotsWrap } = ensureUI(root);

    const perView   = () => (window.innerWidth<=980 ? 1 : 3);
    const viewportW = () => track.clientWidth || root.clientWidth || 1;

    // Total de páginas basado en ancho scrolleable real (incluye gap/bordes/padding)
    const pageCount = () => Math.max(1, Math.ceil((track.scrollWidth - 1) / viewportW()));

    function buildDots(){
      dotsWrap.innerHTML="";
      const total = pageCount();
      const arr=[...Array(total)].map((_,j)=>{
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
      const total = pageCount();
      idx = ((j % total) + total) % total;

      // Calcula el primer ítem visible de esa página y alinea por offsetLeft
      const startIdx = Math.min(idx * perView(), items.length - 1);
      const first    = items[startIdx];
      const baseLeft = first ? first.offsetLeft - (track.firstElementChild?.offsetLeft || 0) : idx * viewportW();

      const maxLeft = Math.max(0, track.scrollWidth - viewportW());
      const left    = Math.min(baseLeft, maxLeft);

      track.scrollTo({left, behavior:"smooth"});
      paint(idx);
      toggleUI();
    }

    function toggleUI(){
      const multi=pageCount()>1;
      prev.style.display = multi ? "" : "none";
      next.style.display = multi ? "" : "none";
      dotsWrap.style.display = multi ? "" : "none";
    }

    prev.addEventListener("click",()=>go(idx-1));
    next.addEventListener("click",()=>go(idx+1));

    track.addEventListener("scroll",()=>{
      const i = Math.round(track.scrollLeft / viewportW());
      if(i !== idx){ idx=i; paint(idx); }
    });

    window.addEventListener("resize",()=>{
      const now = pageCount();
      if(dots.length !== now) dots = buildDots();
      setTimeout(()=>go(idx), 0); // re-alinea tras cambio de ancho
    });

    // Asegura que todos los ítems sean alcanzables
    track.style.overflowX = "auto";
    track.style.scrollBehavior = "smooth";

    toggleUI(); go(0);
    setTimeout(()=> track.scrollTo({ left: 0, behavior: "auto" }), 50);
  });
})();

/* ---------- Reels (scoped) + pausa global de YouTube (encadenada) ---------- */
(function(){
  const root = document.getElementById('carouselReels');
  if(root){
    const scope = root.closest('aside') || root;
    const track = root.querySelector('.carousel-track');
    const slides = [...(track?.querySelectorAll('.carousel-slide')||[])];
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
    track?.addEventListener('scroll',()=>{
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

  // Pausa global YouTube — encadena si ya existe handler
  if(!window.YT){
    const tag=document.createElement('script');
    tag.src="https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
  let players=[];
  const prevReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function(){
    if (typeof prevReady === 'function') { try{ prevReady(); }catch(_){} }
    document.querySelectorAll('iframe[src*="youtube"]').forEach((el)=>{
      try{
        const p=new YT.Player(el,{
          events:{ 'onStateChange':(e)=>{
            if(e.data===1){ players.forEach(pl=>{ if(pl!==p) pl.pauseVideo(); }); }
          }}
        });
        players.push(p);
      }catch(_){}
    });
  };
})();

/* =========================================================
   Calculadora NUBE (usuarios/empleados extra, IVA y orden)
   ========================================================= */
const CalculadoraNube = (function(){
  function init({ systemName, mountSelector = '#calc-primary', onCombined = null, combinedSelector = null }){
    const root = document.querySelector(mountSelector);
    if(!root) return console.warn('calc-nube: no mount target');

    const PROD = (window.preciosContpaqi?.[systemName] || {});
    const db = PROD.nube || null;
    if(!db) return console.warn('calc-nube: no price table for', systemName);

    const addOnGlobalKeys = new Set(['usuario_adicional','xml_historicos','espacio_adicional']);
    const PLANES = Object.keys(db).filter(k => typeof db[k] === 'object' && !addOnGlobalKeys.has(k));

    const state = { plan: PLANES[0]||null, usuarios:null, empleados:null };

    const $ = (sel, ctx=root)=> (ctx||root).querySelector(sel);
    const mxn = window.$$fmt || (v=>v);
    const getPlan = ()=> db[state.plan] || {};

    const precioUsuarioAdic = ()=>{
      const p = getPlan();
      const planUA = Number(p.usuario_adicional ?? NaN);
      if (!Number.isNaN(planUA) && planUA>0) return planUA;
      const prodUA = Number(db.usuario_adicional ?? NaN);
      return (!Number.isNaN(prodUA) && prodUA>0) ? prodUA : 0;
    };
    const precioEmpleadoAdic = ()=>{
      const p = getPlan();
      const planEA = Number(p.empleado_adicional ?? NaN);
      return (!Number.isNaN(planEA) && planEA>0) ? planEA : 0;
    };

    // UI
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
        <tfoot>
          <tr><td>IVA (16%)</td><td id="nube-iva" style="text-align:right"></td></tr>
          <tr><td style="font-weight:700">Total</td><td id="nube-total" style="text-align:right;font-weight:700"></td></tr>
        </tfoot>
      </table>
    `;

    // plan selector
    const selPlan = $('#nube-plan');
    PLANES.forEach(p=>{ const opt=document.createElement('option'); opt.value=p; opt.textContent=p; selPlan.appendChild(opt); });
    state.plan = selPlan.value;

    // espacio adicional (opcional)
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

    // inputs dinámicos
    function syncInputs(){
      const p = getPlan();

      // Usuarios
      const $uwrap = $('#nube-usuarios-wrap'), $u = $('#nube-usuarios'), $uh = $('#nube-usuarios-hint');
      const incU = p.usuarios_incluidos;
      if (incU === 'multi' || incU === 'Multi' || incU === 'MULTI'){
        $uwrap.style.display='none';
        state.usuarios = null;
      } else if (Number.isFinite(Number(incU))){
        const inc = Number(incU)||0;
        $uwrap.style.display='';
        if (state.usuarios==null || state.usuarios < inc) state.usuarios = inc;
        $u.value = state.usuarios;
        const uAd = precioUsuarioAdic();
        $uh.textContent = `Incluye ${inc}. Usuario adicional: ${uAd? mxn(uAd) : '–'}.`;
        $u.min = String(Math.max(1, inc));
      } else {
        $uwrap.style.display='none';
        state.usuarios = null;
      }

      // Empleados
      const $ewrap = $('#nube-empleados-wrap'), $e = $('#nube-empleados'), $eh = $('#nube-empleados-hint');
      const incE = Number(p.empleados_incluidos ?? NaN);
      if (!Number.isNaN(incE)){
        $ewrap.style.display='';
        if (state.empleados==null || state.empleados < incE) state.empleados = incE;
        $e.value = state.empleados;
        const eAd = precioEmpleadoAdic();
        $eh.textContent = `Incluye ${incE}. Empleado adicional: ${eAd? mxn(eAd) : '–'}.`;
        $e.min = String(Math.max(0, incE));
      } else {
        $ewrap.style.display='none';
        state.empleados = null;
      }
    }

    const tbody  = $('#nube-tbody');
    const ivaEl  = $('#nube-iva');
    const totalEl= $('#nube-total');

    function recalc(){
      const p = getPlan();
      const rows = [];
      let subtotal = 0;

      // 1) Plan base
      const base = Number(p.precio_base || 0);
      rows.push([`Plan ${state.plan}`, mxn(base)]);
      subtotal += base;

      // 2) Usuarios adicionales (si aplica)
      const incU = p.usuarios_incluidos;
      if (Number.isFinite(Number(incU)) && state.usuarios!=null){
        const inc = Number(incU)||0;
        const want = Math.max(inc, Number(state.usuarios)||inc);
        const extra = Math.max(0, want - inc);
        const uAd = precioUsuarioAdic();
        if (extra>0 && uAd>0){
          rows.push([`Usuarios adicionales (${extra})`, mxn(extra*uAd)]);
          subtotal += extra*uAd;
        }
      }

      // 3) Empleados adicionales (si aplica)
      const incE = Number(p.empleados_incluidos ?? NaN);
      if (!Number.isNaN(incE) && state.empleados!=null){
        const want = Math.max(incE, Number(state.empleados)||incE);
        const extra = Math.max(0, want - incE);
        const eAd = precioEmpleadoAdic();
        if (extra>0 && eAd>0){
          rows.push([`Empleados adicionales (${extra})`, mxn(extra*eAd)]);
          subtotal += extra*eAd;
        }
      }

      // 4) Espacio adicional (si aplica)
      if (selEspacio && selEspacio.value){
        const precioEsp = Number((db.espacio_adicional||{})[selEspacio.value]||0);
        if (precioEsp>0){
          rows.push([`Espacio adicional (${selEspacio.value})`, mxn(precioEsp)]);
          subtotal += precioEsp;
        }
      }

      // Pintar cuerpo
      tbody.innerHTML='';
      rows.forEach(([c,v])=>{
        const tr=document.createElement('tr');
        const td1=document.createElement('td'); td1.textContent=c;
        const td2=document.createElement('td'); td2.textContent=v; td2.style.textAlign='right';
        tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
      });

      // IVA y Total
      const iva = subtotal * 0.16;
      const total = subtotal + iva;
      ivaEl.textContent   = mxn(iva);
      totalEl.textContent = mxn(total);

      // combinado (si lo usas)
      if (onCombined && combinedSelector){
        onCombined([ [`${systemName} — ${state.plan}`, mxn(total)] ]);
      }
    }

    // eventos
    selPlan.addEventListener('change', ()=>{
      state.plan = selPlan.value;
      state.usuarios = null;
      state.empleados = null;
      syncInputs();
      recalc();
    });
    $('#nube-usuarios')?.addEventListener('input', e=>{
      const inc = Number(getPlan().usuarios_incluidos||0) || 0;
      const v = Math.max(inc, parseInt(e.target.value||0,10) || inc);
      e.target.value = String(v);
      state.usuarios = v;
      recalc();
    });
    $('#nube-empleados')?.addEventListener('input', e=>{
      const inc = Number(getPlan().empleados_incluidos||0) || 0;
      const v = Math.max(inc, parseInt(e.target.value||0,10) || inc);
      e.target.value = String(v);
      state.empleados = v;
      recalc();
    });
    selEspacio?.addEventListener('change', ()=>recalc());

    // init
    syncInputs(); recalc();
    return { recalc };
  }

  return { init };
})();

/* =========================================================
   Complementos calculadora ESCRITORIO: 2º/3º sistema + resumen
   ========================================================= */
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    if (document.body.getAttribute('data-calc') !== 'escritorio') return;

    const app = document.getElementById('app');
    const PRIMARY = app?.dataset?.system?.trim();
    if (!PRIMARY) return;

    const moneyMX = new Intl.NumberFormat("es-MX", { style:"currency", currency:"MXN", maximumFractionDigits:0 });
    const fmt = v => moneyMX.format(Math.round(Number(v||0)));
    const hasPrices = name => !!(window.preciosContpaqi && window.preciosContpaqi[name]);

    window.CATALOG_SISTEMAS = window.CATALOG_SISTEMAS || [
      { name: "CONTPAQi Contabilidad",       img: "../IMG/contabilidad.webp" },
      { name: "CONTPAQi Bancos",             img: "../IMG/bancos.webp" },
      { name: "CONTPAQi Nóminas",            img: "../IMG/nominas.webp" },
      { name: "CONTPAQi XML en Línea",       img: "../IMG/xml.webp",  noDiscount: true },
      { name: "CONTPAQi Comercial PRO",      img: "../IMG/comercialpro.webp" },
      { name: "CONTPAQi Comercial PREMIUM",  img: "../IMG/comercialpremium.webp" },
      { name: "CONTPAQi Factura Electrónica",img: "../IMG/factura.webp" }
    ];

    function getPrecioDesde(systemName){
      const db = (window.preciosContpaqi && window.preciosContpaqi[systemName]) || null;
      if(!db) return null;
      if (db.anual?.MultiRFC?.precio_base || db.anual?.MultiRFC?.renovacion)
        return Number(db.anual.MultiRFC.precio_base || db.anual.MultiRFC.renovacion || 0);
      if (db.anual?.MonoRFC?.precio_base || db.anual?.MonoRFC?.renovacion)
        return Number(db.anual.MonoRFC.precio_base || db.anual.MonoRFC.renovacion || 0);
      if (db.tradicional?.actualizacion?.precio_base)
        return Number(db.tradicional.actualizacion.precio_base);
      return null;
    }

    function renderSistemasPicker(containerId, exclude = new Set(), activeName = null){
      const wrap = document.getElementById(containerId);
      if(!wrap) return;
      wrap.innerHTML = "";
      if (PRIMARY) exclude.add(PRIMARY);

      window.CATALOG_SISTEMAS.forEach(item=>{
        if (exclude.has(item.name)) return;
        const precio = getPrecioDesde(item.name);
        const btn = document.createElement("button");
        btn.className = "sys-icon";
        btn.type = "button";
        btn.dataset.sys = item.name;
        btn.title = item.name;
        btn.innerHTML = `
          ${item.noDiscount ? '<small class="sin15">sin -15%</small>' : ''}
          <img src="${item.img}" alt="${item.name}">
          <strong>${item.name.replace('CONTPAQi ','')}</strong>
          <small class="sys-price">${precio != null ? 'desde '+fmt(precio) : 'precio no disp.'}</small>
        `;
        if (activeName && activeName === item.name) btn.classList.add('active');
        wrap.appendChild(btn);
      });
    }

    function renderCombinedTable(rows){
      const wrap=document.getElementById('combined-wrap');
      const tbody=document.getElementById('combined-table-body');
      if(!wrap||!tbody) return;
      tbody.innerHTML='';
      rows.forEach(([concepto, importe])=>{
        const tr=document.createElement('tr');
        const td1=document.createElement('td'); td1.textContent=concepto;
        const td2=document.createElement('td'); td2.textContent=importe; td2.style.textAlign='right';
        tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
      });
      wrap.hidden=false;
    }

    const row   = document.getElementById('calc-row');
    const slot2 = document.getElementById('calc-slot-2') || document.getElementById('calc-secondary');
    const slot3 = document.getElementById('calc-tertiary');
    const addMore = document.getElementById('add-more-panel');
    const pick2 = document.getElementById('icons-sec-sys');
    const pick3 = document.getElementById('icons-third-sys');
    if(!row) return;

    const selected = { secondary: null, tertiary: null };
    const selectedSet = ()=> new Set([selected.secondary, selected.tertiary].filter(Boolean));

    // Render inicial pickers
    const initialExclude = new Set(PRIMARY ? [PRIMARY] : []);
    renderSistemasPicker("icons-sec-sys", initialExclude);
    renderSistemasPicker("icons-third-sys", initialExclude);

    function refreshPickers(){
      const ex = selectedSet();
      if(PRIMARY) ex.add(PRIMARY);
      renderSistemasPicker("icons-sec-sys", ex, selected.secondary);
      renderSistemasPicker("icons-third-sys", ex, selected.tertiary);
    }
    function showAddMoreIfReady(){
      if(addMore) addMore.style.display = selected.secondary ? '' : 'none';
    }

    // Secundaria
    pick2?.addEventListener('click', e=>{
      const btn=e.target.closest('.sys-icon'); if(!btn) return;
      const sys=btn.dataset.sys; if(!hasPrices(sys)) return;
      selected.secondary = sys;
      selected.tertiary  = selected.tertiary === sys ? null : selected.tertiary;

      if (slot2 && slot2.id === 'calc-slot-2') { slot2.className='calc-container'; slot2.id='calc-secondary'; }

      if (window.CalculadoraContpaqi?.setSecondarySystem){
        window.CalculadoraContpaqi.setSecondarySystem(sys,{
          secondarySelector:'#calc-secondary',
          combinedSelector:'#combined-wrap',
          onCombined:renderCombinedTable
        });
      }
      refreshPickers();
      showAddMoreIfReady();
    });

    // Terciaria
    pick3?.addEventListener('click', e=>{
      const btn=e.target.closest('.sys-icon'); if(!btn) return;
      const sys=btn.dataset.sys; if(!hasPrices(sys)) return;
      if (sys === selected.secondary) return;
      selected.tertiary = sys;
      if (slot3) slot3.style.display='block';

      if (window.CalculadoraContpaqi?.setTertiarySystem){
        window.CalculadoraContpaqi.setTertiarySystem(sys,{
          tertiarySelector:'#calc-tertiary',
          combinedSelector:'#combined-wrap',
          onCombined:renderCombinedTable
        });
      }
      if(addMore) addMore.style.display='none';
      row.classList.add('has-three');
      refreshPickers();
    });

    if (window.CalculadoraContpaqi?.onCombinedSet){
      window.CalculadoraContpaqi.onCombinedSet(renderCombinedTable);
    }
  });
})();

/* =========================================================
   AutoCalcSwitcher — decide Nube vs Escritorio (legacy)
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
        const wrap = document.querySelector('#combined-wrap');
        const tbody = document.querySelector('#combined-table-body');
        if(!wrap || !tbody) return;
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

    render();

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

    if (hasNube){
      mountNube(sys); return;
    }
    if (hasDesk){
      const mount = '#calc-primary';
      const deskInit = (window.CalculadoraContpaqi && window.CalculadoraContpaqi.init)
        ? window.CalculadoraContpaqi.init
        : (function(){ console.warn('Fallback CalculadoraContpaqi.init no disponible'); return ()=>{}; })();

      document.body.setAttribute('data-calc','escritorio');
      deskInit({ systemName: sys, primarySelector: mount, combinedSelector: '#combined-wrap' });
      return;
    }

    const root = document.querySelector('#calc-primary');
    if (root) root.innerHTML = `<p class="hint">No hay tabla de Nube ni de Escritorio definida para “${sys}”.</p>`;
  });
})();

/* =========================================================
   Compactador + Unión “Instalación + Servicios (opcional)”
   ========================================================= */
(function () {
  function pickByLabel(container, regex){
    const labels = [...container.querySelectorAll('label')];
    const lb = labels.find(l => regex.test(l.textContent.trim().toLowerCase()));
    if (!lb) return null;
    return lb.closest('.field') || lb.closest('.row') || lb.closest('.instalacion-box') || lb.closest('.inst-wrap') || lb.parentElement;
  }
  function pickSelect(container, selectorList){
    for(const sel of selectorList){
      const el = container.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function compactar(container){
    if (!container) return;
    if (container.querySelector('.controls-grid')) {
      unirInstalacionServicios(container);
      return;
    }

    const bLic = pickByLabel(container, /^licencia/);
    const bTipo= pickByLabel(container, /^tipo/);
    const bUsu = pickByLabel(container, /^usuarios?/);

    let bInst = container.querySelector('.inst-wrap') || pickByLabel(container, /instalaci/);
    if (!bInst) {
      const anyChk = container.querySelector('input[type="checkbox"]');
      bInst = anyChk ? (anyChk.closest('.instalacion-box') || anyChk.closest('.field') || anyChk.parentElement) : null;
    }

    const bloques = [bLic, bTipo, bUsu, bInst].filter(Boolean);
    bloques.forEach(b => b.classList?.add('field'));
    if (!bLic || !bTipo || !bUsu || !bInst) return;

    const grid = document.createElement('div');
    grid.className = 'controls-grid';
    grid.append(bLic, bTipo, bUsu, bInst);
    container.insertBefore(grid, container.firstElementChild);

    unirInstalacionServicios(container);
  }

  function unirInstalacionServicios(container){
    if (!container) return;
    if (container.querySelector('.inst-wrap .instalacion-box')) return;

    const selInst = pickSelect(container, [
      'select#instalacion',
      'select[name*="instal"]',
      'select[data-field*="instal"]'
    ]);
    const selServ = pickSelect(container, [
      'select#servicios', 'select#ervicios',
      'select[name*="servi"]',
      'select[data-field*="servi"]'
    ]);

    if (!selInst || !selServ) return;
    if (selInst.closest('.instalacion-box') || selServ.closest('.instalacion-box')) return;

    let wrap = container.querySelector('.inst-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'inst-wrap';
      const form = selInst.closest('form') || container.querySelector('form') || container;
      form.appendChild(wrap);
    }
    const box = document.createElement('div');
    box.className = 'instalacion-box';

    const instLbl = (selInst.labels && selInst.labels[0]) ? selInst.labels[0] : null;
    const servLbl = (selServ.labels && selServ.labels[0]) ? selServ.labels[0] : null;

    if (instLbl) box.appendChild(instLbl);
    box.appendChild(selInst);
    if (servLbl) box.appendChild(servLbl);
    box.appendChild(selServ);

    wrap.appendChild(box);

    if (!wrap.querySelector('.inst-hint')) {
      const hint = document.createElement('small');
      hint.className = 'inst-hint';
      hint.textContent = 'Selecciona instalación y servicios en un solo paso.';
      wrap.appendChild(hint);
    }
  }

  const target = document.getElementById('calc-primary');
  if (!target) return;

  const tryCompact = () => {
    const container = document.querySelector('.calc-container') || target;
    compactar(container);
  };

  tryCompact();
  requestAnimationFrame(tryCompact);

  const mo = new MutationObserver(() => tryCompact());
  mo.observe(target, { childList:true, subtree:true });

  window.addEventListener('calc-recompute', tryCompact);
  window.addEventListener('calc-render', tryCompact);

  setTimeout(tryCompact, 500);
  setTimeout(tryCompact, 1200);
})();

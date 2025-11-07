/* =========================================================
   Expiriti - main.js (Personia) — Complemento a calculadora.js v13
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
     setTimeout(()=>{ track.scrollTo({ left: 0, behavior: 'auto' }); }, 50);

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
   Calculadora NUBE (refinada: usuarios/empleados extra, IVA y orden)
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
   Complementos calculadora ESCRITORIO:
   - Picker de 2º y 3º sistema
   - Resumen combinado
   Requiere: calculadora.js v13 (CalculadoraContpaqi.*)
   ========================================================= */
(function(){
  // Solo aplica a “Escritorio”
  document.addEventListener('DOMContentLoaded', function(){
    if (document.body.getAttribute('data-calc') !== 'escritorio') return;

    // Sistema primario (debe venir en #app[data-system])
    const app = document.getElementById('app');
    const PRIMARY = app?.dataset?.system?.trim();
    if (!PRIMARY) return;

    // Helpers seguros
    const moneyMX = new Intl.NumberFormat("es-MX", { style:"currency", currency:"MXN", maximumFractionDigits:0 });
    const fmt = v => moneyMX.format(Math.round(Number(v||0)));
    const hasPrices = name => !!(window.preciosContpaqi && window.preciosContpaqi[name]);

    // Catálogo visual (solo crea si no existe)
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

    // ----- Wiring DOM (IDs esperados por tu HTML) -----
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

      // Si el hueco es placeholder, cámbialo a contenedor
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

    // Primaria ya la monta AutoCalcSwitcher → solo aseguramos resumen combinado activo
    if (window.CalculadoraContpaqi?.onCombinedSet){
      // (si tu motor expone un setter opcional)
      window.CalculadoraContpaqi.onCombinedSet(renderCombinedTable);
    }
  });
})();

/* =========================================================
   AutoCalcSwitcher — decide Nube vs deja a Escritorio (legacy)
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
     
    // Render inmediato
    render();

    // Si alguien inyecta legacy en el mismo host, re-render Nube
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
      mountNube(sys);
      return;
    }

    if (hasDesk){
      const mount = '#calc-primary';
      const deskInit = (window.CalculadoraContpaqi && window.CalculadoraContpaqi.init)
        ? window.CalculadoraContpaqi.init
        : (function(){ console.warn('Fallback CalculadoraContpaqi.init no disponible'); return ()=>{}; })();

      document.body.setAttribute('data-calc','escritorio');
      deskInit({
        systemName: sys,
        primarySelector: mount,
        combinedSelector: '#combined-wrap'
      });
      return;
    }

    const root = document.querySelector('#calc-primary');
    if (root) root.innerHTML = `<p class="hint">No hay tabla de Nube ni de Escritorio definida para “${sys}”.</p>`;
  });
})();

(function () {
  // Intenta compactar cuando la calculadora ya pintó sus controles
  function compactar(container){
    if (!container) return;

    // Busca bloques por etiqueta
    const labels = [...container.querySelectorAll('label')];

    // Helpers para localizar el "bloque" de cada control (label + input/select)
    const pickBlock = (text) => {
      const lb = labels.find(l => l.textContent.trim().toLowerCase().startsWith(text));
      if (!lb) return null;
      // sube al contenedor inmediato del campo
      return lb.closest('.field') || lb.closest('.row') || lb.parentElement;
    };

    const bLic = pickBlock('licencia');
    const bTipo = pickBlock('tipo');               // "Tipo (RFC)"
    const bUsu  = pickBlock('usuarios');
    // instalación puede venir como checkbox con texto variable
    let bInst = null;
    const instLabel = labels.find(l => /instalaci/i.test(l.textContent));
    if (instLabel){
      bInst = instLabel.closest('.instalacion-box') || instLabel.closest('.field') || instLabel.parentElement;
      // marca para estilos
      if (bInst && !bInst.classList.contains('instalacion-box')) bInst.classList.add('instalacion-box');
    } else {
      // algunos builds lo ponen como div con checkbox sin label formal
      const chk = container.querySelector('input[type="checkbox"]');
      if (chk) bInst = chk.closest('.instalacion-box') || chk.closest('.field') || chk.parentElement;
      if (bInst && !bInst.classList.contains('instalacion-box')) bInst.classList.add('instalacion-box');
    }

    // Si no hay todos los bloques clave, sal
    if (!(bLic && bTipo && bUsu && bInst)) return;

    // Evita duplicar si ya existe el grid
    if (container.querySelector('.controls-grid')) return;

    // Crea el grid y mete los bloques en orden
    const grid = document.createElement('div');
    grid.className = 'controls-grid';

    // Asegura clase .field a cada bloque para consistencia
    [bLic,bTipo,bUsu].forEach(b => b.classList.add('field'));

    grid.append(bLic);
    grid.append(bTipo);
    grid.append(bUsu);
    grid.append(bInst);

    // Inserta el grid al inicio del contenedor
    const first = container.firstElementChild;
    container.insertBefore(grid, first);
  }

  // Observa el render inicial (calculadora.js inyecta async)
  const target = document.getElementById('calc-primary');
  if (!target) return;

  const tryCompact = () => compactar(target);

  // 1) Intento inmediato + 2) en el siguiente frame
  tryCompact();
  requestAnimationFrame(tryCompact);

  // 3) Observa cambios por si la UI se vuelve a re-renderizar
  const mo = new MutationObserver(() => tryCompact());
  mo.observe(target, { childList:true, subtree:true });

  // 4) Si tu calculadora emite eventos, reaplica
  window.addEventListener('calc-recompute', tryCompact);
  window.addEventListener('calc-render', tryCompact);
})();



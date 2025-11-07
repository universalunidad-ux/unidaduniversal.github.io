<!-- Asegúrate de cargar primero tu tabla de precios -->
<script>
/* ====== EJEMPLOS DE ESTRUCTURA (solo guía, puedes borrar este bloque si ya lo tienes) ======
window.preciosContpaqi = {
  "CONTPAQi Personia": {
    nube: {
      // extras globales opcionales
      usuario_adicional: 199,             // $/usuario extra para planes con usuarios_incluidos numérico
      espacio_adicional: { "50 GB": 99, "100 GB": 149 }, // opcional
      // cada plan como objeto:
      "Básico":  { precio_base: 699,  usuarios_incluidos: 1,   empleados_incluidos: 50,  empleado_adicional: 3 },
      "Pro":     { precio_base: 1199, usuarios_incluidos: 3,   empleados_incluidos: 200, empleado_adicional: 2 },
      "Multi":   { precio_base: 1999, usuarios_incluidos: "multi" } // “multi” oculta el input de usuarios
    }
  },
  "CONTPAQi Contabilidad": {
    escritorio: {
      // Estructura flexible: el motor intenta adaptarse
      // Opción A: planes “anual” y/o “tradicional”
      anual: {
        base: 9990,                        // precio base
        rfc: { MonoRFC: 0, MultiRFC: 3500 }, // sobreprecio por tipo RFC (opcional)
        usuarios_incluidos: 1,             // opcional (si hay usuarios)
        usuario_adicional: 2500,           // opcional
        paquetes_usuarios: [1, 2, 3, 5, 10]// opcional (si prefieres select en vez de number)
      },
      tradicional: {
        base: 15990,
        rfc: { MonoRFC: 0, MultiRFC: 3500 },
        usuarios_incluidos: 1,
        usuario_adicional: 2500,
        paquetes_usuarios: [1, 2, 3, 5, 10]
      }
      // Opción B: si además manejas “operación” (actualización/especial, etc) añade:
      // operaciones: { "nueva": 0, "actualización": -3000, "especial": -2000 }
    }
  }
};
*/
</script>

<script>
/* =========================================================
   Expiriti - main.js (Personia)
   ========================================================= */

/* ---------- Utilidades ---------- */
(function(){
  const money = new Intl.NumberFormat("es-MX", { style:"currency", currency:"MXN", maximumFractionDigits:0 });
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
   Calculadora NUBE
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
   Calculadora ESCRITORIO (genérica y tolerante a esquema)
   ========================================================= */
const CalculadoraContpaqi = (function(){

  // ——— Lectores tolerantes de esquema ———
  function getDeskDB(sysName){
    return window.preciosContpaqi?.[sysName]?.escritorio || null;
  }
  function listLicencias(db){
    // soporta “anual”, “tradicional” u otras claves-objeto
    return Object.keys(db).filter(k => typeof db[k]==='object' && k!=='operaciones');
  }
  function getOperaciones(db){
    // opcional: descuentos/sobrecargos por tipo de operación
    return db.operaciones || null; // p.ej. { nueva:0, actualización:-3000, especial:-2000 }
  }
  function licenciaInfo(db, lic){ return db?.[lic] || {}; }
  function hasRFC(info){ return info?.rfc && typeof info.rfc==='object'; }
  function rfcTipos(info){ return hasRFC(info) ? Object.keys(info.rfc) : []; }
  function rfcAjuste(info, tipo){ return hasRFC(info) ? Number(info.rfc[tipo]||0) : 0; }
  function basePrecio(info){ return Number(info.base || info.precio_base || 0); }
  function usuariosIncluidos(info){ return Number.isFinite(info.usuarios_incluidos) ? Number(info.usuarios_incluidos) : null; }
  function usuarioAdicional(info){ return Number(info.usuario_adicional || 0); }
  function paquetesUsuarios(info){ return Array.isArray(info.paquetes_usuarios) ? info.paquetes_usuarios : null; }

  // ——— UI ———
  function buildUI(root){
    root.innerHTML = `
      <h4 style="margin:0 0 8px">Calcula tu licencia de escritorio</h4>
      <div class="grid-nube" style="grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:10px">
        <div>
          <label class="control-label">Licencia</label>
          <select id="desk-lic"></select>
        </div>
        <div id="desk-op-wrap" style="display:none">
          <label class="control-label">Operación</label>
          <select id="desk-op"></select>
        </div>
        <div id="desk-rfc-wrap" style="display:none">
          <label class="control-label">Tipo RFC</label>
          <select id="desk-rfc"></select>
        </div>
        <div id="desk-users-wrap" style="display:none">
          <label class="control-label">Usuarios</label>
          <span id="desk-users-slot"></span>
          <small class="hint" id="desk-users-hint"></small>
        </div>
      </div>

      <table class="calc-nube-table" id="desk-table">
        <thead><tr><th>Concepto</th><th style="text-align:right">Importe</th></tr></thead>
        <tbody id="desk-tbody"></tbody>
        <tfoot><tr><td style="font-weight:700">Total</td><td id="desk-total" style="text-align:right;font-weight:700"></td></tr></tfoot>
      </table>
    `;
  }

  function init({ systemName, primarySelector = '#calc-primary', combinedSelector = null }){
    const root = document.querySelector(primarySelector);
    if(!root) { console.warn('calc-escritorio: no mount target'); return; }

    const db = getDeskDB(systemName);
    if(!db){ root.innerHTML='<p class="hint">No hay tabla de escritorio para este sistema.</p>'; return; }

    buildUI(root);
    const $ = (sel, ctx=root)=> (ctx||root).querySelector(sel);
    const mxn = window.$$fmt;

    const selLic  = $('#desk-lic');
    const opWrap  = $('#desk-op-wrap');
    const selOp   = $('#desk-op');
    const rfcWrap = $('#desk-rfc-wrap');
    const selRFC  = $('#desk-rfc');
    const usersWrap = $('#desk-users-wrap');
    const usersSlot = $('#desk-users-slot');
    const usersHint = $('#desk-users-hint');

    const ops = getOperaciones(db);
    const licencias = listLicencias(db);

    // Estado
    const state = { lic: licencias[0]||null, op: null, rfc: null, usuarios: null };

    // Poblar licencias
    licencias.forEach(l=>{
      const o=document.createElement('option');
      o.value=l; o.textContent = l[0].toUpperCase()+l.slice(1);
      selLic.appendChild(o);
    });
    state.lic = selLic.value;

    // Poblar operaciones (opcional)
    if (ops && Object.keys(ops).length){
      opWrap.style.display='';
      Object.keys(ops).forEach(k=>{
        const o=document.createElement('option');
        o.value=k; o.textContent=k[0].toUpperCase()+k.slice(1);
        selOp.appendChild(o);
      });
      state.op = selOp.value;
    } else {
      opWrap.style.display='none';
      state.op = null;
    }

    function syncRFCandUsers(){
      // RFC
      const info = licenciaInfo(db, state.lic);
      const tipos = rfcTipos(info);
      selRFC.innerHTML='';
      if (tipos.length){
        rfcWrap.style.display='';
        tipos.forEach(t=>{
          const o=document.createElement('option');
          o.value=t; o.textContent=t;
          selRFC.appendChild(o);
        });
        if (!tipos.includes(state.rfc)) state.rfc = selRFC.value;
      } else {
        rfcWrap.style.display='none';
        state.rfc = null;
      }

      // Usuarios
      usersSlot.innerHTML='';
      const inc = usuariosIncluidos(info);
      const extra = usuarioAdicional(info);
      const packs = paquetesUsuarios(info);

      if (inc!=null || packs){
        usersWrap.style.display='';
        if (packs && packs.length){
          const sel = document.createElement('select');
          packs.forEach(n=>{
            const o=document.createElement('option');
            o.value=String(n); o.textContent=String(n);
            sel.appendChild(o);
          });
          // default al incluído si existe, sino al primero
          const def = inc!=null && packs.includes(inc) ? inc : packs[0];
          sel.value = String(def);
          state.usuarios = def;
          sel.addEventListener('change',()=>{ state.usuarios = parseInt(sel.value,10)||def; recalc(); });
          usersSlot.appendChild(sel);
          usersHint.textContent = inc!=null
            ? `Incluye ${inc}. Usuario adicional: ${extra? mxn(extra):'–'}.`
            : `Paquetes disponibles. Usuario adicional: ${extra? mxn(extra):'–'}.`;
        } else {
          // number input
          const inp=document.createElement('input');
          inp.type='number'; inp.min='1'; inp.step='1';
          const def = inc!=null ? inc : 1;
          state.usuarios = def;
          inp.value = String(def);
          inp.addEventListener('input',()=>{ const v=parseInt(inp.value||0,10); state.usuarios=Math.max(1,v||1); recalc(); });
          usersSlot.appendChild(inp);
          usersHint.textContent = inc!=null
            ? `Incluye ${inc}. Usuario adicional: ${extra? mxn(extra):'–'}.`
            : `Define el número de usuarios. Usuario adicional: ${extra? mxn(extra):'–'}.`;
        }
      } else {
        usersWrap.style.display='none';
        state.usuarios = null;
      }
    }

    const tbody = $('#desk-tbody');
    const totalEl = $('#desk-total');

    function recalc(){
      const info = licenciaInfo(db, state.lic);
      const rows = [];
      let total = 0;

      // base
      const base = basePrecio(info);
      rows.push([`Licencia ${state.lic}`, mxn(base)]);
      total += base;

      // operación (descuento/sobrecargo)
      if (state.op && ops && (state.op in ops)){
        const adj = Number(ops[state.op]||0);
        if (adj!==0){
          rows.push([`Operación: ${state.op}`, (adj>0? '+':'')+mxn(adj)]);
          total += adj;
        }
      }

      // RFC
      if (state.rfc){
        const rfcAdj = rfcAjuste(info, state.rfc);
        if (rfcAdj!==0){
          rows.push([`Tipo RFC: ${state.rfc}`, (rfcAdj>0? '+':'') + mxn(rfcAdj)]);
          total += rfcAdj;
        } else {
          rows.push([`Tipo RFC: ${state.rfc}`, mxn(0)]);
        }
      }

      // Usuarios extra
      const inc = usuariosIncluidos(info);
      const uAd = usuarioAdicional(info);
      if (inc!=null && state.usuarios!=null && uAd>0){
        const extra = Math.max(0, Number(state.usuarios) - inc);
        if (extra>0){
          rows.push([`Usuarios adicionales (${extra})`, mxn(extra*uAd)]);
          total += extra*uAd;
        }
      }

      // Pintar
      tbody.innerHTML='';
      rows.forEach(([c,v])=>{
        const tr=document.createElement('tr');
        const td1=document.createElement('td'); td1.textContent=c;
        const td2=document.createElement('td'); td2.textContent=v; td2.style.textAlign='right';
        tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
      });
      totalEl.textContent = mxn(total);

      // combinado (si lo usas)
      if (combinedSelector){
        const wrap = document.querySelector(combinedSelector);
        const tbd  = document.getElementById('combined-table-body');
        if (wrap && tbd){
          tbd.innerHTML='';
          const tr=document.createElement('tr');
          const td1=document.createElement('td'); td1.textContent = `${systemName} — ${state.lic}${state.rfc? ' ('+state.rfc+')':''}`;
          const td2=document.createElement('td'); td2.textContent = mxn(total); td2.style.textAlign='right';
          tr.appendChild(td1); tr.appendChild(td2); tbd.appendChild(tr);
          wrap.hidden=false;
        }
      }
    }

    // eventos
    selLic.addEventListener('change', ()=>{ state.lic = selLic.value; syncRFCandUsers(); recalc(); });
    selOp?.addEventListener('change', ()=>{ state.op = selOp.value; recalc(); });
    selRFC?.addEventListener('change', ()=>{ state.rfc = selRFC.value; recalc(); });

    syncRFCandUsers();
    recalc();

    return { recalc };
  }

  return { init };
})();

/* =========================================================
   AutoCalcSwitcher: detecta sistema y decide Nube vs Escritorio
   ========================================================= */
(function(){
  function detectSystemName(){
    // a) cualquier nodo con data-system
    const node = document.querySelector('[data-system]');
    if (node?.dataset?.system) return node.dataset.system.trim();

    // b) #app con data-system
    const app = document.getElementById('app');
    if (app?.dataset?.system) return app.dataset.system.trim();

    // c) h1 “CONTPAQi …”
    const h1 = document.querySelector('h1');
    if (h1?.textContent && /CONTPAQi\s+/i.test(h1.textContent)) return h1.textContent.trim();

    // d) title
    const t = document.title || '';
    const m = t.match(/CONTPAQi\s+[^\|]+/i);
    if (m) return m[0].trim();

    return null;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const sys = detectSystemName();
    if(!sys){ console.warn('AutoCalcSwitcher: no pude detectar el sistema.'); return; }

    const hasNube = !!window.preciosContpaqi?.[sys]?.nube;
    const hasDesk = !!window.preciosContpaqi?.[sys]?.escritorio;

    // Señal al CSS para mostrar/ocultar bloques si quieres
    document.body.setAttribute('data-calc', hasNube ? 'nube' : 'escritorio');

    const mount = '#calc-primary';

    if (hasNube){
      CalculadoraNube.init({
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
      return;
    }
    if (hasDesk){
      CalculadoraContpaqi.init({
        systemName: sys,
        primarySelector: mount,
        combinedSelector: '#combined-wrap'
      });
      return;
    }

    // Si no hay nada:
    const root = document.querySelector(mount);
    if (root) root.innerHTML = `<p class="hint">No hay tabla de Nube ni de Escritorio definida para “${sys}”.</p>`;
  });
})();
</script>

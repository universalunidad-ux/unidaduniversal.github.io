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

document.querySelectorAll(".carousel:not(#carouselReels)").forEach(car=>{

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

// Carrusel Reels (scoped)
(function(){
  const root = document.getElementById('carouselReels');
  if(!root) return;

  const scope = root.closest('aside') || root; // títulos solo de este bloque
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

    // cada slide mide el ancho visible del track
    const slideWidth = track.clientWidth;
    track.scrollTo({ left: slideWidth * idx, behavior: 'smooth' });
  }

  dots.forEach((d,i)=>d.addEventListener('click',()=>setActive(i)));
  prev?.addEventListener('click',()=>setActive(idx-1));
  next?.addEventListener('click',()=>setActive(idx+1));

  // Mantén títulos y dots sincronizados al hacer scroll manual
  track.addEventListener('scroll',()=>{
    const w = track.clientWidth || 1;
    const i = Math.round(track.scrollLeft / w);
    if(i !== idx && i >= 0 && i < dots.length){
      idx = i;
      dots.forEach((d,di)=>d.classList.toggle('active', di===idx));
      reelTitles.forEach((t,ti)=>t.classList.toggle('active', ti===idx));
    }
  });

  // Recalcula posición al cambiar el ancho (móvil/desktop)
  window.addEventListener('resize',()=>setActive(idx));

  setActive(0);
})();

// 🎬 Control global: pausa otros videos al reproducir uno
(function(){
  // Carga la API de YouTube solo una vez
  if(!window.YT){
    const tag=document.createElement('script');
    tag.src="https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  let players=[];

  // Cuando la API esté lista
  window.onYouTubeIframeAPIReady = function(){
    document.querySelectorAll('iframe[src*="youtube"]').forEach((el)=>{
      try{
        const p=new YT.Player(el,{
          events:{
            'onStateChange':(e)=>{
              if(e.data===1){ // 1 = PLAYING
                // pausa todos los demás
                players.forEach(pl=>{ if(pl!==p) pl.pauseVideo(); });
              }
            }
          }
        });
        players.push(p);
      }catch(err){}
    });
  };
})();
/* ===== Adaptador de calculadoras (Escritorio vs Nube) ===== */

(function(){
  if (!window.preciosContpaqi) return;

  // Detecta si un sistema es de NUBE (true) o ESCRITORIO (false)
  function isNubeSystem(sysName){
    const db = window.preciosContpaqi[sysName];
    return !!(db && db.nube);
  }

  // === Calculadora Nube (ligera y extensible)
  //   - Lee planes desde preciosContpaqi[sys].nube
  //   - Maneja extras: usuario_adicional, empleado_adicional (si aplica), espacio_adicional (select si existe)
  //   - Emite un resumen simple para integrar a tu "combined"
  const CalculadoraNube = {
    init({ systemName, mountSelector = '#calc-primary', onCombined = null, combinedSelector = null }){
      const root = document.querySelector(mountSelector);
      if(!root) return console.warn('calc-nube: no mount target');

      const db = (window.preciosContpaqi[systemName] || {}).nube || null;
      if(!db) return console.warn('calc-nube: no price table for', systemName);

      // Armar lista de planes (excluye llaves de add-ons globales)
      const addOnGlobalKeys = new Set(['usuario_adicional', 'xml_historicos', 'espacio_adicional']);
      const PLANES = Object.keys(db).filter(k => typeof db[k] === 'object' && !addOnGlobalKeys.has(k));

      // Estado
      const state = {
        plan: PLANES[0] || null,
        usuarios: null,       // si el plan incluye número: default a incluidos; si "multi" => oculto
        empleados: null,      // si el plan define empleados_incluidos
        espacioExtra: null    // si existe espacio_adicional (p.ej. Despachos)
      };

      // Helpers
      const mxn = new Intl.NumberFormat("es-MX",{ style:"currency", currency:"MXN", maximumFractionDigits:0 });
      const $ = (sel, ctx=root)=> (ctx||root).querySelector(sel);

      function planInfo(){
        return db[state.plan] || {};
      }
      function includedUsers(){
        return planInfo().usuarios_incluidos;
      }
      function includedEmployees(){
        return planInfo().empleados_incluidos;
      }
      function empleadoAdic(){
        // puede variar por plan (Evalúa / Personia tienen precio por plan)
        return Number(planInfo().empleado_adicional || 0);
      }
      function usuarioAdic(){
        // suele venir como root (Despachos/Contabiliza/Vende)
        return Number(db.usuario_adicional || 0);
      }

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
            <small class="hint">Costo único mensual según tamaño.</small>
          </div>
        </div>

        <table class="calc-nube-table">
          <thead><tr><th>Concepto</th><th style="text-align:right">Importe</th></tr></thead>
          <tbody id="nube-tbody"></tbody>
          <tfoot><tr><td style="font-weight:700">Total</td><td id="nube-total" style="text-align:right;font-weight:700"></td></tr></tfoot>
        </table>
      `;

      // Poblado de selects
      const selPlan = $('#nube-plan');
      PLANES.forEach(p=>{
        const opt=document.createElement('option');
        opt.value=p; opt.textContent=p;
        selPlan.appendChild(opt);
      });
      state.plan = selPlan.value;

      // Espacio adicional (si existe)
      const espacioWrap = $('#nube-espacio-wrap');
      const selEspacio = $('#nube-espacio');
      if (db.espacio_adicional && typeof db.espacio_adicional === 'object'){
        espacioWrap.style.display = '';
        selEspacio.innerHTML = `<option value="">Sin extra</option>`;
        Object.keys(db.espacio_adicional).forEach(k=>{
          const opt=document.createElement('option');
          opt.value=k; opt.textContent = `${k} (+${mxn.format(db.espacio_adicional[k])})`;
          selEspacio.appendChild(opt);
        });
      }

      // Mostrar/ocultar inputs según plan
      function syncInputs(){
        const incU = includedUsers();
        const incE = includedEmployees();

        // Usuarios
        const $uwrap = $('#nube-usuarios-wrap'), $u = $('#nube-usuarios'), $uh = $('#nube-usuarios-hint');
        if (typeof incU === 'number'){
          $uwrap.style.display = '';
          if (state.usuarios == null) state.usuarios = incU;
          $u.value = state.usuarios;
          $uh.textContent = `Incluye ${incU} usuario(s). Usuario adicional: ${usuarioAdic() ? mxn.format(usuarioAdic()) : '–'}.`;
        } else {
          // "multi" u omitido
          $uwrap.style.display = 'none';
          state.usuarios = null;
        }

        // Empleados
        const $ewrap = $('#nube-empleados-wrap'), $e = $('#nube-empleados'), $eh = $('#nube-empleados-hint');
        if (typeof incE === 'number'){
          $ewrap.style.display = '';
          if (state.empleados == null || state.empleados < incE) state.empleados = incE;
          $e.value = state.empleados;
          const ea = empleadoAdic();
          $eh.textContent = `Incluye ${incE} empleados. Empleado adicional: ${ea? mxn.format(ea): '–'}.`;
        } else {
          $ewrap.style.display = 'none';
          state.empleados = null;
        }
      }

      // Cálculo
      const tbody = $('#nube-tbody');
      const totalEl = $('#nube-total');

      function recalc(){
        const p = planInfo();
        const rows = [];
        let total = 0;

        // Base del plan
        const base = Number(p.precio_base || 0);
        rows.push(['Plan '+state.plan, mxn.format(base)]);
        total += base;

        // Usuarios adicionales (si aplica)
        if (typeof includedUsers() === 'number'){
          const inc = includedUsers();
          const want = Math.max(inc, Number(state.usuarios || inc));
          const extra = Math.max(0, want - inc);
          const uAdic = usuarioAdic();
          if (extra > 0 && uAdic > 0){
            rows.push([`Usuarios adicionales (${extra})`, mxn.format(extra * uAdic)]);
            total += extra * uAdic;
          }
        }

        // Empleados adicionales (si aplica)
        if (typeof includedEmployees() === 'number'){
          const inc = includedEmployees();
          const want = Math.max(inc, Number(state.empleados || inc));
          const extra = Math.max(0, want - inc);
          const eAdic = empleadoAdic();
          if (extra > 0 && eAdic > 0){
            rows.push([`Empleados adicionales (${extra})`, mxn.format(extra * eAdic)]);
            total += extra * eAdic;
          }
        }

        // Espacio adicional (si aplica)
        if (selEspacio && selEspacio.value){
          const precioEsp = Number((db.espacio_adicional||{})[selEspacio.value] || 0);
          if (precioEsp > 0){
            rows.push([`Espacio adicional (${selEspacio.value})`, mxn.format(precioEsp)]);
            total += precioEsp;
          }
        }

        // Pintar tabla
        tbody.innerHTML = '';
        rows.forEach(([c, v])=>{
          const tr=document.createElement('tr');
          const td1=document.createElement('td'); td1.textContent=c;
          const td2=document.createElement('td'); td2.textContent=v; td2.style.textAlign='right';
          tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
        });
        totalEl.textContent = mxn.format(total);

        // Hook al combinado (si lo usas)
        if (onCombined && combinedSelector){
          onCombined([
            [`${systemName} — ${state.plan}`, mxn.format(total)]
          ]);
        }
      }

      // Eventos
      selPlan.addEventListener('change', ()=>{
        state.plan = selPlan.value;
        // reset inputs para nuevo plan
        state.usuarios = null;
        state.empleados = null;
        syncInputs(); recalc();
      });

      $('#nube-usuarios')?.addEventListener('input', e=>{
        const v = parseInt(e.target.value||0,10);
        state.usuarios = Math.max(1, v||1);
        recalc();
      });
      $('#nube-empleados')?.addEventListener('input', e=>{
        const v = parseInt(e.target.value||0,10);
        state.empleados = Math.max(0, v||0);
        recalc();
      });
      selEspacio?.addEventListener('change', ()=>{ recalc(); });

      // boot
      syncInputs(); recalc();

      // Exponer por si quieres usarla fuera
      return { recalc };
    }
  };

  // === Inicializador automático (en tu HTML ya usas #app + data-system)
  document.addEventListener('DOMContentLoaded', ()=>{
    const app = document.getElementById('app');
    if(!app) return;
    const sys = app.dataset.system;
    if(!sys) return;
    const isNube = isNubeSystem(sys);

    // Nota: en Personia tienes ocultos los contenedores de la calc de escritorio.
    // Para nube, montamos en #calc-primary igualmente (no está oculto por las reglas nube que agregaremos).
    if (isNube){
      CalculadoraNube.init({
        systemName: sys,
        mountSelector: '#calc-primary',
        combinedSelector: '#combined-wrap',
        onCombined: (rows)=>{ // opcional: render en tu resumen
          const tbody=document.getElementById('combined-table-body');
          const wrap=document.getElementById('combined-wrap');
          if(!tbody||!wrap) return;
          tbody.innerHTML='';
          rows.forEach(([c, v])=>{
            const tr=document.createElement('tr');
            const td1=document.createElement('td'); td1.textContent=c;
            const td2=document.createElement('td'); td2.textContent=v; td2.style.textAlign='right';
            tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
          });
          wrap.hidden=false;
        }
      });
    } else {
      // Escritorio: usa tu motor existente
      if(!window.CalculadoraContpaqi){
        console.error('❌ calculadora.js (escritorio) no cargó.');
        return;
      }
      window.CalculadoraContpaqi.init({
        systemName: sys,
        primarySelector:'#calc-primary',
        combinedSelector:'#combined-wrap'
      });
    }
  });

  // Exponer por si lo requieres manualmente
  window.CalculadoraNube = CalculadoraNube;
})();


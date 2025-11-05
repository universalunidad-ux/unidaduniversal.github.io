/* ========= Hotfix Nov-04 ========= */
(function () {
  'use strict';

  // ===== 1) Carruseles: bloquear scroll con rueda/touch y solo flechas/puntos =====
  function lockScroll(el){
    if(!el) return;
    el.addEventListener('wheel', e => e.preventDefault(), { passive:false });
    el.addEventListener('touchmove', e => e.preventDefault(), { passive:false });
  }
  document.querySelectorAll('.carousel-track, .listTrack, .reels-track').forEach(lockScroll);

  // Sincronizar "puntos" activos cuando uses tus funciones de flechas
  function activateDot(trackSel, dotsSel){
    const track = document.querySelector(trackSel);
    const dots  = document.querySelectorAll(dotsSel+' button');
    if(!track || !dots.length) return;
    let index = +track.getAttribute('data-index') || 0;
    dots.forEach((b,i)=> b.classList.toggle('is-active', i===index));
    dots.forEach((b,i)=> b.onclick = () => {
      track.setAttribute('data-index', i);
      track.dispatchEvent(new CustomEvent('go-to',{detail:{index:i}}));
      activateDot(trackSel, dotsSel);
    });
  }
  // Llama esto si usas selectores diferentes:
  activateDot('.carousel-track', '.carousel-dots');
  activateDot('.listTrack', '.listDots');

  // ===== 2) “Sistemas que complementan”: abrir en nueva pestaña y validar existencia =====
  const cards = document.querySelectorAll('.sistemas-card');
  cards.forEach(card => {
    const a = card.querySelector('a[href]');
    if(a){
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      // Clic sobre toda la tarjeta
      card.addEventListener('click', (e)=>{
        const isLink = e.target.closest('a');
        if(!isLink) a.click();
      });
    }
  });

  // Auditoría rápida: valida que las páginas de sistemas existan (HEAD)
  (async function auditSistemas(){
    const links = [...document.querySelectorAll('.sistemas-card a[href]')].map(a=>a.href);
    const unique = [...new Set(links)];
    const missing = [];
    for(const url of unique){
      try{
        const res = await fetch(url, { method:'HEAD', mode:'no-cors' });
        // modo no-cors no da status confiable; si quieres ver exacto, quita no-cors en tu dominio
      }catch(e){
        missing.push(url);
      }
    }
    if(missing.length){
      console.warn('Páginas faltantes en “Sistemas que complementan”:', missing);
    }
  })();

  // ===== 3) Videos verticales de Start/Pro -> layout horizontal =====
  // Si tus contenedores no tienen .video-grid, los envolvemos sin romper
  document.querySelectorAll('[data-video-grid]').forEach(cont => {
    if(!cont.classList.contains('video-grid')) cont.classList.add('video-grid');
    cont.querySelectorAll('iframe, video').forEach(v => {
      if(!v.parentElement.classList.contains('video')){
        const wrap = document.createElement('div');
        wrap.className = 'video';
        v.parentElement.insertBefore(wrap, v);
        wrap.appendChild(v);
      }
    });
  });

  // ===== 4) Calculadora: compactar espacios, mantener formato pantalla =====
  const calc = document.querySelector('.calc-wrap');
  if(calc){
    // Mantener visible/responsive sin saltos
    calc.style.minHeight = 'min(90vh, 1100px)';
  }

  // ===== 5) FAQs: “flashear” algunas y bloquear cierre de otras =====
  const FLASH_FAQS = [
    'Nóminas','XML en línea','Analiza','Factura E','Contabiliza','Personia','Despachos','Evalua','Evalúa'
  ];
  const LOCK_FAQS = [
    'Bancos','Cstart','COMERCIAL START','Start','Premium','Pro','Colabora'
  ];
  document.querySelectorAll('details.faq-item, details.faq').forEach(det=>{
    const text = (det.querySelector('summary')?.textContent || '').trim();
    if(FLASH_FAQS.some(name => text.toLowerCase().includes(name.toLowerCase()))){
      det.classList.add('flash');
      // Destacar abriendo y cerrando una vez (sin parpadeo agresivo)
      det.open = true;
      setTimeout(()=>{ det.open = false; }, 700);
      setTimeout(()=>{ det.open = true; }, 1050);
    }
    if(LOCK_FAQS.some(name => text.toLowerCase().includes(name.toLowerCase()))){
      det.classList.add('faq-lock');
      det.open = true;
      det.addEventListener('toggle', ()=>{
        if(!det.open) det.open = true; // reabrir si intentan cerrarlo
      });
      const sum = det.querySelector('summary');
      if(sum){
        sum.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); });
      }
    }
  });

  // ===== 6) Precios: agregar “Analiza” y checar “precios nube” =====
  // Si tienes tu objeto de precios global, intenta inyectar “Analiza” si no existe
  if(window.PRECIOS && !window.PRECIOS.Analiza){
    window.PRECIOS.Analiza = {
      anual: 0, tradicional: 0, nube: 0, // coloca aquí tus valores reales
      notas: 'Completar valores y descuentos según tu lista oficial.'
    };
    console.info('Se añadió PRECIOS.Analiza como placeholder. Actualiza montos reales.');
  }

  // Verificar nube (si estructura conocida)
  if(window.PRECIOS){
    const nubeInvalidos = Object.entries(window.PRECIOS)
      .filter(([k,v]) => v && typeof v.nube !== 'number')
      .map(([k]) => k);
    if(nubeInvalidos.length){
      console.warn('Sistemas con precio nube inválido o faltante:', nubeInvalidos);
    }
  }

})();

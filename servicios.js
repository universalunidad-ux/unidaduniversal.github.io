<script>
// =========================================================
// Expiriti — Servicios (Soporte): JS específico de la página
// Requiere utilidades base del sitio (si las tienes) pero funciona standalone
// =========================================================

(function(){
  // ---------- Año en footer ----------
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---------- Menú móvil ----------
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu){
    burger.addEventListener('click', ()=> mobileMenu.classList.toggle('open'));
  }

  // ---------- TOC (Mapa flotante) ----------
  (function(){
    const toc = document.getElementById('toc');
    if(!toc) return;
    const openBtn = document.getElementById('tocToggle');
    const closeBtn = toc.querySelector('.toc-close');
    if(!openBtn || !closeBtn) return;

    openBtn.addEventListener('click', e=>{ e.stopPropagation(); toc.classList.toggle('collapsed'); });
    closeBtn.addEventListener('click', ()=> toc.classList.add('collapsed'));
    toc.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=> toc.classList.add('collapsed')));
    document.addEventListener('click', e=>{
      if(!toc.contains(e.target) && e.target !== openBtn) toc.classList.add('collapsed');
    });
  })();

  // ---------- Galería portada (carousel simple) ----------
  (function(){
    const root = document.getElementById('carousel1');
    if(!root) return;
    const track = root.querySelector('.carousel-track');
    const dots  = [...root.querySelectorAll('.dot')];
    const prev  = root.querySelector('.arrowCircle.prev');
    const next  = root.querySelector('.arrowCircle.next');
    let idx = 0;

    function setActive(i){
      if (!track || !dots.length) return;
      idx = (i + dots.length) % dots.length;
      dots.forEach((d,di)=>d.classList.toggle('active', di===idx));
      track.scrollTo({ left: track.clientWidth * idx, behavior:'smooth' });
    }
    dots.forEach((d,i)=> d.addEventListener('click', ()=> setActive(i)));
    prev?.addEventListener('click', ()=> setActive(idx-1));
    next?.addEventListener('click', ()=> setActive(idx+1));
    track?.addEventListener('scroll', ()=>{
      const i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((d,di)=> d.classList.toggle('active', di===i));
      idx = i;
    });
    window.addEventListener('resize', ()=> setActive(idx));
    setActive(0);
  })();

  // ---------- Slider “¿Por qué elegirnos?” (por páginas) ----------
  (function(){
    const wrap  = document.querySelector('#beneficios .listSlider');
    if(!wrap) return;
    const track = wrap.querySelector('.listTrack');
    const prev  = wrap.querySelector('.prev');
    const next  = wrap.querySelector('.next');
    if(!track || !prev || !next) return;

    let page = 0;
    const total = track.children.length;
    function go(i){
      page = (i + total) % total;
      track.scrollTo({ left: wrap.clientWidth * page, behavior:'smooth' });
    }
    prev.addEventListener('click', ()=> go(page-1));
    next.addEventListener('click', ()=> go(page+1));
    window.addEventListener('resize', ()=> go(page));
  })();

  // ---------- Carrusel de sistemas (grid horizontal reusables) ----------
  (function(){
    document.querySelectorAll('.carouselX').forEach(root=>{
      const track = root.querySelector('.track');
      const prev  = root.querySelector('.arrowCircle.prev');
      const next  = root.querySelector('.arrowCircle.next');
      const dotsWrap = root.querySelector('.group-dots');
      if(!track) return;

      const items = track.querySelectorAll('.sys');
      let itemsPerPage = 3;

      const updateItemsPerPage = () => {
        if (window.innerWidth <= 680) itemsPerPage = 1;
        else if (window.innerWidth <= 980) itemsPerPage = 2;
        else itemsPerPage = 3;
      };
      updateItemsPerPage();

      function groupsCount(){ return Math.max(1, Math.ceil(items.length / itemsPerPage)); }
      function groupW(){ return track.clientWidth / itemsPerPage * Math.min(items.length, itemsPerPage); }

      function getScrollAmount(i){
        if (itemsPerPage === 1) return items[i].offsetLeft - (track.clientWidth - items[i].clientWidth) / 2;
        return i * groupW();
      }

      function updateCarouselStyles(){
        items.forEach(item => {
          item.style.flexBasis = `calc((100% - ${12 * (itemsPerPage - 1)}px) / ${itemsPerPage})`;
        });
      }
      updateCarouselStyles();

      const showControls = groupsCount() > 1;
      if (prev) prev.style.display = showControls ? '' : 'none';
      if (next) next.style.display = showControls ? '' : 'none';
      if (dotsWrap) dotsWrap.style.display = showControls ? '' : 'none';
      if (!showControls) return;

      function setDot(i){ dots.forEach((d,idx)=> d.classList.toggle('active', idx===i)); }
      function goTo(i){
        track.scrollTo({ left: getScrollAmount(i), behavior:'smooth' });
        setDot(i);
      }

      dotsWrap.innerHTML = '';
      const dots = Array.from({length: groupsCount()}, (_,i)=>{
        const b = document.createElement('button');
        b.className = 'dot' + (i===0 ? ' active' : '');
        b.addEventListener('click', ()=> goTo(i));
        dotsWrap.appendChild(b);
        return b;
      });

      let idx = 0;
      prev?.addEventListener('click', ()=> { idx = Math.max(0, idx-1); goTo(idx); });
      next?.addEventListener('click', ()=> { idx = Math.min(dots.length-1, idx+1); goTo(idx); });

      window.addEventListener('resize', ()=>{
        updateItemsPerPage();
        updateCarouselStyles();
        goTo(idx);
      });

      goTo(0);
    });
  })();

  // ---------- Filtros por píldoras (hora / póliza / garantía) ----------
  (function(){
    const pills = [...document.querySelectorAll('.pill')];
    const cards = [...document.querySelectorAll('.feature-grid .fcard')];
    if(!pills.length || !cards.length) return;

    function apply(filter){
      cards.forEach(c=>{
        const show =
          (filter==='hora'     && c.classList.contains('tag-hora'))     ||
          (filter==='poliza'   && c.classList.contains('tag-poliza'))   ||
          (filter==='garantia' && c.classList.contains('tag-garantia'));
        c.style.display = show ? '' : 'none';
      });
    }
    pills.forEach(p=>{
      p.addEventListener('click', ()=>{
        pills.forEach(x=> x.classList.remove('active'));
        p.classList.add('active');
        apply(p.dataset.filter);
      });
    });
    apply('hora'); // filtro inicial
  })();

  // ---------- FAQ acordeón (uno abierto a la vez) ----------
  (function(){
    const wrap = document.getElementById('faqWrap');
    if(!wrap) return;
    const items = [...wrap.querySelectorAll('.faq-item')];
    items.forEach(d=>{
      d.addEventListener('toggle', ()=>{
        if(d.open){ items.forEach(o=>{ if(o!==d) o.removeAttribute('open'); }); }
      });
    });
  })();

  // ---------- (Opcional) Bloque “Aplica a” por servicio ----------
  // Usa data-apply="contabilidad,nominas,comercial,..." en cada .fcard para inyectar iconos
  (function(){
    const SYS_ICONS = {
      contabilidad:{src:'../IMG/contabilidad.webp',alt:'CONTPAQi Contabilidad'},
      nominas:{src:'../IMG/nominas.webp',alt:'CONTPAQi Nóminas'},
      comercial:{src:'../IMG/comercial.webp',alt:'CONTPAQi Comercial'},
      bancos:{src:'../IMG/bancos.webp',alt:'CONTPAQi Bancos'},
      contabiliza:{src:'../IMG/contabiliza.webp',alt:'CONTPAQi Contabiliza'},
      personia:{src:'../IMG/personia.webp',alt:'CONTPAQi Personia'},
      vende:{src:'../IMG/vende.webp',alt:'CONTPAQi Vende'},
      analiza:{src:'../IMG/analiza.webp',alt:'CONTPAQi Analiza'},
      despachos:{src:'../IMG/despachos.webp',alt:'CONTPAQi Despachos'}
    };

    document.querySelectorAll('.feature-grid .fcard[data-apply]').forEach(card=>{
      if(card.querySelector('.aplica-wrap')) return; // evita duplicado
      const list = (card.getAttribute('data-apply')||'')
        .split(',').map(s=>s.trim()).filter(Boolean);
      if(!list.length) return;

      const wrap = document.createElement('div');
      wrap.className = 'aplica-wrap';

      const title = document.createElement('div');
      title.className = 'aplica-title';
      title.textContent = 'Aplica a:';
      wrap.appendChild(title);

      const icons = document.createElement('div');
      icons.className = 'aplica-sistemas';

      list.forEach(key=>{
        const info = SYS_ICONS[key];
        if(!info) return;
        const img = document.createElement('img');
        img.src = info.src; img.alt = info.alt; icons.appendChild(img);
      });

      wrap.appendChild(icons);
      card.appendChild(wrap);
    });
  })();

})();
</script>

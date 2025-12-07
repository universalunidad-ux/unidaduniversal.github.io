// ======================================================
// Utils básicos
// ======================================================

// Atajo para querySelectorAll que devuelve array
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
// Atajo para querySelector
const $  = (sel, ctx = document) => ctx.querySelector(sel);

// Ejecutar cuando el DOM ya está listo
// (como cargas este JS al final del <body>, el DOM ya existe).

// ======================================================
// Formularios → WhatsApp
// ======================================================

// Formulario rápido (si existe en esta página)
$('#quickForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const modulo  = encodeURIComponent($('#modulo').value);
  const mensaje = encodeURIComponent($('#mensaje').value.trim());
  const texto   = `Hola Expiriti, me interesa ${modulo}. ${mensaje}`;
  window.open(`https://wa.me/525568437918?text=${texto}`, '_blank');
});

// Formulario de contacto principal
$('#contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre   = encodeURIComponent($('#nombre').value.trim());
  const correo   = encodeURIComponent($('#correo').value.trim());
  const telefono = encodeURIComponent($('#telefono').value.trim());
  const interes  = encodeURIComponent($('#interes').value);
  const detalle  = encodeURIComponent($('#detalle').value.trim());
  const texto    = `Hola Expiriti, soy ${nombre}. Email: ${correo}. Tel: ${telefono || 'N/A'}. Interés: ${interes}. Detalle: ${detalle}`;
  window.open(`https://wa.me/525568437918?text=${texto}`, '_blank');
});

// ======================================================
// Tabs de productos (Contable / Comercial / Nube / Productividad)
// ======================================================

const tabsProductos   = $$('.prod-tabs .tab');
const panelsProductos = $$('.panel-productos');

function activarTabProductos(btn) {
  const targetId = btn.dataset.target;

  // Activa solo el botón clicado
  tabsProductos.forEach(t => t.classList.toggle('active', t === btn));

  // Muestra solo el panel que corresponde
  panelsProductos.forEach(p => {
    p.classList.toggle('hidden', p.id !== targetId);
  });
}

// Listener en cada tab
tabsProductos.forEach(btn => {
  btn.addEventListener('click', () => activarTabProductos(btn));
});

// Estado inicial: Solución Contable
const tabInicial = document.getElementById('tab-contable');
if (tabInicial) activarTabProductos(tabInicial);

// ======================================================
// Promos: filtro por categoría
// ======================================================

const promoBtns = $$('.promo-btn');
const promoImgs = $$('#promoGrid [data-type]');

function setPromoFilter(type) {
  promoBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === type));
  promoImgs.forEach(img => {
    img.style.display = (img.dataset.type === type) ? '' : 'none';
  });
}

// Listeners de filtro
promoBtns.forEach(b => b.addEventListener('click', () => setPromoFilter(b.dataset.filter)));

// Filtro inicial
setPromoFilter('nuevos');

// ======================================================
// Cards de productos: click en toda la tarjeta
// ======================================================

$$('.card.product-card[data-href]').forEach(card => {
  const href = card.getAttribute('data-href');
  card.addEventListener('click', (e) => {
    // Si hicieron click en un <a>, deja que el enlace haga su trabajo
    if (e.target.closest('a')) return;
    if (href) window.location.href = href;
  });
});

// ======================================================
// Galería de imágenes del HERO (sistemas CONTPAQi)
// ======================================================

// Config con las imágenes por grupo y sistema
const HERO_GALLERY_DATA = {
  contable: {
    label: 'Contables',
    defaultSys: 'nominas',
    systems: {
      contabilidad: {
        label: 'Contabilidad',
        icon: 'IMG/contabilidadsq.webp',
        images: [
          { src: 'IMG/contamate.webp',  title: 'Contabilidad · Auxiliares y balanza' },
          { src: 'IMG/3conta.webp',     title: 'Contabilidad · Pólizas y reportes' },
          { src: 'IMG/conta%20ybancos.webp', title: 'Contabilidad · Auxiliares y balanza' },
          { src: 'IMG/impuestos%20sin%20estres%20conta%20y%20bancos.webp', title: 'Impuestos sin estrés' },
          { src: 'IMG/1conta.webp',     title: 'Contabilidad · Auxiliares y balanza' },
          { src: 'IMG/conta%20y%20bancos%202.webp', title: 'Contabilidad · Auxiliares y balanza' },
          { src: 'IMG/contacfdi.webp',  title: 'Contabilidad · Auxiliares y balanza' },
          { src: 'IMG/contadesglo.webp',title: 'Contabilidad · Auxiliares y balanza' },
        ]
      },
      nominas: {
        label: 'Nóminas',
        icon: 'IMG/nominassq.webp',
        images: [
          { src: 'IMG/primera.webp',      title: 'Nóminas · Bitácora de operaciones' },
          { src: 'IMG/490962328_1082897360538668_175183934644162321_n.webp', title: 'Nóminas · Recibos y timbrado' },
          { src: 'IMG/NOMINAS.webp',      title: 'Nóminas · Recibos y timbrado' },
          { src: 'IMG/ptu.webp',          title: 'Nóminas · Calcula PTU con precisión' },
          { src: 'IMG/posible.webp',      title: 'Nóminas · Conexión INFONAVIT' },
          { src: 'IMG/COMENTARIOS%20USUARIOS.webp', title: 'Nóminas · Calcula PTU con precisión' },
          { src: 'IMG/COMMENTS%20ESTRELLAS%201.webp', title: 'Nóminas · Calcula PTU con precisión' },
          { src: 'IMG/nomtraza.webp',     title: 'Nóminas · Recibos y timbrado' },
          { src: 'IMG/nommovs.webp',      title: 'Nóminas · Recibos y timbrado' },
          { src: 'IMG/nomisr.webp',       title: 'Nóminas · Recibos y timbrado' },
          { src: 'IMG/nomiequi.webp',     title: 'Nóminas · Recibos y timbrado' },
          { src: 'IMG/nomentrega.webp',   title: 'Nóminas · Recibos y timbrado' },
        ]
      },
      bancos: {
        label: 'Bancos',
        icon: 'IMG/bancossq.webp',
        images: [
          { src: 'IMG/efectivamente.webp',   title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/olvida.webp',          title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/CONTROL%20MOVIMIENTOS%20BANCARIOS.webp', title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/CARRUSEL%20CONECTA%201jpg.webp', title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/CARRUSEL%20CONECTA%202.webp', title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/PAGARAN.webp',         title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/proyecta.webp',        title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/revisas.webp',         title: 'Bancos · Conciliación bancaria' },
          { src: 'IMG/bancosperso.webp',     title: 'Bancos · Conciliación bancaria' },
        ]
      },
      xml: {
        label: 'XML en Línea+',
        icon: 'IMG/xmlsq.webp',
        images: [
          { src: 'IMG/dos.webp',                  title: 'XML en Línea+ · Descarga de CFDI' },
          { src: 'IMG/SOFTWARE%20FAVORITO%201.webp', title: 'XML en Línea+ · Descarga de CFDI' },
          { src: 'IMG/SOFTWARE%20FAVORITO%202.webp', title: 'XML en Línea+ · Descarga de CFDI' },
        ]
      }
    }
  },

  comercial: {
    label: 'Comerciales',
    defaultSys: 'start',
    systems: {
      start: {
        label: 'Comercial Start',
        icon: 'IMG/comercialstartsq.webp',
        images: [
          { src: 'IMG/comercialstart.webp', title: 'Start · Ventas e inventario básico' },
        ]
      },
      pro: {
        label: 'Comercial Pro',
        icon: 'IMG/comercialprosq.webp',
        images: [
          { src: 'IMG/captura%20manual.webp', title: 'Pro · Operaciones de alto volumen' },
          { src: 'IMG/procumple.webp',        title: 'Pro · Operaciones de alto volumen' },
          { src: 'IMG/prorenta.webp',         title: 'Pro · Operaciones de alto volumen' },
          { src: 'IMG/COMPRAVENTA.webp',      title: 'Pro · Operaciones de alto volumen' },
          { src: 'IMG/FUNCIONES%20%PRO.webp', title: 'Pro · Operaciones de alto volumen' },
          { src: 'IMG/FUNCIONES%20%PRO2.webp',title: 'Pro · Operaciones de alto volumen' },
          { src: 'IMG/MODULO.webp',           title: 'Pro · Operaciones de alto volumen' },
        ]
      },
      premium: {
        label: 'Comercial Premium',
        icon: 'IMG/comercialpremiumsq.webp',
        images: [
          { src: 'IMG/desde%20compras%20ventas%20traslados.webp', title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/INVENTARIO%20Y%20VENTAS.webp',              title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/LIGAS%20DE%20PAGO.webp',                    title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/NOTAS%20DE%20VENTA.webp',                   title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/COSTOS%20Y%20UTILIDADES.webp',              title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/INVENTARIOS,%20FINANZAS%20jpg.webp',        title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/STOCK.webp',                                title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/comportamiento.webp',                       title: 'Premium · Políticas y listas de precio' },
          { src: 'IMG/premtrans.webp',  title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/premrutas.webp',  title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/prempro.webp',    title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/premdash.webp',   title: 'Factura electrónica · Timbrado CFDI 4.0' },
        ]
      },
      factura: {
        label: 'Factura electrónica',
        icon: 'IMG/facturasq.webp',
        images: [
          { src: 'IMG/INCLUYE%201.webp',         title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/INCLUYE%202.webp',         title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/INCLUYE%203.webp',         title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/CARACTERISTICAS%202.webp', title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/CARACTERISTICAS%203.webp', title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/carta%20porte.webp',       title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/CONTROLA.webp',            title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/solucion%20facil.webp',    title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/facinfo.webp',             title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/facpreo.webp',             title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/factiemp.webp',            title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/factimbra.webp',           title: 'Factura electrónica · Timbrado CFDI 4.0' },
          { src: 'IMG/factserv.webp',            title: 'Factura electrónica · Timbrado CFDI 4.0' },
        ]
      }
    }
  },

  nube: {
    label: 'En la Nube',
    defaultSys: 'analiza',
    systems: {
      analiza: {
        label: 'Analiza',
        icon: 'IMG/analiza.webp',
        images: [
          { src: 'IMG/04%20Analiza%20discrepancias.webp', title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/04%20Analiza%20reportes.webp',      title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/anadecide.webp',                    title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/ananocuadr.webp',                   title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/analizarespues.webp',               title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/analizareportes.webp',              title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/analizadescuadr.webp',              title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/analizacorrige.webp',               title: 'Analiza · Dashboard ejecutivo' },
          { src: 'IMG/analizacfdi.webp',                  title: 'Analiza · Dashboard ejecutivo' },
        ]
      },
      contabiliza: {
        label: 'Contabiliza',
        icon: 'IMG/contabiliza.webp',
        images: [
          { src: 'IMG/contatranq.webp',   title: 'Contabiliza · Contabilidad en la nube' },
          { src: 'IMG/contaclari.webp',   title: 'Contabiliza · Contabilidad en la nube' },
          { src: 'IMG/contabprocesos.webp', title: 'Contabiliza · Contabilidad en la nube' },
          { src: 'IMG/contabireal.webp',  title: 'Contabiliza · Contabilidad en la nube' },
        ]
      },
      despachos: {
        label: 'Despachos',
        icon: 'IMG/despachos.webp',
        images: [
          { src: 'IMG/despachos.webp', title: 'Despachos · Gestión de despachos en la nube' }
        ]
      },
      vende: {
        label: 'Vende',
        icon: 'IMG/vende.webp',
        images: [
          { src: 'IMG/vendevendes.webp', title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/vendesigue.webp',  title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/vendexml.webp',    title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/vendesegui.webp',  title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/venderuta.webp',   title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/vendequien.webp',  title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/vendemarca.webp',  title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/vendekpis.webp',   title: 'Vende · Punto de venta en la nube' },
          { src: 'IMG/vendeayu.webp',    title: 'Vende · Punto de venta en la nube' },
        ]
      }
    }
  },

  productividad: {
    label: 'Productividad',
    defaultSys: 'evalua',
    systems: {
      evalua: {
        label: 'Evalúa',
        icon: 'IMG/evalua.webp',
        images: [
          { src: 'IMG/evaluaencu.webp', title: 'Evalúa · Encuestas y clima laboral' },
          { src: 'IMG/evaluabien.webp', title: 'Evalúa · Encuestas y clima laboral' },
          { src: 'IMG/nom37.webp',      title: 'Evalúa · Encuestas y clima laboral' },
        ]
      },
      colabora: {
        label: 'Colabora',
        icon: 'IMG/colabora.webp',
        images: [
          { src: 'IMG/colabacceso.webp', title: 'Colabora · App sin costo para tu equipo' },
          { src: 'IMG/colabtoda.webp',   title: 'Colabora · App sin costo para tu equipo' },
          { src: 'IMG/colacentra.webp',  title: 'Colabora · App sin costo para tu equipo' },
          { src: 'IMG/colacola.webp',    title: 'Colabora · App sin costo para tu equipo' },
        ]
      },
      personia: {
        label: 'Personia',
        icon: 'IMG/personia.webp',
        images: [
          { src: 'IMG/personiaseg.webp', title: 'Personia · Expedientes de empleados' },
          { src: 'IMG/personmas.webp',   title: 'Personia · Expedientes de empleados' },
          { src: 'IMG/personiaptu.webp', title: 'Personia · Expedientes de empleados' },
          { src: 'IMG/persobime.webp',   title: 'Personia · Expedientes de empleados' },
        ]
      }
    }
  }
};

// Referencias de la galería del hero
const HERO_GALLERY = {
  groupNav:     $('#heroGalleryGroups'),
  tabsContainer:$('#heroGalleryTabs'),
  titleEl:      $('#heroGalleryTitle'),
  carousel:     $('#heroGalleryCarousel'),
  defaultGroup: 'contable'
};

// Construye los slides (imágenes) para un grupo/sistema
function buildHeroGallerySlides(groupKey, sysKey) {
  const configGroup = HERO_GALLERY_DATA[groupKey];
  if (!configGroup) return;

  const sys = configGroup.systems[sysKey];
  if (!sys || !sys.images || !sys.images.length) return;

  const { carousel, titleEl } = HERO_GALLERY;
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const nav   = carousel.querySelector('.carousel-nav');
  if (!track || !nav) return;

  track.innerHTML = '';
  nav.innerHTML   = '';

  sys.images.forEach((item, idx) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide hero-slide';
    if (idx === 0) slide.classList.add('is-active');

    const img = document.createElement('img');
    img.src     = item.src;
    img.loading = 'lazy';
    img.alt     = item.title || sys.label;

    slide.appendChild(img);
    track.appendChild(slide);

    // Puntitos de navegación
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Ir a imagen ' + (idx + 1));
    dot.addEventListener('click', () => {
      const slides = $$('.carousel-slide', track);
      slides.forEach(s => s.classList.remove('is-active'));
      slides[idx]?.classList.add('is-active');
      $$('.dot', nav).forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      track.scrollTo({ left: track.clientWidth * idx, behavior: 'smooth' });
    });
    nav.appendChild(dot);
  });

  if (titleEl) {
    titleEl.textContent = sys.images[0]?.title || sys.label;
  }
}

// Crea las tabs de sistemas (Contabilidad, Nóminas, etc.)
function buildHeroSystemTabs(groupKey) {
  const configGroup = HERO_GALLERY_DATA[groupKey];
  if (!configGroup) return;
  const container = HERO_GALLERY.tabsContainer;
  if (!container) return;

  const defaultSys = configGroup.defaultSys;
  container.innerHTML = '';

  Object.entries(configGroup.systems).forEach(([sysKey, sys]) => {
    const btn = document.createElement('button');
    btn.type  = 'button';
    btn.className = 'hero-tab' + (sysKey === defaultSys ? ' active' : '');
    btn.dataset.group = groupKey;
    btn.dataset.sys   = sysKey;
    btn.innerHTML = `
      <img src="${sys.icon}" alt="${sys.label}">
      <span>${sys.label}</span>
    `;
    btn.addEventListener('click', () => {
      $$('.hero-tab', container).forEach(b => b.classList.toggle('active', b === btn));
      buildHeroGallerySlides(groupKey, sysKey);
    });
    container.appendChild(btn);
  });
}

// Inicializa toda la galería del hero (grupos + flechas)
function initHeroGallery() {
  const { groupNav, defaultGroup, carousel } = HERO_GALLERY;
  if (!groupNav || !carousel) return;

  // Tabs de grupo (Contables / Comerciales / Nube / Productividad)
  groupNav.innerHTML = '';
  Object.entries(HERO_GALLERY_DATA).forEach(([groupKey, group]) => {
    const btn = document.createElement('button');
    btn.type  = 'button';
    btn.className = 'hero-group-tab' + (groupKey === defaultGroup ? ' active' : '');
    btn.dataset.group = groupKey;
    btn.textContent   = group.label;
    btn.addEventListener('click', () => {
      $$('.hero-group-tab', groupNav).forEach(b => b.classList.toggle('active', b === btn));
      const cfg        = HERO_GALLERY_DATA[groupKey];
      const sysDefault = cfg.defaultSys;
      buildHeroSystemTabs(groupKey);
      buildHeroGallerySlides(groupKey, sysDefault);
    });
    groupNav.appendChild(btn);
  });

  const track   = carousel.querySelector('.carousel-track');
  const prevBtn = carousel.querySelector('.arrowCircle.prev');
  const nextBtn = carousel.querySelector('.arrowCircle.next');

  const slidesFor = () => $$('.carousel-slide', track);
  const navDots   = () => $$('.dot', carousel.querySelector('.carousel-nav'));

  const goTo = (index) => {
    const slides = slidesFor();
    if (!slides.length) return;
    const max = slides.length - 1;
    const i   = Math.max(0, Math.min(max, index));
    slides.forEach(s => s.classList.remove('is-active'));
    slides[i].classList.add('is-active');
    navDots().forEach((d, idx) => d.classList.toggle('active', idx === i));
    track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
  };

  // Flechas del hero
  prevBtn?.addEventListener('click', () => {
    const idx = slidesFor().findIndex(s => s.classList.contains('is-active'));
    goTo(idx - 1);
  });
  nextBtn?.addEventListener('click', () => {
    const idx = slidesFor().findIndex(s => s.classList.contains('is-active'));
    goTo(idx + 1);
  });

  // Estado inicial: grupo contable + sistema default de ese grupo
  const cfg = HERO_GALLERY_DATA[defaultGroup];
  buildHeroSystemTabs(defaultGroup);
  buildHeroGallerySlides(defaultGroup, cfg.defaultSys);
}

// ======================================================
// Datos de Reels (por panel y por sistema/servicio)
// ======================================================

const REELS_DATA = {
  contable: {
    titleEl:  $('#reelTitle-contable'),
    carousel: $('#carouselReels-contable'),
    defaultSys: 'nominas',
    reelsBySys: {
      contabilidad: [
        { id: 'yblBsFFv6bc', title: 'Contabilidad y Contabiliza te ayudan en la DIOT' },
        { id: 'BIhYNn2O0og', title: 'Evita errores en la DIOT con Contabilidad' },
        { id: 'rESYB37TP-M', title: 'Declaración anual en 5 pasos con Contabilidad' },
        { id: 'LqptaBOF7h4', title: 'Fernanda redujo su carga contable con Contabilidad' }
      ],
      nominas: [
        { id: 'gae67GDse30', title: 'Nóminas y Personia | Checador por GPS' },
        { id: '8-2rT99euog', title: 'Nóminas | Software #1 en México' },
        { id: '2eVOzoBoP6s', title: 'Nóminas | Automatiza tus procesos' },
        { id: 'nLRgiOPQM80', title: 'App Colabora gratis con Nóminas' },
        { id: 'MfiiX1La2vQ', title: 'Qué hace CONTPAQi Nóminas por ti' }
      ],
      bancos: [
        { id: '3YUbSEyU678', title: 'Conciliación bancaria en 3 pasos con Bancos' },
        { id: 'LC1Ccpv_jzo', title: '4 señales de que necesitas Bancos' }
      ],
      xml: [
        { id: 'nhoUDNnGQ90', title: 'El día que José dejó de sufrir con el SAT descargando CFDIs' }
      ]
    }
  },

  comercial: {
    titleEl:  $('#reelTitle-comercial'),
    carousel: $('#carouselReels-comercial'),
    defaultSys: 'start',
    reelsBySys: {
      start: [
        { id: 'dQw4w9WgXcQ', title: 'Comercial Start | Reel 1' },
        { id: '9bZkp7q19f0', title: 'Comercial Start | Reel 2' },
        { id: '3JZ_D3ELwOQ', title: 'Comercial Start | Reel 3' }
      ],
      pro: [
        { id: 'rEYzPXOX1_Y',  title: 'Comercial Pro: control total de inventario' },
        { id: '-SJq6t2SM7c', title: 'Flujo completo con Comercial Pro' },
        { id: '5AowfYsAm4E', title: 'Trazabilidad avanzada en inventarios' }
      ],
      premium: [
        { id: 'IYwNBfmWxJU', title: 'Controla tus inventarios con Comercial Premium' },
        { id: '_Krv5nTyFuY', title: 'Notas de venta más rápido en Comercial Premium' },
        { id: 'HmgOQrasCVw', title: 'Notas de venta en Comercial Premium' },
        { id: 'WGPOzQ1GsSE', title: 'Documentos por WhatsApp en Comercial Premium' }
      ],
      factura: [
        { id: 'nMEgM_BvxTs', title: 'Factura Electrónica v13 | Novedades' },
        { id: 'IA5-tguZzCc', title: 'Carta Porte CFDI 3.1 en Factura Electrónica' },
        { id: '2uBSGZHLsGs', title: 'Factura Electrónica para sector notarial' }
      ]
    }
  },

  nube: {
    titleEl:  $('#reelTitle-nube'),
    carousel: $('#carouselReels-nube'),
    defaultSys: 'analiza',
    reelsBySys: {
      analiza: [
        { id: 'wr-eeR3eE7w', title: 'Analiza | Conciliación fiscal y bancaria' },
        { id: 'gAIGxMHaCLQ', title: 'Analiza | Identifica descuadres CFDIs y Nóminas' },
        { id: 'iEQM_21OmBI', title: 'Conciliación fiscal y contable con Analiza' }
      ],
      contabiliza: [
        { id: 'yblBsFFv6bc', title: 'Contabilidad y Contabiliza te ayudan en la DIOT' }
      ],
      despachos: [
        { id: 'KBEOTwnFXQ4', title: 'Gestión de Despachos en la nube' },
        { id: 'aqz-KE-bpKQ', title: 'Control de obligaciones con Despachos' }
      ],
      vende: [
        { id: '2Ty_SD8B_FU', title: 'Vende | Carta Porte fácil y rápida' },
        { id: 'UPyufjDByNc', title: 'Testimonio CONTPAQi Vende' },
        { id: 'Grx1woHMGsU', title: 'Vende en la nube' }
      ]
    }
  },

  productividad: {
    titleEl:  $('#reelTitle-productividad'),
    carousel: $('#carouselReels-productividad'),
    defaultSys: 'evalua',
    reelsBySys: {
      evalua: [
        { id: 'REEMPLAZAR_ID_1', title: 'Reel Evalúa 1' },
        { id: 'REEMPLAZAR_ID_2', title: 'Reel Evalúa 2' },
        { id: 'REEMPLAZAR_ID_3', title: 'Reel Evalúa 3' }
      ],
      colabora: [
        { id: 'XJQDFDowH0U', title: 'Colabora, app sin costo con Nóminas' },
        { id: 'nLRgiOPQM80', title: 'App Colabora gratis con Nóminas' }
      ],
      personia: [
        { id: 'gae67GDse30', title: 'Nóminas y Personia | Checador por GPS' }
      ]
    }
  },

  // 🔥 Nuevo panel: Servicios
  servicios: {
    titleEl:  $('#reelTitle-servicios'),
    carousel: $('#carouselReels-servicios'),
    defaultSys: 'implementacion',
    reelsBySys: {
      implementacion: [
        { id: 'aHGJ-TNpJ-U', title: 'Testimonio Martha: Implementación Contable' }
      ],
      desarrollos: [
        { id: 'JkrDOjWV1Gs', title: 'Testimonio Sara: Soft Restaurant' },
        { id: 'uBl5UWkwbr8', title: 'Testimonio Luis: Desarrollo en Nóminas' },
        { id: 'f-F10-F6rnM', title: 'Testimonio Alex: Integración CONTPAQi API' }
      ],
      cursos: [
        { id: 'TgAkwNt4YCA', title: 'Testimonio Ana: Curso Contabilidad' }
      ],
      soporte: [
        { id: 'IoHjV2QG_3U', title: 'Testimonio Marco: Soporte eficaz' }
      ]
    }
  }
};

// ======================================================
// Helpers para reels / YouTube
// ======================================================

// Pinta una miniatura clickable (sin iframe todavía)
function renderReelThumb(wrap) {
  const id    = wrap.dataset.ytid;
  const title = wrap.dataset.title || '';
  if (!id) return;

  wrap.innerHTML = `
    <button class="yt-thumb" type="button" aria-label="Reproducir: ${title}">
      <img
        src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg"
        loading="lazy"
        alt="${title}"
        onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg';">
      <span class="yt-play"></span>
    </button>
  `;

  const btn = wrap.querySelector('.yt-thumb');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Detiene cualquier otro video
    stopAllReels();
    // Y luego reproduce este
    renderReelIframe(wrap);
  });
}

// Cambia miniatura → iframe de YouTube
function renderReelIframe(wrap) {
  const id    = wrap.dataset.ytid;
  const title = wrap.dataset.title || '';
  if (!id) return;

  wrap.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1"
      title="${title}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin">
    </iframe>
  `;
}

// Regenera miniaturas en TODOS los .reel-embed
function stopAllReels() {
  document.querySelectorAll('.reel-embed').forEach(wrap => {
    if (!wrap.dataset.ytid) return;
    renderReelThumb(wrap);
  });
}

// Construye los slides (reels) para un panel + sistema
function buildReelsSlides(panelKey, sysKey) {
  const config = REELS_DATA[panelKey];
  if (!config) return;

  const { carousel, titleEl, reelsBySys } = config;
  const track = carousel?.querySelector('.carousel-track');
  const nav   = carousel?.querySelector('.carousel-nav');
  if (!track || !nav) return;

  const reels = reelsBySys[sysKey] || [];
  track.innerHTML = '';
  nav.innerHTML   = '';

  reels.forEach((reel, idx) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    if (idx === 0) slide.classList.add('is-active');

    const wrap = document.createElement('div');
    wrap.className    = 'reel-embed';
    wrap.dataset.ytid = reel.id;
    wrap.dataset.title = reel.title;

    // Miniatura inicial
    renderReelThumb(wrap);

    slide.appendChild(wrap);
    track.appendChild(slide);

    // Punto de navegación
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Ir al reel ' + (idx + 1));
    dot.addEventListener('click', () => {
      const slides = $$('.carousel-slide', track);
      slides.forEach(s => s.classList.remove('is-active'));
      slides[idx]?.classList.add('is-active');
      $$('.dot', nav).forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      track.scrollTo({ left: track.clientWidth * idx, behavior: 'smooth' });
      stopAllReels();
    });
    nav.appendChild(dot);
  });

  if (titleEl) titleEl.textContent = reels[0]?.title || '';
}

// Inicializa un carrusel de reels por panel (contable, comercial, etc.)
function initReelsCarousel(panelKey) {
  const config = REELS_DATA[panelKey];
  if (!config || !config.carousel) return;

  const { carousel, defaultSys } = config;
  const track = carousel.querySelector('.carousel-track');

  const slidesFor = () => $$('.carousel-slide', track);
  const navDots   = () => $$('.carousel-nav .dot', carousel);

  const goTo = (index) => {
    const slides = slidesFor();
    if (!slides.length) return;
    const max = slides.length - 1;
    const i   = Math.max(0, Math.min(max, index));
    slides.forEach(s => s.classList.remove('is-active'));
    slides[i].classList.add('is-active');
    navDots().forEach((d, idx) => d.classList.toggle('active', idx === i));
    track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
  };

  const prevBtn = carousel.querySelector('.arrowCircle.prev');
  const nextBtn = carousel.querySelector('.arrowCircle.next');

  prevBtn?.addEventListener('click', () => {
    const idx = slidesFor().findIndex(s => s.classList.contains('is-active'));
    goTo(idx - 1);
    stopAllReels();
  });
  nextBtn?.addEventListener('click', () => {
    const idx = slidesFor().findIndex(s => s.classList.contains('is-active'));
    goTo(idx + 1);
    stopAllReels();
  });

  // Sistema inicial por defecto
  buildReelsSlides(panelKey, defaultSys);
}

// Inicializa TODOS los paneles de reels (incluye servicios)
['contable', 'comercial', 'nube', 'productividad', 'servicios'].forEach(initReelsCarousel);

// Tabs de sistema/servicio debajo de cada carrusel
$$('.reel-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const panelKey = tab.dataset.panel;
    const sysKey   = tab.dataset.sys;
    if (!panelKey || !sysKey) return;

    stopAllReels();

    // Activa solo los tabs del panel actual
    $$('.reel-tab').forEach(t => {
      if (t.dataset.panel === panelKey) {
        t.classList.toggle('active', t === tab);
      }
    });

    // Reconstruye slides para ese sistema
    buildReelsSlides(panelKey, sysKey);
  });
});

// ======================================================
// Miniaturas sección "Videos" (dos videos simples arriba de contacto)
// ======================================================

function initSimpleThumbs() {
  $$('.yt-lite').forEach(node => {
    const id    = node.dataset.ytid;
    const title = node.dataset.title || '';
    if (!id) return;

    node.dataset.ytid  = id;
    node.dataset.title = title;

    renderReelThumb(node);
  });
}

// ======================================================
// FAQ: solo una pregunta abierta a la vez
// ======================================================

function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item').forEach(otro => {
        if (otro !== item) otro.removeAttribute('open');
      });
    });
  });
}

// ======================================================
// Inicialización general de la página
// ======================================================

initHeroGallery();
initSimpleThumbs();
initFAQ();

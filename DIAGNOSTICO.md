# Diagnóstico técnico — nueva.expiriti.com.mx
Fecha: 2026-07-05 · Alcance: 30 páginas HTML, 4 CSS, 6 JS, ~340 imágenes WebP

## Resumen ejecutivo

La base del sitio es mejor de lo esperado: cada página tiene title único, meta description única, canonical correcto, H1 único, Open Graph, FAQs en `<details>`, imágenes WebP con lazy loading y width/height. Varios de los textos que se pidió corregir ("correciones", "excen", el CTA roto de "Selecciona el icono") **ya están corregidos en esta versión** — no existen en los archivos.

Los problemas reales están en otro lado: un formulario que no envía, H1 hechos solo de imagen, cero datos estructurados (Schema.org), sin sitemap/robots, y una deuda fuerte de CSS con capas de parches acumuladas.

## Tabla de problemas

| # | Área | Problema | Severidad | Archivo/Página | Corrección |
|---|------|----------|-----------|----------------|------------|
| 1 | Conversión | Formulario de contacto apunta a `GAS_URL="PEGA_AQUI_TU_URL_DE_APPS_SCRIPT_EXEC"` (placeholder). Los leads del home se pierden: el envío falla silenciosamente (no-cors) y muestra "Listo" | **CRÍTICA** | index.js (initForms) | Fallback a WhatsApp con el contenido del formulario mientras no exista backend |
| 2 | SEO/AEO | H1 de las 16 páginas de SISTEMAS contiene solo una imagen (logo). Texto crítico dentro de imagen | **ALTA** | SISTEMAS/*.html | H1 con texto real + logo decorativo (clase .sr-only) |
| 3 | SEO | No existe sitemap.xml ni robots.txt | **ALTA** | raíz | Crear ambos |
| 4 | SEO/AEO | Cero Schema.org/JSON-LD en todo el sitio (0 coincidencias) | **ALTA** | todas | Organization+LocalBusiness+FAQPage en home; SoftwareApplication+BreadcrumbList en sistemas; Service+BreadcrumbList en servicios |
| 5 | Arquitectura CSS | mainindex.css: 485 `!important`; `.hero-h1` redefinido ≥5 veces en capas "PATCH FINAL", "WRAP OWNER v2026.01.24g", "FIX v2026.01.24i"; bloque duplicado literal (línea ~920) y regla duplicada dos veces en la misma línea (~933) | **ALTA** | mainindex.css | Consolidar: eliminar capas superadas, dejar un solo owner |
| 6 | Arquitectura CSS | global-header.html: 6 capas de parches CSS inline (`PATCH preciso`, `PATCH FINAL AJUSTE LOGOS`, etc.) con `!important` masivo | MEDIA | PARTIALS/global-header.html | Consolidar en una pasada futura (Fase 3, requiere prueba visual) |
| 7 | SEO | Navegación del header usa `href="#"` + `data-href` resuelto por JS; header/footer se inyectan por fetch(). Crawlers sin JS (y varios bots de IA) no ven la navegación | MEDIA | PARTIALS/global-header.html, index.js | Poner href reales (JS puede seguir normalizando); a futuro considerar SSG/includes en build |
| 8 | Legal/marca | "Personal certificado para los sistemas de tu empresa" — se pidió respaldar sin afirmaciones dudosas (CONOCER) | MEDIA | index.html:280 | Redacción segura aplicada |
| 9 | Performance | 732 `!important` totales en CSS; estilos inline dispersos (`style="padding:16px"`) | MEDIA | CSS/HTML | Consolidación progresiva (Fase 3) |
| 10 | Contenido | colabora.html es la única página de producto sin FAQ | BAJA | SISTEMAS/colabora.html | Agregar FAQ (Fase 4) |
| 11 | Promos | Promociones hardcodeadas en index.html con hack `onerror` para ocultar imágenes faltantes | MEDIA | index.html #promociones | Fase 5: /data/promociones.json + render con fallback |
| 12 | SEO | Titles correctos pero sin intención de compra ("comprar", "precio", "distribuidor") | BAJA | varias | Ajustar en Fase 4 junto con landings |
| 13 | A11y | Emojis como íconos en footer (📍🕘📞✉️) sin aria-hidden | BAJA | global-footer.html | Marcar decorativos |

## Lo que ya está bien (no tocar)

- Title/description/canonical/OG únicos y correctos en las 27 páginas indexables.
- H1 único por página (los de sistemas necesitan texto, ver #2).
- Imágenes WebP, lazy loading, width/height, preload del hero, fonts con display=swap.
- FAQs en `<details>` en 22 páginas (base perfecta para FAQPage schema).
- Textos comerciales del FAQ del home ya corregidos (soporte, migraciones, licencias) con redacción legalmente segura ("distribuidor autorizado", sin promesas ilimitadas).
- default.html es página de mantenimiento independiente (correcto).

## Plan por fases

**Fase 1 — Críticas (esta sesión):** #1 formulario, #2 H1 con texto real, #8 texto certificado, #5 consolidación segura de duplicados literales en mainindex.css.

**Fase 2 — SEO/AEO (esta sesión):** #3 sitemap+robots, #4 JSON-LD en las 24 páginas comerciales, utilidad .sr-only en theme.css.

**Fase 3 — Performance/CSS (próxima sesión):** consolidar header (#6), reducir !important, revisar CLS/LCP con Lighthouse real, minificación.

**Fase 4 — Landings (próxima sesión):** plantilla única, bloques "Ideal para / Qué incluye / Implementación / Migración / Soporte / FAQ / CTA", breadcrumbs visibles, titles con intención de búsqueda, FAQ en colabora, página puente /soluciones.html.

**Fase 5 — Promociones remotas (próxima sesión):** /data/promociones.json + /assets/promos/ WebP, render con fallback y checklist mensual de publicación.

---

# Cambios aplicados (2026-07-05)

## Fase 1 — Críticas ✅

1. **index.js** — El formulario de contacto ya no pierde leads: si `GAS_URL` sigue siendo placeholder (o el envío falla), arma el mensaje con nombre/correo/teléfono/interés/detalle y lo abre en WhatsApp (55 6843 7918). Cuando pegues tu URL real de Apps Script, el envío por backend se reactiva solo.
2. **index.html:280** — "Personal certificado..." → "Personal capacitado y certificado para acompañarte en la implementación, soporte y uso de tus sistemas CONTPAQi" (redacción segura, sin afirmación CONOCER no respaldada).
3. **SISTEMAS/*.html (16 páginas)** — H1 ahora tiene texto real indexable (`span.sr-only` con palabra clave + beneficio), logo marcado decorativo (`alt=""`), y se quitó `loading="lazy"` de la imagen hero (anti-patrón LCP) sustituido por `fetchpriority="high"`.
4. **mainindex.css** — Consolidación: eliminadas 3 capas muertas/duplicadas del hero H1 (capa "baseline FIX v2026.01.24" con selectores inexistentes, bloque [C] superado, copia literal comprimida del WRAP OWNER) y regla de reel-tabs duplicada dos veces en la misma línea. Owner final: "FIX v2026.01.24i". Sin cambio visual: solo se removió lo que ya estaba sobrescrito.

## Fase 2 — SEO/AEO ✅

5. **robots.txt** — Nuevo, con referencia al sitemap y bloqueo de /PARTIALS/ y /api/.
6. **sitemap.xml** — Nuevo, 26 URLs con prioridades.
7. **index.html** — JSON-LD `@graph`: LocalBusiness (dirección, teléfono, horario, área de servicio, knowsAbout) + WebSite + FAQPage con las 8 preguntas reales del home.
8. **16 SISTEMAS** — JSON-LD BreadcrumbList + SoftwareApplication (nombre, categoría, SO, descripción, marca CONTPAQi, proveedor ExpIRI Ti).
9. **7 SERVICIOS** — JSON-LD BreadcrumbList + Service (tipo de servicio, descripción, proveedor, areaServed México).

## Verificación ✅

- 24/24 páginas comerciales con exactamente 1 bloque JSON-LD; sintaxis validada con parser JSON.
- 16/16 H1 de sistemas con texto sr-only y fetchpriority.
- 28 archivos conservan `</head>` único (estructura intacta).
- H1 único por página: ya se cumplía, se conserva.
- Title/description/canonical: intactos.

## Checklists para tu prueba manual

**Responsive:** abrir home y 2-3 internas en 360/390/768/1280/1920 px → sin scroll horizontal, header ok, hero ok (el CSS eliminado era letra muerta, pero verifica hero del home en mobile por seguridad).
**Formulario:** llenar y enviar el form del home → debe abrir WhatsApp con el mensaje armado.
**Schema:** pegar la URL (ya publicada) en https://validator.schema.org y en la prueba de resultados enriquecidos de Google.
**Sitemap:** subir todo y dar de alta https://nueva.expiriti.com.mx/sitemap.xml en Search Console.

---

# Fase 3–5 aplicadas (2026-07-05, segunda sesión)

**Estado: PENDIENTE DE VALIDACIÓN VISUAL EN MINI HOST.** Ninguna fase de esta sesión se considera cerrada hasta revisarla publicada, breakpoint por breakpoint (acordado: subes cambios y valido con Chrome).

## Fase 3 — Consolidación CSS del header

Metodología: por cada componente se identificó la regla ganadora real (cascada) y se eliminó todo lo superado. **No se agregó ninguna capa nueva.**

| Componente | Owners antes | Regla que ganaba | Acción |
|---|---|---|---|
| `.gh-svcdots::before` ("Desliza") | 2 (base + PATCH preciso) | Idénticas | Eliminado duplicado del patch |
| Logos Sistemas mega (fondo amarillo/verde) | 3 (base nth-child → reset CAPA 2 → data-src !important) | Selectores data-src (CAPA 5) | Eliminadas de la base las reglas nth-child muertas (4 reglas + variantes light) |
| Mega Servicios desktop (cols/items/imgs) | 3 (base + capa 1024px + PATCH FINAL) | PATCH FINAL (!important, último) | Capa intermedia eliminada; `min-height:146px` (único valor que aportaba) migró al owner |
| `#gh-msys .gh-mimg` móvil | 3 (base 32px → patch 38px → mobile 56px) | Mobile 56px !important | Patch intermedio acotado a `#gh-msvc` únicamente |
| Blur/sombra del mega + hover de items | 2 (base + capa final !important) | Capa final | Valores fusionados EN la base; capa final eliminada (menos !important) |
| `.gh-drawer{display:none}` desktop | 2 | Idénticas | Eliminado duplicado |

**Conteos:** `!important` en header: **81 → 76** (los que quedan protegen contra CSS de página; reducirlos más requiere regresión visual completa). CSS externos sin cambios este turno: mainindex 476 / main 152 / theme 70+nuevos componentes sin !important / mainservicios 25. Capas del header: 7 → 5, cada una con owner declarado en comentario.

## Fase 3 — Navegación crawleable

- **30 patrones `href="#" + data-href` → hrefs reales** en todo el header (nav desktop, mega menús, drawer móvil, marca). Verificado: 0 `href="#"` restantes. El JS (`applySafePaths`) sigue re-resolviendo rutas para GitHub Pages, así que no cambia el comportamiento con JS.
- **Recomendación partials (Opción A elegida):** mantener partials + hrefs reales. La deuda restante: sin JS no hay header (fetch). Mitigación futura (Fase 6): script de build que inyecte los partials estáticamente antes de publicar (Opción B), sin cambiar el flujo de edición.

## Fase 3.1 — H1 honesto

Nuevo patrón aplicado en pilotos: logo con `alt` real + **H1 de texto visible** + subtítulo (adiós al sr-only-only). Los otros 15 sistemas conservan el sr-only hasta replicar el patrón validado.

## Fase 4 — Pilotos (4)

| Página | Qué tiene ahora |
|---|---|
| SISTEMAS/comercialpremium.html | Breadcrumb visible, H1 visible "para ventas, inventarios y facturación", subtítulo, 3 bullets, CTA WhatsApp con página de origen, CTA a implementación, microfrase de confianza, "¿Es para tu empresa?", "Qué incluye con ExpIRI Ti", FAQ rápida (costo/tiempo/migración), servicios relacionados, sticky CTA móvil, title/OG con intención de compra, FAQPage schema (5 preguntas) |
| SERVICIOS/migraciones.html | Breadcrumb, hero comercial con bullets y CTA de diagnóstico, "Lo que debes tener listo" (checklist real de respaldos/versiones), respuestas rápidas, sticky CTA, title "Migrar de ASPEL, Excel u otro sistema a CONTPAQi", OG orientado a compartir |
| SERVICIOS/horas-soporte.html | **NUEVA.** Bolsa de horas sin mensualidad: qué es, para quién, qué incluye/NO incluye, cómo se consumen, casos que se cotizan aparte, **tabla comparativa vs póliza anual** (con póliza como columna recomendada y CTA fuerte a polizas.html), "lo que debes tener listo", FAQ 6 preguntas, Service+FAQPage+Breadcrumb schema, OG, sticky CTA. Enlazada desde header (mega + drawer), soluciones.html y polizas.html |
| soluciones.html | **NUEVA.** Página puente "¿Qué necesitas resolver?" con 8 opciones + bloque "No sé qué necesito" → WhatsApp de orientación. Ideal para QR/eventos |

Extras de fase 4: FAQ visible + FAQPage schema en colabora.html (era la única sin FAQ); cross-link mínimo polizas→horas-soporte; sitemap.xml actualizado (28 URLs).

## Fase 5 — Promociones remotas

- `/data/promociones.json` (validado con parser) + `/assets/promos/` + módulo `promo_banner` en index.js: si `activo=false`, fecha vencida, JSON roto o imagen faltante → **la página no se rompe** (banner no aparece o aparece solo texto). Sin dependencias externas.
- Documentación: **PROMOCIONES.md** (cómo cambiar la promo en 5 min + checklist mensual). Falta que subas la primera imagen `promo-2026-07.webp`.

## Componentes nuevos compartidos

- theme.css → sección "COMPONENTES LANDING (.lp-*)": breadcrumb, hero, bullets, CTA row, paneles, checklists ✓/—, FAQ rápida, tabla comparativa, grid de opciones, chips relacionados, sticky CTA móvil y banner de promos. **Cero !important, cero overrides de clases existentes.**
- **LANDINGS.md**: plantilla, checklist de creación, checklist WhatsApp, checklist QR/eventos, mensajes prellenados por tipo, recomendaciones OG y prioridad de réplica.

## Archivos modificados en esta sesión

`PARTIALS/global-header.html` (consolidación CSS + hrefs + link horas-soporte), `theme.css` (componentes .lp-* + promo-banner), `index.js` (módulo promo banner), `index.html` (slot de banner), `sitemap.xml` (+2 URLs), `SISTEMAS/comercialpremium.html`, `SERVICIOS/migraciones.html`, `SISTEMAS/colabora.html` (FAQ), `SERVICIOS/polizas.html` (1 línea de cross-link). **Nuevos:** `soluciones.html`, `SERVICIOS/horas-soporte.html`, `data/promociones.json`, `assets/promos/LEEME.txt`, `LANDINGS.md`, `PROMOCIONES.md`.

## Qué NO se tocó y por qué

- Los otros 15 sistemas y 5 servicios: regla de pilotos — no replicar hasta validar.
- mainindex.css / main.css / mainservicios.css: fuera de alcance de esta pasada; su consolidación necesita regresión visual página por página.
- Fuentes bloqueantes en páginas no piloto (falta el truco media=print): cambio compartido de bajo riesgo, pero es "tocar 20 páginas no piloto" → queda para la réplica.
- El grid de promos hardcodeado del home: convive con el banner nuevo; se migrará al JSON cuando valides el banner.
- JS del header (funciona; solo se auditó).

## Cómo probar (en el mini host, después de subir)

1. Header: abrir cualquier página → menús Sistemas/Servicios desktop, drawer móvil, logos con color correcto (amarillo comerciales, verde nube), "Horas prepagadas" visible en ambos menús.
2. Clic derecho → "Abrir en pestaña nueva" en links del menú: debe funcionar (hrefs reales).
3. Los 4 pilotos en móvil: entender la oferta sin scroll, sticky CTA visible y sin tapar el footer, sin scroll horizontal en 320/360/390/768/1280/1920.
4. WhatsApp: cada CTA abre con el mensaje y la página de origen correctos.
5. Banner de promo en home (sube antes promo-2026-07.webp; sin imagen debe salir solo texto).
6. validator.schema.org en los 4 pilotos + colabora.
7. Con JS deshabilitado: el contenido de las páginas se lee y los links del cuerpo funcionan (el header no aparece: deuda documentada de partials).

## Checklist por breakpoint (para la validación en host)

| Breakpoint | Header | Hero piloto | Cards/tabla | Sticky CTA | Sin scroll-X |
|---|---|---|---|---|---|
| 320 / 360 / 390 / 414 / 430 | ☐ | ☐ | ☐ (comparativa con scroll interno) | ☐ visible | ☐ |
| 768 / 820 | ☐ drawer | ☐ | ☐ lp-cols 1 col | ☐ visible hasta 820 | ☐ |
| 1024 | ☐ mega menús | ☐ | ☐ 2 cols | ☐ oculto | ☐ |
| 1280 / 1366 / 1440 / 1536 / 1920 | ☐ | ☐ | ☐ | ☐ oculto | ☐ |

## Pendientes reales

1. **Tú:** subir todo al mini host y avisarme → valido con Chrome y cerramos fases.
2. Subir imagen `assets/promos/promo-2026-07.webp` (1200×628 WebP).
3. Pegar URL real de Apps Script en index.js (mientras, el form cae a WhatsApp).
4. Diseñar imágenes OG por categoría (tabla en LANDINGS.md).
5. Replicar patrón landing a las páginas restantes (orden en LANDINGS.md) — solo tras validar pilotos.
6. Fase 6 (propuesta): build de partials estáticos + reducción profunda de !important en mainindex.css/main.css con regresión visual.

---

# ⚠️ ROLLBACK SELECTIVO (2026-07-05, cuarta sesión) — decisión del cliente

**El rediseño visual del index NO fue aprobado.** Se restauró la estructura visual original y se revirtió la estética global; se conservó todo lo técnico. Regla vigente: *"Respeta mi diseño actual. Refina, blinda y corrige. No rediseñes el index."* El copy "Distribuidor autorizado / Pon en orden tu contabilidad…" queda guardado como idea futura para design-lab (ver sección de abajo, ya NO aplicada).

## Restaurado (index + estética global)

- index.html: hero original (H1 con composición CONTPAQi/ExpIRITi + "Quiero una demo" + hero-gallery con carrusel y tabs), sección #sectores, Servicios en 2 columnas **con sus reels de servicios de vuelta**, preload de primera.webp (LCP). Eliminados: hero textual y franja calculadora.
- theme.css: gradientes de headings restaurados, paleta light original (#f6f8fc/#0b1220), espaciado de secciones original (20/18px), body 14px.
- mainindex.css: gradientes de headings del home restaurados (bloque 5 + #contacto), section-full 34/26px.
- global-footer.html: estilos de cards originales restaurados (glass, sombras, gradientes).

## Conservado (aprobado como técnico)

- Schema/JSON-LD (las 24+ páginas y el del index), sitemap, robots, OG.
- Fallback del formulario a WhatsApp; promociones JSON + slot de banner en #promociones.
- Hrefs reales y header consolidado; H1 sr-only en sistemas no piloto.
- Pilotos completos: comercialpremium (con calculadora arriba y CTAs teal), migraciones, horas-soporte, soluciones + componentes .lp-* (inertes en el index).
- **Contraste**: botón amarillo con texto oscuro (capa "letras blancas SIEMPRE" sigue eliminada — era un bug de contraste, no estética) y ámbar nunca con texto blanco.
- Tokens nuevos en :root (variables inertes, disponibles para design-lab; no cambian el look actual).
- Regla FABs-vs-sticky en páginas piloto (blindaje mobile).

## Refinamiento autorizado aplicado al hero

- Slides del hero gallery recortados a máx. 6 por sistema (antes 8–13): contabilidad 8→6 (además tenía 1 duplicada), nóminas 12→6, bancos 9→6, comercial pro 7→6, premium 12→6, factura 13→6, vende 9→6. Menos dots, mejor LCP y menos payload. Sintaxis JS verificada.

## Verificación del rollback (grep)

heroGalleryCarousel ✓ · "Quiero una demo" ✓ · #sectores ✓ · carouselReels-servicios ✓ (servicios vuelve a tener reels) · #promociones + promoBannerSlot ✓ · #faq ✓ · #contacto ✓ · JSON-LD del index intacto ✓ · cero restos de lp-hero-home/lp-band en index ✓ · sin errores de sintaxis en index.js ✓.

## Riesgos pendientes (validar en mini host)

1. Hero gallery con 6 slides: confirmar que carrusel, dots y tabs funcionan igual.
2. Botón "Quiero una demo" ahora con texto oscuro sobre amarillo: confirmar que te gusta visualmente (es el único cambio visible del hero).
3. Footer: confirmar que volvió idéntico en dark y light.
4. Pilotos con CTAs teal: confirmar que la jerarquía te convence antes de replicar.

Checklist responsive 320/390/768/1280/1440/1920: pendiente de la validación visual en mini host (misma tabla de la sección anterior).

---

# QA post-rollback + CTA hero (2026-07-05, quinta sesión)

**Index visualmente BLOQUEADO** (regla vigente). Solo QA, blindaje y el refinamiento puntual del CTA autorizado.

## CTA "Quiero una demo" — Variante A (Outline premium) aplicada

- **Censo previo**: `.btn-grad-yellow` se usa en 2 elementos (hero + botón "Enviar" del formulario) → cambiarla globalmente afectaba al Enviar. **No se tocó la clase global.**
- **Solución**: clase específica `.hero-demo-cta` solo en el botón del hero (se le retiró `btn-grad-yellow` para evitar guerra de !important → cero overrides).
- **Owner**: `.page-index .hero-demo-cta` en mainindex.css, junto al owner del botón amarillo, con variantes B y C documentadas en el mismo bloque por si se prefieren tras verlo.
- **Estilo A**: pill 999px, fondo crema #FFFBF0, borde 1.5px #D6940F, texto #8A5D00 bold, sombra sutil. Hover: fondo #FBEED0 + texto #5C3D00 + elevación. Focus ring ámbar visible. Tap 44px (heredado de .btn). Dark: fondo ámbar translúcido 10%, texto #F2C14E.
- **Contraste**: light ~6.6:1 (AA ✓), hover ~8:1, dark ~8:1. Botón "Enviar" intacto.

## Checklist QA (estático hecho · visual pendiente)

| Ítem | Estado |
|---|---|
| heroGalleryCarousel presente y con datos (≤6 slides/sistema) | ✓ código · ☐ visual |
| carouselReels-servicios presente | ✓ código · ☐ visual |
| carouselReels de sistemas presente | ✓ código · ☐ visual |
| promoBannerSlot no rompe sin imagen (onerror la retira, texto queda) | ✓ código · ☐ visual |
| Formulario cae a WhatsApp (GAS placeholder detectado) | ✓ código · ☐ funcional |
| Header hrefs reales (0 href="#") | ✓ |
| Schema intacto (index + 24 páginas) | ✓ |
| Sintaxis JS tras recorte de slides | ✓ |
| Consola sin errores | ☐ requiere navegador |
| Sin scroll horizontal 320–1920, dark/light, FABs | ☐ requiere navegador |

**Bloqueo actual:** la extensión Claude in Chrome no está conectada y los cambios aún no están en el mini host. Para cerrar: (1) subir carpeta al host, (2) conectar Chrome, (3) recorrer los 13 breakpoints y llenar la tabla de problemas.

# QA puntual: logos, pills, formulario (2026-07-05, sexta sesión)

Todo por edición de owners existentes; cero capas nuevas; estructura del index intacta; degradado del título "Sistemas CONTPAQi®" intacto; lenguaje naranja-activa/azul-inactiva de pills conservado.

| Área | Problema | Selector | Regla que ganaba | Corrección | Aplicado |
|---|---|---|---|---|---|
| Pills sistemas | `.hero-tab` con DOS owners: viejo teal/verdoso glass (l.65-66) vs final navy/naranja (l.955/957) | El final (posterior + !important); el viejo era código muerto que además aportaba el fondo verdoso | Owner viejo eliminado; `cursor:pointer` (única prop útil) migró al owner final | ✓ |
| Logos en pills | Logos CONTPAQi sobre navy/naranja sin base | `.hero-tab img` (l.68) y `.reel-tab img` (l.136) con `background:transparent` | Chip blanco sólido: fondo #fff, borde suave, radio 10, padding, sombra mínima — en ambos owners | ✓ |
| Logos en cards | `.logo-sistema` fondo rgba(255,255,255,.02) → deslavado en dark/glass | Owner l.107 | Base sólida #fff + borde + padding 8/12 + sombra mínima | ✓ |
| Formulario | Inputs invisibles en light: fondo rgba(255,255,255,.03) y borde blanco sobre card blanca | Owner base l.181-183 (sin override light de fondo) | Fondo sólido (#fff light / slate dark), borde visible, focus teal con anillo; light override junto al owner | ✓ |
| Placeholder | 85% de un color ya translúcido | l.343 | Intensidad completa (var(--ix-oncard2)) | ✓ |
| "Enviar" | Ámbar translúcido poco definido | Owner `.btn-grad-yellow` (ahora solo lo usa Enviar) | Ámbar sólido moderado #F6CE58→#EBB02E, borde #D6940F, texto oscuro 900, hover elevado, focus ring — hermano sólido de .hero-demo-cta | ✓ |
| Servicios/Sistemas (interés) | — | `.interest-mode/.interest-cat` (l.1017-1018) | **Sin cambios**: la activa YA es crema+borde ámbar (armoniza con hero-demo-cta) y la inactiva blanca neutra | n/a |
| Fondo verdoso | Principal causante era el owner muerto de pills (eliminado). Tintes teal restantes (svc-featured, map-embed) son identidad | — | Sin cambio adicional; revisar en host si aún ensucia | pend. |

Riesgos: logos .webp con fondo propio blanco ahora quedan sobre chip blanco (invisible el chip, no rompe); el padding nuevo de .logo-sistema reduce ~16px el área del logo en cards (verificar en 320px). Validación visual en mini host: pendiente (Chrome no conectado / cambios sin subir).

# QA v2 con capturas del cliente (2026-07-05, séptima sesión)

| Área | Selector | Problema | Regla que ganaba | Corrección | Aplicado |
|---|---|---|---|---|---|
| Chips blancos en pills | `.hero-tab img` / `.reel-tab img` | Los logos de esas pills son BLANCOS → el chip los ocultaba y parecía parche | Mis owners de la sesión anterior | **Revertidos** (opción A): logo directo sobre pill | ✓ |
| Pill activa | `.hero-tab.active` + reel-tabs (owner l.~955) | Naranja neón chillón | Ese owner | **Rojo ExpIRITi** (#F0606C→#E14B5A→#C93B4A), aprobado por cliente | ✓ |
| Pill inactiva | owner l.~957 | Navy muy pesado | Ese owner | Azul sobrio #39498C→#2E3F7E→#24396F (valores propuestos por cliente) + hover elevación sutil | ✓ |
| Logos en cards | `.logo-sistema` | Blanco plano lavaba logos plateados de comerciales/nube | Owner l.107 | Base por CATEGORÍA (lenguaje del burger): comerciales=ámbar, nube=verde ExpIRITi, resto=blanca; padding reducido 8/12→4/10 | ✓ |
| Interés activo | `.interest-mode.is-active` | Cliente pidió rojo ExpIRITi, mismo estilo | Owner l.1018 | Solo cambió el hue: soft rojo + borde rojo | ✓ |
| CTA sistemas/index | `.btn-grad-green` (theme) | Amarillo poco llamativo | Owner theme l.14 | **Rojo ExpIRITi sólido + blancas negritas** (contraste 4.6:1 AA) | ✓ |
| "Quiero una demo" | `.hero-demo-cta` | Ocupaba todo el ancho | (flex del hero-copy lo estiraba) | `width:fit-content` en el owner — mitad de ancho en mobile/desktop | ✓ |
| Mapa del sitio index | `body.page-index .toc` | Bloque "UI REFINES v2026.05.12" **pegado 4 veces** (~80 líneas duplicadas) aplanaba el TOC; yo no lo quité, era deuda previa | El bloque FINAL posterior | 4 copias eliminadas; owner FINAL extendido con puntos azules estilo sistemas | ✓ |
| "Desliza" servicios burger | `.gh-svcdots::before` | **FE DE ERRATAS**: mi consolidación lo borró creyéndolo duplicado de .gh-SYSdots (selector distinto) | — | Restaurado como owner único en CAPA 3 | ✓ |
| Mapa sobre burger | `.toc` con drawer abierto | FAB visible encima del menú | z-index del toc | `html.gh-open` oculta toc/rayo/SAT mientras el drawer está abierto | ✓ |
| Marca header móvil | `.gh-brand-txt .s` | "Expertos CONT…" cortado | ellipsis del owner mobile | 9px + overflow visible + logo 58→54 para dar espacio: texto completo siempre | ✓ |
| Burger swipe | drawer sistemas/servicios | Dots/categorías no sincronizaban al deslizar; pill de categoría fuera de vista al tocar | — | Módulo guardado en index.js: sync por scroll + centrado de categoría + dots clicables (no toca lógica existente) | ✓ |
| Promo banner | módulo promo index.js | Cliente pidió: solo mes arriba, sin título/descripcion, CTA "Pide tu Promo" DEBAJO de las imágenes | — | Módulo v2 + ctaTexto actualizado en JSON | ✓ |
| Comercial Premium | página completa | La landing no debía vivir en la página normal | — | **comercialpremium.html restaurada** (H1 logo, badges, calculadora en su lugar, sin sticky) + **comercialpremiumlp.html NUEVA**: ficha rápida con videos, canonical a la página principal. Patrón LP: `{sistema}lp.html` | ✓ |

**Decisión de color respondida:** rojo ExpIRITi = estado ACTIVO/CTA principal; azul sobrio = inactivo; verde ExpIRITi = identidad de categoría Nube (cards y burger); ámbar = solo hero-demo-cta y Enviar. El verde NO se usó como "activo" para no chocar con su significado de categoría.

Validación visual en host: pendiente (mismos bloqueos: subir cambios + conectar Chrome).

# [NO APLICADO — archivado como referencia] Rediseño visual por tokens (2026-07-05, tercera sesión)

**Base:** VISUAL_UI_AUDIT.md aprobado con candados. **Estado: PENDIENTE DE VALIDACIÓN VISUAL EN MINI HOST** (nada se marca cerrado hasta verlo publicado).

## Tokens implementados (theme.css, editando valores existentes — cero capas nuevas)

- Nuevos tokens en `:root`: `--ink --ink-2 --line --brand-deep --accent(#0E9488) --amber(#E9A819) --sp-1..8 --r-s/m/l --shadow-s/m`.
- Tema light recalibrado: fondo `#FAFBFD`, texto `#0F1B2D`, secundario `#46556B`, borde hairline `#E6EAF1`, sombra en reposo casi nula (elevación por borde).
- **Headings sólidos globales**: la regla que aplicaba gradiente a `h3/.title-gradient/.gradient-word` ahora usa color sólido. Único gradiente que sobrevive: la marca del header (`--title-grad`), declarado como excepción global.
- Espaciado de secciones: 20px → 48px (64px desktop), con guarda `section section{padding:0}` para secciones anidadas.
- Cuerpo de texto: 14px → 15px.
- **Ámbar = rol precio/promo con texto oscuro SIEMPRE** (candado cumplido): `.btn-grad-green` ahora `#0F1B2D`.
- Componentes nuevos en la sección .lp- existente (sin !important): `.lp-kicker .lp-hero-home .lp-trustband .lp-band` y regla FABs-vs-sticky.

## Consolidaciones (regla ganadora documentada)

| Archivo | Conflicto | Ganaba | Acción |
|---|---|---|---|
| mainindex.css | Botón amarillo: owner con texto oscuro (l.642) pisado por capa "PATCH MIN letras blancas SIEMPRE" (l.668) | La capa blanca | **Capa blanca eliminada**; owner único = texto oscuro. Dark theme corregido igual |
| mainindex.css | Gradientes de headings del home (2 bloques + fallback @supports) | Gradiente !important | Sustituidos por sólido; el de #contacto unificado al mismo canon |
| mainindex.css | `.section-full` 34px pisaba el aire global nuevo | 34px | Migrado a tokens (64/48px) |
| global-footer.html | Columnas y logos como glass-cards con blur+sombra+gradiente | — | Aplanados: columnas transparentes, cards de logo con borde hairline sin sombra/blur (valores editados en las reglas existentes) |

## Home reestructurado (orden aprobado)

1. **Hero limpio** (`.lp-hero-home`): kicker "Distribuidor autorizado CONTPAQi®" → H1 comercial visible "Pon en orden tu contabilidad, nómina y facturación con CONTPAQi" → subtítulo → **CTA WhatsApp (teal)** + "Ver sistemas" → franja de confianza (4 items, sin cards). **Eliminado:** carrusel de galería (posts de redes), pills duplicadas de sistemas, H1 hecho de imágenes, botón amarillo/blanco, preload de `primera.webp` (ya no es LCP).
2. Sistemas (única aparición de logos + su bloque de reels = **el único** del home).
3. **Franja calculadora** (`.lp-band`): "Calcula tu inversión sin hablar con nadie" con accesos ámbar (rol precio) a las calculadoras de Contabilidad/Nóminas/Comercial Premium. Sustituye a #sectores (su contenido vive ahora en la franja de confianza del hero).
4. Servicios a ancho completo (**eliminado** el segundo bloque de reels; JS verificado: retorna sin romper si no existe el carousel).
5. Promociones (banner JSON + grid) → FAQ → Contacto/mapa → Footer aligerado.

## Pilotos ajustados

- **comercialpremium**: CTA primario teal + CTA ámbar "Calcular mi inversión ↓"; **calculadora movida arriba** (tras la FAQ rápida, antes de beneficios); badges 4→3 uniformes.
- **migraciones / horas-soporte / soluciones**: CTA primario WhatsApp → teal; secundarios a botón neutro (jerarquía 1-2-3); cero ámbar fuera de rol precio.
- FABs: en páginas con sticky móvil, `.toc` y `#svc-actions` se ocultan <820px; SAT se conserva (candado respetado).

## Conteos

- `!important` header: 76 (sin cambio; sesión anterior 81→76).
- Líneas CSS con `!important`: 723 → **719** (mainindex 476→471; el resto igual). La reducción profunda quedó para Fase 6 con regresión visual, como acordado.
- Gradientes de texto activos: ~15 reglas → **1** (marca del header).
- Bloques de reels en home: 3 → **1**. Apariciones de logos de sistemas en home: 3 → 1 (+tabs interactivos del reel).

## Archivos modificados (esta sesión)

`theme.css`, `mainindex.css`, `index.html`, `PARTIALS/global-footer.html`, `SISTEMAS/comercialpremium.html`, `SERVICIOS/migraciones.html`, `SERVICIOS/horas-soporte.html`, `soluciones.html`. **No tocados:** lógica de calculadora/forms/carousels/menús (solo posición y clases de CTA), páginas no piloto, main.css, mainservicios.css/js, header (ya consolidado).

## Riesgos declarados (revisar en la validación)

1. Hero nuevo del home en dark theme (los tokens recalibraron light; dark hereda vars existentes — verificar contraste del trustband).
2. Aire nuevo entre secciones puede exagerar huecos donde había márgenes negativos ad-hoc (home y comercialpremium).
3. CSS muerto del hero viejo (hero-h1/hero-gallery en mainindex) es inofensivo pero pesa; purga en Fase 6.
4. Calculadora reubicada: verificar que precios-contpaqi.js + calculadora.js la inicializan igual (no dependen del orden del DOM, pero confirmar en host).
5. Footer aplanado en dark theme: los logos con fondo `var(--card)` oscuro — verificar que los WebP con fondo transparente se vean bien.
6. Servicios a ancho completo: el grid 2x1 desktop de cards puede verse ancho; evaluar en 1440/1920.

## Checklist responsive para la validación en host

| Vista | 320 | 390 | 768 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Home: hero limpio, CTAs, trustband | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Home: franja calculadora y servicios full-width | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| comercialpremium: primera pantalla 30s + calculadora arriba | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| migraciones / horas-soporte: hero+tabla+sticky | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| soluciones: grid 8 opciones | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Footer aligerado + FABs (sticky sin choque) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Dark theme en todo lo anterior | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Sin scroll horizontal en ninguna | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

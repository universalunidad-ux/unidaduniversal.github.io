# Auditoría NUEVAEXPIRITI — 6 jul 2026
**Modo: análisis + checkpoint. NO se ejecutó ningún cambio de diseño.**

Checkpoint creado: `_CHECKPOINT_20260706-202607/` (46 archivos: todo el CSS, JS, HTML, PARTIALS y JSON; excluye IMG y PDFS por peso). Punto de retorno seguro antes de tocar index / sistemas / servicios.

Regla que gobierna todo: **"Respeta mi diseño actual. Refina, blinda y corrige. No rediseñes."**

---

## 0. Cómo está cableado hoy (hallazgos clave)

- **Cards de sistemas (index):** `article.card.product-card > .body > img.logo-sistema`, agrupadas por panel: `#panel-contable`, `#panel-comercial`, `#panel-nube`, `#panel-productividad`.
- **La placa por categoría YA EXISTE** en `mainindex.css:115-116`:
  - `#panel-comercial .logo-sistema` → ámbar `#DFA22A→#C8880D` (sin `!important`)
  - `#panel-nube .logo-sistema` → teal `#3FA294→#2A7F78` (sin `!important`)
- **Por qué se ve blanco igual:** `theme.css:45` tiene
  `html[data-theme="light"] .logo-sistema{background:var(--logo-frame-bg)!important…}`
  que **pisa** la placa de categoría en modo claro con `!important`. `--logo-frame-bg` claro = gris translúcido → sobre card blanca queda casi blanco → letras claras del logo se pierden. **Ese es el "chip blanco duro".**
- **Rayito (⚡ FAB) de páginas de sistema:** `main.js:336`. Lee `#app[data-pdf]` y arma la ruta `PDFS/<archivo>`. Botón "Ficha técnica PDF" sale **solo si** `#app` tiene `data-pdf`.
- **NO existen placeholders** `/fichas/AQUI_TU_ARCHIVO.pdf`. El grep salió vacío. Hoy el PDF se arma con el nombre real crudo (`Ficha CONTPAQi® X.pdf`, con ®, espacios y acentos → URL fea pero funcional).
- **Swipe:** `index.js:101` es un handler correcto de eje-bloqueado (`touch-action:pan-y`, solo hace `preventDefault` cuando el gesto es horizontal dominante). **No bloquea el scroll vertical.** Pero solo se aplica a `#heroGalleryCarousel` y `.carousel[id^='carouselReels-']`, **no a las tablas comparativas.**
- **Intactos y verificados presentes:** `heroGalleryCarousel` (1), `promoBannerSlot` (1), `carouselReels-comercial/nube` (2), `carouselReels-servicios` (en 6 servicios + index), `promociones.json`. No se tocan.

---

## 1. TABLA PRE-FLIGHT (antes de tocar)

| Área | Selector / archivo | Problema | Regla que gana | Corrección propuesta | Riesgo |
|---|---|---|---|---|---|
| Placa logos Comerciales | `#panel-comercial .logo-sistema` (mainindex.css:115) vs `theme.css:45` | La placa ámbar existe pero `theme.css:45 !important` la pisa en modo claro → chip casi blanco, logo se pierde | "Blinda y corrige" (bug de contraste) | Excluir `#panel-comercial/#panel-nube` del override genérico de `theme.css:45`, o re-declarar placa ámbar con `!important` + scope claro/oscuro | Bajo — scope acotado a 2 paneles; no toca tabs/reels/contables |
| Placa logos Nube | `#panel-nube .logo-sistema` (mainindex.css:116) | Igual: teal pisado por override claro | Blinda y corrige | Placa teal institucional `#3FA294→#2A7F78` ganando en ambos temas | Bajo |
| Contraste 320/390 | `.logo-sistema` padding/border-radius | Verificar que la placa no recorte el logo en pantallas chicas | Blinda | Validar padding 10-12px + `object-fit:contain` en 320/390 | Bajo |
| Amarillo saturado (dots) | `.page-sistemas .group-dots .active` (main.css:303 y theme.css:324) `#f6cb42→#f59e0b` | Amarillo chillón en indicadores de carrusel | "Cambiar amarillo saturado propio" | Bajar a ámbar sobrio (`#E3B23C`/`#C8880D`), alineado a `--ex-cta-yellow` ya corregido | Bajo — es UI propia, no logo oficial |
| Amarillo saturado (picker contacto) | `theme.css:156` `.interest-system:has(img[src*="comercial…"])` `#f8e27a→#efc93d` | Fondo amarillo saturado detrás de logos comercial/factura en el selector de contacto | Cambiar amarillo propio | Tono crema/ámbar `#F3E1B0→#E3B23C` | Bajo — es placa UI, no imagen oficial |
| Amarillo (placa carrusel #integra) | `.page-sistemas .carouselX .sys img` (main.css:303) `#f3d86f→#ebbc32→var(--ex-cta-yellow)` | Dorado alto en placa del carrusel de sistemas | Cambiar amarillo propio | Ya usa var corregida al final; suavizar los 2 stops superiores | Medio — es placa de logo; validar contraste con logos claros |
| Ruta PDF cruda | `#app[data-pdf="Ficha CONTPAQi® X.pdf"]` + `main.js:336` (base `PDFS/`) | Nombres con `®`, espacios y acentos → URL fea, frágil, mal para SEO | "Ficha técnica → PDF real" + rename a `/fichatecnica/` | Renombrar carpeta→`fichatecnica`, archivos→slug limpio, y actualizar `data-pdf`+base JS (cambio atómico) | Medio — si se renombra sin actualizar wiring, se rompe el rayito. Hacer junto |
| PDF sin ficha | `anticipa.html`, `optimiza.html` | No hay PDF "Anticipa" ni "Optimiza" en la carpeta | "No inventar si no hay PDF" | Dejar sin botón de ficha (no inventar) o usar la ficha del combo que aplique | Ninguno |
| Tablas comparativas mobile | `.table-like` en 22 tablas; wrapper `.card.body{overflow-x:auto}` solo en `.page-sistemas` (main.css:241) | En servicios no hay wrapper con `overflow-x` equivalente; `.table-like` sin `min-width` se comprime en vez de hacer scroll | "Scroll horizontal interno; no bloquear vertical" | Envolver cada tabla en `.table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}` + `min-width` a la tabla; opcional: aplicar el swipe-fix de index.js a estos wrappers | Medio — muchos archivos; cambio mecánico y reversible |
| Servicios overflow | `.page-servicios` sin regla `.card.body{overflow-x}` | Tablas de servicios (soporte, migraciones, etc.) pueden desbordar el global | No generar scroll horizontal global | Agregar wrapper por tabla, no tocar `body`/`html` | Medio |

---

## 2. INVENTARIO PDF Y MAPEO DE FICHAS

Carpeta `/PDFS` (18 PDFs útiles + basura `A` de 2 bytes + `Ficha … Evalúa.pdf` duplicado de `Evalua.pdf`).

| Página (SISTEMAS) | `#app data-pdf` actual | PDF real encontrado | Ruta limpia propuesta | Estado |
|---|---|---|---|---|
| contabilidad.html | Ficha CONTPAQi® Contabilidad.pdf | ✅ Contabilidad | /fichatecnica/contabilidad.pdf | OK |
| nominas.html | Ficha CONTPAQi® Nóminas.pdf | ✅ Nóminas | /fichatecnica/nominas.pdf | OK |
| bancos.html | Ficha CONTPAQi® Bancos.pdf | ✅ Bancos | /fichatecnica/bancos.pdf | OK |
| xmlenlinea.html | Ficha CONTPAQi® XML.pdf | ✅ XML | /fichatecnica/xml.pdf | OK |
| comercialstart.html | Ficha CONTPAQi® Comercial Start.pdf | ✅ Comercial Start | /fichatecnica/comercial-start.pdf | OK |
| comercialpro.html | Ficha CONTPAQi® Comercial PRO.pdf | ✅ Comercial PRO | /fichatecnica/comercial-pro.pdf | OK |
| comercialpremium.html | Ficha CONTPAQi® Comercial Premium.pdf | ✅ Comercial Premium | /fichatecnica/comercial-premium.pdf | OK |
| facturaelectronica.html | Ficha CONTPAQi® Factura Electrónica.pdf | ✅ Factura Electrónica | /fichatecnica/factura-electronica.pdf | OK |
| contabiliza.html | Ficha CONTPAQi® Contabiliza.pdf | ✅ Contabiliza | /fichatecnica/contabiliza.pdf | OK |
| personia.html | Ficha CONTPAQi® Personia.pdf | ✅ Personia | /fichatecnica/personia.pdf | OK |
| vende.html | Ficha CONTPAQi® Vende.pdf | ✅ Vende | /fichatecnica/vende.pdf | OK |
| colabora.html | Ficha CONTPAQi® Colabora.pdf | ✅ Colabora | /fichatecnica/colabora.pdf | OK |
| analiza.html | Ficha CONTPAQi® Analiza.pdf | ✅ Analiza | /fichatecnica/analiza.pdf | OK |
| evalua.html | Ficha CONTPAQi® Evalúa.pdf | ✅ Evalúa (hay 2 copias) | /fichatecnica/evalua.pdf | OK (borrar duplicado) |
| anticipa.html | (solo cta-strip, sin `#app`) | ❌ No hay PDF Anticipa | — | Sin ficha (no inventar) |
| optimiza.html | (solo cta-strip, sin `#app`) | ❌ No hay PDF Optimiza | — | Sin ficha (no inventar) |

**PDFs huérfanos** (sin página que los use): `Checklist Sistema Contable.pdf`, `Ficha CONTPAQi® Despachos.pdf`, `Ficha CONTPAQi® Respaldos.pdf`. Se conservan; decidir si crear página o enlazar desde soluciones.

**Plan de rename (atómico, un solo paso):**
1. `PDFS/` → `fichatecnica/` + renombrar cada archivo a slug ASCII (sin ®, sin espacios, sin acentos).
2. Cambiar `#app data-pdf` de cada sistema al slug limpio.
3. Cambiar la base en `main.js:336` de `PDFS/` a `fichatecnica/`.
4. Borrar basura (`A`) y duplicado `Evalúa`.
> Nota: dejar `/PDFS` como copia hasta confirmar en host, luego borrar.

---

## 3. RESPUESTA DIRECTA: ¿qué color para las placas?

Los logos CONTPAQi comerciales y nube son **letras blancas/claras** → necesitan placa con suficiente cuerpo. Recomendación (mantiene estética, no chillón):

- **Comerciales → ámbar/crema profesional:** `linear-gradient(135deg,#DFA22A,#C8880D)`, borde `#B37A0C`. (Ya es el valor que está en el CSS; solo hay que hacerlo ganar sobre el override claro.) Es cálido, institucional, alto contraste con blanco.
- **Nube → teal institucional:** `linear-gradient(135deg,#3FA294,#2A7F78)`, borde `#26736D`. Coherente con la marca CONTPAQi nube (turquesa) y con `--ex-cta-green`.
- **Contables (por consistencia):** dejar el marco neutro actual, o azul institucional suave `#2E5AAC→#1E3F86` si quieres los 4 paneles diferenciados por color.

Los tabs/pills se dejan como están (tú lo pediste). El cambio es **solo** en las cards clicables.

---

## 4. MOBILE / SWIPE (lo que más te importa)

Estado real:
- El **swipe del hero y de los reels ya está bien** (`index.js:101`, eje bloqueado, no roba scroll vertical). No tocar.
- Las **tablas comparativas NO usan ese swipe**; dependen de `overflow-x` nativo. En sistemas hay wrapper (`.card.body`), en **servicios no** → riesgo de desborde/compresión.
- `.table-like` **no tiene `min-width`** → en vez de scrollear, se comprime y queda ilegible en 320/390.

Corrección propuesta (blindaje, no rediseño):
1. Envolver cada `<table>` comparativa en `<div class="table-scroll">` con `overflow-x:auto; -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain`.
2. Dar `min-width` realista a la tabla (p.ej. 640–760px) para que **haya algo que scrollear**.
3. Reutilizar el handler de `index.js:101` sobre `.table-scroll` para swipe con inercia y eje bloqueado (mismo patrón probado, no bloquea vertical, no genera scroll horizontal global).
4. Indicador visual "desliza →" en el borde en mobile (hint sutil), como el que ya existe en otras zonas.

Validar en 320 / 390 / 768 / 1280 / 1440 antes de cerrar.

---

## 5. ESTRATEGIA DE LANDINGS (LP)

Convención actual confirmada:
- **Páginas normales** (informativas, navegables, con calculadora/comparativa): `contabilidad.html`, `comercialpremium.html`, etc.
- **Landings** (ficha rápida, 30 seg, foco WhatsApp): `comercialpremiumlp.html` (y futuras `*lp.html`).

Recomendación de indexación:
- **Página normal = indexable** (canonical a sí misma). Es tu activo SEO principal por sistema.
- **LP = `noindex,follow` + `canonical` apuntando a la página normal.** Motivo: la LP y la página normal compiten por la misma keyword ("CONTPAQi Comercial Premium") → **canibalización**. Con LP en noindex evitas contenido duplicado y concentras autoridad en la página normal, mientras la LP sigue viva para campañas pagadas (Ads/WhatsApp).
- Alternativa si la LP es para SEO orgánico distinto (long-tail "ficha rápida cotizar"): entonces indexable con canonical propio y contenido claramente diferenciado. Pero para B2B recomiendo la primera opción.
- **No replicar LPs todavía** (tú lo pediste). Solo dejar definida la regla `noindex+canonical` para cuando se creen.

---

## 6. SEO / AEO TÉCNICO SERIO (para superar competencia nacional)

Ya tienes buena base (robots, sitemap, JSON-LD LocalBusiness/WebSite/FAQ/SoftwareApplication/Service/Breadcrumb, H1, canonical, title/description). Lo que **falta** para pasar al primer orden:

**Schema / AEO (lo que hace que te citen ChatGPT/Gemini/Perplexity y salgas en respuestas de IA):**
- `Organization` raíz con `sameAs` (redes, perfil CONTPAQi como distribuidor autorizado), `logo`, `contactPoint` con `areaServed: MX` e idioma `es-MX`.
- `Product` + `Offer` por sistema con `priceCurrency: MXN` y `priceValidUntil` (aunque el precio sea "desde" o "cotizar", marca rango). Esto te hace elegible a rich results de producto.
- `AggregateRating`/`Review` **solo si tienes reseñas reales** (Google Business). No inventar.
- `HowTo` en páginas de servicios (implementación, migración) → muy citable por IA.
- `Speakable` en FAQs para asistentes de voz.
- `BreadcrumbList` en TODAS las páginas (verificar servicios).
- Marcar `distribuidor autorizado CONTPAQi` explícito en Organization/Brand → señal de confianza que la competencia revendedora suele omitir.

**AEO / contenido para IA (donde se gana la guerra hoy):**
- Bloque de **FAQ real por sistema** con preguntas que la gente le hace a la IA: "¿cuánto cuesta CONTPAQi Contabilidad?", "¿CONTPAQi sirve para mi giro?", "¿diferencia entre Start, Pro y Premium?". Respuestas de 40-60 palabras, directas → formato que la IA extrae.
- **Tabla comparativa con competencia real** (Aspel, QuickBooks) — ya la tienes; asegúrate de que sea texto indexable, no imagen.
- Página **"CONTPAQi vs Aspel"** y **"cuál CONTPAQi elegir"** (comparadores) → capturan búsqueda de decisión, muy citadas por IA.
- **glosario/blog** fiscal-contable (CFDI 4.0, Carta Porte, complementos SAT) → topical authority nacional.

**Técnico de rendimiento (Core Web Vitals = ranking):**
- Verificar LCP del hero (imágenes `webp` ya, bien). Añadir `fetchpriority="high"` a la imagen LCP y `preload`.
- `width/height` en todas las imágenes (ya en cards) → evita CLS.
- Lazy-load ya presente; verificar que el hero NO sea lazy.
- Minificar CSS (theme.css 84KB, mainindex.css 113KB, main.css 101KB son grandes) y considerar critical-CSS inline para el primer render.
- `font-display:swap` y preconnect a orígenes de fuentes/CDN.

**Local / nacional (perfil de venta MX):**
- `LocalBusiness` con `NAP` consistente (nombre, dirección, teléfono) idéntico a Google Business Profile.
- `areaServed` = México (y estados clave si vendes nacional).
- hreflang `es-MX`.
- Página de **cobertura/"vendemos en toda la República"** con ciudades → long-tail local ("CONTPAQi en Guadalajara/Monterrey/CDMX").

**Confianza / conversión B2B (y B2C menor):**
- Sellos: distribuidor autorizado CONTPAQi, años de experiencia, número de clientes.
- Casos de éxito / testimonios (con Review schema).
- WhatsApp + formulario con fallback (ya tienes) → bien para B2C.
- Para B2B: CTA "agenda demo" + "solicita cotización formal" separados del WhatsApp casual.

**Otros pendientes fuera de CSS/JS:**
- `Open Graph` + `Twitter Card` completos por página (imagen 1200×630) → mejor CTR al compartir.
- `sitemap.xml`: verificar que incluya todas las páginas de sistemas y servicios con `lastmod`.
- `robots.txt`: confirmar que apunta al sitemap y no bloquea `/fichatecnica/`.
- Página 404 personalizada.
- `security.txt` y favicon/manifest completos (PWA-lite) → señal de profesionalismo.
- Accesibilidad: contraste AA en textos sobre placas de color (validar con las nuevas placas ámbar/teal).

---

## 7. ORDEN DE EJECUCIÓN RECOMENDADO (cuando autorices)

1. Placas de logo comercial/nube (fix override `theme.css:45`) — validar 320/390.
2. Amarillo propio → ámbar/crema (dots, picker contacto, placa #integra).
3. Rename PDFS→fichatecnica + slugs + wiring (atómico) + grep de verificación.
4. Wrappers `.table-scroll` + min-width + swipe en tablas comparativas — validar 320/390/768/1280/1440.
5. Auditoría fina servicios (CTAs, tablas, FABs, schema, mobile).
6. SEO/AEO: Organization+sameAs, Product/Offer, OG/Twitter, FAQ por sistema, LP noindex+canonical.
7. Verificación final: grep placeholders, heroGalleryCarousel, carouselReels-servicios, promoBannerSlot, promociones intactas; QA responsive; no marcar cerrado sin validar en host.

**Nada de lo anterior se ejecutó.** Este documento es el paso "antes de tocar".

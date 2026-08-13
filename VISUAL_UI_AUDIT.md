# VISUAL_UI_AUDIT.md — Auditoría visual honesta
Fuente: capturas 01–10 de la versión publicada (GitHub Pages). Documento de dirección, no de implementación. Nada de lo aquí escrito se ha tocado en código.

Nota de contexto: los pilotos .lp-* ya construidos (comercialpremium, migraciones, horas-soporte, soluciones) apuntan en la dirección correcta de este documento, pero las capturas son de la versión publicada anterior, así que audito lo que se ve.

---

## A) Diagnóstico brutal en 10 puntos

**1. Todo es una tarjeta, entonces nada es importante.** Cards dentro de cards dentro de secciones con sombra: el hero es una card, los reels son una card dentro de otra card, cada logo del footer tiene su propia mini-card. Cuando todo tiene borde, radio y sombra, el ojo no encuentra jerarquía. Lo premium se construye con aire y contraste de peso, no con contenedores.

**2. El hero no vende: enlista.** "Licencias, cursos, desarrollos y soporte con ExpIRITi" es un índice de catálogo, no una promesa. No dice para quién, no dice el beneficio, no dice por qué contigo. Y el ojo ni siquiera empieza ahí: lo primero que jala la mirada es el carrusel derecho con una imagen de post de redes ("¿Y si hoy alguien modificó nómina…?"). El elemento más grande de la primera pantalla es un flyer de Instagram — exactamente la sensación "flyer pegado" que quieres evitar.

**3. Un solo CTA, y encima ilegible.** "Quiero una demo": texto blanco sobre amarillo — falla contraste (WCAG) y se ve deslavado. No hay CTA de WhatsApp en el hero siendo WhatsApp tu canal #1 de ventas. En las páginas internas es peor: la primera pantalla de Contabilidad no tiene NINGÚN CTA (logo + 5 pills + card de beneficios; para cotizar hay que scrollear 6+ pantallas hasta la calculadora).

**4. Ruleta de colores.** En una sola pantalla conviven: azul marino, teal, amarillo/ámbar, naranja, rosa/rojo, morado, verde. Los headings cambian de gradiente por sección ("Sistemas" azul-rojo, "Reels" rojo-teal, "Promociones" rosa-verde). Los íconos de servicios son clipart multicolor de familias distintas. Un sitio enterprise usa 1 color dominante + 1 acento; aquí hay 6 acentos compitiendo.

**5. Repetición que satura.** Los mismos 4 logos de sistemas aparecen 3 veces en las primeras 2 pantallas del home (pills del hero, cards de sistemas, tabs de reels). Hay 3 bloques de video vertical en el home (galería hero + reels contables + reels de servicios). Cada repetición diluye a la anterior.

**6. Sopa de pills/badges.** Contabilidad abre con 6 pills de 4 colores distintos ("Actualizado 2025", "Contabilidad electrónica", "Pólizas automáticas…", "Nueva conexión…", "Reportes fiscales…"). Ninguna es accionable, ninguna tiene jerarquía, y juntas parecen etiquetas de marketplace. Máximo 3 badges, un solo estilo.

**7. Controles de carrusel por todos lados.** 12 dots bajo el carrusel del hero, flechas circulares en 5 componentes distintos, sliders dentro de cards dentro de grids. Cada control es una micro-decisión para el usuario. Una ficha comercial no debería pedir tantas decisiones.

**8. Iconografía sin sistema.** Header usa SVG de línea limpios (bien), servicios usan clipart plano multicolor, funciones usan ilustraciones 3D-ish de otro set, la comparativa usa emojis (✅❌⚠️). Cuatro lenguajes visuales de ícono = sensación de armado con retazos. Los emojis en tablas comparativas son lo menos enterprise del sitio.

**9. Los flyers CONTPAQi mandan sobre tu marca.** La sección Promociones muestra el arte oficial de CONTPAQi ("Cámbiate y gana 40%") a sangre, recortado y desalineado. Los flyers son necesarios (son la promo real) pero sin marco, sin grid uniforme y sin contexto, convierten tu página en tablón de anuncios.

**10. Tres FABs flotantes compitiendo.** SAT + rayo + Mapa apilados abajo-derecha. En móvil, esa esquina + el sticky CTA planeado = 4 elementos flotantes. El monitor SAT es un diferenciador genial, pero tres círculos flotantes permanentes es demasiado protagonismo para utilidades.

**Veredicto en una frase:** el sitio tiene contenido de distribuidor serio con vestimenta de catálogo/dashboard saturado; sobra decoración y repetición, falta jerarquía, aire y un CTA dominante.

---

## B) Qué conservar (funciona y es diferenciador)

1. **La calculadora de inversión** — oro puro. Casi ningún distribuidor CONTPAQi publica precios interactivos. Merece subir de jerarquía, no quedar enterrada tras 6 pantallas.
2. **Header**: estructura, mega menús, pill de WhatsApp con número visible, toggle de tema. Sólido; solo necesita menos peso tipográfico.
3. **FAQ en acordeón** — limpio, escaneable, ya con schema.
4. **Formulario de contacto** con selector visual de interés + mapa — bien resuelto.
5. **Reels con persona real** — dan confianza y cara humana. El problema es la triplicación, no el componente.
6. **Comparativas por sistema** (vs Aspel/QuickBooks) — argumentos de venta reales; solo cambiar emojis por iconos.
7. **El monitor SAT** — diferenciador único; consolidarlo, no eliminarlo.
8. **Disciplina técnica**: WebP, lazy loading, dark/light theme.

## C) Qué eliminar o reducir

- **Duplicación de logos de sistemas en home**: de 3 apariciones a 1 (las cards con "Ver más" son la buena).
- **Bloques de reels en home**: de 3 a 1 (una sección "Conócenos en video" con tabs).
- **Dots del carrusel hero**: de 12 slides a máx. 5, o quitar el carrusel del hero por completo (ver H).
- **Badges por página**: máx. 3, un solo color de sistema.
- **Gradientes en headings**: de ~4 gradientes a 1 (o texto sólido con kicker de color).
- **Emojis en tablas y footer** (📍🕘📞✉️ / ✅❌⚠️) → iconos del sistema.
- **Cards-por-todo**: logos del footer, listas de sectores y bullets no necesitan caja individual.
- **FABs**: de 3 a 1 colapsable (SAT como principal; mapa vive en Contacto).

## D) Qué reorganizar

- **CTA de WhatsApp al hero** (primario) + "Cotizar" (secundario). El teléfono ya está en el header.
- **Calculadora**: anclarla desde el hero de cada sistema ("Calcula tu inversión ↓") y desde el home.
- **Promociones**: marco uniforme 1:1, grid de 3, título del mes, CTA — una "zona flyer" contenida y con reglas (el banner JSON ya creado va en esa dirección).
- **"¿Por qué ExpIRITi?"**: subirlo y convertirlo en franja de confianza (4 items con icono, sin card), arriba de sistemas.
- **Páginas de sistema**: primera pantalla = ficha comercial (ya definido en pilotos .lp-*); beneficios/slider/videos bajan.

## E) Componentes inconsistentes entre sí

| Componente | Variantes detectadas | Debería ser |
|---|---|---|
| Headings de sección | 3-4 gradientes distintos + sólidos | 1 patrón: kicker teal + H2 sólido |
| Botones | Amarillo/blanco, teal sólido, azul, navy strip, ghost, pills icono | 3: primario (1 color), secundario (borde), terciario (texto) |
| Íconos | SVG línea, clipart multicolor, 3D-ish, emojis | 1 familia (línea/duotone, 2 colores) |
| Pills/tabs | Tabs hero, tabs sistemas, filtros promo, badges, chips svc — 5 estilos | 2: tab (interactivo) y badge (informativo) |
| Cards | Con/sin gradiente de fondo, 3 radios, 3 sombras | 1 card base + 1 variante destacada |
| CTA de sistema | Pill navy, pill naranja, chip amarillo, botón teal | 1 sistema de color por categoría, aplicado igual |

## F) Estilo visual final recomendado

**Confirmo tu ruta: "Enterprise SaaS consultivo", con un matiz.** No blanco clínico frío: blanco/gris cálido suave + azul profundo como base de confianza + teal como acento de acción + ámbar SOLO para promociones y precio (así el amarillo CONTPAQi queda contenido en un rol claro y deja de contaminar los CTAs). Referencias de sensación: Stripe (aire y jerarquía), Linear (contención), sitios de despachos SaaS B2B mexicanos serios. La personalidad la ponen los reels con personas y el monitor SAT — no los gradientes.

## G) Design tokens propuestos (para discusión, aún sin implementar)

```css
/* COLOR */
--ink:        #0F1B2D;  /* texto principal, azul profundo casi negro */
--ink-2:      #46556B;  /* texto secundario */
--bg:         #FAFBFD;  /* fondo página (cálido, no gris hospital) */
--surface:    #FFFFFF;  /* cards */
--line:       #E6EAF1;  /* bordes hairline */
--brand:      #123D8C;  /* azul profundo: enlaces, kickers, activos */
--accent:     #0E9488;  /* teal: CTA primario, éxito, focus */
--amber:      #E9A819;  /* SOLO precio, promos y highlight comparativa */
--danger:     #DC4B57;  /* errores, solo funcional */

/* TIPOGRAFÍA (Inter, la actual, está bien) */
--fs-h1: clamp(28px, 4vw, 44px);  /* peso 800, tracking -0.02em, SÓLIDO */
--fs-h2: clamp(22px, 3vw, 30px);  /* peso 750 */
--fs-h3: 18px;                    /* peso 700 */
--fs-kicker: 12px;                /* uppercase, tracking .08em, color accent */
--fs-body: 15px / 1.6;            /* subir de 14 a 15 */
--fs-small: 13px;
/* Regla: cero gradientes en texto. Cero ALL-CAPS en items de lista. */

/* SPACING (escala 8) */
--sp-1: 8px; --sp-2: 16px; --sp-3: 24px; --sp-4: 32px;
--sp-6: 48px; --sp-8: 64px; --sp-12: 96px;
/* Secciones: 64–96px entre sí (hoy ~20px: todo pegado). */

/* RADIOS — hoy hay 10-28px conviviendo */
--r-s: 8px;   /* inputs, badges */
--r-m: 12px;  /* botones, cards */
--r-l: 16px;  /* paneles hero, modales */
/* Nada más redondo que 16px salvo pills (999). */

/* SOMBRAS — de 6 sombras dramáticas a 2 */
--shadow-s: 0 1px 2px rgb(15 27 45 / .06);            /* cards en reposo */
--shadow-m: 0 8px 24px rgb(15 27 45 / .10);           /* hover, dropdown, modal */
/* La elevación por defecto es borde --line, no sombra. */

/* BOTONES */
/* Primario:   fondo --accent, texto blanco, r-m, 46px alto */
/* Secundario: borde --line, texto --ink, fondo blanco */
/* Terciario:  texto --brand con flecha, sin caja */
/* Promo/precio: --amber con TEXTO --ink (nunca blanco/amber) */

/* CARDS: superficie blanca, borde --line, shadow-s, padding sp-3;
   variante destacada: borde --accent + kicker. Sin gradientes de fondo. */

/* PILLS: tab (interactivo, borde, activo = fondo brand suave) 
   y badge (informativo, gris, máx 3 por vista). */

/* LAYOUT: max-width 1200px se queda; grid 12 col; 
   texto de lectura máx 68ch; una sola columna decorativa por vista. */
```

## H) Estructura recomendada por página

**HOME (nuevo orden para vender):**
1. Hero limpio SIN carrusel: kicker "Distribuidor autorizado CONTPAQi" → H1 de beneficio ("Pon en orden tu contabilidad, nómina y facturación — con alguien que responde") → subtítulo 2 líneas → CTA WhatsApp + CTA "Ver sistemas" → franja de confianza (Certificados · +X años · CDMX y remoto · Soporte real).
2. Sistemas CONTPAQi (las cards actuales, única aparición de logos, tabs por categoría).
3. Franja calculadora: "Calcula tu inversión sin hablar con nadie" → link a calculadoras.
4. Servicios (6 cards sobrias, iconos de un solo sistema).
5. UN bloque de video/reels con tabs.
6. Promociones (zona flyer contenida: banner JSON + grid uniforme).
7. FAQ.
8. Contacto + mapa.
9. Footer aligerado (columnas de texto, logos sin mini-cards).

**LANDING DE SISTEMA (confirma el patrón piloto):**
1. Breadcrumb → logo chico + H1 texto visible con beneficio → sub 2 líneas → 3 bullets → CTA WhatsApp + "Calcular inversión ↓" → microfrase de confianza. *Todo esto cabe en la primera pantalla de un iPhone SE.*
2. "¿Es para tu empresa?" + "Qué incluye con ExpIRITi".
3. FAQ rápida (costo/tiempo/migración).
4. Calculadora (subida; es EL argumento).
5. Funciones (máx 6, iconos del sistema) → videos → comparativa (sin emojis).
6. FAQ SEO → CTA final → relacionados. Sticky CTA móvil.
*Baja de prioridad: listSlider de beneficios genéricos, segunda tanda de badges, reels duplicados.*

**LANDING DE SERVICIO:**
1. Breadcrumb → H1 → sub → 3 bullets → CTA diagnóstico + secundario → confianza.
2. Para quién sí / cuándo no (autocalificación honesta = credibilidad).
3. Qué incluye / qué NO incluye (la tabla de horas-soporte vs póliza es el patrón correcto).
4. "Lo que debes tener listo".
5. Fases/proceso (3-5 pasos, línea de tiempo simple).
6. FAQ → CTA → relacionados. Sticky móvil.

**/soluciones.html:** ya cumple la estructura correcta (pregunta + 8 opciones + "no sé qué necesito"). Solo heredará tokens: opciones con icono de línea uniforme en vez de emoji, y CTA primario teal.

## I) Cambios rápidos de alto impacto (sin rehacer nada)

1. CTA amarillo → texto oscuro sobre ámbar, o directamente teal sólido (1 línea de CSS, arregla contraste y percepción).
2. Agregar CTA WhatsApp al hero del home junto a "Quiero una demo".
3. Reducir carrusel hero a 5 slides máx (es un array en index.js).
4. Quitar la fila duplicada de pills de sistemas bajo el hero.
5. Dejar UN bloque de reels en home.
6. Máx 3 badges por página interna, mismo estilo.
7. Reemplazar emojis de comparativas y footer por texto/SVG.
8. Colapsar FABs a uno (SAT) y mover "Mapa" a Contacto.
9. Subir espaciado entre secciones de ~20px a 64px (una variable).
10. Headings: matar gradientes → sólido --ink con kicker teal (una regla).

## J) Cambios profundos (para sensación de agencia premium)

1. **Sistema de contención**: rediseñar la regla "qué merece card" — solo elementos interactivos o agrupables; listas y logos respiran sin caja.
2. **Hero del home sin carrusel** con una sola imagen/composición de producto propia (mockup limpio de CONTPAQi en laptop con marco propio), no posts de redes.
3. **Iconografía única**: licenciar/generar 1 familia de iconos línea/duotone (~30 iconos) y reemplazar clipart en todo el sitio.
4. **Zona flyer oficial**: componente "Promo CONTPAQi" con marco, mes y CTA que legitime el arte oficial sin que parezca tablón (el JSON de promos ya es la mitad de esto).
5. **Migrar de 732 !important a tokens**: los tokens de G) como única fuente de verdad en theme.css, y desmontar overrides por página (continuación natural de la consolidación de Fase 3).
6. **Sistema tipográfico**: aplicar escala, eliminar ALL-CAPS de items, línea de lectura 68ch.

## K) Qué NO tocaría

- Arquitectura de header/mega menús (recién consolidada y con hrefs reales).
- Calculadora: lógica y UI internas (solo subirla de posición y quitarle el gradiente del total).
- FAQ, formulario, mapa, monitor SAT (solo reagrupar FABs).
- Estructura de los 4 pilotos .lp-* (coinciden con este documento; heredarán tokens).
- Todo el SEO/schema/OG ya montado.
- Los reels como formato (personas reales venden; solo des-triplicar).

## L) Cómo explorar variantes con Google Stitch / Claude Design sin contaminar el código

1. **Carpeta aislada**: crea `/design-lab/` (fuera del deploy o en repo aparte). Nada de ahí se copia a producción; lo generado por IA es referencia visual, no código productivo.
2. **Prompt con tokens, no con vibras**: dale a Stitch/Claude Design la sección G) literal (colores, radios, sombras, spacing) + la estructura H) de UNA página (recomiendo el hero del home y la landing de sistema). Pide 2-3 variantes solo de la primera pantalla, móvil 390px primero.
3. **Compara contra captura real**: sube la captura actual + la variante y evalúa con la pregunta de negocio: "¿se entiende en 5 segundos qué vendo y dónde cotizo?" — no "¿cuál es más bonita?".
4. **Del mockup a producción por tokens**: cuando apruebes una variante, NO pegues su CSS. Se traduce a los tokens de theme.css y a los componentes .lp-* existentes (así el sistema queda único y sin nueva capa).
5. **Piloto A/B casero**: aplica la variante aprobada solo a comercialpremium, compártela por WhatsApp a 5-10 clientes reales una semana y mide respuestas antes de replicar.

---

**Siguiente paso propuesto:** revisas/anotas este documento → acordamos tokens finales (G) y orden del home (H) → implemento SOLO en los 4 pilotos + tokens en theme.css → validación visual en mini host → réplica.

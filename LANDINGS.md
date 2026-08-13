# Landings comerciales ExpIRI Ti — plantilla y checklists

Las landings son fichas comerciales compartibles por WhatsApp/QR/correo. En menos de 30 segundos en móvil deben responder: qué es, para quién, qué problema resuelve, qué incluye con ExpIRI Ti y cómo cotizar.

## Pilotos validables (no replicar hasta aprobar)

1. `/SISTEMAS/comercialpremium.html` — patrón para sistemas
2. `/SERVICIOS/migraciones.html` — patrón para servicios
3. `/SERVICIOS/horas-soporte.html` — landing nueva completa (referencia de página desde cero)
4. `/soluciones.html` — página puente

## Plantilla base (orden obligatorio)

Todos los componentes usan las clases `.lp-*` de theme.css (sección "COMPONENTES LANDING"). No crear estilos nuevos por página.

```
1. <nav class="lp-breadcrumb">      Inicio › Sección › Página
2. <header class="lp-hero">
     logo (solo sistemas, alt real, fetchpriority="high", SIN loading="lazy")
     <h1> visible, claro y humano (sistema/servicio + beneficio)
     <p class="lp-sub"> máx. 2 líneas
     <ul class="lp-bullets"> 3 bullets de valor
     <div class="lp-cta-row"> CTA WhatsApp (btn-grad-green) + CTA secundario (btn)
     <p class="lp-trust"> microfrase de confianza (sin exagerar)
3. <div class="lp-cols">            dos paneles lado a lado
     "¿Es para tu empresa?" (.lp-check, autocalificación)
     "Qué incluye con ExpIRI Ti" (.lp-check; en servicios: incluye + .lp-no para lo que NO)
4. FAQ rápida (3 preguntas: cuánto cuesta / cuánto tarda / vengo de otro sistema)
5. Contenido profundo existente (beneficios, videos, calculadora, comparativa)
6. "Lo que debes tener listo" (servicios; reduce fricción)
7. FAQ SEO en <details> (5–8 preguntas)
8. CTA final + .lp-related (servicios/sistemas relacionados)
9. <nav class="lp-sticky"> WhatsApp + Llamar (solo móvil; body lleva clase has-lp-sticky)
```

## Checklist para crear una landing nueva

- [ ] Title con intención: "Comprar X | Distribuidor ExpIRI Ti" o "Servicio X CONTPAQi"
- [ ] Meta description con oferta + acompañamiento (150–160 caracteres)
- [ ] Canonical correcto
- [ ] OG: og:title (beneficio, no solo nombre), og:description, og:url, og:image
- [ ] H1 visible (nunca solo sr-only)
- [ ] Breadcrumb visible + BreadcrumbList en JSON-LD
- [ ] JSON-LD: SoftwareApplication (sistemas) o Service (servicios) + FAQPage
- [ ] CTA WhatsApp con mensaje prellenado que incluye la página: `Página: /RUTA.html`
- [ ] body con clase has-lp-sticky + bloque .lp-sticky antes del footer
- [ ] Links a 3–4 servicios/sistemas relacionados (.lp-related)
- [ ] Agregar URL a sitemap.xml
- [ ] Sin promesas dudosas: "sujeto a diagnóstico", "distribuidor autorizado", nunca "somos CONTPAQi"
- [ ] Probar en móvil real: entender la oferta sin hacer scroll

## Checklist para compartir por WhatsApp

- [ ] Abrir la URL en WhatsApp (mandátela a ti mismo): el preview muestra título + descripción + imagen correctos
- [ ] El preview no se ve pixelado (og:image ≥ 1200×628)
- [ ] La página abre rápido en datos móviles
- [ ] El CTA de la landing regresa a WhatsApp con el mensaje prellenado correcto

## Checklist para eventos / QR

- [ ] QR general → https://nueva.expiriti.com.mx/soluciones.html
- [ ] QR por tema → soporte.html / migraciones.html / comercialpremium.html / horas-soporte.html
- [ ] Agregar UTM al link del QR: `?utm_source=networking&utm_campaign=evento_julio_2026`
- [ ] Probar el QR impreso con 2 celulares distintos antes del evento
- [ ] La landing se entiende sin contexto previo (la persona escaneó y ya)

## Mensajes de WhatsApp prellenados (por tipo)

- Sistema: "Hola, vi la página de CONTPAQi {Sistema} y quiero una cotización. Página: /SISTEMAS/{archivo}.html"
- Migraciones: "Hola, vi la página de Migraciones a CONTPAQi y quiero un diagnóstico. Vengo de: (ASPEL/Excel/otro). Página: /SERVICIOS/migraciones.html"
- Horas prepago: "Hola, quiero cotizar un paquete de horas prepagadas de soporte CONTPAQi. Página: /SERVICIOS/horas-soporte.html"
- Orientación: "Hola, aún no sé qué sistema o servicio necesito y quiero orientación. Página: /soluciones.html"
- En evento, añade al final: "Origen: networking" (o el utm_source que uses).

## Open Graph — títulos e imágenes recomendadas

Títulos OG: beneficio primero, marca después. Ej: "Migra tu información a CONTPAQi sin perder historia", "CONTPAQi Comercial Premium — cotiza con ExpIRI Ti".

Imágenes OG por categoría (pendientes de diseñar, 1200×628 WebP <150 KB, texto grande legible en miniatura):

| Categoría | Archivo sugerido |
|---|---|
| Genérica/marca | /IMG/expiriti_og.webp (ya existe) |
| Sistemas | /assets/og/og-sistemas.webp |
| Servicios | /assets/og/og-servicios.webp |
| Soporte/pólizas/horas | /assets/og/og-soporte.webp |
| Migraciones | /assets/og/og-migraciones.webp |
| Cursos | /assets/og/og-cursos.webp |
| Desarrollos | /assets/og/og-desarrollos.webp |

Mientras no existan, las landings usan expiriti_og.webp / servicios-hero.webp (aceptable, no pixelado).

## Prioridad comercial para replicar (tras validar pilotos)

1. /SERVICIOS/soporte.html
2. /SERVICIOS/polizas.html
3. /SERVICIOS/implementaciones.html
4. /SISTEMAS/contabilidad.html
5. /SISTEMAS/nominas.html
6. /SERVICIOS/desarrollos.html
7. /SERVICIOS/cursos.html
8. Resto de sistemas

## Tracking simple (sin analítica invasiva)

- Los CTA ya incluyen la página de origen en el mensaje de WhatsApp → tu historial de chats es tu CRM de origen.
- Para campañas: agrega `?utm_source=...&utm_campaign=...` al compartir; no requiere ningún código adicional.
- Regla: un mensaje = una página = un origen. No mezclar.

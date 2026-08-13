# Promociones mensuales sin tocar código

La promo del mes vive en dos archivos y nada más:

1. `/data/promociones.json` — el texto, fechas y CTA.
2. `/assets/promos/promo-AAAA-MM.webp` — la imagen (opcional).

El home la muestra como banner arriba de la sección Promociones. Si `activo` es `false`, si la fecha ya venció o si el JSON falla, el banner simplemente no aparece y la página sigue normal. Si la imagen falla, el banner se muestra solo con texto.

## Cómo cambiar la promo cada mes (5 minutos)

1. Prepara la imagen: WebP, 1200×628 px, menos de ~150 KB. Nómbrala `promo-AAAA-MM.webp` (nombre nuevo cada mes, para evitar caché).
2. Súbela a `/assets/promos/`.
3. Edita `/data/promociones.json`: cambia `mes`, `titulo`, `descripcion`, `imagen`, `fechaInicio`, `fechaFin` y revisa que `activo` sea `true`.
4. Sube el JSON al host.
5. Abre el home en tu celular y verifica banner, texto y botón de WhatsApp.

Para apagar la promo sin borrar nada: `"activo": false`.

## Checklist mensual de publicación

- [ ] Imagen nueva subida a /assets/promos/ (WebP, nombre nuevo)
- [ ] promociones.json actualizado (mes, título, descripción, imagen, fechas)
- [ ] activo: true y fechas correctas (AAAA-MM-DD)
- [ ] Validar el JSON en https://jsonlint.com antes de subir (una coma de más rompe la promo, no la página)
- [ ] Ver el home en móvil: banner visible, sin scroll horizontal
- [ ] Probar el botón CTA (abre WhatsApp con el mensaje correcto)
- [ ] Verificar que la promo del mes anterior ya no aparece (por fechaFin)

## Reglas

- No uses servicios aleatorios de imágenes (pueden borrar, comprimir o cambiar URL). Todo vive en tu propio host.
- El JSON usa el mismo formato siempre; no agregues campos con comillas “tipográficas”.
- El fetch usa el date como cache-buster diario: los cambios se ven el mismo día; si necesitas verlos al instante, recarga con Ctrl+Shift+R.

## Siguiente etapa (opcional, no implementada)

Google Sheets como mini-CMS: editable desde el celular, pero agrega dependencia externa, CORS y caché de ~5 min de Google. Recomendación: quédate con JSON hasta que el flujo mensual te quede corto; entonces montamos la hoja publicada como fuente con este mismo módulo como fallback.

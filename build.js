// build.js v2.0
// --- El Robot Armador (con optimización) ---
import { readFile, writeFile, mkdir, copyFile }F rom 'fs/promises';
import { resolve, dirname } from 'path';
import { glob } from 'glob';
// --- NUEVAS HERRAMIENTAS DE OPTIMIZACIÓN ---
import { minify } from 'terser';
import postcss from 'postcss';
import cssnano from 'cssnano';

// --- Configuración ---
const PARTIALS_DIR = 'PARTIALS';
const BUILD_DIR = 'dist';
// ---------------------

console.log('🤖 Iniciando el robot armador v2.0 (con optimización)...');

async function buildSite() {
  try {
    // 1. Cargar Parciales (sin cambios)
    const headerHtml = await readFile(resolve(PARTIALS_DIR, 'global-header.html'), 'utf8');
    const footerHtml = await readFile(resolve(PARTIALS_DIR, 'global-footer.html'), 'utf8');
    console.log('⚙️ 1/4 Parciales cargados.');

    // 2. Procesar HTML (Ensamblado + Tarea 1: Lazy Load)
    const htmlFiles = await glob('**/*.html', {
      ignore: [`${PARTIALS_DIR}/**`, `${BUILD_DIR}/**`, 'node_modules/**']
    });

    console.log(`⚙️ 2/4 Procesando ${htmlFiles.length} páginas HTML...`);
    for (const file of htmlFiles) {
      let content = await readFile(file, 'utf8');

      // Pegar header y footer
      content = content.replace(/<div id="header-placeholder"><\/div>/g, headerHtml);
      content = content.replace(/<div id="footer-placeholder"><\/div>/g, footerHtml);

      // Eliminar script de carga de parciales
      content = content.replace(
        /<script>[\s\S]*loadPartials[\s\S]*?<\/script>/s, 
        ''
      );

      // --- ⚡️ NUEVA TAREA 1: LAZY LOAD ---
      // Añade 'loading="lazy"' a todos los iframes y videos
      // (Usamos una RegEx para no añadirlo si ya existe)
      content = content.replace(
        /<iframe(?!.*loading="lazy")/g, 
        '<iframe loading="lazy"'
      );
      content = content.replace(
        /<video(?!.*preload="none")/g, 
        '<video preload="none"'
      );
      // Hacemos lo mismo para imágenes
      content = content.replace(
        /<img(?!.*loading="lazy")/g, 
        '<img loading="lazy"'
      );

      // Guardar el HTML final en 'dist'
      const outputPath = resolve(BUILD_DIR, file);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, content, 'utf8');
    }
    console.log('✅ HTML procesado y optimizado con Lazy Load.');

    // 3. Copiar Archivos Estáticos (Imágenes, etc.)
    const otherFiles = await glob('**/*.{png,jpg,jpeg,webp,svg,ico,json,webmanifest,pdf}', {
      ignore: [`${PARTIALS_DIR}/**`, `${BUILD_DIR}/**`, 'node_modules/**', 'build.js', 'package.json', 'package-lock.json']
    });
    console.log(`⚙️ 3/4 Copiando ${otherFiles.length} archivos estáticos (imágenes, etc)...`);
    for (const file of otherFiles) {
      const outputPath = resolve(BUILD_DIR, file);
      await mkdir(dirname(outputPath), { recursive: true });
      await copyFile(file, outputPath);
    }
    console.log('✅ Archivos estáticos copiados.');


    // 4. --- ⚡️ NUEVA TAREA 2: MINIFICACIÓN DE CSS y JS ---
    // Buscamos los archivos CSS y JS que NO están en node_modules
    console.log('⚙️ 4/4 Minificando CSS y JS...');
    const codeFiles = await glob('**/*.{js,css}', {
      ignore: [`${BUILD_DIR}/**`, 'node_modules/**', 'build.js']
    });

    for (const file of codeFiles) {
      const inputPath = resolve(file);
      const outputPath = resolve(BUILD_DIR, file);
      const rawContent = await readFile(inputPath, 'utf8');
      let minifiedContent = '';

      if (file.endsWith('.js')) {
        // Minificar JS
        const result = await minify(rawContent);
        minifiedContent = result.code;
      } else if (file.endsWith('.css')) {
        // Minificar CSS
        const result = await postcss([cssnano]).process(rawContent, { from: inputPath, to: outputPath });
        minifiedContent = result.css;
      }

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, minifiedContent, 'utf8');
    }
    console.log('✅ CSS y JS minificados.');


    console.log('\n¡Build v2.0 completado! 🚀');
    console.log(`Tu sitio final (y súper rápido) está en la carpeta /${BUILD_DIR}`);

  } catch (err) {
    console.error('Error durante el build v2.0:', err);
    process.exit(1);
  }
}

buildSite();

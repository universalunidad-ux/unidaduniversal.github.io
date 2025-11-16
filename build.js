// build.js
// --- El Robot Armador ---
import { readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { glob } from 'glob';

// --- Configuración ---
const PARTIALS_DIR = 'PARTIALS';
const BUILD_DIR = 'dist'; // Carpeta de salida para el sitio final
// ---------------------

console.log('🤖 Iniciando el robot armador...');

async function buildSite() {
  try {
    // 1. Cargar los parciales (header y footer) en memoria
    const headerHtml = await readFile(resolve(PARTIALS_DIR, 'global-header.html'), 'utf8');
    const footerHtml = await readFile(resolve(PARTIALS_DIR, 'global-footer.html'), 'utf8');
    console.log('⚙️ Parciales cargados en memoria.');

    // 2. Encontrar todos los archivos HTML que NO están en PARTIALS
    const htmlFiles = await glob('**/*.html', {
      ignore: [`${PARTIALS_DIR}/**`, `${BUILD_DIR}/**`, 'node_modules/**']
    });

    console.log(`Found ${htmlFiles.length} páginas HTML para procesar...`);

    // 3. Procesar cada página HTML
    for (const file of htmlFiles) {
      let content = await readFile(file, 'utf8');

      // Reemplazar los placeholders
      content = content.replace(
        /<div id="header-placeholder"><\/div>/g, 
        headerHtml
      );
      content = content.replace(
        /<div id="footer-placeholder"><\/div>/g, 
        footerHtml
      );

      // [CLAVE] Eliminar el script de carga de parciales, ya no es necesario
      // Busca cualquier <script> que contenga "loadPartials" y lo elimina
      content = content.replace(
        /<script>[\s\S]*loadPartials[\s\S]*?<\/script>/s, 
        ''
      );
      
      // Guardar el archivo final en la carpeta 'dist'
      const outputPath = resolve(BUILD_DIR, file);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, content, 'utf8');
    }
    console.log('✅ HTML procesado y ensamblado.');

    // 4. Copiar todos los demás archivos (CSS, JS, Imágenes, etc.)
    const otherFiles = await glob('**/*.{js,css,png,jpg,jpeg,webp,svg,ico,json,webmanifest,pdf}', {
      ignore: [`${PARTIALS_DIR}/**`, `${BUILD_DIR}/**`, 'node_modules/**', 'build.js', 'package.json', 'package-lock.json']
    });

    console.log(`Copying ${otherFiles.length} archivos estáticos (CSS, JS, IMG)...`);
    for (const file of otherFiles) {
      const outputPath = resolve(BUILD_DIR, file);
      await mkdir(dirname(outputPath), { recursive: true });
      await copyFile(file, outputPath);
    }
    console.log('✅ Archivos estáticos copiados.');

    console.log('\n¡Build completado! 🚀');
    console.log(`Tu sitio final está listo en la carpeta /${BUILD_DIR}`);

  } catch (err) {
    console.error('Error durante el build:', err);
    process.exit(1); // Termina el script con un error
  }
}

buildSite();

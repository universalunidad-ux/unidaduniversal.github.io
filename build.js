// build.js v2.1
// --- El Robot Armador (con optimización + debug terser) ---
import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { resolve, dirname } from "path";
import { glob } from "glob";

// --- OPTIMIZACIÓN ---
import { minify as terserMinify } from "terser";
import postcss from "postcss";
import cssnano from "cssnano";

// --- Configuración ---
const PARTIALS_DIR = "PARTIALS";
const BUILD_DIR = "dist";
// ---------------------

console.log("🤖 Iniciando el robot armador v2.1 (con optimización + debug terser)...");

/* =========================================================
   Helpers: mostrar contexto cuando Terser falla
   ========================================================= */
function showContext(src, line, col, radius = 4) {
  const lines = src.split(/\r?\n/);
  const L = Number(line || 0);
  const C = Number(col || 0);

  const start = Math.max(0, L - 1 - radius);
  const end = Math.min(lines.length, L - 1 + radius + 1);

  const block = lines.slice(start, end).map((txt, i) => {
    const n = start + i + 1;
    const mark = (n === L) ? ">>" : "  ";
    return `${mark} ${String(n).padStart(4, " ")} | ${txt}`;
  }).join("\n");

  console.log(block);
  // caret
  if (L > 0) console.log(" ".repeat(9 + C) + "^");
}

/* =========================================================
   Minificación robusta de JS (Terser)
   - Imprime archivo + línea/columna + snippet
   ========================================================= */
async function minifyJsOrThrow(filePath, rawContent) {
  try {
    // Nota: options conservadoras para evitar sorpresas
    const result = await terserMinify(rawContent, {
      ecma: 2020,
      module: false,
      compress: true,
      mangle: true,
      format: { comments: false }
    });

    if (!result || typeof result.code !== "string") {
      throw new Error("Terser no devolvió 'code' (resultado inválido).");
    }
    return result.code;

  } catch (err) {
    console.error(`\n❌ Error minificando JS con Terser`);
    console.error(`   Archivo: ${filePath}`);
    console.error(`   ${err?.name || "Error"}: ${err?.message || String(err)}`);

    // Terser suele traer line/col
    const line = err?.line;
    const col = err?.col;

    if (typeof line === "number") {
      console.error(`   Línea ${line}, Col ${col ?? 0}\n`);
      showContext(rawContent, line, col ?? 0);
      console.error("\n💡 Tip: normalmente es una coma faltante en un objeto/array, o texto que no es JS colado.");
    } else {
      console.error("\n💡 No se recibió line/col. Aun así, el archivo arriba es el culpable.");
    }

    throw err;
  }
}

async function buildSite() {
  try {
    // 1) Cargar Parciales
    const headerHtml = await readFile(resolve(PARTIALS_DIR, "global-header.html"), "utf8");
    const footerHtml = await readFile(resolve(PARTIALS_DIR, "global-footer.html"), "utf8");
    console.log("⚙️ 1/4 Parciales cargados.");

    // 2) Procesar HTML (ensamblado + Lazy Load)
    const htmlFiles = await glob("**/*.html", {
      ignore: [`${PARTIALS_DIR}/**`, `${BUILD_DIR}/**`, "node_modules/**"]
    });

    console.log(`⚙️ 2/4 Procesando ${htmlFiles.length} páginas HTML...`);
    for (const file of htmlFiles) {
      let content = await readFile(file, "utf8");

      // Pegar header y footer
      content = content.replace(/<div id="header-placeholder"><\/div>/g, headerHtml);
      content = content.replace(/<div id="footer-placeholder"><\/div>/g, footerHtml);

      // Eliminar script de carga de parciales (si existe)
      content = content.replace(
        /<script>[\s\S]*loadPartials[\s\S]*?<\/script>/s,
        ""
      );

      // Lazy load / preload
      content = content.replace(/<iframe(?!.*loading="lazy")/g, '<iframe loading="lazy"');
      content = content.replace(/<video(?!.*preload="none")/g, '<video preload="none"');
      content = content.replace(/<img(?!.*loading="lazy")/g, '<img loading="lazy"');

      // Guardar HTML final en dist
      const outputPath = resolve(BUILD_DIR, file);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, content, "utf8");
    }
    console.log("✅ HTML procesado y optimizado con Lazy Load.");

    // 3) Copiar estáticos
    const otherFiles = await glob("**/*.{png,jpg,jpeg,webp,svg,ico,json,webmanifest,pdf}", {
      ignore: [
        `${PARTIALS_DIR}/**`,
        `${BUILD_DIR}/**`,
        "node_modules/**",
        "build.js",
        "package.json",
        "package-lock.json"
      ]
    });

    console.log(`⚙️ 3/4 Copiando ${otherFiles.length} archivos estáticos...`);
    for (const file of otherFiles) {
      const outputPath = resolve(BUILD_DIR, file);
      await mkdir(dirname(outputPath), { recursive: true });
      await copyFile(file, outputPath);
    }
    console.log("✅ Archivos estáticos copiados.");

    // 4) Minificar CSS y JS (con debug)
    console.log("⚙️ 4/4 Minificando CSS y JS...");
    const codeFiles = await glob("**/*.{js,css}", {
      ignore: [`${BUILD_DIR}/**`, "node_modules/**", "build.js"]
    });

    for (const file of codeFiles) {
      const inputPath = resolve(file);
      const outputPath = resolve(BUILD_DIR, file);
      const rawContent = await readFile(inputPath, "utf8");

      let minifiedContent = "";

      if (file.endsWith(".js")) {
        // ✅ JS: minificación robusta con diagnóstico
        minifiedContent = await minifyJsOrThrow(file, rawContent);

      } else if (file.endsWith(".css")) {
        // ✅ CSS: cssnano
        const result = await postcss([cssnano]).process(rawContent, { from: inputPath, to: outputPath });
        minifiedContent = result.css;
      }

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, minifiedContent, "utf8");
    }

    console.log("✅ CSS y JS minificados.");
    console.log("\n¡Build v2.1 completado! 🚀");
    console.log(`Tu sitio final está en /${BUILD_DIR}`);

  } catch (err) {
    console.error("Error durante el build:", err);
    process.exit(1);
  }
}

buildSite();

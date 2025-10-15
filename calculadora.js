(function () {
  // =========================================
  // CONFIG: Descripciones y videos por sistema
  // Edita estos valores para cada sistema si quieres texto / video propio
  // =========================================
  const DESCRIPCIONES = {
    "CONTPAQi Contabilidad": {
      titulo: "CONTPAQi Contabilidad",
      descripcion: "Sistema para llevar contabilidad electrónica, pólizas y reportes fiscales.",
      video: "", // pon URL de YouTube o archivo si quieres (opcional)
      caracteristicas: [
        "Pólizas automáticas",
        "Reportes fiscales y estados financieros",
        "Integración con Factura Electrónica"
      ]
    },
    "CONTPAQi Nóminas": {
      titulo: "CONTPAQi Nóminas",
      descripcion: "Gestión de nóminas, pagos y obligaciones laborales.",
      video: "",
      caracteristicas: ["Cálculo de ISR", "Timbrado de nómina", "Reportes de pagos"]
    },
    // Agrega aquí más sistemas con la misma estructura
  };

  // =========================================
  // Helpers: formato moneda, tooltip simple
  // =========================================
  const fmt = v => $${(Math.round(v) || 0).toLocaleString("es-MX")};
  const pct = v => ${(v * 100).toFixed(0)}%;

  // simple tooltip helper markup (uses title attribute)
  function questionMark(titleText) {
    const span = document.createElement("span");
    span.className = "tooltip-question";
    span.title = titleText;
    span.textContent = " ? ";
    return span;
  }

  // =========================================
  // MAIN: init page
  // =========================================
  function init() {
    const app = document.getElementById("app");
    if (!app) return console.warn("No #app container on page.");

    const sistemaActual = app.dataset.system;
    if (!sistemaActual || !preciosContpaqi[sistemaActual]) {
      app.innerHTML = <p>Error: sistema no encontrado. Asegura data-system="${sistemaActual}" y que precios-contpaqi.js esté cargado.</p>;
      return;
    }

    // build UI
    app.innerHTML = ""; // limpiar
    const desc = DESCRIPCIONES[sistemaActual] || {
      titulo: sistemaActual,
      descripcion: "",
      video: "",
      caracteristicas: []
    };

    // Header: titulo, descripcion, video
    const header = document.createElement("div");
    header.className = "sys-header";
    const h = document.createElement("h2");
    h.textContent = desc.titulo;
    header.appendChild(h);

    const p = document.createElement("p");
    p.textContent = desc.descripcion;
    header.appendChild(p);

    if (desc.video) {
      const videoWrapper = document.createElement("div");
      videoWrapper.className = "sys-video";
      // If YouTube link -> embed; otherwise show link:
      if (desc.video.includes("youtube.com") || desc.video.includes("youtu.be")) {
        // attempt to extract id
        let id = "";
        const m = desc.video.match(/(?:v=|\/)([A-Za-z0-9_-]{6,})/);
        if (m && m[1]) id = m[1];
        if (id) {
          const iframe = document.createElement("iframe");
          iframe.width = "560";
          iframe.height = "315";
          iframe.src = https://www.youtube.com/embed/${id};
          iframe.title = ${desc.titulo} video;
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
          iframe.setAttribute("allowfullscreen", "");
          videoWrapper.appendChild(iframe);
        } else {
          const a = document.createElement("a");
          a.href = desc.video;
          a.textContent = "Ver video";
          a.target = "_blank";
          videoWrapper.appendChild(a);
        }
      } else {
        const a = document.createElement("a");
        a.href = desc.video;
        a.textContent = "Ver video";
        a.target = "_blank";
        videoWrapper.appendChild(a);
      }
      header.appendChild(videoWrapper);
    }

    // caracteristicas
    if (desc.caracteristicas && desc.caracteristicas.length) {
      const ul = document.createElement("ul");
      desc.caracteristicas.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        ul.appendChild(li);
      });
      header.appendChild(ul);
    }

    app.appendChild(header);

    // Contenedor principal para calculadora y opciones
    const main = document.createElement("div");
    main.className = "sys-main";

    // Crear calculadora primaria
    const calc1Container = document.createElement("div");
    calc1Container.id = "calc-primary";
    calc1Container.className = "calc-container";
    main.appendChild(calc1Container);

    // Panel para integrar segundo sistema
    const integrPanel = document.createElement("div");
    integrPanel.className = "integr-panel";
    const integrText = document.createElement("p");
    integrText.innerHTML = Integra tu sistema con otro adicional y recibe <strong>15% de descuento</strong> en cada sistema!;
    integrPanel.appendChild(integrText);

    // icons list
    const iconsWrap = document.createElement("div");
    iconsWrap.className = "icons-wrap";
    // create clickable icons for other systems
    Object.keys(preciosContpaqi).forEach(name => {
      if (name === sistemaActual) return; // skip current
      const btn = document.createElement("button");
      btn.className = "system-icon";
      btn.type = "button";
      btn.dataset.system = name;
      btn.title = name;
      btn.innerHTML = <div class="icon-placeholder">${name.split(" ")[1] || "S"}</div><div class="icon-label">${name}</div>;
      btn.addEventListener("click", () => {
        // load second system container
        showSecondarySystem(name, app);
      });
      iconsWrap.appendChild(btn);
    });
    integrPanel.appendChild(iconsWrap);
    main.appendChild(integrPanel);

    // Secondary system container placeholder
    const secondaryWrap = document.createElement("div");
    secondaryWrap.id = "secondary-wrap";
    main.appendChild(secondaryWrap);

    // Summary combined
    const combinedWrap = document.createElement("div");
    combinedWrap.id = "combined-wrap";
    main.appendChild(combinedWrap);

    app.appendChild(main);

    // ===== create calculators
    createCalculator(calc1Container, sistemaActual, true);
    // combined summary update watcher
    setInterval(() => updateCombinedSummary(sistemaActual), 400); // small interval to update when second calc exists
  }

  // =========================================
  // show secondary system panel (loads description + calculator)
  // =========================================
  function showSecondarySystem(name, app) {
    const secWrap = document.getElementById("secondary-wrap");
    secWrap.innerHTML = ""; // limpiar

    const header = document.createElement("h3");
    header.textContent = Sistema adicional: ${name};
    secWrap.appendChild(header);

    const descObj = DESCRIPCIONES[name] || { descripcion: "", video: "", caracteristicas: [] };
    const p = document.createElement("p");
    p.textContent = descObj.descripcion;
    secWrap.appendChild(p);

    if (descObj.video) {
      const a = document.createElement("a");
      a.href = descObj.video;
      a.textContent = "Ver video";
      a.target = "_blank";
      secWrap.appendChild(a);
    }

    // create second calculator
    const calc2Container = document.createElement("div");
    calc2Container.id = "calc-secondary";
    calc2Container.className = "calc-container";
    secWrap.appendChild(calc2Container);

    createCalculator(calc2Container, name, false); // second calculator

    // Add small note about discount eligibility
    const note = document.createElement("p");
    note.innerHTML = <small>Nota: XML en Línea no aplica para descuento de integración.</small>;
    secWrap.appendChild(note);
  }

  // =========================================
  // createCalculator: genera UI + lógica para un sistema dentro de un contenedor
  // container: DOM element
  // sistemaName: string key de preciosContpaqi
  // isPrimary: boolean (true para primer sistema)
  // =========================================
  function createCalculator(container, sistemaName, isPrimary) {
    container.innerHTML = "";
    const systemPrices = preciosContpaqi[sistemaName];

    // Title
    const title = document.createElement("h4");
    title.textContent = ${sistemaName} — Calculadora;
    container.appendChild(title);

    // Build form elements
    const form = document.createElement("div");
    form.className = "calc-form";

    // Licencia select (anual/tradicional/nube)
    const licenciaLabel = document.createElement("label");
    licenciaLabel.textContent = "Modalidad: ";
    const licenciaSel = document.createElement("select");
    licenciaSel.id = ${isPrimary ? "lic1" : "lic2"};
    Object.keys(systemPrices).forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      // nicer label mapping
      const lbl = k === "anual" ? "Anual (renovación)" : k === "tradicional" ? "Tradicional (licencia)" : "Nube";
      opt.textContent = lbl;
      licenciaSel.appendChild(opt);
    });
    licenciaLabel.appendChild(licenciaSel);
    form.appendChild(licenciaLabel);

    // Subselect: RFC types or niveles (rfc/nivel)
    const rfcLabel = document.createElement("label");
    rfcLabel.textContent = "Tipo / Opción: ";
    const rfcSel = document.createElement("select");
    rfcSel.id = ${isPrimary ? "rfc1" : "rfc2"};
    rfcLabel.appendChild(rfcSel);
    form.appendChild(rfcLabel);

    // Mono/Multi tooltip
    const mmHelp = questionMark("MonoRFC: solo 1 RFC (empresa). MultiRFC: permite varias empresas/folios en la misma licencia.");
    form.appendChild(mmHelp);

    // Nivel (solo para nube)
    const nivelLabel = document.createElement("label");
    nivelLabel.textContent = "Nivel (solo nube): ";
    const nivelSel = document.createElement("select");
    nivelSel.id = ${isPrimary ? "niv1" : "niv2"};
    nivelLabel.appendChild(nivelSel);
    nivelLabel.style.display = "none";
    form.appendChild(nivelLabel);

    // Usuarios input
    const userLabel = document.createElement("label");
    userLabel.textContent = "Usuarios: ";
    const userInput = document.createElement("input");
    userInput.type = "number";
    userInput.min = "1";
    userInput.value = "1";
    userInput.id = ${isPrimary ? "usr1" : "usr2"};
    userLabel.appendChild(userInput);
    form.appendChild(userLabel);

    // Tipo de operación (nueva / renovación / actualización) - explicit text
    const opLabel = document.createElement("label");
    opLabel.textContent = "Operación: ";
    const opSel = document.createElement("select");
    opSel.id = ${isPrimary ? "op1" : "op2"};
    // options will depend on modality, we'll fill after
    opLabel.appendChild(opSel);
    form.appendChild(opLabel);

    container.appendChild(form);

    // Results area: detailed table
    const results = document.createElement("div");
    results.className = "calc-results";
    const table = document.createElement("table");
    table.className = "calc-table";
    table.innerHTML = `
      <thead><tr><th>Concepto</th><th>Importe</th></tr></thead>
      <tbody>
        <tr><td>Precio base</td><td id="${isPrimary ? 'base1' : 'base2'}">$0</td></tr>
        <tr><td>Usuarios adicionales</td><td id="${isPrimary ? 'uadd1' : 'uadd2'}">$0</td></tr>
        <tr><td>Descuento</td><td id="${isPrimary ? 'disc1' : 'disc2'}">0% / $0</td></tr>
        <tr><td>Subtotal</td><td id="${isPrimary ? 'sub1' : 'sub2'}">$0</td></tr>
        <tr><td>IVA (16%)</td><td id="${isPrimary ? 'iva1' : 'iva2'}">$0</td></tr>
        <tr><td><strong>Total</strong></td><td id="${isPrimary ? 'tot1' : 'tot2'}"><strong>$0</strong></td></tr>
      </tbody>
    `;
    results.appendChild(table);
    container.appendChild(results);

    // attach events & populate rfc/nivel options based on selected modality
    function refreshOptions() {
      const lic = licenciaSel.value;
      rfcSel.innerHTML = "";
      nivelSel.innerHTML = "";
      nivelLabel.style.display = "none";
      opSel.innerHTML = "";

      if (lic === "nube") {
        // list niveles
        if (systemPrices.nube) {
          Object.keys(systemPrices.nube).forEach(n => {
            const opt = document.createElement("option");
            opt.value = n;
            opt.textContent = n;
            nivelSel.appendChild(opt);
          });
        }
        nivelLabel.style.display = "inline-block";
        // operation options for nube (treat as new/annual model)
        ["Contratar (nueva)", "Renovación anual"].forEach(o => {
          const opt = document.createElement("option");
          opt.value = o;
          opt.textContent = o;
          opSel.appendChild(opt);
        });
      } else {
        // anual or tradicional -> list inner keys
        const block = systemPrices[lic];
        if (block) {
          Object.keys(block).forEach(k => {
            const opt = document.createElement("option");
            opt.value = k;
            // map readable labels for keys
            let lbl = k;
            if (k.toLowerCase().includes("mono")) lbl = "MonoRFC";
            if (k.toLowerCase().includes("multi")) lbl = "MultiRFC";
            if (k === "actualizacion") lbl = "Actualización tradicional";
            if (k === "especial") lbl = "Especial (tradicional)";
            if (k === "crecimiento_usuario") lbl = "Crecimiento usuario (tradicional)";
            opt.textContent = lbl;
            rfcSel.appendChild(opt);
          });
        }
        // operation options:
        if (lic === "anual") {
          ["Renovación anual", "Nueva anual (contratar)"].forEach(o => {
            const opt = document.createElement("option");
            opt.value = o;
            opt.textContent = o;
            opSel.appendChild(opt);
          });
        } else {
          // tradicional
          ["Licencia Tradicional (nueva)", "Actualización tradicional"].forEach(o => {
            const opt = document.createElement("option");
            opt.value = o;
            opt.textContent = o;
            opSel.appendChild(opt);
          });
        }
      }
      // add tooltip for Mono/Multi if rfcSel contains them
      // (we keep the simple title via questionMark earlier)
      calculateAndRender();
    }

    // calculation logic
    function calculateAndRender() {
      const lic = licenciaSel.value;
      const rfcType = rfcSel.value;
      const nivel = nivelSel.value;
      const usuarios = parseInt(userInput.value) || 1;
      const op = opSel.value;

      let base = 0;
      let usuariosAddImporte = 0;
      let usuariosExtras = 0;

      // NUBE
      if (lic === "nube") {
        const datosNube = systemPrices.nube && systemPrices.nube[nivel];
        if (!datosNube) return writeZeros();
        base = datosNube.precio_base || 0;
        // check included users
        let incluidos = datosNube.usuarios_incluidos === "multi" ? usuarios : (datosNube.usuarios_incluidos || 1);
        usuariosExtras = Math.max(usuarios - incluidos, 0);
        // price per extra user for nube stored at systemPrices.nube.usuario_adicional (if exists)
        const perUserNube = systemPrices.nube.usuario_adicional || 0;
        usuariosAddImporte = usuariosExtras * perUserNube;
      } else {
        // anual o tradicional
        const datosLic = (systemPrices[lic] && systemPrices[lic][rfcType]) || null;
        if (!datosLic) return writeZeros();
        base = datosLic.precio_base || 0;
        // logic difference: you asked que el precio por usuario adicional para anuales sea precio por usuario en red,
        // y que "usuario_adicional" sea solo para tradicionales.
        // We'll use this rule:
        // - If lic === "anual": look for datosLic.usuario_en_red OR datosLic.usuario_adicional as fallback.
        // - If lic === "tradicional": use datosLic.usuario_adicional (si existe)
        let perUser = 0;
        if (lic === "anual") {
          perUser = datosLic.usuario_en_red || datosLic.usuario_adicional || 0;
        } else {
          perUser = datosLic.usuario_adicional || 0;
        }
        usuariosExtras = Math.max(usuarios - 1, 0);
        usuariosAddImporte = usuariosExtras * perUser;
      }

      // subtotal before discount
      let subtotal = base + usuariosAddImporte;

      // discount logic when two systems chosen:
      // global check: if there's a secondary system loaded and both are eligible, apply 15% each
      let discountPct = 0;
      const secondaryExists = !!document.getElementById("calc-secondary");
      if (secondaryExists) {
        // we will apply discount outside, but for display we indicate potential 15%
        // However if current system is "CONTPAQi XML en Línea" exclude discount
        if (!sistemaName.includes("XML en Línea")) {
          discountPct = 0.15;
        } else {
          discountPct = 0;
        }
      }

      // compute discount amount for this system
      const discountAmt = subtotal * discountPct;
      const afterDiscount = subtotal - discountAmt;

      const iva = afterDiscount * 0.16;
      const total = afterDiscount + iva;

      // write values to DOM
      document.getElementById(isPrimary ? 'base1' : 'base2').textContent = fmt(base);
      document.getElementById(isPrimary ? 'uadd1' : 'uadd2').textContent = fmt(usuariosAddImporte) + ` (${usuariosExtras} extras)`;
      document.getElementById(isPrimary ? 'disc1' : 'disc2').textContent = ${pct(discountPct)} / ${fmt(discountAmt)};
      document.getElementById(isPrimary ? 'sub1' : 'sub2').textContent = fmt(afterDiscount);
      document.getElementById(isPrimary ? 'iva1' : 'iva2').textContent = fmt(iva);
      document.getElementById(isPrimary ? 'tot1' : 'tot2').textContent = fmt(total);

      // update combined summary too
      updateCombinedSummary(); // immediate
    }

    function writeZeros() {
      document.getElementById(isPrimary ? 'base1' : 'base2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'uadd1' : 'uadd2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'disc1' : 'disc2').textContent = 0% / ${fmt(0)};
      document.getElementById(isPrimary ? 'sub1' : 'sub2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'iva1' : 'iva2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'tot1' : 'tot2').textContent = fmt(0);
    }

    // events
    licenciaSel.addEventListener("change", refreshOptions);
    rfcSel.addEventListener("change", calculateAndRender);
    nivelSel.addEventListener("change", calculateAndRender);
    userInput.addEventListener("change", calculateAndRender);
    opSel.addEventListener("change", calculateAndRender);

    // initial fill
    refreshOptions();
  }

  // =========================================
  // updateCombinedSummary: muestra resumen si hay dos calculadoras
  // =========================================
  function updateCombinedSummary(primarySystemName) {
    const combined = document.getElementById("combined-wrap");
    combined.innerHTML = ""; // limpiar

    const calcPrimaryExists = document.getElementById("calc-primary");
    const calcSecondaryExists = document.getElementById("calc-secondary");

    // gather totals
    function parseCurrencyEl(id) {
      const el = document.getElementById(id);
      if (!el) return 0;
      const txt = el.textContent.replace(/[^\d.-]/g, "");
      return parseFloat(txt) || 0;
    }

    const total1 = parseCurrencyEl("tot1");
    const total2 = parseCurrencyEl("tot2");

    if (!calcSecondaryExists) {
      // show single total and CTA to integrate
      const p = document.createElement("p");
      p.innerHTML = <strong>Total:</strong> ${fmt(total1)};
      combined.appendChild(p);
    } else {
      // combined totals - also compute combined discount percent and amounts for display
      // compute subtotal and discount amounts read from fields
      const sub1 = parseCurrencyEl("sub1"); // after discount
      const sub2 = parseCurrencyEl("sub2");
      const disc1Text = document.getElementById("disc1")?.textContent || "0% / $0";
      const disc2Text = document.getElementById("disc2")?.textContent || "0% / $0";

      const box = document.createElement("div");
      box.className = "combined-summary";
      box.innerHTML = `
        <h4>Resumen combinado</h4>
        <p>Sistema 1: ${fmt(total1)}</p>
        <p>Sistema 2: ${fmt(total2)}</p>
        <p><strong>Total combinado:</strong> ${fmt(total1 + total2)}</p>
        <table class="combined-table">
          <thead><tr><th>Concepto</th><th>Importe</th></tr></thead>
          <tbody>
            <tr><td>Subtotal sistema 1 (después descuento)</td><td>${fmt(sub1)}</td></tr>
            <tr><td>Subtotal sistema 2 (después descuento)</td><td>${fmt(sub2)}</td></tr>
            <tr><td>IVA total (sistemas)</td><td>${fmt((parseCurrencyEl("iva1") + parseCurrencyEl("iva2")))}</td></tr>
            <tr><td><strong>Total combinado</strong></td><td><strong>${fmt(total1 + total2)}</strong></td></tr>
          </tbody>
        </table>
      `;
      combined.appendChild(box);
    }
  }

  // add minimal CSS for readability (you can move to file)
  function addStyles() {
    const css = `
      #app { font-family: Arial, Helvetica, sans-serif; max-width: 980px; margin: 14px;}
      .sys-header h2 { margin:0 0 6px 0; }
      .sys-video iframe { max-width:100%; }
      .calc-container { border:1px solid #e0e0e0; padding:10px; margin:10px 0; border-radius:6px; background:#fafafa;}
      .calc-form label { display:inline-block; margin-right:10px; }
      .calc-form input[type="number"] { width:70px; }
      .tooltip-question { display:inline-block; background:#eee; border-radius:50%; width:18px; height:18px; text-align:center; line-height:18px; margin-left:6px; cursor:help; }
      .icons-wrap { display:flex; flex-wrap:wrap; gap:8px; margin:8px 0; }
      .system-icon { border:1px solid #ddd; border-radius:6px; padding:8px; cursor:pointer; background:#fff; display:flex; align-items:center; gap:8px;}
      .icon-placeholder { width:36px; height:36px; border-radius:6px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-weight:bold; }
      .calc-table, .combined-table { width:100%; border-collapse:collapse; margin-top:8px;}
      .calc-table td, .calc-table th, .combined-table td, .combined-table th { border:1px solid #eee; padding:8px; text-align:right;}
      .calc-table th, .combined-table th { text-align:left; background:#fafafa; }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // init on DOM ready
  addStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

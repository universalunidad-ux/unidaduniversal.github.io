(function () {
  // =========================================
  // CONFIG: Descripciones y videos por sistema
  // =========================================
  const DESCRIPCIONES = {
    "CONTPAQi Contabilidad": {
      titulo: "CONTPAQi Contabilidad",
      descripcion: "Sistema para llevar contabilidad electrónica, pólizas y reportes fiscales.",
      video: "",
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
    }
  };

  // =========================================
  // Helpers: formato moneda, tooltip
  // =========================================
  const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fmt = v => money.format(Math.round(Number(v || 0)));
  const pct = v => `${((v || 0) * 100).toFixed(0)}%`;

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
      app.innerHTML = `<p>Error: sistema no encontrado. Asegura data-system="${sistemaActual}" y que precios-contpaqi.js esté cargado.</p>`;
      return;
    }

    // build UI
    app.innerHTML = "";
    const desc = DESCRIPCIONES[sistemaActual] || {
      titulo: sistemaActual,
      descripcion: "",
      video: "",
      caracteristicas: []
    };

    // Header
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
      if (desc.video.includes("youtube.com") || desc.video.includes("youtu.be")) {
        let id = "";
        const m = desc.video.match(/(?:v=|\/)([A-Za-z0-9_-]{6,})/);
        if (m && m[1]) id = m[1];
        if (id) {
          const iframe = document.createElement("iframe");
          iframe.width = "560";
          iframe.height = "315";
          iframe.src = `https://www.youtube.com/embed/${id}`;
          iframe.title = `${desc.titulo} video`;
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

    // Contenedor principal
    const main = document.createElement("div");
    main.className = "sys-main";

    // Calculadora primaria
    const calc1Container = document.createElement("div");
    calc1Container.id = "calc-primary";
    calc1Container.className = "calc-container";
    main.appendChild(calc1Container);

    // Panel integración
    const integrPanel = document.createElement("div");
    integrPanel.className = "integr-panel";
    const integrText = document.createElement("p");
    integrText.innerHTML = `Integra tu sistema con otro adicional y recibe <strong>15% de descuento</strong> en cada sistema!`;
    integrPanel.appendChild(integrText);

    const iconsWrap = document.createElement("div");
    iconsWrap.className = "icons-wrap";
    Object.keys(preciosContpaqi).forEach(name => {
      if (name === sistemaActual) return;
      const btn = document.createElement("button");
      btn.className = "system-icon";
      btn.type = "button";
      btn.dataset.system = name;
      btn.title = name;
      btn.innerHTML = `
        <div class="icon-placeholder">${name.split(" ")[1] || "S"}</div>
        <div class="icon-label">${name}</div>
      `;
      btn.addEventListener("click", () => {
        showSecondarySystem(name);
      });
      iconsWrap.appendChild(btn);
    });
    integrPanel.appendChild(iconsWrap);
    main.appendChild(integrPanel);

    // Contenedor secundario + resumen
    const secondaryWrap = document.createElement("div");
    secondaryWrap.id = "secondary-wrap";
    main.appendChild(secondaryWrap);

    const combinedWrap = document.createElement("div");
    combinedWrap.id = "combined-wrap";
    main.appendChild(combinedWrap);

    app.appendChild(main);

    // crear calculadora 1
    createCalculator(calc1Container, sistemaActual, true);
    // refresco del combinado
    setInterval(() => updateCombinedSummary(), 400);
  }

  // =========================================
  // Panel secundario
  // =========================================
  function showSecondarySystem(name) {
    const secWrap = document.getElementById("secondary-wrap");
    secWrap.innerHTML = "";

    const h3 = document.createElement("h3");
    h3.textContent = `Sistema adicional: ${name}`;
    secWrap.appendChild(h3);

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

    const calc2Container = document.createElement("div");
    calc2Container.id = "calc-secondary";
    calc2Container.className = "calc-container";
    secWrap.appendChild(calc2Container);

    createCalculator(calc2Container, name, false);

    const note = document.createElement("p");
    note.innerHTML = `<small>Nota: XML en Línea no aplica para descuento de integración.</small>`;
    secWrap.appendChild(note);
  }

  // =========================================
  // Crear calculadora
  // =========================================
  function createCalculator(container, sistemaName, isPrimary) {
    container.innerHTML = "";
    const systemPrices = preciosContpaqi[sistemaName];

    // Título
    const title = document.createElement("h4");
    title.textContent = `${sistemaName} — Calculadora`;
    container.appendChild(title);

    // Formulario
    const form = document.createElement("div");
    form.className = "calc-form";

    // Modalidad
    const licenciaLabel = document.createElement("label");
    licenciaLabel.textContent = "Modalidad: ";
    const licenciaSel = document.createElement("select");
    licenciaSel.id = (isPrimary ? "lic1" : "lic2");
    Object.keys(systemPrices).forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      const lbl = k === "anual" ? "Anual (renovación)" : k === "tradicional" ? "Tradicional (licencia)" : "Nube";
      opt.textContent = lbl;
      licenciaSel.appendChild(opt);
    });
    licenciaLabel.appendChild(licenciaSel);
    form.appendChild(licenciaLabel);

    // Tipo/Opción
    const rfcLabel = document.createElement("label");
    rfcLabel.textContent = "Tipo / Opción: ";
    const rfcSel = document.createElement("select");
    rfcSel.id = (isPrimary ? "rfc1" : "rfc2");
    rfcLabel.appendChild(rfcSel);
    form.appendChild(rfcLabel);

    // Ayuda Mono/Multi
    const mmHelp = questionMark("MonoRFC: solo 1 RFC (empresa). MultiRFC: permite varias empresas/folios en la misma licencia.");
    form.appendChild(mmHelp);

    // Nivel (nube)
    const nivelLabel = document.createElement("label");
    nivelLabel.textContent = "Nivel (solo nube): ";
    const nivelSel = document.createElement("select");
    nivelSel.id = (isPrimary ? "niv1" : "niv2");
    nivelLabel.appendChild(nivelSel);
    nivelLabel.style.display = "none";
    form.appendChild(nivelLabel);

    // Usuarios
    const userLabel = document.createElement("label");
    userLabel.textContent = "Usuarios: ";
    const userInput = document.createElement("input");
    userInput.type = "number";
    userInput.min = "1";
    userInput.value = "1";
    userInput.id = (isPrimary ? "usr1" : "usr2");
    userLabel.appendChild(userInput);
    form.appendChild(userLabel);

    // Operación
    const opLabel = document.createElement("label");
    opLabel.textContent = "Operación: ";
    const opSel = document.createElement("select");
    opSel.id = (isPrimary ? "op1" : "op2");
    opLabel.appendChild(opSel);
    form.appendChild(opLabel);

    container.appendChild(form);

    // Resultados
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

    // Rellenar selects según modalidad
    function refreshOptions() {
      const lic = licenciaSel.value;
      rfcSel.innerHTML = "";
      nivelSel.innerHTML = "";
      nivelLabel.style.display = "none";
      opSel.innerHTML = "";

      if (lic === "nube") {
        if (systemPrices.nube) {
          Object.keys(systemPrices.nube).forEach(n => {
            const opt = document.createElement("option");
            opt.value = n;
            opt.textContent = n;
            nivelSel.appendChild(opt);
          });
        }
        nivelLabel.style.display = "inline-block";
        ["Contratar (nueva)", "Renovación anual"].forEach(o => {
          const opt = document.createElement("option");
          opt.value = o;
          opt.textContent = o;
          opSel.appendChild(opt);
        });
      } else {
        const block = systemPrices[lic];
        if (block) {
          Object.keys(block).forEach(k => {
            const opt = document.createElement("option");
            opt.value = k;
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
        if (lic === "anual") {
          ["Renovación anual", "Nueva anual (contratar)"].forEach(o => {
            const opt = document.createElement("option");
            opt.value = o;
            opt.textContent = o;
            opSel.appendChild(opt);
          });
        } else {
          ["Licencia Tradicional (nueva)", "Actualización tradicional"].forEach(o => {
            const opt = document.createElement("option");
            opt.value = o;
            opt.textContent = o;
            opSel.appendChild(opt);
          });
        }
      }
      calculateAndRender();
    }

    // Calcular y pintar
    function calculateAndRender() {
      const lic = licenciaSel.value;
      const rfcType = rfcSel.value;
      const nivel = nivelSel.value;
      const usuarios = parseInt(userInput.value) || 1;
      const op = opSel.value || "";

      let base = 0;
      let usuariosAddImporte = 0;
      let usuariosExtras = 0;

      if (lic === "nube") {
        const datosNube = systemPrices.nube && systemPrices.nube[nivel];
        if (!datosNube) return writeZeros();
        base = Number(datosNube.precio_base || 0);
        const incluidos = datosNube.usuarios_incluidos === "multi"
          ? usuarios
          : Number(datosNube.usuarios_incluidos || 1);
        usuariosExtras = Math.max(usuarios - incluidos, 0);
        const perUserNube = Number(systemPrices.nube.usuario_adicional || 0);
        usuariosAddImporte = usuariosExtras * perUserNube;

      } else {
        const datosLic = (systemPrices[lic] && systemPrices[lic][rfcType]) || null;
        if (!datosLic) return writeZeros();

        // === Base según operación ===
        if (lic === "anual") {
          const esRenov = /renovación/i.test(op);
          base = Number((esRenov ? (datosLic.renovacion ?? datosLic.precio_base) : datosLic.precio_base) || 0);
          // Para anual, usuario adicional = usuario en red
          const perUser = Number(datosLic.usuario_en_red ?? datosLic.usuario_adicional ?? 0);
          usuariosExtras = Math.max(usuarios - 1, 0);
          usuariosAddImporte = usuariosExtras * perUser;

        } else { // tradicional
          if (rfcType === "crecimiento_usuario") {
            base = 0;
            const perUser = Number((systemPrices.tradicional.crecimiento_usuario && systemPrices.tradicional.crecimiento_usuario.usuario_adicional) || 0);
            usuariosExtras = Math.max(usuarios - 1, 0);
            usuariosAddImporte = usuariosExtras * perUser;
          } else {
            base = Number(datosLic.precio_base || 0);
            // usuario adicional de la fila o fallback al crecimiento_usuario
            const perUser = Number(
              (datosLic.usuario_adicional != null ? datosLic.usuario_adicional : (systemPrices.tradicional.crecimiento_usuario && systemPrices.tradicional.crecimiento_usuario.usuario_adicional)) || 0
            );
            usuariosExtras = Math.max(usuarios - 1, 0);
            usuariosAddImporte = usuariosExtras * perUser;
          }
        }
      }

      const subtotal = base + usuariosAddImporte;

      // Descuento por 2do sistema (excepto XML en Línea)
      let discountPct = 0;
      const secondaryExists = !!document.getElementById("calc-secondary");
      if (secondaryExists && !sistemaName.includes("XML en Línea")) {
        discountPct = 0.15;
      }

      const discountAmt = subtotal * discountPct;
      const afterDiscount = subtotal - discountAmt;
      const iva = afterDiscount * 0.16;
      const total = afterDiscount + iva;

      document.getElementById(isPrimary ? 'base1' : 'base2').textContent = fmt(base);
      document.getElementById(isPrimary ? 'uadd1' : 'uadd2').textContent = `${fmt(usuariosAddImporte)} (${usuariosExtras} extras)`;
      document.getElementById(isPrimary ? 'disc1' : 'disc2').textContent = `${pct(discountPct)} / ${fmt(discountAmt)}`;
      document.getElementById(isPrimary ? 'sub1' : 'sub2').textContent = fmt(afterDiscount);
      document.getElementById(isPrimary ? 'iva1' : 'iva2').textContent = fmt(iva);
      document.getElementById(isPrimary ? 'tot1' : 'tot2').textContent = fmt(total);

      updateCombinedSummary();
    }

    function writeZeros() {
      document.getElementById(isPrimary ? 'base1' : 'base2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'uadd1' : 'uadd2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'disc1' : 'disc2').textContent = `0% / ${fmt(0)}`;
      document.getElementById(isPrimary ? 'sub1' : 'sub2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'iva1' : 'iva2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'tot1' : 'tot2').textContent = fmt(0);
    }

    // Eventos
    licenciaSel.addEventListener("change", refreshOptions);
    rfcSel.addEventListener("change", calculateAndRender);
    nivelSel.addEventListener("change", calculateAndRender);
    userInput.addEventListener("change", calculateAndRender);
    opSel.addEventListener("change", calculateAndRender);

    refreshOptions();
  }

  // =========================================
  // Resumen combinado
  // =========================================
  function updateCombinedSummary() {
    const combined = document.getElementById("combined-wrap");
    combined.innerHTML = "";

    function parseCurrencyEl(id) {
      const el = document.getElementById(id);
      if (!el) return 0;
      const txt = el.textContent.replace(/[^\d.-]/g, "");
      return parseFloat(txt) || 0;
    }

    const total1 = parseCurrencyEl("tot1");
    const total2 = parseCurrencyEl("tot2");
    const calcSecondaryExists = document.getElementById("calc-secondary");

    if (!calcSecondaryExists) {
      const p = document.createElement("p");
      p.innerHTML = `<strong>Total:</strong> ${fmt(total1)}`;
      combined.appendChild(p);
      return;
    }

    const sub1 = parseCurrencyEl("sub1");
    const sub2 = parseCurrencyEl("sub2");
    const ivaTotal = parseCurrencyEl("iva1") + parseCurrencyEl("iva2");

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
          <tr><td>IVA total (sistemas)</td><td>${fmt(ivaTotal)}</td></tr>
          <tr><td><strong>Total combinado</strong></td><td><strong>${fmt(total1 + total2)}</strong></td></tr>
        </tbody>
      </table>
    `;
    combined.appendChild(box);
  }

  // CSS mínimo
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

  // init
  addStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  // =========================================
  // Helpers: formato moneda, %
  // =========================================
  const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fmt = v => money.format(Math.round(Number(v || 0)));
  const pct = v => `${((v || 0) * 100).toFixed(0)}%`;

  // =========================================
  // createCalculator: Render de una calculadora
  // =========================================
  function createCalculator(container, sistemaName, isPrimary, combinedSelector) {
    container.innerHTML = "";
    const systemPrices = window.preciosContpaqi?.[sistemaName];
    if (!systemPrices) {
      container.innerHTML = `<p style="margin:0">Error: faltan precios para <strong>${sistemaName}</strong>.</p>`;
      return;
    }

    // Título local de la caja
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
      <thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>
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

        if (lic === "anual") {
          const esRenov = /renovación/i.test(op);
          base = Number((esRenov ? (datosLic.renovacion ?? datosLic.precio_base) : datosLic.precio_base) || 0);
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
            const perUser = Number(
              (datosLic.usuario_adicional != null ? datosLic.usuario_adicional : (systemPrices.tradicional.crecimiento_usuario && systemPrices.tradicional.crecimiento_usuario.usuario_adicional)) || 0
            );
            usuariosExtras = Math.max(usuarios - 1, 0);
            usuariosAddImporte = usuariosExtras * perUser;
          }
        }
      }

      const subtotal = base + usuariosAddImporte;

      // Descuento por 2do sistema (se aplica solo si existe calculadora secundaria renderizada)
      let discountPct = 0;
      const secondaryExists = !!document.getElementById("calc-secondary")?.querySelector("table");
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

      updateCombinedSummary(combinedSelector);
    }

    function writeZeros() {
      document.getElementById(isPrimary ? 'base1' : 'base2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'uadd1' : 'uadd2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'disc1' : 'disc2').textContent = `0% / ${fmt(0)}`;
      document.getElementById(isPrimary ? 'sub1' : 'sub2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'iva1' : 'iva2').textContent = fmt(0);
      document.getElementById(isPrimary ? 'tot1' : 'tot2').textContent = fmt(0);
      updateCombinedSummary(combinedSelector);
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
  // Resumen combinado (usa los totales ya pintados)
  // =========================================
  function updateCombinedSummary(combinedSelector = "#combined-wrap") {
    const combined = document.querySelector(combinedSelector);
    if (!combined) return;

    function parseCurrencyEl(id) {
      const el = document.getElementById(id);
      if (!el) return 0;
      const txt = el.textContent.replace(/[^\d.-]/g, "");
      return parseFloat(txt) || 0;
    }

    const total1 = parseCurrencyEl("tot1");
    const total2 = parseCurrencyEl("tot2");
    const calcSecondaryExists = document.getElementById("calc-secondary")?.querySelector("table");

    combined.innerHTML = "";
    if (!calcSecondaryExists) {
      combined.innerHTML = `<p style="margin:0"><strong>Total:</strong> ${fmt(total1)}</p>`;
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
        <thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>
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

  // =========================================
  // API pública mínima
  // =========================================
  function initCalculadora(opts = {}) {
    const {
      systemName,
      primarySelector = "#calc-primary",
      secondarySelector = "#calc-secondary",
      combinedSelector = "#combined-wrap"
    } = opts;

    const primaryEl = document.querySelector(primarySelector);
    if (!primaryEl) return console.warn("No existe contenedor primario de calculadora:", primarySelector);
    createCalculator(primaryEl, systemName, true, combinedSelector);

    const secEl = document.querySelector(secondarySelector);
    if (secEl) secEl.innerHTML = "";
  }

  function setSecondarySystem(name, opts = {}) {
    const {
      secondarySelector = "#calc-secondary",
      combinedSelector = "#combined-wrap"
    } = opts;

    const secEl = document.querySelector(secondarySelector);
    if (!secEl) return console.warn("No existe contenedor secundario:", secondarySelector);
    createCalculator(secEl, name, false, combinedSelector);
  }

  // Exponer en window
  window.CalculadoraContpaqi = {
    init: initCalculadora,
    setSecondarySystem,
    updateCombinedSummary
  };

  // Auto-init sencillo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const app = document.getElementById("app");
      const sys = app?.dataset.system;
      if (sys && document.querySelector("#calc-primary")) {
        window.CalculadoraContpaqi.init({ systemName: sys });
      }
    });
  } else {
    const app = document.getElementById("app");
    const sys = app?.dataset.system;
    if (sys && document.querySelector("#calc-primary")) {
      window.CalculadoraContpaqi.init({ systemName: sys });
    }
  }
})();

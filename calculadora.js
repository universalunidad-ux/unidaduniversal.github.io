(function () {
  // ========================= Helpers =========================
  const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fmt = v => money.format(Math.round(Number(v || 0)));
  const pct = v => `${((v || 0) * 100).toFixed(0)}%`;

  // ===================== Render calculadora ===================
  // idSuffix: "1" | "2" | "3"
  function createCalculator(container, sistemaName, idSuffix, combinedSelector) {
    container.innerHTML = "";
    container.dataset.systemName = sistemaName;

    const systemPrices = window.preciosContpaqi?.[sistemaName];
    if (!systemPrices) {
      container.innerHTML = `<p style="margin:0">Error: faltan precios para <strong>${sistemaName}</strong>.</p>`;
      return;
    }

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
    licenciaSel.id = `lic${idSuffix}`;
    Object.keys(systemPrices).forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = (k === "anual" ? "Anual (renovación)" : k === "tradicional" ? "Tradicional (licencia)" : "Nube");
      licenciaSel.appendChild(opt);
    });
    licenciaLabel.appendChild(licenciaSel);
    form.appendChild(licenciaLabel);

    // Tipo/Opción
    const rfcLabel = document.createElement("label");
    rfcLabel.textContent = "Tipo / Opción: ";
    const rfcSel = document.createElement("select");
    rfcSel.id = `rfc${idSuffix}`;
    rfcLabel.appendChild(rfcSel);
    form.appendChild(rfcLabel);

    // Nivel (nube)
    const nivelLabel = document.createElement("label");
    nivelLabel.textContent = "Nivel (solo nube): ";
    const nivelSel = document.createElement("select");
    nivelSel.id = `niv${idSuffix}`;
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
    userInput.id = `usr${idSuffix}`;
    userLabel.appendChild(userInput);
    form.appendChild(userLabel);

    // Operación
    const opLabel = document.createElement("label");
    opLabel.textContent = "Operación: ";
    const opSel = document.createElement("select");
    opSel.id = `op${idSuffix}`;
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
        <tr><td>Precio base</td><td id="base${idSuffix}">$0</td></tr>
        <tr><td>Usuarios adicionales</td><td id="uadd${idSuffix}">$0</td></tr>
        <tr><td>Descuento</td><td id="disc${idSuffix}">0% / $0</td></tr>
        <tr><td>Subtotal</td><td id="sub${idSuffix}">$0</td></tr>
        <tr><td>IVA (16%)</td><td id="iva${idSuffix}">$0</td></tr>
        <tr><td><strong>Total</strong></td><td id="tot${idSuffix}"><strong>$0</strong></td></tr>
      </tbody>
    `;
    results.appendChild(table);
    container.appendChild(results);

    // -------- Opciones dependientes --------
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
            opt.value = n; opt.textContent = n;
            nivelSel.appendChild(opt);
          });
        }
        nivelLabel.style.display = "inline-block";
        ["Contratar (nueva)", "Renovación anual"].forEach(o => {
          const opt = document.createElement("option");
          opt.value = o; opt.textContent = o;
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
            const opt = document.createElement("option"); opt.value = o; opt.textContent = o; opSel.appendChild(opt);
          });
        } else {
          ["Licencia Tradicional (nueva)", "Actualización tradicional"].forEach(o => {
            const opt = document.createElement("option"); opt.value = o; opt.textContent = o; opSel.appendChild(opt);
          });
        }
      }
      calculateAndRender();
    }

    // ----------------- Cálculo -----------------
    function calculateAndRender() {
      const lic = licenciaSel.value || Object.keys(systemPrices)[0];
      const rfcType = rfcSel.value;
      const nivel = nivelSel.value;
      const usuarios = parseInt(userInput.value) || 1;
      const op = opSel.value || "";

      let base = 0, usuariosAddImporte = 0, usuariosExtras = 0;

      if (lic === "nube") {
        const datosNube = systemPrices.nube && systemPrices.nube[nivel];
        if (!datosNube) return writeZeros();
        base = Number(datosNube.precio_base || 0);
        const incluidos = datosNube.usuarios_incluidos === "multi" ? usuarios : Number(datosNube.usuarios_incluidos || 1);
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
        } else {
          if (rfcType === "crecimiento_usuario") {
            base = 0;
            const perUser = Number((systemPrices.tradicional.crecimiento_usuario && systemPrices.tradicional.crecimiento_usuario.usuario_adicional) || 0);
            usuariosExtras = Math.max(usuarios - 1, 0);
            usuariosAddImporte = usuariosExtras * perUser;
          } else {
            base = Number(datosLic.precio_base || 0);
            const perUser = Number(
              (datosLic.usuario_adicional != null ? datosLic.usuario_adicional :
               (systemPrices.tradicional.crecimiento_usuario && systemPrices.tradicional.crecimiento_usuario.usuario_adicional)) || 0
            );
            usuariosExtras = Math.max(usuarios - 1, 0);
            usuariosAddImporte = usuariosExtras * perUser;
          }
        }
      }

      const subtotal = base + usuariosAddImporte;

      // Descuento por paquete (si hay 2 o 3 cajas), excluye XML en Línea
      let discountPct = 0;
      const has2 = !!document.getElementById("calc-secondary")?.querySelector("table");
      const has3 = !!document.getElementById("calc-tertiary")?.querySelector("table");
      const paquete = has2 || has3;
      if (paquete && !sistemaName.includes("XML en Línea")) discountPct = 0.15;

      const discountAmt = subtotal * discountPct;
      const afterDiscount = subtotal - discountAmt;
      const iva = afterDiscount * 0.16;
      const total = afterDiscount + iva;

      document.getElementById(`base${idSuffix}`).textContent = fmt(base);
      document.getElementById(`uadd${idSuffix}`).textContent = `${fmt(usuariosAddImporte)} (${usuariosExtras} extras)`;
      document.getElementById(`disc${idSuffix}`).textContent = `${pct(discountPct)} / ${fmt(discountAmt)}`;
      document.getElementById(`sub${idSuffix}`).textContent = fmt(afterDiscount);
      document.getElementById(`iva${idSuffix}`).textContent = fmt(iva);
      document.getElementById(`tot${idSuffix}`).textContent = fmt(total);

      updateCombinedSummary(combinedSelector);
    }

    function writeZeros() {
      document.getElementById(`base${idSuffix}`).textContent = fmt(0);
      document.getElementById(`uadd${idSuffix}`).textContent = fmt(0);
      document.getElementById(`disc${idSuffix}`).textContent = `0% / ${fmt(0)}`;
      document.getElementById(`sub${idSuffix}`).textContent = fmt(0);
      document.getElementById(`iva${idSuffix}`).textContent = fmt(0);
      document.getElementById(`tot${idSuffix}`).textContent = fmt(0);
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

  // =================== Resumen combinado =====================
  function updateCombinedSummary(combinedSelector = "#combined-wrap") {
    const combined = document.querySelector(combinedSelector);
    if (!combined) return;

    const getNum = id => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const n = parseFloat(el.textContent.replace(/[^\d.-]/g, ""));
      return isNaN(n) ? 0 : n;
    };

    // ¿Existen?
    const e1 = !!document.getElementById("tot1");
    const e2 = !!document.getElementById("tot2");
    const e3 = !!document.getElementById("tot3");

    combined.innerHTML = "";

    if (!e2 && !e3) {
      // Solo una
      combined.innerHTML = `<p style="margin:0"><strong>Total:</strong> ${fmt(getNum("tot1"))}</p>`;
      return;
    }

    // Nombres
    const n1 = document.getElementById("calc-primary")?.dataset.systemName || "Sistema 1";
    const n2 = document.getElementById("calc-secondary")?.dataset.systemName || "Sistema 2";
    const n3 = document.getElementById("calc-tertiary")?.dataset.systemName || "Sistema 3";

    const filas = [];
    const totales = [];
    let ivaTotal = 0;

    if (e1) { filas.push({label:`Subtotal ${n1} (después descuento)`, val:getNum("sub1")}); totales.push(getNum("tot1")); ivaTotal += getNum("iva1"); }
    if (e2) { filas.push({label:`Subtotal ${n2} (después descuento)`, val:getNum("sub2")}); totales.push(getNum("tot2")); ivaTotal += getNum("iva2"); }
    if (e3) { filas.push({label:`Subtotal ${n3} (después descuento)`, val:getNum("sub3")}); totales.push(getNum("tot3")); ivaTotal += getNum("iva3"); }

    const totalCombinado = totales.reduce((a,b)=>a+b,0);

    const box = document.createElement("div");
    box.className = "combined-summary";
    box.innerHTML = `
      <h4>Resumen combinado</h4>
      ${e1 ? `<p>${n1}: ${fmt(getNum("tot1"))}</p>` : ""}
      ${e2 ? `<p>${n2}: ${fmt(getNum("tot2"))}</p>` : ""}
      ${e3 ? `<p>${n3}: ${fmt(getNum("tot3"))}</p>` : ""}
      <p><strong>Total combinado:</strong> ${fmt(totalCombinado)}</p>
      <table class="combined-table">
        <thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>
        <tbody>
          ${filas.map(f=>`<tr><td>${f.label}</td><td>${fmt(f.val)}</td></tr>`).join("")}
          <tr><td>IVA total (sistemas)</td><td>${fmt(ivaTotal)}</td></tr>
          <tr><td><strong>Total combinado</strong></td><td><strong>${fmt(totalCombinado)}</strong></td></tr>
        </tbody>
      </table>
    `;
    combined.appendChild(box);
  }

  // ====================== API pública =======================
  function initCalculadora(opts = {}) {
    const { systemName, primarySelector = "#calc-primary", combinedSelector = "#combined-wrap" } = opts;
    const el = document.querySelector(primarySelector);
    if (!el) return console.warn("No existe contenedor primario:", primarySelector);
    createCalculator(el, systemName, "1", combinedSelector);
  }

  function setSecondarySystem(name, opts = {}) {
    const { secondarySelector = "#calc-secondary", combinedSelector = "#combined-wrap" } = opts;
    const el = document.querySelector(secondarySelector);
    if (!el) return console.warn("No existe contenedor secundario:", secondarySelector);
    createCalculator(el, name, "2", combinedSelector);
  }

  function setTertiarySystem(name, opts = {}) {
    const { tertiarySelector = "#calc-tertiary", combinedSelector = "#combined-wrap" } = opts;
    const el = document.querySelector(tertiarySelector);
    if (!el) return console.warn("No existe contenedor terciario:", tertiarySelector);
    createCalculator(el, name, "3", combinedSelector);
  }

  window.CalculadoraContpaqi = { init: initCalculadora, setSecondarySystem, setTertiarySystem, updateCombinedSummary };

  // Auto-init
  function autoInit() {
    const app = document.getElementById("app");
    const sys = app?.dataset.system;
    if (sys && document.querySelector("#calc-primary")) {
      window.CalculadoraContpaqi.init({ systemName: sys });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoInit);
  else autoInit();
})();

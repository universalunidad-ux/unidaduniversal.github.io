(function () {
  // ========================= Helpers =========================
  const money = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
  const fmt = (v) => money.format(Math.round(Number(v || 0)));
  const pct = (v) => `${((v || 0) * 100).toFixed(0)}%`;

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

    // ---------- Título ----------
    const title = document.createElement("h4");
    title.textContent = `${sistemaName} — Calculadora`;
    container.appendChild(title);

    // ---------- Formulario (usar <form> para entrar en tus reglas CSS) ----------
    const form = document.createElement("form");
    form.className = "calc-form";
    form.style.display = "grid";
    form.style.gridTemplateColumns = "1fr";
    form.style.gap = "8px";

    // 1) Licencia (Nueva / Renovación / Tradicional)
    const licenciaLabel = document.createElement("label");
    licenciaLabel.textContent = "Licencia: ";
    const licenciaSel = document.createElement("select");
    licenciaSel.id = `lic${idSuffix}`;
    [
      { v: "nueva", t: "Nueva" },
      { v: "renovacion", t: "Renovación" },
      { v: "tradicional", t: "Tradicional" },
    ].forEach(({ v, t }) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = t;
      licenciaSel.appendChild(opt);
    });
    licenciaLabel.appendChild(licenciaSel);
    form.appendChild(licenciaLabel);

    // 2) Operación (depende de Licencia)
    const opLabel = document.createElement("label");
    opLabel.textContent = "Operación: ";
    const opSel = document.createElement("select");
    opSel.id = `op${idSuffix}`;
    opLabel.appendChild(opSel);
    form.appendChild(opLabel);

    // 3) Tipo (RFC)
    const rfcLabel = document.createElement("label");
    rfcLabel.textContent = "Tipo (RFC): ";
    const rfcSel = document.createElement("select");
    rfcSel.id = `rfc${idSuffix}`;
    rfcLabel.appendChild(rfcSel);
    form.appendChild(rfcLabel);

    // (Nivel nube — no se usa en este flujo; oculto por compatibilidad)
    const nivelLabel = document.createElement("label");
    nivelLabel.textContent = "Nivel (solo nube): ";
    const nivelSel = document.createElement("select");
    nivelSel.id = `niv${idSuffix}`;
    nivelLabel.appendChild(nivelSel);
    nivelLabel.style.display = "none";
    form.appendChild(nivelLabel);

    // 4) Usuarios
    const userLabel = document.createElement("label");
    userLabel.textContent = "Usuarios: ";
    const userInput = document.createElement("input");
    userInput.type = "number";
    userInput.min = "1";
    userInput.value = "1";
    userInput.id = `usr${idSuffix}`;
    userLabel.appendChild(userInput);
    form.appendChild(userLabel);

    // ---------- Add-on: Instalación (opcional) ----------
    const instWrap = document.createElement("div");
    instWrap.className = "inst-wrap";
    instWrap.style.border = "1px dashed #29425e";
    instWrap.style.background = "#0e1724";
    instWrap.style.borderRadius = "12px";
    instWrap.style.padding = "10px";
    instWrap.style.marginTop = "8px";
    instWrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <input type="checkbox" id="instOn${idSuffix}" checked>
        <label for="instOn${idSuffix}"><strong>Instalación (opcional)</strong></label>
      </div>
      <div class="inst-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field">
          <label><strong>Modalidad de instalación</strong></label>
          <select id="instMode${idSuffix}">
            <option value="mono">Monousuario / Servidor — $800 + IVA</option>
            <option value="multi">Multiusuario (por equipo) — $750 c/u + IVA</option>
          </select>
          <div style="color:#9fb2cb;font-size:12px">En multiusuario se calcula por equipo. Por defecto: equipos = usuarios.</div>
        </div>
        <div class="field">
          <label><strong>Equipos a instalar</strong></label>
          <input id="instEq${idSuffix}" type="number" min="1" step="1" value="1">
          <div style="color:#9fb2cb;font-size:12px">Si eliges “Monousuario/Servidor”, se fija en 1.</div>
        </div>
      </div>
    `;
    form.appendChild(instWrap);

    container.appendChild(form);

    // ---------- Resultados ----------
    const results = document.createElement("div");
    results.className = "calc-results";
    const table = document.createElement("table");
    table.className = "calc-table";
    table.innerHTML = `
      <thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>
      <tbody>
        <tr><td>Precio base</td><td id="base${idSuffix}">$0</td></tr>
        <tr><td>Usuarios adicionales</td><td id="uadd${idSuffix}">$0</td></tr>
        <tr><td>Descuento (sistemas)</td><td id="disc${idSuffix}">0% / $0</td></tr>
        <tr><td>Instalación (opcional)</td><td id="inst${idSuffix}">$0</td></tr>
        <tr><td>Subtotal (sistemas)</td><td id="sub${idSuffix}">$0</td></tr>
        <tr><td>IVA (16%)</td><td id="iva${idSuffix}">$0</td></tr>
        <tr><td><strong>Total</strong></td><td id="tot${idSuffix}"><strong>$0</strong></td></tr>
      </tbody>
    `;
    results.appendChild(table);
    container.appendChild(results);

    // -------- Opciones dependientes --------
    function refreshOptions() {
      const lic = licenciaSel.value; // nueva | renovacion | tradicional
      opSel.innerHTML = "";
      rfcSel.innerHTML = "";
      rfcLabel.style.display = "inline-block";

      if (lic === "nueva") {
        opSel.appendChild(new Option("Anual (Nueva)", "nueva_anual"));
        const anual = systemPrices.anual || {};
        if (anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
        if (anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
      } else if (lic === "renovacion") {
        opSel.appendChild(new Option("Renovación anual", "renovacion_anual"));
        const anual = systemPrices.anual || {};
        if (anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
        if (anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
      } else {
        opSel.appendChild(new Option("Actualización", "actualizacion"));
        opSel.appendChild(new Option("Actualización Especial", "especial"));
        opSel.appendChild(new Option("Incremento de usuarios", "crecimiento_usuario"));
        const trad = systemPrices.tradicional || {};
        const hasRFC = trad.actualizacion || trad.especial;
        if (hasRFC) {
          rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
          rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
        }
      }

      if (rfcSel.options.length === 0) rfcLabel.style.display = "none";

      syncInstallControls();
      calculateAndRender();
    }

    // ----------------- Instalación (UI) -----------------
    const $instOn = () => document.getElementById(`instOn${idSuffix}`);
    const $instMode = () => document.getElementById(`instMode${idSuffix}`);
    const $instEq = () => document.getElementById(`instEq${idSuffix}`);

    function syncInstallControls() {
      const on = $instOn(), mode = $instMode(), eq = $instEq();
      if (!on || !mode || !eq) return;
      const usuarios = parseInt(userInput.value) || 1;
      if (!eq.dataset.manual) {
        if (usuarios > 1) { mode.value = "multi"; eq.value = usuarios; }
        else { mode.value = "mono"; eq.value = 1; }
      }
      if (mode.value === "mono") { eq.value = 1; eq.disabled = true; }
      else { eq.disabled = false; }
    }

    function calcInstallationAmount() {
      const on = $instOn(), mode = $instMode(), eq = $instEq();
      if (!on || !mode || !eq || !on.checked) return 0;
      if (mode.value === "mono") return 800; // sin IVA
      const usuarios = parseInt(userInput.value) || 1;
      const equipos = Math.max(1, parseInt(eq.value) || usuarios || 1);
      return 750 * equipos; // sin IVA
    }

    // ----------------- Cálculo -----------------
    function calculateAndRender() {
      const lic = licenciaSel.value;
      const op = opSel.value || "";
      const rfcType = rfcSel.value;
      const usuarios = parseInt(userInput.value) || 1;

      let base = 0, usuariosAddImporte = 0, usuariosExtras = 0;

      if (lic === "nueva" || lic === "renovacion") {
        const anual = systemPrices.anual || {};
        const datosLic = anual[rfcType] || null;
        if (!datosLic) return writeZeros();

        base = Number(
          lic === "nueva"
            ? (datosLic.precio_base || 0)
            : (datosLic.renovacion != null ? datosLic.renovacion : datosLic.precio_base || 0)
        );

        const perUser = Number(
          datosLic.usuario_en_red != null ? datosLic.usuario_en_red : (datosLic.usuario_adicional || 0)
        );
        usuariosExtras = Math.max(usuarios - 1, 0);
        usuariosAddImporte = usuariosExtras * perUser;
      } else {
        const trad = systemPrices.tradicional || {};
        if (op === "crecimiento_usuario") {
          const perUser = Number(trad.crecimiento_usuario && trad.crecimiento_usuario.usuario_adicional) || 0;
          base = 0;
          usuariosExtras = Math.max(usuarios - 1, 0);
          usuariosAddImporte = usuariosExtras * perUser;
        } else if (op === "actualizacion" || op === "especial") {
          const datos = trad[op] || null;
          if (!datos) return writeZeros();
          base = Number(datos.precio_base || 0);
          const perUser = Number(
            datos.usuario_adicional != null ? datos.usuario_adicional :
            (trad.crecimiento_usuario && trad.crecimiento_usuario.usuario_adicional) || 0
          );
          usuariosExtras = Math.max(usuarios - 1, 0);
          usuariosAddImporte = usuariosExtras * perUser;
        } else {
          return writeZeros();
        }
      }

      const subtotalSistemas = base + usuariosAddImporte;

      // Descuento por paquete (si hay 2 o 3 cajas), excluye “XML en Línea”
      let discountPct = 0;
      const has2 = !!document.getElementById("calc-secondary")?.querySelector("table");
      const has3 = !!document.getElementById("calc-tertiary")?.querySelector("table");
      const paquete = has2 || has3;
      if (paquete && !sistemaName.includes("XML en Línea")) discountPct = 0.15;

      const discountAmt = subtotalSistemas * discountPct;
      const afterDiscount = subtotalSistemas - discountAmt;

      // Instalación (no descuenta)
      syncInstallControls();
      const instAmount = calcInstallationAmount();

      const baseImponible = afterDiscount + instAmount;
      const iva = baseImponible * 0.16;
      const total = baseImponible + iva;

      document.getElementById(`base${idSuffix}`).textContent = fmt(base);
      document.getElementById(`uadd${idSuffix}`).textContent = `${fmt(usuariosAddImporte)} (${usuariosExtras} extras)`;
      document.getElementById(`disc${idSuffix}`).textContent = `${pct(discountPct)} / ${fmt(discountAmt)}`;
      document.getElementById(`inst${idSuffix}`).textContent = fmt(instAmount);
      document.getElementById(`sub${idSuffix}`).textContent = fmt(afterDiscount);
      document.getElementById(`iva${idSuffix}`).textContent = fmt(iva);
      document.getElementById(`tot${idSuffix}`).textContent = fmt(total);

      updateCombinedSummary(combinedSelector);
    }

    function writeZeros() {
      document.getElementById(`base${idSuffix}`).textContent = fmt(0);
      document.getElementById(`uadd${idSuffix}`).textContent = fmt(0);
      document.getElementById(`disc${idSuffix}`).textContent = `0% / ${fmt(0)}`;
      document.getElementById(`inst${idSuffix}`).textContent = fmt(0);
      document.getElementById(`sub${idSuffix}`).textContent = fmt(0);
      document.getElementById(`iva${idSuffix}`).textContent = fmt(0);
      document.getElementById(`tot${idSuffix}`).textContent = fmt(0);
      updateCombinedSummary(combinedSelector);
    }

    // ===== Eventos =====
    licenciaSel.addEventListener("change", refreshOptions);

    opSel.addEventListener("change", () => {
      const lic = licenciaSel.value;
      const op = opSel.value;
      if (lic === "tradicional" && op === "crecimiento_usuario") {
        rfcLabel.style.display = "none";
      } else {
        if (rfcSel.options.length === 0) {
          rfcSel.innerHTML = "";
          if (lic === "nueva" || lic === "renovacion") {
            const anual = systemPrices.anual || {};
            if (anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
            if (anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
          } else {
            rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
            rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
          }
        }
        rfcLabel.style.display = "inline-block";
      }
      calculateAndRender();
    });

    rfcSel.addEventListener("change", calculateAndRender);

    userInput.addEventListener("change", () => {
      const eq = document.getElementById(`instEq${idSuffix}`);
      if (eq && !eq.dataset.manual) {
        const u = Math.max(1, parseInt(userInput.value || "1"));
        if (document.getElementById(`instMode${idSuffix}`)?.value === "multi") eq.value = u;
        else eq.value = 1;
      }
      calculateAndRender();
    });

    // Eventos de instalación (con null-check)
    const chk = document.getElementById(`instOn${idSuffix}`);
    const mode = document.getElementById(`instMode${idSuffix}`);
    const eq = document.getElementById(`instEq${idSuffix}`);

    if (chk) chk.addEventListener("change", calculateAndRender);
    if (mode) mode.addEventListener("change", () => {
      if (eq) eq.dataset.manual = "";
      syncInstallControls();
      calculateAndRender();
    });
    if (eq) eq.addEventListener("input", (e) => {
      e.target.dataset.manual = "1";
      calculateAndRender();
    });

    // Inicial
    refreshOptions();
  }

  // =================== Resumen combinado =====================
  function updateCombinedSummary(combinedSelector = "#combined-wrap") {
    const combined = document.querySelector(combinedSelector);
    if (!combined) return;

    const getNum = (id) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const n = parseFloat(el.textContent.replace(/[^\d.-]/g, ""));
      return isNaN(n) ? 0 : n;
    };

    const e1 = !!document.getElementById("tot1");
    const e2 = !!document.getElementById("tot2");
    const e3 = !!document.getElementById("tot3");

    combined.innerHTML = "";

    if (!e2 && !e3) {
      combined.innerHTML = `<p style="margin:0"><strong>Total:</strong> ${fmt(getNum("tot1"))}</p>`;
      return;
    }

    const n1 = document.getElementById("calc-primary")?.dataset.systemName || "Sistema 1";
    const n2 = document.getElementById("calc-secondary")?.dataset.systemName || "Sistema 2";
    const n3 = document.getElementById("calc-tertiary")?.dataset.systemName || "Sistema 3";

    const filas = [];
    const totales = [];
    let ivaTotal = 0;

    if (e1) { filas.push({ label: `Subtotal ${n1} (después descuento)`, val: getNum("sub1") }); totales.push(getNum("tot1")); ivaTotal += getNum("iva1"); }
    if (e2) { filas.push({ label: `Subtotal ${n2} (después descuento)`, val: getNum("sub2") }); totales.push(getNum("tot2")); ivaTotal += getNum("iva2"); }
    if (e3) { filas.push({ label: `Subtotal ${n3} (después descuento)`, val: getNum("sub3") }); totales.push(getNum("tot3")); ivaTotal += getNum("iva3"); }

    const totalCombinado = totales.reduce((a, b) => a + b, 0);

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
          ${filas.map((f) => `<tr><td>${f.label}</td><td>${fmt(f.val)}</td></tr>`).join("")}
          <tr><td>IVA total (sistemas + instalación)</td><td>${fmt(ivaTotal)}</td></tr>
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

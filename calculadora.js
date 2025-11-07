/* calculadora.js v13 — MultiRFC por defecto + “Operación” solo en Tradicional (con !important) */
(function () {
  'use strict';
  console.log('calculadora.js v13 cargado — MultiRFC default + Operación solo en Tradicional');

  // ========================= Helpers =========================
  var money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  function fmt(v){ return money.format(Math.round(Number(v || 0))); }
  function pct(v){ return ((v || 0) * 100).toFixed(0) + "%"; }
  function safeHasTable(id){
    var el = document.getElementById(id);
    return !!(el && el.querySelector && el.querySelector("table"));
  }
  function recomputeAll(){ window.dispatchEvent(new Event("calc-recompute")); }

  // ===== Parche CSS mínimo para asegurar el form, sin forzar label =====
  (function ensureFormVisible() {
    var id = "calc-form-visibility-patch";
    if (!document.getElementById(id)) {
      var st = document.createElement("style");
      st.id = id;
      st.textContent =
        ".calc-container form{display:grid!important;grid-auto-flow:row!important;grid-template-columns:1fr!important;gap:8px!important}" +
        ".calc-container select,.calc-container input[type='number']{display:block!important;visibility:visible!important;opacity:1!important}" +
        /* Operación oculta por defecto; la mostraremos con JS cuando Licencia=Tradicional */
        ".calc-container .op-label{display:none!important}";
      document.head.appendChild(st);
    }
  })();

  // ===================== Render calculadora ===================
  function createCalculator(container, sistemaName, idSuffix, combinedSelector) {
    container.innerHTML = "";
    container.dataset.systemName = sistemaName;

    var allPrices = window.preciosContpaqi || {};
    var systemPrices = allPrices[sistemaName];
    if (!systemPrices) {
      container.innerHTML = '<p style="margin:0">Error: faltan precios para <strong>'+sistemaName+'</strong>.</p>';
      return;
    }

    // ---------- Título ----------
    var title = document.createElement("h4");
    title.textContent = sistemaName + " — Calculadora";
    container.appendChild(title);

    // ---------- Formulario (orden solicitado) ----------
    var form = document.createElement("form");
    form.className = "calc-form";
    form.style.display = "grid";
    form.style.gridAutoFlow = "row";
    form.style.gridTemplateColumns = "1fr";
    form.style.gap = "8px";

    // 1) Licencia
    var licenciaLabel = document.createElement("label");
    licenciaLabel.textContent = "Licencia: ";
    var licenciaSel = document.createElement("select");
    licenciaSel.id = "lic"+idSuffix;
    [
      { v: "nueva", t: "Nueva" },
      { v: "renovacion", t: "Renovación" },
      { v: "tradicional", t: "Tradicional" }
    ].forEach(function(o){
      var opt=document.createElement("option"); opt.value=o.v; opt.textContent=o.t; licenciaSel.appendChild(opt);
    });
    licenciaLabel.appendChild(licenciaSel);
    form.appendChild(licenciaLabel);

    // 2) Operación (oculto por defecto; solo visible en Tradicional)
    var opLabel = document.createElement("label");
    opLabel.className = "op-label"; // clase clave para el parche CSS
    opLabel.textContent = "Operación: ";
    var opSel = document.createElement("select");
    opSel.id = "op"+idSuffix;
    opLabel.appendChild(opSel);
    form.appendChild(opLabel);

    // 3) Tipo (RFC)
    var rfcLabel = document.createElement("label");
    rfcLabel.textContent = "Tipo (RFC): ";
    var rfcSel = document.createElement("select");
    rfcSel.id = "rfc"+idSuffix;
    rfcLabel.appendChild(rfcSel);
    form.appendChild(rfcLabel);

    // 4) Usuarios
    var userLabel = document.createElement("label");
    userLabel.textContent = "Usuarios: ";
    var userInput = document.createElement("input");
    userInput.type = "number"; userInput.min = "1"; userInput.value = "1"; userInput.id = "usr"+idSuffix;
    userLabel.appendChild(userInput);
    form.appendChild(userLabel);

    // 5) Instalación (opcional)
    var instWrap = document.createElement("div");
    instWrap.className = "inst-wrap";
    instWrap.style.border = "1px dashed #29425e";
    instWrap.style.background = "#0e1724";
    instWrap.style.borderRadius = "12px";
    instWrap.style.padding = "10px";
    instWrap.style.marginTop = "8px";
    instWrap.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
      '  <input type="checkbox" id="instOn'+idSuffix+'" checked>' +
      '  <label for="instOn'+idSuffix+'"><strong>Instalación (opcional)</strong></label>' +
      '</div>' +
      '<div style="color:#9fb2cb;font-size:12px">Servicio ofrecido por <strong>ExpIRITI</strong> para instalar en tu equipo tu sistema.</div>';
    form.appendChild(instWrap);

    // Blindaje: aseguramos Licencia en primer lugar
    form.insertBefore(licenciaLabel, form.firstChild);

    container.appendChild(form);

    // ---------- Resultados ----------
    var results = document.createElement("div");
    results.className = "calc-results";
    var table = document.createElement("table");
    table.className = "calc-table";
    table.innerHTML =
      '<thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>' +
      '<tbody>' +
      '  <tr id="tr-base'+idSuffix+'"><td>Precio base</td><td id="base'+idSuffix+'">$0</td></tr>' +
      '  <tr id="tr-uadd'+idSuffix+'"><td>Usuarios adicionales</td><td id="uadd'+idSuffix+'">$0</td></tr>' +
      '  <tr id="tr-disc'+idSuffix+'"><td>Descuento (sistemas)</td><td id="disc'+idSuffix+'">0% / $0</td></tr>' +
      '  <tr id="tr-inst'+idSuffix+'"><td>Instalación (opcional)</td><td id="inst'+idSuffix+'">$0</td></tr>' +
      '  <tr id="tr-instdisc'+idSuffix+'"><td>Descuento por primer servicio (instalación 50%)</td><td id="instdisc'+idSuffix+'">$0</td></tr>' +
      '  <tr id="tr-sub'+idSuffix+'"><td>Subtotal (sistemas)</td><td id="sub'+idSuffix+'">$0</td></tr>' +
      '  <tr id="tr-iva'+idSuffix+'"><td>IVA (16%)</td><td id="iva'+idSuffix+'">$0</td></tr>' +
      '  <tr id="tr-tot'+idSuffix+'"><td><strong>Total</strong></td><td id="tot'+idSuffix+'"><strong>$0</strong></td></tr>' +
      '</tbody>';
    results.appendChild(table);
    container.appendChild(results);

    // -------- Opciones dependientes --------
    function refreshOptions() {
      var lic = licenciaSel.value;
      opSel.innerHTML = "";
      rfcSel.innerHTML = "";
      rfcLabel.style.display = "inline-block";

      // Mostrar/ocultar "Operación" solo en Tradicional (con !important)
      opLabel.style.setProperty('display', (lic === "tradicional") ? 'block' : 'none', 'important');

      if (lic === "nueva") {
        // Op queda oculto, dejamos un valor interno neutro para cálculo
        opSel.appendChild(new Option("Anual (Nueva)", "nueva_anual"));

        var anual = systemPrices.anual || {};
        if (anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
        if (anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));

      } else if (lic === "renovacion") {
        opSel.appendChild(new Option("Renovación anual", "renovacion_anual"));

        var anual2 = systemPrices.anual || {};
        if (anual2.MonoRFC) rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
        if (anual2.MultiRFC) rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));

      } else {
        // Tradicional: aquí sí llenamos opciones visibles de Operación
        opSel.appendChild(new Option("Actualización (si tienes una versión anterior, p.ej. v15→v18)", "actualizacion"));
        opSel.appendChild(new Option("Actualización Especial (si tienes la versión inmediata anterior, p.ej. v17→v18)", "especial"));
        opSel.appendChild(new Option("Incremento de usuarios", "crecimiento_usuario"));

        var trad = systemPrices.tradicional || {};
        var hasRFC = trad.actualizacion || trad.especial;
        if (hasRFC) {
          rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
          rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
        }
      }

      // === Default: MultiRFC si existe ===
      var multi = Array.from(rfcSel.options).find(function(o){ return /multirfc/i.test(o.text); });
      if (multi) rfcSel.value = multi.value;

      // Si no hay RFC aplicable, escondemos el control
      if (rfcSel.options.length === 0) rfcLabel.style.display = "none";

      calculateAndRender();
    }

    // ---- instalación automática (800 servidor + 750 por usuario extra) ----
    function instCheckbox(){ return document.getElementById("instOn"+idSuffix); }
    function calcInstallationGross(){
      var on = instCheckbox();
      if (!on || !on.checked) return 0;
      var usuarios = Math.max(1, parseInt(userInput.value || "1", 10) || 1);
      if (usuarios === 1) return 800;                // 1 servidor
      return 800 + (usuarios - 1) * 750;             // 1 servidor + (usuarios-1) terminales
    }

    // ----------------- Cálculo -----------------
    function calculateAndRender() {
      var lic = licenciaSel.value;
      var op = opSel.value || "";
      var rfcType = rfcSel.value;
      var usuarios = Math.max(1, parseInt(userInput.value || "1", 10) || 1);

      var base = 0, usuariosAddImporte = 0, usuariosExtras = 0;

      if (lic === "nueva" || lic === "renovacion") {
        var anual = systemPrices.anual || {};
        var datosLic = anual[rfcType] || null;
        if (!datosLic) return writeZeros();

        if (lic === "nueva") base = Number((datosLic.precio_base || 0));
        else base = Number((datosLic.renovacion != null ? datosLic.renovacion : (datosLic.precio_base || 0)));

        var perUser = Number(
          (datosLic.usuario_en_red != null ? datosLic.usuario_en_red :
           (datosLic.usuario_adicional != null ? datosLic.usuario_adicional : 0))
        );
        usuariosExtras = Math.max(usuarios - 1, 0);
        usuariosAddImporte = usuariosExtras * perUser;

      } else {
        var trad = systemPrices.tradicional || {};
        if (op === "crecimiento_usuario") {
          var perUser2 = Number((trad.crecimiento_usuario && trad.crecimiento_usuario.usuario_adicional) || 0);
          base = 0;
          usuariosExtras = Math.max(usuarios - 1, 0);
          usuariosAddImporte = usuariosExtras * perUser2;

        } else if (op === "actualizacion" || op === "especial") {
          var datos = trad[op] || null;
          if (!datos) return writeZeros();
          base = Number(datos.precio_base || 0);
          var perUser3 = Number(
            (datos.usuario_adicional != null ? datos.usuario_adicional :
             (trad.crecimiento_usuario && trad.crecimiento_usuario.usuario_adicional) || 0)
          );
          usuariosExtras = Math.max(usuarios - 1, 0);
          usuariosAddImporte = usuariosExtras * perUser3;

        } else {
          return writeZeros();
        }
      }

      var subtotalSistemas = base + usuariosAddImporte;

      // -15% por paquete (si hay 2 o 3 cajas); excluye “XML en Línea”
      var discountPct = 0;
      if ((safeHasTable("calc-secondary") || safeHasTable("calc-tertiary")) && sistemaName.indexOf("XML en Línea") === -1) {
        discountPct = 0.15;
      }
      var discountAmt = subtotalSistemas * discountPct;
      var afterDiscount = subtotalSistemas - discountAmt;

      // instalación con 50% descuento (se suma IVA al final)
      var instGross = calcInstallationGross();
      var instDiscount = instGross * 0.5;
      var instNet = instGross - instDiscount;

      // IVA sobre (sistemas con descuento + instalación neta)
      var baseImponible = afterDiscount + instNet;
      var iva = baseImponible * 0.16;
      var total = baseImponible + iva;

      // Render números
      document.getElementById("base"+idSuffix).textContent = fmt(base);
      document.getElementById("uadd"+idSuffix).textContent = fmt(usuariosAddImporte) + (usuariosExtras>0?(" ("+usuariosExtras+" extras)"):"");
      document.getElementById("disc"+idSuffix).textContent = pct(discountPct) + " / " + fmt(discountAmt);
      document.getElementById("inst"+idSuffix).textContent = fmt(instGross);
      document.getElementById("instdisc"+idSuffix).textContent = (instGross>0?("− " + fmt(instDiscount)):fmt(0));
      document.getElementById("sub"+idSuffix).textContent = fmt(afterDiscount);
      document.getElementById("iva"+idSuffix).textContent = fmt(iva);
      document.getElementById("tot"+idSuffix).textContent = fmt(total);

      // Mostrar/ocultar filas condicionales
      document.getElementById("tr-uadd"+idSuffix).style.display = (usuariosExtras > 0) ? "" : "none";
      document.getElementById("tr-disc"+idSuffix).style.display = (discountPct > 0) ? "" : "none";
      var instOn = instCheckbox();
      var showInst = !!(instOn && instOn.checked);
      document.getElementById("tr-inst"+idSuffix).style.display = showInst ? "" : "none";
      document.getElementById("tr-instdisc"+idSuffix).style.display = showInst ? "" : "none";

      updateCombinedSummary(combinedSelector);
    }

    function writeZeros() {
      document.getElementById("base"+idSuffix).textContent = fmt(0);
      document.getElementById("uadd"+idSuffix).textContent = fmt(0);
      document.getElementById("disc"+idSuffix).textContent = "0% / " + fmt(0);
      document.getElementById("inst"+idSuffix).textContent = fmt(0);
      document.getElementById("instdisc"+idSuffix).textContent = fmt(0);
      document.getElementById("sub"+idSuffix).textContent = fmt(0);
      document.getElementById("iva"+idSuffix).textContent = fmt(0);
      document.getElementById("tot"+idSuffix).textContent = fmt(0);

      document.getElementById("tr-uadd"+idSuffix).style.display = "none";
      document.getElementById("tr-disc"+idSuffix).style.display = "none";
      document.getElementById("tr-inst"+idSuffix).style.display = "none";
      document.getElementById("tr-instdisc"+idSuffix).style.display = "none";

      updateCombinedSummary(combinedSelector);
    }

    // ===== Eventos =====
    licenciaSel.addEventListener("change", refreshOptions);
    opSel.addEventListener("change", function(){
      var lic = licenciaSel.value;
      var op = opSel.value;

      // Si Tradicional + Crecimiento de usuarios, oculta RFC
      if (lic === "tradicional" && op === "crecimiento_usuario") {
        rfcLabel.style.display = "none";
      } else {
        if (rfcSel.options.length === 0) {
          rfcSel.innerHTML = "";
          if (lic === "nueva" || lic === "renovacion") {
            var anual = systemPrices.anual || {};
            if (anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
            if (anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
          } else {
            rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
            rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
          }
          // MultiRFC por defecto si existe
          var m = Array.from(rfcSel.options).find(function(o){return /multirfc/i.test(o.text);});
          if (m) rfcSel.value = m.value;
        }
        rfcLabel.style.display = "inline-block";
      }
      calculateAndRender();
    });
    rfcSel.addEventListener("change", calculateAndRender);
    userInput.addEventListener("change", calculateAndRender);
    var chk = document.getElementById("instOn"+idSuffix);
    if (chk) chk.addEventListener("change", calculateAndRender);

    // Recalcular cuando aparezca otra caja (sin bucles)
    window.addEventListener("calc-recompute", calculateAndRender);

    // Inicial
    refreshOptions();
  }

  // =================== Resumen combinado =====================
  function updateCombinedSummary(combinedSelector) {
    if (!combinedSelector) combinedSelector = "#combined-wrap";
    var combined = document.querySelector(combinedSelector);
    if (!combined) return;

    function getNum(id){
      var el = document.getElementById(id);
      if (!el) return 0;
      var n = parseFloat((el.textContent || "").replace(/[^\d.-]/g, ""));
      return isNaN(n) ? 0 : n;
    }

    var e1 = !!document.getElementById("tot1");
    var e2 = !!document.getElementById("tot2");
    var e3 = !!document.getElementById("tot3");

    combined.innerHTML = "";

    if (!e2 && !e3) {
      combined.innerHTML = '<div class="combined-summary"><h4>Resumen combinado</h4><p style="margin:0"><strong>Total:</strong> ' + fmt(getNum("tot1")) + '</p></div>';
      combined.hidden = false;
      return;
    }

    var n1 = (document.getElementById("calc-primary") && document.getElementById("calc-primary").dataset.systemName) || "Sistema 1";
    var n2 = (document.getElementById("calc-secondary") && document.getElementById("calc-secondary").dataset.systemName) || "Sistema 2";
    var n3 = (document.getElementById("calc-tertiary") && document.getElementById("calc-tertiary").dataset.systemName) || "Sistema 3";

    var filas = [];
    var totales = [];
    var ivaTotal = 0;

    if (e1) { filas.push({label:'Subtotal '+n1+' (después descuento)', val:getNum("sub1")}); totales.push(getNum("tot1")); ivaTotal += getNum("iva1"); }
    if (e2) { filas.push({label:'Subtotal '+n2+' (después descuento)', val:getNum("sub2")}); totales.push(getNum("tot2")); ivaTotal += getNum("iva2"); }
    if (e3) { filas.push({label:'Subtotal '+n3+' (después descuento)', val:getNum("sub3")}); totales.push(getNum("tot3")); ivaTotal += getNum("iva3"); }

    var totalCombinado = totales.reduce(function(a,b){ return a+b; }, 0);

    var box = document.createElement("div");
    box.className = "combined-summary";
    box.innerHTML =
      '<h4>Resumen combinado</h4>' +
      (e1 ? '<p>'+n1+': '+fmt(getNum("tot1"))+'</p>' : '') +
      (e2 ? '<p>'+n2+': '+fmt(getNum("tot2"))+'</p>' : '') +
      (e3 ? '<p>'+n3+': '+fmt(getNum("tot3"))+'</p>' : '') +
      '<table class="combined-table">' +
      '  <thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>' +
      '  <tbody>' +
           filas.map(function(f){ return '<tr><td>'+f.label+'</td><td>'+fmt(f.val)+'</td></tr>'; }).join("") +
      '    <tr><td>IVA total (sistemas + instalación)</td><td>'+fmt(ivaTotal)+'</td></tr>' +
      '    <tr><td><strong>Total combinado</strong></td><td><strong>'+fmt(totalCombinado)+'</strong></td></tr>' +
      '  </tbody>' +
      '</table>';
    combined.appendChild(box);
    combined.hidden = false;
  }

  // ====================== API pública =======================
  function initCalculadora(opts) {
    opts = opts || {};
    var systemName = opts.systemName;
    var primarySelector = opts.primarySelector || "#calc-primary";
    var combinedSelector = opts.combinedSelector || "#combined-wrap";
    var el = document.querySelector(primarySelector);
    if (!el) { console.warn("No existe contenedor primario:", primarySelector); return; }
    createCalculator(el, systemName, "1", combinedSelector);
    setTimeout(function(){ recomputeAll(); }, 0);
  }
  function setSecondarySystem(name, opts) {
    opts = opts || {};
    var secondarySelector = opts.secondarySelector || "#calc-secondary";
    var combinedSelector = opts.combinedSelector || "#combined-wrap";
    var el = document.querySelector(secondarySelector);
    if (!el) { console.warn("No existe contenedor secundario:", secondarySelector); return; }
    createCalculator(el, name, "2", combinedSelector);
    recomputeAll();
  }
  function setTertiarySystem(name, opts) {
    opts = opts || {};
    var tertiarySelector = opts.tertiarySelector || "#calc-tertiary";
    var combinedSelector = opts.combinedSelector || "#combined-wrap";
    var el = document.querySelector(tertiarySelector);
    if (!el) { console.warn("No existe contenedor terciario:", tertiarySelector); return; }
    createCalculator(el, name, "3", combinedSelector);
    recomputeAll();
  }
  window.CalculadoraContpaqi = {
    init: initCalculadora,
    setSecondarySystem: setSecondarySystem,
    setTertiarySystem: setTertiarySystem,
    updateCombinedSummary: updateCombinedSummary
  };

  // Auto-init si existe #app con data-system y #calc-primary
  function autoInit() {
    var app = document.getElementById("app");
    var sys = app && app.dataset ? app.dataset.system : null;
    if (sys && document.querySelector("#calc-primary")) {
      window.CalculadoraContpaqi.init({ systemName: sys });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoInit);
  else autoInit();
})();

// Auto-init si existe #app con data-system y #calc-primary
function autoInit() {
  // Si el sitio indicó Nube, NO inicializar v13
  if (window.__EXPIRITI_FORCE_NUBE__ === true || document.body.getAttribute('data-calc') === 'nube') {
    console.log('v13: cancelado autoInit porque hay calculadora NUBE');
    return;
  }
  var app = document.getElementById("app");
  var sys = app && app.dataset ? app.dataset.system : null;
  if (sys && document.querySelector("#calc-primary")) {
    window.CalculadoraContpaqi.init({ systemName: sys });
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoInit);
else autoInit();


// === GUARD GLOBAL PARA NUBE ===
if (document?.body?.getAttribute("data-calc") === "nube" || window.__EXPIRITI_FORCE_NUBE__ === true) {
  console.log("calculadora.js v13.2a: saltado COMPLETO (modo Nube activo)");
  window.CalculadoraContpaqi = window.CalculadoraContpaqi || {
    init() {},
    setSecondarySystem() {},
    setTertiarySystem() {},
    updateCombinedSummary() {}
  };
} else {

  /* calculadora.js v13.2a — CENTAVOS (MXN) + FIX Subtotal/IVA (incluye instalación)
     + Resumen (MXN + letra) + getNum robusto + CLASES has-calc-2/has-calc-3
     - SIN redondeo a enteros: todo con 2 decimales
     - round2(): redondeo financiero a centavos en cada paso (evita flotantes)
     - mxnLetra exportada a window
     - getNum soporta signo “−” (U+2212) y comas/centavos */
  (function () {
    "use strict";
    console.log("calculadora.js v13.2a cargado — centavos + subtotal incluye instalación + resumen MXN/letra + has-calc-*");

    // ========================= Helpers =========================
    var money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    function fmt(v) { v = Number(v || 0); return money.format(isFinite(v) ? v : 0); } /* MXN con centavos */
    function pct(v) { return ((v || 0) * 100).toFixed(0) + "%"; }                  /* % */
    function round2(x) { return Math.round((Number(x) || 0) * 100) / 100; }       /* redondeo a centavos */
    function safeHasTable(id) { var el = document.getElementById(id); return !!(el && el.querySelector && el.querySelector("table")); }
    function recomputeAll() { window.dispatchEvent(new Event("calc-recompute")); }

function $id(id){ return document.getElementById(id); }
function setText(id, val){
  var el = $id(id);
  if(!el) return false;
  el.textContent = val;
  return true;
}
function setHTML(id, val){
  var el = $id(id);
  if(!el) return false;
  el.innerHTML = val;
  return true;
}
function setDisplay(id, val){
  var el = $id(id);
  if(!el) return false;
  el.style.display = val;
  return true;
}

    
function setCalcCountClass() {
  var hasSecondary = !!document.querySelector("#calc-secondary table");
  var hasTertiary  = !!document.querySelector("#calc-tertiary table");

  var is3 = hasSecondary && hasTertiary;
  var is2 = (hasSecondary || hasTertiary) && !is3;

  [document.documentElement, document.body].forEach(function(el){
    if(!el) return;

    el.classList.toggle("has-calc-2", is2);
    el.classList.toggle("has-calc-3", is3);
    if (is3) el.classList.remove("has-calc-2");
  });

  // Marca vacíos (para que CSS los oculte)
  markEmpty("#calc-secondary");
  markEmpty("#calc-tertiary");
}

function markEmpty(sel){
  var el = document.querySelector(sel);
  if(!el) return;
  el.classList.toggle("calc-empty", !el.querySelector("table"));
}

    function $id(id){ return document.getElementById(id); }
function setText(id, val){
  var el = $id(id);
  if(!el) return false;
  el.textContent = val;
  return true;
}
function setHTML(id, val){
  var el = $id(id);
  if(!el) return false;
  el.innerHTML = val;
  return true;
}
function setDisplay(id, val){
  var el = $id(id);
  if(!el) return false;
  el.style.display = val;
  return true;
}

    /* =========================================================
       mxnLetra — Convierte número a letra (MXN)
       Ej: 6948.40 -> SEIS MIL NOVECIENTOS CUARENTA Y OCHO PESOS 40/100 M.N.
    ========================================================= */
    function mxnLetra(n) {
      n = Number(n || 0);
      var enteros = Math.floor(n);
      var centavos = Math.round((n - enteros) * 100).toString().padStart(2, "0");

      function u(n) { return ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"][n]; }
      function d(n) { return ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"][n]; }
      function c(n) { return ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"][n]; }

      function num(n) {
        if (n === 0) return "CERO";
        if (n < 10) return u(n);
        if (n < 20) return ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"][n - 10];
        if (n < 100) {
          if (n < 30) return ["VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"][n - 20];
          var dec = Math.floor(n / 10), uni = n % 10;
          return d(dec) + (uni ? " Y " + u(uni) : "");
        }
        if (n === 100) return "CIEN";
        if (n < 1000) return c(Math.floor(n / 100)) + (n % 100 ? " " + num(n % 100) : "");
        if (n < 1000000) {
          var miles = Math.floor(n / 1000), resto = n % 1000;
          var txt = (miles === 1 ? "MIL" : (num(miles) + " MIL"));
          return txt + (resto ? (" " + num(resto)) : "");
        }
        // millones
        var mill = Math.floor(n / 1000000), restoM = n % 1000000;
        var txtM = (mill === 1 ? "UN MILLÓN" : (num(mill) + " MILLONES"));
        return txtM + (restoM ? (" " + num(restoM)) : "");
      }

var centInt = parseInt(centavos, 10) || 0;
if (centInt === 0) return num(enteros) + " PESOS 00/100 M.N.";
return num(enteros) + " PESOS CON " + num(centInt) + " CENTAVOS " + centavos + "/100 M.N.";
    }
    window.mxnLetra = mxnLetra;

    // ===== Parche CSS mínimo para asegurar el form (no rompe tu main.css)
    (function () {
      var id = "calc-form-visibility-patch"; if (document.getElementById(id)) return;
      var st = document.createElement("style"); st.id = id;
      st.textContent =
        ".calc-container form{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;}" +
        "@media(max-width:768px){.calc-container form{grid-template-columns:1fr!important;}}" +
        ".calc-container .op-label{display:none!important;}";
      document.head.appendChild(st);
    })();

    // ===================== Render calculadora ===================
    function createCalculator(container, sistemaName, idSuffix, combinedSelector) {
      container.innerHTML = "";
      container.dataset.systemName = sistemaName;

      var allPrices = window.preciosContpaqi || {}, systemPrices = allPrices[sistemaName];
      if (!systemPrices) { container.innerHTML = '<p style="margin:0">Error: faltan precios para <strong>' + sistemaName + "</strong>.</p>"; return; }

      // Título
      var title = document.createElement("h4");
      title.textContent = sistemaName + " — Calculadora";
      container.appendChild(title);

      // Formulario
      var form = document.createElement("form"); form.className = "calc-form";

      // 1) Licencia
      var licenciaLabel = document.createElement("label");
      licenciaLabel.classList.add("field", "lic"); licenciaLabel.textContent = "Licencia:";
      var licenciaSel = document.createElement("select"); licenciaSel.id = "lic" + idSuffix;
      licenciaSel.innerHTML = '<option value="nueva">Nueva</option><option value="renovacion">Renovación</option><option value="tradicional">Tradicional</option>';
      licenciaLabel.appendChild(licenciaSel); form.appendChild(licenciaLabel);

      // 2) Operación (solo Tradicional)
      var opLabel = document.createElement("label"); opLabel.className = "op-label"; opLabel.textContent = "Operación:";
      var opSel = document.createElement("select"); opSel.id = "op" + idSuffix;
      opLabel.appendChild(opSel); form.appendChild(opLabel);

      // 3) RFC
      var rfcLabel = document.createElement("label");
      rfcLabel.classList.add("field", "rfc"); rfcLabel.textContent = "Tipo (RFC):";
      var rfcSel = document.createElement("select"); rfcSel.id = "rfc" + idSuffix;
      rfcLabel.appendChild(rfcSel); form.appendChild(rfcLabel);

      // 4) Usuarios
      var userLabel = document.createElement("label");
      userLabel.classList.add("field", "usr"); userLabel.textContent = "Usuarios:";
      var userInput = document.createElement("input");
      userInput.type = "number"; userInput.id = "usr" + idSuffix; userInput.min = "1"; userInput.value = "1";
      userLabel.appendChild(userInput); form.appendChild(userLabel);

      // 5) Instalación (opcional)
      var instWrap = document.createElement("div"); instWrap.className = "inst-wrap";
instWrap.innerHTML =
  '<div class="instalacion-box"><label>' +
  '<input type="checkbox" id="instOn' + idSuffix + '" checked>' +
  '<span><strong id="instLblSTRONG' + idSuffix + '">Instalación (opcional)</strong> — Servicio ofrecido por <strong>Expiriti</strong> para instalar en tu equipo tu sistema.</span>' +
  "</label></div>";

      form.appendChild(instWrap);
      container.appendChild(form);

      // Resultados
      var results = document.createElement("div"); results.className = "calc-results";
      var table = document.createElement("table"); table.className = "calc-table";
table.innerHTML =
  '<thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>' +
  "<tbody>" +
  '  <tr id="tr-base' + idSuffix + '"><td id="lbl-base' + idSuffix + '">Precio base</td><td id="base' + idSuffix + '">$0.00</td></tr>' +
  '  <tr id="tr-uadd' + idSuffix + '"><td id="lbl-uadd' + idSuffix + '">Usuarios adicionales</td><td id="uadd' + idSuffix + '">$0.00</td></tr>' +
  '  <tr id="tr-disc' + idSuffix + '"><td id="lbl-disc' + idSuffix + '">Descuento (sistema)</td><td id="disc' + idSuffix + '">0% / $0.00</td></tr>' +
  '  <tr id="tr-inst' + idSuffix + '"><td id="lbl-inst' + idSuffix + '">Instalación</td><td id="inst' + idSuffix + '">$0.00</td></tr>' +
  '  <tr id="tr-instdisc' + idSuffix + '"><td id="lbl-instdisc' + idSuffix + '">Descuento por primer servicio (instalación 50%)</td><td id="instdisc' + idSuffix + '">$0.00</td></tr>' +
  '  <tr id="tr-sub' + idSuffix + '"><td id="lbl-sub' + idSuffix + '">Subtotal</td><td id="sub' + idSuffix + '">$0.00</td></tr>' +
  '  <tr id="tr-iva' + idSuffix + '"><td id="lbl-iva' + idSuffix + '">IVA (16%)</td><td id="iva' + idSuffix + '">$0.00</td></tr>' +
  '  <tr id="tr-tot' + idSuffix + '"><td id="lbl-tot' + idSuffix + '"><strong>Total</strong></td><td id="tot' + idSuffix + '"><strong>$0.00</strong></td></tr>' +
  "</tbody>";

      results.appendChild(table); container.appendChild(results);

      // -------- Opciones dependientes --------
      function refreshOptions() {
        var lic = licenciaSel.value;
        opSel.innerHTML = ""; rfcSel.innerHTML = ""; rfcLabel.style.display = "inline-block";
        opLabel.style.setProperty("display", (lic === "tradicional") ? "block" : "none", "important");

        if (lic === "nueva") {
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
          opSel.appendChild(new Option("Actualización (versiones anteriores)", "actualizacion"));
          opSel.appendChild(new Option("Actualización especial (inmediata anterior)", "especial"));
          opSel.appendChild(new Option("Incremento de usuarios", "crecimiento_usuario"));
          var trad = systemPrices.tradicional || {}, hasRFC = trad.actualizacion || trad.especial;
          if (hasRFC) { rfcSel.appendChild(new Option("MonoRFC", "MonoRFC")); rfcSel.appendChild(new Option("MultiRFC", "MultiRFC")); }
        }

        // Default MultiRFC si existe
        var multi = Array.from(rfcSel.options).find(function (o) { return /multirfc/i.test(o.text); });
        if (multi) rfcSel.value = multi.value;
        if (rfcSel.options.length === 0) rfcLabel.style.display = "none";

        calculateAndRender();
      }

      // ---- instalación automática
      function instCheckbox() { return document.getElementById("instOn" + idSuffix); }
      function calcInstallationGross() {
        var on = instCheckbox(); if (!on || !on.checked) return 0;
        var usuarios = Math.max(1, parseInt(userInput.value || "1", 10) || 1);
        return usuarios === 1 ? 800 : 800 + (usuarios - 1) * 750;
      }

      // ----------------- Cálculo -----------------
      function calculateAndRender() {
        var lic = licenciaSel.value, op = opSel.value || "", rfcType = rfcSel.value;
        var usuarios = Math.max(1, parseInt(userInput.value || "1", 10) || 1);
        var base = 0, usuariosAddImporte = 0, usuariosExtras = 0;

        if (lic === "nueva" || lic === "renovacion") {
          var anual = systemPrices.anual || {}, datosLic = anual[rfcType] || null;
          if (!datosLic) return writeZeros();

          base = Number((lic === "nueva") ? (datosLic.precio_base || 0) : (datosLic.renovacion != null ? datosLic.renovacion : (datosLic.precio_base || 0)));

          var perUser = Number((datosLic.usuario_en_red != null) ? datosLic.usuario_en_red : ((datosLic.usuario_adicional != null) ? datosLic.usuario_adicional : 0));
          usuariosExtras = Math.max(usuarios - 1, 0);
          usuariosAddImporte = usuariosExtras * perUser;

        } else {
          var trad = systemPrices.tradicional || {};
          if (op === "crecimiento_usuario") {
            var perUser2 = Number((trad.crecimiento_usuario && trad.crecimiento_usuario.usuario_adicional) || 0);
            base = 0; usuariosExtras = Math.max(usuarios - 1, 0); usuariosAddImporte = usuariosExtras * perUser2;

          } else if (op === "actualizacion" || op === "especial") {
            var datos = trad[op] || null; if (!datos) return writeZeros();
            base = Number(datos.precio_base || 0);
            var perUser3 = Number((datos.usuario_adicional != null) ? datos.usuario_adicional : ((trad.crecimiento_usuario && trad.crecimiento_usuario.usuario_adicional) || 0));
            usuariosExtras = Math.max(usuarios - 1, 0);
            usuariosAddImporte = usuariosExtras * perUser3;

          } else return writeZeros();
        }

        var subtotalSistemas = base + usuariosAddImporte;

        // -15% por paquete (2 o 3); excluye XML
        var discountPct = 0;
        if ((safeHasTable("calc-secondary") || safeHasTable("calc-tertiary")) && sistemaName.indexOf("XML en Línea") === -1) discountPct = 0.15;

        var discountAmt = round2(subtotalSistemas * discountPct);
        var afterDiscount = round2(subtotalSistemas - discountAmt);

        // instalación 50% desc (neto)
        var instGross = calcInstallationGross();
        var instDiscount = round2(instGross * 0.5);
        var instNet = round2(instGross - instDiscount);

        // ===== Labels dinámicos (sistema + instalación/es) =====
var instOn = instCheckbox();
var instCount = (instOn && instOn.checked) ? usuarios : 0; // si son 3 usuarios => 3 instalaciones

var instWord = (instCount === 1 ? "Instalación" : "Instalaciones");
var instLabel = instCount > 0 ? (instWord + " (" + instCount + ")") : "Instalación";

var inst50Label = "Descuento por primer servicio (" + (instCount === 1 ? "instalación" : "instalaciones") + " 50%)";

var subLabel = "Subtotal (sistema + " + (instCount === 1 ? "instalación" : "instalaciones") + ")";

// aplica labels
var elLblInst = document.getElementById("lbl-inst" + idSuffix);
if (elLblInst) elLblInst.textContent = instLabel;

var elLblInstDisc = document.getElementById("lbl-instdisc" + idSuffix);
if (elLblInstDisc) elLblInstDisc.textContent = inst50Label;

var elLblSub = document.getElementById("lbl-sub" + idSuffix);
if (elLblSub) elLblSub.textContent = subLabel;

// descuento: siempre singular como pediste
var elLblDisc = document.getElementById("lbl-disc" + idSuffix);
if (elLblDisc) elLblDisc.textContent = "Descuento (sistema)";
        // ===== También sincroniza el texto del checkbox (form) =====
var strong = document.getElementById("instLblSTRONG" + idSuffix);
if (strong) {
  if (!instOn || !instOn.checked) {
    strong.textContent = "Instalación (opcional)";
  } else {
    strong.textContent = (instCount === 1 ? "Instalación" : "Instalaciones") + " (" + instCount + ")";
  }
}



        // IVA: base imponible = sistemas(desc) + instalación(neta)
        var baseImponible = round2(afterDiscount + instNet);
        var iva = round2(baseImponible * 0.16);
        var total = round2(baseImponible + iva);

// Render (blindado)
setText("base"+idSuffix, fmt(base));
setText(
  "uadd"+idSuffix,
  fmt(usuariosAddImporte) +
  (usuariosExtras > 0 ? (" (" + usuariosExtras + " " + (usuariosExtras === 1 ? "extra" : "extras") + ")") : "")
);
setText("disc"+idSuffix, pct(discountPct) + " / " + fmt(discountAmt));
setText("inst"+idSuffix, fmt(instGross));
setText("instdisc"+idSuffix, (instGross > 0 ? ("− " + fmt(instDiscount)) : fmt(0)));
setText("sub"+idSuffix, fmt(baseImponible));
setText("iva"+idSuffix, fmt(iva));
setHTML("tot"+idSuffix, "<strong>"+fmt(total)+"</strong>");

// Mostrar/ocultar filas (blindado)
setDisplay("tr-uadd"+idSuffix, (usuariosExtras > 0) ? "" : "none");
setDisplay("tr-disc"+idSuffix, (discountPct > 0) ? "" : "none");
setDisplay("tr-inst"+idSuffix, showInst ? "" : "none");
setDisplay("tr-instdisc"+idSuffix, showInst ? "" : "none");

      function writeZeros() {
setText("base"+idSuffix, fmt(0));
setText("uadd"+idSuffix, fmt(0));
setText("disc"+idSuffix, "0% / " + fmt(0));
setText("inst"+idSuffix, fmt(0));
setText("instdisc"+idSuffix, fmt(0));
setText("sub"+idSuffix, fmt(0));
setText("iva"+idSuffix, fmt(0));
setHTML("tot"+idSuffix, "<strong>"+fmt(0)+"</strong>");

setDisplay("tr-uadd"+idSuffix, "none");
setDisplay("tr-disc"+idSuffix, "none");
setDisplay("tr-inst"+idSuffix, "none");
setDisplay("tr-instdisc"+idSuffix, "none");

      }

      // Eventos
      licenciaSel.addEventListener("change", refreshOptions);
      opSel.addEventListener("change", function () {
        var lic = licenciaSel.value, op = opSel.value;

        // Tradicional + crecimiento: oculta RFC
        if (lic === "tradicional" && op === "crecimiento_usuario") { rfcLabel.style.display = "none"; }
        else {
          if (rfcSel.options.length === 0) {
            rfcSel.innerHTML = "";
            if (lic === "nueva" || lic === "renovacion") {
              var anual = systemPrices.anual || {};
              if (anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
              if (anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
            } else {
              rfcSel.appendChild(new Option("MonoRFC", "MonoRFC"));
              rfcSel.appendChild(new Option("MultiRFC", "MultiRFC"));
            }
            var m = Array.from(rfcSel.options).find(function (o) { return /multirfc/i.test(o.text); }); if (m) rfcSel.value = m.value;
          }
          rfcLabel.style.display = "inline-block";
        }
        calculateAndRender();
      });
      rfcSel.addEventListener("change", calculateAndRender);
      userInput.addEventListener("change", calculateAndRender);
      var chk = document.getElementById("instOn" + idSuffix); if (chk) chk.addEventListener("change", calculateAndRender);
      window.addEventListener("calc-recompute", calculateAndRender);

      refreshOptions(); // init
    }

    // =================== Resumen combinado (MXN + letra) =====================
    function updateCombinedSummary(combinedSelector) {
      if (!combinedSelector) combinedSelector = "#combined-wrap";
      var combined = document.querySelector(combinedSelector); if (!combined) return;

      // parse robusto: soporta comas/centavos/signo “−”
      function getNum(id) {
        var el = document.getElementById(id); if (!el) return 0;
        var s = (el.textContent || "").trim();
        s = s.replace(/\u2212/g, "-");                 /* “−” -> "-" */
        s = s.replace(/\s/g, "").replace(/[^\d.,-]/g, "").replace(/,/g, "");
        var n = parseFloat(s); return isNaN(n) ? 0 : n;
      }

      var e1 = !!document.getElementById("tot1"),
        e2 = !!document.getElementById("tot2"),
        e3 = !!document.getElementById("tot3");

      combined.innerHTML = "";

      // 1 sistema
      if (!e2 && !e3) {
        var t = getNum("tot1");
        combined.innerHTML =
          '<div class="combined-summary combined-tight">' +
          '<div class="cs-head">' +
          '<div class="cs-title">Total:</div>' +
          '<div class="total-amount"><strong>' + fmt(t) + '</strong></div>' +
          '</div>' +
          '<div class="amount-letter">' + (window.mxnLetra ? mxnLetra(t) : "") + '</div>' +
          '</div>';

        setCalcCountClass();          // <-- CLASES
        combined.hidden = false; 
        return;
      }

      var n1 = (document.getElementById("calc-primary") && document.getElementById("calc-primary").dataset.systemName) || "Sistema 1";
      var n2 = (document.getElementById("calc-secondary") && document.getElementById("calc-secondary").dataset.systemName) || "Sistema 2";
      var n3 = (document.getElementById("calc-tertiary") && document.getElementById("calc-tertiary").dataset.systemName) || "Sistema 3";
function instCountFor(idSuffix){
  var chk = document.getElementById("instOn" + idSuffix);
  if (!chk || !chk.checked) return 0;
  var u = document.getElementById("usr" + idSuffix);
  var n = Math.max(1, parseInt((u && u.value) || "1", 10) || 1);
  return n;
}
function instLabelFor(idSuffix){
  var n = instCountFor(idSuffix);
  return (n === 1 ? "instalación" : "instalaciones");
}


      
      var filas = [], totales = [], ivaTotal = 0;
if (e1) { filas.push({ label: "Subtotal " + n1 + " e " + instLabelFor("1"), val: getNum("sub1") }); totales.push(getNum("tot1")); ivaTotal += getNum("iva1"); }
if (e2) { filas.push({ label: "Subtotal " + n2 + " e " + instLabelFor("2"), val: getNum("sub2") }); totales.push(getNum("tot2")); ivaTotal += getNum("iva2"); }
if (e3) { filas.push({ label: "Subtotal " + n3 + " e " + instLabelFor("3"), val: getNum("sub3") }); totales.push(getNum("tot3")); ivaTotal += getNum("iva3"); }

      var totalCombinado = round2(totales.reduce(function (a, b) { return a + b; }, 0));
      ivaTotal = round2(ivaTotal);

      var box = document.createElement("div");
      box.className = "combined-summary";
      box.innerHTML =
        '<div class="cs-head">' +
        '<div class="cs-title">Total:</div>' +
        '<div class="total-amount"><strong>' + fmt(totalCombinado) + '</strong></div>' +
        '</div>' +
        '<div class="amount-letter">' + (window.mxnLetra ? mxnLetra(totalCombinado) : "") + '</div>' +
        '<table class="combined-table">' +
        '  <thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>' +
        '  <tbody>' +
        filas.map(function (f) { return "<tr><td>" + f.label + "</td><td>" + fmt(f.val) + "</td></tr>"; }).join("") +
'    <tr><td>IVA total</td><td>' + fmt(ivaTotal) + '</td></tr>' +
'    <tr><td><strong>Total</strong></td><td><strong>' + fmt(totalCombinado) + '</strong></td></tr>' +

        '  </tbody>' +
        '</table>';

      combined.appendChild(box);

      setCalcCountClass();           // <-- CLASES
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
      setCalcCountClass();           // <-- CLASES
      setTimeout(function () { recomputeAll(); }, 0);
    }

    function setSecondarySystem(name, opts) {
      opts = opts || {};
      var secondarySelector = opts.secondarySelector || "#calc-secondary";
      var combinedSelector = opts.combinedSelector || "#combined-wrap";
      var el = document.querySelector(secondarySelector);
      if (!el) { console.warn("No existe contenedor secundario:", secondarySelector); return; }
      createCalculator(el, name, "2", combinedSelector);
      setCalcCountClass();           // <-- CLASES
      recomputeAll();
    }

    function setTertiarySystem(name, opts) {
      opts = opts || {};
      var tertiarySelector = opts.tertiarySelector || "#calc-tertiary";
      var combinedSelector = opts.combinedSelector || "#combined-wrap";
      var el = document.querySelector(tertiarySelector);
      if (!el) { console.warn("No existe contenedor terciario:", tertiarySelector); return; }
      createCalculator(el, name, "3", combinedSelector);
      setCalcCountClass();           // <-- CLASES
      recomputeAll();
    }

    window.CalculadoraContpaqi = {
      init: initCalculadora,
      setSecondarySystem: setSecondarySystem,
      setTertiarySystem: setTertiarySystem,
      updateCombinedSummary: updateCombinedSummary
    };

    // Auto-init
    function autoInit() {
      if (window.__EXPIRITI_FORCE_NUBE__ === true || document.body.getAttribute("data-calc") === "nube") {
        console.log("v13.2a: cancelado autoInit porque hay calculadora NUBE");
        return;
      }
      var app = document.getElementById("app");
      var sys = app && app.dataset ? app.dataset.system : null;
      if (sys && document.querySelector("#calc-primary")) window.CalculadoraContpaqi.init({ systemName: sys });

      // Asegura clases aun si no inicia por alguna razón
      setCalcCountClass();           // <-- CLASES
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoInit);
    else autoInit();

  })(); // IIFE principal

} // GUARD GLOBAL

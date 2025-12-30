// === GUARD GLOBAL PARA NUBE ===
if(document?.body?.getAttribute("data-calc")==="nube"||window.__EXPIRITI_FORCE_NUBE__===true){
  console.log("calculadora.js v13.2: saltado COMPLETO (modo Nube activo)");
  window.CalculadoraContpaqi=window.CalculadoraContpaqi||{init(){},setSecondarySystem(){},setTertiarySystem(){},updateCombinedSummary(){}};
}else{

/* calculadora.js v13.2 — CENTAVOS (MXN) + FIX Resumen (MXN + letra) + getNum robusto */
(function(){
"use strict";
console.log("calculadora.js v13.2 cargado — centavos + subtotal incluye instalación + resumen MXN/letra");

  // ========================= Helpers (PATCH: SIN redondeo) =========================
  var money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2,maximumFractionDigits:2});
  function fmt(v){v=Number(v||0);return money.format(isFinite(v)?v:0)}          /* MXN con centavos */
  function pct(v){return((v||0)*100).toFixed(0)+"%"}                           /* % */
  function safeHasTable(id){var el=document.getElementById(id);return!!(el&&el.querySelector&&el.querySelector("table"))}
  function recomputeAll(){window.dispatchEvent(new Event("calc-recompute"))}

  // ===== Parche CSS mínimo para asegurar el form (no rompe tu main.css)
  (function(){
    var id="calc-form-visibility-patch"; if(document.getElementById(id))return;
    var st=document.createElement("style"); st.id=id;
    st.textContent=
      ".calc-container form{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;}"+
      "@media(max-width:768px){.calc-container form{grid-template-columns:1fr!important;}}"+
      ".calc-container .op-label{display:none!important;}";
    document.head.appendChild(st);
  })();

  // ===================== Render calculadora ===================
  function createCalculator(container,sistemaName,idSuffix,combinedSelector){
    container.innerHTML="";
    container.dataset.systemName=sistemaName;

    var allPrices=window.preciosContpaqi||{}, systemPrices=allPrices[sistemaName];
    if(!systemPrices){container.innerHTML='<p style="margin:0">Error: faltan precios para <strong>'+sistemaName+"</strong>.</p>";return}

    // ---------- Título ----------
    var title=document.createElement("h4");
    title.textContent=sistemaName+" — Calculadora";
    container.appendChild(title);

    // ---------- Formulario ----------
    var form=document.createElement("form"); form.className="calc-form";

    // 1) Licencia
    var licenciaLabel=document.createElement("label");
    licenciaLabel.classList.add("field","lic"); licenciaLabel.textContent="Licencia:";
    var licenciaSel=document.createElement("select"); licenciaSel.id="lic"+idSuffix;
    licenciaSel.innerHTML='<option value="nueva">Nueva</option><option value="renovacion">Renovación</option><option value="tradicional">Tradicional</option>';
    licenciaLabel.appendChild(licenciaSel); form.appendChild(licenciaLabel);

    // 2) Operación (solo Tradicional)
    var opLabel=document.createElement("label"); opLabel.className="op-label"; opLabel.textContent="Operación:";
    var opSel=document.createElement("select"); opSel.id="op"+idSuffix;
    opLabel.appendChild(opSel); form.appendChild(opLabel);

    // 3) RFC
    var rfcLabel=document.createElement("label");
    rfcLabel.classList.add("field","rfc"); rfcLabel.textContent="Tipo (RFC):";
    var rfcSel=document.createElement("select"); rfcSel.id="rfc"+idSuffix;
    rfcLabel.appendChild(rfcSel); form.appendChild(rfcLabel);

    // 4) Usuarios
    var userLabel=document.createElement("label");
    userLabel.classList.add("field","usr"); userLabel.textContent="Usuarios:";
    var userInput=document.createElement("input");
    userInput.type="number"; userInput.id="usr"+idSuffix; userInput.min="1"; userInput.value="1";
    userLabel.appendChild(userInput); form.appendChild(userLabel);

    // 5) Instalación (opcional)
    var instWrap=document.createElement("div"); instWrap.className="inst-wrap";
    instWrap.innerHTML=
      '<div class="instalacion-box"><label>'+
        '<input type="checkbox" id="instOn'+idSuffix+'" checked>'+
        '<span><strong>Instalación (opcional)</strong> — Servicio ofrecido por <strong>Expiriti</strong> para instalar en tu equipo tu sistema.</span>'+
      "</label></div>";
    form.appendChild(instWrap);

    container.appendChild(form);

    // ---------- Resultados ----------
    var results=document.createElement("div"); results.className="calc-results";
    var table=document.createElement("table"); table.className="calc-table";
    table.innerHTML=
      '<thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>'+
      "<tbody>"+
      '  <tr id="tr-base'+idSuffix+'"><td>Precio base</td><td id="base'+idSuffix+'">$0.00</td></tr>'+
      '  <tr id="tr-uadd'+idSuffix+'"><td>Usuarios adicionales</td><td id="uadd'+idSuffix+'">$0.00</td></tr>'+
      '  <tr id="tr-disc'+idSuffix+'"><td>Descuento (sistemas)</td><td id="disc'+idSuffix+'">0% / $0.00</td></tr>'+
      '  <tr id="tr-inst'+idSuffix+'"><td>Instalación (opcional)</td><td id="inst'+idSuffix+'">$0.00</td></tr>'+
      '  <tr id="tr-instdisc'+idSuffix+'"><td>Descuento por primer servicio (instalación 50%)</td><td id="instdisc'+idSuffix+'">$0.00</td></tr>'+
      '  <tr id="tr-sub'+idSuffix+'"><td>Subtotal (sistemas + instalación)</td><td id="sub'+idSuffix+'">$0.00</td></tr>'+
      '  <tr id="tr-iva'+idSuffix+'"><td>IVA (16%)</td><td id="iva'+idSuffix+'">$0.00</td></tr>'+
      '  <tr id="tr-tot'+idSuffix+'"><td><strong>Total</strong></td><td id="tot'+idSuffix+'"><strong>$0.00</strong></td></tr>'+
      "</tbody>";
    results.appendChild(table); container.appendChild(results);

    // -------- Opciones dependientes --------
    function refreshOptions(){
      var lic=licenciaSel.value;
      opSel.innerHTML=""; rfcSel.innerHTML=""; rfcLabel.style.display="inline-block";
      opLabel.style.setProperty("display",(lic==="tradicional")?"block":"none","important");

      if(lic==="nueva"){
        opSel.appendChild(new Option("Anual (Nueva)","nueva_anual"));
        var anual=systemPrices.anual||{};
        if(anual.MonoRFC)rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
        if(anual.MultiRFC)rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
      }else if(lic==="renovacion"){
        opSel.appendChild(new Option("Renovación anual","renovacion_anual"));
        var anual2=systemPrices.anual||{};
        if(anual2.MonoRFC)rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
        if(anual2.MultiRFC)rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
      }else{
        opSel.appendChild(new Option("Actualización (versiones anteriores)","actualizacion"));
        opSel.appendChild(new Option("Actualización especial (inmediata anterior)","especial"));
        opSel.appendChild(new Option("Incremento de usuarios","crecimiento_usuario"));
        var trad=systemPrices.tradicional||{}, hasRFC=trad.actualizacion||trad.especial;
        if(hasRFC){rfcSel.appendChild(new Option("MonoRFC","MonoRFC")); rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));}
      }

      var multi=Array.from(rfcSel.options).find(function(o){return/multirfc/i.test(o.text)});
      if(multi)rfcSel.value=multi.value;
      if(rfcSel.options.length===0)rfcLabel.style.display="none";
      calculateAndRender();
    }

    // ---- instalación automática
    function instCheckbox(){return document.getElementById("instOn"+idSuffix)}
    function calcInstallationGross(){
      var on=instCheckbox(); if(!on||!on.checked)return 0;
      var usuarios=Math.max(1,parseInt(userInput.value||"1",10)||1);
      if(usuarios===1)return 800;
      return 800+(usuarios-1)*750;
    }

    // ----------------- Cálculo -----------------
    function calculateAndRender(){
      var lic=licenciaSel.value, op=opSel.value||"", rfcType=rfcSel.value;
      var usuarios=Math.max(1,parseInt(userInput.value||"1",10)||1);

      var base=0,usuariosAddImporte=0,usuariosExtras=0;

      if(lic==="nueva"||lic==="renovacion"){
        var anual=systemPrices.anual||{}, datosLic=anual[rfcType]||null;
        if(!datosLic)return writeZeros();
        base=Number((lic==="nueva")?(datosLic.precio_base||0):(datosLic.renovacion!=null?datosLic.renovacion:(datosLic.precio_base||0)));
        var perUser=Number((datosLic.usuario_en_red!=null)?datosLic.usuario_en_red:((datosLic.usuario_adicional!=null)?datosLic.usuario_adicional:0));
        usuariosExtras=Math.max(usuarios-1,0);
        usuariosAddImporte=usuariosExtras*perUser;
      }else{
        var trad=systemPrices.tradicional||{};
        if(op==="crecimiento_usuario"){
          var perUser2=Number((trad.crecimiento_usuario&&trad.crecimiento_usuario.usuario_adicional)||0);
          base=0; usuariosExtras=Math.max(usuarios-1,0); usuariosAddImporte=usuariosExtras*perUser2;
        }else if(op==="actualizacion"||op==="especial"){
          var datos=trad[op]||null; if(!datos)return writeZeros();
          base=Number(datos.precio_base||0);
          var perUser3=Number((datos.usuario_adicional!=null)?datos.usuario_adicional:((trad.crecimiento_usuario&&trad.crecimiento_usuario.usuario_adicional)||0));
          usuariosExtras=Math.max(usuarios-1,0);
          usuariosAddImporte=usuariosExtras*perUser3;
        }else return writeZeros();
      }

      var subtotalSistemas=base+usuariosAddImporte;

      // -15% paquete (2 o 3) excluye XML
      var discountPct=0;
      if((safeHasTable("calc-secondary")||safeHasTable("calc-tertiary"))&&sistemaName.indexOf("XML en Línea")===-1)discountPct=0.15;
      var discountAmt=subtotalSistemas*discountPct;
      var afterDiscount=subtotalSistemas-discountAmt;

      // instalación 50% desc
      var instGross=calcInstallationGross();
      var instDiscount=instGross*0.5;
      var instNet=instGross-instDiscount;

      // IVA (PATCH: base imponible = sistemas(desc) + instalación(neta))
      var baseImponible=afterDiscount+instNet, iva=baseImponible*0.16, total=baseImponible+iva;

      // Render
      document.getElementById("base"+idSuffix).textContent=fmt(base);
      document.getElementById("uadd"+idSuffix).textContent=fmt(usuariosAddImporte)+(usuariosExtras>0?(" ("+usuariosExtras+" extras)"):"");
      document.getElementById("disc"+idSuffix).textContent=pct(discountPct)+" / "+fmt(discountAmt);
      document.getElementById("inst"+idSuffix).textContent=fmt(instGross);
      document.getElementById("instdisc"+idSuffix).textContent=(instGross>0?("− "+fmt(instDiscount)):fmt(0));
      document.getElementById("sub"+idSuffix).textContent=fmt(baseImponible);
      document.getElementById("iva"+idSuffix).textContent=fmt(iva);
      document.getElementById("tot"+idSuffix).innerHTML="<strong>"+fmt(total)+"</strong>";

      document.getElementById("tr-uadd"+idSuffix).style.display=(usuariosExtras>0)?"":"none";
      document.getElementById("tr-disc"+idSuffix).style.display=(discountPct>0)?"":"none";
      var instOn=instCheckbox(), showInst=!!(instOn&&instOn.checked);
      document.getElementById("tr-inst"+idSuffix).style.display=showInst?"":"none";
      document.getElementById("tr-instdisc"+idSuffix).style.display=showInst?"":"none";

      updateCombinedSummary(combinedSelector);
    }

    function writeZeros(){
      document.getElementById("base"+idSuffix).textContent=fmt(0);
      document.getElementById("uadd"+idSuffix).textContent=fmt(0);
      document.getElementById("disc"+idSuffix).textContent="0% / "+fmt(0);
      document.getElementById("inst"+idSuffix).textContent=fmt(0);
      document.getElementById("instdisc"+idSuffix).textContent=fmt(0);
      document.getElementById("sub"+idSuffix).textContent=fmt(0);
      document.getElementById("iva"+idSuffix).textContent=fmt(0);
      document.getElementById("tot"+idSuffix).innerHTML="<strong>"+fmt(0)+"</strong>";
      document.getElementById("tr-uadd"+idSuffix).style.display="none";
      document.getElementById("tr-disc"+idSuffix).style.display="none";
      document.getElementById("tr-inst"+idSuffix).style.display="none";
      document.getElementById("tr-instdisc"+idSuffix).style.display="none";
      updateCombinedSummary(combinedSelector);
    }

    // Eventos
    licenciaSel.addEventListener("change",refreshOptions);
    opSel.addEventListener("change",function(){
      var lic=licenciaSel.value, op=opSel.value;
      if(lic==="tradicional"&&op==="crecimiento_usuario"){rfcLabel.style.display="none";}
      else{
        if(rfcSel.options.length===0){
          rfcSel.innerHTML="";
          if(lic==="nueva"||lic==="renovacion"){
            var anual=systemPrices.anual||{};
            if(anual.MonoRFC)rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
            if(anual.MultiRFC)rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
          }else{rfcSel.appendChild(new Option("MonoRFC","MonoRFC")); rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));}
          var m=Array.from(rfcSel.options).find(function(o){return/multirfc/i.test(o.text)}); if(m)rfcSel.value=m.value;
        }
        rfcLabel.style.display="inline-block";
      }
      calculateAndRender();
    });
    rfcSel.addEventListener("change",calculateAndRender);
    userInput.addEventListener("change",calculateAndRender);
    var chk=document.getElementById("instOn"+idSuffix); if(chk)chk.addEventListener("change",calculateAndRender);
    window.addEventListener("calc-recompute",calculateAndRender);
    refreshOptions();
  }

  // =================== Resumen combinado (PATCH: aquí va lo de MXN + letra) =====================
  function updateCombinedSummary(combinedSelector){
    if(!combinedSelector)combinedSelector="#combined-wrap";
    var combined=document.querySelector(combinedSelector); if(!combined)return;

    // PATCH: parse robusto con comas/centavos y signo "−"
    function getNum(id){
      var el=document.getElementById(id); if(!el)return 0;
      var s=(el.textContent||"").trim();
      s=s.replace(/\s/g,"").replace(/[^\d.,-]/g,"").replace(/,/g,"");
      var n=parseFloat(s); return isNaN(n)?0:n;
    }

    var e1=!!document.getElementById("tot1");
    var e2=!!document.getElementById("tot2");
    var e3=!!document.getElementById("tot3");
    combined.innerHTML="";

    // PATCH: aunque sea 1 sistema, aquí metemos “Precios en MXN + letra”
    if(!e2&&!e3){
      var t=getNum("tot1");
      combined.innerHTML=
        '<div class="combined-summary">'+
          '<div class="cs-head">'+
            '<div>'+
              '<h4>Precios en MXN (Moneda Nacional)</h4>'+
              '<div class="hint">Importe en número y letra</div>'+
            '</div>'+
            '<div class="total-amount"><strong>'+fmt(t)+'</strong></div>'+
          '</div>'+
          '<div class="amount-letter">'+(window.mxnLetra?mxnLetra(t):'Importe en letra: (pendiente función mxnLetra)')+'</div>'+
        '</div>';
      combined.hidden=false; return;
    }

    var n1=(document.getElementById("calc-primary")&&document.getElementById("calc-primary").dataset.systemName)||"Sistema 1";
    var n2=(document.getElementById("calc-secondary")&&document.getElementById("calc-secondary").dataset.systemName)||"Sistema 2";
    var n3=(document.getElementById("calc-tertiary")&&document.getElementById("calc-tertiary").dataset.systemName)||"Sistema 3";

    var filas=[], totales=[], ivaTotal=0;
    if(e1){filas.push({label:"Subtotal "+n1+" (sistemas + instalación)",val:getNum("sub1")});totales.push(getNum("tot1"));ivaTotal+=getNum("iva1")}
    if(e2){filas.push({label:"Subtotal "+n2+" (sistemas + instalación)",val:getNum("sub2")});totales.push(getNum("tot2"));ivaTotal+=getNum("iva2")}
    if(e3){filas.push({label:"Subtotal "+n3+" (sistemas + instalación)",val:getNum("sub3")});totales.push(getNum("tot3"));ivaTotal+=getNum("iva3")}

    var totalCombinado=totales.reduce(function(a,b){return a+b},0);

    var box=document.createElement("div");
    box.className="combined-summary";
    box.innerHTML=
      '<div class="cs-head">'+
        '<div>'+
          '<h4>Precios en MXN (Moneda Nacional)</h4>'+
          '<div class="hint">Importe en número y letra</div>'+
        '</div>'+
        '<div class="total-amount"><strong>'+fmt(totalCombinado)+'</strong></div>'+
      '</div>'+
      '<div class="amount-letter">'+(window.mxnLetra?mxnLetra(totalCombinado):'Importe en letra: (pendiente función mxnLetra)')+'</div>'+
      '<table class="combined-table">'+
      '  <thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>'+
      "  <tbody>"+
        filas.map(function(f){return"<tr><td>"+f.label+"</td><td>"+fmt(f.val)+"</td></tr>"}).join("")+
      "    <tr><td>IVA total (sistemas + instalación)</td><td>"+fmt(ivaTotal)+"</td></tr>"+
      "    <tr><td><strong>Total combinado</strong></td><td><strong>"+fmt(totalCombinado)+"</strong></td></tr>"+
      "  </tbody>"+
      "</table>";
    combined.appendChild(box);
    combined.hidden=false;
  }

  // ====================== API pública =======================
  function initCalculadora(opts){
    opts=opts||{};
    var systemName=opts.systemName;
    var primarySelector=opts.primarySelector||"#calc-primary";
    var combinedSelector=opts.combinedSelector||"#combined-wrap";
    var el=document.querySelector(primarySelector);
    if(!el){console.warn("No existe contenedor primario:",primarySelector);return}
    createCalculator(el,systemName,"1",combinedSelector);
    setTimeout(function(){recomputeAll()},0);
  }
  function setSecondarySystem(name,opts){
    opts=opts||{};
    var secondarySelector=opts.secondarySelector||"#calc-secondary";
    var combinedSelector=opts.combinedSelector||"#combined-wrap";
    var el=document.querySelector(secondarySelector);
    if(!el){console.warn("No existe contenedor secundario:",secondarySelector);return}
    createCalculator(el,name,"2",combinedSelector);
    recomputeAll();
  }
  function setTertiarySystem(name,opts){
    opts=opts||{};
    var tertiarySelector=opts.tertiarySelector||"#calc-tertiary";
    var combinedSelector=opts.combinedSelector||"#combined-wrap";
    var el=document.querySelector(tertiarySelector);
    if(!el){console.warn("No existe contenedor terciario:",tertiarySelector);return}
    createCalculator(el,name,"3",combinedSelector);
    recomputeAll();
  }
  window.CalculadoraContpaqi={init:initCalculadora,setSecondarySystem:setSecondarySystem,setTertiarySystem:setTertiarySystem,updateCombinedSummary:updateCombinedSummary};

  // Auto-init
  function autoInit(){
    if(window.__EXPIRITI_FORCE_NUBE__===true||document.body.getAttribute("data-calc")==="nube"){console.log("v13.2: cancelado autoInit porque hay calculadora NUBE");return;}
    var app=document.getElementById("app");
    var sys=app&&app.dataset?app.dataset.system:null;
    if(sys&&document.querySelector("#calc-primary"))window.CalculadoraContpaqi.init({systemName:sys});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",autoInit);
  else autoInit();

})(); // IIFE principal

} // GUARD GLOBAL

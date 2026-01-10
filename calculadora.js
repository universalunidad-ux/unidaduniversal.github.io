/* =========================================================
 Expiriti - calculadora.js (FINAL) v13.4
 - FIX CRÍTICO: anti doble carga (evita IDs duplicados usr1/lic1/tot1)
 - FIX: cleanup de duplicados por sufijo (1/2/3) si el DOM ya viene “sucio”
 - FIX: pickers 2º/3º dentro del guard (no corren en modo nube)
 - FIX: paintSystemButtons ahora sí pinta + bindea clicks
 - Mantiene: -15% por paquete (excepto “XML en Línea”) + instalación 50%
========================================================= */

/* === GUARD GLOBAL PARA NUBE === */
if(document?.body?.getAttribute("data-calc")==="nube"||window.__EXPIRITI_FORCE_NUBE__===true){
  console.log("calculadora.js: saltado COMPLETO (modo Nube activo)");
  window.CalculadoraContpaqi=window.CalculadoraContpaqi||{init(){},setSecondarySystem(){},setTertiarySystem(){},updateCombinedSummary(){}};
}else{(function(){ "use strict";

/* === Guard anti doble carga === */
if(window.__EXP_CALC_FINAL_LOADED__){console.warn("calculadora.js: ya cargado, abortando (evita duplicados)");return;}
window.__EXP_CALC_FINAL_LOADED__=1;
console.log("calculadora.js v13.4: cargado");

/* ===== Helpers ===== */
var money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2,maximumFractionDigits:2});
function fmt(v){v=Number(v||0);return money.format(isFinite(v)?v:0)}
function pct(v){return ((v||0)*100).toFixed(0)+"%"}
function round2(x){return Math.round((Number(x)||0)*100)/100}
function $id(id){return document.getElementById(id)}
function qs(sel,root){return (root||document).querySelector(sel)}
function qsa(sel,root){return Array.from((root||document).querySelectorAll(sel))}
function setText(id,val){var el=$id(id); if(!el) return false; el.textContent=val; return true}
function setHTML(id,val){var el=$id(id); if(!el) return false; el.innerHTML=val; return true}
function setDisplay(id,val){var el=$id(id); if(!el) return false; el.style.display=val; return true}
function safeHasTableBySel(sel){var el=qs(sel); return !!(el && el.querySelector && el.querySelector("table"))}
function recomputeAll(){window.dispatchEvent(new Event("calc-recompute"))}

/* ===== mxnLetra (tu versión) ===== */
function mxnLetra(n){
  n=Number(n||0); var enteros=Math.floor(n);
  var centavos=Math.round((n-enteros)*100).toString().padStart(2,"0");
  function u(n){return["","UNO","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE"][n]}
  function d(n){return["","DIEZ","VEINTE","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"][n]}
  function c(n){return["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"][n]}
  function num(n){
    if(n===0) return "CERO"; if(n<10) return u(n);
    if(n<20) return ["DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE"][n-10];
    if(n<100){if(n<30) return ["VEINTE","VEINTIUNO","VEINTIDÓS","VEINTITRÉS","VEINTICUATRO","VEINTICINCO","VEINTISÉIS","VEINTISIETE","VEINTIOCHO","VEINTINUEVE"][n-20];
      var dec=Math.floor(n/10),uni=n%10; return d(dec)+(uni?" Y "+u(uni):"");}
    if(n===100) return "CIEN";
    if(n<1000) return c(Math.floor(n/100))+(n%100?" "+num(n%100):"");
    if(n<1000000){var miles=Math.floor(n/1000),resto=n%1000; var txt=(miles===1?"MIL":(num(miles)+" MIL")); return txt+(resto?(" "+num(resto)):"");}
    var mill=Math.floor(n/1000000),restoM=n%1000000; var txtM=(mill===1?"UN MILLÓN":(num(mill)+" MILLONES"));
    return txtM+(restoM?(" "+num(restoM)):"");
  }
  var centInt=parseInt(centavos,10)||0;
  if(centInt===0) return num(enteros)+" PESOS 00/100 M.N.";
  return num(enteros)+" PESOS CON "+num(centInt)+" CENTAVOS "+centavos+"/100 M.N.";
}
window.mxnLetra=mxnLetra;

/* =========================================================
  FIX #1: Limpieza dura de IDs duplicados por sufijo
  - Si existen 2 usr1/lic1/tot1, borra la calculadora “fantasma”
========================================================= */
function cleanupSuffixDupes(suf,keepContainer){
  var ids=["lic","op","rfc","usr","instOn","base","uadd","disc","inst","instdisc","sub","iva","tot",
           "tr-base","tr-uadd","tr-disc","tr-inst","tr-instdisc","tr-sub","tr-iva","tr-tot",
           "lbl-base","lbl-uadd","lbl-disc","lbl-inst","lbl-instdisc","lbl-sub","lbl-iva","lbl-tot","instLblSTRONG"];
  var seen=0;
  ids.forEach(function(p){
    var full=p+suf, nodes=document.querySelectorAll("#"+CSS.escape(full));
    if(nodes.length>1){
      // Conserva el que vive dentro del contenedor actual; elimina el resto por “limpieza”
      nodes.forEach(function(n){
        if(keepContainer && keepContainer.contains(n)) return;
        // borra el calc-container padre completo (evita residuos)
        var box=n.closest(".calc-container");
        if(box){box.innerHTML=""; box.removeAttribute("data-system-name");}
        else n.remove();
      });
    }
    if(nodes.length) seen+=nodes.length;
  });
  return seen;
}

/* ===== Layout state ===== */
function markEmpty(sel){var el=qs(sel); if(!el) return; el.classList.toggle("calc-empty", !el.querySelector("table"));}
function setCalcCountClass(){
  var row=document.getElementById("calc-row");
  var sec=document.getElementById("calc-secondary");
  var ter=document.getElementById("calc-tertiary");

  var has2=!!(sec && sec.querySelector("table"));
  var has3=!!(ter && ter.querySelector("table"));

  var cols = has3 ? "3" : (has2 ? "2" : "1");
  if(row) row.setAttribute("data-cols", cols);

  [document.documentElement,document.body].forEach(function(el){
    if(!el) return;
    el.classList.toggle("has-calc-2", cols==="2");
    el.classList.toggle("has-calc-3", cols==="3");
    if(cols==="3") el.classList.remove("has-calc-2");
  });
}

/* ✅ Alias global (lo que yo llamaba expSetCalcCols) */
function expSetCalcCols(){ setCalcCountClass(); }
window.expSetCalcCols = expSetCalcCols;

/* ===== Ensure secondary container exists (insert sibling) ===== */
function ensureSecondaryContainer(){
  var row=$id("calc-row"); if(!row){console.warn("No existe #calc-row"); return null;}
  var existing=$id("calc-secondary"); if(existing) return existing;
  var sec=document.createElement("div");
  sec.id="calc-secondary"; sec.className="calc-container"; sec.setAttribute("aria-label","Segunda calculadora");
  var primary=$id("calc-primary"), slot=$id("calc-slot-2");
  if(primary && primary.parentNode===row) row.insertBefore(sec, primary.nextSibling);
  else if(slot && slot.parentNode===row) row.insertBefore(sec, slot);
  else row.appendChild(sec);
  return sec;
}
function showThirdPanel(show){
  var t=$id("calc-tertiary"), p=$id("add-more-panel");
  if(t) t.style.display=show?"":"none";
  if(p) p.style.display=show?"none":"";
}

/* ===== System list + buttons ===== */
function getSystemList(){
  if(Array.isArray(window.CATALOG_SISTEMAS)&&window.CATALOG_SISTEMAS.length){
    return window.CATALOG_SISTEMAS.map(function(x){return {name:x.name,img:x.img||""}})
  }
  var all=window.preciosContpaqi||{};
  return Object.keys(all).map(function(k){return {name:k,img:""}})
}
function paintSystemButtons(wrapId,onPick,excludeNames){
  var wrap=$id(wrapId); if(!wrap) return;
  wrap.innerHTML="";
  var list=getSystemList(); excludeNames=excludeNames||[];
  list.forEach(function(item){
    if(!item||!item.name) return;
    if(excludeNames.indexOf(item.name)!==-1) return;
    var b=document.createElement("button");
    b.type="button"; b.className="sys-icon";
    b.setAttribute("data-system",item.name); b.setAttribute("data-sys",item.name);
    b.dataset.system=item.name; b.dataset.sys=item.name;
    b.innerHTML=item.img?('<img src="'+item.img+'" alt=""><strong>'+item.name+"</strong>"):("<strong>"+item.name+"</strong>");
    b.addEventListener("click",function(){onPick(item.name);});
    wrap.appendChild(b);
  });
}

/* ===== CSS patch mínimo para forms (seguro) ===== */
(function(){
  var id="calc-form-visibility-patch"; if($id(id)) return;
  var st=document.createElement("style"); st.id=id;
  st.textContent=".calc-container form{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important}"+
                "@media(max-width:768px){.calc-container form{grid-template-columns:1fr!important}}";
  document.head.appendChild(st);
})();

/* =========================================================
  Render calculadora (IDs: lic1/usr1/tot1 ... lic3/usr3/tot3)
========================================================= */
function createCalculator(container,sistemaName,idSuffix,combinedSelector){
  if(!container) return;

  // Limpia duplicados ANTES de render (si el script se ejecutó doble o init doble)
  cleanupSuffixDupes(idSuffix, container);

  container.innerHTML=""; container.dataset.systemName=sistemaName;

  var allPrices=window.preciosContpaqi||{};
  var systemPrices=allPrices[sistemaName];
  if(!systemPrices){container.innerHTML='<p style="margin:0">Error: faltan precios para <strong>'+sistemaName+"</strong>.</p>"; return;}

  var title=document.createElement("h4"); title.textContent=sistemaName+" — Calculadora"; container.appendChild(title);

  var form=document.createElement("form"); form.className="calc-form";

  var licenciaLabel=document.createElement("label"); licenciaLabel.classList.add("field","lic"); licenciaLabel.textContent="Licencia:";
  var licenciaSel=document.createElement("select"); licenciaSel.id="lic"+idSuffix;
  licenciaSel.innerHTML='<option value="nueva">Nueva</option><option value="renovacion">Renovación</option><option value="tradicional">Tradicional</option>';
  licenciaLabel.appendChild(licenciaSel); form.appendChild(licenciaLabel);

  var opLabel=document.createElement("label"); opLabel.className="op-label"; opLabel.textContent="Operación:";
  var opSel=document.createElement("select"); opSel.id="op"+idSuffix;
  opLabel.appendChild(opSel); form.appendChild(opLabel);

  var rfcLabel=document.createElement("label"); rfcLabel.classList.add("field","rfc"); rfcLabel.textContent="Tipo (RFC):";
  var rfcSel=document.createElement("select"); rfcSel.id="rfc"+idSuffix;
  rfcLabel.appendChild(rfcSel); form.appendChild(rfcLabel);

  var userLabel=document.createElement("label"); userLabel.classList.add("field","usr"); userLabel.textContent="Usuarios:";
  var userInput=document.createElement("input"); userInput.type="number"; userInput.id="usr"+idSuffix; userInput.min="1"; userInput.value="1";
  userLabel.appendChild(userInput); form.appendChild(userLabel);

  var instWrap=document.createElement("div"); instWrap.className="inst-wrap";
  instWrap.innerHTML='<div class="instalacion-box"><label>'+
    '<input type="checkbox" id="instOn'+idSuffix+'" checked>'+
    '<span><strong id="instLblSTRONG'+idSuffix+'">Instalación (opcional)</strong> — Servicio ofrecido por <strong>Expiriti</strong> para instalar en tu equipo tu sistema.</span>'+
    "</label></div>";
  form.appendChild(instWrap);

  container.appendChild(form);

  var results=document.createElement("div"); results.className="calc-results";
  var table=document.createElement("table"); table.className="calc-table";
  table.innerHTML='<thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead>'+
    '<tbody>'+
    '<tr id="tr-base'+idSuffix+'"><td id="lbl-base'+idSuffix+'">Precio base</td><td id="base'+idSuffix+'">$0.00</td></tr>'+
    '<tr id="tr-uadd'+idSuffix+'"><td id="lbl-uadd'+idSuffix+'">Usuarios adicionales</td><td id="uadd'+idSuffix+'">$0.00</td></tr>'+
    '<tr id="tr-disc'+idSuffix+'"><td id="lbl-disc'+idSuffix+'">Descuento (sistema)</td><td id="disc'+idSuffix+'">0% / $0.00</td></tr>'+
    '<tr id="tr-inst'+idSuffix+'"><td id="lbl-inst'+idSuffix+'">Instalación</td><td id="inst'+idSuffix+'">$0.00</td></tr>'+
    '<tr id="tr-instdisc'+idSuffix+'"><td id="lbl-instdisc'+idSuffix+'">Descuento por primer servicio (instalación 50%)</td><td id="instdisc'+idSuffix+'">$0.00</td></tr>'+
    '<tr id="tr-sub'+idSuffix+'"><td id="lbl-sub'+idSuffix+'">Subtotal</td><td id="sub'+idSuffix+'">$0.00</td></tr>'+
    '<tr id="tr-iva'+idSuffix+'"><td id="lbl-iva'+idSuffix+'">IVA (16%)</td><td id="iva'+idSuffix+'">$0.00</td></tr>'+
    '<tr id="tr-tot'+idSuffix+'"><td id="lbl-tot'+idSuffix+'"><strong>Total</strong></td><td id="tot'+idSuffix+'"><strong>$0.00</strong></td></tr>'+
    "</tbody>";

 results.appendChild(table);
container.appendChild(results);

// ✅ ya existe <table> → actualiza data-cols / clases
try{ window.expSetCalcCols && window.expSetCalcCols(); }catch(e){}



 
  function instCheckbox(){return $id("instOn"+idSuffix)}
  function calcInstallationGross(){
    var on=instCheckbox(); if(!on||!on.checked) return 0;
    var u=Math.max(1,parseInt(userInput.value||"1",10)||1);
    return u===1?800:800+(u-1)*750;
  }
  function writeZeros(){
    setText("base"+idSuffix,fmt(0)); setText("uadd"+idSuffix,fmt(0)); setText("disc"+idSuffix,"0% / "+fmt(0));
    setText("inst"+idSuffix,fmt(0)); setText("instdisc"+idSuffix,fmt(0)); setText("sub"+idSuffix,fmt(0));
    setText("iva"+idSuffix,fmt(0)); setHTML("tot"+idSuffix,"<strong>"+fmt(0)+"</strong>");
    setDisplay("tr-uadd"+idSuffix,"none"); setDisplay("tr-disc"+idSuffix,"none"); setDisplay("tr-inst"+idSuffix,"none"); setDisplay("tr-instdisc"+idSuffix,"none");
updateCombinedSummary(combinedSelector);
try{ setCalcCountClass(); }catch(e){}
  }

  function refreshOptions(){
    var lic=licenciaSel.value;
    opSel.innerHTML=""; rfcSel.innerHTML=""; rfcLabel.style.display="inline-block";
    opLabel.style.setProperty("display",(lic==="tradicional")?"block":"none","important");

    if(lic==="nueva"){
      opSel.appendChild(new Option("Anual (Nueva)","nueva_anual"));
      var anual=systemPrices.anual||{};
      if(anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
      if(anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
    }else if(lic==="renovacion"){
      opSel.appendChild(new Option("Renovación anual","renovacion_anual"));
      var anual2=systemPrices.anual||{};
      if(anual2.MonoRFC) rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
      if(anual2.MultiRFC) rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
    }else{
      opSel.appendChild(new Option("Actualización (versiones anteriores)","actualizacion"));
      opSel.appendChild(new Option("Actualización especial (inmediata anterior)","especial"));
      opSel.appendChild(new Option("Incremento de usuarios","crecimiento_usuario"));
      var trad=systemPrices.tradicional||{}, hasRFC=trad.actualizacion||trad.especial;
      if(hasRFC){rfcSel.appendChild(new Option("MonoRFC","MonoRFC")); rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));}
    }

    var multi=Array.from(rfcSel.options).find(function(o){return /multirfc/i.test(o.text)});
    if(multi) rfcSel.value=multi.value;
    if(rfcSel.options.length===0) rfcLabel.style.display="none";

    calculateAndRender();
  }

  function calculateAndRender(){
    var lic=licenciaSel.value, op=opSel.value||"", rfcType=rfcSel.value;
    var usuarios=Math.max(1,parseInt(userInput.value||"1",10)||1);
    var base=0, usuariosAddImporte=0, usuariosExtras=0;

    if(lic==="nueva"||lic==="renovacion"){
      var anual=systemPrices.anual||{}, datosLic=anual[rfcType]||null;

      // fallback: si rfcType no existe (o quedó vacío), toma el primero disponible
      if(!datosLic){
        var k=Object.keys(anual||{})[0];
        if(k){rfcType=k; if(rfcSel && rfcSel.value!==k) rfcSel.value=k; datosLic=anual[k]||null;}
      }
      if(!datosLic) return writeZeros();

      base=Number((lic==="nueva")?(datosLic.precio_base||0):(datosLic.renovacion!=null?datosLic.renovacion:(datosLic.precio_base||0)));
      var perUser=Number((datosLic.usuario_en_red!=null)?datosLic.usuario_en_red:((datosLic.usuario_adicional!=null)?datosLic.usuario_adicional:0));
      usuariosExtras=Math.max(usuarios-1,0); usuariosAddImporte=usuariosExtras*perUser;

    }else{
      var trad=systemPrices.tradicional||{};
      if(op==="crecimiento_usuario"){
        var perUser2=Number((trad.crecimiento_usuario&&trad.crecimiento_usuario.usuario_adicional)||0);
        base=0; usuariosExtras=Math.max(usuarios-1,0); usuariosAddImporte=usuariosExtras*perUser2;
      }else if(op==="actualizacion"||op==="especial"){
        var datos=trad[op]||null; if(!datos) return writeZeros();
        base=Number(datos.precio_base||0);
        var perUser3=Number((datos.usuario_adicional!=null)?datos.usuario_adicional:((trad.crecimiento_usuario&&trad.crecimiento_usuario.usuario_adicional)||0));
        usuariosExtras=Math.max(usuarios-1,0); usuariosAddImporte=usuariosExtras*perUser3;
      }else return writeZeros();
    }

    var subtotalSistemas=base+usuariosAddImporte;

    // -15% paquete (2 o 3) excepto XML
    var discountPct=0;
    var hasPackage=safeHasTableBySel("#calc-secondary")||safeHasTableBySel("#calc-tertiary");
    if(hasPackage && sistemaName.indexOf("XML en Línea")===-1) discountPct=0.15;

    var discountAmt=round2(subtotalSistemas*discountPct);
    var afterDiscount=round2(subtotalSistemas-discountAmt);

    // instalación (bruto) y descuento 50% (neto)
    var instGross=calcInstallationGross();
    var instDiscount=round2(instGross*0.5);
    var instNet=round2(instGross-instDiscount);

    // labels dinámicos
    var instOn=instCheckbox();
    var instCount=(instOn&&instOn.checked)?usuarios:0;
    var instWord=(instCount===1?"Instalación":"Instalaciones");
    var instLabel=instCount>0?(instWord+" ("+instCount+")"):"Instalación";
    var inst50Label="Descuento por primer servicio ("+(instCount===1?"instalación":"instalaciones")+" 50%)";
    var subLabel="Subtotal (sistema + "+(instCount===1?"instalación":"instalaciones")+")";

    var elLblInst=$id("lbl-inst"+idSuffix); if(elLblInst) elLblInst.textContent=instLabel;
    var elLblInstDisc=$id("lbl-instdisc"+idSuffix); if(elLblInstDisc) elLblInstDisc.textContent=inst50Label;
    var elLblSub=$id("lbl-sub"+idSuffix); if(elLblSub) elLblSub.textContent=subLabel;

    var strong=$id("instLblSTRONG"+idSuffix);
    if(strong){
      if(!instOn||!instOn.checked) strong.textContent="Instalación (opcional)";
      else strong.textContent=(instCount===1?"Instalación":"Instalaciones")+" ("+instCount+")";
    }

    var showInst=!!(instOn&&instOn.checked);

    var baseImponible=round2(afterDiscount+instNet);
    var iva=round2(baseImponible*0.16);
    var total=round2(baseImponible+iva);

    setText("base"+idSuffix,fmt(base));
    setText("uadd"+idSuffix,fmt(usuariosAddImporte)+(usuariosExtras>0?(" ("+usuariosExtras+" "+(usuariosExtras===1?"extra":"extras")+")"):""));
    setText("disc"+idSuffix,pct(discountPct)+" / "+fmt(discountAmt));
    setText("inst"+idSuffix,fmt(instGross));
    setText("instdisc"+idSuffix,(instGross>0?("− "+fmt(instDiscount)):fmt(0)));
    setText("sub"+idSuffix,fmt(baseImponible));
    setText("iva"+idSuffix,fmt(iva));
    setHTML("tot"+idSuffix,"<strong>"+fmt(total)+"</strong>");

    setDisplay("tr-uadd"+idSuffix,(usuariosExtras>0)?"":"none");
    setDisplay("tr-disc"+idSuffix,(discountPct>0)?"":"none");
    setDisplay("tr-inst"+idSuffix,showInst?"":"none");
    setDisplay("tr-instdisc"+idSuffix,showInst?"":"none");

   updateCombinedSummary(combinedSelector);
try{ setCalcCountClass(); }catch(e){}

  }

  licenciaSel.addEventListener("change",refreshOptions);
  opSel.addEventListener("change",function(){
    var lic=licenciaSel.value, op=opSel.value;
    if(lic==="tradicional"&&op==="crecimiento_usuario"){rfcLabel.style.display="none";}
    else{
      if(rfcSel.options.length===0){
        rfcSel.innerHTML="";
        if(lic==="nueva"||lic==="renovacion"){
          var anual=systemPrices.anual||{};
          if(anual.MonoRFC) rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
          if(anual.MultiRFC) rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
        }else{
          rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));
          rfcSel.appendChild(new Option("MultiRFC","MultiRFC"));
        }
        var m=Array.from(rfcSel.options).find(function(o){return /multirfc/i.test(o.text)}); if(m) rfcSel.value=m.value;
      }
      rfcLabel.style.display="inline-block";
    }
    calculateAndRender();
  });
  rfcSel.addEventListener("change",calculateAndRender);
  userInput.addEventListener("change",calculateAndRender);
  var chk=$id("instOn"+idSuffix); if(chk) chk.addEventListener("change",calculateAndRender);
  window.addEventListener("calc-recompute",calculateAndRender);

  refreshOptions();
}

/* ===== Resumen combinado ===== */
function updateCombinedSummary(combinedSelector){
  var wrap=qs(combinedSelector||"#combined-wrap");
  if(!wrap) { setCalcCountClass(); return; }   // ✅ aun sin wrap, ajusta cols

  var tbody=$id("combined-table-body");
  if(!tbody){
    console.warn("Falta #combined-table-body");
    wrap.hidden=true;                           // ✅ evita UI rota
    setCalcCountClass();                        // ✅ ajusta cols
    return;
  }
  function getNum(id){
    var el=$id(id); if(!el) return 0;
    var s=(el.textContent||"").trim();
    s=s.replace(/\u2212/g,"-").replace(/\s/g,"").replace(/[^\d.,-]/g,"").replace(/,/g,"");
    var n=parseFloat(s); return isNaN(n)?0:n;
  }

  var e1=!!$id("tot1"), e2=!!$id("tot2"), e3=!!$id("tot3");
  tbody.innerHTML="";

  var n1=($id("calc-primary")&&$id("calc-primary").dataset?$id("calc-primary").dataset.systemName:"")||"Sistema 1";
  var n2=($id("calc-secondary")&&$id("calc-secondary").dataset?$id("calc-secondary").dataset.systemName:"")||"Sistema 2";
  var n3=($id("calc-tertiary")&&$id("calc-tertiary").dataset?$id("calc-tertiary").dataset.systemName:"")||"Sistema 3";

  function instCountFor(suf){
    var chk=$id("instOn"+suf); if(!chk||!chk.checked) return 0;
    var u=$id("usr"+suf); return Math.max(1,parseInt((u&&u.value)||"1",10)||1);
  }
  function instLabelFor(suf){var n=instCountFor(suf); return (n===1?"instalación":"instalaciones")}

  var filas=[], totales=[], ivaTotal=0;
  if(e1){filas.push({label:"Subtotal "+n1+" e "+instLabelFor("1"),val:getNum("sub1")}); totales.push(getNum("tot1")); ivaTotal+=getNum("iva1")}
  if(e2){filas.push({label:"Subtotal "+n2+" e "+instLabelFor("2"),val:getNum("sub2")}); totales.push(getNum("tot2")); ivaTotal+=getNum("iva2")}
  if(e3){filas.push({label:"Subtotal "+n3+" e "+instLabelFor("3"),val:getNum("sub3")}); totales.push(getNum("tot3")); ivaTotal+=getNum("iva3")}

  if(!totales.length){wrap.hidden=true; setCalcCountClass(); return;}

  var totalCombinado=round2(totales.reduce(function(a,b){return a+b},0));
  ivaTotal=round2(ivaTotal);

  filas.forEach(function(f){
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+f.label+"</td><td>"+fmt(f.val)+"</td>";
    tbody.appendChild(tr);
  });

                                                   
  var trI=document.createElement("tr");
  trI.innerHTML="<td>IVA total</td><td>"+fmt(ivaTotal)+"</td>";
  tbody.appendChild(trI);

  var trT=document.createElement("tr");
  trT.innerHTML='<td><strong>Total</strong></td><td><strong>'+fmt(totalCombinado)+'</strong><div style="font-size:12px;opacity:.85;margin-top:6px">'+(window.mxnLetra?mxnLetra(totalCombinado):"")+"</div></td>";
  tbody.appendChild(trT);

  wrap.hidden=false;
  setCalcCountClass();
}

/* ===== API pública ===== */
function initCalculadora(opts){
  opts=opts||{};
  var systemName=opts.systemName;
  var primarySelector=opts.primarySelector||"#calc-primary";
  var combinedSelector=opts.combinedSelector||"#combined-wrap";
  var el=qs(primarySelector);
  if(!el){console.warn("No existe contenedor primario:",primarySelector);return;}
  createCalculator(el,systemName,"1",combinedSelector);

  // picker 2
  var exclude=[systemName];
  paintSystemButtons("icons-sec-sys",function(name){
    window.CalculadoraContpaqi.setSecondarySystem(name,{combinedSelector:combinedSelector});
  },exclude);

  setCalcCountClass();
  setTimeout(function(){recomputeAll();},0);
}
function setSecondarySystem(name,opts){
  opts=opts||{};
  var combinedSelector=opts.combinedSelector||"#combined-wrap";
  var sec=ensureSecondaryContainer();
  if(!sec){console.warn("No se pudo montar #calc-secondary");return;}
  createCalculator(sec,name,"2",combinedSelector);

  // habilita panel 3
  var addPanel=$id("add-more-panel");
  if(addPanel) addPanel.style.display="";
  showThirdPanel(false);

  var exclude=[($id("calc-primary")&&$id("calc-primary").dataset?$id("calc-primary").dataset.systemName:"")||"",name].filter(Boolean);
  paintSystemButtons("icons-third-sys",function(n3){
    window.CalculadoraContpaqi.setTertiarySystem(n3,{combinedSelector:combinedSelector});
  },exclude);

  setCalcCountClass();
  recomputeAll();
}
function setTertiarySystem(name,opts){
  opts=opts||{};
  var combinedSelector=opts.combinedSelector||"#combined-wrap";
  var el=$id("calc-tertiary");
  if(!el){console.warn("No existe #calc-tertiary");return;}
  el.style.display="";
  createCalculator(el,name,"3",combinedSelector);

  // ya con 3: muestra calc3, oculta picker 3
  showThirdPanel(true);

  setCalcCountClass();
  recomputeAll();
}
window.CalculadoraContpaqi={init:initCalculadora,setSecondarySystem:setSecondarySystem,setTertiarySystem:setTertiarySystem,updateCombinedSummary:updateCombinedSummary};

/* =========================================================
  FIX #2: Auto-init SOLO 1 vez (evita montar 2 veces la calc1)
========================================================= */
function autoInitOnce(){
  if(window.__EXP_CALC_AUTOINIT_DONE__) return;
  window.__EXP_CALC_AUTOINIT_DONE__=1;

  var app=$id("app"); var sys=app&&app.dataset?app.dataset.system:null;
  if(sys && qs("#calc-primary")) window.CalculadoraContpaqi.init({systemName:sys});
  setCalcCountClass();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",autoInitOnce,{once:true});
else autoInitOnce();

})();} /* end guard escritorio */

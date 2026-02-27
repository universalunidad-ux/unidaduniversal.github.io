/* =========================================================
 Expiriti - calculadora.js (FINAL) v13.4
 - FIX CRÍTICO: anti doble carga (evita IDs duplicados usr1/lic1/tot1)
 - FIX: cleanup de duplicados por sufijo (1/2/3) si el DOM ya viene “sucio”
 - FIX: pickers 2º/3º dentro del guard (no corren en modo nube)
 - FIX: paintSystemButtons ahora sí pinta + bindea clicks
 - Mantiene: -15% por paquete (excepto “XML en Línea”) + instalación 50%
========================================================= */


/* Expiriti - calculadora.js (FINAL) v13.4-min (no dupes + headers) */
if(document?.body?.getAttribute("data-calc")==="nube"||window.__EXPIRITI_FORCE_NUBE__===true){
  window.CalculadoraContpaqi=window.CalculadoraContpaqi||{init(){},setSecondarySystem(){},setTertiarySystem(){},updateCombinedSummary(){}}
}else{(()=>{"use strict";
if(window.__EXP_CALC_FINAL_LOADED__)return;window.__EXP_CALC_FINAL_LOADED__=1;
var D=document,W=window,money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2,maximumFractionDigits:2});
if(!D.getElementById("app")||!D.getElementById("calc-row")||!D.getElementById("calc-primary"))return;
function fmt(v){v=+v||0;return money.format(v)}
function pct(v){return((v||0)*100|0)+"%"}
function round2(v){return Math.round((+v||0)*100)/100}
function $id(i){return D.getElementById(i)}
function qs(s,r){return(r||D).querySelector(s)}
function qsa(s,r){return[].slice.call((r||D).querySelectorAll(s))}
function setText(i,v){var e=$id(i);if(!e)return!1;e.textContent=v;return!0}
function setHTML(i,v){var e=$id(i);if(!e)return!1;e.innerHTML=v;return!0}
function setDisplay(i,v){var e=$id(i);if(!e)return!1;e.style.display=v;return!0}
function safeHasTableBySel(s){var e=qs(s);return!!(e&&e.querySelector("table"))}
function recomputeAll(){try{W.dispatchEvent(new Event("calc-recompute"))}catch{}try{W.dispatchEvent(new Event("calc-render"))}catch{}}

if(!D.getElementById("calc-row")||!D.getElementById("app")){return}                                                                                                                                                                                                                                                                                                                     
function mxnLetra(n){n=Number(n||0);var e=Math.floor(n),c=Math.round((n-e)*100).toString().padStart(2,"0");function u(n){return["","UNO","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE"][n]}function d(n){return["","DIEZ","VEINTE","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"][n]}function k(n){return["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"][n]}function num(n){if(n===0)return"CERO";if(n<10)return u(n);if(n<20)return["DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISIÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE"][n-10];if(n<100){if(n<30)return["VEINTE","VEINTIUNO","VEINTIDÓS","VEINTITRÉS","VEINTICUATRO","VEINTICINCO","VEINTISÉIS","VEINTISIETE","VEINTIOCHO","VEINTINUEVE"][n-20];var dec=Math.floor(n/10),uni=n%10;return d(dec)+(uni?" Y "+u(uni):"")}if(n===100)return"CIEN";if(n<1000)return k(Math.floor(n/100))+(n%100?" "+num(n%100):"");if(n<1e6){var miles=Math.floor(n/1e3),resto=n%1e3,txt=miles===1?"MIL":num(miles)+" MIL";return txt+(resto?" "+num(resto):"")}var mill=Math.floor(n/1e6),restoM=n%1e6,txtM=mill===1?"UN MILLÓN":num(mill)+" MILLONES";return txtM+(restoM?" "+num(restoM):"")}var centInt=parseInt(c,10)||0;return centInt===0?num(e)+" PESOS 00/100 M.N.":num(e)+" PESOS CON "+num(centInt)+" CENTAVOS "+c+"/100 M.N."}W.mxnLetra=mxnLetra;

function cleanupSuffixDupes(suf,keep){var ids=["lic","op","rfc","usr","instOn","base","uadd","disc","inst","instdisc","sub","iva","tot","tr-base","tr-uadd","tr-disc","tr-inst","tr-instdisc","tr-sub","tr-iva","tr-tot","lbl-base","lbl-uadd","lbl-disc","lbl-inst","lbl-instdisc","lbl-sub","lbl-iva","lbl-tot","instLblSTRONG"],seen=0;ids.forEach(p=>{var full=p+suf,nodes=D.querySelectorAll("#"+CSS.escape(full));if(nodes.length>1)nodes.forEach(n=>{if(keep&&keep.contains(n))return;var box=n.closest(".calc-container");box?(box.innerHTML="",box.removeAttribute("data-system-name")):n.remove()});nodes.length&&(seen+=nodes.length)});return seen}
function setCalcCountClass(){var row=$id("calc-row"),sec=$id("calc-secondary"),ter=$id("calc-tertiary"),has2=!!(sec&&sec.querySelector("table")),has3=!!(ter&&ter.querySelector("table")),cols=has3?"3":has2?"2":"1";row&&row.setAttribute("data-cols",cols);[D.documentElement,D.body].forEach(el=>{if(!el)return;el.classList.toggle("has-calc-2",cols==="2");el.classList.toggle("has-calc-3",cols==="3");cols==="3"&&el.classList.remove("has-calc-2")})}
function expSetCalcCols(){setCalcCountClass()}W.expSetCalcCols=expSetCalcCols;
function ensureSecondaryContainer(){var row=$id("calc-row");if(!row){console.warn("No existe #calc-row");return null}var ex=$id("calc-secondary");if(ex)return ex;var sec=D.createElement("div");sec.id="calc-secondary";sec.className="calc-container";sec.setAttribute("aria-label","Segunda calculadora");var primary=$id("calc-primary"),slot=$id("calc-slot-2");primary&&primary.parentNode===row?row.insertBefore(sec,primary.nextSibling):slot&&slot.parentNode===row?row.insertBefore(sec,slot):row.appendChild(sec);return sec}
function showThirdPanel(show){var t=$id("calc-tertiary"),p=$id("add-more-panel");t&&(t.style.display=show?"":"none");p&&(p.style.display=show?"none":"")}
function getSystemList(){if(Array.isArray(W.CATALOG_SISTEMAS)&&W.CATALOG_SISTEMAS.length)return W.CATALOG_SISTEMAS.map(x=>({name:x.name,img:x.img||""}));var all=W.preciosContpaqi||{};return Object.keys(all).map(k=>({name:k,img:""}))}
function paintSystemButtons(wrapId,onPick,exclude){var wrap=$id(wrapId);if(!wrap)return;wrap.innerHTML="";var list=getSystemList();exclude=exclude||[];list.forEach(item=>{if(!item||!item.name)return;if(exclude.indexOf(item.name)!==-1)return;var b=D.createElement("button");b.type="button";b.className="sys-icon";b.setAttribute("data-system",item.name);b.setAttribute("data-sys",item.name);b.dataset.system=item.name;b.dataset.sys=item.name;b.innerHTML=item.img?'<img src="'+item.img+'" alt="">':"";b.addEventListener("click",()=>onPick(item.name));wrap.appendChild(b)})}

/* CSS patch: 2x2 SIEMPRE + usuarios alineado con instalación */
(()=>{var id="calc-inline-patch-v3";if($id(id))return;var st=D.createElement("style");st.id=id;st.textContent=".calc-container form{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;align-items:stretch!important}"+
".calc-container label.field{display:flex!important;flex-direction:column!important;justify-content:center!important}"+
".calc-container label.field.usr{align-self:stretch!important}"+
".calc-container .inst-wrap{display:flex!important;align-self:stretch!important;justify-content:center!important}"+
".calc-container .instalacion-box{width:100%!important;height:100%!important;display:flex!important;align-items:center!important}";D.head.appendChild(st)})();
            
/* FIX: dim instalación cuando OFF */
(()=>{var id="calc-inst-dim-patch";if($id(id))return;var st=D.createElement("style");st.id=id;st.textContent=".inst-wrap input[type=checkbox]:not(:checked)~span{opacity:.65}";D.head.appendChild(st)})();

function createCalculator(container,sistemaName,idSuffix,combinedSelector){if(!container)return;cleanupSuffixDupes(idSuffix,container);container.innerHTML="";container.dataset.systemName=sistemaName;var allPrices=W.preciosContpaqi||{},systemPrices=allPrices[sistemaName];if(!systemPrices){container.innerHTML='<p style="margin:0">Error: faltan precios para <strong>'+sistemaName+"</strong>.</p>";return}
var form=D.createElement("form");form.className="calc-form";
var licenciaLabel=D.createElement("label");licenciaLabel.classList.add("field","lic");licenciaLabel.textContent="Licencia:";var licenciaSel=D.createElement("select");licenciaSel.id="lic"+idSuffix;licenciaSel.innerHTML='<option value="nueva">Nueva</option><option value="renovacion">Renovación</option><option value="tradicional">Tradicional</option>';licenciaLabel.appendChild(licenciaSel);form.appendChild(licenciaLabel);
var opLabel=D.createElement("label");opLabel.className="op-label";opLabel.textContent="Operación:";var opSel=D.createElement("select");opSel.id="op"+idSuffix;opLabel.appendChild(opSel);form.appendChild(opLabel);
var rfcLabel=D.createElement("label");rfcLabel.classList.add("field","rfc");rfcLabel.textContent="Tipo (RFC):";var rfcSel=D.createElement("select");rfcSel.id="rfc"+idSuffix;rfcLabel.appendChild(rfcSel);form.appendChild(rfcLabel);
var userLabel=D.createElement("label");userLabel.classList.add("field","usr");userLabel.textContent="Usuarios:";var userInput=D.createElement("input");userInput.type="number";userInput.id="usr"+idSuffix;userInput.min="1";userInput.value="1";userLabel.appendChild(userInput);form.appendChild(userLabel);
var instWrap=D.createElement("div");instWrap.className="inst-wrap";instWrap.innerHTML='<div class="instalacion-box"><label><input type="checkbox" id="instOn'+idSuffix+'" checked><span><strong id="instLblSTRONG'+idSuffix+'">Instalación (1)</strong><span id="instLblTail'+idSuffix+'">: Instalamos el sistema en tu equipo.</span></span></label></div>';form.appendChild(instWrap);
container.appendChild(form);
var results=D.createElement("div");results.className="calc-results";var table=D.createElement("table");table.className="calc-table";table.innerHTML='<thead><tr><th style="text-align:left">Concepto</th><th>Importe</th></tr></thead><tbody>'+
'<tr id="tr-base'+idSuffix+'"><td id="lbl-base'+idSuffix+'">Precio base</td><td id="base'+idSuffix+'">$0.00</td></tr>'+
'<tr id="tr-uadd'+idSuffix+'"><td id="lbl-uadd'+idSuffix+'">Usuarios adicionales</td><td id="uadd'+idSuffix+'">$0.00</td></tr>'+
'<tr id="tr-disc'+idSuffix+'"><td id="lbl-disc'+idSuffix+'">Descuento (sistema)</td><td id="disc'+idSuffix+'">0% / $0.00</td></tr>'+
'<tr id="tr-inst'+idSuffix+'"><td id="lbl-inst'+idSuffix+'">Instalación</td><td id="inst'+idSuffix+'">$0.00</td></tr>'+
'<tr id="tr-instdisc'+idSuffix+'"><td id="lbl-instdisc'+idSuffix+'"><label style="display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none"><input type="checkbox" id="instdiscOn'+idSuffix+'" checked>Instalación 50% (Si es primer servicio)</label></td><td id="instdisc'+idSuffix+'">$0.00</td></tr>'+
'<tr id="tr-sub'+idSuffix+'"><td id="lbl-sub'+idSuffix+'">Subtotal</td><td id="sub'+idSuffix+'">$0.00</td></tr>'+
'<tr id="tr-iva'+idSuffix+'"><td id="lbl-iva'+idSuffix+'">IVA (16%)</td><td id="iva'+idSuffix+'">$0.00</td></tr>'+
'<tr id="tr-tot'+idSuffix+'"><td id="lbl-tot'+idSuffix+'"><strong>Total</strong></td><td id="tot'+idSuffix+'"><strong>$0.00</strong></td></tr></tbody>';results.appendChild(table);container.appendChild(results);
try{W.expSetCalcCols&&W.expSetCalcCols()}catch(e){}
function instCheckbox(){return $id("instOn"+idSuffix)}
function calcInstallationGross(){var on=instCheckbox();if(!on||!on.checked)return 0;var u=Math.max(1,parseInt(userInput.value||"1",10)||1);return u===1?800:800+(u-1)*750}
function writeZeros(){setText("base"+idSuffix,fmt(0));setText("uadd"+idSuffix,fmt(0));setText("disc"+idSuffix,"0% / "+fmt(0));setText("inst"+idSuffix,fmt(0));setText("instdisc"+idSuffix,fmt(0));setText("sub"+idSuffix,fmt(0));setText("iva"+idSuffix,fmt(0));setHTML("tot"+idSuffix,"<strong>"+fmt(0)+"</strong>");setDisplay("tr-uadd"+idSuffix,"none");setDisplay("tr-disc"+idSuffix,"none");setDisplay("tr-inst"+idSuffix,"none");setDisplay("tr-instdisc"+idSuffix,"none");updateCombinedSummary(combinedSelector);try{setCalcCountClass()}catch(e){}}
function refreshOptions(){var lic=licenciaSel.value;opSel.innerHTML="";rfcSel.innerHTML="";rfcLabel.style.display="inline-block";opLabel.style.setProperty("display",lic==="tradicional"?"block":"none","important");if(lic==="nueva"){opSel.appendChild(new Option("Anual (Nueva)","nueva_anual"));var anual=systemPrices.anual||{};anual.MonoRFC&&rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));anual.MultiRFC&&rfcSel.appendChild(new Option("MultiRFC","MultiRFC"))}else if(lic==="renovacion"){opSel.appendChild(new Option("Renovación anual","renovacion_anual"));var anual2=systemPrices.anual||{};anual2.MonoRFC&&rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));anual2.MultiRFC&&rfcSel.appendChild(new Option("MultiRFC","MultiRFC"))}else{opSel.appendChild(new Option("Actualización (versiones anteriores)","actualizacion"));opSel.appendChild(new Option("Actualización especial (inmediata anterior)","especial"));opSel.appendChild(new Option("Incremento de usuarios","crecimiento_usuario"));var trad=systemPrices.tradicional||{},hasRFC=trad.actualizacion||trad.especial;if(hasRFC){rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));rfcSel.appendChild(new Option("MultiRFC","MultiRFC"))}}
var multi=Array.from(rfcSel.options).find(o=>/multirfc/i.test(o.text));multi&&(rfcSel.value=multi.value);rfcSel.options.length===0&&(rfcLabel.style.display="none");calculateAndRender()}
function calculateAndRender(){var lic=licenciaSel.value,op=opSel.value||"",rfcType=rfcSel.value,usuarios=Math.max(1,parseInt(userInput.value||"1",10)||1),base=0,usuariosAddImporte=0,usuariosExtras=0;
if(lic==="nueva"||lic==="renovacion"){var anual=systemPrices.anual||{},datosLic=anual[rfcType]||null;if(!datosLic){var k=Object.keys(anual||{})[0];k&&(rfcType=k,rfcSel&&rfcSel.value!==k&&(rfcSel.value=k),datosLic=anual[k]||null)}if(!datosLic)return writeZeros();base=Number(lic==="nueva"?(datosLic.precio_base||0):datosLic.renovacion!=null?datosLic.renovacion:(datosLic.precio_base||0));var perUser=Number(datosLic.usuario_en_red!=null?datosLic.usuario_en_red:datosLic.usuario_adicional!=null?datosLic.usuario_adicional:0);usuariosExtras=Math.max(usuarios-1,0);usuariosAddImporte=usuariosExtras*perUser}else{var trad=systemPrices.tradicional||{};if(op==="crecimiento_usuario"){var perUser2=Number((trad.crecimiento_usuario&&trad.crecimiento_usuario.usuario_adicional)||0);base=0;usuariosExtras=Math.max(usuarios-1,0);usuariosAddImporte=usuariosExtras*perUser2}else if(op==="actualizacion"||op==="especial"){var datos=trad[op]||null;if(!datos)return writeZeros();base=Number(datos.precio_base||0);var perUser3=Number(datos.usuario_adicional!=null?datos.usuario_adicional:(trad.crecimiento_usuario&&trad.crecimiento_usuario.usuario_adicional||0));usuariosExtras=Math.max(usuarios-1,0);usuariosAddImporte=usuariosExtras*perUser3}else return writeZeros()}
var subtotalSistemas=base+usuariosAddImporte,discountPct=0,hasPackage=safeHasTableBySel("#calc-secondary")||safeHasTableBySel("#calc-tertiary");hasPackage&&sistemaName.indexOf("XML en Línea")===-1&&(discountPct=.15);
var discountAmt=round2(subtotalSistemas*discountPct),afterDiscount=round2(subtotalSistemas-discountAmt),instGross=calcInstallationGross(),instDiscount=round2(instGross*.5),instNet=round2(instGross-instDiscount);
var instOn=instCheckbox(),instCount=instOn&&instOn.checked?usuarios:0,instWord=instCount===1?"Instalación":"Instalaciones",instLabel=instCount>0?instWord+" ("+instCount+")":"Instalación",inst50Label="Descuento por primer servicio ("+(instCount===1?"instalación":"instalaciones")+" 50%)",subLabel=instCount>0?("Subtotal (sistema + "+(instCount===1?"instalación":"instalaciones")+")"):"Subtotal (sistema)";
 var instOn=instCheckbox(),instCount=instOn&&instOn.checked?usuarios:0,instWord=instCount===1?"Instalación":"Instalaciones",instLabel=instCount>0?instWord+" ("+instCount+")":"Instalación",subLabel="Subtotal";
var elLblInst=$id("lbl-inst"+idSuffix);elLblInst&&(elLblInst.textContent=instLabel);
var elLblSub=$id("lbl-sub"+idSuffix);elLblSub&&(elLblSub.textContent=subLabel);
var strong=$id("instLblSTRONG"+idSuffix),tailEl=$id("instLblTail"+idSuffix),nInst=Math.max(1,usuarios);strong&&(strong.textContent="Instalación ("+nInst+")");tailEl&&(tailEl.textContent=nInst===1?": Instalamos el sistema en tu equipo.":": Instalamos el sistema en tus equipos.");
var showInst=!!(instOn&&instOn.checked),baseImponible=round2(afterDiscount+instNet),iva=round2(baseImponible*.16),total=round2(baseImponible+iva);
setText("base"+idSuffix,fmt(base));setText("uadd"+idSuffix,fmt(usuariosAddImporte)+(usuariosExtras>0?" ("+usuariosExtras+" "+(usuariosExtras===1?"extra":"extras")+")":""));setText("disc"+idSuffix,pct(discountPct)+" / "+fmt(discountAmt));setText("inst"+idSuffix,fmt(instGross));setText("instdisc"+idSuffix,instGross>0?"− "+fmt(instDiscount):fmt(0));setText("sub"+idSuffix,fmt(baseImponible));setText("iva"+idSuffix,fmt(iva));setHTML("tot"+idSuffix,"<strong>"+fmt(total)+"</strong>");
setDisplay("tr-uadd"+idSuffix,usuariosExtras>0?"":"none");setDisplay("tr-disc"+idSuffix,discountPct>0?"":"none");setDisplay("tr-inst"+idSuffix,showInst?"":"none");setDisplay("tr-instdisc"+idSuffix,showInst?"":"none");
updateCombinedSummary(combinedSelector);try{setCalcCountClass()}catch(e){}}
licenciaSel.addEventListener("change",refreshOptions);
opSel.addEventListener("change",()=>{var lic=licenciaSel.value,op=opSel.value;if(lic==="tradicional"&&op==="crecimiento_usuario")rfcLabel.style.display="none";else{if(rfcSel.options.length===0){rfcSel.innerHTML="";if(lic==="nueva"||lic==="renovacion"){var anual=systemPrices.anual||{};anual.MonoRFC&&rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));anual.MultiRFC&&rfcSel.appendChild(new Option("MultiRFC","MultiRFC"))}else{rfcSel.appendChild(new Option("MonoRFC","MonoRFC"));rfcSel.appendChild(new Option("MultiRFC","MultiRFC"))}var m=Array.from(rfcSel.options).find(o=>/multirfc/i.test(o.text));m&&(rfcSel.value=m.value)}rfcLabel.style.display="inline-block"}calculateAndRender()});
rfcSel.addEventListener("change",calculateAndRender);userInput.addEventListener("change",calculateAndRender);var chk=$id("instOn"+idSuffix);chk&&chk.addEventListener("change",calculateAndRender);var chkDisc=$id("instdiscOn"+idSuffix);chkDisc&&chkDisc.addEventListener("change",calculateAndRender);W.addEventListener("calc-recompute",calculateAndRender);
refreshOptions()}

function updateCombinedSummary(sel){var wrap=qs(sel||"#combined-wrap");if(!wrap){setCalcCountClass();return}var tbody=$id("combined-table-body");if(!tbody){console.warn("Falta #combined-table-body");wrap.hidden=!0;setCalcCountClass();return}
function getNum(id){var el=$id(id);if(!el)return 0;var s=(el.textContent||"").trim();s=s.replace(/\u2212/g,"-").replace(/\s/g,"").replace(/[^\d.,-]/g,"").replace(/,/g,"");var n=parseFloat(s);return isNaN(n)?0:n}
var e1=!!$id("tot1"),e2=!!$id("tot2"),e3=!!$id("tot3");tbody.innerHTML="";
var n1=($id("calc-primary")&&$id("calc-primary").dataset?$id("calc-primary").dataset.systemName:"")||"Sistema 1",n2=($id("calc-secondary")&&$id("calc-secondary").dataset?$id("calc-secondary").dataset.systemName:"")||"Sistema 2",n3=($id("calc-tertiary")&&$id("calc-tertiary").dataset?$id("calc-tertiary").dataset.systemName:"")||"Sistema 3";
function instCountFor(suf){var chk=$id("instOn"+suf);if(!chk||!chk.checked)return 0;var u=$id("usr"+suf);return Math.max(1,parseInt((u&&u.value)||"1",10)||1)}
function instLabelFor(suf){var n=instCountFor(suf);return n>0?(n===1?"instalación":"instalaciones"):""}
var filas=[],totales=[],ivaTotal=0;
e1&&(filas.push({label:"Subtotal "+n1+(instLabelFor("1")?(" e "+instLabelFor("1")):""),val:getNum("sub1")}),totales.push(getNum("tot1")),ivaTotal+=getNum("iva1"));
e2&&(filas.push({label:"Subtotal "+n2+" e "+instLabelFor("2"),val:getNum("sub2")}),totales.push(getNum("tot2")),ivaTotal+=getNum("iva2"));
e3&&(filas.push({label:"Subtotal "+n3+" e "+instLabelFor("3"),val:getNum("sub3")}),totales.push(getNum("tot3")),ivaTotal+=getNum("iva3"));
if(!totales.length){wrap.hidden=!0;setCalcCountClass();return}
var totalCombinado=round2(totales.reduce((a,b)=>a+b,0));ivaTotal=round2(ivaTotal);
filas.forEach(f=>{var tr=D.createElement("tr");tr.innerHTML="<td>"+f.label+"</td><td>"+fmt(f.val)+"</td>";tbody.appendChild(tr)});
var trI=D.createElement("tr");trI.innerHTML="<td>IVA total</td><td>"+fmt(ivaTotal)+"</td>";tbody.appendChild(trI);
var trT=D.createElement("tr");trT.innerHTML='<td><strong>Total</strong></td><td><strong>'+fmt(totalCombinado)+'</strong><div style="font-size:12px;opacity:.85;margin-top:6px">'+(W.mxnLetra?mxnLetra(totalCombinado):"")+"</div></td>";tbody.appendChild(trT);
wrap.hidden=!1;setCalcCountClass()}

function initCalculadora(opts){opts=opts||{};var sys=opts.systemName,primarySel=opts.primarySelector||"#calc-primary",combinedSel=opts.combinedSelector||"#combined-wrap",el=qs(primarySel);if(!el){console.warn("No existe contenedor primario:",primarySel);return}createCalculator(el,sys,"1",combinedSel);
var exclude=[sys];paintSystemButtons("icons-sec-sys",name=>{W.CalculadoraContpaqi.setSecondarySystem(name,{combinedSelector:combinedSel})},exclude);
setCalcCountClass();setTimeout(()=>{recomputeAll()},0)}
function setSecondarySystem(name,opts){opts=opts||{};var combinedSel=opts.combinedSelector||"#combined-wrap",sec=ensureSecondaryContainer();if(!sec){console.warn("No se pudo montar #calc-secondary");return}createCalculator(sec,name,"2",combinedSel);
var addPanel=$id("add-more-panel");addPanel&&(addPanel.style.display="");showThirdPanel(!1);
var exclude=[($id("calc-primary")&&$id("calc-primary").dataset?$id("calc-primary").dataset.systemName:"")||"",name].filter(Boolean);
paintSystemButtons("icons-third-sys",n3=>{W.CalculadoraContpaqi.setTertiarySystem(n3,{combinedSelector:combinedSel})},exclude);
setCalcCountClass();recomputeAll()}
function setTertiarySystem(name,opts){opts=opts||{};var combinedSel=opts.combinedSelector||"#combined-wrap",el=$id("calc-tertiary");if(!el){console.warn("No existe #calc-tertiary");return}el.style.display="";createCalculator(el,name,"3",combinedSel);showThirdPanel(!0);setCalcCountClass();recomputeAll()}
W.CalculadoraContpaqi={init:initCalculadora,setSecondarySystem,setTertiarySystem,updateCombinedSummary};

function autoInitOnce(){if(W.__EXP_CALC_AUTOINIT_DONE__)return;W.__EXP_CALC_AUTOINIT_DONE__=1;var app=$id("app"),sys=app&&app.dataset?app.dataset.system:null;sys&&qs("#calc-primary")&&W.CalculadoraContpaqi.init({systemName:sys});setCalcCountClass()}
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",autoInitOnce,{once:!0}):autoInitOnce();
/* HEADERS OWNER (logo centrado) */
(()=>{var lock=0,logoOf=n=>{for(var c=window.CATALOG_SISTEMAS||[],i=0;i<c.length;i++)if(c[i]&&c[i].name===n)return c[i].imgLogo||"";return""},head=el=>{if(!el)return null;var h=el.querySelector(".calc-head");if(h)return h;h=document.createElement("div");h.className="calc-head";h.innerHTML='<div class="calc-head-row" style="display:flex;justify-content:center;align-items:center"><img class="calc-syslogo" alt="" decoding="async"></div>';el.insertBefore(h,el.firstChild);return h},setCalcHead=(el,name)=>{var h=head(el);if(!h)return;var img=h.querySelector(".calc-syslogo"),src=logoOf(name)||"";if(src){img.src=src;img.alt=name||"";img.style.cssText="height:68px;width:auto;max-width:260px;display:block;margin:0 auto"}else img.style.display="none"},run=()=>{if(lock)return;lock=1;try{var p=document.getElementById("calc-primary"),s=document.getElementById("calc-secondary"),t=document.getElementById("calc-tertiary");p&&setCalcHead(p,p.dataset.systemName||"");s&&s.querySelector("table")&&setCalcHead(s,s.dataset.systemName||"");t&&t.style.display!=="none"&&t.querySelector("table")&&setCalcHead(t,t.dataset.systemName||"")}finally{lock=0}},rq=0,runQ=()=>{rq||(rq=requestAnimationFrame(()=>{rq=0;run()}))};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",runQ,{once:!0}):runQ();window.addEventListener("calc-render",runQ,{passive:!0});window.addEventListener("pageshow",runQ,{passive:!0})})();

/* CIERRE ÚNICO CORRECTO */
})(); /* <-- cierra el IIFE principal de calculadora.js */
} /* <-- cierra el else */


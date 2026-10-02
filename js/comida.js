/* Pestaña "Comida": la pantalla de la despensa.
   Los cálculos están en despensa.js (objeto Despensa). Aquí solo se dibuja y se responde a los botones.
   Usa lo que app.js comparte en window.MQ.app (estado, guardar, borrar, crear un gasto…). */
(function () {
"use strict";
var A = window.MQ.app, $ = A.$, esc = A.esc, money = A.money, S = A.S;
// Comidas que salen de la despensa: 21 a la semana (3 diarias) menos los almuerzos que hace fuera de casa.
function almuerzosFuera() { var v = S.P ? parseInt(S.P.almuerzos_fuera, 10) : 0; return isNaN(v) ? 0 : Math.max(0, Math.min(7, v)); }
function comidasPorDia() { return (21 - almuerzosFuera()) / 7; }
function textoRitmo() { var f = almuerzosFuera(); return f === 0 ? "a 3 comidas diarias en casa" : (f === 7 ? "sin contar el almuerzo, que hace fuera de casa" : "contando " + f + (f === 1 ? " almuerzo" : " almuerzos") + " por semana fuera de casa"); }
var h = new Date().getHours(), momento = h < 10 ? "desayuno" : (h < 15 ? "almuerzo" : "comida");
var editando = null, tipo = "contable";

function dec(v) { var x = parseFloat(String(v).replace(",", ".")); return isNaN(x) || x < 0 ? 0 : Math.round(x * 100) / 100; }
function saldoQuincena() { var e = A.estadoQ(A.quincenaDe(A.hoyISO())); return e ? e.saldo : null; }
function porNombre(a, b) { return a.nombre.localeCompare(b.nombre); }

/* ---------- dibujar ---------- */
function render() {
  var items = S.despensa || [], r = Despensa.resumen(items, comidasPorDia()), saldo = saldoQuincena();
  if (document.activeElement !== $("cFuera")) $("cFuera").value = String(almuerzosFuera());
  $("cFuera").disabled = !S.P;
  // resumen
  if (!items.length) { $("cBig").textContent = "–"; $("cSub").textContent = "Agregue sus alimentos para ver el estimado."; }
  else {
    $("cBig").textContent = r.comidas + (r.comidas === 1 ? " comida" : " comidas");
    var falta = r.limita === "proteina" ? " Le limita la proteína." : (r.limita === "base" ? " Le limita la base (arroz, pasta, pan)." : "");
    $("cSub").textContent = "Unos " + Despensa.cant(r.dias) + " día(s), " + textoRitmo() + "." + falta + (saldo != null ? " Le quedan " + money(saldo) + " de la quincena." : "");
  }
  // avisos de lo que se está acabando (aquí y en la pestaña Hoy)
  var txt = r.alertas.length ? "Recuerde que se le está acabando: " + r.alertas.map(function (a) { return a.nombre.toLowerCase(); }).join(", ") + "." : "";
  $("cAlertas").hidden = !txt; $("cAlertas").textContent = txt;
  $("notaDespensa").hidden = !txt; $("notaDespensa").textContent = txt + " Ver despensa ›";
  // recetas
  Array.prototype.forEach.call($("cMomento").children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === momento)); });
  var R = $("cRecetas");
  if (!items.length) R.innerHTML = '<div class="empty">Agregue alimentos a la despensa para ver recetas.</div>';
  else {
    var x = Despensa.recetas(items, momento), html = "";
    if (x.listas.length) html += '<div class="subt">Con lo que tiene</div>' + x.listas.map(function (a) {
      return '<div class="receta"><b>' + esc(a.receta.nombre) + '</b><p>' + esc(a.receta.como) + ' Le alcanza para ' + a.veces + (a.veces === 1 ? ' vez.' : ' veces.') + '</p>' +
        '<button class="ghost" type="button" data-cocinar="' + esc(a.receta.nombre) + '">La preparé: descontar</button></div>'; }).join("");
    else html += '<div class="empty">Con lo que tiene no sale ninguna receta del recetario para este momento.</div>';
    if (x.casi.length) html += '<div class="subt">Comprando una o dos cosas</div>' + x.casi.slice(0, 5).map(function (a) {
      var costo = 0, sin = false; a.faltan.forEach(function (f) { if (f.precio) costo += f.precio * Math.max(1, Math.ceil(f.necesita - f.tiene)); else sin = true; });
      var precio = sin ? "" : " Comprarlo cuesta unos " + money(costo) + (saldo != null ? (costo <= saldo ? ", y le alcanza." : ", y no le alcanza con lo que queda de la quincena.") : ".");
      return '<div class="receta"><b>' + esc(a.receta.nombre) + '</b><p>Le falta: ' + esc(a.faltan.map(function (f) { return f.nombre.toLowerCase(); }).join(" y ")) + '.' + esc(precio) + '</p></div>'; }).join("");
    R.innerHTML = html;
  }
  // lista de la despensa: primero lo que se está acabando
  var L = $("cLista");
  if (!items.length) L.innerHTML = '<div class="empty">Aún no ha agregado alimentos.</div>';
  else L.innerHTML = items.slice().sort(function (a, b) { return (Despensa.enAlerta(b) - Despensa.enAlerta(a)) || porNombre(a, b); }).map(function (it) {
    return '<div class="item' + (Despensa.enAlerta(it) ? ' alerta' : '') + '"><div class="tx"><b>' + esc(it.nombre) + '</b><span>' +
      (Despensa.enAlerta(it) ? 'Se está acabando · ' : '') + (it.precio ? money(it.precio) + ' c/u · ' : '') + '<button class="del" type="button" data-editar="' + esc(it.id) + '">Editar</button></span></div>' +
      '<button class="mini" type="button" data-menos="' + esc(it.id) + '" aria-label="Quitar uno de ' + esc(it.nombre) + '">−</button>' +
      '<span class="qty num">' + esc(Despensa.textoCantidad(it)) + '</span>' +
      '<button class="mini" type="button" data-mas="' + esc(it.id) + '" aria-label="Sumar uno a ' + esc(it.nombre) + '">+</button></div>'; }).join("");
  // selector de compra
  var sel = $("coItem"), ops = items.slice().sort(porNombre).map(function (it) { return it.id + "|" + it.nombre; }).join("\n");
  if (sel.dataset.ops !== ops) { var prev = sel.value; sel.innerHTML = items.slice().sort(porNombre).map(function (it) { return '<option value="' + esc(it.id) + '">' + esc(it.nombre) + '</option>'; }).join(""); sel.dataset.ops = ops; if (prev) sel.value = prev; }
  // lista de compras con presupuesto
  var lc = Despensa.listaCompras(items), C = $("cCompras");
  if (!lc.lista.length) C.innerHTML = '<div class="empty">No le falta nada por ahora.</div>';
  else {
    var pie = '<div class="kv tot"><span>Costo estimado</span><span class="num">' + money(lc.total) + '</span></div>';
    if (lc.sinPrecio) pie += '<p class="small muted">' + lc.sinPrecio + ' producto(s) no tienen precio registrado y no están en la suma. El precio se guarda al registrar una compra.</p>';
    if (saldo != null) pie += '<div class="note ' + (lc.total <= saldo ? "ok" : "bad") + '" style="margin-top:8px">' + (lc.total <= saldo ?
      "Le alcanza: le quedan " + money(saldo) + " de la quincena y después de esta compra quedaría en " + money(saldo - lc.total) + "." :
      "No le alcanza: le quedan " + money(saldo) + " de la quincena. Priorice lo más necesario.") + '</div>';
    C.innerHTML = lc.lista.map(function (c) { return '<div class="kv"><span>' + esc(c.nombre) + ' · ' + Despensa.cant(c.comprar) + ' ' + esc(Despensa.unidadTxt(c.unidad, c.comprar)) + '</span><span class="num">' + (c.sinPrecio ? "sin precio" : money(c.costo)) + '</span></div>'; }).join("") + pie;
  }
}

/* ---------- guardar cambios ---------- */
function ponerEnMemoria(it) { var i = S.despensa.findIndex(function (x) { return x.id === it.id; }); if (i >= 0) S.despensa[i] = it; else S.despensa.push(it); }
function guardarAlimento(it) { return A.guardar("despensa", it).then(function () { ponerEnMemoria(it); }); }
function buscar(id) { return (S.despensa || []).filter(function (x) { return x.id === id; })[0]; }
function ajustar(id, paso) {
  var it = buscar(id); if (!it) return;
  var c = Object.assign({}, it);
  c.cantidad = it.tipo === "nivel" ? Math.max(0, Math.min(3, Math.round(it.cantidad) + paso)) : Math.max(0, Math.round((it.cantidad + paso) * 100) / 100);
  guardarAlimento(c).then(A.render).catch(function () {});
}

/* ---------- formulario de alimento ---------- */
function mostrarTipo(t) { tipo = t; Array.prototype.forEach.call($("aliTipo").children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === t)); });
  $("aliContable").hidden = (t === "nivel"); $("aliNivelBox").hidden = (t !== "nivel"); }
function limpiarForm() { editando = null; $("fAli").reset(); mostrarTipo("contable"); $("cFormT").textContent = "Agregar un alimento"; $("aliBtn").textContent = "Guardar alimento";
  $("aliCancelar").hidden = true; $("aliQuitar").hidden = true; $("aliQuitar").classList.remove("sure"); $("aliQuitar").textContent = "Quitar de la despensa"; }
function cargarForm(it) { editando = it.id; $("aliNombre").value = it.nombre; mostrarTipo(it.tipo || "contable");
  $("aliCant").value = Despensa.cant(it.cantidad); $("aliUnidad").value = it.unidad || ""; $("aliMin").value = Despensa.cant(it.minimo); $("aliPrecio").value = it.precio ? money(it.precio) : "";
  $("aliNivel").value = String(Math.round(it.cantidad)); $("aliRol").value = it.rol || "otro"; $("aliRinde").value = it.rinde ? Despensa.cant(it.rinde) : "";
  $("cFormT").textContent = "Editar " + it.nombre; $("aliBtn").textContent = "Guardar cambios"; $("aliCancelar").hidden = false; $("aliQuitar").hidden = false;
  $("fAli").scrollIntoView({ block: "center" }); }
A.segmento("aliTipo", mostrarTipo);
A.fmtInput($("aliPrecio")); A.fmtInput($("coValor"));
$("cCatalogo").innerHTML = Despensa.catalogo().map(function (c) { return '<option value="' + esc(c.nombre) + '">'; }).join("");
// Al escribir un alimento conocido se llenan solos la unidad, el mínimo y cuánto rinde.
$("aliNombre").addEventListener("change", function () { var s = Despensa.sugerido(this.value); if (!s || editando) return;
  mostrarTipo(s.tipo); $("aliUnidad").value = s.unidad; $("aliMin").value = Despensa.cant(s.minimo); $("aliRol").value = s.rol; $("aliRinde").value = s.rinde ? Despensa.cant(s.rinde) : ""; });
$("fAli").addEventListener("submit", function (e) { e.preventDefault(); var msg = $("aliMsg"), nombre = $("aliNombre").value.trim(); if (!nombre) return;
  var clave = Despensa.clave(nombre), previo = editando ? buscar(editando) : null;
  if (!previo && (S.despensa || []).some(function (x) { return (x.clave || Despensa.clave(x.nombre)) === clave; })) { msg.textContent = "Ese alimento ya está en la despensa. Use Editar o los botones + y −."; return; }
  var it = { id: previo ? previo.id : A.nuevoId(), nombre: nombre, clave: clave, tipo: tipo, rol: $("aliRol").value, rinde: dec($("aliRinde").value),
    cantidad: tipo === "nivel" ? parseInt($("aliNivel").value, 10) : dec($("aliCant").value), unidad: tipo === "nivel" ? "" : ($("aliUnidad").value.trim() || "unidades"),
    minimo: tipo === "nivel" ? 1 : dec($("aliMin").value), precio: tipo === "nivel" ? (previo ? previo.precio || 0 : 0) : A.num($("aliPrecio").value) };
  var btn = $("aliBtn"); btn.disabled = true;
  guardarAlimento(it).then(function () { limpiarForm(); msg.textContent = "Guardado: " + nombre + "."; A.render(); })
    .catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }).then(function () { btn.disabled = false; });
});
$("aliCancelar").addEventListener("click", limpiarForm);
$("aliQuitar").addEventListener("click", function () { var b = this, id = editando; if (!id) return;
  if (!b.classList.contains("sure")) { b.classList.add("sure"); b.textContent = "¿Seguro? Quitar"; return; }
  A.eliminar("despensa", id).then(function () { S.despensa = S.despensa.filter(function (x) { return x.id !== id; }); limpiarForm(); A.render(); }).catch(function () {});
});

/* ---------- compra: suma a la despensa y anota el gasto ---------- */
$("fCompra").addEventListener("submit", function (e) { e.preventDefault(); var msg = $("coMsg"), it = buscar($("coItem").value);
  if (!it) { msg.textContent = "Primero agregue el alimento a la despensa."; return; }
  var cantidad = dec($("coCant").value), valor = A.num($("coValor").value);
  if (it.tipo !== "nivel" && !cantidad) { msg.textContent = "Escriba cuánto compró."; return; }
  var c = Object.assign({}, it);
  if (it.tipo === "nivel") c.cantidad = 3; else { c.cantidad = Math.round((it.cantidad + cantidad) * 100) / 100; if (valor) c.precio = Math.round(valor / cantidad); }
  var btn = $("coBtn"); btn.disabled = true;
  guardarAlimento(c).then(function () { return valor ? A.nuevoGasto({ fecha: A.hoyISO(), categoria: "Mercado", descripcion: "Compra: " + it.nombre, valor: valor }) : null; })
    .then(function () { $("coCant").value = ""; $("coValor").value = ""; msg.textContent = "Listo: " + it.nombre + " quedó en " + Despensa.textoCantidad(c) + (valor ? " y se anotó un gasto de " + money(valor) + "." : "."); A.render(); })
    .catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }).then(function () { btn.disabled = false; });
});

/* ---------- botones de la lista y de las recetas ---------- */
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-mas],[data-menos],[data-editar],[data-cocinar]"); if (!b) return;
  if (b.dataset.mas) ajustar(b.dataset.mas, 1);
  else if (b.dataset.menos) ajustar(b.dataset.menos, -1);
  else if (b.dataset.editar) { var it = buscar(b.dataset.editar); if (it) cargarForm(it); }
  else if (b.dataset.cocinar) {
    var rec = Despensa.RECETAS.filter(function (r) { return r.nombre === b.dataset.cocinar; })[0]; if (!rec) return;
    b.disabled = true;
    Promise.all(Despensa.cocinar(S.despensa, rec).map(guardarAlimento)).then(function () { $("cRecMsg").textContent = "Descontado de la despensa: " + rec.nombre + "."; A.render(); }).catch(function () { b.disabled = false; });
  }
});
A.segmento("cMomento", function (v) { momento = v; render(); });
// Cuántos días almuerza fuera: se guarda con los datos del presupuesto para que también se sincronice.
$("cFuera").addEventListener("change", function () { if (!S.P) return; var msg = $("cFueraMsg"), P = JSON.parse(JSON.stringify(S.P)); P.almuerzos_fuera = parseInt(this.value, 10) || 0;
  A.guardarDatos(P).then(function () { msg.textContent = "Guardado. El estimado de días ya lo tiene en cuenta."; }).catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }); });
$("notaDespensa").addEventListener("click", function () { A.irA("comida"); });

/* ---------- texto para preguntarle a Claude ---------- */
function lineasDespensa() {
  var items = (S.despensa || []).slice().sort(porNombre); if (!items.length) return [];
  var r = Despensa.resumen(items, comidasPorDia()), L = ["", "MI DESPENSA (lo que tengo en la cocina)"];
  items.forEach(function (it) { L.push("- " + it.nombre + ": " + Despensa.textoCantidad(it) + (Despensa.enAlerta(it) ? " (se está acabando)" : "") + (it.precio ? ", precio aproximado " + money(it.precio) + " c/u" : "")); });
  L.push("Estimado de la app: me alcanza para unas " + r.comidas + " comidas completas, cerca de " + Despensa.cant(r.dias) + " día(s).");
  if (almuerzosFuera()) L.push("Almuerzo fuera de casa " + (almuerzosFuera() === 7 ? "todos los días" : almuerzosFuera() + " día(s) a la semana") + ", así que esos almuerzos no salen de la despensa.");
  return L;
}
window.MQ.resumenExtra = lineasDespensa;
$("cCopiar").addEventListener("click", function () {
  var msg = $("cCopMsg"), ta = $("cCopTxt"), L = lineasDespensa();
  if (!L.length) { msg.textContent = "Primero agregue alimentos a la despensa."; return; }
  var hoy = A.hoyISO(), q = A.quincenaDe(hoy), sig = A.siguientePago(q), saldo = saldoQuincena(), faltan = Math.max(1, A.dias(hoy, sig));
  var txt = ["Vivo solo y cocino para una persona. Hoy es " + A.corto(hoy) + " (pesos colombianos)."].concat(L);
  if (saldo != null) txt.push("", "MI PRESUPUESTO", "- Me quedan " + money(saldo) + " para comida, transporte y todo lo demás hasta el pago del " + A.corto(sig) + " (" + faltan + " día(s)).");
  txt.push("", "Con esto, dime: 1) qué puedo cocinar hoy de desayuno, almuerzo y comida usando lo que tengo; 2) qué debería comprar, con cantidades y costo aproximado, para que la comida me alcance hasta el próximo pago sin pasarme del presupuesto; 3) un menú sencillo para esos días.");
  txt = txt.join("\n"); ta.value = txt;
  var listo = function () { msg.textContent = "Copiado. Péguelo en un chat con Claude."; };
  var manual = function () { ta.hidden = false; ta.focus(); ta.select(); msg.textContent = "Mantenga presionado el texto y elija Copiar."; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(listo, manual); else manual();
});

A.registrarRender(render);
render();
})();

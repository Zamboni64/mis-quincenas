/* Sección "Mis comidas" (pestañas Despensa, Recetas y Compras).
   Los cálculos están en despensa.js (objeto Despensa). Aquí solo se dibuja y se responde a los botones.
   Usa lo que app.js comparte en window.MQ.app (estado, guardar, borrar, crear un gasto…). */
(function () {
"use strict";
var A = window.MQ.app, $ = A.$, esc = A.esc, money = A.money, S = A.S;
/* Almuerzos fuera de casa: se elige para la semana en curso (lunes a domingo), porque unas semanas almuerza fuera y otras no.
   Se guarda con los datos del presupuesto como { semana: lunes de esa semana, dias: N }; al cambiar de semana deja de valer. */
function fechaLocal(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function diaSemana() { return (fechaLocal(A.hoyISO()).getDay() + 6) % 7; } // lunes = 0 … domingo = 6
function lunes() { var d = fechaLocal(A.hoyISO()); d.setDate(d.getDate() - diaSemana());
  return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function ajusteSemana() { var x = S.P && S.P.almuerzos_semana; return x && typeof x === "object" ? x : null; }
function almuerzosFuera() { var x = ajusteSemana(); if (!x || x.semana !== lunes()) return 0; var v = parseInt(x.dias, 10); return isNaN(v) ? 0 : Math.max(0, Math.min(7, v)); }
function semanaSinElegir() { var x = ajusteSemana(); return !x || x.semana !== lunes(); }
function diasQueDura(comidas) { return Despensa.diasQueDura(comidas, almuerzosFuera(), 7 - diaSemana()); }
function textoRitmo() { var f = almuerzosFuera(); return f === 0 ? "a 3 comidas diarias en casa" : (f === 7 ? "sin contar los almuerzos de esta semana, que hace fuera de casa" : "contando " + f + (f === 1 ? " almuerzo" : " almuerzos") + " fuera de casa esta semana"); }
var h = new Date().getHours(), momento = h < 10 ? "desayuno" : (h < 15 ? "almuerzo" : "comida");
var editando = null, tipo = "contable", avisoGuardado = false, ultimoSugerido = "";

function dec(v) { var x = parseFloat(String(v).replace(",", ".")); return isNaN(x) || x < 0 ? 0 : Math.round(x * 100) / 100; }
function saldoQuincena() { var e = A.estadoQ(A.quincenaDe(A.hoyISO())); return e ? e.saldo : null; }
function porNombre(a, b) { return a.nombre.localeCompare(b.nombre); }
// Las recetas guardadas (las que vienen de Claude), en el formato del recetario. Las que no tienen ingredientes reconocibles no se sugieren.
function propias() { return (S.recetas || []).map(function (r) { return Despensa.interna(r, S.despensa || []); }).filter(function (r) { return Object.keys(r.ing).length; }); }

/* ---------- dibujar ---------- */
function render() {
  var items = S.despensa || [], r = Despensa.resumen(items, 3), saldo = saldoQuincena();
  if (document.activeElement !== $("cFuera")) $("cFuera").value = String(almuerzosFuera());
  $("cFuera").disabled = !S.P;
  if (!avisoGuardado) $("cFueraMsg").textContent = (ajusteSemana() && semanaSinElegir() ? "Empezó una semana nueva: elija si esta semana almuerza fuera. " : "") + "Vale solo para esta semana, hasta el domingo. El lunes vuelve a «Ninguno» para que elija de nuevo.";
  // resumen
  if (!items.length) { $("cBig").textContent = "–"; $("cSub").textContent = "Agregue sus alimentos para ver el estimado."; }
  else {
    $("cBig").textContent = r.comidas + (r.comidas === 1 ? " comida" : " comidas");
    var falta = r.limita === "proteina" ? " Le limita la proteína." : (r.limita === "base" ? " Le limita la base (arroz, pasta, pan)." : "");
    $("cSub").textContent = "Unos " + Despensa.cant(diasQueDura(r.comidas)) + " día(s), " + textoRitmo() + "." + falta + (saldo != null ? " Le quedan " + money(saldo) + " de la quincena." : "");
  }
  // avisos de lo que se está acabando (aquí y en la pestaña Hoy)
  var txt = r.alertas.length ? "Recuerde que se le está acabando: " + r.alertas.map(function (a) { return a.nombre.toLowerCase(); }).join(", ") + "." : "";
  $("cAlertas").hidden = !txt; $("cAlertas").textContent = txt;
  $("notaDespensa").hidden = !txt; $("notaDespensa").textContent = txt + " Ver despensa ›";
  $("badgeDespensa").hidden = !r.alertas.length; $("badgeDespensa").textContent = r.alertas.length;
  // recetas
  Array.prototype.forEach.call($("cMomento").children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === momento)); });
  var R = $("cRecetas");
  if (!items.length) R.innerHTML = '<div class="empty">Agregue alimentos a la despensa para ver recetas.</div>';
  else {
    var x = Despensa.recetas(items, momento, propias()), html = "";
    if (x.listas.length) html += '<div class="subt">Con lo que tiene</div>' + x.listas.map(function (a) {
      var como = a.receta.propia && a.receta.como.length > 170 ? a.receta.como.slice(0, 170) + "… (completa en Mis recetas)" : a.receta.como;
      return '<div class="receta"><b>' + esc(a.receta.nombre) + '</b><p>' + esc(como) + (isFinite(a.veces) ? ' Le alcanza para ' + a.veces + (a.veces === 1 ? ' vez.' : ' veces.') : '') + '</p>' +
        '<button class="ghost" type="button" data-cocinar="' + esc(a.receta.nombre) + '">La preparé: descontar</button></div>'; }).join("");
    else html += '<div class="empty">Con lo que tiene no sale ninguna receta del recetario para este momento.</div>';
    if (x.casi.length) html += '<div class="subt">Comprando una o dos cosas</div>' + x.casi.slice(0, 5).map(function (a) {
      var costo = 0, sin = false; a.faltan.forEach(function (f) { if (f.precio) costo += f.precio * Math.max(1, Math.ceil(f.necesita - f.tiene)); else sin = true; });
      var precio = sin ? "" : " Comprarlo cuesta unos " + money(costo) + (saldo != null ? (costo <= saldo ? ", y le alcanza." : ", y no le alcanza con lo que queda de la quincena.") : ".");
      return '<div class="receta"><b>' + esc(a.receta.nombre) + '</b><p>Le falta: ' + esc(a.faltan.map(function (f) { return f.nombre.toLowerCase(); }).join(" y ")) + '.' + esc(precio) + '</p></div>'; }).join("");
    var sin = Despensa.sinReceta(items, propias());
    if (sin.length) html += '<p class="small muted" style="margin-top:10px">Aún no hay recetas con: ' + esc(sin.map(function (i) { return i.nombre.toLowerCase(); }).join(", ")) +
      '. Pídale el menú a Claude desde la pestaña Menú y las recetas que le dé quedan guardadas aquí.</p>';
    R.innerHTML = html;
  }
  // lista de la despensa: primero lo que se está acabando
  var L = $("cLista");
  if (!items.length) L.innerHTML = '<div class="empty">Aún no ha agregado alimentos.</div>';
  else L.innerHTML = items.slice().sort(function (a, b) { return (Despensa.enAlerta(b) - Despensa.enAlerta(a)) || porNombre(a, b); }).map(function (it) {
    return '<div class="item' + (Despensa.enAlerta(it) ? ' alerta' : '') + '"><div class="tx"><b>' + esc(it.nombre) + '</b><span>' +
      (Despensa.enAlerta(it) ? 'Se está acabando · ' : '') + (it.precio ? money(it.precio) + ' c/u · ' : '') + '<button class="del" type="button" data-editar="' + esc(it.id) + '">Editar</button></span></div>' +
      '<button class="mini" type="button" data-menos="' + esc(it.id) + '" aria-label="Menos ' + esc(it.nombre) + '">−</button>' +
      '<span class="qty num">' + esc(Despensa.textoUnidades(it)) + (Despensa.textoNivel(it) ? '<small>' + esc(Despensa.textoNivel(it)) + '</small>' : '') + '</span>' +
      '<button class="mini" type="button" data-mas="' + esc(it.id) + '" aria-label="Más ' + esc(it.nombre) + '">+</button></div>'; }).join("");
  // selector de compra
  var sel = $("coItem"), ops = items.slice().sort(porNombre).map(function (it) { return it.id + "|" + it.nombre; }).join("\n");
  if (sel.dataset.ops !== ops) { var prev = sel.value; sel.innerHTML = items.slice().sort(porNombre).map(function (it) { return '<option value="' + esc(it.id) + '">' + esc(it.nombre) + '</option>'; }).join("") +
    '<option value="' + NUEVO + '">Otro producto (nuevo)…</option>'; sel.dataset.ops = ops; if (prev) sel.value = prev; if (!sel.value) sel.value = NUEVO; }
  mostrarCompra();
  renderHechas();
  // lista de compras con presupuesto
  var lc = Despensa.listaCompras(items), C = $("cCompras");
  if (!lc.lista.length) C.innerHTML = '<div class="empty">No le falta nada por ahora.</div>';
  else {
    var pie = '<div class="kv tot"><span>Costo estimado</span><span class="num">' + money(lc.total) + '</span></div>';
    if (lc.sinPrecio) pie += '<p class="small muted">' + lc.sinPrecio + ' producto(s) no tienen precio registrado y no están en la suma. El precio se guarda al registrar una compra.</p>';
    // Solo se dice si alcanza cuando hay al menos un precio; si no, la suma en $0 engañaría.
    if (saldo != null && lc.sinPrecio === lc.lista.length) pie += '<p class="small muted" style="margin-top:6px">Le quedan ' + money(saldo) + ' de la quincena. Cuando estos productos tengan precio, aquí verá si le alcanza.</p>';
    else if (saldo != null) pie += '<div class="note ' + (lc.total <= saldo ? "ok" : "bad") + '" style="margin-top:8px">' + (lc.total <= saldo ?
      (lc.sinPrecio ? "Para lo que tiene precio le alcanza" : "Le alcanza") + ": le quedan " + money(saldo) + " de la quincena y después de esta compra quedaría en " + money(saldo - lc.total) + "." :
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
  if (it.tipo === "nivel") { var nv = Despensa.ajustarNivel(it, paso); c.cantidad = nv.cantidad; c.nivel = nv.nivel; }
  else c.cantidad = Math.max(0, Math.round((it.cantidad + paso) * 100) / 100);
  guardarAlimento(c).then(A.render).catch(function () {});
}

/* ---------- formulario de alimento ---------- */
function mostrarTipo(t) { tipo = t; Array.prototype.forEach.call($("aliTipo").children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === t)); });
  var nv = (t === "nivel"); $("aliMinL").hidden = nv; $("aliNivelL").hidden = !nv; $("aliAyuda").hidden = !nv; $("aliCant").placeholder = nv ? "Ej.: 2" : "Ej.: 8"; }
// La unidad se elige de una lista. Si un alimento guardado trae otra, se agrega a la lista para no perderla.
function ponerUnidad(u) { var sel = $("aliUnidad"); u = u || "unidades";
  if (!Array.prototype.some.call(sel.options, function (o) { return o.value === u; })) { var o = document.createElement("option"); o.value = u; o.textContent = u; sel.appendChild(o); }
  sel.value = u; }
$("aliUnidad").innerHTML = Despensa.UNIDADES.map(function (u) { return '<option value="' + u + '">' + u + '</option>'; }).join("");
function limpiarForm() { editando = null; ultimoSugerido = ""; $("fAli").reset(); mostrarTipo("contable"); $("cFormT").textContent = "Agregar un alimento"; $("aliBtn").textContent = "Guardar alimento";
  $("aliCancelar").hidden = true; $("aliQuitar").hidden = true; $("aliQuitar").classList.remove("sure"); $("aliQuitar").textContent = "Quitar de la despensa"; }
function cargarForm(it) { editando = it.id; $("aliNombre").value = it.nombre; mostrarTipo(it.tipo || "contable");
  var p = it.tipo === "nivel" ? Despensa.partes(it) : null;
  $("aliCant").value = p ? String(p.unidades) : Despensa.cant(it.cantidad); ponerUnidad(it.unidad); $("aliMin").value = Despensa.cant(it.minimo); $("aliPrecio").value = it.precio ? money(it.precio) : "";
  $("aliNivel").value = String(p && p.nivel ? p.nivel : 3); $("aliRol").value = it.rol || "otro"; $("aliRinde").value = it.rinde ? Despensa.cant(it.rinde) : "";
  $("cFormT").textContent = "Editar " + it.nombre; $("aliBtn").textContent = "Guardar cambios"; $("aliCancelar").hidden = false; $("aliQuitar").hidden = false;
  $("fAli").scrollIntoView({ block: "center" }); }
A.segmento("aliTipo", mostrarTipo);
A.fmtInput($("aliPrecio")); A.fmtInput($("coValor"));
$("cCatalogo").innerHTML = Despensa.catalogo().map(function (c) { return '<option value="' + esc(c.nombre) + '">'; }).join("");
// Al escribir un alimento conocido se llenan solos la unidad, el mínimo y cuánto rinde.
// Solo una vez por alimento, para no pisar lo que usted cambie después (por ejemplo la unidad).
$("aliNombre").addEventListener("change", function () { var k = Despensa.clave(this.value); if (k === ultimoSugerido) return; ultimoSugerido = k;
  var s = Despensa.sugerido(this.value); if (!s || editando) return;
  mostrarTipo(s.tipo); ponerUnidad(s.unidad); $("aliMin").value = Despensa.cant(s.minimo); $("aliRol").value = s.rol; $("aliRinde").value = s.rinde ? Despensa.cant(s.rinde) : ""; });
$("fAli").addEventListener("submit", function (e) { e.preventDefault(); var msg = $("aliMsg"), nombre = $("aliNombre").value.trim(); if (!nombre) return;
  var clave = Despensa.clave(nombre), previo = editando ? buscar(editando) : null;
  if (!previo && (S.despensa || []).some(function (x) { return (x.clave || Despensa.clave(x.nombre)) === clave; })) { msg.textContent = "Ese alimento ya está en la despensa. Use Editar o los botones + y −."; return; }
  var it = { id: previo ? previo.id : A.nuevoId(), nombre: nombre, clave: clave, tipo: tipo, rol: $("aliRol").value, rinde: dec($("aliRinde").value),
    unidad: $("aliUnidad").value || "unidades", precio: A.num($("aliPrecio").value) };
  if (tipo === "nivel") { // cuántas hay (si no escribe nada, una) y cómo está la que está en uso
    it.cantidad = $("aliCant").value.trim() === "" ? 1 : Math.round(dec($("aliCant").value)); it.nivel = it.cantidad > 0 ? parseInt($("aliNivel").value, 10) : 0; it.minimo = 0;
  } else { it.cantidad = dec($("aliCant").value); it.minimo = dec($("aliMin").value); }
  var btn = $("aliBtn"); btn.disabled = true;
  guardarAlimento(it).then(function () { limpiarForm(); msg.textContent = "Guardado: " + nombre + "."; A.render(); })
    .catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }).then(function () { btn.disabled = false; });
});
$("aliCancelar").addEventListener("click", limpiarForm);
// Si cambia la unidad de un alimento conocido (por ejemplo arroz de libras a kilos), se ajusta cuánto rinde.
$("aliUnidad").addEventListener("change", function () { var s = Despensa.sugerido($("aliNombre").value); if (!s || editando || !s.rinde) return;
  $("aliRinde").value = Despensa.cant(s.rinde * (s.unidad === "libras" && this.value === "kilos" ? 2 : 1)); });
$("aliQuitar").addEventListener("click", function () { var b = this, id = editando; if (!id) return;
  if (!b.classList.contains("sure")) { b.classList.add("sure"); b.textContent = "¿Seguro? Quitar"; return; }
  A.eliminar("despensa", id).then(function () { S.despensa = S.despensa.filter(function (x) { return x.id !== id; }); limpiarForm(); A.render(); }).catch(function () {});
});

/* ---------- compra: suma a la despensa y descuenta de la quincena ----------
   Una compra siempre lleva lo que se pagó: sin valor no se guarda, porque el alimento quedaría en la despensa
   y la plata gastada no aparecería en Mis Quincenas. Lo que ya se tenía en la cocina se agrega en Despensa. */
var NUEVO = "__nuevo";
function unidadDeCompra(u) { var sel = $("coUnidad"); u = u || "unidades";
  if (!Array.prototype.some.call(sel.options, function (o) { return o.value === u; })) { var o = document.createElement("option"); o.value = u; o.textContent = u; sel.appendChild(o); }
  sel.value = u; }
$("coUnidad").innerHTML = Despensa.UNIDADES.map(function (u) { return '<option value="' + u + '">' + u + '</option>'; }).join("");
function mostrarCompra() { var v = $("coItem").value, it = buscar(v), nuevo = (v === NUEVO || !it);
  $("coNuevoBox").hidden = !nuevo;
  $("coUniTxt").textContent = nuevo ? "" : "La cantidad va en " + (it.unidad || "unidades") + ", como está en su despensa."; }
$("coItem").addEventListener("change", mostrarCompra);
// Al escribir un producto conocido se propone su unidad (pollo en libras, atún en latas…).
$("coNombre").addEventListener("change", function () { var sug = Despensa.sugerido(this.value); if (sug) unidadDeCompra(sug.unidad); });
// Deja el formulario listo con un producto (lo usa el botón "Comprar" de la lista del menú).
function prepararCompra(d) {
  var k = Despensa.clave(d.nombre), it = (S.despensa || []).filter(function (x) { return (x.clave || Despensa.clave(x.nombre)) === k; })[0];
  if (it) $("coItem").value = it.id; else { $("coItem").value = NUEVO; $("coNombre").value = d.nombre; unidadDeCompra(d.unidad || (Despensa.sugerido(d.nombre) || {}).unidad); }
  mostrarCompra();
  $("coCant").value = d.cantidad ? Despensa.cant(d.cantidad) : ""; $("coValor").value = d.valor ? money(d.valor) : "";
  $("coMsg").textContent = "Corrija la cantidad que compró y lo que pagó, y toque Registrar compra.";
  $("fCompra").scrollIntoView({ block: "center" }); try { $("coCant").focus({ preventScroll: true }); } catch (e) {}
}
window.MQ.prepararCompra = prepararCompra;
$("fCompra").addEventListener("submit", function (e) { e.preventDefault();
  var msg = $("coMsg"), v = $("coItem").value, it = buscar(v), cantidad = dec($("coCant").value), valor = A.num($("coValor").value);
  if (!it) { // producto nuevo: si ya existe uno con ese nombre, se usa ese
    var nombre = $("coNombre").value.trim(); if (!nombre) { msg.textContent = "Escriba el nombre del producto."; return; }
    var k = Despensa.clave(nombre); it = (S.despensa || []).filter(function (x) { return (x.clave || Despensa.clave(x.nombre)) === k; })[0];
    if (!it) { var sug = Despensa.sugerido(nombre) || { tipo: "contable", rol: "otro", rinde: 0, minimo: 1, unidad: "unidades" }, u = $("coUnidad").value || "unidades";
      it = { id: A.nuevoId(), nombre: nombre, clave: k, tipo: sug.tipo, rol: sug.rol, rinde: sug.rinde * (sug.unidad === "libras" && u === "kilos" ? 2 : 1), unidad: u, precio: 0, cantidad: 0, minimo: sug.tipo === "nivel" ? 0 : sug.minimo };
      if (sug.tipo === "nivel") it.nivel = 0; }
  }
  if (!cantidad) { msg.textContent = "Escriba cuánto compró."; return; }
  if (!valor) { msg.textContent = "Escriba cuánto pagó. Una compra siempre se descuenta de la quincena; si es algo que ya tenía, agréguelo en la pestaña Despensa."; return; }
  var c = Object.assign({}, it);
  if (it.tipo === "nivel") { // las unidades nuevas llegan llenas; la que estaba en uso sigue como estaba
    cantidad = Math.max(1, Math.round(cantidad)); var p = Despensa.partes(it);
    c.cantidad = p.unidades + cantidad; c.nivel = p.unidades === 0 ? 3 : p.nivel;
  } else c.cantidad = Math.round((it.cantidad + cantidad) * 100) / 100;
  c.precio = Math.round(valor / cantidad);
  var btn = $("coBtn"), esNuevo = !buscar(it.id), frase = ""; btn.disabled = true;
  guardarAlimento(c).then(function () { return window.MQ.alComprar ? window.MQ.alComprar(it.nombre, cantidad, it.unidad) : null; })
    .then(function (r) { frase = (r && r.frase) || "";
      // El gasto guarda los datos de la compra: con eso se puede deshacer completa (plata, despensa y lista del menú).
      return A.nuevoGasto({ fecha: A.hoyISO(), categoria: "Mercado", descripcion: "Compra: " + it.nombre, valor: valor,
        compra: { itemId: c.id, nombre: it.nombre, cantidad: cantidad, unidad: it.unidad || "unidades", precio: c.precio, precioAntes: it.precio || 0, nuevo: esNuevo, lista: (r && r.sumado) || 0 } }); })
    .then(function () { $("coCant").value = ""; $("coValor").value = ""; $("coNombre").value = ""; $("coItem").dataset.ops = "";
      msg.textContent = "Listo: " + it.nombre + " quedó en " + Despensa.textoCantidad(c) + " y se descontaron " + money(valor) + " de la quincena." + frase;
      A.render(); $("coItem").value = c.id; mostrarCompra(); })
    .catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }).then(function () { btn.disabled = false; });
});

/* ---------- deshacer una compra ----------
   Resta de la despensa lo que esa compra sumó, le devuelve el precio anterior y devuelve la cantidad a la lista del menú.
   Lo usan el botón "Deshacer" de aquí y el botón "Borrar" del gasto en la pestaña Hoy. No borra el gasto: eso lo hace quien llama. */
function revertirCompra(g) {
  var c = g.compra, it = buscar(c.itemId), tareas = [];
  if (it) {
    var x = Object.assign({}, it);
    if (it.tipo === "nivel") { var p = Despensa.partes(it), u = Math.max(0, p.unidades - Math.round(c.cantidad)); x.cantidad = u; x.nivel = u > 0 ? p.nivel : 0; }
    else x.cantidad = Math.max(0, Math.round((it.cantidad - c.cantidad) * 100) / 100);
    if (it.precio === c.precio) x.precio = c.precioAntes || 0; // solo si nadie cambió el precio después
    // Un producto que nació con esta compra y queda en cero se quita de la despensa.
    if (c.nuevo && !x.cantidad) tareas.push(A.eliminar("despensa", it.id).then(function () { S.despensa = S.despensa.filter(function (y) { return y.id !== it.id; }); }));
    else tareas.push(guardarAlimento(x));
  }
  if (c.lista && window.MQ.alDeshacerLista) tareas.push(window.MQ.alDeshacerLista(c.nombre, c.lista));
  return Promise.all(tareas);
}
window.MQ.alBorrarCompra = revertirCompra;
function comprasHechas() { return (S.gastos || []).filter(function (g) { return g.compra; }).sort(function (a, b) { return (b.creado || "").localeCompare(a.creado || ""); }).slice(0, 15); }
function renderHechas() {
  var L = comprasHechas(); $("coHechasCard").hidden = !L.length;
  $("coHechas").innerHTML = L.map(function (g) { var c = g.compra;
    return '<div class="item"><div class="tx"><b>' + esc(c.nombre) + ' · ' + Despensa.cant(c.cantidad) + ' ' + esc(Despensa.unidadTxt(c.unidad, c.cantidad)) + '</b><span>' + esc(A.corto(g.fecha)) + '</span></div>' +
      '<div class="amt num">' + money(g.valor) + '</div><button class="del" type="button" data-deshacer="' + esc(g.id) + '">Deshacer</button></div>'; }).join("");
}

/* ---------- botones de la lista y de las recetas ---------- */
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-mas],[data-menos],[data-editar],[data-cocinar],[data-deshacer]"); if (!b) return;
  if (b.dataset.deshacer) { // pide confirmación en el mismo botón
    if (!b.classList.contains("sure")) { b.classList.add("sure"); b.textContent = "¿Seguro? Deshacer"; setTimeout(function () { b.classList.remove("sure"); b.textContent = "Deshacer"; }, 3500); return; }
    var g = (S.gastos || []).filter(function (x) { return x.id === b.dataset.deshacer; })[0]; if (!g) return; b.disabled = true;
    revertirCompra(g).then(function () { return A.eliminar("gastos", g.id); })
      .then(function () { S.gastos = S.gastos.filter(function (x) { return x.id !== g.id; }); $("coItem").dataset.ops = "";
        $("coHechasMsg").textContent = "Compra deshecha: " + g.compra.nombre + ". Volvieron " + money(g.valor) + " a la quincena y se restó de la despensa."; A.render(); })
      .catch(function () { b.disabled = false; $("coHechasMsg").textContent = "No se pudo deshacer en este dispositivo."; });
    return; }
  if (b.dataset.mas) ajustar(b.dataset.mas, 1);
  else if (b.dataset.menos) ajustar(b.dataset.menos, -1);
  else if (b.dataset.editar) { var it = buscar(b.dataset.editar); if (it) cargarForm(it); }
  else if (b.dataset.cocinar) {
    var rec = propias().concat(Despensa.RECETAS).filter(function (r) { return r.nombre === b.dataset.cocinar; })[0]; if (!rec) return;
    b.disabled = true;
    Promise.all(Despensa.cocinar(S.despensa, rec).map(guardarAlimento)).then(function () { $("cRecMsg").textContent = "Descontado de la despensa: " + rec.nombre + "."; A.render(); }).catch(function () { b.disabled = false; });
  }
});
A.segmento("cMomento", function (v) { momento = v; render(); });
// Cuántos días almuerza fuera: se guarda con los datos del presupuesto para que también se sincronice.
$("cFuera").addEventListener("change", function () { if (!S.P) return; var msg = $("cFueraMsg"), P = JSON.parse(JSON.stringify(S.P)); P.almuerzos_semana = { semana: lunes(), dias: parseInt(this.value, 10) || 0 }; delete P.almuerzos_fuera;
  avisoGuardado = true;
  A.guardarDatos(P).then(function () { msg.textContent = "Guardado para esta semana. El estimado de días ya lo tiene en cuenta."; }).catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }); });
$("notaDespensa").addEventListener("click", function () { A.irA("despensa"); });

/* ---------- texto para preguntarle a Claude ---------- */
function lineasDespensa() {
  var items = (S.despensa || []).slice().sort(porNombre); if (!items.length) return [];
  var r = Despensa.resumen(items, 3), L = ["", "MI DESPENSA (lo que tengo en la cocina)"];
  items.forEach(function (it) { L.push("- " + it.nombre + ": " + Despensa.textoCantidad(it) + (Despensa.enAlerta(it) ? " (se está acabando)" : "") + (it.precio ? ", precio aproximado " + money(it.precio) + " c/u" : "")); });
  L.push("Estimado de la app: me alcanza para unas " + r.comidas + " comidas completas, cerca de " + Despensa.cant(diasQueDura(r.comidas)) + " día(s).");
  L.push(almuerzosFuera() ? "Esta semana almuerzo fuera de casa " + (almuerzosFuera() === 7 ? "todos los días" : almuerzosFuera() + " día(s)") + ", así que esos almuerzos no salen de la despensa. Hay semanas en que almuerzo fuera y otras en que no."
    : "Esta semana almuerzo en casa todos los días.");
  return L;
}
window.MQ.resumenExtra = lineasDespensa;
$("cCopiar").addEventListener("click", function () {
  var msg = $("cCopMsg"), ta = $("cCopTxt"), L = lineasDespensa();
  if (!L.length) { msg.textContent = "Primero agregue alimentos a la despensa."; return; }
  var hoy = A.hoyISO(), q = A.quincenaDe(hoy), sig = A.siguientePago(q), saldo = saldoQuincena(), faltan = Math.max(1, A.dias(hoy, sig));
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], nDias = Math.min(7, faltan);
  var txt = ["Vivo solo y cocino para una persona. Hoy es " + DIAS[fechaLocal(hoy).getDay()] + " " + A.corto(hoy) + " (" + hoy + "). Los valores van en pesos colombianos."].concat(L);
  if (saldo != null) txt.push("", "MI PRESUPUESTO", "- Me quedan " + money(saldo) + " para comida, transporte y todo lo demás hasta el pago del " + A.corto(sig) + " (" + faltan + " día(s)).");
  txt.push("", "LO QUE NECESITO",
    "Arma mi menú para " + (nDias === 1 ? "hoy" : "los próximos " + nDias + " días, empezando hoy") + " con desayuno, almuerzo y comida. Usa primero lo que ya tengo, que sean recetas sencillas, y que lo que haya que comprar no se pase de mi presupuesto." +
    (almuerzosFuera() ? " Los días que almuerzo fuera de casa (elige tú cuáles, entre semana), pon el almuerzo como \"fuera\"." : ""),
    "", "Respóndeme en dos partes:",
    "1) Un resumen corto para leer: el menú día por día y qué debo comprar, con el costo aproximado.",
    "2) Al final, un bloque de código con un JSON como el de abajo. Lo voy a pegar en mi app para guardar el menú y las recetas, así que no cambies los nombres de los campos:",
    "",
    '{"menu":[{"fecha":"' + hoy + '","desayuno":"nombre de la receta","almuerzo":"nombre de la receta o fuera","comida":"nombre de la receta"}],',
    ' "recetas":[{"nombre":"Arroz con huevo","momentos":["almuerzo","comida"],"ingredientes":[{"alimento":"Arroz","cantidad":0.2,"unidad":"libras","texto":"1 taza de arroz"},{"alimento":"Huevos","cantidad":2,"unidad":"unidades","texto":"2 huevos"}],"pasos":["Cocine el arroz.","Fría los huevos y sírvalos encima."]}],',
    ' "compras":[{"alimento":"Pollo","cantidad":1,"unidad":"libras","precio":9000}]}',
    "",
    "Reglas del JSON:",
    "- \"menu\": un elemento por día, con la fecha en formato AAAA-MM-DD. Cada nombre que uses ahí debe estar en \"recetas\" escrito igual.",
    "- \"recetas\": cada una para una porción. En \"alimento\" usa el mismo nombre con que aparece en mi despensa cuando sea ese alimento, y en \"cantidad\" y \"unidad\" usa la misma unidad de mi despensa (si tengo el arroz en libras, cuánto de una libra se gasta). \"texto\" es la cantidad dicha de forma casera. Sal, aceite, agua y condimentos van con cantidad 0.",
    "- \"pasos\": frases cortas, una por paso.",
    "- \"compras\": lo que debo comprar para cumplir el menú; \"precio\" es el costo total aproximado de esa compra en pesos, sin puntos.");
  txt = txt.join("\n"); ta.value = txt;
  var listo = function () { msg.textContent = "Copiado. Ahora péguelo en un chat con Claude."; };
  var manual = function () { ta.hidden = false; ta.focus(); ta.select(); msg.textContent = "Mantenga presionado el texto y elija Copiar."; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(listo, manual); else manual();
});

A.registrarRender(render);
render();
})();

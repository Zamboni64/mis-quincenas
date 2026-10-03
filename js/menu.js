/* Pestaña "Menú" de Mis comidas, la lista "Mis recetas" y las compras sugeridas.
   El circuito es: la app arma la pregunta (botón Copiar) → Claude responde con el menú y un bloque JSON →
   ese bloque se pega aquí → la app guarda las recetas y el menú de cada día, y muestra el de hoy.
   Lo que se pega se lee y se limpia en despensa.js (Despensa.leerMenu). */
(function () {
"use strict";
var A = window.MQ.app, $ = A.$, esc = A.esc, money = A.money, S = A.S;
var MOMENTOS = Despensa.MOMENTOS, TITULO = { desayuno: "Desayuno", almuerzo: "Almuerzo", comida: "Comida" };
var DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
var diaSel = A.hoyISO();

function fechaLocal(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function isoDe(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function sumarDias(s, n) { var d = fechaLocal(s); d.setDate(d.getDate() + n); return isoDe(d); }
function esFecha(id) { return /^\d{4}-\d{2}-\d{2}$/.test(id); }
function dias() { return (S.menu || []).filter(function (x) { return esFecha(x.id); }).sort(function (a, b) { return a.id < b.id ? -1 : 1; }); }
function diaDe(f) { return (S.menu || []).filter(function (x) { return x.id === f; })[0]; }
function sugeridas() { var x = (S.menu || []).filter(function (d) { return d.id === "compras"; })[0]; return x && Array.isArray(x.lista) ? x.lista : []; }
function recetaDe(nombre) { var k = Despensa.clave(nombre); return (S.recetas || []).filter(function (r) { return (r.clave || Despensa.clave(r.nombre)) === k; })[0] || Despensa.delRecetario(nombre); }
function momentoAhora() { var h = new Date().getHours(); return h < 10 ? "desayuno" : (h < 15 ? "almuerzo" : "comida"); }
function etiqueta(f) { var hoy = A.hoyISO(), t = DIAS[fechaLocal(f).getDay()] + " " + A.corto(f);
  return f === hoy ? "Hoy, " + t : (f === sumarDias(hoy, 1) ? "Mañana, " + t : t.charAt(0).toUpperCase() + t.slice(1)); }
function saldo() { var e = A.estadoQ(A.quincenaDe(A.hoyISO())); return e ? e.saldo : null; }

/* Ingredientes y pasos de una receta, con lo que falta marcado. */
function detalle(r) {
  var ings = Despensa.estadoIngredientes(r, S.despensa || []), h = "";
  if (ings.length) h += '<ul class="ings">' + ings.map(function (g) {
    return '<li' + (g.estado === "ok" ? "" : ' class="falta"') + '>' + esc(g.texto) + (g.estado === "falta" ? " · le falta" : (g.estado === "poco" ? " · no le alcanza" : "")) + '</li>'; }).join("") + '</ul>';
  if (r.pasos && r.pasos.length) h += '<ol class="pasos">' + r.pasos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") + '</ol>';
  return h || '<p class="small muted">Esta receta no trae ingredientes ni pasos.</p>';
}

/* ---------- dibujar ---------- */
function render() {
  var lista = dias(), hoy = A.hoyISO();
  // menú del día elegido
  $("mLabel").textContent = etiqueta(diaSel);
  $("mIrHoy").hidden = (diaSel === hoy);
  var primero = lista.length ? (lista[0].id < hoy ? lista[0].id : hoy) : hoy, ultimo = lista.length && lista[lista.length - 1].id > hoy ? lista[lista.length - 1].id : hoy;
  $("mPrev").disabled = diaSel <= primero; $("mNext").disabled = diaSel >= ultimo;
  var d = diaDe(diaSel), M = $("mDia");
  if (!d) M.innerHTML = '<div class="empty">' + (lista.length ? "No hay menú guardado para este día." : "Aún no tiene un menú guardado. Siga los pasos de abajo para pedírselo a Claude y guardarlo aquí.") + '</div>';
  else M.innerHTML = MOMENTOS.map(function (m) {
    var nombre = d[m], h = '<div class="receta"><div class="subt">' + TITULO[m] + '</div>';
    if (!nombre) return h + '<p>Sin plan para esta comida.</p></div>';
    if (nombre === "fuera") return h + '<b>Fuera de casa</b><p>No gasta despensa.</p></div>';
    var r = recetaDe(nombre), hecho = d.hechos && d.hechos[m];
    h += '<b>' + esc(nombre) + '</b>';
    if (!r) return h + '<p>La respuesta no trajo la receta de este plato.</p></div>';
    var falta = Despensa.estadoIngredientes(r, S.despensa || []).filter(function (g) { return g.estado !== "ok"; }).length;
    h += '<p>' + (hecho ? "Ya la preparó." : (falta ? "Le falta " + falta + (falta === 1 ? " ingrediente." : " ingredientes.") : "Tiene todo para prepararla.")) + '</p>';
    h += '<details' + (diaSel === hoy && m === momentoAhora() && !hecho ? " open" : "") + '><summary>Ingredientes y preparación</summary>' + detalle(r) + '</details>';
    if (!hecho) h += window.MQ.selPorciones() + '<button class="ghost" type="button" data-menu-hecho="' + m + '">La preparé: descontar</button></div>';
    return h + '</div>'; }).join("");
  // resumen del menú guardado
  $("mGuardado").hidden = !lista.length;
  if (lista.length) $("mResumen").textContent = "Menú guardado del " + A.corto(lista[0].id) + " al " + A.corto(lista[lista.length - 1].id) + " (" + lista.length + " día(s)).";
  // mis recetas
  var recs = (S.recetas || []).slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre); }), R = $("rLista");
  if (!recs.length) R.innerHTML = '<div class="empty">Aquí quedan las recetas que le dé Claude cuando guarde un menú.</div>';
  else R.innerHTML = recs.map(function (r) {
    return '<details><summary>' + esc(r.nombre) + '</summary><p class="small muted">' + esc((r.momentos || []).map(function (m) { return TITULO[m]; }).join(", ") || "Cualquier momento") + '</p>' + detalle(r) +
      '<button class="del" type="button" data-quitar-receta="' + esc(r.id) + '">Quitar esta receta</button></details>'; }).join("");
  // compras para el menú: cuánto falta de cada producto y lo que costaría lo que falta
  var sug = sugeridas(), C = $("cSugeridas");
  $("cSugCard").hidden = !sug.length;
  if (sug.length) {
    var total = 0, pendientes = 0;
    var filas = sug.map(function (c, i) {
      var falta = Despensa.faltaDe(c), pedido = c.cantidad ? Despensa.cant(c.cantidad) + ' ' + Despensa.unidadTxt(c.unidad, c.cantidad) : '';
      var costo = falta > 0 ? (c.cantidad ? Math.round((c.precio || 0) * falta / c.cantidad) : (c.precio || 0)) : 0; total += costo; if (falta > 0) pendientes++;
      var estado = falta <= 0 ? 'Comprado ✓' : (c.comprado ? (falta === 1 ? 'Falta ' : 'Faltan ') + Despensa.cant(falta) + ' ' + Despensa.unidadTxt(c.unidad, falta) + ' (lleva ' + Despensa.cant(c.comprado) + ')' : (costo ? 'Unos ' + money(costo) : 'Sin precio'));
      // "Desmarcar" pone en cero lo comprado, por si quedó marcado por una prueba o un error.
      var desmarcar = c.comprado ? ' · <button class="del" type="button" data-desmarcar="' + i + '">Desmarcar</button>' : '';
      return '<div class="item' + (falta <= 0 ? ' hecho' : '') + '"><div class="tx"><b>' + esc(c.alimento) + (pedido ? ' · ' + esc(pedido) : '') + '</b><span>' + esc(estado) + desmarcar + '</span></div>' +
        (falta > 0 ? '<button class="ghost chico" type="button" data-comprar="' + i + '">Comprar</button>' : '') + '</div>'; }).join("");
    var s = saldo(), pie = pendientes ? '<div class="kv tot"><span>Falta por comprar (aprox.)</span><span class="num">' + money(total) + '</span></div>' : '<div class="note ok" style="margin-top:8px">Ya compró todo lo del menú.</div>';
    if (pendientes && s != null && total > 0) pie += '<div class="note ' + (total <= s ? "ok" : "bad") + '" style="margin-top:8px">' + (total <= s ?
      "Le alcanza: le quedan " + money(s) + " de la quincena y después de comprar lo que falta quedaría en " + money(s - total) + "." :
      "No le alcanza: le quedan " + money(s) + " de la quincena. Pídale a Claude un menú más económico.") + '</div>';
    C.innerHTML = filas + pie;
  }
}

/* Cuando se registra una compra (desde el botón "Comprar" o directo en el formulario), se resta de esta lista.
   Devuelve una frase para el mensaje del formulario y cuánto se le sumó a la lista (para poder deshacerlo). */
function docCompras() { return (S.menu || []).filter(function (d) { return d.id === "compras"; })[0]; }
function enLista(lista, nombre) { var k = Despensa.clave(nombre); return (lista || []).filter(function (x) { return Despensa.clave(x.alimento) === k; }); }
window.MQ.alComprar = function (nombre, cantidad, unidad) {
  var doc = docCompras(), nada = { frase: "", sumado: 0 }; if (!doc) return nada;
  var nueva = Despensa.anotarCompra(doc.lista, nombre, cantidad, unidad); if (!nueva) return nada;
  var antes = 0, despues = 0; enLista(doc.lista, nombre).forEach(function (x) { antes += x.comprado || 0; }); enLista(nueva, nombre).forEach(function (x) { despues += x.comprado || 0; });
  var c = enLista(nueva, nombre).filter(function (x) { return x.comprado; })[0], falta = Despensa.faltaDe(c);
  var d2 = Object.assign({}, doc); d2.lista = nueva;
  return A.guardar("menu", d2).then(function () { ponerEn(S.menu, d2);
    return { sumado: Math.round((despues - antes) * 100) / 100, frase: falta > 0 ? " Para el menú aún " + (falta === 1 ? "falta " : "faltan ") + Despensa.cant(falta) + " " + Despensa.unidadTxt(c.unidad, falta) + "." : " Con esto completa lo que pedía el menú." }; });
};
// Al deshacer una compra, se le devuelve a la lista lo que esa compra le había sumado.
window.MQ.alDeshacerLista = function (nombre, sumado) {
  var doc = docCompras(); if (!doc || !sumado) return null;
  var hecho = false, nueva = (doc.lista || []).map(function (x) {
    if (hecho || Despensa.clave(x.alimento) !== Despensa.clave(nombre) || !x.comprado) return x;
    var y = Object.assign({}, x); y.comprado = Math.max(0, Math.round((x.comprado - sumado) * 100) / 100); hecho = true; return y; });
  if (!hecho) return null;
  var d2 = Object.assign({}, doc); d2.lista = nueva;
  return A.guardar("menu", d2).then(function () { ponerEn(S.menu, d2); });
};

/* ---------- navegación entre días ---------- */
$("mPrev").addEventListener("click", function () { diaSel = sumarDias(diaSel, -1); render(); });
$("mNext").addEventListener("click", function () { diaSel = sumarDias(diaSel, 1); render(); });
$("mIrHoy").addEventListener("click", function () { diaSel = A.hoyISO(); render(); });

/* ---------- guardar lo que respondió Claude ---------- */
function ponerEn(lista, obj) { var i = lista.findIndex(function (x) { return x.id === obj.id; }); if (i >= 0) lista[i] = obj; else lista.push(obj); }
function quitarDe(nombre, id) { S[nombre] = S[nombre].filter(function (x) { return x.id !== id; }); }
$("mGuardar").addEventListener("click", function () {
  var msg = $("menuMsg"), btn = this, r;
  try { r = Despensa.leerMenu($("mPegar").value); }
  catch (e) { msg.textContent = e.message === "vacio" ? "El bloque no trae ni menú ni recetas. Pídale a Claude que lo repita con el formato de la pregunta." :
    "No pude leerlo. Copie completo el bloque de código del final de la respuesta de Claude (empieza con { y termina con }) y péguelo de nuevo."; return; }
  btn.disabled = true;
  var hoy = A.hoyISO(), tareas = [], nuevas = {};
  r.dias.forEach(function (d) { nuevas[d.fecha] = true; });
  // Los días de un menú anterior, de hoy en adelante, que no vienen en el nuevo se quitan para que no se mezclen dos planes.
  if (r.dias.length) dias().forEach(function (d) { if (d.id >= hoy && !nuevas[d.id]) tareas.push(A.eliminar("menu", d.id).then(function () { quitarDe("menu", d.id); })); });
  r.recetas.forEach(function (x) {
    var previa = (S.recetas || []).filter(function (y) { return (y.clave || Despensa.clave(y.nombre)) === x.clave; })[0];
    var rec = { id: previa ? previa.id : A.nuevoId(), nombre: x.nombre, clave: x.clave, momentos: x.momentos, ingredientes: x.ingredientes, pasos: x.pasos, origen: "claude" };
    tareas.push(A.guardar("recetas", rec).then(function () { ponerEn(S.recetas, rec); }));
  });
  r.dias.forEach(function (d) { var dia = { id: d.fecha, fecha: d.fecha, desayuno: d.desayuno, almuerzo: d.almuerzo, comida: d.comida, hechos: {} };
    tareas.push(A.guardar("menu", dia).then(function () { ponerEn(S.menu, dia); })); });
  if (r.dias.length || r.compras.length) { var com = { id: "compras", lista: r.compras, creado: hoy };
    tareas.push(A.guardar("menu", com).then(function () { ponerEn(S.menu, com); })); }
  Promise.all(tareas).then(function () {
    $("mPegar").value = ""; diaSel = nuevas[hoy] || !r.dias.length ? hoy : r.dias[0].fecha;
    msg.textContent = "Guardado: " + r.dias.length + " día(s) de menú y " + r.recetas.length + " receta(s)." +
      (r.compras.length ? " La lista de lo que debe comprar quedó en la pestaña Compras." : "") +
      (r.sinReceta.length ? " Ojo: el menú nombra platos sin receta: " + r.sinReceta.join(", ") + "." : "");
    A.render(); window.scrollTo(0, 0);
  }).catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }).then(function () { btn.disabled = false; });
});
// Botón "Pegar": trae el texto del portapapeles. Si el navegador no lo permite, se pega a mano en el cuadro.
if (navigator.clipboard && navigator.clipboard.readText) $("mPegarBtn").addEventListener("click", function () {
  navigator.clipboard.readText().then(function (t) { $("mPegar").value = t; $("menuMsg").textContent = t ? "Pegado. Ahora toque Guardar menú." : "El portapapeles está vacío."; },
    function () { $("menuMsg").textContent = "No se pudo leer el portapapeles. Mantenga presionado el cuadro y elija Pegar."; });
}); else $("mPegarBtn").hidden = true;

/* ---------- borrar ---------- */
function dosToques(b, texto) { if (b.classList.contains("sure")) return true; b.classList.add("sure"); b.dataset.txt = b.textContent; b.textContent = texto;
  setTimeout(function () { b.classList.remove("sure"); if (b.dataset.txt) b.textContent = b.dataset.txt; }, 5000); return false; }
$("mBorrar").addEventListener("click", function () { var b = this; if (!dosToques(b, "¿Seguro? Borrar el menú")) return;
  Promise.all((S.menu || []).map(function (d) { return A.eliminar("menu", d.id); })).then(function () { S.menu = []; diaSel = A.hoyISO(); b.classList.remove("sure"); b.textContent = "Borrar el menú guardado"; A.render(); }).catch(function () {});
});
$("cSugBorrar").addEventListener("click", function () { var b = this; if (!dosToques(b, "¿Seguro? Quitar la lista")) return;
  A.eliminar("menu", "compras").then(function () { quitarDe("menu", "compras"); b.classList.remove("sure"); b.textContent = "Quitar esta lista"; A.render(); }).catch(function () {});
});
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-menu-hecho],[data-quitar-receta],[data-comprar],[data-desmarcar]"); if (!b) return;
  if (b.dataset.desmarcar) { var doc = docCompras(), i = +b.dataset.desmarcar; if (!doc || !doc.lista[i]) return;
    var d2 = Object.assign({}, doc); d2.lista = doc.lista.map(function (x, j) { if (j !== i) return x; var y = Object.assign({}, x); y.comprado = 0; return y; });
    A.guardar("menu", d2).then(function () { ponerEn(S.menu, d2); A.render(); }).catch(function () {}); return; }
  // "Comprar": pasa el producto al formulario de compra con lo que falta y su costo aproximado, para corregirlos.
  if (b.dataset.comprar) { var c = sugeridas()[+b.dataset.comprar]; if (!c) return; var falta = Despensa.faltaDe(c);
    window.MQ.prepararCompra({ nombre: c.alimento, unidad: c.unidad, cantidad: c.cantidad ? falta : 0, valor: c.cantidad ? Math.round((c.precio || 0) * falta / c.cantidad) : (c.precio || 0) }); return; }
  if (b.dataset.quitarReceta) { if (!dosToques(b, "¿Seguro? Quitar")) return; var id = b.dataset.quitarReceta;
    A.eliminar("recetas", id).then(function () { quitarDe("recetas", id); A.render(); }).catch(function () {}); return; }
  // "La preparé": descuenta los ingredientes de la despensa y marca esa comida como hecha.
  var m = b.dataset.menuHecho, d = diaDe(diaSel); if (!d || !d[m]) return;
  var r = recetaDe(d[m]); b.disabled = true;
  var interna = r ? (r.fija || Despensa.interna(r, S.despensa || [])) : null;
  var sv = b.parentNode.querySelector("select[data-veces]"), veces = sv ? parseInt(sv.value, 10) || 1 : 1; // el día que hay visita se gastan más porciones
  var cambios = interna ? Despensa.cocinar(S.despensa || [], interna, veces) : [];
  var dia = Object.assign({}, d); dia.hechos = Object.assign({}, d.hechos || {}); dia.hechos[m] = true;
  Promise.all(cambios.map(function (c) { return A.guardar("despensa", c).then(function () { ponerEn(S.despensa, c); }); }))
    .then(function () { return A.guardar("menu", dia); }).then(function () { ponerEn(S.menu, dia); A.render(); }).catch(function () { b.disabled = false; });
});

A.registrarRender(render);
render();
})();

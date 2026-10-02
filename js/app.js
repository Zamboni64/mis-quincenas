/* Interfaz de Mis Quincenas.
   - Los cálculos están en motor.js (objeto Motor).
   - Los datos se guardan en el teléfono con almacen.js (objeto Almacen).
   - Este archivo lee los datos a memoria (objeto S), dibuja las pantallas y guarda cada cambio. */
(function () {
"use strict";
var VERSION_APP = "1.0";
var MES = Motor.MES, quincenaDe = Motor.quincenaDe;
var CATS = ["Mercado", "Comidas fuera y domicilios", "Transporte y gasolina", "Moto (mantenimiento)", "Aseo y hogar", "Salud y farmacia", "Ropa y cuidado personal", "Ocio y salidas", "Regalos y familia", "Otros"];
// Campos editables de "Mis datos": [clave, etiqueta, tipo]. Tipo "%" = porcentaje, "n" = número simple, sin tipo = pesos.
var CAMPOS = [
  ["Nómina (cada quincena)", [["sueldo", "Sueldo quincenal"], ["salud", "Aporte de salud"], ["pension", "Aporte de pensión"], ["casino", "Casino"], ["aporte", "Aporte"], ["occ", "Libranza Occidente"], ["dav10", "Libranza Davivienda el día 10"], ["dav25", "Libranza Davivienda el día 25"], ["prima", "Prima de servicios estimada"]]],
  ["Gastos fijos del mes", [["arriendo", "Arriendo"], ["internet", "Internet"], ["datos", "Datos del celular"], ["icloud", "iCloud+ (día 10)"], ["youtube", "YouTube Premium (día 3)"], ["segsalud", "Seguro de salud"], ["seghogar", "Seguro de hogar"], ["cadena", "Cadena"]]],
  ["Tarjeta Davibank", [["c_ago", "Cuota compra de agosto (0 %)"], ["c_mp", "Cuota Mercado Pago (hasta nov.)"], ["c_mahak", "Cuota Mahak (hasta nov.)"], ["c_apple_cap", "Apple: capital al mes"], ["c_apple_int", "Apple: interés al mes"], ["c_manejo", "Cuota de manejo y seguro"], ["card_saldo", "Saldo al 2 oct 2026"], ["apple_saldo", "Saldo de Apple"], ["tarjeta_primera", "Pago de octubre de 2026"]]],
  ["Deudas y plan", [["occ_saldo", "Saldo Occidente al 2 oct 2026"], ["occ_ea", "Tasa Occidente, efectiva anual", "%"], ["occ_seg", "Occidente: seguros en la cuota"], ["dav_saldo", "Saldo Davivienda al 2 oct 2026"], ["dav_tasa", "Tasa Davivienda, mensual", "%"], ["dav_plazo", "Plazo Davivienda (cuotas)", "n"], ["primo", "Deuda con el primo"], ["meta", "Meta de colchón"], ["pct", "Parte de lo liberado que abona", "%"]]],
  ["Día límite de cada pago", [["dia_tarjeta", "Tarjeta Davibank", "n"], ["dia_arriendo", "Arriendo", "n"], ["dia_internet", "Internet", "n"], ["dia_datos", "Datos del celular", "n"], ["dia_cadena", "Cadena", "n"]]],
  ["Punto de partida", [["saldo_hoy", "Saldo en la cuenta el 2 oct 2026"]]]
];
var DATOS_EN_CERO = { dav_plazo: 12, pct: 1, redondeo: 5000, cutoff: "2026-12-10", dia_tarjeta: 7, dia_arriendo: 10, dia_internet: 10, dia_datos: 10, dia_cadena: 25, meDeben: [] };

/* ---------- utilidades ---------- */
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function money(n) { n = Math.round(n || 0); return (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("es-CO"); }
function pad(n) { return (n < 10 ? "0" : "") + n; }
function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function hoyISO() { return iso(new Date()); }
function dias(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
function corto(s) { var d = parse(s); return d.getDate() + " " + MES[d.getMonth()]; }
function num(v) { var n = parseInt(String(v).replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; }
function siguientePago(q) { var d = parse(q); return d.getDate() === 10 ? iso(new Date(d.getFullYear(), d.getMonth(), 25)) : iso(new Date(d.getFullYear(), d.getMonth() + 1, 10)); }
function anteriorQ(q) { var d = parse(q); return d.getDate() === 25 ? iso(new Date(d.getFullYear(), d.getMonth(), 10)) : iso(new Date(d.getFullYear(), d.getMonth() - 1, 25)); }
function esMovil() { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); }

/* ---------- estado en memoria ---------- */
var S = { lista: false, q: quincenaDe(hoyISO()), P: null, calc: null, gastos: [], ingresos: [], hechos: {}, ajustes: {} };
function recalcular() { S.calc = S.P ? Motor.calcular(S.P, S.ingresos) : null; }
function filaQ(q) { return S.calc ? S.calc.porFecha[q] : null; }
function gastosDe(q) { return S.gastos.filter(function (g) { return g.quincena === q; }); }
function estadoQ(q) { // lo libre, lo gastado y el saldo de una quincena
  var f = filaQ(q); if (!f) return null;
  var gastado = 0; gastosDe(q).forEach(function (g) { gastado += g.valor || 0; });
  var base = S.ajustes[q] != null ? S.ajustes[q] : f.libre - f.extra;
  return { fila: f, base: base, extra: f.extra, disponible: base + f.extra, gastado: gastado, saldo: base + f.extra - gastado };
}

/* ---------- HOY ---------- */
function renderHoy() {
  var hoy = hoyISO(), actual = quincenaDe(hoy), q = S.q, sig = siguientePago(q), e = estadoQ(q), lista = gastosDe(q);
  $("hoyTxt").textContent = "Hoy " + corto(hoy);
  $("qLabel").textContent = "Pago del " + corto(q) + " " + parse(q).getFullYear();
  $("qHoy").hidden = (q === actual);
  $("aLab").firstChild.textContent = "Libre del pago del " + corto(q) + " ";
  if (document.activeElement !== $("aLibre")) $("aLibre").value = S.ajustes[q] != null ? money(S.ajustes[q]) : "";
  $("bienvenida").hidden = !(S.lista && !S.P);
  var hero = $("hero");
  if (!S.lista) { $("heroBig").textContent = "…"; $("heroSub").textContent = "Cargando sus datos"; return; }
  if (!e) {
    hero.classList.remove("neg"); $("heroLab").textContent = S.P ? "Fuera del presupuesto" : "Aún no hay datos";
    $("heroBig").textContent = "–"; $("heroSub").textContent = S.P ? "Esta quincena está fuera de las fechas calculadas." : "Cargue un respaldo o llene sus datos para empezar.";
    $("heroBar").style.width = "0%"; $("detalleQ").innerHTML = '<div class="empty">Sin datos para esta quincena.</div>';
    $("notaAparta").hidden = true; ["stLibre", "stExtra", "stGasto"].forEach(function (id) { $(id).textContent = "–"; });
  } else {
    var f = e.fila, esActual = (q === actual), total = dias(q, sig), faltan = esActual ? Math.max(1, dias(hoy, sig)) : total;
    $("heroLab").textContent = esActual ? "Le queda en esta quincena" : "Saldo de esa quincena";
    $("heroBig").textContent = money(e.saldo); hero.classList.toggle("neg", e.saldo < 0);
    $("heroSub").textContent = e.saldo < 0 ? ("Se pasó. Faltan " + faltan + " día(s) para el pago del " + corto(sig) + ".") :
      (money(e.saldo / faltan) + " por día · " + (esActual ? "faltan " : "") + faltan + " día(s)" + (esActual ? " para el pago del " + corto(sig) : ""));
    $("heroBar").style.width = (e.disponible > 0 ? Math.max(0, Math.min(100, 100 * e.saldo / e.disponible)) : 0) + "%";
    $("stLibre").textContent = money(e.base); $("stExtra").textContent = money(e.extra); $("stGasto").textContent = money(e.gastado);
    var ap = $("notaAparta");
    if (f.aparta > 0) { ap.hidden = false; ap.textContent = "De este pago guarde " + money(f.aparta) + " para la quincena siguiente. Ya está descontado de lo libre."; } else ap.hidden = true;
    var L = [["Neto que recibe", f.neto], ["Prima", f.prima], ["Ingresos extra para gastar", f.extra], ["Trae guardado de la quincena anterior", f.reserva],
      ["Arriendo", -f.arriendo], ["Internet", -f.internet], ["Datos del celular", -f.datos], ["iCloud+", -f.icloud], ["YouTube Premium", -f.youtube], ["Tarjeta Davibank", -f.tarjeta],
      ["Seguro de salud", -f.segsalud], ["Seguro de hogar", -f.seghogar], ["Cadena", -f.cadena], ["Pago al primo", -f.primo], ["Apple a una cuota", -f.apple],
      ["Abono extra a deudas", -f.abono], ["Para el colchón", -f.colchon], ["Guarda para la quincena siguiente", -f.aparta]];
    $("detalleQ").innerHTML = L.filter(function (a) { return a[1]; }).map(function (a) { return '<div class="kv"><span>' + esc(a[0]) + '</span><span class="num">' + money(a[1]) + '</span></div>'; }).join("") +
      '<div class="kv tot"><span>Libre para comida, transporte y demás</span><span class="num">' + money(f.libre) + '</span></div>' +
      (S.ajustes[q] != null ? '<p class="small muted">Usted corrigió lo libre de esta quincena a ' + money(S.ajustes[q]) + '.</p>' : '');
  }
  var G = $("listaGastos");
  if (!lista.length) G.innerHTML = '<div class="empty">Aún no hay gastos anotados en esta quincena.</div>';
  else G.innerHTML = lista.slice().sort(function (a, b) { return (b.fecha + b.creado).localeCompare(a.fecha + a.creado); }).map(function (g) {
    return '<div class="item"><div class="tx"><b>' + esc(g.descripcion || g.categoria) + '</b><span>' + esc(corto(g.fecha)) + ' · ' + esc(g.categoria) + (g.medio === "Tarjeta Davibank" ? ' · tarjeta' : '') + '</span></div>' +
      '<div class="amt num">' + money(g.valor) + '</div><button class="del" data-col="gastos" data-id="' + esc(g.id) + '">Borrar</button></div>'; }).join("");
  var tot = {}, t = 0; lista.forEach(function (g) { tot[g.categoria] = (tot[g.categoria] || 0) + g.valor; t += g.valor; });
  var ks = Object.keys(tot).sort(function (a, b) { return tot[b] - tot[a]; });
  $("cats").innerHTML = ks.length ? ks.map(function (k) { return '<div style="padding:7px 0"><div class="top"><span>' + esc(k) + '</span><b class="num">' + money(tot[k]) + '</b></div><div class="catbar"><i style="width:' + (100 * tot[k] / t).toFixed(1) + '%"></i></div></div>'; }).join("") : '<div class="empty">Sin gastos anotados en esta quincena.</div>';
}

/* ---------- PAGOS ---------- */
function estadoPago(p, hoy) {
  if (S.hechos[p.id]) return { t: "Pagado", c: "ok", alerta: false };
  var d = dias(hoy, p.fecha);
  if (d < 0) return { t: "Vencido hace " + (-d) + " día(s)", c: "bad", alerta: true };
  if (d === 0) return { t: "Vence hoy", c: "bad", alerta: true };
  if (d <= (p.aviso || 3)) return { t: "Vence en " + d + " día(s)", c: "warn", alerta: true };
  return { t: "Pendiente", c: "plain", alerta: false };
}
function pagosEnAlerta() { var hoy = hoyISO(); return (S.calc ? S.calc.pagos : []).filter(function (p) { return estadoPago(p, hoy).alerta; }); }
function filaPago(p, hoy) { var e = estadoPago(p, hoy), ok = !!S.hechos[p.id];
  return '<div class="item"><button class="check" aria-pressed="' + ok + '" data-pago="' + esc(p.id) + '" aria-label="Marcar ' + esc(p.nombre) + ' como ' + (ok ? 'no pagado' : 'pagado') + '">' + (ok ? '✓' : '') + '</button>' +
    '<div class="tx"><b>' + esc(p.nombre) + '</b><span>' + esc(corto(p.fecha)) + ' · ' + money(p.valor) + '</span></div><span class="pill ' + e.c + '">' + esc(e.t) + '</span></div>'; }
function renderPagos() {
  var hoy = hoyISO(), d = new Date(), m0 = iso(new Date(d.getFullYear(), d.getMonth(), 1)).slice(0, 7), m1 = iso(new Date(d.getFullYear(), d.getMonth() + 1, 1)).slice(0, 7);
  var lista = S.calc ? S.calc.pagos : [], al = pagosEnAlerta(), mes = [], sig = [];
  lista.forEach(function (p) { if (p.fecha.slice(0, 7) === m0) mes.push(p); if (p.fecha.slice(0, 7) === m1) sig.push(p); });
  var vacio = '<div class="empty">Nada por aquí.</div>';
  $("pgAlerta").innerHTML = al.length ? al.map(function (p) { return filaPago(p, hoy); }).join("") : '<div class="empty">No tiene pagos vencidos ni por vencer.</div>';
  $("pgMes").innerHTML = mes.length ? mes.map(function (p) { return filaPago(p, hoy); }).join("") : vacio;
  $("pgSig").innerHTML = sig.length ? sig.map(function (p) { return filaPago(p, hoy); }).join("") : vacio;
  $("pgMesT").textContent = "Este mes (" + MES[d.getMonth()] + ")"; $("pgSigT").textContent = "Mes siguiente (" + MES[(d.getMonth() + 1) % 12] + ")";
  var est = $("pagosEstado"); est.className = "note " + (al.length ? "bad" : "ok");
  est.textContent = !lista.length ? "Aún no hay pagos cargados." : (al.length ? ("Tiene " + al.length + " pago(s) vencido(s) o por vencer. Márquelos cuando los pague.") : "Todo al día.");
  var b = $("badge"); b.hidden = !al.length; b.textContent = al.length;
  var a = $("alertaPagos"); a.hidden = !al.length;
  if (al.length) a.textContent = "Tiene " + al.length + " pago(s) por atender: " + al.slice(0, 3).map(function (p) { return p.nombre; }).join(", ") + (al.length > 3 ? "…" : "") + ". Ver pagos ›";
}

/* ---------- INGRESOS ---------- */
function origenDe(x) { return x.origen || x.concepto || "Ingreso extra"; }
var destino = "deudas";
function ayudaDestino() { $("iAyuda").textContent = destino === "gastar" ? "Se suma a lo libre de la quincena de esa fecha." :
  "Antes de la prima de diciembre se reparte así: colchón hasta la meta, luego el primo, luego Apple y el resto a capital de Davivienda. Después de la prima, todo va a capital."; }
function renderIngresos() {
  var P = S.P, R = S.calc && S.calc.reparto;
  var sel = $("iOrigen"), ops = ((P && P.meDeben) || []).map(function (m) { return m.nombre; }).concat(["Trabajo extra", "Otro"]);
  if (sel.dataset.ops !== ops.join("|")) { var prev = sel.dataset.tocado ? sel.value : ""; sel.innerHTML = ops.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join(""); sel.dataset.ops = ops.join("|"); if (ops.indexOf(prev) >= 0) sel.value = prev; }
  ayudaDestino();
  if (!P) { $("meDeben").innerHTML = '<div class="empty">Aún no hay datos.</div>'; return; }
  var rec = {}; S.ingresos.forEach(function (x) { var o = origenDe(x); rec[o] = (rec[o] || 0) + (x.valor || 0); });
  $("meDeben").innerHTML = (P.meDeben || []).map(function (m) { var r = rec[m.nombre] || 0, falta = Math.max(0, m.valor - r);
    return '<div class="item"><div class="tx"><b>' + esc(m.nombre) + '</b><span>Recibido ' + money(r) + ' de ' + money(m.valor) + '</span></div><span class="pill ' + (falta ? "plain" : "ok") + '">' + (falta ? "Falta " + money(falta) : "Pagada") + '</span></div>'; }).join("") || '<div class="empty">Nadie le debe plata.</div>';
  $("listaIng").innerHTML = S.ingresos.length ? S.ingresos.slice().sort(function (a, b) { return (b.fecha + (b.creado || "")).localeCompare(a.fecha + (a.creado || "")); }).map(function (x) {
    var txt; if (x.destino === "deudas") { var a = (R && R.porId[x.id]) || { colchon: 0, primo: 0, apple: 0, abono: 0 };
      txt = [["Colchón", a.colchon], ["Primo", a.primo], ["Apple", a.apple], ["Abono a capital", a.abono]].filter(function (p) { return p[1] > 0; }).map(function (p) { return p[0] + " " + money(p[1]); }).join(" · "); }
    else txt = "Para gastar · pago del " + corto(quincenaDe(x.fecha));
    return '<div class="item"><div class="tx"><b>' + esc(origenDe(x)) + '</b><span>' + esc(corto(x.fecha)) + ' · ' + esc(txt) + '</span></div><div class="amt num">' + money(x.valor) + '</div><button class="del" data-col="ingresos" data-id="' + esc(x.id) + '">Borrar</button></div>'; }).join("") : '<div class="empty">Aún no ha anotado ingresos aparte del sueldo.</div>';
  if (R) $("primaDic").innerHTML = [["Para el primo", R.primoFalta], ["Para pasar Apple a una cuota", R.appleFalta], ["Para el colchón", R.colchonDic], ["Abono a la libranza Davivienda", R.abonoDic]]
    .map(function (a) { return '<div class="kv"><span>' + a[0] + '</span><span class="num">' + money(a[1]) + '</span></div>'; }).join("") +
    '<p class="small muted">Lo que la plata recibida ya cubra, la prima no lo tiene que pagar y pasa a Davivienda.</p>';
}

/* ---------- PLAN ---------- */
function mesTxt(k) { return k ? Motor.mesTxt(k) : "después de 2029"; }
function renderPlan() {
  var c = S.calc; if (!c) { $("planResumen").textContent = "Aún no hay datos del plan."; return; }
  var pl = c.plan;
  $("planResumen").innerHTML = "Deuda total al 2 oct 2026: <b class=\"num\">" + money(pl.totalHoy) + "</b>. Con el plan queda libre de deudas en <b>" + esc(mesTxt(pl.finTodo)) + "</b>.";
  $("planFin").innerHTML = [["Primo", "dic. 2026, con la prima"], ["Libranza Davivienda", mesTxt(pl.finDav)], ["Tarjeta Davibank", mesTxt(pl.finCard)], ["Libranza Banco de Occidente", mesTxt(pl.finOcc)]]
    .map(function (a) { return '<div class="item"><div class="tx"><b>' + esc(a[0]) + '</b></div><span class="pill plain">' + esc(a[1]) + '</span></div>'; }).join("");
  var filas = [], i; for (i = 0; i < pl.filas.length; i++) { filas.push(pl.filas[i]); if (pl.filas[i].total === 0) break; }
  $("planMeses").innerHTML = '<table class="num"><thead><tr><th>Mes</th><th>Davivienda</th><th>Occidente</th><th>Tarjeta</th><th>Primo</th><th>Total</th><th>Abono extra</th></tr></thead><tbody>' +
    filas.map(function (f) { return '<tr><td>' + esc(Motor.mesTxt(f.mes)) + '</td><td>' + money(f.dav) + '</td><td>' + money(f.occ) + '</td><td>' + money(f.card) + '</td><td>' + money(f.primo) + '</td><td><b>' + money(f.total) + '</b></td><td>' + money(f.davAbono + f.occAbono) + '</td></tr>'; }).join("") + '</tbody></table>';
  var actual = quincenaDe(hoyISO()), qs = c.quincenas.filter(function (q) { return q.fecha >= actual; }).slice(0, 12);
  $("planQ").innerHTML = '<table class="num"><thead><tr><th>Pago</th><th>Recibe</th><th>Guarda</th><th>Libre</th></tr></thead><tbody>' +
    qs.map(function (q) { return '<tr><td>' + esc(corto(q.fecha)) + " " + q.fecha.slice(2, 4) + '</td><td>' + money(q.neto + q.prima) + '</td><td>' + money(q.aparta) + '</td><td><b>' + money(S.ajustes[q.fecha] != null ? S.ajustes[q.fecha] + q.extra : q.libre) + '</b></td></tr>'; }).join("") + '</tbody></table>';
}

/* ---------- MÁS: mis datos ---------- */
function valorCampo(P, c) { var v = P[c[0]]; if (v == null) return ""; if (c[2] === "%") return String(Math.round(v * 1000000) / 10000).replace(".", ","); if (c[2] === "n") return String(v); return money(v); }
function renderDatos() {
  var box = $("camposDatos"); $("version").textContent = "Mis Quincenas " + VERSION_APP + " · los datos están guardados en este dispositivo.";
  if (!S.P) { box.innerHTML = '<div class="empty">Aún no hay datos cargados.</div>'; return; }
  if (box.contains(document.activeElement)) return;
  box.innerHTML = CAMPOS.map(function (g, gi) { return '<details' + (gi === 0 ? ' open' : '') + '><summary>' + esc(g[0]) + '</summary><div class="campos">' +
    g[1].map(function (c) { return '<label>' + esc(c[1]) + (c[2] === "%" ? " (%)" : "") + '<input id="d_' + c[0] + '" data-k="' + c[0] + '" data-t="' + (c[2] || "$") + '" inputmode="' + (c[2] === "%" ? "decimal" : "numeric") + '" value="' + esc(valorCampo(S.P, c)) + '"></label>'; }).join("") + '</div></details>'; }).join("");
}
function render() { renderHoy(); renderPagos(); renderIngresos(); renderPlan(); renderDatos(); }

/* ---------- cargar y guardar ---------- */
function aplicar(todo) { // pasa lo leído del almacén a la memoria
  var cfg = (todo.config || []).filter(function (x) { return x.id === "datos"; })[0];
  S.P = cfg ? cfg.valores : null;
  S.gastos = todo.gastos || [];
  S.ingresos = (todo.ingresos || []).map(function (x) { if (!x.destino) x.destino = "gastar"; return x; });
  S.hechos = {}; (todo.pagosHechos || []).forEach(function (x) { S.hechos[x.id] = true; });
  S.ajustes = {}; (todo.ajustes || []).forEach(function (x) { if (typeof x.libre === "number") S.ajustes[x.id] = x.libre; });
  S.lista = true; recalcular(); render();
}
function fallo(el) { el.textContent = "No se pudo guardar en este dispositivo. Revise que tenga espacio libre e intente de nuevo."; }
function guardarDatos(P) { return Almacen.poner("config", { id: "datos", valores: P }).then(function () { S.P = P; recalcular(); render(); }); }

/* ---------- acciones ---------- */
function fmtInput(el) { el.addEventListener("input", function () { var n = num(el.value); el.value = n ? money(n) : ""; }); }
["gValor", "iValor", "aLibre"].forEach(function (id) { fmtInput($(id)); });
$("camposDatos").addEventListener("change", function (e) { var el = e.target; if (el.dataset && el.dataset.t === "$") el.value = money(num(el.value)); });
$("gCat").innerHTML = CATS.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");
$("gFecha").value = hoyISO(); $("iFecha").value = hoyISO();
var medio = "Efectivo o débito";
function segmento(id, fn) { $(id).addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return;
  Array.prototype.forEach.call(this.children, function (x) { x.setAttribute("aria-pressed", String(x === b)); }); fn(b.dataset.v); }); }
segmento("gMedio", function (v) { medio = v; });
segmento("iDestino", function (v) { destino = v; ayudaDestino(); });
$("iOrigen").addEventListener("change", function () { this.dataset.tocado = "1"; });

$("fGasto").addEventListener("submit", function (e) { e.preventDefault();
  var v = num($("gValor").value), f = $("gFecha").value; if (!v || !f) return;
  var btn = $("gBtn"), msg = $("gMsg"), g = { id: Almacen.nuevoId(), fecha: f, quincena: quincenaDe(f), categoria: $("gCat").value, descripcion: $("gDesc").value.trim(), valor: v, medio: medio, creado: new Date().toISOString() };
  btn.disabled = true;
  Almacen.poner("gastos", g).then(function () { S.gastos.push(g); $("gValor").value = ""; $("gDesc").value = "";
    msg.textContent = "Guardado: " + money(v) + (g.quincena !== S.q ? " (quedó en el pago del " + corto(g.quincena) + ")" : ""); renderHoy(); })
    .catch(function () { fallo(msg); }).then(function () { btn.disabled = false; });
});
$("fIng").addEventListener("submit", function (e) { e.preventDefault();
  var v = num($("iValor").value), f = $("iFecha").value; if (!v || !f) return;
  var btn = $("iBtn"), msg = $("iMsg"), x = { id: Almacen.nuevoId(), fecha: f, quincena: quincenaDe(f), origen: $("iOrigen").value, destino: destino, valor: v, creado: new Date().toISOString() };
  btn.disabled = true;
  Almacen.poner("ingresos", x).then(function () { S.ingresos.push(x); $("iValor").value = ""; msg.textContent = "Guardado: " + money(v) + "."; recalcular(); render(); })
    .catch(function () { fallo(msg); }).then(function () { btn.disabled = false; });
});
$("fAj").addEventListener("submit", function (e) { e.preventDefault();
  var txt = $("aLibre").value.trim(), btn = $("aBtn"), msg = $("aMsg"), q = S.q; btn.disabled = true;
  (txt === "" ? Almacen.borrar("ajustes", q) : Almacen.poner("ajustes", { id: q, libre: num(txt) }))
    .then(function () { if (txt === "") delete S.ajustes[q]; else S.ajustes[q] = num(txt);
      msg.textContent = txt === "" ? "Listo: esta quincena vuelve al cálculo normal." : "Listo: lo libre de esta quincena quedó en " + money(num(txt)) + "."; renderHoy(); renderPlan(); })
    .catch(function () { fallo(msg); }).then(function () { btn.disabled = false; });
});
$("fDatos").addEventListener("submit", function (e) { e.preventDefault(); if (!S.P) return;
  var btn = $("dBtn"), msg = $("dMsg"), nuevo = JSON.parse(JSON.stringify(S.P)), mal = null;
  Array.prototype.forEach.call(document.querySelectorAll("#camposDatos input"), function (el) { var t = el.dataset.t, v;
    if (t === "%") v = parseFloat(el.value.replace(/\s|%/g, "").replace(",", ".")) / 100; else v = num(el.value);
    if (isNaN(v) || v < 0) mal = el; else nuevo[el.dataset.k] = v; });
  if (mal) { msg.textContent = "Revise el valor de un campo: debe ser un número."; mal.focus(); return; }
  btn.disabled = true; document.activeElement && document.activeElement.blur();
  guardarDatos(nuevo).then(function () { msg.textContent = "Guardado. Las quincenas y el plan ya se recalcularon."; })
    .catch(function () { fallo(msg); }).then(function () { btn.disabled = false; });
});
document.addEventListener("click", function (e) {
  var d = e.target.closest(".del[data-col]");
  if (d) { // borrar pide confirmación en el mismo botón
    if (!d.classList.contains("sure")) { d.classList.add("sure"); d.textContent = "¿Seguro? Borrar"; setTimeout(function () { d.classList.remove("sure"); d.textContent = "Borrar"; }, 3500); return; }
    var col = d.dataset.col, id = d.dataset.id;
    Almacen.borrar(col, id).then(function () { S[col] = S[col].filter(function (x) { return x.id !== id; }); recalcular(); render(); }).catch(function () {});
    return; }
  var c = e.target.closest(".check");
  if (c) { var pid = c.dataset.pago; c.disabled = true;
    (S.hechos[pid] ? Almacen.borrar("pagosHechos", pid) : Almacen.poner("pagosHechos", { id: pid, fecha: hoyISO() }))
      .then(function () { if (S.hechos[pid]) delete S.hechos[pid]; else S.hechos[pid] = true; renderPagos(); }).catch(function () { c.disabled = false; });
    return; }
  var t = e.target.closest(".tabs button"); if (t) irA(t.dataset.tab);
});
$("alertaPagos").addEventListener("click", function () { irA("pagos"); });
function irA(tab) { ["hoy", "pagos", "ingresos", "plan", "mas"].forEach(function (n) { $("tab-" + n).hidden = (n !== tab);
  document.querySelector('.tabs button[data-tab="' + n + '"]').setAttribute("aria-selected", String(n === tab)); }); window.scrollTo(0, 0); }
function cambiarQ(q) { S.q = q; renderHoy(); }
$("qPrev").addEventListener("click", function () { cambiarQ(anteriorQ(S.q)); });
$("qNext").addEventListener("click", function () { cambiarQ(siguientePago(S.q)); });
$("qHoy").addEventListener("click", function () { cambiarQ(quincenaDe(hoyISO())); });

/* ---------- entregar un archivo: compartir en el celular, descargar en el computador ---------- */
function descargar(blob, nombre) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); return Promise.resolve("descargado"); }
function entregar(nombre, tipo, contenido) {
  var blob = new Blob([contenido], { type: tipo });
  if (esMovil() && navigator.canShare && typeof File === "function") {
    var archivo = new File([blob], nombre, { type: tipo });
    if (navigator.canShare({ files: [archivo] })) return navigator.share({ files: [archivo], title: nombre }).then(function () { return "compartido"; });
  }
  return descargar(blob, nombre);
}
function msgEntrega(msg, cuando) { return function (r) { msg.textContent = r === "compartido" ? "Listo. Elija \"Guardar en Archivos\" para conservarlo." : "Listo: se descargó " + cuando + "."; }; }
function errEntrega(msg) { return function (err) { msg.textContent = (err && err.name === "AbortError") ? "Canceló el envío del archivo." : "No se pudo crear el archivo en este dispositivo."; }; }

/* ---------- exportar a Excel ---------- */
$("exportar").addEventListener("click", function () {
  var msg = $("expMsg"); if (!S.calc) { msg.textContent = "Aún no hay datos para exportar."; return; }
  var datos = []; CAMPOS.forEach(function (g) { g[1].forEach(function (c) { datos.push([g[0] + ": " + c[1], S.P[c[0]], c[2] === "%" ? "%" : (c[2] === "n" ? "" : "$")]); }); });
  datos.push(["Exportado el", hoyISO(), ""]);
  var bytes = Motor.construirLibro({ calc: S.calc, gastos: S.gastos, ingresos: S.ingresos, hechos: S.hechos, ajustes: S.ajustes, datos: datos });
  entregar("mis-quincenas-" + hoyISO() + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes).then(msgEntrega(msg, "el Excel"), errEntrega(msg));
});

/* ---------- respaldo ---------- */
function armarRespaldo() { return { app: "mis-quincenas", version: 1, exportado: new Date().toISOString(), datos: S.P, gastos: S.gastos, ingresos: S.ingresos, pagosHechos: Object.keys(S.hechos), ajustes: S.ajustes }; }
$("guardarResp").addEventListener("click", function () { var msg = $("respMsg");
  if (!S.P) { msg.textContent = "Aún no hay datos para respaldar."; return; }
  entregar("respaldo-mis-quincenas-" + hoyISO() + ".json", "application/json", JSON.stringify(armarRespaldo(), null, 1)).then(msgEntrega(msg, "el respaldo"), errEntrega(msg));
});
function leerRespaldo(texto) { // valida el archivo y lo convierte al formato del almacén
  var r = JSON.parse(texto);
  if (!r || r.app !== "mis-quincenas" || !r.datos || typeof r.datos !== "object") throw new Error("formato");
  var aj = r.ajustes || {};
  return { config: [{ id: "datos", valores: r.datos }],
    gastos: (r.gastos || []).filter(function (g) { return g && g.id && g.fecha && typeof g.valor === "number"; }),
    ingresos: (r.ingresos || []).filter(function (x) { return x && x.id && x.fecha && typeof x.valor === "number"; }),
    pagosHechos: (r.pagosHechos || []).map(function (id) { return { id: String(id) }; }),
    ajustes: Object.keys(aj).filter(function (k) { return typeof aj[k] === "number"; }).map(function (k) { return { id: k, libre: aj[k] }; }) };
}
var avisoResp = $("respMsg");
function pedirArchivo(dondeAvisar) { avisoResp = dondeAvisar; $("archivoResp").value = ""; $("archivoResp").click(); }
$("restaurarResp").addEventListener("click", function () {
  var b = this, msg = $("respMsg");
  if (S.P && !b.dataset.seguro) { b.dataset.seguro = "1"; b.textContent = "Esto reemplaza todo lo actual. Toque otra vez para elegir el archivo";
    setTimeout(function () { delete b.dataset.seguro; b.textContent = "Restaurar un respaldo"; }, 5000); return; }
  delete b.dataset.seguro; b.textContent = "Restaurar un respaldo"; pedirArchivo(msg);
});
$("bvRestaurar").addEventListener("click", function () { pedirArchivo($("bvMsg")); });
$("archivoResp").addEventListener("change", function () {
  var f = this.files && this.files[0], msg = avisoResp; if (!f) return;
  f.text().then(function (t) { var todo = leerRespaldo(t); return Almacen.reemplazarTodo(todo).then(function () { aplicar(todo);
    msg.textContent = "Respaldo cargado: " + todo.gastos.length + " gasto(s) y " + todo.ingresos.length + " ingreso(s)."; }); })
    .catch(function () { msg.textContent = "Ese archivo no es un respaldo de Mis Quincenas o está dañado. No se cambió nada."; });
});
$("bvCero").addEventListener("click", function () { guardarDatos(JSON.parse(JSON.stringify(DATOS_EN_CERO))).then(function () { irA("mas"); }).catch(function () { fallo($("bvMsg")); }); });

/* ---------- resumen para preguntarle a Claude ---------- */
function armarResumen() {
  var hoy = hoyISO(), actual = quincenaDe(hoy), e = estadoQ(actual), sig = siguientePago(actual), L = [];
  L.push("Este es el resumen de mis finanzas personales al " + corto(hoy) + " de " + parse(hoy).getFullYear() + " (pesos colombianos). Me pagan los días 10 y 25.");
  if (e) { var faltan = Math.max(1, dias(hoy, sig));
    L.push("", "QUINCENA ACTUAL (pago del " + corto(actual) + ")",
      "- Libre para comida, transporte y demás: " + money(e.disponible) + (e.extra ? " (incluye " + money(e.extra) + " de ingresos extra)" : ""),
      "- Gastado hasta hoy: " + money(e.gastado), "- Me queda: " + money(e.saldo) + ", unos " + money(e.saldo / faltan) + " por día durante " + faltan + " día(s), hasta el pago del " + corto(sig));
    if (e.fila.aparta > 0) L.push("- De este pago debo guardar " + money(e.fila.aparta) + " para la quincena siguiente (ya descontado)");
    var tot = {}; gastosDe(actual).forEach(function (g) { tot[g.categoria] = (tot[g.categoria] || 0) + g.valor; });
    Object.keys(tot).sort(function (a, b) { return tot[b] - tot[a]; }).forEach(function (k) { L.push("  · " + k + ": " + money(tot[k])); }); }
  if (S.calc) {
    L.push("", "PRÓXIMAS QUINCENAS (libre después de pagos fijos, deudas y ahorro)");
    S.calc.quincenas.filter(function (q) { return q.fecha > actual; }).slice(0, 4).forEach(function (q) { L.push("- Pago del " + corto(q.fecha) + ": " + money(S.ajustes[q.fecha] != null ? S.ajustes[q.fecha] + q.extra : q.libre)); });
    var al = pagosEnAlerta(); L.push("", "PAGOS QUE HAGO YO MISMO");
    if (al.length) al.forEach(function (p) { L.push("- " + p.nombre + ": " + money(p.valor) + ", " + estadoPago(p, hoy).t.toLowerCase() + " (" + corto(p.fecha) + ")"); }); else L.push("- Ninguno vencido ni por vencer");
    var pl = S.calc.plan, mesKey = hoy.slice(0, 7), fila = pl.filas.filter(function (f) { return f.mes === mesKey; })[0] || pl.filas[0];
    L.push("", "DEUDAS (saldo estimado al final de " + Motor.mesTxt(fila.mes) + ", siguiendo mi plan)",
      "- Libranza Banco de Occidente: " + money(fila.occ) + ", termina en " + mesTxt(pl.finOcc),
      "- Libranza Davivienda: " + money(fila.dav) + ", termina en " + mesTxt(pl.finDav),
      "- Tarjeta Davibank (casi toda al 0 %): " + money(fila.card) + ", termina en " + mesTxt(pl.finCard),
      "- Primo (sin intereses): " + money(fila.primo), "- Total: " + money(fila.total) + ". Libre de deudas en " + mesTxt(pl.finTodo));
    var R = S.calc.reparto, rec = {}; S.ingresos.forEach(function (x) { var o = origenDe(x); rec[o] = (rec[o] || 0) + x.valor; });
    L.push("", "COLCHÓN Y PLATA QUE ME DEBEN", "- Meta de colchón: " + money(S.P.meta) + "; guardado con ingresos extra: " + money(R.tot.colchon));
    (S.P.meDeben || []).forEach(function (m) { var falta = Math.max(0, m.valor - (rec[m.nombre] || 0)); if (falta) L.push("- Me deben " + money(falta) + " (" + m.nombre + "); no cuento con esa plata hasta que llegue"); });
  }
  L.push("", "Reglas de mi plan: no usar la tarjeta de crédito para compras nuevas y mandar a deudas todo lo que se libere.", "", "MI PREGUNTA: ");
  return L.join("\n");
}
$("copiarResumen").addEventListener("click", function () {
  var msg = $("resMsg"), ta = $("resTxt"); if (!S.P) { msg.textContent = "Aún no hay datos para resumir."; return; }
  var txt = armarResumen(); ta.value = txt;
  var listo = function () { msg.textContent = "Copiado. Péguelo en un chat con Claude y escriba su pregunta al final."; };
  var manual = function () { ta.hidden = false; ta.focus(); ta.select(); msg.textContent = "Mantenga presionado el texto y elija Copiar."; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(listo, manual); else manual();
});

/* ---------- arranque ---------- */
render();
Almacen.abrir().then(function () { return Almacen.cargarTodo(); }).then(function (todo) { aplicar(todo); Almacen.pedirPersistencia(); })
  .catch(function () { S.lista = true; $("heroLab").textContent = "No se pudo abrir el almacenamiento"; $("heroBig").textContent = "–";
    $("heroSub").textContent = "Este navegador no permite guardar datos. Si está en modo privado, salga de él y vuelva a abrir la app."; });
// Al volver a la app (por ejemplo al otro día), se redibuja con la fecha nueva.
var diaVisto = hoyISO();
document.addEventListener("visibilitychange", function () {
  if (document.hidden || !S.lista) return;
  var hoy = hoyISO();
  if (hoy !== diaVisto) { // cambió el día: fechas de los formularios y, si estaba en la quincena actual, pasa a la nueva
    if (S.q === quincenaDe(diaVisto)) S.q = quincenaDe(hoy);
    diaVisto = hoy; $("gFecha").value = hoy; $("iFecha").value = hoy;
  }
  render();
});
// El "service worker" guarda los archivos de la app para que abra sin internet.
if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
})();

/* Pestaña "Freidora" de Mis comidas: recetas para la freidora de aire.
   - Trae un recetario propio (lista FREIDORA, más abajo) y muestra primero lo que sale con lo que hay en la despensa.
   - "La preparé" descuenta de la despensa, igual que en Menú y en Recetas.
   - Las recetas de freidora que responda Claude se guardan en la tienda "freidora" y aparecen en esta misma pestaña.
   Esta pestaña es aparte: no cambia el menú ni "Mis recetas". */
(function () {
"use strict";
var A = window.MQ.app, $ = A.$, esc = A.esc, S = A.S;

/* ---------- recetario de la freidora ----------
   Cada receta es para una porción y trae temperatura (°C) y minutos.
   Cada ingrediente dice:
     n: cómo se llama; a: con qué nombres puede estar en la despensa; txt: la cantidad dicha de forma casera;
     cuánto gasta, según cómo esté guardado el alimento: porc (porciones), un (unidades o piezas), lb (libras), frac (parte de una bolsa, paquete o lata);
     op: true si es opcional (la receta sale sin él).
   Sal, aceite y condimentos se dan por supuestos. */
var POLLO = ["muslos de pollo", "muslo de pollo", "muslos", "pernil de pollo", "perniles de pollo", "pernil", "perniles", "contramuslos", "contramuslo", "presas de pollo", "pollo"];
var PAPA = ["papa", "papa pastusa", "papa criolla", "papas criollas"];
var PAN = ["pan tajado", "pan de molde", "pan blanco", "pan integral"];
var FREIDORA = [
  { nombre: "Muslos de pollo crocantes", temp: 190, min: 25,
    ing: [{ n: "Muslos de pollo", a: POLLO, porc: 1, un: 1, lb: 0.4, frac: 0.125, txt: "1 muslo de pollo" }],
    pasos: ["Seque el muslo con papel de cocina y úntele sal, un chorrito de aceite y el condimento que tenga.",
      "Precaliente la freidora 3 minutos a 190 °C.",
      "Póngalo con la piel hacia abajo y cocine 12 minutos.",
      "Voltéelo y cocine otros 10 a 13 minutos, hasta que la piel quede dorada.",
      "Está listo cuando al pincharlo junto al hueso el jugo sale transparente, sin nada rosado.",
      "Si está congelado: primero 10 minutos a 160 °C y después 20 a 25 minutos a 190 °C."] },
  { nombre: "Muslos de pollo al limón y ajo", temp: 190, min: 25,
    ing: [{ n: "Muslos de pollo", a: POLLO, porc: 1, un: 1, lb: 0.4, frac: 0.125, txt: "1 muslo de pollo" },
      { n: "Limón", a: ["limon"], porc: 1, un: 1, lb: 0.1, txt: "1 limón" },
      { n: "Ajo", a: ["ajo"], porc: 1, un: 2, frac: 0.1, txt: "2 dientes de ajo" }],
    pasos: ["Machaque el ajo y mézclelo con el jugo del limón, sal y un chorrito de aceite.",
      "Unte el muslo con esa mezcla. Si tiene tiempo, déjelo 15 minutos en la nevera.",
      "Precaliente la freidora 3 minutos a 190 °C.",
      "Cocine 12 minutos con la piel hacia abajo, voltee y cocine otros 10 a 13 minutos.",
      "Está listo cuando al pincharlo junto al hueso el jugo sale transparente, sin nada rosado."] },
  { nombre: "Pollo con papas", temp: 190, min: 25,
    ing: [{ n: "Muslos de pollo", a: POLLO, porc: 1, un: 1, lb: 0.4, frac: 0.125, txt: "1 muslo de pollo" },
      { n: "Papa", a: PAPA, porc: 1, un: 1, lb: 0.5, txt: "1 papa mediana (media libra)" }],
    pasos: ["Corte la papa en cubos de dos dedos, con cáscara. Mézclela con sal y un chorrito de aceite.",
      "Sazone el muslo con sal y el condimento que tenga.",
      "Ponga el muslo con la piel hacia abajo y las papas alrededor. Cocine 12 minutos a 190 °C.",
      "Voltee el muslo, sacuda las papas y cocine otros 10 a 13 minutos.",
      "El pollo está listo cuando el jugo sale transparente; las papas, cuando un tenedor entra sin esfuerzo."] },
  { nombre: "Pechuga de pollo jugosa", temp: 180, min: 18,
    ing: [{ n: "Pechuga de pollo", a: ["pechuga de pollo", "pechugas de pollo", "filete de pechuga", "filetes de pechuga", "filetes de pollo", "pollo"], porc: 1, un: 1, lb: 0.4, frac: 0.25, txt: "1 filete de pechuga" }],
    pasos: ["Si el filete es muy grueso, ábralo por la mitad para que quede parejo.",
      "Úntele sal, un chorrito de aceite y el condimento que tenga.",
      "Cocine 9 minutos a 180 °C, voltee y cocine otros 8 a 9 minutos.",
      "Córtela por la parte más gruesa: está lista cuando el centro está blanco, sin rosado.",
      "Déjela reposar 3 minutos antes de cortarla para que no se seque."] },
  { nombre: "Alitas de pollo", temp: 200, min: 22,
    ing: [{ n: "Alas de pollo", a: ["alas de pollo", "alitas de pollo", "alitas", "alas"], porc: 1, un: 5, lb: 0.5, frac: 0.25, txt: "5 alitas" }],
    pasos: ["Seque bien las alitas y sazónelas con sal y el condimento que tenga. No necesitan aceite.",
      "Póngalas en una sola capa, sin amontonar.",
      "Cocine 12 minutos a 200 °C, voltee y cocine otros 8 a 10 minutos, hasta que estén doradas y crocantes."] },
  { nombre: "Albóndigas doradas", temp: 180, min: 12,
    ing: [{ n: "Albóndigas", a: ["albondigas", "albondiga"], porc: 1, un: 3, lb: 0.25, frac: 0.25, txt: "3 albóndigas" }],
    pasos: ["Ponga las albóndigas en una sola capa, separadas.",
      "Cocine 10 a 12 minutos a 180 °C y sacuda la canasta a la mitad del tiempo.",
      "Si están congeladas, déjelas 14 a 15 minutos.",
      "Abra una: están listas cuando por dentro no se ve rosado."] },
  { nombre: "Tocineta crocante", temp: 200, min: 8,
    ing: [{ n: "Tocineta", a: ["tocineta"], porc: 1, un: 2, frac: 0.2, txt: "2 o 3 tiras de tocineta" }],
    pasos: ["Ponga las tiras en una sola capa.",
      "Eche un chorrito de agua en el fondo del cajón, debajo de la canasta, para que la grasa no eche humo.",
      "Cocine 6 a 8 minutos a 200 °C. Revise desde el minuto 6, porque se pasa rápido.",
      "Sáquela a un plato con papel de cocina."] },
  { nombre: "Papas en cascos", temp: 200, min: 20,
    ing: [{ n: "Papa", a: PAPA, porc: 1, un: 1, lb: 0.5, txt: "1 papa mediana (media libra)" }],
    pasos: ["Lave la papa y córtela en cascos, con cáscara.",
      "Séquela muy bien, y mézclela con sal y una cucharadita de aceite.",
      "Cocine 18 a 20 minutos a 200 °C y sacuda la canasta dos veces.",
      "Están listas cuando quedan doradas por fuera y blandas por dentro."] },
  { nombre: "Huevos duros", temp: 130, min: 15,
    ing: [{ n: "Huevos", a: ["huevos"], porc: 1, un: 2, txt: "2 huevos" }],
    pasos: ["Ponga los huevos enteros, con cáscara, en la canasta. No necesitan agua.",
      "Cocine 15 minutos a 130 °C. Con 12 minutos la yema queda más blanda.",
      "Páselos de una vez a un recipiente con agua fría y déjelos 5 minutos.",
      "Pélelos."] },
  { nombre: "Tostadas de pan", temp: 180, min: 3,
    ing: [{ n: "Pan tajado", a: PAN, porc: 1, un: 2, frac: 0.1, txt: "2 tajadas de pan" }],
    pasos: ["Ponga las tajadas en una sola capa.",
      "Cocine 2 a 3 minutos a 180 °C. Si las quiere más doradas, voltéelas y deje 1 minuto más."] },
  { nombre: "Sándwich de queso derretido", temp: 180, min: 6,
    ing: [{ n: "Pan tajado", a: PAN, porc: 1, un: 2, frac: 0.1, txt: "2 tajadas de pan" },
      { n: "Queso", a: ["queso", "queso tajado", "queso mozarella", "queso mozzarella", "queso doble crema"], porc: 1, un: 2, lb: 0.1, frac: 0.1, txt: "1 o 2 tajadas de queso" },
      { n: "Jamón", a: ["jamon", "jamon de pollo", "jamon de pavo"], porc: 1, un: 1, frac: 0.1, txt: "1 tajada de jamón (opcional)", op: true }],
    pasos: ["Arme el sándwich con el queso en el medio.",
      "Atraviéselo con un palillo para que el aire no levante el pan de arriba.",
      "Cocine 3 minutos a 180 °C, voltee y cocine otros 2 a 3 minutos, hasta que el queso se derrita."] },
  { nombre: "Salchichas doradas", temp: 180, min: 7,
    ing: [{ n: "Salchichas", a: ["salchichas"], porc: 1, un: 2, frac: 0.25, txt: "2 salchichas" }],
    pasos: ["Hágales dos o tres cortes poco profundos para que no se revienten.",
      "Cocine 6 a 8 minutos a 180 °C y sacuda la canasta a la mitad."] },
  { nombre: "Chorizo asado", temp: 180, min: 14,
    ing: [{ n: "Chorizo", a: ["chorizo"], porc: 1, un: 1, frac: 0.2, txt: "1 chorizo" }],
    pasos: ["Pinche el chorizo con un tenedor en varias partes.",
      "Cocine 12 a 15 minutos a 180 °C y voltéelo a la mitad.",
      "Córtelo: está listo cuando por dentro no se ve rosado."] },
  { nombre: "Plátano maduro asado", temp: 190, min: 14,
    ing: [{ n: "Plátano maduro", a: ["platano", "platano maduro", "platanos maduros", "maduro", "maduros"], porc: 1, un: 1, txt: "1 plátano maduro" }],
    pasos: ["Pélelo y córtelo en tajadas a lo largo o en rodajas gruesas.",
      "Úntelas con muy poco aceite.",
      "Cocine 12 a 15 minutos a 190 °C y voltee a la mitad, hasta que doren."] },
  { nombre: "Filete de pescado", temp: 190, min: 11,
    ing: [{ n: "Pescado", a: ["pescado", "filete de pescado", "filetes de pescado", "tilapia", "filete de tilapia", "filetes de tilapia", "basa"], porc: 1, un: 1, lb: 0.33, frac: 0.25, txt: "1 filete de pescado" },
      { n: "Limón", a: ["limon"], porc: 1, un: 1, lb: 0.1, txt: "medio limón (opcional)", op: true }],
    pasos: ["Seque el filete y úntele sal, un chorrito de aceite y unas gotas de limón.",
      "Cocine 10 a 12 minutos a 190 °C, sin voltearlo.",
      "Está listo cuando se deshace en lascas al tocarlo con el tenedor."] },
  { nombre: "Chuleta de cerdo", temp: 190, min: 14,
    ing: [{ n: "Cerdo", a: ["cerdo", "chuleta de cerdo", "chuletas de cerdo", "chuleta", "chuletas", "lomo de cerdo"], porc: 1, un: 1, lb: 0.33, frac: 0.25, txt: "1 chuleta de cerdo" }],
    pasos: ["Sazone la chuleta con sal, un chorrito de aceite y el condimento que tenga.",
      "Cocine 7 minutos a 190 °C, voltee y cocine otros 6 a 7 minutos.",
      "Córtela por el centro: está lista cuando no se ve rosada.",
      "Déjela reposar 3 minutos antes de comerla."] }
];
FREIDORA.forEach(function (r) { r.ing.forEach(function (g) { g.a = g.a.map(Despensa.clave); }); });

/* ---------- cálculos ---------- */
function n(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
function claveDe(it) { return it.clave || Despensa.clave(it.nombre); }
function base(u) { return Despensa.clave(Despensa.unidadTxt(Despensa.clave(u || "unidades"), 1)); } // "libras" → "libra", "porciones" → "porcion"
// El alimento de la despensa que sirve para un ingrediente del recetario: el primero de sus nombres que esté.
function alimentoPara(g, items) {
  for (var i = 0; i < g.a.length; i++) for (var j = 0; j < items.length; j++) if (claveDe(items[j]) === g.a[i]) return items[j];
  return null;
}
// Cuánto gasta un ingrediente del recetario, en la unidad de compra del alimento (bolsas, paquetes, libras, unidades…).
function gasto(g, it) {
  var P = Despensa.porPaq(it);
  if (P) return (base(it.pieza || "porciones") === "porcion" ? n(g.porc) || 1 : n(g.un) || 1) / P;
  if (it.tipo === "nivel") return n(g.frac);
  var u = base(it.unidad);
  if (u === "libra") return n(g.lb);
  if (u === "kilo") return n(g.lb) / 2;
  if (u === "unidad") return n(g.un) || 1;
  return n(g.frac);
}
function tiempo(v) {
  var t = typeof v.temp === "number" ? v.temp + " °C" : (v.temp || ""), m = typeof v.min === "number" ? v.min + " min" : (v.min || "");
  return t && m ? t + " · " + m : (t || m);
}
/* Deja cada receta lista para mostrar: ingredientes con su estado ("ok", "falta" o "poco"), lo que falta
   y la receta en el formato que usa Despensa.cocinar para descontar. */
function vistaFija(r, i, items) {
  var ing = {}, faltan = [];
  var ings = r.ing.map(function (g) {
    var it = alimentoPara(g, items), est = "ok";
    if (!it || Despensa.equivalente(it) <= 0) est = "falta";
    else { var q = gasto(g, it); if (q && Despensa.equivalente(it) + 1e-6 < q) est = "poco"; if (q) ing[claveDe(it)] = (ing[claveDe(it)] || 0) + q; }
    if (est !== "ok" && !g.op) faltan.push(g.n.toLowerCase());
    return { texto: g.txt, estado: g.op && est !== "ok" ? "opcional" : est };
  });
  return { llave: "f:" + i, nombre: r.nombre, temp: r.temp, min: r.min, ings: ings, pasos: r.pasos, faltan: faltan,
    interna: { nombre: r.nombre, momentos: [], ing: ing, propia: true } };
}
function vistaGuardada(r, items) {
  var ings = Despensa.estadoIngredientes(r, items), faltan = [];
  ings.forEach(function (g, i) { if (g.estado !== "ok") faltan.push(String((r.ingredientes[i] || {}).alimento || g.texto).toLowerCase()); });
  return { llave: "g:" + r.id, id: r.id, nombre: r.nombre, temp: r.temperatura, min: r.minutos, ings: ings, pasos: r.pasos || [], faltan: faltan,
    guardada: true, interna: Despensa.interna(r, items) };
}
function vistas() {
  var items = S.despensa || [], mias = {};
  var guardadas = (S.freidora || []).map(function (r) { mias[r.clave || Despensa.clave(r.nombre)] = true; return vistaGuardada(r, items); });
  // Si una receta guardada se llama igual que una del recetario, se muestra la guardada.
  var fijas = FREIDORA.map(function (r, i) { return mias[Despensa.clave(r.nombre)] ? null : vistaFija(r, i, items); }).filter(Boolean);
  return guardadas.concat(fijas).sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
}

/* ---------- dibujar ---------- */
function detalle(v) {
  var h = "";
  if (v.ings.length) h += '<ul class="ings">' + v.ings.map(function (g) {
    return '<li' + (g.estado === "ok" ? "" : ' class="' + (g.estado === "opcional" ? "opc" : "falta") + '"') + '>' + esc(g.texto) + (g.estado === "falta" ? " · le falta" : (g.estado === "poco" ? " · no le alcanza" : "")) + '</li>'; }).join("") + '</ul>';
  if (v.pasos.length) h += '<ol class="pasos">' + v.pasos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") + '</ol>';
  if (v.guardada) h += '<button class="del" type="button" data-quitar-freidora="' + esc(v.id) + '">Quitar esta receta</button>';
  return h;
}
function tarjeta(v, sale) {
  var t = tiempo(v);
  return '<div class="receta"><b>' + esc(v.nombre) + '</b><p>' + (t ? '<span class="pill plain">' + esc(t) + '</span> ' : '') +
    (sale ? "Tiene todo para prepararla." : "Le falta: " + esc(v.faltan.join(", ")) + ".") + (v.guardada ? " Receta de Claude." : "") + '</p>' +
    '<details><summary>Ingredientes y preparación</summary>' + detalle(v) + '</details>' +
    (sale ? window.MQ.selPorciones() + '<button class="ghost" type="button" data-freir="' + esc(v.llave) + '">La preparé: descontar</button></div>' : '') + '</div>';
}
function render() {
  var todas = vistas(), salen = todas.filter(function (v) { return !v.faltan.length; }), otras = todas.filter(function (v) { return v.faltan.length; });
  otras.sort(function (a, b) { return (a.faltan.length - b.faltan.length) || a.nombre.localeCompare(b.nombre); });
  var h = "";
  if (!(S.despensa || []).length) h += '<div class="empty">Agregue alimentos en la pestaña Despensa para ver qué puede hacer con lo que tiene.</div>';
  else if (salen.length) h += '<div class="subt">Con lo que tiene</div>' + salen.map(function (v) { return tarjeta(v, true); }).join("");
  else h += '<div class="empty">Con lo que tiene no sale ninguna receta de freidora por ahora.</div>';
  $("frLista").innerHTML = h;
  $("frOtrasCard").hidden = !otras.length;
  $("frOtras").innerHTML = otras.map(function (v) { return tarjeta(v, false); }).join("");
}

/* ---------- botones ---------- */
function ponerEn(lista, obj) { var i = lista.findIndex(function (x) { return x.id === obj.id; }); if (i >= 0) lista[i] = obj; else lista.push(obj); }
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-freir],[data-quitar-freidora]"); if (!b) return;
  if (b.dataset.quitarFreidora) { // pide confirmación en el mismo botón
    if (!b.classList.contains("sure")) { b.classList.add("sure"); b.textContent = "¿Seguro? Quitar";
      setTimeout(function () { b.classList.remove("sure"); b.textContent = "Quitar esta receta"; }, 5000); return; }
    var id = b.dataset.quitarFreidora;
    A.eliminar("freidora", id).then(function () { S.freidora = S.freidora.filter(function (x) { return x.id !== id; }); A.render(); }).catch(function () {});
    return; }
  // "La preparé": descuenta los ingredientes de la despensa.
  var v = vistas().filter(function (x) { return x.llave === b.dataset.freir; })[0]; if (!v) return;
  var sv = b.parentNode.querySelector("select[data-veces]"), veces = sv ? parseInt(sv.value, 10) || 1 : 1, msg = $("frMsg"); b.disabled = true;
  var cambios = Despensa.cocinar(S.despensa || [], v.interna, veces);
  Promise.all(cambios.map(function (c) { return A.guardar("despensa", c).then(function () { ponerEn(S.despensa, c); }); }))
    .then(function () { msg.textContent = "Descontado de la despensa: " + v.nombre + (veces > 1 ? " (" + veces + " porciones)." : "."); A.render(); })
    .catch(function () { b.disabled = false; msg.textContent = "No se pudo guardar en este dispositivo."; });
});

/* ---------- pedirle recetas a Claude ---------- */
$("frCopiar").addEventListener("click", function () {
  var msg = $("frCopMsg"), ta = $("frCopTxt"), L = window.MQ.resumenExtra ? window.MQ.resumenExtra() : [];
  if (!L.length) { msg.textContent = "Primero agregue alimentos a la despensa."; return; }
  var ya = vistas().map(function (v) { return v.nombre; });
  var txt = ["Vivo solo y cocino para una persona. Tengo freidora de aire y quiero recetas para hacer en ella. Los valores van en pesos colombianos."].concat(L);
  txt.push("", "RECETAS DE FREIDORA QUE YA TENGO EN MI APP (no me las repitas)", ya.join(", ") + ".",
    "", "LO QUE NECESITO",
    "Dame 4 recetas nuevas para la freidora de aire, sencillas y para una porción, usando sobre todo lo que ya tengo en la despensa. Cada una con la temperatura en grados centígrados y los minutos.",
    "", "Respóndeme en dos partes:",
    "1) Un resumen corto para leer: el nombre de cada receta, la temperatura y el tiempo.",
    "2) Al final, un bloque de código con un JSON como el de abajo. Lo voy a pegar en mi app para guardar las recetas, así que no cambies los nombres de los campos:",
    "",
    '{"freidora":[{"nombre":"Muslos de pollo al limón","temperatura":190,"minutos":25,"ingredientes":[{"alimento":"Muslos de pollo","cantidad":1,"unidad":"porciones","texto":"1 muslo de pollo"},{"alimento":"Limón","cantidad":1,"unidad":"unidades","texto":"1 limón"},{"alimento":"Sal","cantidad":0,"unidad":"","texto":"sal al gusto"}],"pasos":["Sazone el muslo con sal y limón.","Cocine 12 minutos, voltee y cocine otros 13 minutos."]}]}',
    "",
    "Reglas del JSON:",
    "- \"temperatura\" va en grados centígrados y \"minutos\" es el tiempo total; los dos son números.",
    "- En \"alimento\" usa el mismo nombre con que aparece en mi despensa cuando sea ese alimento, y en \"cantidad\" y \"unidad\" usa la unidad en que te lo listé: si dice porciones, tajadas o muslos, en eso; si dice libras o unidades, en eso. \"texto\" es la cantidad dicha de forma casera. Sal, aceite, agua y condimentos van con cantidad 0.",
    "- \"pasos\": frases cortas, una por paso. Si hay que voltear o sacudir, dilo en el paso con su minuto.");
  txt = txt.join("\n"); ta.value = txt;
  var listo = function () { msg.textContent = "Copiado. Ahora péguelo en un chat con Claude."; };
  var manual = function () { ta.hidden = false; ta.focus(); ta.select(); msg.textContent = "Mantenga presionado el texto y elija Copiar."; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(listo, manual); else manual();
});

/* Lee y limpia el bloque que respondió Claude. Acepta {"freidora":[…]} o directamente la lista […]. */
function texto(v, max) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max); }
function numero(v) { var x = typeof v === "number" ? v : parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) && x > 0 ? Math.round(x * 1000) / 1000 : 0; }
function leerJSON(t) {
  var a = t.search(/[{\[]/), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]")); if (a < 0 || b <= a) throw new Error("json");
  return JSON.parse(t.slice(a, b + 1));
}
function leer(pegado) {
  var t = String(pegado || ""), o;
  try { o = leerJSON(t); } // si falla, se intenta de nuevo cambiando las comillas curvas y los espacios raros que a veces mete el copiado
  catch (e) { try { o = leerJSON(t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/ /g, " ")); } catch (e2) { throw new Error("json"); } }
  if (!o || typeof o !== "object") throw new Error("json");
  if (!Array.isArray(o) && !Array.isArray(o.freidora) && Array.isArray(o.menu)) throw new Error("menu"); // es un menú: va en la pestaña Menú
  var lista = Array.isArray(o) ? o : (Array.isArray(o.freidora) ? o.freidora : []), recs = [], vistos = {};
  lista.slice(0, 30).forEach(function (r) {
    if (!r || typeof r !== "object") return; var nombre = texto(r.nombre, 70); if (!nombre || vistos[Despensa.clave(nombre)]) return; vistos[Despensa.clave(nombre)] = true;
    var ings = (Array.isArray(r.ingredientes) ? r.ingredientes : []).slice(0, 25).map(function (g) {
      if (typeof g === "string") g = { alimento: g, texto: g };
      if (!g || typeof g !== "object") return null; var ali = texto(g.alimento, 40); if (!ali) return null;
      var c = numero(g.cantidad), u = texto(g.unidad, 14);
      return { alimento: ali, clave: Despensa.clave(ali), cantidad: c, unidad: u, texto: texto(g.texto, 80) || ((c ? Despensa.cant(c) + " " + (u ? Despensa.unidadTxt(u, c) + " de " : "") : "") + ali.toLowerCase()) };
    }).filter(Boolean);
    var pasos = Array.isArray(r.pasos) ? r.pasos : [r.pasos || r.preparacion || r.como];
    pasos = pasos.map(function (p) { return texto(p, 400); }).filter(Boolean).slice(0, 15);
    recs.push({ nombre: nombre, clave: Despensa.clave(nombre), temperatura: Math.round(numero(r.temperatura)) || texto(r.temperatura, 30), minutos: Math.round(numero(r.minutos != null ? r.minutos : r.tiempo)) || texto(r.minutos != null ? r.minutos : r.tiempo, 30),
      ingredientes: ings, pasos: pasos });
  });
  if (!recs.length) throw new Error("vacio");
  return recs;
}
$("frGuardar").addEventListener("click", function () {
  var msg = $("frPegarMsg"), btn = this, recs;
  try { recs = leer($("frPegar").value); }
  catch (e) { msg.textContent = e.message === "menu" ? "Ese bloque es un menú completo: péguelo en la pestaña Menú. Aquí van solo las recetas de freidora." :
    (e.message === "vacio" ? "El bloque no trae recetas de freidora. Pídale a Claude que lo repita con el formato de la pregunta." :
    "No pude leerlo. Copie completo el bloque de código del final de la respuesta de Claude (empieza con { y termina con }) y péguelo de nuevo."); return; }
  btn.disabled = true;
  Promise.all(recs.map(function (x) {
    var previa = (S.freidora || []).filter(function (y) { return (y.clave || Despensa.clave(y.nombre)) === x.clave; })[0];
    var rec = Object.assign({ id: previa ? previa.id : A.nuevoId(), origen: "claude" }, x);
    return A.guardar("freidora", rec).then(function () { ponerEn(S.freidora, rec); }); }))
    .then(function () { $("frPegar").value = ""; msg.textContent = "Guardado: " + recs.length + (recs.length === 1 ? " receta" : " recetas") + " de freidora. Ya " + (recs.length === 1 ? "aparece" : "aparecen") + " arriba."; A.render(); })
    .catch(function () { msg.textContent = "No se pudo guardar en este dispositivo."; }).then(function () { btn.disabled = false; });
});
// Botón "Pegar": trae el texto del portapapeles. Si el navegador no lo permite, se pega a mano en el cuadro.
if (navigator.clipboard && navigator.clipboard.readText) $("frPegarBtn").addEventListener("click", function () {
  navigator.clipboard.readText().then(function (t) { $("frPegar").value = t; $("frPegarMsg").textContent = t ? "Pegado. Ahora toque Guardar recetas." : "El portapapeles está vacío."; },
    function () { $("frPegarMsg").textContent = "No se pudo leer el portapapeles. Mantenga presionado el cuadro y elija Pegar."; });
}); else $("frPegarBtn").hidden = true;

A.registrarRender(render);
render();
})();

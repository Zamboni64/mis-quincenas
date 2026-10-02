/* Despensa: catálogo de alimentos, recetario básico y cálculos. No toca la pantalla.

   Cada alimento guardado tiene:
     nombre, clave (para cruzarlo con las recetas), tipo ("contable" o "nivel"), unidad,
     cantidad: en los contables, cuánto hay (puede llevar decimales); en los de nivel, cuántas unidades hay contando la que está en uso,
     nivel (solo en los de nivel): cómo está la que está en uso: 3 lleno, 2 medio, 1 poco,
     minimo (solo contables: avisa cuando queda menos de eso),
     rol ("base", "proteina", "acompanante" u "otro"), rinde (comidas por unidad) y precio (por unidad, opcional). */
var Despensa = (function () {
  "use strict";

  // nombre: [unidad, rol, rinde (comidas por unidad), mínimo sugerido, tipo]
  var CATALOGO = {
    "huevos": ["unidades", "proteina", 0.5, 4], "pollo": ["libras", "proteina", 3, 1], "carne molida": ["libras", "proteina", 4, 1],
    "carne de res": ["libras", "proteina", 3, 1], "cerdo": ["libras", "proteina", 3, 1], "atun": ["latas", "proteina", 1, 2],
    "salchichas": ["paquetes", "proteina", 4, 1], "frijoles": ["libras", "proteina", 6, 1], "lentejas": ["libras", "proteina", 6, 1],
    "queso": ["libras", "proteina", 8, 0.5], "jamon": ["paquetes", "proteina", 5, 1],
    "tocineta": ["paquetes", "proteina", 4, 1], "chorizo": ["unidades", "proteina", 1, 2], "pescado": ["libras", "proteina", 3, 1],
    "arroz": ["libras", "base", 5, 1], "pasta": ["paquetes", "base", 3, 1], "pan tajado": ["bolsas", "base", 4, 1],
    "arepas": ["paquetes", "base", 5, 1], "papa": ["libras", "base", 2, 1], "platano": ["unidades", "base", 2, 1],
    "yuca": ["libras", "base", 3, 1], "avena": ["bolsas", "base", 8, 1],
    "tomate": ["unidades", "acompanante", 0, 2], "cebolla": ["unidades", "acompanante", 0, 1], "zanahoria": ["unidades", "acompanante", 0, 1],
    "aguacate": ["unidades", "acompanante", 0, 1], "banano": ["unidades", "acompanante", 0, 2], "limon": ["unidades", "acompanante", 0, 2],
    "leche": ["litros", "otro", 0, 1], "chocolate": ["pastillas", "otro", 0, 2], "panela": ["unidades", "otro", 0, 1],
    "sal": ["bolsas", "otro", 0, 1, "nivel"], "azucar": ["bolsas", "otro", 0, 1, "nivel"], "aceite": ["botellas", "otro", 0, 1, "nivel"],
    "cafe": ["bolsas", "otro", 0, 1, "nivel"], "mantequilla": ["unidades", "otro", 0, 1, "nivel"], "condimentos": ["frascos", "otro", 0, 1, "nivel"],
    "salsa de tomate": ["frascos", "otro", 0, 1, "nivel"], "ajo": ["unidades", "otro", 0, 1, "nivel"]
  };
  // Unidades que se pueden elegir en el formulario.
  var UNIDADES = ["unidades", "libras", "kilos", "bolsas", "paquetes", "latas", "litros", "botellas", "cajas", "frascos", "pastillas"];
  // Otras formas de escribir el mismo alimento.
  var ALIAS = { "huevo": "huevos", "arepa": "arepas", "pan": "pan tajado", "papas": "papa", "tomates": "tomate", "cebollas": "cebolla", "zanahorias": "zanahoria",
    "platanos": "platano", "bananos": "banano", "limones": "limon", "aguacates": "aguacate", "salchicha": "salchichas", "frijol": "frijoles", "lenteja": "lentejas",
    "espagueti": "pasta", "espaguetis": "pasta", "spaghetti": "pasta", "tocino": "tocineta", "chorizos": "chorizo", "carne": "carne de res", "pechuga": "pollo", "avena en hojuelas": "avena" };
  var FRACCION = [0, 0.25, 0.5, 1]; // cuánto de una unidad queda en cada nivel
  var NOMBRES = { "atun": "Atún", "jamon": "Jamón", "platano": "Plátano", "limon": "Limón", "azucar": "Azúcar", "cafe": "Café" };
  var NIVELES = ["Se acabó", "Poco", "Medio", "Lleno"];

  // Recetas para una porción. Las cantidades van en la unidad del catálogo. Sal, aceite y condimentos se dan por supuestos.
  var RECETAS = [
    { nombre: "Huevos pericos con arepa", momentos: ["desayuno"], ing: { "huevos": 2, "tomate": 0.5, "cebolla": 0.25, "arepas": 0.2 }, como: "Sofría tomate y cebolla picados, agregue los huevos y revuelva. Acompañe con la arepa." },
    { nombre: "Huevos revueltos con pan", momentos: ["desayuno"], ing: { "huevos": 2, "pan tajado": 0.25 }, como: "Revuelva los huevos en la sartén y sírvalos con dos tajadas de pan." },
    { nombre: "Arepa con queso", momentos: ["desayuno", "comida"], ing: { "arepas": 0.2, "queso": 0.1 }, como: "Ase la arepa y póngale el queso encima hasta que se derrita." },
    { nombre: "Avena con banano", momentos: ["desayuno"], ing: { "avena": 0.125, "leche": 0.25, "banano": 1 }, como: "Cocine la avena en la leche unos minutos y agregue el banano en rodajas." },
    { nombre: "Calentado", momentos: ["desayuno"], ing: { "arroz": 0.2, "frijoles": 0.15, "huevos": 1 }, como: "Sofría el arroz y los frijoles del día anterior y ponga un huevo frito encima." },
    { nombre: "Sándwich de jamón y queso", momentos: ["desayuno", "comida"], ing: { "pan tajado": 0.25, "jamon": 0.2, "queso": 0.1 }, como: "Arme el sándwich y dórelo en la sartén por ambos lados." },
    { nombre: "Chocolate con pan y queso", momentos: ["desayuno"], ing: { "chocolate": 1, "leche": 0.25, "pan tajado": 0.25, "queso": 0.1 }, como: "Prepare el chocolate en la leche y acompáñelo con pan y queso." },
    { nombre: "Arroz con huevo", momentos: ["almuerzo", "comida"], ing: { "arroz": 0.2, "huevos": 2 }, como: "Cocine el arroz y sírvalo con dos huevos fritos encima." },
    { nombre: "Arroz con pollo", momentos: ["almuerzo"], ing: { "arroz": 0.2, "pollo": 0.33, "zanahoria": 0.5, "cebolla": 0.25 }, como: "Cocine y desmeche el pollo, sofría cebolla y zanahoria, y mezcle todo con el arroz." },
    { nombre: "Pasta con atún", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.33, "atun": 1, "tomate": 1, "cebolla": 0.25 }, como: "Cocine la pasta. Sofría tomate y cebolla, agregue el atún y mezcle." },
    { nombre: "Pasta con carne molida", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.33, "carne molida": 0.25, "tomate": 1, "cebolla": 0.25 }, como: "Dore la carne con cebolla, agregue el tomate picado y sirva sobre la pasta." },
    { nombre: "Lentejas con arroz", momentos: ["almuerzo"], ing: { "lentejas": 0.17, "arroz": 0.2, "zanahoria": 0.5, "cebolla": 0.25 }, como: "Cocine las lentejas con zanahoria y cebolla hasta que ablanden. Sirva con arroz." },
    { nombre: "Frijoles con arroz y tajadas", momentos: ["almuerzo"], ing: { "frijoles": 0.17, "arroz": 0.2, "platano": 0.5 }, como: "Cocine los frijoles, haga el arroz y fría el plátano en tajadas." },
    { nombre: "Pollo con papa", momentos: ["almuerzo", "comida"], ing: { "pollo": 0.33, "papa": 0.5, "cebolla": 0.25 }, como: "Dore el pollo con cebolla, agregue la papa en trozos y un poco de agua, y cocine tapado." },
    { nombre: "Carne con arroz y tajadas", momentos: ["almuerzo"], ing: { "carne de res": 0.33, "arroz": 0.2, "platano": 0.5 }, como: "Ase la carne, haga el arroz y fría el plátano en tajadas." },
    { nombre: "Arroz con atún", momentos: ["almuerzo", "comida"], ing: { "arroz": 0.2, "atun": 1, "tomate": 0.5 }, como: "Mezcle el arroz cocido con el atún y el tomate picado." },
    { nombre: "Tortilla de papa", momentos: ["comida"], ing: { "huevos": 2, "papa": 0.5, "cebolla": 0.25 }, como: "Fría la papa en rodajas con cebolla, agregue los huevos batidos y cocine por ambos lados." },
    { nombre: "Salchipapa casera", momentos: ["comida"], ing: { "salchichas": 0.25, "papa": 0.5 }, como: "Fría la papa en bastones y las salchichas en rodajas, y sírvalas juntas." },
    { nombre: "Sopa de pasta con pollo", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.15, "pollo": 0.2, "papa": 0.25, "zanahoria": 0.5 }, como: "Hierva el pollo con papa y zanahoria; al final agregue la pasta hasta que ablande." },
    { nombre: "Huevos con tocineta y arepa", momentos: ["desayuno"], ing: { "huevos": 2, "tocineta": 0.2, "arepas": 0.2 }, como: "Dore la tocineta en la sartén, fría los huevos en la misma grasa y sirva con la arepa." },
    { nombre: "Pasta con tocineta y huevo", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.33, "tocineta": 0.25, "huevos": 1 }, como: "Cocine la pasta. Dore la tocineta picada, apague el fuego y mezcle con la pasta caliente y el huevo batido." },
    { nombre: "Arroz con tocineta y huevo", momentos: ["almuerzo", "comida"], ing: { "arroz": 0.2, "tocineta": 0.2, "huevos": 1 }, como: "Dore la tocineta picada, saltee el arroz cocido en esa grasa y ponga un huevo frito encima." },
    { nombre: "Sándwich de tocineta y huevo", momentos: ["desayuno", "comida"], ing: { "pan tajado": 0.25, "tocineta": 0.2, "huevos": 1 }, como: "Dore la tocineta, fría el huevo y arme el sándwich." },
    { nombre: "Chorizo con arepa", momentos: ["desayuno", "comida"], ing: { "chorizo": 1, "arepas": 0.2 }, como: "Ase el chorizo a fuego medio hasta que dore y sírvalo con la arepa." },
    { nombre: "Pescado con arroz y tajadas", momentos: ["almuerzo"], ing: { "pescado": 0.33, "arroz": 0.2, "platano": 0.5 }, como: "Fría o ase el pescado, haga el arroz y fría el plátano en tajadas." },
    { nombre: "Arepa con huevo y aguacate", momentos: ["desayuno", "comida"], ing: { "arepas": 0.2, "huevos": 1, "aguacate": 0.5 }, como: "Ase la arepa y sírvala con un huevo frito y medio aguacate." }
  ];

  function n(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
  // Clave para cruzar con las recetas: minúsculas y sin tildes.
  function clave(nombre) { var k = String(nombre || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim(); return ALIAS[k] || k; }
  function nombreBonito(k) { var s = NOMBRES[k] || k; return s.charAt(0).toUpperCase() + s.slice(1); }
  function catalogo() { return Object.keys(CATALOGO).map(function (k) { var c = CATALOGO[k]; return { clave: k, nombre: nombreBonito(k), unidad: c[0], rol: c[1], rinde: c[2], minimo: c[3], tipo: c[4] || "contable" }; }); }
  function sugerido(nombre) { var k = clave(nombre), c = CATALOGO[k]; return c ? { clave: k, unidad: c[0], rol: c[1], rinde: c[2], minimo: c[3], tipo: c[4] || "contable" } : null; }
  function cant(x) { var v = Math.round(n(x) * 10) / 10; return String(v).replace(".", ","); }
  // "1 latas" se lee mal: con una sola unidad se escribe en singular (latas → lata, unidades → unidad).
  function unidadTxt(u, c) { u = u || ""; if (n(c) !== 1) return u; return /des$/.test(u) ? u.slice(0, -2) : (/[aeo]s$/.test(u) ? u.slice(0, -1) : u); }

  /* Alimentos "de nivel" (poco, medio o lleno): se cuentan las unidades que hay y cómo está la que está en uso.
     Ejemplo: 2 bolsas de arroz, una llena y otra por la mitad = 2 unidades con la que está en uso en "medio" = 1,5 bolsas. */
  function entre(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function partes(it) {
    if (it.nivel == null) { var viejo = entre(Math.round(n(it.cantidad)), 0, 3); return { unidades: viejo > 0 ? 1 : 0, nivel: viejo }; } // formato de la versión 3.0
    var u = Math.max(0, Math.round(n(it.cantidad))), nv = entre(Math.round(n(it.nivel)), 0, 3);
    if (u === 0) nv = 0; else if (nv === 0) { u -= 1; nv = u > 0 ? 3 : 0; }
    return { unidades: u, nivel: nv };
  }
  // Cuánto hay en total, en la unidad del alimento.
  function equivalente(it) { if (it.tipo !== "nivel") return n(it.cantidad); var p = partes(it); return p.unidades === 0 ? 0 : (p.unidades - 1) + FRACCION[p.nivel]; }
  // Los botones − y +: bajan o suben el nivel de la que está en uso; al acabarse una, se pasa a la siguiente.
  function ajustarNivel(it, paso) {
    var p = partes(it), u = p.unidades, nv = p.nivel;
    if (paso < 0) { if (u > 0) { if (nv > 1) nv -= 1; else { u -= 1; nv = u > 0 ? 3 : 0; } } }
    else if (u === 0) { u = 1; nv = 1; } else if (nv < 3) nv += 1; else u += 1;
    return { cantidad: u, nivel: nv };
  }
  function textoUnidades(it) { if (it.tipo !== "nivel") return cant(it.cantidad) + (it.unidad ? " " + unidadTxt(it.unidad, it.cantidad) : "");
    var p = partes(it); return p.unidades === 0 ? "Se acabó" : p.unidades + " " + unidadTxt(it.unidad || "unidades", p.unidades); }
  function textoNivel(it) { if (it.tipo !== "nivel") return ""; var p = partes(it); return p.unidades === 0 ? "" : "en uso: " + NIVELES[p.nivel].toLowerCase(); }
  function textoCantidad(it) { var nv = textoNivel(it); return textoUnidades(it) + (nv ? " (" + nv + ")" : ""); }
  // Las recetas van en la unidad del catálogo. Si el alimento se guardó en kilos y el catálogo usa libras, un kilo son dos libras.
  function factor(it) { var c = CATALOGO[it.clave || clave(it.nombre)]; return c && c[0] === "libras" && it.unidad === "kilos" ? 2 : 1; }

  // ¿Se está acabando? En los contables, cuando queda menos del mínimo (o nada); en los de nivel, cuando está en "Poco" o "Se acabó".
  function enAlerta(it) { return it.tipo === "nivel" ? equivalente(it) <= 0.25 : (n(it.cantidad) <= 0 || n(it.cantidad) < n(it.minimo)); }

  /* Estimado de comidas: cada comida completa necesita una porción de base (arroz, pasta, pan…) y una de proteína.
     Es una aproximación: sirve para saber si hay para pocos días o para muchos, no para contar exacto. */
  function resumen(items, comidasPorDia) {
    var base = 0, prot = 0, alertas = [];
    items.forEach(function (it) {
      if (enAlerta(it)) alertas.push(it);
      var p = equivalente(it) * n(it.rinde);
      if (it.rol === "base") base += p; else if (it.rol === "proteina") prot += p;
    });
    var comidas = Math.floor(Math.min(base, prot)), porDia = comidasPorDia || 3;
    return { alertas: alertas, porcionesBase: Math.floor(base), porcionesProteina: Math.floor(prot), comidas: comidas,
      dias: Math.floor(comidas / porDia * 10) / 10, limita: base < prot ? "base" : (prot < base ? "proteina" : "") };
  }

  /* Días que duran las comidas cuando esta semana se almuerza fuera algunos días.
     Lo que queda de esta semana se cuenta con menos comidas en casa; de la próxima semana en adelante,
     con las 3 comidas diarias, porque todavía no se sabe si se almorzará fuera. */
  function diasQueDura(comidas, almuerzosFuera, diasQueQuedanDeSemana) {
    var f = Math.max(0, Math.min(7, n(almuerzosFuera))), d = Math.max(0, Math.min(7, n(diasQueQuedanDeSemana)));
    var ritmo = (21 - f) / 7, cabe = d * ritmo;
    var dias = n(comidas) <= cabe ? n(comidas) / ritmo : d + (n(comidas) - cabe) / 3;
    return Math.floor(dias * 10) / 10;
  }

  function indice(items) { var o = {}; items.forEach(function (it) { o[it.clave || clave(it.nombre)] = it; }); return o; }

  /* Recetas de un momento del día: las que se pueden hacer ya y las que quedan a uno o dos ingredientes. */
  function recetas(items, momento) {
    var idx = indice(items), listas = [], casi = [];
    RECETAS.forEach(function (r) {
      if (r.momentos.indexOf(momento) < 0) return;
      var faltan = [], veces = Infinity;
      Object.keys(r.ing).forEach(function (k) {
        var it = idx[k], necesita = r.ing[k], tiene = it ? equivalente(it) * factor(it) : 0;
        if (tiene < necesita) faltan.push({ clave: k, nombre: nombreBonito(k), necesita: necesita, tiene: tiene, precio: it ? n(it.precio) : 0, unidad: (CATALOGO[k] || [""])[0] });
        else veces = Math.min(veces, Math.floor(tiene / necesita));
      });
      if (!faltan.length) listas.push({ receta: r, veces: veces });
      else if (faltan.length <= 2) casi.push({ receta: r, faltan: faltan });
    });
    casi.sort(function (a, b) { return a.faltan.length - b.faltan.length; });
    return { listas: listas, casi: casi };
  }

  // Al cocinar una receta se descuenta de la despensa. Devuelve solo los alimentos que cambiaron.
  // Los de nivel no se descuentan: su nivel se ajusta a ojo con los botones − y +.
  function cocinar(items, receta) {
    var idx = indice(items), cambios = [];
    Object.keys(receta.ing).forEach(function (k) { var it = idx[k]; if (!it || it.tipo === "nivel") return;
      var c = Object.assign({}, it); c.cantidad = Math.max(0, Math.round((n(it.cantidad) - receta.ing[k] / factor(it)) * 100) / 100); cambios.push(c); });
    return cambios;
  }

  /* Lista de compras: lo que está en alerta, con cuánto comprar para quedar por encima del mínimo y el costo si se conoce el precio. */
  function listaCompras(items) {
    var lista = items.filter(enAlerta).map(function (it) {
      var comprar = it.tipo === "nivel" ? 1 : Math.max(1, Math.ceil(n(it.minimo) * 2 - n(it.cantidad)));
      return { id: it.id, nombre: it.nombre, comprar: comprar, unidad: it.unidad || "unidades", costo: n(it.precio) * comprar, sinPrecio: !n(it.precio) };
    });
    var total = 0, sinPrecio = 0; lista.forEach(function (x) { total += x.costo; if (x.sinPrecio) sinPrecio++; });
    return { lista: lista, total: total, sinPrecio: sinPrecio };
  }

  // Alimentos de la despensa que el recetario no usa en ninguna receta (por ejemplo, uno escrito con un nombre que no conoce).
  function sinReceta(items) {
    var usados = {}; RECETAS.forEach(function (r) { Object.keys(r.ing).forEach(function (k) { usados[k] = true; }); });
    return items.filter(function (it) { var k = it.clave || clave(it.nombre), c = CATALOGO[k]; return !usados[k] && (!c || c[1] !== "otro"); });
  }

  return { UNIDADES: UNIDADES, partes: partes, equivalente: equivalente, ajustarNivel: ajustarNivel, textoUnidades: textoUnidades, textoNivel: textoNivel, sinReceta: sinReceta,
    catalogo: catalogo, sugerido: sugerido, clave: clave, enAlerta: enAlerta, resumen: resumen, diasQueDura: diasQueDura, recetas: recetas, cocinar: cocinar,
    listaCompras: listaCompras, textoCantidad: textoCantidad, unidadTxt: unidadTxt, cant: cant, NIVELES: NIVELES, RECETAS: RECETAS };
})();
if (typeof module !== "undefined") module.exports = Despensa;

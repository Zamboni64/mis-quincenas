/* Despensa: catálogo de alimentos, recetario básico y cálculos. No toca la pantalla.

   Cada alimento guardado tiene:
     nombre, clave (para cruzarlo con las recetas), tipo ("contable" o "nivel"), unidad,
     cantidad: en los contables, cuánto hay (puede llevar decimales); en los de nivel, cuántas unidades hay contando la que está en uso,
     nivel (solo en los de nivel): cómo está la que está en uso: 3 lleno, 2 medio, 1 poco,
     fino (solo en los de nivel, opcional): la fracción exacta que queda de la que está en uso, cuando la app la ha ido descontando,
     porPaquete y pieza (opcionales): cuántas piezas o porciones trae cada unidad ("cada bolsa trae 20 tajadas", "cada paquete rinde 4 porciones"),
     minimo (solo contables: avisa cuando queda menos de eso; va en piezas si el alimento tiene porPaquete),
     rol ("base", "proteina", "acompanante" u "otro"), rinde (comidas por unidad) y precio (por unidad de compra, opcional),
     seg y rindeSug (opcionales): seguimiento para aprender cuánto rinde de verdad cada unidad (ver trasCorreccion). */
var Despensa = (function () {
  "use strict";

  // nombre: [unidad, rol, rinde (comidas por unidad), mínimo sugerido, tipo, cuánto trae cada unidad, de qué (pieza)]
  var CATALOGO = {
    "huevos": ["unidades", "proteina", 0.5, 4], "pollo": ["libras", "proteina", 3, 1, "", 3, "porciones"], "carne molida": ["libras", "proteina", 4, 1, "", 4, "porciones"],
    "carne de res": ["libras", "proteina", 3, 1, "", 3, "porciones"], "cerdo": ["libras", "proteina", 3, 1, "", 3, "porciones"], "atun": ["latas", "proteina", 1, 2],
    "salchichas": ["paquetes", "proteina", 4, 1, "", 8, "unidades"], "frijoles": ["libras", "proteina", 6, 1, "", 6, "porciones"], "lentejas": ["libras", "proteina", 6, 1, "", 6, "porciones"],
    "queso": ["libras", "proteina", 8, 0.5, "", 8, "porciones"], "jamon": ["paquetes", "proteina", 5, 1, "", 10, "tajadas"],
    "tocineta": ["paquetes", "proteina", 5, 1, "", 5, "porciones"], "chorizo": ["unidades", "proteina", 1, 2], "pescado": ["libras", "proteina", 3, 1, "", 3, "porciones"],
    "arroz": ["libras", "base", 5, 1, "", 5, "porciones"], "pasta": ["paquetes", "base", 4, 1, "", 4, "porciones"], "pan tajado": ["bolsas", "base", 10, 1, "", 20, "tajadas"],
    "arepas": ["paquetes", "base", 5, 1, "", 5, "unidades"], "papa": ["libras", "base", 2, 1, "", 2, "porciones"], "platano": ["unidades", "base", 2, 1],
    "yuca": ["libras", "base", 3, 1, "", 3, "porciones"], "avena": ["bolsas", "base", 8, 1, "", 8, "porciones"],
    "tomate": ["unidades", "acompanante", 0, 2], "cebolla": ["unidades", "acompanante", 0, 1], "zanahoria": ["unidades", "acompanante", 0, 1],
    "aguacate": ["unidades", "acompanante", 0, 1], "banano": ["unidades", "acompanante", 0, 2], "limon": ["unidades", "acompanante", 0, 2],
    "leche": ["litros", "otro", 0, 1, "", 4, "porciones"], "chocolate": ["pastillas", "otro", 0, 2], "panela": ["unidades", "otro", 0, 1],
    "sal": ["bolsas", "otro", 0, 1, "nivel"], "azucar": ["bolsas", "otro", 0, 1, "nivel"], "aceite": ["botellas", "otro", 0, 1, "nivel"],
    "cafe": ["bolsas", "otro", 0, 1, "nivel"], "mantequilla": ["unidades", "otro", 0, 1, "nivel"], "condimentos": ["frascos", "otro", 0, 1, "nivel"],
    "salsa de tomate": ["frascos", "otro", 0, 1, "nivel"], "ajo": ["unidades", "otro", 0, 1, "", 5, "unidades"], "ajo en polvo": ["frascos", "otro", 0, 1, "nivel"]
  };
  // De qué puede traer piezas un paquete o una bolsa.
  var PIEZAS = ["porciones", "unidades", "tajadas", "piezas", "muslos", "presas", "filetes"];
  // Unidades que se pueden elegir en el formulario.
  var UNIDADES = ["unidades", "libras", "kilos", "bolsas", "paquetes", "latas", "litros", "botellas", "cajas", "frascos", "pastillas"];
  // Otras formas de escribir el mismo alimento.
  var ALIAS = { "huevo": "huevos", "arepa": "arepas", "pan": "pan tajado", "papas": "papa", "tomates": "tomate", "cebollas": "cebolla", "zanahorias": "zanahoria",
    "platanos": "platano", "bananos": "banano", "limones": "limon", "aguacates": "aguacate", "salchicha": "salchichas", "frijol": "frijoles", "lenteja": "lentejas",
    "ajos": "ajo", "espagueti": "pasta", "espaguetis": "pasta", "spaghetti": "pasta", "tocino": "tocineta", "chorizos": "chorizo", "carne": "carne de res", "pechuga": "pollo", "avena en hojuelas": "avena" };
  var FRACCION = [0, 0.25, 0.5, 1]; // cuánto de una unidad queda en cada nivel
  var NOMBRES = { "atun": "Atún", "jamon": "Jamón", "platano": "Plátano", "limon": "Limón", "azucar": "Azúcar", "cafe": "Café" };
  var NIVELES = ["Se acabó", "Poco", "Medio", "Lleno"];

  // Recetas para una porción. Las cantidades van en la unidad del catálogo (0.2 libras de arroz = 1 de las 5 porciones de una libra).
  // Sal, aceite y condimentos se dan por supuestos.
  var RECETAS = [
    { nombre: "Huevos pericos con arepa", momentos: ["desayuno"], ing: { "huevos": 2, "tomate": 0.5, "cebolla": 0.25, "arepas": 0.2 }, como: "Sofría tomate y cebolla picados, agregue los huevos y revuelva. Acompañe con la arepa." },
    { nombre: "Huevos revueltos con pan", momentos: ["desayuno"], ing: { "huevos": 2, "pan tajado": 0.1 }, como: "Revuelva los huevos en la sartén y sírvalos con dos tajadas de pan." },
    { nombre: "Arepa con queso", momentos: ["desayuno", "comida"], ing: { "arepas": 0.2, "queso": 0.1 }, como: "Ase la arepa y póngale el queso encima hasta que se derrita." },
    { nombre: "Avena con banano", momentos: ["desayuno"], ing: { "avena": 0.125, "leche": 0.25, "banano": 1 }, como: "Cocine la avena en la leche unos minutos y agregue el banano en rodajas." },
    { nombre: "Calentado", momentos: ["desayuno"], ing: { "arroz": 0.2, "frijoles": 0.15, "huevos": 1 }, como: "Sofría el arroz y los frijoles del día anterior y ponga un huevo frito encima." },
    { nombre: "Sándwich de jamón y queso", momentos: ["desayuno", "comida"], ing: { "pan tajado": 0.1, "jamon": 0.2, "queso": 0.1 }, como: "Arme el sándwich y dórelo en la sartén por ambos lados." },
    { nombre: "Chocolate con pan y queso", momentos: ["desayuno"], ing: { "chocolate": 1, "leche": 0.25, "pan tajado": 0.1, "queso": 0.1 }, como: "Prepare el chocolate en la leche y acompáñelo con pan y queso." },
    { nombre: "Arroz con huevo", momentos: ["almuerzo", "comida"], ing: { "arroz": 0.2, "huevos": 2 }, como: "Cocine el arroz y sírvalo con dos huevos fritos encima." },
    { nombre: "Arroz con pollo", momentos: ["almuerzo"], ing: { "arroz": 0.2, "pollo": 0.33, "zanahoria": 0.5, "cebolla": 0.25 }, como: "Cocine y desmeche el pollo, sofría cebolla y zanahoria, y mezcle todo con el arroz." },
    { nombre: "Pasta con atún", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.25, "atun": 1, "tomate": 1, "cebolla": 0.25 }, como: "Cocine la pasta. Sofría tomate y cebolla, agregue el atún y mezcle." },
    { nombre: "Pasta con carne molida", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.25, "carne molida": 0.25, "tomate": 1, "cebolla": 0.25 }, como: "Dore la carne con cebolla, agregue el tomate picado y sirva sobre la pasta." },
    { nombre: "Lentejas con arroz", momentos: ["almuerzo"], ing: { "lentejas": 0.17, "arroz": 0.2, "zanahoria": 0.5, "cebolla": 0.25 }, como: "Cocine las lentejas con zanahoria y cebolla hasta que ablanden. Sirva con arroz." },
    { nombre: "Frijoles con arroz y tajadas", momentos: ["almuerzo"], ing: { "frijoles": 0.17, "arroz": 0.2, "platano": 0.5 }, como: "Cocine los frijoles, haga el arroz y fría el plátano en tajadas." },
    { nombre: "Pollo con papa", momentos: ["almuerzo", "comida"], ing: { "pollo": 0.33, "papa": 0.5, "cebolla": 0.25 }, como: "Dore el pollo con cebolla, agregue la papa en trozos y un poco de agua, y cocine tapado." },
    { nombre: "Carne con arroz y tajadas", momentos: ["almuerzo"], ing: { "carne de res": 0.33, "arroz": 0.2, "platano": 0.5 }, como: "Ase la carne, haga el arroz y fría el plátano en tajadas." },
    { nombre: "Arroz con atún", momentos: ["almuerzo", "comida"], ing: { "arroz": 0.2, "atun": 1, "tomate": 0.5 }, como: "Mezcle el arroz cocido con el atún y el tomate picado." },
    { nombre: "Tortilla de papa", momentos: ["comida"], ing: { "huevos": 2, "papa": 0.5, "cebolla": 0.25 }, como: "Fría la papa en rodajas con cebolla, agregue los huevos batidos y cocine por ambos lados." },
    { nombre: "Salchipapa casera", momentos: ["comida"], ing: { "salchichas": 0.25, "papa": 0.5 }, como: "Fría la papa en bastones y las salchichas en rodajas, y sírvalas juntas." },
    { nombre: "Sopa de pasta con pollo", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.125, "pollo": 0.2, "papa": 0.25, "zanahoria": 0.5 }, como: "Hierva el pollo con papa y zanahoria; al final agregue la pasta hasta que ablande." },
    { nombre: "Huevos con tocineta y arepa", momentos: ["desayuno"], ing: { "huevos": 2, "tocineta": 0.2, "arepas": 0.2 }, como: "Dore la tocineta en la sartén, fría los huevos en la misma grasa y sirva con la arepa." },
    { nombre: "Pasta con tocineta y huevo", momentos: ["almuerzo", "comida"], ing: { "pasta": 0.25, "tocineta": 0.2, "huevos": 1 }, como: "Cocine la pasta. Dore la tocineta picada, apague el fuego y mezcle con la pasta caliente y el huevo batido." },
    { nombre: "Arroz con tocineta y huevo", momentos: ["almuerzo", "comida"], ing: { "arroz": 0.2, "tocineta": 0.2, "huevos": 1 }, como: "Dore la tocineta picada, saltee el arroz cocido en esa grasa y ponga un huevo frito encima." },
    { nombre: "Sándwich de tocineta y huevo", momentos: ["desayuno", "comida"], ing: { "pan tajado": 0.1, "tocineta": 0.2, "huevos": 1 }, como: "Dore la tocineta, fría el huevo y arme el sándwich." },
    { nombre: "Chorizo con arepa", momentos: ["desayuno", "comida"], ing: { "chorizo": 1, "arepas": 0.2 }, como: "Ase el chorizo a fuego medio hasta que dore y sírvalo con la arepa." },
    { nombre: "Pescado con arroz y tajadas", momentos: ["almuerzo"], ing: { "pescado": 0.33, "arroz": 0.2, "platano": 0.5 }, como: "Fría o ase el pescado, haga el arroz y fría el plátano en tajadas." },
    { nombre: "Arepa con huevo y aguacate", momentos: ["desayuno", "comida"], ing: { "arepas": 0.2, "huevos": 1, "aguacate": 0.5 }, como: "Ase la arepa y sírvala con un huevo frito y medio aguacate." }
  ];

  function n(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
  // Clave para cruzar con las recetas: minúsculas y sin tildes.
  function clave(nombre) { var k = String(nombre || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim(); return ALIAS[k] || k; }
  function nombreBonito(k) { var s = NOMBRES[k] || k; return s.charAt(0).toUpperCase() + s.slice(1); }
  // Lo que se propone al escribir un alimento conocido. Si trae piezas o porciones, el mínimo va en piezas (cerca de un tercio de una unidad).
  function ficha(k) { var c = CATALOGO[k]; return { clave: k, nombre: nombreBonito(k), unidad: c[0], rol: c[1], rinde: c[2], minimo: c[5] ? Math.ceil(c[5] * 0.3) : c[3], tipo: c[4] || "contable", porPaquete: c[5] || 0, pieza: c[6] || "" }; }
  function catalogo() { return Object.keys(CATALOGO).map(ficha); }
  function sugerido(nombre) { var k = clave(nombre); return CATALOGO[k] ? ficha(k) : null; }
  function cant(x) { var v = Math.round(n(x) * 10) / 10; return String(v).replace(".", ","); }
  // "1 latas" se lee mal: con una sola unidad se escribe en singular (latas → lata, unidades → unidad).
  function unidadTxt(u, c) { u = u || ""; if (Math.round(n(c) * 10) / 10 !== 1) return u;
    return /ciones$/.test(u) ? u.slice(0, -6) + "ción" : (/des$/.test(u) ? u.slice(0, -2) : (/[aeo]s$/.test(u) ? u.slice(0, -1) : u)); }

  /* Alimentos "de nivel" (poco, medio o lleno): se cuentan las unidades que hay y cómo está la que está en uso.
     Ejemplo: 2 bolsas de arroz, una llena y otra por la mitad = 2 unidades con la que está en uso en "medio" = 1,5 bolsas. */
  function entre(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function partes(it) {
    if (it.nivel == null) { var viejo = entre(Math.round(n(it.cantidad)), 0, 3); return { unidades: viejo > 0 ? 1 : 0, nivel: viejo }; } // formato de la versión 3.0
    var u = Math.max(0, Math.round(n(it.cantidad))), nv = entre(Math.round(n(it.nivel)), 0, 3);
    if (u === 0) nv = 0; else if (nv === 0) { u -= 1; nv = u > 0 ? 3 : 0; }
    return { unidades: u, nivel: nv };
  }
  // Cuánto hay en total, en la unidad de compra del alimento (bolsas, paquetes, libras…). 2 llenas y una por la mitad = 2,5.
  function equivalente(it) { if (it.tipo !== "nivel") return n(it.cantidad); var p = partes(it); if (p.unidades === 0) return 0;
    var f = (typeof it.fino === "number" && it.fino > 0 && it.fino <= 1 && n(it.nivel) >= 1) ? it.fino : FRACCION[p.nivel];
    return (p.unidades - 1) + f; }
  // Devuelve una copia del alimento con esa cantidad total. En los de nivel calcula cuántas quedan y cómo va la que está en uso.
  function conEquivalente(it, eq) {
    var c = Object.assign({}, it); eq = Math.max(0, Math.round(eq * 10000) / 10000);
    if (it.tipo !== "nivel") { c.cantidad = eq; return c; }
    var u = Math.ceil(eq - 1e-6); if (u <= 0) { c.cantidad = 0; c.nivel = 0; delete c.fino; return c; }
    var f = eq - (u - 1); c.cantidad = u; c.nivel = f > 0.625 ? 3 : (f > 0.375 ? 2 : 1); c.fino = Math.round(f * 10000) / 10000; return c;
  }
  // Piezas o porciones: cuántas trae cada unidad y cuántas quedan en total.
  function porPaq(it) { return n(it.porPaquete) > 0 ? it.porPaquete : 0; }
  function piezas(it) { return Math.round(equivalente(it) * porPaq(it) * 10) / 10; }
  function nombrePieza(it, c) { return unidadTxt(it.pieza || "porciones", c); }
  // Los botones − y + en un alimento contable con piezas: suben o bajan de a una pieza (una tajada, un muslo).
  function conPiezas(it, cuantas) { return conEquivalente(it, Math.max(0, cuantas) / porPaq(it)); }
  // Los botones − y +: bajan o suben el nivel de la que está en uso; al acabarse una, se pasa a la siguiente.
  function ajustarNivel(it, paso) {
    var p = partes(it), u = p.unidades, nv = p.nivel;
    if (paso < 0) { if (u > 0) { if (nv > 1) nv -= 1; else { u -= 1; nv = u > 0 ? 3 : 0; } } }
    else if (u === 0) { u = 1; nv = 1; } else if (nv < 3) nv += 1; else u += 1;
    return { cantidad: u, nivel: nv };
  }
  // Texto principal y secundario de lo que hay. Con piezas: "18 tajadas" y "0,9 bolsas"; por nivel: "3 bolsas" y "en uso: medio, unas 12 porciones".
  function textoUnidades(it) {
    if (it.tipo !== "nivel") { if (porPaq(it)) { var pz = piezas(it); return cant(pz) + " " + nombrePieza(it, pz); }
      return cant(it.cantidad) + (it.unidad ? " " + unidadTxt(it.unidad, it.cantidad) : ""); }
    var p = partes(it); return p.unidades === 0 ? "Se acabó" : p.unidades + " " + unidadTxt(it.unidad || "unidades", p.unidades); }
  function textoNivel(it) {
    if (it.tipo !== "nivel") return porPaq(it) ? cant(equivalente(it)) + " " + unidadTxt(it.unidad || "unidades", equivalente(it)) : "";
    var p = partes(it); if (p.unidades === 0) return "";
    return "en uso: " + NIVELES[p.nivel].toLowerCase() + (porPaq(it) ? ", ≈ " + cant(piezas(it)) + " " + nombrePieza(it, piezas(it)) : ""); }
  function textoCantidad(it) { var nv = textoNivel(it); return textoUnidades(it) + (nv ? " (" + nv + ")" : ""); }
  // Las recetas van en la unidad del catálogo. Si el alimento se guardó en kilos y el catálogo usa libras, un kilo son dos libras.
  function factor(it) { var c = CATALOGO[it.clave || clave(it.nombre)]; return c && c[0] === "libras" && it.unidad === "kilos" ? 2 : 1; }

  // ¿Se está acabando? En los contables, cuando queda menos del mínimo (o nada); en los de nivel, cuando está en "Poco" o "Se acabó".
  function enAlerta(it) { if (it.tipo === "nivel") return equivalente(it) <= 0.3;
    return n(it.cantidad) <= 0 || (porPaq(it) ? piezas(it) : n(it.cantidad)) < n(it.minimo); }

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
  /* `propias` son las recetas guardadas por el usuario, ya pasadas por interna(). Si una se llama igual que una del recetario, gana la del usuario.
     En una receta propia, un ingrediente con cantidad 0 solo pide que haya algo de ese alimento. */
  function recetas(items, momento, propias) {
    var idx = indice(items), listas = [], casi = [], mias = {};
    (propias || []).forEach(function (r) { mias[clave(r.nombre)] = true; });
    RECETAS.filter(function (r) { return !mias[clave(r.nombre)]; }).concat(propias || []).forEach(function (r) {
      if (r.momentos.indexOf(momento) < 0) return;
      var faltan = [], veces = Infinity;
      Object.keys(r.ing).forEach(function (k) {
        var it = idx[k], necesita = it ? necesitaDe(r, k, it) : n(r.ing[k]), tiene = it ? equivalente(it) : 0;
        if (tiene + 1e-6 < necesita || tiene <= 0) faltan.push({ clave: k, nombre: (r.nombres && r.nombres[k]) || nombreBonito(k), necesita: necesita, tiene: tiene, precio: it ? n(it.precio) : 0, unidad: it ? it.unidad : (CATALOGO[k] || [""])[0] });
        else if (necesita > 0) veces = Math.min(veces, Math.floor(tiene / necesita + 1e-6));
      });
      if (!faltan.length) listas.push({ receta: r, veces: veces });
      else if (faltan.length <= 2) casi.push({ receta: r, faltan: faltan });
    });
    casi.sort(function (a, b) { return a.faltan.length - b.faltan.length; });
    return { listas: listas, casi: casi };
  }

  /* Cuánto gasta una receta de un alimento, en la unidad de compra de ese alimento.
     Las recetas propias ya vienen convertidas (ver interna). Las del recetario van en la unidad del catálogo:
     si el alimento dice cuánto trae cada unidad, se pasa por piezas (0.2 libras de arroz = 1 porción = 1/5 de una bolsa que rinde 5). */
  function necesitaDe(r, k, it) {
    var q = n(r.ing[k]); if (r.propia || !q) return q;
    var c = CATALOGO[k], P = porPaq(it);
    if (P && c && c[5]) return q * c[5] / P;
    if (P && c && unidadBase(it.pieza) === unidadBase(c[0])) return q / P; // p. ej. huevos guardados por cubetas de 30 unidades
    return q / factor(it);
  }

  // Al cocinar una receta se descuenta de la despensa (`veces` porciones; por defecto una). Devuelve solo los alimentos que cambiaron.
  // En los de nivel baja la fracción de la unidad en uso, y el nivel (lleno, medio, poco) se ajusta solo.
  function cocinar(items, receta, veces) {
    var idx = indice(items), cambios = [], v = n(veces) > 0 ? veces : 1;
    Object.keys(receta.ing).forEach(function (k) { var it = idx[k]; if (!it) return; var gasto = necesitaDe(receta, k, it) * v; if (!gasto) return;
      var c = conEquivalente(it, equivalente(it) - gasto), P = porPaq(it);
      if (c.seg && P) c.seg = { eq0: n(c.seg.eq0), n: Math.round((n(c.seg.n) + gasto * P) * 100) / 100 }; // porciones gastadas, para aprender cuánto rinde
      cambios.push(c); });
    return cambios;
  }

  /* Aprender cuánto rinde una bolsa o un paquete (solo alimentos que se miden en porciones).
     `seg` guarda cuántas unidades había cuando todas estaban llenas (eq0) y cuántas porciones se han cocinado desde entonces (n).
     Cuando usted corrige a mano y deja otra vez todas llenas (se acabó una bolsa), se compara: porciones cocinadas / bolsas gastadas.
     Si no coincide con lo que la app creía, queda una propuesta en `rindeSug` para que usted decida. */
  function aprende(it) { return porPaq(it) > 0 && unidadBase(it.pieza || "porciones") === "porcion"; }
  function casiEntero(x) { return Math.abs(x - Math.round(x)) < 0.01; }
  function trasCorreccion(antes, despues) {
    var d = Object.assign({}, despues), s0 = antes && antes.seg, eq = equivalente(d), P = porPaq(d);
    delete d.seg;
    if (!aprende(d)) return d;
    if (s0 && n(s0.n) >= 2 && casiEntero(eq)) { var gastadas = n(s0.eq0) - eq;
      if (gastadas > 0.99 && casiEntero(gastadas)) { var est = Math.round(s0.n / gastadas); if (est !== P && est >= P / 2.5 && est <= P * 2.5) d.rindeSug = est; } }
    if (casiEntero(eq) && eq > 0.5) d.seg = { eq0: Math.round(eq), n: 0 };
    return d;
  }
  // Al comprar, las unidades nuevas se suman al punto de partida del seguimiento.
  function trasCompra(despues, compradas) {
    var d = Object.assign({}, despues), eq = equivalente(d);
    if (!aprende(d)) { delete d.seg; return d; }
    if (d.seg) d.seg = { eq0: n(d.seg.eq0) + n(compradas), n: n(d.seg.n) };
    else if (casiEntero(eq) && eq > 0.5) d.seg = { eq0: Math.round(eq), n: 0 };
    return d;
  }

  /* Lista de compras: lo que está en alerta, con cuánto comprar para quedar por encima del mínimo y el costo si se conoce el precio. */
  function listaCompras(items) {
    var lista = items.filter(enAlerta).map(function (it) {
      var comprar = it.tipo === "nivel" ? 1 : (porPaq(it) ? Math.max(1, Math.ceil((n(it.minimo) * 2 - piezas(it)) / porPaq(it))) : Math.max(1, Math.ceil(n(it.minimo) * 2 - n(it.cantidad))));
      return { id: it.id, nombre: it.nombre, comprar: comprar, unidad: it.unidad || "unidades", costo: n(it.precio) * comprar, sinPrecio: !n(it.precio) };
    });
    var total = 0, sinPrecio = 0; lista.forEach(function (x) { total += x.costo; if (x.sinPrecio) sinPrecio++; });
    return { lista: lista, total: total, sinPrecio: sinPrecio };
  }

  // Alimentos de la despensa que el recetario no usa en ninguna receta (por ejemplo, uno escrito con un nombre que no conoce).
  function sinReceta(items, propias) {
    var usados = {}; RECETAS.concat(propias || []).forEach(function (r) { Object.keys(r.ing).forEach(function (k) { usados[k] = true; }); });
    return items.filter(function (it) { var k = it.clave || clave(it.nombre), c = CATALOGO[k]; return !usados[k] && (!c || c[1] !== "otro"); });
  }

  /* ---------- Recetas y menú que vienen de Claude ----------
     La app arma una pregunta, Claude responde con un bloque JSON y aquí se lee y se limpia ese bloque. */
  var MOMENTOS = ["desayuno", "almuerzo", "comida"];
  function texto(v, max) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max); }
  function numero(v) { var x = typeof v === "number" ? v : parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) && x > 0 ? Math.round(x * 1000) / 1000 : 0; }
  function momentoDe(v) { var k = clave(v); return k === "cena" ? "comida" : (MOMENTOS.indexOf(k) >= 0 ? k : ""); }
  function leerJSON(t) {
    var a = t.indexOf("{"), b = t.lastIndexOf("}"); if (a < 0 || b <= a) throw new Error("json");
    return JSON.parse(t.slice(a, b + 1));
  }
  function leerMenu(pegado) {
    var t = String(pegado || ""), o;
    try { o = leerJSON(t); } // si falla, se intenta de nuevo cambiando las comillas curvas y los espacios raros que a veces mete el copiado
    catch (e) { try { o = leerJSON(t.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/\u00A0/g, " ")); } catch (e2) { throw new Error("json"); } }
    if (!o || typeof o !== "object") throw new Error("json");
    var recs = [], vistos = {};
    (Array.isArray(o.recetas) ? o.recetas : []).slice(0, 60).forEach(function (r) {
      if (!r || typeof r !== "object") return; var nombre = texto(r.nombre, 70); if (!nombre || vistos[clave(nombre)]) return; vistos[clave(nombre)] = true;
      var moms = []; (Array.isArray(r.momentos) ? r.momentos : [r.momentos]).forEach(function (m) { m = momentoDe(m); if (m && moms.indexOf(m) < 0) moms.push(m); });
      var ings = (Array.isArray(r.ingredientes) ? r.ingredientes : []).slice(0, 25).map(function (g) {
        if (typeof g === "string") g = { alimento: g, texto: g };
        if (!g || typeof g !== "object") return null; var ali = texto(g.alimento, 40); if (!ali) return null;
        var c = numero(g.cantidad), u = texto(g.unidad, 14);
        return { alimento: ali, clave: clave(ali), cantidad: c, unidad: u, texto: texto(g.texto, 80) || ((c ? cant(c) + " " + (u ? unidadTxt(u, c) + " de " : "") : "") + ali.toLowerCase()) };
      }).filter(Boolean);
      var pasos = Array.isArray(r.pasos) ? r.pasos : [r.pasos || r.preparacion || r.como];
      pasos = pasos.map(function (p) { return texto(p, 400); }).filter(Boolean).slice(0, 15);
      recs.push({ nombre: nombre, clave: clave(nombre), momentos: moms, ingredientes: ings, pasos: pasos });
    });
    var dias = [], fechas = {};
    (Array.isArray(o.menu) ? o.menu : []).slice(0, 31).forEach(function (d) {
      if (!d || typeof d !== "object") return; var f = texto(d.fecha, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || fechas[f]) return; fechas[f] = true;
      var dia = { fecha: f }; MOMENTOS.forEach(function (m) { var v = texto(m === "comida" ? (d.comida != null ? d.comida : d.cena) : d[m], 70); dia[m] = clave(v) === "fuera" ? "fuera" : v; });
      dias.push(dia);
    });
    dias.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    // Si una receta no dice para qué momento es, se deduce de dónde aparece en el menú.
    recs.forEach(function (r) { if (r.momentos.length) return; dias.forEach(function (d) { MOMENTOS.forEach(function (m) { if (clave(d[m]) === r.clave && r.momentos.indexOf(m) < 0) r.momentos.push(m); }); }); });
    var compras = (Array.isArray(o.compras) ? o.compras : []).slice(0, 40).map(function (c) {
      if (!c || typeof c !== "object") return null; var ali = texto(c.alimento, 40); if (!ali) return null;
      return { alimento: ali, cantidad: numero(c.cantidad), unidad: texto(c.unidad, 14), precio: Math.round(numero(c.precio)) };
    }).filter(Boolean);
    if (!recs.length && !dias.length) throw new Error("vacio");
    var sin = []; dias.forEach(function (d) { MOMENTOS.forEach(function (m) { var v = d[m]; if (v && v !== "fuera" && !vistos[clave(v)] && sin.indexOf(v) < 0) sin.push(v); }); });
    return { dias: dias, recetas: recs, compras: compras, sinReceta: sin };
  }
  // Compara unidades sin importar singular o plural ("libra" = "libras").
  function unidadBase(u) { return clave(unidadTxt(clave(u), 1)); }
  /* Cuánto de un alimento pide un ingrediente de una receta guardada, en la unidad de compra de ese alimento.
     Entiende la unidad de compra ("0.2 libras") y la pieza ("2 tajadas", "1 porción"). Si viene en otra unidad, devuelve null. */
  function enUnidades(g, it) {
    var c = n(g.cantidad), u = unidadBase(g.unidad); if (!c) return 0;
    if (porPaq(it) && u === unidadBase(it.pieza || "porciones")) return c / porPaq(it);
    if (porPaq(it) && u === "diente" && (it.clave || clave(it.nombre)) === "ajo") return c / porPaq(it); // una receta que pida "2 dientes de ajo"
    if (u === unidadBase(it.unidad || "unidades")) return c;
    return null;
  }
  // Convierte una receta guardada al formato del recetario, con las cantidades ya en la unidad de compra de cada alimento.
  // Si la unidad no se puede convertir, el ingrediente queda con cantidad 0: se comprueba que haya, pero no se descuenta.
  function interna(r, items) {
    var idx = indice(items || []), ing = {}, nombres = {};
    (r.ingredientes || []).forEach(function (g) { var k = g.clave || clave(g.alimento); if (!k || basico(k, idx)) return; var it = idx[k];
      var c = it ? (enUnidades(g, it) || 0) : n(g.cantidad);
      ing[k] = (ing[k] || 0) + c; nombres[k] = g.alimento; });
    return { id: r.id, nombre: r.nombre, momentos: r.momentos || [], ing: ing, nombres: nombres, como: (r.pasos || []).join(" "), propia: true };
  }
  // Agua, sal, aceite y demás básicos: si no están anotados en la despensa, no se cuentan como faltantes.
  function basico(k, idx) { return k === "agua" || (!idx[k] && CATALOGO[k] && CATALOGO[k][4] === "nivel"); }
  // Para mostrar una receta: cada ingrediente con su estado ("ok", "falta" o "poco").
  function estadoIngredientes(r, items) {
    var idx = indice(items || []);
    return (r.ingredientes || []).map(function (g) { var k = g.clave || clave(g.alimento), it = idx[k], est = "ok";
      if (basico(k, idx)) est = "ok";
      else if (!it || equivalente(it) <= 0) est = "falta";
      else { var pide = enUnidades(g, it); if (pide && equivalente(it) + 1e-6 < pide) est = "poco"; }
      return { texto: g.texto || g.alimento, estado: est }; });
  }
  // Una receta del recetario de la app, en el mismo formato que las guardadas (para mostrarla en el menú).
  function delRecetario(nombre) {
    var r = RECETAS.filter(function (x) { return clave(x.nombre) === clave(nombre); })[0]; if (!r) return null;
    return { nombre: r.nombre, clave: clave(r.nombre), momentos: r.momentos, pasos: [r.como], fija: r,
      ingredientes: Object.keys(r.ing).map(function (k) { var c = CATALOGO[k] || ["unidades"], q = r.ing[k], u = c[0];
        if (c[5]) { q = Math.round(q * c[5] * 10) / 10; u = c[6]; } // en piezas: "1 porción de arroz", "2 tajadas de pan tajado"
        return { alimento: nombreBonito(k), clave: k, cantidad: q, unidad: u, texto: cant(q) + " " + unidadTxt(u, q) + " de " + nombreBonito(k).toLowerCase() }; }) };
  }

  /* Lista de compras del menú: cada producto lleva cuánto se pidió y cuánto se ha comprado.
     Si no se pidió una cantidad, basta una compra para darlo por comprado. */
  function faltaDe(c) { var pedido = n(c.cantidad), hecho = n(c.comprado); return pedido > 0 ? Math.max(0, Math.round((pedido - hecho) * 100) / 100) : (hecho > 0 ? 0 : 1); }
  // Suma una compra al producto de la lista que corresponda. Si la unidad es distinta no se puede restar, así que se da por comprado completo.
  function anotarCompra(lista, nombre, cantidad, unidad) {
    var k = clave(nombre), cambio = false;
    var nueva = (lista || []).map(function (c) {
      if (cambio || clave(c.alimento) !== k || faltaDe(c) <= 0) return c;
      var x = Object.assign({}, c), igual = !n(c.cantidad) || unidadBase(c.unidad) === unidadBase(unidad);
      x.comprado = igual ? Math.round((n(c.comprado) + n(cantidad)) * 100) / 100 : Math.max(n(c.cantidad), 1); cambio = true; return x;
    });
    return cambio ? nueva : null;
  }

  // Con qué pieza se llena el formulario cuando el alimento no dice una: la del catálogo, o su propia unidad si sirve como pieza (huevos: unidades).
  function piezaSugerida(nombre) { var s = sugerido(nombre); if (!s) return "porciones"; return s.pieza || (PIEZAS.indexOf(s.unidad) >= 0 ? s.unidad : "porciones"); }
  /* Comidas que rinde cada unidad de compra cuando se dice cuánto trae:
     en porciones, lo mismo que trae; si las piezas son la unidad del catálogo (una caja de 36 huevos), lo que rinde cada pieza por las que trae. */
  function rindeCon(nombre, trae, pieza, rol, actual) {
    if (rol !== "base" && rol !== "proteina") return actual;
    if (unidadBase(pieza || "porciones") === "porcion") return trae;
    var s = sugerido(nombre); if (s && !s.porPaquete && s.rinde && unidadBase(pieza) === unidadBase(s.unidad)) return Math.round(trae * s.rinde * 100) / 100;
    return actual;
  }

  return { piezaSugerida: piezaSugerida, rindeCon: rindeCon, PIEZAS: PIEZAS, porPaq: porPaq, piezas: piezas, conPiezas: conPiezas, conEquivalente: conEquivalente, nombrePieza: nombrePieza, trasCorreccion: trasCorreccion, trasCompra: trasCompra, aprende: aprende,
    faltaDe: faltaDe, anotarCompra: anotarCompra, MOMENTOS: MOMENTOS, leerMenu: leerMenu, interna: interna, estadoIngredientes: estadoIngredientes, delRecetario: delRecetario,
    UNIDADES: UNIDADES, partes: partes, equivalente: equivalente, ajustarNivel: ajustarNivel, textoUnidades: textoUnidades, textoNivel: textoNivel, sinReceta: sinReceta,
    catalogo: catalogo, sugerido: sugerido, clave: clave, enAlerta: enAlerta, resumen: resumen, diasQueDura: diasQueDura, recetas: recetas, cocinar: cocinar,
    listaCompras: listaCompras, textoCantidad: textoCantidad, unidadTxt: unidadTxt, cant: cant, NIVELES: NIVELES, RECETAS: RECETAS };
})();
if (typeof module !== "undefined") module.exports = Despensa;

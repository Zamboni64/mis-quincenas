/* Almacén local: guarda todo en el teléfono con IndexedDB, la base de datos del navegador.
   Cada "tienda" es como una tabla. Todas usan el campo `id` como llave. */
var Almacen = (function () {
  "use strict";
  var NOMBRE = "mis-quincenas", VERSION = 4; // sube cuando se agrega una tienda nueva
  var TIENDAS = ["config", "gastos", "ingresos", "pagosHechos", "ajustes", "despensa", "recetas", "menu", "freidora"];
  var bd = null;

  function abrir() {
    return new Promise(function (ok, err) {
      var r = indexedDB.open(NOMBRE, VERSION);
      r.onupgradeneeded = function () {
        var d = r.result;
        TIENDAS.forEach(function (t) {
          if (!d.objectStoreNames.contains(t)) d.createObjectStore(t, { keyPath: "id" });
        });
      };
      r.onsuccess = function () { bd = r.result; ok(); };
      r.onerror = function () { err(r.error); };
    });
  }

  // Ejecuta una operación dentro de una transacción y resuelve cuando ya quedó escrita en disco.
  function tx(tiendas, modo, fn) {
    return new Promise(function (ok, err) {
      var x = bd.transaction(tiendas, modo), res = fn(x);
      x.oncomplete = function () { ok(res && res.result); };
      x.onerror = x.onabort = function () { err(x.error); };
    });
  }

  function todos(t) { return tx(t, "readonly", function (x) { return x.objectStore(t).getAll(); }); }
  function poner(t, obj) { return tx(t, "readwrite", function (x) { return x.objectStore(t).put(obj); }); }
  function borrar(t, id) { return tx(t, "readwrite", function (x) { return x.objectStore(t).delete(id); }); }
  function nuevoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  // Lee todo de una vez: la app trabaja con los datos en memoria y escribe cada cambio aquí.
  function cargarTodo() {
    return Promise.all(TIENDAS.map(todos)).then(function (r) {
      var o = {};
      TIENDAS.forEach(function (t, i) { o[t] = r[i] || []; });
      return o;
    });
  }

  // Borra todo y deja lo que venga en `datos` (se usa al restaurar un respaldo). Es una sola transacción: o entra todo o no entra nada.
  function reemplazarTodo(datos) {
    return tx(TIENDAS, "readwrite", function (x) {
      TIENDAS.forEach(function (t) {
        var s = x.objectStore(t);
        s.clear();
        (datos[t] || []).forEach(function (obj) { s.put(obj); });
      });
    });
  }

  // Pide al navegador que no borre estos datos por falta de espacio. No siempre lo concede.
  function pedirPersistencia() {
    if (navigator.storage && navigator.storage.persist) return navigator.storage.persist().catch(function () { return false; });
    return Promise.resolve(false);
  }

  return { abrir: abrir, cargarTodo: cargarTodo, todos: todos, poner: poner, borrar: borrar, reemplazarTodo: reemplazarTodo, nuevoId: nuevoId, pedirPersistencia: pedirPersistencia };
})();

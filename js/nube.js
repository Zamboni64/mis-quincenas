/* Sincronización con la nube (Firebase).
   La app sigue guardando todo en el dispositivo (almacen.js). Este módulo solo copia los cambios
   hacia y desde Firestore cuando hay sesión iniciada. Si Firebase no carga, la app funciona igual sin sincronizar.

   Regla para decidir qué versión de un registro vale: gana la que tenga la fecha de modificación (`mod`) más reciente.
   Un registro borrado no se elimina: se marca con `borrado: true`, para que el borrado también viaje a los demás dispositivos. */
const VERSION_SDK = "10.12.2";
const BASE = "https://www.gstatic.com/firebasejs/" + VERSION_SDK + "/";
const TIENDAS = ["config", "gastos", "ingresos", "pagosHechos", "ajustes", "despensa", "recetas", "menu"];
const CLAVE_UID = "mq-sync-uid"; // recuerda con qué cuenta ya se enlazó este dispositivo

const estado = { disponible: false, usuario: null, sincronizando: false, ultima: null, error: "" };
let auth = null, db = null, A = null, F = null, usuario = null, ocupado = false, pendiente = false, escuchas = [];
const ganchos = window.MQ || {};
function avisarEstado() { if (ganchos.alEstadoNube) ganchos.alEstadoNube(Object.assign({}, estado)); }
let avisoDatos = null;
function avisarDatos() { clearTimeout(avisoDatos); avisoDatos = setTimeout(function () { if (ganchos.alCambiarNube) ganchos.alCambiarNube(); }, 150); }
function ruta(t) { return F.collection(db, "users", usuario.uid, t); }
function esSincronizable(t, x) { return !(t === "config" && x.id !== "datos"); }

/* Compara todo lo local con todo lo de la nube y copia en cada dirección lo que esté más reciente. */
async function reconciliar() {
  if (!usuario) return;
  if (ocupado) { pendiente = true; return; }
  ocupado = true; estado.sincronizando = true; estado.error = ""; avisarEstado();
  try {
    const primeraVez = localStorage.getItem(CLAVE_UID) !== usuario.uid;
    let huboCambios = false;
    for (const t of TIENDAS) {
      const snap = await F.getDocs(ruta(t));
      const remoto = {}; snap.forEach(function (d) { remoto[d.id] = d.data(); });
      const local = {}; (await Almacen.todos(t)).filter(function (x) { return esSincronizable(t, x); }).forEach(function (x) { local[x.id] = x; });
      // 1) de la nube al dispositivo
      for (const id in remoto) {
        const r = remoto[id], l = local[id];
        // La primera vez que un dispositivo se enlaza, los datos del presupuesto de la nube mandan sobre los locales.
        const gana = !l || (r.mod || "") > (l.mod || "") || (primeraVez && t === "config");
        if (gana) { if (!l || JSON.stringify(l) !== JSON.stringify(r)) { await Almacen.poner(t, r); huboCambios = true; } local[id] = r; }
      }
      // 2) del dispositivo a la nube (no se espera la respuesta: sin internet, Firebase lo envía cuando vuelva la señal)
      for (const id in local) {
        const l = local[id], r = remoto[id];
        if (!r || (l.mod || "") > (r.mod || "")) {
          if (!l.mod) { l.mod = new Date().toISOString(); await Almacen.poner(t, l); }
          F.setDoc(F.doc(db, "users", usuario.uid, t, id), l).catch(function () {});
        }
      }
    }
    localStorage.setItem(CLAVE_UID, usuario.uid);
    estado.ultima = new Date().toISOString();
    if (huboCambios) avisarDatos();
  } catch (e) {
    estado.error = (e && e.code === "permission-denied") ? "La nube rechazó el acceso. Revise las reglas de Firestore." : "No se pudo sincronizar. Se intentará de nuevo cuando haya conexión.";
  } finally {
    ocupado = false; estado.sincronizando = false; avisarEstado();
    if (pendiente) { pendiente = false; reconciliar(); }
  }
}

/* Escucha en vivo: cuando otro dispositivo cambia algo, llega aquí y se guarda en este. */
function escuchar() {
  dejarDeEscuchar();
  TIENDAS.forEach(function (t) {
    escuchas.push(F.onSnapshot(ruta(t), async function (snap) {
      if (snap.metadata && snap.metadata.hasPendingWrites) return; // es el eco de un cambio hecho aquí mismo
      const local = {}; (await Almacen.todos(t)).forEach(function (x) { local[x.id] = x; });
      let cambio = false;
      for (const d of snap.docs) { const r = d.data(), l = local[d.id];
        if (!l || (r.mod || "") > (l.mod || "")) { await Almacen.poner(t, r); cambio = true; } }
      if (cambio) { estado.ultima = new Date().toISOString(); avisarDatos(); avisarEstado(); }
    }, function () {}));
  });
}
function dejarDeEscuchar() { escuchas.forEach(function (f) { try { f(); } catch (e) {} }); escuchas = []; }

const MENSAJES = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.", "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "No existe una cuenta con ese correo.", "auth/invalid-email": "Ese correo no es válido.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Use \"Iniciar sesión\".",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.", "auth/missing-password": "Escriba la contraseña.",
  "auth/network-request-failed": "No hay conexión a internet.", "auth/too-many-requests": "Demasiados intentos. Espere unos minutos.",
  "auth/operation-not-allowed": "El inicio con correo y contraseña no está activado en Firebase.",
  "auth/admin-restricted-operation": "La creación de cuentas nuevas está desactivada en Firebase."
};
function traducir(e) {
  var c = (e && e.code) || "";
  if (MENSAJES[c]) return MENSAJES[c];
  if (c.indexOf("api-key") >= 0) return "La clave de Firebase (apiKey) no es válida. Revise js/firebase-config.js. [" + c + "]";
  if (c.indexOf("requests-from-referer") >= 0 || c === "auth/unauthorized-domain") return "Firebase no acepta solicitudes desde esta dirección. Revise los dominios autorizados. [" + c + "]";
  // Se muestra el código del error para poder diagnosticarlo.
  return "No se pudo completar. [" + (c || (e && e.message) || "error desconocido") + "]";
}
function requiere() { if (!estado.disponible) return Promise.reject(new Error("La sincronización no está disponible en este momento. Revise la conexión.")); return null; }

window.Nube = {
  estado: function () { return Object.assign({}, estado); },
  entrar: function (correo, clave) { return requiere() || A.signInWithEmailAndPassword(auth, correo, clave).catch(function (e) { throw new Error(traducir(e)); }); },
  crear: function (correo, clave) { return requiere() || A.createUserWithEmailAndPassword(auth, correo, clave).catch(function (e) { throw new Error(traducir(e)); }); },
  recuperar: function (correo) { return requiere() || A.sendPasswordResetEmail(auth, correo).catch(function (e) { throw new Error(traducir(e)); }); },
  salir: function () { return requiere() || A.signOut(auth); },
  sincronizar: function () { return reconciliar(); },
  // Sube un registro recién guardado. Sin sesión no hace nada: quedará pendiente para la próxima reconciliación.
  subir: function (t, obj) { if (!usuario || !esSincronizable(t, obj)) return; F.setDoc(F.doc(db, "users", usuario.uid, t, obj.id), obj).catch(function () {}); }
};

(async function iniciar() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey) { avisarEstado(); return; }
  try {
    const app = await import(BASE + "firebase-app.js");
    A = await import(BASE + "firebase-auth.js");
    F = await import(BASE + "firebase-firestore.js");
    const fb = app.initializeApp(cfg);
    auth = A.getAuth(fb);
    try { db = F.initializeFirestore(fb, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
    catch (e) { db = F.getFirestore(fb); }
    estado.disponible = true;
    A.onAuthStateChanged(auth, function (u) {
      usuario = u; estado.usuario = u ? u.email : null; estado.error = ""; avisarEstado();
      if (u) reconciliar().then(escuchar); else dejarDeEscuchar();
    });
    window.addEventListener("online", function () { reconciliar(); });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) reconciliar(); });
  } catch (e) {
    estado.disponible = false; estado.error = "No se pudo cargar la sincronización. La app sigue funcionando con los datos de este dispositivo.";
  }
  avisarEstado();
})();

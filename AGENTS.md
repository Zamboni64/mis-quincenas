# Mis Quincenas: reglas para las IA (Claude, Gemini y Antigravity)

Este archivo es el único con las reglas del proyecto. `CLAUDE.md` y `GEMINI.md` solo lo importan: cambie las reglas aquí.

PWA de presupuesto personal por quincenas, en pesos colombianos, con una segunda sección, "Mis comidas", para la despensa, el menú, las recetas, las compras y la freidora de aire. Es HTML, CSS y JS puros, sin frameworks ni build. **Lea `README.md`: ahí están los archivos, las reglas de cada función y cómo se publica.**

## Trabajo entre dos IA

El usuario trabaja con Claude (app de escritorio) y con Gemini (Antigravity) sobre esta misma carpeta.

- **Una IA a la vez.** Nunca edite si la otra está trabajando en la carpeta.
- **Trabaje en la rama que diga el usuario**, hoy `mejora-visual`. Revise con `git status` antes de empezar y no cambie de rama por su cuenta.
- **Informes en `revision/`:** cada IA deja ahí lo que encontró o decidió (`gemini.md`, `claude.md`, `plan.md`). Lea esos archivos antes de empezar: son la memoria compartida entre sesiones.
- **Estilo visual:** si existe `DESIGN.md`, sígalo. Si un cambio lo contradice, pregunte primero.
- **Antes de entregar,** deje el trabajo en un estado que la otra IA pueda revisar con `git diff main`. Haga commit solo si el usuario lo pide.
- **Reparto:** Gemini es mejor para lo visual (`css/estilos.css`, `index.html`, viendo la app en el navegador). Claude, para lógica y datos (`js/motor.js`, `js/app.js`, `js/almacen.js`, `js/nube.js`, respaldo). Si le toca algo de la otra parte, avise.

### Skill Impeccable (diseño)

- Está instalada para las dos IA. Úsela por pestaña o por grupo pequeño, no sobre toda la app de una vez.
- **No active su hook automático** (`impeccable hooks`). El usuario lo decidió así.
- Si quiere crear archivos en el proyecto (`PRODUCT.md`, `DESIGN.md`, `.impeccable/`), pregunte antes.
- El modo de esta app es **Operate**: es una herramienta de uso diario. Prima que se lea rápido, que sea consistente y que se vea bien en el iPhone, más que lo llamativo.

## Publicación (cuidado: es la app en uso)

- `main` se publica solo en GitHub Pages (https://zamboni64.github.io/mis-quincenas/) y llega a los teléfonos del usuario en minutos.
- **Nunca haga commit, push ni merge a `main` sin que el usuario lo pida explícitamente.**
- Antes de publicar, suba `VERSION` en `sw.js` y `VERSION_APP` en `js/app.js`, siempre con el mismo número. Sin eso, los dispositivos siguen con la versión guardada.
- **Para probar en local,** desde esta carpeta ejecute `npx -y http-server -p 8000 -c-1` y abra `http://localhost:8000`. Este equipo no tiene Python; `-c-1` evita que el navegador muestre archivos viejos.
  - El service worker no funciona con `file://`.
  - La primera vez la app aparece vacía: cargue un respaldo o empiece en cero. No use respaldos reales sin permiso del usuario.
- El artifact https://claude.ai/artifact/CqX4HDVDYXGMAjr7o89hMA es una copia empaquetada en un solo archivo de la v3.18. **La fuente de verdad es este repositorio.**

## Datos: no romper la sincronización

- Todo cambio pasa por `guardar(tienda, obj)` en `js/app.js`:
  - pone `mod` con la fecha de modificación;
  - guarda en IndexedDB (`js/almacen.js`);
  - sube a Firestore si hay sesión (`js/nube.js`).
- Borrar **no elimina**: marca `borrado: true` y se filtra con `vivo()`. En la sincronización gana el `mod` más reciente.
- Tiendas: `config, gastos, ingresos, pagosHechos, ajustes, despensa, recetas, menu, freidora`. Para agregar una tienda nueva hay que subir `VERSION` en `almacen.js` y añadirla también a `TIENDAS` en `nube.js`.
- Todo dato nuevo debe ir también en el respaldo JSON (Más → Respaldo) y restaurarse sin romper respaldos viejos.
- Antes de tocar `almacen.js`, `nube.js` o el formato de los datos, pídale al usuario que guarde un respaldo desde la app.

## Código

- `js/motor.js` y `js/despensa.js` son cálculo puro, sin DOM. Las pantallas están en `app.js`, `comida.js`, `menu.js` y `freidora.js`, que comparten utilidades por `window.MQ.app`.
- Estilo: ES5 con `var` y `function`, dentro de IIFEs; solo `nube.js` es módulo ES. Comentarios en español que explican el porqué. Mantenga el estilo de cada archivo.
- La plata se muestra con `money()` (formato `es-CO`, sin decimales).
- Las fechas son texto `AAAA-MM-DD`. Las quincenas se definen con `Motor.quincenaDe` y `Motor.diaPago`: el pago del 10 o del 25, o el viernes antes si cae en fin de semana.
- En `motor.js` hay fechas y montos escritos a mano (`2026-11`, `2027-07`, `FIN_Y`). Revíselos si cambia el horizonte de fechas.

## Interfaz

- Español de Colombia, tratando de **"usted"**, con frases cortas, claras y sin tecnicismos.
- Pensada para el iPhone:
  - una columna de máximo 520px y pestañas fijas abajo;
  - campos de 16px como mínimo, para que no haga zoom;
  - tema claro y oscuro con variables en `css/estilos.css`.
- No agregue fuentes ni librerías externas: la app debe abrir sin internet.

## Privacidad

- `privado/`, `respaldo-*.json` y `*.xlsx` están en `.gitignore` porque son datos financieros reales. No los lea si no hace falta, no los copie, no los publique y no los suba.
- Este repositorio puede ser público: **no escriba datos personales** (saldos, sueldo, deudas, nombres) en el código, en los commits, en `revision/` ni en este archivo.
- `js/firebase-config.js` es público por diseño. Lo que protege los datos son el inicio de sesión y las reglas de Firestore.

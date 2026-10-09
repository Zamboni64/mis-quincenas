# Mis Quincenas

Aplicación web instalable (PWA) para llevar un presupuesto personal por quincenas: gastos del día a día, pagos del mes, otros ingresos y plan de deudas. Funciona sin internet y guarda los datos en el propio teléfono.

## Cómo está hecha

No usa frameworks ni herramientas de compilación: es HTML, CSS y JavaScript puros.

| Archivo | Qué hace |
|---|---|
| `index.html` | La página, con sus dos secciones: Mis Quincenas (pestañas Hoy, Pagos, Ingresos, Plan, Más) y Mis comidas (Menú, Despensa, Recetas, Compras, Freidora). |
| `css/estilos.css` | Colores, tamaños y distribución. Tiene tema claro y oscuro. |
| `js/motor.js` | Los cálculos: quincenas, plan de deudas, reparto de ingresos, pagos y el generador del Excel. No toca la pantalla. |
| `js/almacen.js` | Guarda y lee los datos en el teléfono (IndexedDB). |
| `js/app.js` | La interfaz: dibuja las pantallas y responde a los botones. |
| `js/despensa.js` | Los cálculos de la despensa: catálogo de alimentos, recetario, estimado de comidas y lista de compras. No toca la pantalla. |
| `js/comida.js` | Las pantallas de Despensa, Recetas y Compras. |
| `js/menu.js` | La pestaña Menú: guarda el menú y las recetas que responde Claude y muestra el menú de cada día. |
| `js/freidora.js` | La pestaña Freidora: recetario para la freidora de aire, "La preparé" y las recetas de freidora que responde Claude. |
| `js/nube.js` | Sincronización con Firebase: inicio de sesión y copia de los cambios entre dispositivos. |
| `js/firebase-config.js` | Identificadores del proyecto de Firebase. No son secretos. |
| `sw.js` | *Service worker*: guarda los archivos para que la app abra sin internet. |
| `manifest.webmanifest` | Nombre, ícono y colores con los que se instala. |
| `icons/` | Íconos de la app. |
| `privado/` | **Sus datos personales. No se sube a GitHub** (está en `.gitignore`). |

## Probarla en el computador

Un *service worker* solo funciona si la página se sirve por `http://localhost` o por `https://`; abrir `index.html` con doble clic no sirve.

Opción 1, con VS Code: instale la extensión **Live Server**, abra esta carpeta, clic derecho sobre `index.html` y "Open with Live Server".

Opción 2, con Python, desde una terminal en esta carpeta:

```
python -m http.server 8000
```

y abra `http://localhost:8000` en el navegador.

La primera vez la app aparece vacía. Toque **Cargar un respaldo** y elija `privado/respaldo-inicial.json`.

## Publicarla en GitHub Pages

1. En github.com cree un repositorio **público** llamado `mis-quincenas`, sin README ni .gitignore.
2. En una terminal dentro de esta carpeta:

```
git init
git add .
git commit -m "Primera versión de Mis Quincenas"
git branch -M main
git remote add origin https://github.com/Zamboni64/mis-quincenas.git
git push -u origin main
```

3. Antes del `git commit`, ejecute `git status` y confirme que **no** aparece la carpeta `privado/`.
4. En el repositorio, entre a **Settings → Pages**. En "Build and deployment" elija **Deploy from a branch**, rama **main**, carpeta **/ (root)**, y guarde.
5. En uno o dos minutos la app queda en `https://zamboni64.github.io/mis-quincenas/`.

El repositorio es público, así que cualquiera puede ver el código. Por eso el código no contiene valores suyos: los datos entran únicamente por el respaldo, que vive en `privado/` y en su teléfono.

## Instalarla en el iPhone

1. Abra `https://zamboni64.github.io/mis-quincenas/` en **Safari**.
2. Toque el botón **Compartir** y luego **Agregar a pantalla de inicio**.
3. Abra la app desde el ícono nuevo.
4. Pase el archivo `privado/respaldo-inicial.json` al iPhone (por AirDrop, iCloud Drive o enviándoselo a usted mismo) y, en la app, toque **Cargar un respaldo**.

En el iPhone, la app instalada y Safari guardan los datos por separado. Use siempre la app instalada.

## Sincronización entre dispositivos

La app guarda siempre en el dispositivo. Si además inicia sesión (pestaña **Más → Sincronización**), cada cambio se copia a Firestore y llega a los demás dispositivos donde tenga la sesión abierta. Sin internet sigue funcionando y sincroniza al volver la señal.

- Cada registro lleva una fecha de modificación (`mod`). Cuando dos dispositivos tienen versiones distintas, gana la más reciente.
- Borrar no elimina el registro: lo marca con `borrado: true`, para que el borrado también viaje.
- La primera vez que un dispositivo inicia sesión, los datos del presupuesto que estén en la nube mandan sobre los locales; los gastos e ingresos de ambos lados se unen.

Configuración en la consola de Firebase (proyecto `mis-quincenas`):

1. **Authentication**: método *Correo electrónico/contraseña* activado, y `zamboni64.github.io` en los dominios autorizados.
2. **Firestore**: base de datos en modo de producción con estas reglas (pestaña *Reglas*):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Con esas reglas, cada cuenta solo puede leer y escribir sus propios datos.

3. Después de crear su cuenta desde la app, puede desactivar el registro de cuentas nuevas en **Authentication → Configuración → Acciones del usuario**.

## Días de pago

Cada quincena empieza el día en que llega el pago: el 10 y el 25 de cada mes. Si uno de esos días cae en sábado o domingo, la quincena empieza el viernes antes, que es cuando pagan. Los gastos y la plata que entra desde ese viernes cuentan para la quincena nueva. Los festivos no se tienen en cuenta.

## Respaldo

En la pestaña **Más → Respaldo**, "Guardar respaldo" crea un archivo `.json` con todo; guárdelo en Archivos o en iCloud Drive. "Restaurar un respaldo" reemplaza lo que haya en la app por lo que trae el archivo.

Haga un respaldo al menos una vez por quincena.

## Cómo publicar un cambio

```
git add .
git commit -m "Describa aquí el cambio"
git push
```

**Antes de publicar, suba el número de `VERSION` en `sw.js`** (por ejemplo de `"2.1"` a `"2.2"`) y el de `VERSION_APP` en `js/app.js`. Ese cambio es el que le avisa a cada dispositivo que hay archivos nuevos. Sin él, los dispositivos siguen mostrando la versión guardada.

GitHub Pages se actualiza solo en uno o dos minutos. En cada dispositivo, al abrir la app se descargan todos los archivos nuevos en segundo plano y la app se recarga sola una vez. La versión instalada se ve abajo en la pestaña **Más**.

## Recordatorios en el calendario

En la pestaña **Pagos**, "Crear recordatorios" genera un archivo `.ics` con los pagos pendientes de los próximos seis meses y los días en que hay que guardar plata, a la hora que se elija (por defecto, 6 de la tarde). En el iPhone, envíese el archivo por correo, ábralo en la app Mail y toque **Agregar todo**. Cada evento tiene un identificador fijo, así que al importarlo de nuevo se actualiza en lugar de duplicarse.

## Mis comidas

Arriba, junto al título, se elige la sección: **Mis Quincenas** o **Mis comidas**. Cada una tiene su propia barra de pestañas abajo. Mis comidas tiene cinco: Menú, Despensa, Recetas, Compras y Freidora.

Lleva el inventario de la cocina en unidades simples (huevos por unidad, arroz por libras, atún por latas); la unidad se elige de una lista. Lo que no se cuenta exacto se lleva por nivel: cuántas hay y si la que está en uso está llena, por la mitad o con poco. Dos bolsas de arroz, una llena y otra por la mitad, cuentan como 1,5 bolsas.

- **Piezas y porciones por paquete**: cada alimento puede decir cuánto trae cada unidad de compra ("cada bolsa trae 20 tajadas", "cada paquete rinde 4 porciones"). Se compra y se paga por bolsa o paquete, pero las recetas, el menú y "La preparé" cuentan por tajadas, muslos o porciones, y la despensa muestra lo que queda en esas piezas. En una compra se puede cambiar cuánto trae si el paquete de ese día es distinto. En el formulario, lo que hay se escribe en dos casillas: las unidades completas (cajas) y lo suelto de la empezada (huevos).
- **"La preparé" con porciones**: se elige para cuántas porciones se cocinó (1 a 6). También descuenta en los alimentos por nivel: la bolsa en uso baja sola de lleno a medio y a poco. Los botones − y + siguen corrigiendo a ojo, y lo que usted ve manda.
- **La app aprende cuánto rinde**: en los alimentos medidos en porciones, cuando usted corrige y deja de nuevo todas las unidades llenas (se acabó una bolsa), la app compara las porciones que descontó con las bolsas gastadas. Si no coincide con lo que tenía anotado, propone el número nuevo y usted decide si lo usa.

- **Avisos**: cada alimento tiene un mínimo. Cuando queda menos, aparece un aviso en Despensa y en Hoy.
- **Estimado de comidas**: cada comida completa necesita una porción de base (arroz, pasta, pan) y una de proteína. El valor "comidas que rinde cada unidad" de cada alimento se puede cambiar en "Más opciones". Es una aproximación. Los almuerzos fuera de casa se eligen semana por semana en la misma pestaña: lo que queda de la semana en curso se calcula con menos comidas en casa y, de la semana siguiente en adelante, con 3 comidas diarias. El lunes la elección vuelve a "Ninguno".
- **Qué puedo cocinar**: recetas del recetario (en `js/despensa.js`, lista `RECETAS`) que salen con lo que hay, y las que quedan a uno o dos ingredientes. "La preparé" descuenta los ingredientes.
- **Registrar una compra**: suma a la despensa, guarda el precio por unidad y anota el gasto en la categoría Mercado. El valor pagado es obligatorio, porque toda compra se descuenta de la quincena; lo que ya había en la cocina se agrega en Despensa, donde el precio es opcional. Se puede comprar un producto que aún no está en la despensa ("Otro producto (nuevo)") y queda creado. Cada compra queda en "Compras registradas" con un botón **Deshacer**, que devuelve la plata a la quincena, resta lo comprado de la despensa y lo devuelve a la lista del menú; borrar ese gasto desde la pestaña Hoy hace lo mismo.
- **Compras para el menú**: la lista que trae el menú de Claude lleva la cuenta de lo comprado ("faltan 8"). El botón "Comprar" de cada producto lo pasa al formulario de compra; cualquier compra de ese producto, hecha desde el botón o directo en el formulario, se resta de la lista.
- **Lista de compras**: lo que está por debajo del mínimo, con el costo estimado y si cabe en lo que queda de la quincena.
- **Menú con Claude**: en la pestaña Menú, "Copiar despensa y presupuesto" arma la pregunta. Claude responde con el menú por días y un bloque JSON al final; ese bloque se pega en la app, que guarda cada receta (ingredientes y pasos) en "Mis recetas", el menú de cada día y la lista de lo que hay que comprar. La pestaña Menú abre en el día de hoy; "La preparé" descuenta los ingredientes de la despensa.

El bloque que entiende la app tiene tres listas: `menu` (un elemento por fecha, con `desayuno`, `almuerzo` y `comida`), `recetas` (`nombre`, `momentos`, `ingredientes` con `alimento`, `cantidad`, `unidad` y `texto`, y `pasos`) y `compras` (`alimento`, `cantidad`, `unidad`, `precio`).

Para agregar una receta, añada un renglón a `RECETAS` con cantidades para una porción, en la unidad del catálogo.

### Freidora

La pestaña **Freidora** es aparte: no cambia el menú ni "Mis recetas".

- **Qué puedo hacer en la freidora**: recetas para la freidora de aire (en `js/freidora.js`, lista `FREIDORA`), cada una con temperatura en °C, minutos, ingredientes y pasos. Arriba salen las que se pueden hacer con lo que hay en la despensa; las demás quedan en "Otras recetas de freidora", con lo que les falta.
- **"La preparé"** descuenta los ingredientes de la despensa, con el mismo selector de porciones de las otras recetas.
- **Pedirle recetas a Claude**: "Copiar despensa para la freidora" arma la pregunta. Claude responde con un bloque JSON que se pega en la misma pestaña; las recetas quedan guardadas ahí (tienda `freidora`, que también se sincroniza y entra en el respaldo). Cada una se puede quitar.

El bloque que entiende la pestaña es `{"freidora":[…]}`, y cada receta lleva `nombre`, `temperatura` (°C), `minutos`, `ingredientes` (`alimento`, `cantidad`, `unidad`, `texto`) y `pasos`.

Para agregar una receta al recetario, añada un renglón a `FREIDORA`. Cada ingrediente dice con qué nombres puede estar en la despensa (`a`) y cuánto gasta según cómo esté guardado: `porc` (porciones), `un` (unidades o piezas), `lb` (libras) o `frac` (parte de una bolsa, paquete o lata).

## Pendiente para siguientes etapas

- Chat integrado con Claude (hoy se usa "Copiar resumen" en la pestaña Más).
- Notificaciones propias de la app (requieren un servidor que las envíe).

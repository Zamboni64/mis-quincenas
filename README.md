# Mis Quincenas

Aplicación web instalable (PWA) para llevar un presupuesto personal por quincenas: gastos del día a día, pagos del mes, otros ingresos y plan de deudas. Funciona sin internet y guarda los datos en el propio teléfono.

## Cómo está hecha

No usa frameworks ni herramientas de compilación: es HTML, CSS y JavaScript puros.

| Archivo | Qué hace |
|---|---|
| `index.html` | La página: las seis pestañas (Hoy, Pagos, Ingresos, Comida, Plan, Más). |
| `css/estilos.css` | Colores, tamaños y distribución. Tiene tema claro y oscuro. |
| `js/motor.js` | Los cálculos: quincenas, plan de deudas, reparto de ingresos, pagos y el generador del Excel. No toca la pantalla. |
| `js/almacen.js` | Guarda y lee los datos en el teléfono (IndexedDB). |
| `js/app.js` | La interfaz: dibuja las pantallas y responde a los botones. |
| `js/despensa.js` | Los cálculos de la despensa: catálogo de alimentos, recetario, estimado de comidas y lista de compras. No toca la pantalla. |
| `js/comida.js` | La pantalla de la pestaña Comida. |
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

## Despensa (pestaña Comida)

Lleva el inventario de la cocina en unidades simples (huevos por unidad, arroz por libras, atún por latas) y, para lo que no se cuenta, en niveles: lleno, medio, poco, se acabó.

- **Avisos**: cada alimento tiene un mínimo. Cuando queda menos, aparece un aviso en la pestaña Comida y en Hoy.
- **Estimado de comidas**: cada comida completa necesita una porción de base (arroz, pasta, pan) y una de proteína. El valor "comidas que rinde cada unidad" de cada alimento se puede cambiar en "Más opciones". Es una aproximación.
- **Qué puedo cocinar**: recetas del recetario (en `js/despensa.js`, lista `RECETAS`) que salen con lo que hay, y las que quedan a uno o dos ingredientes. "La preparé" descuenta los ingredientes.
- **Registrar una compra**: suma a la despensa, guarda el precio por unidad y anota el gasto en la categoría Mercado.
- **Lista de compras**: lo que está por debajo del mínimo, con el costo estimado y si cabe en lo que queda de la quincena.
- **Preguntarle a Claude**: copia la despensa y el presupuesto para pegarlos en un chat.

Para agregar una receta, añada un renglón a `RECETAS` con cantidades para una porción, en la unidad del catálogo.

## Pendiente para siguientes etapas

- Chat integrado con Claude (hoy se usa "Copiar resumen" en la pestaña Más).
- Notificaciones propias de la app (requieren un servidor que las envíe).

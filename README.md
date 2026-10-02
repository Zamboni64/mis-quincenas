# Mis Quincenas

Aplicación web instalable (PWA) para llevar un presupuesto personal por quincenas: gastos del día a día, pagos del mes, otros ingresos y plan de deudas. Funciona sin internet y guarda los datos en el propio teléfono.

## Cómo está hecha

No usa frameworks ni herramientas de compilación: es HTML, CSS y JavaScript puros.

| Archivo | Qué hace |
|---|---|
| `index.html` | La página: las cinco pestañas (Hoy, Pagos, Ingresos, Plan, Más). |
| `css/estilos.css` | Colores, tamaños y distribución. Tiene tema claro y oscuro. |
| `js/motor.js` | Los cálculos: quincenas, plan de deudas, reparto de ingresos, pagos y el generador del Excel. No toca la pantalla. |
| `js/almacen.js` | Guarda y lee los datos en el teléfono (IndexedDB). |
| `js/app.js` | La interfaz: dibuja las pantallas y responde a los botones. |
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

## Respaldo

Los datos viven solo en el teléfono. En la pestaña **Más → Respaldo**, "Guardar respaldo" crea un archivo `.json` con todo; guárdelo en Archivos o en iCloud Drive. "Restaurar un respaldo" reemplaza lo que haya en la app por lo que trae el archivo.

Haga un respaldo al menos una vez por quincena.

## Cómo publicar un cambio

```
git add .
git commit -m "Describa aquí el cambio"
git push
```

GitHub Pages se actualiza solo. En el teléfono el cambio se ve la **segunda** vez que abre la app: la primera muestra la copia guardada y descarga la nueva en segundo plano.

## Pendiente para siguientes etapas

- Sincronización con la nube.
- Recordatorios de pagos.
- Chat integrado con Claude (hoy se usa "Copiar resumen" en la pestaña Más).
- Editar desde la app la lista de personas que le deben plata.

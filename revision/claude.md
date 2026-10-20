# Segunda opinión de Claude sobre `gemini.md`

**Rama:** `mejora-visual` · **Método:** revisé el código real (`css/estilos.css`, `index.html`, `js/*.js`), medí los contrastes con la fórmula WCAG sobre los colores de `:root` y calculé los altos táctiles con tamaño de letra × interlineado + relleno. No abrí la app en el navegador ni usé datos de nadie.

## Resumen

1. Gemini acierta en lo grande: hay dos fallas reales de contraste en modo oscuro (el chulo de Pagos, 1,71:1, y la cifra en rojo de Hoy, que mide 2,05:1 y no 1,78) y casi todos los botones pequeños miden lo que dice.
2. Se le pasó la misma falla en el **globito rojo de alertas** de la barra de abajo (2,05:1 en oscuro), y que al agrandar esa barra el final de cada pestaña puede quedar tapado.
3. **Al menos 13 de sus 35 propuestas "visuales" tocan JavaScript.** El texto, las tablas y los estados vacíos se arman en `app.js`, `comida.js`, `menu.js` y `freidora.js`. Esos puntos los hace Claude, no Gemini.
4. Hay cuatro puntos donde Gemini describe algo que ya existe: los rótulos de Desayuno, Almuerzo y Comida (6.3), la pastilla de °C y minutos (10.3), el aviso de que la compra descuenta plata (9.2) y el color de "Olvidé mi contraseña", que es gris y no rojo (5.4).
5. Dos propuestas tienen riesgo para los datos: unir las tres correcciones de la quincena en una sola tarjeta (5.2) y cambiar los almuerzos fuera de casa a pastillas de 0 a 5 (7.3), porque hoy el valor va de 0 a 7.
6. **Privacidad:** `gemini.md` trae un saldo total concreto y nombres de deudas y acreedores (secciones 3.2, 4.1 y 4.3). `AGENTS.md` lo prohíbe en `revision/`. Hay que limpiarlo antes de cualquier commit, aunque los datos hayan sido ficticios.

## Veredicto sobre cada hallazgo de Gemini

Prioridad: **A** alta, **M** media, **B** baja. "JS" quiere decir que el cambio no se puede hacer solo con CSS y HTML.

| # | Veredicto | Comentario |
|---|---|---|
| 1.1 | De acuerdo · A | Blanco sobre `--bad` oscuro mide **2,05:1**, no 1,78. Arreglo: en oscuro usar `--bad-bg` (#40201C) como color del texto, que da 7,1:1. Mejor crear un token `--bad-ink` en DESIGN.md. |
| 1.2 | De acuerdo · M | 36×36 medido. Una sola regla en `.qnav button` arregla también 6.2. Falta además un estilo para cuando el botón está desactivado (ver N3). |
| 1.3 | De acuerdo en el tamaño, el riesgo es menor · M | 29 px medido. Pero borrar ya pide un segundo toque ("¿Seguro? Borrar", 3,5 s), así que un roce no borra nada. Agrandar el área sin acercarlo más al monto. |
| 1.4 | Discutible · B | El formulario arriba es a propósito (el comentario del CSS dice "el formulario de gasto a un pulgar"): anotar gastos es la acción diaria. Se puede compactar el espacio entre filas, pero sin bajar los campos de 44 px de alto (hoy miden unos 45). |
| 2.1 | De acuerdo · A | 1,71:1 exacto. Con `color: var(--accent-ink)` queda en 9,9:1 en oscuro y no cambia nada en claro. Es una línea de CSS. |
| 2.2 | De acuerdo · A | 30×30 medido. Es la acción principal de Pagos. |
| 2.3 | Discutible · B · JS | Es intencional: arriba está el resumen de lo urgente y abajo el mes completo. Marcar en cualquiera de las dos actualiza las dos. Si se quita de "Este mes", el mes queda incompleto. Propongo dejarlo así y, como mucho, esconder la tarjeta de vencidos cuando está vacía, porque la nota de arriba ya dice "Todo al día". Gemini lo marca [visual] en el texto y [lógica] en el resumen: es lógica (`renderPagos` en `app.js`). |
| 2.4 | De acuerdo · B | Meterla en un `<details>` es solo HTML. Conservar los `id` (`calHora`, `crearCal`, `calMsg`). |
| 3.1 | De acuerdo · M | Mover la tarjeta es solo HTML. El JS busca todo por `id`. |
| 3.2 | En desacuerdo con la frase propuesta · B · JS | Ese texto está en `app.js` (`ayudaDestino`) y explica el orden real en que `motor.js` reparte la plata. La frase genérica de Gemini quita justo lo que hace confiable la cifra. Mejor una lista corta de 3 pasos con el mismo contenido. |
| 3.3 | De acuerdo · M | Igual que 1.3: es la misma clase `.del`. |
| 4.1 | De acuerdo · M | Solo CSS. Aplicarlo también al encabezado de la columna fija. |
| 4.2 | Discutible · B · JS | La tabla ya se corta en el mes en que la deuda llega a cero (`app.js:185`). Con un plan que termina, salen unas 10 filas, no más de 20. Seguramente Gemini usó datos que nunca terminan. No lo haría. |
| 4.3 | De acuerdo con darle más peso · B · JS | La frase se arma en `app.js:182`. Letra más grande sí. La barra de progreso necesita calcular la deuda inicial: eso es lógica nueva. |
| 5.1 | De acuerdo · M | Agrupar con subtítulos o `<details>` es solo HTML. Conservar todos los `id`. |
| 5.2 | En desacuerdo con unirlas · M | Cada tarjeta tiene su formulario y su manejador en `app.js`, y guardan en sitios distintos (`ajustes` y los datos). Volverlas una tarjeta con pestañas internas es reescribir lógica, con riesgo de guardar en la quincena o el campo equivocado. Alternativa segura: dejarlas iguales dentro de un `<details>` "Correcciones de una quincena". |
| 5.3 | De acuerdo · M | 30 px medido. La regla `summary` es global: arregla a la vez Mis datos, Menú, Freidora y Despensa (10.1). |
| 5.4 | Parcial · B | `.del` es gris subrayado, no rojo. Solo se pone rojo con `.sure`, después del primer toque de Borrar. Cambiarle la clase es orden, no urgencia. |
| 6.1 | De acuerdo con la idea · B · JS | `menu.js` decide el texto del estado vacío y qué se muestra. |
| 6.2 | De acuerdo · M | Se arregla con 1.2. |
| 6.3 | En desacuerdo · B | Ya existe: cada momento tiene su rótulo (`.subt` Desayuno, Almuerzo, Comida), y se abre solo el de la hora actual (`menu.js:45-53`). Como mucho, darle más peso a ese rótulo. |
| 7.1 | De acuerdo · A | 34 px medido, y es la pantalla de la cocina. Probar con nombres largos: en 358 px de ancho caben −, cantidad (hasta 112 px), + y Editar, pero el nombre se aprieta. |
| 7.2 | Discutible · B · JS | Ya se esconden campos según el tipo (`comida.js:117-124`). Esconder más es JS. |
| 7.3 | Discutible, con riesgo · B · JS | El valor guardado va de 0 a 7 (`comida.js:14`; 7 es "todos los días"). Pastillas de 0 a 5 perderían 6 y 7. Se guarda en los datos que se sincronizan. Si se hace, tiene que ser de 0 a 7 y con JS. |
| 8.1 | Parcial · M | El texto activo mide 6,97:1, bien. Lo que no se nota es el fondo: `--soft` contra `--bg` da **1,26:1 en oscuro y 1,09:1 en claro**, así que también falla en claro. `.seg` se usa en Hoy (medio de pago) y en Despensa, así que el cambio se ve en toda la app. Decidirlo en DESIGN.md. |
| 8.2 | Discutible · B · JS | "Le alcanza para X veces" es un cálculo nuevo en `despensa.js`. El espaciado sí es CSS. |
| 8.3 | De acuerdo · B · JS | El texto se arma en `comida.js:59`. Es un cambio chico. |
| 9.1 | De acuerdo · B · JS | Una línea en `comida.js:85`. |
| 9.2 | Parcial · B | El aviso ya está arriba de la tarjeta (`index.html:307`). Se podría repetir en corto junto al botón. |
| 9.3 | De acuerdo · M · JS | Mostrar el saldo que queda necesita el cálculo de `app.js` (`estadoQ`). |
| 10.1 | De acuerdo · M | Se arregla con 5.3 y con el tamaño de `.ghost`. |
| 10.2 | De acuerdo · B | Un `<details>` fijo es solo HTML. Que se cierre "solo si ya hay recetas" es JS. |
| 10.3 | En desacuerdo · B | Ya hay pastilla (`freidora.js:185`, `.pill.plain`). Como mucho, más contraste. |
| 11.1 | De acuerdo · A | 37 px medido. Ver N2: si la barra crece, hay que agrandar también el espacio de abajo. |
| 11.2 | Probable · B | No se puede confirmar sin pantalla. Con 74 px de ancho, el globito (`right:6px`) toca el final de "Pagos". Verificarlo en el teléfono. |
| 11.3 | De acuerdo · M | Unos 29 px: el botón no hereda el interlineado. |

**En cifras:** de acuerdo en 22 (3 de ellos con matices), parcial o discutible en 10, en desacuerdo en 4 (3.2 en la forma, 5.2, 6.3 y 10.3).

## Lo que a Gemini se le pasó

| N | Tipo · prioridad | Hallazgo |
|---|---|---|
| N1 | [visual] · A | **Globito de alertas en oscuro:** `.badge` es blanco sobre `--bad`, 2,05:1, en Pagos y en Despensa. Es la misma falla que 1.1, justo en el aviso de que algo está por vencer. Se arregla con el mismo token. |
| N2 | [visual] · A | **El final de cada pestaña puede quedar tapado.** `.wrap` deja 96 px fijos abajo, pero la barra mide 6 + 37 + 6 px más la franja del iPhone (unos 34 px). Hoy sobran 13 px. Con botones de 44 px quedan 6. Usar `calc(100px + env(safe-area-inset-bottom))`. Hacerlo junto con 11.1. |
| N3 | [visual] · M | Los botones ‹ › desactivados (`menu.js:41` los desactiva al llegar al primer o último día) se ven igual que los activos: no hay estilo `:disabled` en `.qnav`. |
| N4 | [visual] · M | **Zoom en el iPhone:** `textarea` tiene 12 px por defecto. `#mPegar` y `#frPegar` lo suben a 16, pero el cuadro de copiar a mano (`comida.js:360`) se muestra y recibe el foco con 12 px, y el iPhone hace zoom. Subir la regla base a 16 px. |
| N5 | [visual] · B | `theme-color` es verde fijo. En modo oscuro, la barra del sistema no combina con la app. Se puede agregar otra etiqueta con `media="(prefers-color-scheme: dark)"`. Verificarlo en el teléfono instalado. |
| N6 | [visual] · B | El borde de los campos mide 1,2:1 contra la tarjeta. Hoy se distinguen por el fondo gris, lo que basta en claro. No es urgente. |
| N7 | [lógica] · A | **Reglas para no romper el JS al mover cosas:** el JS encuentra todo por `id` y por `data-col`, `data-debe`, `data-fijo`, `data-pago`, `data-tab`, `data-modo`, `data-menu-hecho`. Además depende de las clases `.del`, `.check`, `.tabs button`, `.neg`, `.sure`, `.hecho` y `.alerta`. Se puede mover HTML y cambiar estilos, pero no renombrar esos `id`, `data-*` ni clases. Si se renombran, borrar, marcar pagos o cambiar de pestaña dejan de funcionar sin dar error. |
| N8 | [lógica] · A | **Reparto real del trabajo:** 2.3, 3.2, 4.2, 4.3, 6.1, 7.2, 7.3, 8.2, 8.3, 9.1, 9.3, 10.2 (la versión condicional) y la alternativa de 5.2 tocan JS. Ninguna toca `motor.js`, `almacen.js`, `nube.js` ni el formato del respaldo, salvo 7.3 si cambia el rango y 8.2 si agrega un cálculo. Ninguna propuesta pide una tienda nueva. |
| N9 | Privacidad · A | `gemini.md` incluye un saldo total y nombres de deudas y acreedores. Hay que quitarlos antes del commit. Aparte, y fuera de esta revisión: las etiquetas de `CAMPOS` en `app.js` y `motor.js` ya traen nombres de entidades. Si el repositorio es público, vale la pena revisarlo después. |

## Orden de trabajo propuesto

Cada grupo es pequeño, lleva su propio commit y se prueba en claro y oscuro con ancho de iPhone (375 y 390 px) antes de pasar al siguiente.

0. **Antes de empezar:** limpiar los datos de `gemini.md` (N9). Fijar en DESIGN.md el token `--bad-ink` y cómo se ve un botón seleccionado (8.1).
1. **Contrastes en oscuro** · Gemini · solo CSS: 1.1, 2.1, N1. Es el arreglo más barato y el que más se nota.
2. **Tamaños de toque** · Gemini · solo CSS: `.qnav` (1.2, 6.2, N3), `.check` (2.2), `.del` (1.3, 3.3), `.mini` (7.1), `summary` (5.3, 10.1), `.apps` (11.3), barra de abajo con espacio inferior (11.1, N2), `textarea` 16 px (N4). Revisar que nada se desborde a 320 px.
3. **Tabla del plan** · Gemini · CSS: 4.1.
4. **Orden y plegado** · Gemini · solo HTML, sin tocar `id` ni `data-*` (N7): 3.1, 2.4, 5.1, 5.2 en su versión `<details>`, 10.2 fijo, 5.4.
5. **Textos que arma el JS** · Claude: 9.1, 8.3, 9.2 corto, 3.2 en lista, 4.3 con letra más grande.
6. **Cambios con lógica** · Claude, con respaldo previo: 9.3, y 2.3, 6.1 y 7.3 (de 0 a 7) solo si el usuario los aprueba.
7. **Aplazar o descartar:** 4.2, 6.3, 10.3, 8.2, 7.2, 11.2 (hasta verlo en el teléfono) y 1.4 (solo compactar).

Antes de publicar: subir `VERSION` en `sw.js` y `VERSION_APP` en `app.js`, como dice `AGENTS.md`.

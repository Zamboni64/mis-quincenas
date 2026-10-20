---
name: Mis Quincenas
description: Presupuesto por quincenas y despensa en el bolsillo, para uso diario en el iPhone.
colors:
  fondo: "#F3F5F8"
  superficie: "#FFFFFF"
  tinta: "#0F1720"
  tinta-suave: "#5B6573"
  linea: "#E6E9EF"
  cobalto: "#2F5BEA"
  cobalto-tinta: "#FFFFFF"
  azul-niebla: "#E8EEFD"
  azul-noche: "#0B1E4F"
  azul-noche-tinta: "#FFFFFF"
  azul-cielo: "#7FA3FF"
  ambar: "#9A5B00"
  ambar-fondo: "#FFF1D6"
  rojo: "#C0362C"
  rojo-fondo: "#FDE8E6"
  rojo-tinta: "#FFFFFF"
  verde: "#0E7A4B"
  verde-fondo: "#E2F5EA"
  oscuro-fondo: "#0B0E13"
  oscuro-superficie: "#151A21"
  oscuro-tinta: "#EEF1F5"
  oscuro-tinta-suave: "#9AA4B2"
  oscuro-linea: "#232A33"
  oscuro-linea-tarjeta: "#1E242C"
  oscuro-cobalto: "#7C9BFF"
  oscuro-cobalto-tinta: "#0A1638"
  oscuro-azul-niebla: "#1A2340"
  oscuro-azul-noche: "#13296A"
  oscuro-azul-cielo: "#8FB0FF"
  oscuro-ambar: "#FBBF5A"
  oscuro-ambar-fondo: "#33260E"
  oscuro-rojo: "#F28B82"
  oscuro-rojo-fondo: "#3A1714"
  oscuro-rojo-tinta: "#3A1714"
  oscuro-verde: "#4ADE94"
  oscuro-verde-fondo: "#0F2A1D"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(38px, 12vw, 52px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  input:
    fontSize: "16px"
  label:
    fontSize: "12px"
    fontWeight: 600
  overline:
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.05em"
  section:
    fontSize: "17px"
    fontWeight: 600
  amount:
    fontSize: "24px"
    fontWeight: 700
  icon-glyph:
    fontSize: "18px"
    fontWeight: 700
  body-small:
    fontSize: "14px"
  caption:
    fontSize: "13px"
rounded:
  casilla: "9px"
  pastilla: "99px"
  campo: "10px"
  boton: "12px"
  tarjeta: "16px"
  hero: "18px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "16px"
components:
  boton-principal:
    backgroundColor: "{colors.cobalto}"
    textColor: "{colors.cobalto-tinta}"
    rounded: "{rounded.boton}"
    padding: "13px"
    height: "48px"
  boton-fantasma:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.boton}"
    padding: "12px"
    height: "44px"
  segmento-elegido:
    backgroundColor: "{colors.cobalto}"
    textColor: "{colors.cobalto-tinta}"
    rounded: "{rounded.campo}"
    height: "44px"
  segmento:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
    height: "44px"
  campo:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
    padding: "11px 12px"
    height: "44px"
  tarjeta:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.tarjeta}"
    padding: "16px"
  hero:
    backgroundColor: "{colors.azul-noche}"
    textColor: "{colors.azul-noche-tinta}"
    rounded: "{rounded.hero}"
    padding: "18px 16px"
  hero-negativo:
    backgroundColor: "{colors.rojo}"
    textColor: "{colors.rojo-tinta}"
    rounded: "{rounded.hero}"
  globito-alerta:
    backgroundColor: "{colors.rojo}"
    textColor: "{colors.rojo-tinta}"
    rounded: "{rounded.pastilla}"
    height: "18px"
  chulo-pagado:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.cobalto-tinta}"
    size: "36px"
---

# Design System: Mis Quincenas

<!-- Escrito con Impeccable (document). Los colores y medidas salen de css/estilos.css. Las marcas «Nuevo» son decisiones ya aprobadas en revision/plan.md que todavía no están en el CSS. -->

## Overview

**Creative North Star: "El tablero tranquilo"**

Mis Quincenas es una herramienta de uso diario: se abre varias veces al día en el iPhone para ver cuánto queda, anotar un gasto o marcar un pago. Funciona como un tablero de control sereno. Las cifras se leen en un segundo y el color solo aparece para avisar algo (verde: va bien, ámbar: atención, rojo: se pasó o está vencido). Lo demás es neutro, plano y ordenado en una sola columna.

El trato es **cálido y amable**: esquinas suaves, letra del sistema, frases cortas en español de Colombia que tratan de "usted", y un poco más de color en lo que sale bien (un pago marcado, una despensa completa). Esa calidez no se logra con adornos, sombras ni animaciones, sino con buen tono, buen espacio y estados claros.

La app debe abrir sin internet: no hay fuentes ni librerías externas. Tiene tema claro y oscuro, que siguen al teléfono.

**Key Characteristics:**
- Una columna de máximo 520 px, con pestañas fijas abajo y la cifra principal arriba.
- Plana: la profundidad viene de tonos y bordes finos, no de sombras.
- Azul noche para la tarjeta principal y cobalto para las acciones; verde, ámbar y rojo solo para estados.
- Todo lo que se toca mide al menos 44 px.
- Los campos usan letra de 16 px para que el iPhone no haga zoom.

## Colors

Paleta "Cobalto": la tarjeta principal en azul noche profundo, el cobalto vivo para las acciones y neutros fríos y limpios. Un color fuerte se adueña de la zona más importante (lo que queda de la quincena) y el cobalto marca lo que se puede tocar. El verde, el ámbar y el rojo se reservan para dar significado.

### Primary
- **Azul noche** (`azul-noche` / `oscuro-azul-noche`): solo la tarjeta principal de Hoy. Es la zona de color fuerte de la app. Su texto es blanco (16:1 en claro). La barra de avance de esa tarjeta va en **azul cielo** (`azul-cielo` / `oscuro-azul-cielo`).
- **Cobalto** (`cobalto` / `oscuro-cobalto`): el botón principal, el botón de segmento elegido, la pestaña elegida, los enlaces de acción, el foco del teclado y las barras de categoría. En oscuro se aclara para que se lea sobre el fondo casi negro.
- **Tinta sobre cobalto** (`cobalto-tinta` / `oscuro-cobalto-tinta`): el texto y los íconos sobre cobalto o verde lleno, incluido el chulo de pago marcado. Es blanco en claro y azul muy oscuro en oscuro.

### Neutral
- **Fondo** (`fondo` / `oscuro-fondo`): gris frío muy claro en claro y casi negro en oscuro: el fondo de la página y el relleno de los campos.
- **Superficie** (`superficie` / `oscuro-superficie`): las tarjetas, la barra de abajo y la columna fija de las tablas.
- **Tinta** (`tinta` / `oscuro-tinta`): todo el texto principal.
- **Tinta suave** (`tinta-suave` / `oscuro-tinta-suave`): los rótulos, las ayudas y las pestañas no elegidas. Mide 5,4:1 sobre el fondo en claro: no se debe aclarar más.
- **Línea** (`linea` / `oscuro-linea`): los bordes de los campos y los separadores de listas. En oscuro las tarjetas llevan un borde aún más tenue (`oscuro-linea-tarjeta`, `--card-line`). En claro las tarjetas no llevan borde: el blanco sobre el fondo gris basta.
- **Azul niebla** (`azul-niebla` / `oscuro-azul-niebla`): fondo suave para notas neutras, pastillas neutras y la pestaña elegida. Se distingue poco del fondo, así que **nunca** debe ser la única señal de que algo está elegido.

### Estados
- **Verde** (`verde`, con su `-fondo`): algo salió bien, por ejemplo un pago hecho o "Todo al día".
- **Ámbar** (`ambar`, con su `-fondo`): atención, por ejemplo un pago por vencer o algo que se acaba en la despensa.
- **Rojo** (`rojo`, con su `-fondo`): se pasó del presupuesto, un pago vencido o borrar después de confirmar. Cuando el saldo es negativo, la tarjeta principal pasa de azul noche a rojo.
- **Tinta sobre rojo** (`rojo-tinta` / `oscuro-rojo-tinta`): el texto sobre un fondo rojo lleno, es decir, el saldo negativo y el globito de alertas. Es blanco en claro y rojo muy oscuro en oscuro (6,7:1). En CSS es `--bad-ink`.

### Named Rules
**The Color Means Something Rule.** El ámbar y el rojo solo se usan para avisar. Nunca son decoración ni el color de una marca.

**The Ink Pair Rule.** Todo color lleno lleva su tinta: sobre cobalto o verde, `--accent-ink`; sobre azul noche, `--hero-ink`; sobre rojo, `--bad-ink`. Nunca se escribe `#fff` fijo sobre un color que cambia en modo oscuro. Los textos tienen que medir al menos 4,5:1 en los dos temas.

## Typography

**Display Font:** la del sistema (`-apple-system`, que en el iPhone es San Francisco, con Segoe UI, Roboto y `system-ui` de respaldo).
**Body Font:** la misma.

**Character:** una sola familia, la del teléfono, que se siente nativa y no necesita descargar nada. La jerarquía sale del peso y del tamaño, no de mezclar fuentes.

### Hierarchy
- **Display** (800, clamp 38–52 px, 1,05): solo para la cifra grande de lo que queda en Hoy. Va con números de ancho fijo.
- **Headline** (700, 20 px): el título de la sección arriba.
- **Title** (650, 16 px): el título de cada tarjeta.
- **Body** (400, 15 px, 1,45): el texto general y las listas. Las ayudas largas van en 13 px con tinta suave.
- **Input** (16 px): todos los campos, selectores y cuadros de texto, sin excepción. El monto de un gasto va en 24 px y 700.
- **Label** (600, 12 px): los rótulos encima de los campos y el texto de las pestañas de abajo.
- **Overline** (700, 11 px, mayúsculas, espaciado 0,05 em): subtítulos dentro de una tarjeta y encabezados de tabla.

### Named Rules
**The Sixteen Rule.** Ningún campo donde se escribe puede medir menos de 16 px. Si mide menos, el iPhone hace zoom y la pantalla queda desacomodada.

**The Tabular Money Rule.** La plata se muestra con `money()` y con números de ancho fijo (`.num`), para que las cifras queden alineadas en listas y tablas.

## Layout

- Una sola columna centrada de máximo 520 px, con 16 px a los lados.
- Entre tarjetas hay 14 px; dentro de un formulario, 10 px; las filas de una lista llevan 10 px arriba y abajo con una línea fina entre ellas.
- Arriba va la cifra principal. Debajo, la acción del día (anotar un gasto, marcar un pago). Al final, lo que se consulta de vez en cuando.
- Las herramientas que se usan poco (calendario, pedirle algo a Claude, correcciones) van dentro de un desplegable cerrado.
- La barra de pestañas está fija abajo y respeta la franja inferior del iPhone. **Nuevo:** el espacio libre al final de cada pestaña debe ser `calc(100px + env(safe-area-inset-bottom))`, para que la barra no tape nada.
- Las tablas anchas se desplazan de lado dentro de su tarjeta, con la primera columna fija. Esa columna lleva un borde para separarse de las demás.
- En pantallas de menos de 360 px se achica el selector de arriba y se esconde la fecha.

**The Thumb First Rule.** Lo que se hace todos los días debe quedar al alcance del pulgar sin desplazarse mucho. Lo que se usa una vez al mes se pliega.

## Elevation & Depth

El sistema es plano. No hay sombras para dar profundidad: las capas se distinguen por el tono (fondo, superficie, verde niebla) y por bordes de 1 px. La única excepción permitida es una sombra muy suave en la columna fija de una tabla, para indicar que las demás columnas pasan por debajo.

**The Flat Calm Rule.** Las tarjetas no flotan. Si algo necesita resaltar, se le cambia el tono o el peso de la letra, no se le pone sombra.

## Shapes

Esquinas suaves y amables, más redondas cuanto más grande es la pieza: 10 px en campos y segmentos, 12 px en botones, 14 px en tarjetas, 18 px en la tarjeta principal, y totalmente redondas en pastillas, globitos y botones circulares (− +, ‹ ›). Los bordes son de 1 px; solo la casilla de pago lleva 2 px, para que se vea como una casilla.

## Components

### Buttons
- **Principal:** cobalto lleno con su tinta, 16 px y 700, esquinas de 12 px. Hay uno por tarjeta como máximo, para la acción que confirma algo. Desactivado se ve al 55 % de opacidad.
- **Fantasma:** sin relleno, con borde de línea y tinta. Se usa para acciones secundarias como "La preparé" o "Copiar". Mide al menos 44 px de alto.
- **Enlace de borrar:** texto gris subrayado de 12 px. El primer toque lo vuelve rojo y lo cambia a "¿Seguro? Borrar" durante 3,5 s; el segundo toque borra. **Nuevo:** su área de toque llega a 44 px de alto. Solo se usa para borrar o quitar: los demás enlaces, como "Olvidé mi contraseña", usan un estilo neutro.
- **Circulares (‹ › − +):** borde de línea sobre la superficie. Las flechas son dibujos SVG de trazo redondeado, no caracteres de texto. **Nuevo:** miden al menos 40 px a la vista y 44 px de área de toque, y desactivados se ven al 40 % de opacidad.
- **Foco:** contorno de 2 px en cobalto, separado 2 px del borde.
- **Al tocar:** los botones se achican un poco (97 %) durante 0,15 s, para confirmar que el toque llegó. Se apaga si el teléfono pide reducir el movimiento.

### Chips
- **Pastilla:** 12 px y 700, totalmente redonda, con el color de estado sobre su fondo (verde, ámbar, rojo o neutra). Sirve para estados ("Vence en 2 días") y datos rápidos, como la temperatura y los minutos de la freidora.
- **Globito de alerta:** el número sobre rojo lleno, encima de la pestaña. **Nuevo:** su texto usa la tinta sobre rojo.

### Segmented control
- Dos o tres botones del mismo ancho en una cuadrícula con 6 px entre ellos. Se usa para el medio de pago, Desayuno/Almuerzo/Comida y el tipo de alimento.
- **Nuevo (decisión D2):** el elegido va con cobalto lleno y su tinta. Los demás van con fondo de página, borde de línea y tinta. Así se nota cuál está elegido en los dos temas.

### Cards / Containers
- **Corner Style:** 16 px.
- **Background:** superficie, sin sombra. Sin borde en claro; en oscuro, un borde muy tenue (`--card-line`).
- **Internal Padding:** 16 px.
- **Tarjeta principal (hero):** azul noche lleno, 18 px de esquina, con un rótulo corto en minúsculas (14 px, 500), la cifra grande en 700 con números de ancho fijo, una línea de detalle y una barra de avance en azul cielo. Cuando el saldo es negativo, pasa a rojo con la tinta sobre rojo.
- **Ocultar cifras:** un botón de ojo (44 px) arriba a la derecha de la tarjeta principal tapa la cifra, su línea de detalle y las tres cifras del día con puntos (•••). Es una preferencia de cada dispositivo: no se sincroniza ni va en el respaldo.
- **Nota:** caja sin borde, de 12 px de esquina, con el color de estado sobre su fondo. Sirve para avisos y resúmenes; si se puede tocar, el texto va en 600.
- **Cifras del día:** las tres cifras bajo la tarjeta principal (libre, ingresos extra, gastado) van en una sola tarjeta, separadas por líneas finas verticales, no en tres cajas sueltas.

### Inputs / Fields
- **Style:** relleno de fondo, borde de línea, 10 px de esquina, 16 px de letra, unos 45 px de alto. Los rótulos van encima, en 12 px y 600, con tinta suave.
- **Focus:** contorno cobalto de 2 px.
- **Fechas y horas:** ocupan todo el ancho de su columna, con el texto a la izquierda.

### Navigation
- **Pestañas de abajo:** cinco por sección, con texto de 12 px y 600 en tinta suave. La barra es translúcida con desenfoque, como las del iPhone. La elegida va con fondo verde niebla y texto cobalto. **Nuevo:** cada pestaña mide al menos 44 px de alto.
- **Selector de sección (arriba):** "Mis Quincenas" y "Mis comidas" como texto de 17 px. Queda fijo arriba al desplazarse, con el mismo fondo translúcido de la barra de abajo y una línea fina debajo, para cambiar de sección sin volver a subir. El elegido va en tinta y 700, subrayado con una línea verde de 2 px. **Nuevo:** área de toque de 44 px.

### Casilla de pago
La casilla cuadrada, con esquinas de 9 px, que marca un pago como hecho. Vacía: borde de línea de 2 px. Marcada: verde lleno con un chulo en la tinta sobre verde. **Nuevo:** mide 36 px a la vista y 44 px de área de toque, y el chulo nunca va en `#fff` fijo.

## Do's and Don'ts

### Do:
- **Do** usar las variables de `:root` en `css/estilos.css` y definir cada color nuevo también en el bloque de modo oscuro.
- **Do** darle a todo lo que se toca un área de al menos 44 × 44 px.
- **Do** usar 16 px en todo campo, selector o cuadro de texto.
- **Do** comprobar el contraste en los dos temas: 4,5:1 para el texto y 3:1 para los íconos y bordes que dan significado.
- **Do** plegar en un desplegable lo que se usa poco.
- **Do** escribir en español de Colombia, tratando de "usted", con frases cortas y sin tecnicismos.

### Don't:
- **Don't** escribir `#fff` ni ningún color fijo sobre un fondo que cambia en modo oscuro.
- **Don't** usar solo el verde niebla para mostrar que algo está elegido.
- **Don't** agregar sombras, degradados decorativos ni animaciones que no expliquen un cambio. La única animación es el avance de las barras, y se apaga si el teléfono pide reducir el movimiento.
- **Don't** agregar fuentes, íconos ni librerías externas: la app debe abrir sin internet.
- **Don't** renombrar los `id`, los atributos `data-*` ni las clases que usa la programación (`.del`, `.check`, `.tabs button`, `.neg`, `.sure`, `.hecho`, `.alerta`) al cambiar estilos.
- **Don't** usar el rojo ni el estilo de borrar en acciones que no destruyen nada.

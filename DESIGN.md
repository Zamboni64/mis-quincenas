---
name: Mis Quincenas
description: Presupuesto por quincenas y despensa en el bolsillo, para uso diario en el iPhone.
colors:
  fondo: "#F2F5F3"
  superficie: "#FFFFFF"
  tinta: "#13231D"
  tinta-suave: "#5B6B64"
  linea: "#D9E1DC"
  verde-pino: "#0E6B5A"
  verde-pino-tinta: "#FFFFFF"
  verde-niebla: "#E1EEE9"
  ambar: "#8A5200"
  ambar-fondo: "#FBEFD6"
  rojo-ladrillo: "#A8261C"
  rojo-ladrillo-fondo: "#F9E1DD"
  rojo-ladrillo-tinta: "#FFFFFF"
  verde-hoja: "#1B6E44"
  verde-hoja-fondo: "#DDF0E4"
  oscuro-fondo: "#0D1412"
  oscuro-superficie: "#16201D"
  oscuro-tinta: "#E7EFEB"
  oscuro-tinta-suave: "#9BABA4"
  oscuro-linea: "#27342F"
  oscuro-verde-pino: "#5CC4A9"
  oscuro-verde-pino-tinta: "#06211B"
  oscuro-verde-niebla: "#1C2B27"
  oscuro-ambar: "#F2C26B"
  oscuro-ambar-fondo: "#3A2C10"
  oscuro-rojo-ladrillo: "#F2A097"
  oscuro-rojo-ladrillo-fondo: "#40201C"
  oscuro-rojo-ladrillo-tinta: "#40201C"
  oscuro-verde-hoja: "#8AD6A8"
  oscuro-verde-hoja-fondo: "#16301F"
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
rounded:
  pastilla: "99px"
  campo: "10px"
  boton: "12px"
  tarjeta: "14px"
  hero: "18px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "16px"
components:
  boton-principal:
    backgroundColor: "{colors.verde-pino}"
    textColor: "{colors.verde-pino-tinta}"
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
    backgroundColor: "{colors.verde-pino}"
    textColor: "{colors.verde-pino-tinta}"
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
    padding: "14px"
  hero:
    backgroundColor: "{colors.verde-pino}"
    textColor: "{colors.verde-pino-tinta}"
    rounded: "{rounded.hero}"
    padding: "18px 16px"
  hero-negativo:
    backgroundColor: "{colors.rojo-ladrillo}"
    textColor: "{colors.rojo-ladrillo-tinta}"
    rounded: "{rounded.hero}"
  globito-alerta:
    backgroundColor: "{colors.rojo-ladrillo}"
    textColor: "{colors.rojo-ladrillo-tinta}"
    rounded: "{rounded.pastilla}"
    height: "18px"
  chulo-pagado:
    backgroundColor: "{colors.verde-hoja}"
    textColor: "{colors.verde-pino-tinta}"
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
- Un solo acento, el verde pino; ámbar y rojo solo para estados.
- Todo lo que se toca mide al menos 44 px.
- Los campos usan letra de 16 px para que el iPhone no haga zoom.

## Colors

Una paleta fría y tranquila, de verdes grisáceos, en la que el color se reserva para dar significado.

### Primary
- **Verde pino** (claro `verde-pino`, oscuro `oscuro-verde-pino`): la tarjeta principal de Hoy, el botón principal, la pestaña elegida, el botón de segmento elegido, el foco del teclado y las barras de avance. En oscuro se aclara para que se lea sobre el fondo negro verdoso.
- **Tinta sobre verde pino** (`verde-pino-tinta` / `oscuro-verde-pino-tinta`): el texto y los íconos sobre cualquier fondo verde, incluido el chulo de pago marcado. Es blanco en claro y casi negro en oscuro.

### Neutral
- **Fondo** (`fondo` / `oscuro-fondo`): el fondo de la página y el relleno de los campos.
- **Superficie** (`superficie` / `oscuro-superficie`): las tarjetas, la barra de abajo y la columna fija de las tablas.
- **Tinta** (`tinta` / `oscuro-tinta`): todo el texto principal.
- **Tinta suave** (`tinta-suave` / `oscuro-tinta-suave`): los rótulos, las ayudas y las pestañas no elegidas. Mide 5,1:1 sobre el fondo en claro: no se debe aclarar más.
- **Línea** (`linea` / `oscuro-linea`): los bordes de tarjetas y campos y los separadores de listas.
- **Verde niebla** (`verde-niebla` / `oscuro-verde-niebla`): fondo suave para notas neutras, pastillas neutras y la pestaña elegida. Casi no se distingue del fondo (1,1:1 en claro y 1,3:1 en oscuro), así que **nunca** debe ser la única señal de que algo está elegido.

### Estados
- **Verde hoja** (`verde-hoja`, con su `-fondo`): algo salió bien, por ejemplo un pago hecho o "Todo al día".
- **Ámbar** (`ambar`, con su `-fondo`): atención, por ejemplo un pago por vencer o algo que se acaba en la despensa.
- **Rojo ladrillo** (`rojo-ladrillo`, con su `-fondo`): se pasó del presupuesto, un pago vencido o borrar después de confirmar.
- **Tinta sobre rojo** (`rojo-ladrillo-tinta` / `oscuro-rojo-ladrillo-tinta`), **Nuevo**: el texto sobre un fondo rojo lleno, es decir, el saldo negativo y el globito de alertas. Es blanco en claro y rojo muy oscuro en oscuro (7,1:1). En CSS será `--bad-ink`.

### Named Rules
**The Color Means Something Rule.** El ámbar y el rojo solo se usan para avisar. Nunca son decoración ni el color de una marca.

**The Ink Pair Rule.** Todo color lleno lleva su tinta: sobre verde, `--accent-ink`; sobre rojo, `--bad-ink`. Nunca se escribe `#fff` fijo sobre un color que cambia en modo oscuro. Los textos tienen que medir al menos 4,5:1 en los dos temas.

## Typography

**Display Font:** la del sistema (`-apple-system`, que en el iPhone es San Francisco, con Segoe UI, Roboto y `system-ui` de respaldo).
**Body Font:** la misma.

**Character:** una sola familia, la del teléfono, que se siente nativa y no necesita descargar nada. La jerarquía sale del peso y del tamaño, no de mezclar fuentes.

### Hierarchy
- **Display** (800, clamp 38–52 px, 1,05): solo para la cifra grande de lo que queda en Hoy. Va con números de ancho fijo.
- **Headline** (700, 20 px): el título de la sección arriba.
- **Title** (700, 16 px): el título de cada tarjeta.
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
- **Principal:** verde pino lleno con su tinta, 16 px y 700, esquinas de 12 px. Hay uno por tarjeta como máximo, para la acción que confirma algo. Desactivado se ve al 55 % de opacidad.
- **Fantasma:** sin relleno, con borde de línea y tinta. Se usa para acciones secundarias como "La preparé" o "Copiar". Mide al menos 44 px de alto.
- **Enlace de borrar:** texto gris subrayado de 12 px. El primer toque lo vuelve rojo y lo cambia a "¿Seguro? Borrar" durante 3,5 s; el segundo toque borra. **Nuevo:** su área de toque llega a 44 px de alto. Solo se usa para borrar o quitar: los demás enlaces, como "Olvidé mi contraseña", usan un estilo neutro.
- **Circulares (‹ › − +):** borde de línea sobre la superficie. **Nuevo:** miden al menos 40 px a la vista y 44 px de área de toque, y desactivados se ven al 40 % de opacidad.
- **Foco:** contorno de 2 px en verde pino, separado 2 px del borde.

### Chips
- **Pastilla:** 12 px y 700, totalmente redonda, con el color de estado sobre su fondo (verde, ámbar, rojo o neutra). Sirve para estados ("Vence en 2 días") y datos rápidos, como la temperatura y los minutos de la freidora.
- **Globito de alerta:** el número sobre rojo lleno, encima de la pestaña. **Nuevo:** su texto usa la tinta sobre rojo.

### Segmented control
- Dos o tres botones del mismo ancho en una cuadrícula con 6 px entre ellos. Se usa para el medio de pago, Desayuno/Almuerzo/Comida y el tipo de alimento.
- **Nuevo (decisión D2):** el elegido va con verde pino lleno y su tinta. Los demás van con fondo de página, borde de línea y tinta. Así se nota cuál está elegido en los dos temas.

### Cards / Containers
- **Corner Style:** 14 px.
- **Background:** superficie, con borde de línea de 1 px y sin sombra.
- **Internal Padding:** 14 px.
- **Tarjeta principal (hero):** verde pino lleno, 18 px de esquina, con un rótulo en mayúsculas, la cifra grande, una línea de detalle y una barra de avance. Cuando el saldo es negativo, pasa a rojo ladrillo con la tinta sobre rojo.
- **Nota:** caja sin borde, de 12 px de esquina, con el color de estado sobre su fondo. Sirve para avisos y resúmenes; si se puede tocar, el texto va en 600.

### Inputs / Fields
- **Style:** relleno de fondo, borde de línea, 10 px de esquina, 16 px de letra, unos 45 px de alto. Los rótulos van encima, en 12 px y 600, con tinta suave.
- **Focus:** contorno verde pino de 2 px.
- **Fechas y horas:** ocupan todo el ancho de su columna, con el texto a la izquierda.

### Navigation
- **Pestañas de abajo:** cinco por sección, con texto de 12 px y 600 en tinta suave. La elegida va con fondo verde niebla y texto verde pino. **Nuevo:** cada pestaña mide al menos 44 px de alto.
- **Selector de sección (arriba):** "Mis Quincenas" y "Mis comidas" como texto de 17 px. El elegido va en tinta, en 700 y con un chulo verde. **Nuevo:** área de toque de 44 px.

### Casilla de pago
La casilla cuadrada, con esquinas de 9 px, que marca un pago como hecho. Vacía: borde de línea de 2 px. Marcada: verde hoja lleno con un chulo en la tinta sobre verde. **Nuevo:** mide 36 px a la vista y 44 px de área de toque, y el chulo nunca va en `#fff` fijo.

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

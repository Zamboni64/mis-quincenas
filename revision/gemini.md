# Auditoría Visual y de Experiencia de Usuario (UI/UX)
**Proyecto:** Mis Quincenas (PWA)  
**Evaluador:** Gemini (Antigravity) con skill Impeccable  
**Modo de diseño:** *Operate* (herramienta de uso diario personal, prioridad en escaneabilidad, rapidez, consistencia táctil y confort visual en iPhone)  
**Entorno de prueba:** iPhone 12/13/14 (viewport 390×844 px, DPR 3.0), probado en Modo Claro y Modo Oscuro con datos realistas completos.

---

## Resumen: Los 5 problemas más importantes

1. **Defectos críticos de contraste en Modo Oscuro (Accesibilidad y legibilidad rota)**
   - **En Pagos:** el chulo de pago realizado (`.check[aria-pressed="true"]`) usa texto blanco (`#fff`) sobre fondo verde pastel claro (`#8AD6A8`), produciendo un ratio de contraste de apenas **1.71:1** (falla el estándar WCAG AA de 4.5:1). El chulo es prácticamente invisible.
   - **En Hoy (Saldo negativo):** si el usuario se pasa de su presupuesto, `.hero.neg` aplica fondo salmón claro (`#F2A097`) con texto blanco (`#fff`), resultando en un ratio de **1.78:1**. En la situación financiera más delicada, la cifra principal no se puede leer en modo oscuro.
2. **Áreas táctiles (Touch Targets) sistemáticamente menores a 44×44 px en tareas de alta frecuencia**
   - Más de 100 elementos interactivos en toda la app no alcanzan el estándar ergonómico de Apple HIG y WCAG (44×44 px): los botones de quincena/día (`36×36 px`), el checkbox de marcar pago (`30×30 px`), los steppers `−` y `+` de la despensa (`34×34 px`), los enlaces «Borrar» y «Editar» (`29 px` de alto) y los botones de la barra de pestañas fija inferior (`37 px` de alto). En el uso diario con una sola mano, provocan toques fallidos constantes.
3. **Desbordamiento horizontal ciego en la tabla de deudas (Pestaña Plan)**
   - La tabla mes a mes mide 563 px de ancho en una pantalla de 390 px (+173 px ocultos). Aunque la columna «Mes» es fija, no tiene borde derecho ni sombra que la separe de las columnas que pasan por debajo, y no hay ningún indicador visual de desplazamiento horizontal. Una persona que consulta su plan no se entera de que a la derecha continúan los saldos de cada deuda, el total y el abono extra.
4. **Sobrecarga cognitiva y longitud vertical excesiva en pantallas de control (Pestañas Más y Plan)**
   - La pestaña «Más» supera los 3000 px de altura continua con 9 tarjetas consecutivas, mientras que «Plan» despliega más de 20 meses sin paginación ni colapso (1330 px de tabla). En un teléfono de 844 px de alto, esto demanda scroll extenuante para acciones rutinarias como hacer un respaldo o consultar un dato.
5. **Jerarquía invertida y fatiga visual en la pantalla principal (Hoy)**
   - El formulario para anotar gastos permanece siempre completamente desplegado (423 px de alto), empujando la lista de gastos y los desgloses fuera de la vista inicial. El usuario entra a ver «cuánto le queda» y qué ha gastado hoy, pero tiene que sortear un formulario masivo antes de ver sus movimientos recientes.

---

## 1. Pestaña: Hoy

### 1.1. Contraste roto en Modo Oscuro cuando la quincena entra en saldo negativo (`.hero.neg`)
- **Qué se ve mal:** Cuando los gastos superan el dinero disponible, el hero card cambia a la clase `.hero.neg`. En modo oscuro, `--bad` se define como `#F2A097` (un tono pastel claro) y el texto se fuerza en `#fff`. El contraste resultante es **1.78:1**, completamente ilegible.
- **Por qué importa:** El momento en que el usuario se queda sin dinero o se sobrepasa en la quincena es el más crítico. No poder leer la cifra con claridad en la noche o con poca luz genera ansiedad y confusión.
- **Propuesta:** `[visual]` En modo oscuro, definir para `.hero.neg` un color de texto oscuro de alto contraste (`color: #40201C` o `#0D1412`), o invertir la presentación utilizando fondo oscuro con borde y texto de alerta en `--bad`.

### 1.2. Botones de quincena anterior y siguiente (`#qPrev`, `#qNext`) con tamaño táctil insuficiente (36×36 px)
- **Qué se ve mal:** Los círculos de navegación miden solo 36×36 px y los glifos `‹` y `›` no tienen área de toque expandida.
- **Por qué importa:** Al sostener el iPhone con el pulgar, 36 px queda muy por debajo de la yema del dedo (44 px). Con frecuencia se toca el fondo o el rótulo en lugar del botón, entorpeciendo la revisión de quincenas pasadas.
- **Propuesta:** `[visual]` Aumentar el tamaño visual del botón a mínimo 40×40 px con un área táctil mínima de 44×44 px (`padding` o contenedor con margen interactivo).

### 1.3. Enlaces «Borrar» en cada gasto con área táctil diminuta (29 px) en la zona de scroll del pulgar
- **Qué se ve mal:** Cada gasto muestra al extremo derecho un botón `.del` de 45×29 px (`font-size: 12px; padding: 6px`).
- **Por qué importa:** El extremo derecho es exactamente el área de la pantalla sobre la que descansa y desliza el pulgar de una persona diestra en el iPhone. Al hacer scroll para ver gastos viejos, es muy fácil rozar accidentalmente el botón «Borrar» o fallar al intentar pulsarlo a propósito.
- **Propuesta:** `[visual]` Asignar al botón `.del` una altura mínima táctil de 44 px (usando padding vertical transparente) y garantizar una separación de al menos 12 px respecto al monto en dinero (`.amt`).

### 1.4. Formulario de «Anotar un gasto» fijo y extenso (423 px) que desplaza los gastos del día
- **Qué se ve mal:** El formulario de gasto ocupa más de la mitad de la pantalla vertical con 6 filas de controles: Valor, Categoría, Fecha, Descripción, Medio de pago (2 botones) y Botón de envío.
- **Por qué importa:** La pantalla «Hoy» se abre varias veces al día solo para consultar rápidamente el saldo y verificar los últimos gastos. Tener el formulario ocupando 423 px fijos obliga a hacer scroll continuo para ver los gastos ya registrados y las barras de categoría.
- **Propuesta:** `[visual]` Compactar los espacios del formulario (reducir márgenes verticales de labels e inputs de 10 px a 6 px) o agrupar Categoría y Medio de pago en una presentación más compacta para que el inicio de la lista de gastos asome en el primer pantallazo del iPhone.

---

## 2. Pestaña: Pagos

### 2.1. Contraste invisible en Modo Oscuro en los botones de pago marcado (`.check`)
- **Qué se ve mal:** Al marcar un pago como pagado, el botón recibe `aria-pressed="true"`, aplicando `background: var(--ok); color: #fff`. En modo oscuro, `--ok` es `#8AD6A8` (verde menta claro). El chulo blanco (`#fff`) sobre ese fondo tiene un contraste de **1.71:1**.
- **Por qué importa:** El usuario marca un recibo o libranza y visualmente parece una casilla verde lisa vacía. No se distingue el chulo de confirmación, creando la sensación de que la app no registró el pago.
- **Propuesta:** `[visual]` En `css/estilos.css`, cambiar el color del chulo activo a un color oscuro: `.check[aria-pressed="true"] { color: var(--accent-ink); }` (que en dark mode evalúa a `#06211B`, logrando contraste superior a 10:1).

### 2.2. Botón checkbox de pago (`.check`) de apenas 30×30 px
- **Qué se ve mal:** El control de marcar pago es una caja cuadrada de 30×30 px ubicada a la izquierda de cada ítem de pago.
- **Por qué importa:** Es la interacción principal de esta pantalla. En el celular, apuntar a un recuadro de 30 px requiere concentración innecesaria y con frecuencia se pulsa el texto o se pierde el toque.
- **Propuesta:** `[visual]` Incrementar el recuadro a 36×36 px y fijar el área táctil mínima del elemento a 44×44 px (`display: inline-flex; align-items: center; justify-content: center; min-width: 44px; min-height: 44px`).

### 2.3. Duplicación de pagos entre «Vencidos o por vencer» y «Este mes»
- **Qué se ve mal:** Si un pago está próximo a vencer o vencido (por ejemplo Internet o Datos), aparece duplicado en la tarjeta de alertas y en la tarjeta del mes corriente.
- **Por qué importa:** Para alguien que revisa rápidamente sus obligaciones de la quincena, ver dos filas idénticas con el mismo monto despierta la duda de si se le está cobrando dos veces o si hay dos facturas pendientes.
- **Propuesta:** `[visual]` Añadir en la tarjeta «Este mes» una indicación visual sutil (o badge «En alerta arriba») o atenuar el ítem en la lista general para que se entienda que es la misma obligación.

### 2.4. Tarjeta «Recordatorios en el calendario» consume 301 px fijos restando foco a los pagos
- **Qué se ve mal:** Una tarjeta completa con un párrafo largo de 4 renglones, selector de hora y botón ancho ocupa el tercio inferior de la pantalla.
- **Por qué importa:** Esta acción se ejecuta una sola vez cada varios meses (para exportar el archivo `.ics`). Ocupa un espacio valioso que debería estar dedicado a ver las obligaciones del mes siguiente.
- **Propuesta:** `[visual]` Convertir la tarjeta en un `<details><summary>` colapsable («Opciones de calendario») o compactarla al pie de página con un enlace de acción secundaria.

---

## 3. Pestaña: Ingresos

### 3.1. Jerarquía invertida: «Plata que me deben» aparece antes de «Anotar plata que entró»
- **Qué se ve mal:** La primera tarjeta que recibe al usuario es «Plata que me deben» (con lista de deudores y formulario para agregar personas). El formulario principal de registrar dinero que ingresó está en segundo lugar.
- **Por qué importa:** La razón habitual de entrar a esta pestaña es asentar un ingreso extra (un freelance, una venta, un reintegro). La lista de cuentas por cobrar a terceros es una consulta pasiva que no debería desplazar la acción operativa primaria.
- **Propuesta:** `[visual]` Reorganizar el orden en `index.html`: colocar primero «Anotar plata que entró» y «Lo que ha entrado», y ubicar «Plata que me deben» a continuación.

### 3.2. Texto de ayuda del destino («Colchón y deudas») excesivamente denso y técnico
- **Qué se ve mal:** Al seleccionar «Colchón y deudas», el párrafo `#iAyuda` despliega un párrafo de dos frases que nombra, una por una, las deudas a las que va la plata y en qué orden, antes y después de la prima de diciembre.
- **Por qué importa:** Genera una pared de texto con nombres específicos de deudas que abruma la vista e incrementa la carga cognitiva al registrar un ingreso sencillo.
- **Propuesta:** `[visual]` Sintetizar el texto en una frase clara y concisa: *"Se reparte automáticamente entre su colchón de ahorro y el abono a deudas según su plan."*

### 3.3. Enlaces «Quitar» y «Borrar» con objetivo táctil de 29 px de alto
- **Qué se ve mal:** Tanto en la lista de dinero adeudado como en la lista de ingresos históricos, los botones de eliminación miden 45×29 px.
- **Por qué importa:** Dificulta la interacción ágil en el iPhone, obligando a pulsar varias veces con la punta del dedo para acertar.
- **Propuesta:** `[visual]` Expandir la zona táctil del botón a mínimo 44 px de alto mediante padding.

---

## 4. Pestaña: Plan

### 4.1. Desbordamiento horizontal ciego en la tabla mes a mes (563 px de ancho en viewport de 390 px)
- **Qué se ve mal:** La tabla `#planMeses` se desborda 173 px hacia la derecha. Aunque la columna «Mes» tiene `position: sticky; left: 0`, en modo claro y oscuro se funde con el resto del contenido al hacer scroll, porque no tiene borde divisorio ni sombra en el borde derecho.
- **Por qué importa:** El usuario promedio de iPhone no sabe que la tabla continúa hacia la derecha (faltan por verse las columnas de cada deuda, el total y el abono extra). Al deslizar, los números pasan por debajo de la columna fija sin separación visual nítida.
- **Propuesta:** `[visual]` En `css/estilos.css`:
  1. Agregar `border-right: 1px solid var(--line); box-shadow: 2px 0 4px rgba(0,0,0,0.06)` a `th:first-child, td:first-child`.
  2. Añadir en el contenedor `.scroll` una sombra o degradado en el borde derecho que sugiera que el contenido continúa.

### 4.2. Longitud vertical abrumadora de la tabla mes a mes (1330 px y más de 20 filas)
- **Qué se ve mal:** Se proyectan más de 20 meses seguidos en una sola tabla continua, demandando más de dos pantallas de desplazamiento vertical de números pequeños (13 px).
- **Por qué importa:** Genera sobrecarga de información («The Wall of Options / Numbers»). En el día a día, al usuario le interesa saber cómo evoluciona su deuda en los próximos 3 a 6 meses; ver 2028 de golpe abruma y cansa.
- **Propuesta:** `[visual]` Mostrar inicialmente los primeros 6 u 8 meses, con un botón sutil «Ver proyección completa hasta el final» que expanda el resto.

### 4.3. Resumen de libertad financiera luce como una nota secundaria plana
- **Qué se ve mal:** El bloque `#planResumen` se muestra con la clase `.note.plain` (fondo grisáceo/verde tenue) y trae una frase con la deuda total a la fecha de corte y el mes en que, según el plan, queda libre de deudas.
- **Por qué importa:** Saber cuándo se termina de pagar la última deuda es el mayor logro y motivador de toda la app. Presentarlo con la misma jerarquía de un aviso cualquiera le quita impacto emocional positivo.
- **Propuesta:** `[visual]` Darle un tratamiento de tarjeta destacada con tipografía más grande para el mes de libertad financiera y una insignia o barra de progreso visual del plan.

---

## 5. Pestaña: Más

### 5.1. Longitud excesiva de la pantalla (más de 3000 px de scroll vertical) con 9 tarjetas inconexas
- **Qué se ve mal:** Se acumulan 9 tarjetas verticales una tras otra: Preguntarle a Claude, Sincronización, Respaldo, Excel, Corregir libre, Corregir casino, Apartado real, Gastos fijos y Mis datos.
- **Por qué importa:** Encontrar una opción específica (como descargar un respaldo o cambiar un dato del arriendo) exige deslizar la pantalla durante varios segundos. Viola el principio de escaneabilidad del modo *Operate*.
- **Propuesta:** `[visual]` Agrupar las tarjetas en 3 bloques temáticos con separadores claros o estilo de lista de configuración de iOS:
  - *Quincena actual:* Corregir libre, Casino, Apartado.
  - *Datos y finanzas:* Mis datos, Otros gastos fijos.
  - *Datos y cuenta:* Respaldo, Excel, Sincronización, Preguntarle a Claude.

### 5.2. Tres tarjetas de ajuste puntual («Libre», «Casino», «Apartó») con diseño idéntico y repetitivo
- **Qué se ve mal:** Tres tarjetas consecutivas con la misma estructura (título, párrafo de 3 renglones, input y botón Guardar) consumen 700 px verticales.
- **Por qué importa:** La similitud estructural hace que el usuario se confunda entre corregir lo libre, ajustar el casino o anotar lo apartado.
- **Propuesta:** `[visual]` Unificar los tres ajustes puntuales de la quincena en una sola tarjeta con selector de pestaña interna o campos organizados en un solo bloque coherente.

### 5.3. Acordeones `<summary>` en «Mis datos» con altura de solo 30 px
- **Qué se ve mal:** Las secciones de «Mis datos» («Nómina», «Gastos fijos», «Tarjeta», etc.) usan elementos `<summary>` estándar de 30 px de alto con texto gris de 15 px.
- **Por qué importa:** En el teléfono es difícil tocar con precisión el encabezado colapsable para desplegar la sección deseada, fallando a menudo el toque.
- **Propuesta:** `[visual]` Dar estilo a los `<summary>` con padding vertical generoso (mínimo 12 px arriba y abajo, logrando 44 px de altura), chevron o indicador de flecha a la derecha y feedback visual al toque.

### 5.4. Botón «Olvidé mi contraseña» usa estilo `.del` (rojo subrayado) que parece una acción destructiva
- **Qué se ve mal:** En la tarjeta de Sincronización, el botón `#sOlvido` tiene la clase `del`, por lo que se pinta de color rojo/destructivo igual a «Borrar gasto».
- **Por qué importa:** El color rojo en interfaces móviles comunica peligro o borrado irreversible. Un usuario que necesita recuperar su acceso se asusta al ver un botón rojo pensando que va a borrar su cuenta.
- **Propuesta:** `[visual]` Cambiar la clase de `#sOlvido` a un estilo de enlace neutro o botón secundario sin color rojo de advertencia destructiva.

---

## 6. Pestaña: Menú (Mis comidas)

### 6.1. Estado inicial vacío dominado por un bloque técnico con `<textarea>` gigante
- **Qué se ve mal:** Si no hay menú guardado, se despliega de inmediato un área de texto de 110 px de alto para pegar código JSON de Claude con instrucciones técnicas.
- **Por qué importa:** La primera impresión visual es técnica e intimidante en lugar de invitar a organizar la alimentación semanal.
- **Propuesta:** `[visual]` Presentar una tarjeta inicial limpia y acogedora con un botón principal «Diseñar mi menú con Claude», que al tocarse revele el asistente paso a paso y el área para pegar la respuesta.

### 6.2. Botones de día anterior y siguiente (`#mPrev`, `#mNext`) con área táctil reducida (36×36 px)
- **Qué se ve mal:** Idénticos a los botones de quincena en «Hoy», miden 36×36 px con símbolos pequeños.
- **Por qué importa:** Al cambiar de día para ver qué toca cocinar mañana o pasado mañana, el área reducida causa toques errados.
- **Propuesta:** `[visual]` Ampliar el área interactiva a mínimo 44×44 px.

### 6.3. Falta de estructura visual diferenciada entre los tres momentos del día
- **Qué se ve mal:** Cuando hay menú, los platos de Desayuno, Almuerzo y Comida se presentan con el mismo peso en un bloque continuo de texto.
- **Por qué importa:** A las 7 am el usuario necesita ver inmediatamente el Desayuno; a la 1 pm, el Almuerzo. La falta de tarjetas o etiquetas visuales para cada momento dificulta la lectura en un vistazo rápido.
- **Propuesta:** `[visual]` Asignar a cada momento del día una pequeña insignia visual (`pill`) o bloque diferenciado (ej. icono o color temático suave para Desayuno, Almuerzo y Comida).

---

## 7. Pestaña: Despensa (Mis comidas)

### 7.1. Botones de ajuste rápido `−` y `+` (`.mini`) y «Editar» con tamaño de solo 34×34 px y 29 px
- **Qué se ve mal:** En cada alimento de la despensa hay un botón circular `−` (34×34 px), la cantidad y un botón `+` (34×34 px), junto a un botón «Editar» de 42×29 px.
- **Por qué importa:** Es la pantalla que se utiliza en la cocina, con frecuencia de pie, caminando o cocinando. Tocar botones de 34 px con una mano produce errores frecuentes de toque (pulsar el botón equivocado o no registrar el toque).
- **Propuesta:** `[visual]` Incrementar el tamaño de los botones `.mini` a por lo menos 40×40 px con un espaciador táctil de 44 px, y dar mayor protagonismo al número central.

### 7.2. Formulario «Agregar un alimento» abultado (648 px) con alta densidad de controles
- **Qué se ve mal:** Contiene selector de tipo en 2 columnas, nombre con datalist, dos bloques `.row2` con 4 inputs combinados, selector de piezas, y un acordeón de opciones avanzadas.
- **Por qué importa:** Genera fricción al inventariar la despensa. Para guardar algo simple como «Leche», el usuario se enfrenta a un cuestionario largo en lugar de un ingreso ágil.
- **Propuesta:** `[visual]` Reorganizar los campos en un flujo más espacioso: priorizar Nombre y Cantidad; mostrar los detalles de paquete («Cada bolsa trae...») solo cuando la unidad seleccionada lo justifique de forma natural.

### 7.3. Tarjeta de «Almuerzos fuera de casa» ocupa 142 px para un ajuste semanal esporádico
- **Qué se ve mal:** Una tarjeta dedicada completa con un `<select>` largo y un párrafo de aviso de 2 renglones se sitúa justo debajo del hero card de comidas.
- **Por qué importa:** Esta decisión se toma una vez por semana (el lunes), pero empuja hacia abajo la lista real de alimentos todos los demás días.
- **Propuesta:** `[visual]` Compactar el selector integrándolo como un control de pastillas horizontales (0 a 5 días) en la cabecera o dentro de un diálogo compacto de inicio de semana.

---

## 8. Pestaña: Recetas (Mis comidas)

### 8.1. Selector de momento del día («Desayuno», «Almuerzo», «Comida») con bajo contraste activo
- **Qué se ve mal:** El botón seleccionado en `.seg.seg3` usa `background: var(--soft); color: var(--accent)`. En modo oscuro, `--soft` es un verde-gris oscuro muy similar al fondo general.
- **Por qué importa:** Al cambiar entre Desayuno, Almuerzo y Comida, cuesta distinguir cuál filtro está encendido actualmente.
- **Propuesta:** `[visual]` Resaltar el botón activo con un fondo más evidente y legible (`background: var(--accent); color: var(--accent-ink)`).

### 8.2. Formato plano y denso de las tarjetas de recetas
- **Qué se ve mal:** Cada receta tiene el título en negrita, un texto explicativo largo de preparación, un selector de porciones minúsculo (`48×39 px`) y un botón `.ghost` apretado («La preparé: descontar»).
- **Por qué importa:** Cuesta escanear qué recetas están disponibles de inmediato. El botón de «La preparé» no tiene jerarquía de acción de confirmación.
- **Propuesta:** `[visual]` Convertir cada receta en una tarjeta con margen propio, badge de disponibilidad («Le alcanza para X veces») y botón de acción con buen padding táctil.

### 8.3. Párrafo de ingredientes faltantes difícil de escanear visualmente
- **Qué se ve mal:** En la sección «Comprando una o dos cosas», lo que falta se presenta en un párrafo corrido: *"Le falta: cebolla y zanahoria. Comprarlo cuesta unos $4.500, y le alcanza."*
- **Por qué importa:** Obliga a leer toda la frase para enterarse de qué ingrediente comprar en el supermercado.
- **Propuesta:** `[visual]` Destacar los ingredientes faltantes con pastillas rojas/naranja (`.pill.bad` o `.pill.warn`) y el costo estimado en negrita separada.

---

## 9. Pestaña: Compras (Mis comidas)

### 9.1. Estado vacío pasivo («No le falta nada por ahora») sin feedback positivo
- **Qué se ve mal:** Una tarjeta solitaria con una línea de texto gris apagado.
- **Por qué importa:** En una app de presupuesto y mercado, que no falte nada es una noticia excelente. Un diseño en modo *Operate* debe confirmar el estado con claridad y satisfacción.
- **Propuesta:** `[visual]` Presentar una nota positiva con icono de verificación (`✓`) y mensaje tranquilizador: *«Su despensa está cubierta según los mínimos establecidos.»*

### 9.2. Botón «Registrar compra» no advierte que descuenta dinero real de la quincena
- **Qué se ve mal:** El botón principal dice simplemente «Registrar compra» con el mismo color y estilo de cualquier formulario secundario.
- **Por qué importa:** Toda compra registrada descuenta inmediatamente plata de la quincena abierta en la pestaña Hoy. Si el usuario cree que solo está actualizando el inventario de despensa, alterará su presupuesto sin darse cuenta.
- **Propuesta:** `[visual]` Agregar un rótulo o microcopia clara junto al botón: *«Se guardará como gasto de Mercado en la quincena actual.»*

### 9.3. «Compras registradas» queda oculta al fondo sin confirmación visual inmediata
- **Qué se ve mal:** La lista de compras registradas y el botón «Deshacer» quedan por debajo del formulario (más allá de 700 px de altura).
- **Por qué importa:** Cuando el usuario registra una compra en la caja del supermercado, necesita ver de inmediato que se guardó y cuánto quedó, sin tener que hacer scroll hasta el fondo para confirmar.
- **Propuesta:** `[visual]` Mostrar una confirmación visual inmediata con el saldo restante al enviar el formulario.

---

## 10. Pestaña: Freidora (Mis comidas)

### 10.1. 19 objetivos táctiles menores a 44 px en la lista de recetas
- **Qué se ve mal:** Cada receta tiene un `<summary>` colapsable de 30 px de alto, selector de porciones de 39 px y botón `.ghost` de 37 px de alto.
- **Por qué importa:** En la cocina frente a la freidora, manipular el teléfono para ver los pasos de cocción de una receta resulta frustrante si los elementos colapsables son tan delgados.
- **Propuesta:** `[visual]` Dar a los `<summary>` un padding vertical que alcance los 44 px de altura mínima y asegurar que el botón «La preparé» tenga altura ergonómica.

### 10.2. Bloque de copiar despensa y pedir recetas a Claude ocupa 495 px fijos
- **Qué se ve mal:** Una tarjeta masiva con dos listas numeradas, botón y `<textarea>` de 110 px permanece siempre fija debajo de las recetas.
- **Por qué importa:** Es un asistente de configuración que se usa esporádicamente para cargar recetas, pero le roba el espacio a las recetas ya guardadas.
- **Propuesta:** `[visual]` Colapsar esta sección en un `<details>` cerrado por defecto («Cargar recetas nuevas con Claude») una vez que ya existen recetas guardadas.

### 10.3. Falta de insignias visuales para temperatura (°C) y tiempo (minutos)
- **Qué se ve mal:** La temperatura y los minutos están mezclados en el texto como un string plano (`200 °C · 15 min`).
- **Por qué importa:** En la freidora de aire, lo primero que se configura en la máquina es el calor y el temporizador. El ojo del usuario necesita localizar esos dos números en un segundo.
- **Propuesta:** `[visual]` Diseñar pastillas (`pills`) destacadas para la temperatura (`200 °C`) y el tiempo (`15 min`) en la cabecera de cada receta.

---

## 11. Navegación Global y Encabezado (Transversal)

### 11.1. Botones de la barra de navegación fija inferior (`.tabs button`) con altura de 37 px
- **Qué se ve mal:** Los botones miden solo 37 px de alto (`padding: 10px 1px`).
- **Por qué importa:** La barra de pestañas inferior es el medio de transporte principal de la app. En el iPhone, la cercanía con la barra de inicio táctil de iOS (home indicator) hace que toques en botones de 37 px a veces activen el gesto del sistema operativo en lugar de cambiar de pestaña.
- **Propuesta:** `[visual]` Aumentar la altura mínima del botón a 44 px asegurando que el padding inferior respete holgadamente `env(safe-area-inset-bottom)`.

### 11.2. El badge numérico de alertas en «Pagos» comprime el texto de la pestaña
- **Qué se ve mal:** Con 2 pagos en alerta, el badge rojo se posiciona de forma absoluta pegado al texto («Pagos2»).
- **Por qué importa:** En pantallas de 390 px con 5 botones de 74 px de ancho, el texto queda apretado y desalineado respecto a las demás pestañas.
- **Propuesta:** `[visual]` Ajustar la posición del badge (`top: -2px; right: 2px`) y asegurar un padding lateral equilibrado para que el texto «Pagos» permanezca centrado.

### 11.3. Selector superior de sección («Mis Quincenas» vs «Mis comidas») con altura táctil de 30 px
- **Qué se ve mal:** Los dos botones superiores miden solo 30 px de alto (`padding: 4px 0`).
- **Por qué importa:** Cambiar entre el presupuesto y la comida es el cambio de contexto más grande de la app. Un área táctil tan reducida en la parte superior del teléfono dificulta el toque con una sola mano.
- **Propuesta:** `[visual]` Incrementar el padding táctil del selector superior a mínimo 44 px de altura interactiva (`padding: 8px 6px`).

---

## Resumen del Inventario de Problemas

- **Total de problemas identificados y documentados:** **36 problemas**.
- **Distribución por tipo de cambio propuesto:**
  - `[visual]` (CSS / HTML): **35 problemas**. Casi la totalidad de las mejoras se pueden resolver ajustando estilos, jerarquías visuales, contrastes de color, tamaños de hit-target y orden semántico en el marcado.
  - `[lógica]` (JavaScript / Datos): **1 problema** (manejo y deduplicación de estados en listas de pagos vencidos vs del mes).
- **Cobertura:** 10 pestañas revisadas individualmente (5 de Mis Quincenas + 5 de Mis comidas) más la navegación global, tanto en Modo Claro como en Modo Oscuro sobre resolución nativa de iPhone (390×844 px).

---

## 12. Revisión cruzada de los Grupos 5, 5b y 6 (Trabajo de Claude)

**Fecha de revisión:** 2026-10-20  
**Evaluador:** Gemini (Antigravity)  
**Alcance revisado:** Commits `26de01d` (Grupo 5), `9859da0` (Grupo 5b) y `1b4d2b3` (Grupo 6) mediante `git diff 028ff90..HEAD`.  
**Metodología:** Inspección de código, cálculo de ratios de contraste WCAG, y pruebas dinámicas automatizadas en Chrome simulando iPhone (390×844 px, 375×812 px y 320×568 px) en Modo Claro y Modo Oscuro con datos ficticios completos.

### 12.1. Hallazgos del Grupo 5: Textos que arma la programación

1. **Ingresos — Ayuda de destino en lista de pasos (3.2):**
   - **Evaluación:** Excelente. La ayuda `#iAyuda` para «Colchón y deudas» se transformó de un bloque de texto denso a una lista ordenada `<ol class="pasos">` con 4 puntos jerárquicos claros. Reduce drásticamente la carga cognitiva sin alterar el orden financiero definido en `motor.js`.
2. **Plan — Mes de libertad financiera destacado (4.3):**
   - **Evaluación:** Muy acertado. La fecha de fin de deudas se muestra en 24 px (`font-weight: 800`, color `--accent`) en la cabecera de la nota resumen, mientras la deuda total pasa a tipografía secundaria (`.small`). Le otorga al logro principal de la app el peso visual motivador que requería.
3. **Compras — Mensaje previo y estado vacío motivador (9.1 y 9.2):**
   - **Evaluación:** Funciona perfectamente. La indicación *«Se guarda como gasto de Mercado de hoy.»* junto al botón `#coBtn` previene dudas operativas. Cuando no hay pendientes por comprar, el mensaje *«✓ Por ahora no le falta nada en la despensa.»* aporta un estado de tranquilidad inmediato.
4. **Recetas — Desglose de faltantes y costos (8.3):**
   - **Evaluación:** Gran mejora en escaneabilidad. Los ingredientes faltantes aparecen en pastillas individuales (`.pill.warn`) y el faltante en dinero en números tabulares (`.num`), facilitando decidir si preparar una receta o ir al supermercado.
5. **Freidora y Menú — Rótulos y pastillas de tiempo (6.3 y 10.3):**
   - **Evaluación:** Los títulos de cada comida en el Menú (`.subt`) adoptan el color de acento y 12 px en negrita. En la freidora, la temperatura y tiempo usan la clase `.pill.tiempo` con contraste óptimo en ambos temas (16:1 en claro, 13.5:1 en oscuro).
6. **Controles segmentados — Distinción del botón seleccionado (D2):**
   - **Evaluación:** La regla `.seg button[aria-pressed="true"]` ahora aplica relleno sólido `--accent` con texto `--accent-ink`. Resuelve definitivamente la ambigüedad que existía en el selector de medios de pago, momentos del día y tipos de alimentos.

### 12.2. Hallazgos del Grupo 5b: Pulido visual, Paleta Cobalto y Ocultar cifras

1. **Paleta «Cobalto» (Visual y Accesibilidad):**
   - **Evaluación:** Impecable. El paso del verde salvia a los tonos Cobalto y Azul Noche (`#0B1E4F` claro / `#13296A` oscuro) aporta sobriedad y elegancia técnica.
   - **Medición de contrastes:**
     - Tarjeta principal (Hero): **16.0:1** en Modo Claro; **13.5:1** en Modo Oscuro.
     - Botones primarios: **5.52:1** en Modo Claro; **6.74:1** en Modo Oscuro.
     - Texto principal sobre superficie: **18.05:1** en Claro; **15.43:1** en Oscuro.
     - Pestañas activas: **4.75:1** en Claro; **5.88:1** en Oscuro.
     - Todas las combinaciones superan con holgura el umbral WCAG AA (4.5:1).
2. **Tratamiento de tarjetas y bordes:**
   - **Evaluación:** En Modo Claro las tarjetas no usan borde (`--card-line: transparent`) y descansan sobre el fondo frío `#F3F5F8`, logrando una apariencia limpia y plana. En Modo Oscuro incorporan un borde sutil `#1E242C` que evita que se fundan con el fondo `#0B0E13`. Las esquinas redondeadas de 16 px se integran de forma natural con el lenguaje de iOS.
3. **Botón de Ojo para ocultar cifras (`#heroOjo`):**
   - **Evaluación:** Destacada función de privacidad.
     - Área táctil de **44×44 px** en la esquina superior derecha del hero.
     - Iconografía SVG reactiva (ojo abierto / ojo tachado) con atributos de accesibilidad coherentes (`aria-pressed`, `aria-label`).
     - Técnica CSS limpia: los números reales se mantienen en el DOM con `visibility: hidden` y se reemplazan visualmente por `::after` con viñetas `••••••`, garantizando que la estructura no sufra saltos de línea ni redimensionamientos abruptos.
     - Persistencia en `localStorage` (`mq-ocultar`), independiente de los datos sincronizados y del respaldo JSON.
4. **Navegación e interacciones móviles:**
   - **Evaluación:** Los botones de navegación (`#qPrev`, `#qNext`, `#mPrev`, `#mNext`) ahora incluyen vectores SVG perfectamente centrados. La barra inferior con `backdrop-filter: saturate(180%) blur(18px)` y opacidad al 86% replica con precisión la barra de navegación nativa de iOS. El selector superior de sección utiliza un subrayado limpio de 2 px con color acento.

### 12.3. Hallazgos del Grupo 6: Cambios con lógica aprobados (D3 a D6)

1. **D3 — Ocultamiento condicional de tarjeta de vencidos en Pagos:**
   - **Comportamiento verificado:**
     - Con pagos vencidos o por vencer: la tarjeta se muestra normalmente con sus elementos interactivos.
     - Al marcar todos los pagos pendientes: la tarjeta `#pgAlerta` se oculta automáticamente (`hidden = true`) y la nota superior muestra *"Todo al día."*.
     - Al desmarcar un pago: la tarjeta reaparece instantáneamente sin parpadeos ni errores en consola.
2. **D4 — Saldo disponible tras registrar compra:**
   - **Comportamiento verificado:** Al registrar una compra en la pestaña Compras, el mensaje de éxito incorpora de inmediato el estado financiero actual: *"Listo: [Producto] quedó en [X] y se descontaron [Y] de la quincena. Le quedan [Z] libres en la quincena."* (o el aviso de sobregiro si el saldo es negativo). Evita desplazarse innecesariamente a la pestaña Hoy para confirmar el margen restante.
3. **D5 — Botones de almuerzos fuera de casa (0 a 7):**
   - **Comportamiento verificado:**
     - Reemplazo exitoso del `<select>` por una cuadrícula ergonómica de 8 botones (`.seg.seg4`).
     - A 390 px y 375 px, cada botón alcanza **43.8 px de altura táctil** (prácticamente el estándar de 44 px).
     - A 320 px, el texto no se desborda (`scrollWidth === clientWidth`) y los botones mantienen proporción táctil cómoda.
     - La selección se guarda inmediatamente en `S.P.almuerzos_semana` con el esquema `{ semana: lunes(), dias: X }`, recalculando en tiempo real el estimado de días de comida en Despensa y preservando la sincronización en la nube.
4. **D6 — Estado vacío activo en Menú del día:**
   - **Comportamiento verificado:** Si no hay menú registrado, en lugar de un aviso estático vacío se ofrece el botón principal *«Pedirle el menú a Claude»*. Al pulsarlo, ejecuta un scroll suave (`smooth`) hacia la tarjeta de generación de menú y sitúa el foco del teclado en el botón de copiado de despensa (`#cCopiar`).

### 12.4. Conclusión de la revisión cruzada

La totalidad de los cambios introducidos por Claude en los Grupos 5, 5b y 6:
- **Cumplen estrictamente con la regla N7:** no se alteraron ni eliminaron IDs, atributos `data-*` ni clases requeridas por la lógica.
- **Mantienen intacto el contrato de datos:** no se modificó la estructura de guardado, sincronización ni respaldo.
- **Elevan la experiencia de usuario:** la combinación de la paleta Cobalto, los nuevos textos guiados, la botonera de almuerzos y el botón de privacidad consolidan el objetivo del *"tablero tranquilo"* para uso diario en el iPhone.

El proyecto queda en estado óptimo para proceder con el **Grupo 7 (Revisión cruzada final, verificación de versiones y publicación)**.

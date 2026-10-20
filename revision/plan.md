# Plan de la mejora visual

Une la auditoría de Gemini (`gemini.md`) con la segunda opinión de Claude (`claude.md`). Los números como 1.1 o 2.2 son los de Gemini, y los que empiezan con N son de Claude. Cada grupo se marca `[x]` cuando está hecho, probado y con su propio commit en `mejora-visual`.

**Cómo se trabaja cada grupo:**
- Una IA a la vez.
- Se prueba en claro y oscuro, a 375 y 390 px de ancho, con datos de prueba.
- La otra IA lo revisa con `git diff`.
- Nada va a `main` sin permiso del usuario.

**Regla para no romper la app (N7):**
- Se puede mover HTML y cambiar estilos.
- No se pueden renombrar ni quitar los `id`, los `data-*` (`data-col`, `data-debe`, `data-fijo`, `data-pago`, `data-tab`, `data-modo`, `data-menu-hecho`) ni las clases `.del`, `.check`, `.tabs button`, `.neg`, `.sure`, `.hecho` y `.alerta`.
- La programación encuentra los botones por esos nombres. Si cambian, borrar, marcar pagos o cambiar de pestaña dejan de funcionar sin avisar.

## Decisiones que le tocan al usuario

**Aprobadas por el usuario el 2026-10-20: D1 a D6, todas como se recomienda.**

| # | Pregunta | Lo que recomiendan las IA |
|---|---|---|
| D1 | ¿Quitar de `gemini.md` el saldo total y los nombres de deudas y bancos? | Sí. Las reglas prohíben esos datos en `revision/`. |
| D2 | ¿El botón seleccionado (medio de pago, Desayuno/Almuerzo/Comida, tipo de alimento) pasa a fondo verde lleno con letra clara? Afecta a toda la app. | Sí (8.1). Hoy casi no se distingue cuál está elegido, ni en claro ni en oscuro. |
| D3 | En Pagos, ¿esconder la tarjeta "Vencidos o por vencer" cuando está vacía? | Sí, pero dejar que un pago vencido siga apareciendo también en "Este mes" (2.3). |
| D4 | ¿Mostrar, después de registrar una compra, cuánto queda libre en la quincena? | Sí (9.3). |
| D5 | ¿Cambiar el selector de almuerzos fuera de casa por botones del 0 al 7? | Opcional (7.3). Si se hace, debe ir de 0 a 7, no de 0 a 5. |
| D6 | ¿Cambiar el estado vacío del Menú por un botón "Pedirle el menú a Claude" que abre los pasos? | Opcional (6.1). |

## Grupos de trabajo

### Grupo 0 · Preparación · Claude
- [x] Limpiar `gemini.md` (D1).
- [x] `DESIGN.md` con `impeccable document`. Idea guía: "El tablero tranquilo", con trato cálido y amable. Sin la carpeta `.impeccable/`, por decisión del usuario.
  - Debe fijar el color del texto sobre rojo en modo oscuro (`--bad-ink`), cómo se ve un botón seleccionado (D2) y el alto mínimo de toque: 44 px.

### Grupo 1 · Contrastes en modo oscuro · Gemini · solo CSS · prioridad alta
- [ ] El chulo de pago marcado se lee en oscuro: `.check[aria-pressed="true"]` con `color: var(--accent-ink)` (2.1).
- [ ] La cifra de Hoy en negativo se lee en oscuro: `.hero.neg` con `--bad-ink` (1.1).
- [ ] El globito rojo de alertas de Pagos y Despensa se lee en oscuro: `.badge` con `--bad-ink` (N1).

### Grupo 2 · Tamaños de toque · Gemini · solo CSS · prioridad alta
Mínimo 44 px de área táctil. El dibujo puede quedar algo más chico.
- [ ] Barra de pestañas de abajo (11.1), y que el final de cada pestaña no quede tapado: `.wrap` con `calc(100px + env(safe-area-inset-bottom))` (N2).
- [ ] Chulo de pago `.check` (2.2).
- [ ] Botones − y + de la despensa `.mini` (7.1). Probar con nombres de alimentos largos.
- [ ] Flechas ‹ › de quincena y de día `.qnav` (1.2, 6.2), con estilo para cuando están desactivadas (N3).
- [ ] Botones Borrar, Quitar y Editar `.del` (1.3, 3.3), sin acercarlos más al monto.
- [ ] Encabezados desplegables `summary` en toda la app (5.3, 10.1) y botón "La preparé" (`.ghost`).
- [ ] Selector de arriba "Mis Quincenas / Mis comidas" `.apps` (11.3).
- [ ] Cuadros de texto `textarea` a 16 px para que el iPhone no haga zoom (N4).
- [ ] Revisar que nada se salga de la pantalla a 320 px.

### Grupo 3 · Tabla del plan · Gemini · CSS · prioridad media
- [ ] Borde y sombra en la columna "Mes", que queda fija, y una señal de que la tabla sigue hacia la derecha (4.1).

### Grupo 4 · Orden y plegado · Gemini · solo HTML · prioridad media
- [ ] Ingresos: "Anotar plata que entró" va primero (3.1).
- [ ] Pagos: "Recordatorios en el calendario" queda dentro de un desplegable cerrado (2.4).
- [ ] Más: agrupar en tres bloques con subtítulos (5.1).
  - Quincena: las tres correcciones dentro de un desplegable "Correcciones de una quincena", sin unir sus formularios (5.2).
  - Mis datos y gastos fijos.
  - Respaldo, Excel, sincronización y Preguntarle a Claude.
- [ ] Freidora: "Pedirle recetas a Claude" queda dentro de un desplegable cerrado (10.2).
- [ ] "Olvidé mi contraseña" pasa a un estilo de enlace neutro en vez de `.del`, conservando su `id` (5.4).
- [ ] Compactar un poco el espacio entre filas del formulario de gasto, sin achicar los campos (1.4).

### Grupo 5 · Textos que arma la programación · Claude · prioridad baja
- [ ] Compras: estado vacío con chulo y un mensaje positivo (9.1).
- [ ] Recetas: lo que falta se muestra en pastillas y el costo aparte (8.3).
- [ ] Compras: frase corta junto al botón, "Se guarda como gasto de Mercado de hoy" (9.2).
- [ ] Ingresos: la ayuda de "Colchón y deudas" se muestra como lista corta de pasos, con el mismo contenido (3.2).
- [ ] Plan: el mes en que queda libre de deudas, con letra más grande (4.3, sin barra de progreso).
- [ ] Menú y Freidora: más peso a los rótulos de cada comida y a la pastilla de °C y minutos (6.3, 10.3).

### Grupo 6 · Cambios con lógica · Claude · solo lo aprobado en D3 a D6
Antes de este grupo, el usuario guarda un respaldo desde la app.
- [ ] D3: esconder la tarjeta de vencidos cuando no hay ninguno.
- [ ] D4: confirmación con lo que queda libre después de registrar una compra.
- [ ] D5: botones de almuerzos fuera de casa, del 0 al 7.
- [ ] D6: nuevo estado vacío del Menú.

### Grupo 7 · Revisión cruzada y publicación
- [ ] Gemini revisa lo de Claude y Claude revisa lo de Gemini, con `git diff main`.
- [ ] Ver en el iPhone el globito de "Pagos" (11.2) y el color de la barra del sistema en modo oscuro (N5).
- [ ] Subir `VERSION` en `sw.js` y `VERSION_APP` en `js/app.js`, con el mismo número.
- [ ] Publicar en `main` solo con permiso del usuario.

## Descartado o aplazado

- **4.2, cortar la tabla del plan a 6 meses:** ya se corta sola cuando la deuda llega a cero.
- **8.2, "le alcanza para X veces":** es un cálculo nuevo; se puede pensar después.
- **7.2, rehacer el formulario de alimentos:** ya esconde campos según el tipo.
- **N6, bordes de los campos:** no es urgente.

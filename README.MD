# Taller: Formularios con validaciones

Formulario de registro para **Campus Código**, una plataforma de cursos en línea. La edad mínima de 18 años se presenta como requisito de la plataforma.

**Autores:** Mariana Alzate Barbosa y Santiago Castro Marlés

**Repositorio:** https://github.com/Kallst/taller-formularios

Solo HTML, CSS y JavaScript, sin librerías ni frameworks.

## Estructura

```
taller-formularios/
├── nativo/      Nivel 1: validación solo con atributos HTML
│   ├── index.html
│   └── estilos.css
├── registro/    Niveles 2 a 5: versión final
│   ├── index.html
│   ├── estilos.css
│   ├── app.js
│   └── validaciones.js
└── README.md
```

## Cómo probarlo

`app.js` es un módulo ES, así que `registro/index.html` no funciona abriéndolo con doble clic. Se abre con la extensión Live Server de VS Code (por ejemplo, `http://127.0.0.1:5500/registro/`). La versión de `nativo/` no usa JavaScript y se puede abrir directamente.

El formulario tiene siete campos (`nombre`, `email`, `password`, `confirmar`, `edad`, `pais`, `terminos`) y hasta tres teléfonos opcionales con `name="telefono"`. Países disponibles: Colombia, Argentina, Chile, Ecuador, México, Perú y España.

## Reparto del trabajo

Cada tarea está en una rama con el nombre de quien la hizo.

| Rama | Autor | Contenido |
|---|---|---|
| `santiago/n2-html-css` | Santiago | HTML con campos de error, `aria-describedby` y `aria-live`; estilos con `:user-invalid`; módulo `validaciones.js` |
| `mariana/n1-nativo` | Mariana | `nativo/index.html` con validación por atributos HTML |
| `santiago/n1-estilos` | Santiago | `nativo/estilos.css` |
| `mariana/n2-appjs` | Mariana | `app.js` con la Constraint Validation API |
| `mariana/n3-submit` | Mariana | Envío con `fetch`, `FormData`, estado de carga y manejo de errores |
| `santiago/n4-css` | Santiago | Marca de error con `[aria-invalid="true"]` |
| `mariana/n4-modulo` | Mariana | `app.js` como módulo y correo asíncrono con debounce |
| `mariana/n5-xss` | Mariana | Saludo con `textContent` |
| `santiago/n4-telefonos` | Santiago | Teléfonos dinámicos con validación |
| `santiago/n5-seguridad` | Santiago | Versión nativa lista para la prueba de seguridad |
| `mariana/n6-usabilidad` | Mariana | Mensaje de edad que explica el requisito |
| `santiago/n6-usabilidad-css` | Santiago | Correcciones de CSS de la revisión de usabilidad |

## Decisiones distintas a la guía

La guía tiene detalles que corregimos a propósito:

- **Mensajes unificados** entre el Nivel 2 y el Nivel 4 (por ejemplo, «Elige un país.» y «Debes aceptar los términos del servicio.»).
- **La contraseña no tiene máximo.** La tabla del taller solo pide mínimo 8 caracteres; la guía usaba `longitud(8, 64)`.
- **Los teléfonos son opcionales.**
- **El mensaje de edad cambió** a «Debes tener al menos 18 años para registrarte.» por la revisión de usabilidad. Por eso ya no coincide con el del Nivel 2 («El valor mínimo es 18.»).
- **Fallos del código de la guía que corregimos:**
  - los `id` repetidos en los teléfonos;
  - `FormData`, que perdía los teléfonos repetidos (se leen con `getAll`);
  - el evento `focusout`, que fallaba con los teléfonos;
  - el `submit`, que usaba `checkValidity` tras pasar al módulo;
  - el aviso «Comprobando…», que se marcaba como inválido;
  - la condición de carrera en la comprobación del correo;
  - el envío, que no esperaba a que terminara la comprobación del correo.

## Respuestas a las preguntas

### Nivel 1

**1. ¿Qué pasa si borras el atributo `name` de un campo y envías? ¿Por qué?**

El campo deja de viajar con el formulario. Al borrar `name` del campo Nombre y enviar, el formulario no se envía: aparece el error «Este campo es obligatorio.» y el foco vuelve a ese campo. Pasa porque el navegador solo incluye en los datos (`FormData`) los controles que tienen `name`. Sin `name`, el valor del campo no existe para el envío, así que el campo se ve vacío, y como es obligatorio, el envío se bloquea. En la versión nativa, sin JavaScript, el campo simplemente no aparece en la petición.

### Nivel 2

**2. Cambia `:user-invalid` por `:invalid`, recarga la página y describe la diferencia. ¿Cuál es mejor para el usuario y por qué?**

Con `:invalid`, al cargar la página todos los campos obligatorios aparecen en rojo antes de que la persona haga nada, porque están vacíos y vacío es inválido. Con `:user-invalid`, la página carga limpia y el error solo se marca después de que la persona interactúa con el campo y lo deja mal. Es mejor `:user-invalid`: nadie debería ver errores en un formulario que todavía no ha tocado.

### Nivel 3

**3. ¿Por qué se escucha `submit` en el formulario y no `click` en el botón?**

Porque el envío no siempre viene de un clic. Si la persona pulsa Enter dentro de un campo, el navegador envía el formulario sin que nadie haga clic en el botón, y el evento `submit` se dispara igual. En la prueba, al pulsar Enter en un campo, el formulario se envía y el servidor responde con un JSON (`{ "id": 101 }`). Escuchar `submit` cubre todas las formas de enviar (clic, Enter y envío desde código); escuchar `click` solo cubriría el ratón.

**Pruebas manuales del nivel 3.** Todas pasaron:
- red lenta: el botón queda en «Enviando…» y no se puede pulsar de nuevo;
- sin conexión: aparece el mensaje de error y el botón se activa otra vez;
- URL que no existe (404): llega como respuesta normal, se revisa `res.ok` y se muestra el mensaje de error;
- cuerpo de la petición: JSON con `telefono` como lista y sin `confirmar`.

### Nivel 4

**4. ¿Qué ventaja tiene que las reglas sean funciones puras?**

Una función pura solo depende de lo que recibe y no toca el DOM, así que siempre devuelve lo mismo con los mismos datos. Por eso las reglas se pueden probar sin navegador (probamos `validaciones.js` con Node en los 7 casos esperados), se reutilizan en cualquier campo o proyecto, y el mismo archivo podría ejecutarse también en el servidor.

**5. ¿Por qué la validación «el correo ya existe» no se puede hacer solo con atributos HTML?**

Los atributos HTML solo miran el valor que está escrito en el campo (que no esté vacío, que tenga formato de correo, etc.). Saber si el correo ya existe exige preguntarle al servidor, que es quien tiene la lista de correos registrados, y eso requiere código que haga la consulta y espere la respuesta. En el proyecto lo simulamos con una promesa de 600 ms y un debounce de 500 ms para no consultar en cada tecla.

### Nivel 5

**6. Parte A: edad 5 saltándose el formulario. ¿Llegó al servidor?**

Sí. Borramos los atributos `min` y `max` del campo Edad en DevTools, enviamos edad 5 y el servidor respondió con estado 201. Con `fetch` directo desde la consola, enviando `{ email: 'no-es-correo', edad: -3 }`, también respondió 201.

**7. ¿Qué demuestra esto y qué debe hacer el backend?**

Demuestra que la validación del navegador es una ayuda para la persona usuaria, no una medida de seguridad: el código y el HTML corren en el equipo de quien envía, y se pueden modificar o saltar. Por eso el backend debe revalidar todo con las mismas reglas (el mismo esquema) y usar **consultas parametrizadas**. En una consulta parametrizada el SQL y los datos viajan por separado: la consulta se escribe con marcadores (por ejemplo `... WHERE email = ?`) y los valores se pasan aparte. Así, un texto como `' OR '1'='1` se trata como un valor y nunca se ejecuta como código SQL. En este taller no hay backend, por lo que esta parte es conceptual.

**8. Parte B: diferencia entre `innerHTML` y `textContent` con `<b>Ana</b>`.**

Con `innerHTML`, el navegador interpreta el texto como HTML: se crea un elemento `<b>` real y se ve **Ana** en negrita. Con `textContent`, el texto se muestra tal cual: se ve `Hola, <b>Ana</b>` literal. Con una etiqueta `<b>` no pasa nada grave, pero con `innerHTML` alguien podría escribir código malicioso como nombre y se ejecutaría en el navegador (XSS). Por eso el saludo usa `textContent`.

**9. Revisión de todos los `innerHTML` del código.**

Hay un único `innerHTML`, en `app.js`, para crear las filas de teléfono. Solo inserta el `id` generado por el contador del código, nunca texto escrito por la persona. El saludo y los mensajes usan `textContent`.

### Parte C: usabilidad

Observaciones de la prueba del formulario y correcciones aplicadas:

| Observación | Campo | Problema | Corrección aplicada |
|---|---|---|---|
| 1 | Edad | Con edad 16, el mensaje decía «El valor mínimo es 18.» y no explicaba por qué | Mensaje nuevo: «Debes tener al menos 18 años para registrarte.» (`validaciones.js`) |
| 2 | Términos | La casilla medía 13×13 px, difícil de tocar | La casilla mide ahora 24×24 px (`estilos.css`) |
| 3 | Todos los campos | El borde de los campos tenía un contraste de 2,33:1 sobre el fondo, por debajo del 3:1 que pide WCAG | Borde `#6b7785`, con contraste de 4,25:1 (`estilos.css`) |

Prueba solo con teclado: con Tab, Mayús + Tab, flechas, Espacio y Enter se completa y se envía todo el formulario. El foco es visible en todos los elementos (contorno de 3 px), y al enviar con errores el foco va al primer campo con problema. También se revisó en pantalla de 375 px de ancho: no hay desplazamiento horizontal y los campos usan letra de 16 px.

## Validaciones por nivel

- **Nivel 1:** el formulario nativo valida los siete campos solo con atributos HTML.
- **Nivel 2:** mensajes en español junto a cada campo, con `aria-describedby` y `aria-live`; la confirmación de contraseña se valida con `setCustomValidity`.
- **Nivel 3:** envío con `fetch` y `FormData`, estado «Enviando…», sin doble envío y con errores de red y de respuesta.
- **Nivel 4:** las reglas viven en `validaciones.js`; correo asíncrono con debounce y teléfonos dinámicos (máximo 3).
- **Nivel 5:** se demostró que la validación se puede saltar, el saludo usa `textContent` y se corrigieron los problemas de usabilidad.
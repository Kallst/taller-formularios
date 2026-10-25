import { validarCampo, validarFormulario, reglas } from './validaciones.js';

const form = document.querySelector('#registro');
const boton = form.querySelector('button[type="submit"]');
const mensaje = document.querySelector('#mensaje');

const MSG_CORREO_USADO = 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?';

const leerDatos = () => Object.fromEntries(new FormData(form));

// Muestra o quita el error de un campo y actualiza aria-invalid
function mostrarError(nombre, texto) {
  const campo = form.elements[nombre];
  const error = document.getElementById(`${nombre}-error`);
  campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
  if (error) error.textContent = texto ?? '';
}

// Muestra un aviso informativo sin marcar el campo como inválido
function mostrarEstado(nombre, texto) {
  form.elements[nombre].setAttribute('aria-invalid', 'false');
  document.getElementById(`${nombre}-error`).textContent = texto;
}

function limpiarErrores() {
  for (const nombre of Object.keys(reglas)) mostrarError(nombre, null);
}

// Se valida al salir del campo (focusout), no a cada tecla
form.addEventListener('focusout', (e) => {
  const nombre = e.target.name;
  if (!(nombre in reglas)) return;

  const error = validarCampo(nombre, leerDatos());
  // El correo sin error de formato lo resuelve la comprobación asíncrona
  if (nombre === 'email' && !error) return;
  mostrarError(nombre, error);

  // Si cambia la contraseña, se revisa de nuevo la confirmación ya escrita
  if (nombre === 'password' && form.elements.confirmar.value) {
    mostrarError('confirmar', validarCampo('confirmar', leerDatos()));
  }
});

// Simula al servidor: estos correos ya están registrados
const registrados = ['ana@mail.com', 'admin@mail.com'];

const correoDisponible = (email) =>
  new Promise((ok) => {
    console.log('Consultando al servidor:', email);
    setTimeout(() => ok(!registrados.includes(email.toLowerCase())), 600);
  });

// Espera a que la persona deje de escribir antes de ejecutar fn
function debounce(fn, ms) {
  let espera;
  return (...args) => {
    clearTimeout(espera);
    espera = setTimeout(() => fn(...args), ms);
  };
}

// Cada consulta tiene un número; solo la última puede pintar en pantalla
let consultaActual = 0;

async function comprobarCorreo(email) {
  const consulta = ++consultaActual;
  mostrarEstado('email', 'Comprobando disponibilidad…');
  const libre = await correoDisponible(email);
  if (consulta === consultaActual) {
    mostrarError('email', libre ? null : MSG_CORREO_USADO);
  }
  return libre;
}

const revisarCorreo = debounce((email) => {
  if (validarCampo('email', { email })) return; // primero el formato
  comprobarCorreo(email);
}, 500);

form.elements.email.addEventListener('input', (e) => {
  consultaActual++; // invalida cualquier respuesta que siga en camino
  revisarCorreo(e.target.value);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensaje.textContent = '';

  // Muestra todos los errores al intentar enviar
  const datos = leerDatos();
  const errores = validarFormulario(datos);
  for (const nombre of Object.keys(reglas)) {
    mostrarError(nombre, errores[nombre]);
  }

  const primero = Object.keys(errores)[0];
  if (primero) {
    form.elements[primero].focus(); // lleva al primer error
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Enviando…';

  try {
    // El envío espera a que se confirme que el correo está libre
    if (!(await comprobarCorreo(datos.email))) {
      form.elements.email.focus();
      return;
    }

    delete datos.confirmar; // la confirmación no se envía

    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    // fetch solo falla sin red; un 404 o 500 llega como respuesta normal
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const creado = await res.json();
    mensaje.textContent = `¡Cuenta creada! Id: ${creado.id}`;
    form.reset();
    limpiarErrores();
  } catch (err) {
    mensaje.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
    console.error(err);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Crear cuenta';
  }
});
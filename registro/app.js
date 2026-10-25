const form = document.querySelector('#registro');

// Devuelve el mensaje en español según el tipo de error del campo
function mensajePara(input) {
  const v = input.validity;
  if (v.valueMissing) {
    if (input.name === 'pais') return 'Elige un país.';
    if (input.name === 'terminos') return 'Debes aceptar los términos del servicio.';
    return 'Este campo es obligatorio.';
  }
  if (v.typeMismatch) return 'Escribe un correo válido, por ejemplo ana@mail.com.';
  if (v.tooShort) return `Usa al menos ${input.minLength} caracteres.`;
  if (v.tooLong) return `Usa como máximo ${input.maxLength} caracteres.`;
  if (v.badInput || v.stepMismatch) return 'Escribe un número entero.';
  if (v.rangeUnderflow) return `El valor mínimo es ${input.min}.`;
  if (v.rangeOverflow) return `El valor máximo es ${input.max}.`;
  if (v.patternMismatch) return 'Incluye al menos una letra y un número.';
  if (v.customError) return input.validationMessage;
  return '';
}

function validarCampo(input) {
  const error = document.getElementById(`${input.id}-error`);
  if (error) error.textContent = mensajePara(input);
}

// setCustomValidity('') quita el error; sin limpiarlo el campo queda inválido
function validarConfirmacion() {
  const pass = form.elements.password;
  const conf = form.elements.confirmar;
  conf.setCustomValidity(
    conf.value && conf.value !== pass.value ? 'Las contraseñas no coinciden.' : ''
  );
}

// Se valida al salir del campo (focusout), no a cada tecla
form.addEventListener('focusout', (e) => {
  const esClave = e.target.name === 'password' || e.target.name === 'confirmar';
  if (esClave) validarConfirmacion();
  if (e.target.willValidate) validarCampo(e.target);
  // Si cambia la contraseña, se revisa de nuevo la confirmación ya escrita
  if (e.target.name === 'password' && form.elements.confirmar.value) {
    validarCampo(form.elements.confirmar);
  }
});

const boton = form.querySelector('button[type="submit"]');
const mensaje = document.querySelector('#mensaje');

// Quita los mensajes de error que quedan en pantalla
function limpiarErrores() {
  for (const p of form.querySelectorAll('.error')) p.textContent = '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensaje.textContent = '';
  validarConfirmacion();

  // Muestra todos los errores al intentar enviar
  for (const campo of form.elements) {
    if (campo.willValidate) validarCampo(campo);
  }

  if (!form.checkValidity()) {
    form.querySelector(':invalid').focus(); // lleva al primer error
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Enviando…';

  try {
    const datos = Object.fromEntries(new FormData(form));
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
    validarConfirmacion();
    limpiarErrores();
  } catch (err) {
    mensaje.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
    console.error(err);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Crear cuenta';
  }
});
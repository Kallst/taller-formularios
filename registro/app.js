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
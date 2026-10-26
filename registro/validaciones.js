// Reglas de validación del registro. Son funciones puras: no tocan el DOM.
// Cada regla recibe el valor (y todos los datos) y devuelve un mensaje o null.

export const requerido = (msg = 'Este campo es obligatorio.') =>
  (v) => (v === undefined || v === null || String(v).trim() === '' ? msg : null);

export const longitud = (min, max = Infinity) =>
  (v) => (v.length < min ? `Usa al menos ${min} caracteres.`
    : v.length > max ? `Usa como máximo ${max} caracteres.` : null);

export const formatoCorreo = () =>
  (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
    ? null
    : 'Escribe un correo válido, por ejemplo ana@mail.com.');

export const letraYNumero = () =>
  (v) => (/(?=.*[A-Za-z])(?=.*\d)/.test(v)
    ? null
    : 'Incluye al menos una letra y un número.');

export const rangoEntero = (min, max, msgMin) => (v) => {
  const n = Number(v);
  if (!Number.isInteger(n)) return 'Escribe un número entero.';
  if (n < min) return msgMin ?? `El valor mínimo es ${min}.`;
  if (n > max) return `El valor máximo es ${max}.`;
  return null;
};

export const igualA = (otroCampo, msg) =>
  (v, datos) => (v === datos[otroCampo] ? null : msg);

// Las 7 reglas del registro en un solo lugar
export const reglas = {
  nombre: [requerido(), longitud(3, 60)],
  email: [requerido(), formatoCorreo()],
  password: [requerido(), longitud(8), letraYNumero()],
  confirmar: [requerido(), igualA('password', 'Las contraseñas no coinciden.')],
  edad: [requerido(), rangoEntero(18, 120, 'Debes tener al menos 18 años para registrarte.')],
  pais: [requerido('Elige un país.')],
  // Un checkbox sin marcar no viaja en FormData, así que llega como vacío
  terminos: [requerido('Debes aceptar los términos del servicio.')],
};

// Devuelve el primer error del campo, o null
export function validarCampo(nombre, datos) {
  for (const regla of reglas[nombre] ?? []) {
    const error = regla(datos[nombre] ?? '', datos);
    if (error) return error;
  }
  return null;
}

// Devuelve un objeto { campo: mensaje } solo con los campos con error
export function validarFormulario(datos) {
  const errores = {};
  for (const nombre of Object.keys(reglas)) {
    const error = validarCampo(nombre, datos);
    if (error) errores[nombre] = error;
  }
  return errores;
}

// Los teléfonos no van en `reglas`: todos comparten el name "telefono"
export const MAX_TELEFONOS = 3;

export const formatoTelefono = () =>
  (v) => (/^\+?\d{7,15}$/.test(v)
    ? null
    : 'Escribe de 7 a 15 dígitos, con + opcional.');

// Un teléfono vacío es válido porque el campo es opcional
export function validarTelefono(valor) {
  const v = String(valor).trim();
  return v === '' ? null : formatoTelefono()(v);
}
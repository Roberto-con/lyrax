/** Utilidades de formato: dinero, fechas y textos. */
import { CONFIG } from '../config.js';

export function dinero(monto) {
  const num = Number(monto).toLocaleString('es-BO', {
    minimumFractionDigits: monto % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${CONFIG.moneda} ${num}`;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const nombreDia = (fecha) => DIAS[fecha.getDay()];

/** "martes 14 de octubre" */
export function fechaLarga(fecha) {
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

/** Date -> "2026-10-14" (hora local, no UTC) */
export function fechaISO(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "2026-10-14" -> Date local a las 00:00 */
export function desdeISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const hora = (h, min = 0) => `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

/** Escapa texto antes de insertarlo como HTML. */
export function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Iniciales para el recuadro de productos sin foto. */
export function iniciales(nombre) {
  return nombre.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

/**
 * MÓDULO HORARIO
 * Calcula si la tienda está abierta y qué fechas y horas de entrega
 * se pueden elegir, respetando la anticipación de las tartas.
 */
import { CONFIG } from '../config.js';
import { nombreDia, hora, fechaISO } from '../utils/formato.js';

const H = CONFIG.horario;
const P = CONFIG.pedidos;

const esDiaHabil = (fecha) => H.dias.includes(fecha.getDay());

export function estaAbierto(ahora = new Date()) {
  const h = ahora.getHours() + ahora.getMinutes() / 60;
  return esDiaHabil(ahora) && h >= H.abre && h < H.cierra;
}

/** Texto corto para el encabezado: "Abierto hasta las 18:00" */
export function estadoActual(ahora = new Date()) {
  if (estaAbierto(ahora)) {
    return { abierto: true, texto: `Abierto hasta las ${hora(H.cierra)}` };
  }
  // Buscar la próxima apertura
  for (let i = 0; i < 8; i++) {
    const d = new Date(ahora);
    d.setDate(d.getDate() + i);
    d.setHours(H.abre, 0, 0, 0);
    if (esDiaHabil(d) && d > ahora) {
      const cuando = i === 0 ? 'hoy' : i === 1 ? 'mañana' : `el ${nombreDia(d)}`;
      return { abierto: false, texto: `Cerrado. Abrimos ${cuando} a las ${hora(H.abre)}` };
    }
  }
  return { abierto: false, texto: 'Cerrado' };
}

/** Momento más temprano en que se puede entregar el pedido. */
function minimoEntrega(requiereAnticipacion, ahora) {
  const minutos = requiereAnticipacion ? P.horasAnticipacionTartas * 60 : P.minutosPreparacion;
  return new Date(ahora.getTime() + minutos * 60000);
}

/** Horarios (Date) disponibles para un día concreto. */
export function horariosDelDia(fecha, requiereAnticipacion, ahora = new Date()) {
  if (!esDiaHabil(fecha)) return [];
  const minimo = minimoEntrega(requiereAnticipacion, ahora);
  const lista = [];
  for (let m = H.abre * 60; m < H.cierra * 60; m += P.intervaloHoras) {
    const d = new Date(fecha);
    d.setHours(Math.floor(m / 60), m % 60, 0, 0);
    if (d >= minimo) lista.push(d);
  }
  return lista;
}

/** Fechas con al menos un horario disponible. */
export function fechasDisponibles(requiereAnticipacion, ahora = new Date()) {
  const fechas = [];
  for (let i = 0; i <= P.diasMaximos; i++) {
    const d = new Date(ahora);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    if (horariosDelDia(d, requiereAnticipacion, ahora).length) fechas.push(d);
  }
  return fechas;
}

export const claveFecha = fechaISO;

/**
 * MÓDULO CARRITO (lógica, sin interfaz)
 * Guarda los productos elegidos en el navegador (localStorage)
 * y avisa a la interfaz cada vez que algo cambia.
 */
import { CONFIG } from '../config.js';
import { buscarProducto } from '../data/productos.js';

const MAXIMO_POR_PRODUCTO = 99;
let lineas = new Map(); // id -> cantidad
const oyentes = new Set();

function guardar() {
  try {
    localStorage.setItem(CONFIG.claveCarrito, JSON.stringify([...lineas]));
  } catch { /* navegador sin almacenamiento: el carrito sigue funcionando en memoria */ }
}

function avisar() {
  guardar();
  oyentes.forEach((fn) => fn(resumen()));
}

export function cargar() {
  try {
    const datos = JSON.parse(localStorage.getItem(CONFIG.claveCarrito) || '[]');
    // Se descartan productos que ya no existen o están agotados
    lineas = new Map(
      datos.filter(([id, cant]) => {
        const p = buscarProducto(id);
        return p && p.disponible && Number.isInteger(cant) && cant > 0;
      }),
    );
  } catch {
    lineas = new Map();
  }
  avisar();
}

export function suscribir(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function agregar(id, cantidad = 1) {
  const p = buscarProducto(id);
  if (!p || !p.disponible) return false;
  const actual = lineas.get(id) || 0;
  lineas.set(id, Math.min(actual + cantidad, MAXIMO_POR_PRODUCTO));
  avisar();
  return true;
}

export function cambiarCantidad(id, cantidad) {
  if (cantidad <= 0) return quitar(id);
  lineas.set(id, Math.min(cantidad, MAXIMO_POR_PRODUCTO));
  avisar();
}

export function quitar(id) {
  lineas.delete(id);
  avisar();
}

export function vaciar() {
  lineas.clear();
  avisar();
}

export const cantidadDe = (id) => lineas.get(id) || 0;

/** Estado completo del carrito, listo para mostrar o enviar. */
export function resumen() {
  const items = [...lineas].map(([id, cantidad]) => {
    const producto = buscarProducto(id);
    return { producto, cantidad, subtotal: producto.precio * cantidad };
  });
  return {
    items,
    total: items.reduce((s, i) => s + i.subtotal, 0),
    unidades: items.reduce((s, i) => s + i.cantidad, 0),
    requiereAnticipacion: items.some((i) => i.producto.anticipacion),
    vacio: items.length === 0,
  };
}

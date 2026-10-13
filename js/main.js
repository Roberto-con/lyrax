/**
 * PUNTO DE ENTRADA
 * Conecta todos los módulos de la tienda. Cada módulo vive en su propio archivo:
 *   config.js            datos del negocio (WhatsApp, horario, QR, entrega)
 *   data/productos.js    catálogo
 *   modules/carrito.js   lógica del carrito
 *   modules/carritoUI.js panel del carrito
 *   modules/catalogo.js  tarjetas de productos y filtros
 *   modules/checkout.js  formulario, confirmación y pago
 *   modules/horario.js   abierto/cerrado y fechas de entrega
 *   modules/whatsapp.js  mensaje del pedido y enlace
 *   modules/avisos.js    mensajes emergentes
 */
import { CONFIG } from './config.js';
import * as carrito from './modules/carrito.js';
import { iniciarCatalogo } from './modules/catalogo.js';
import { iniciarCarritoUI } from './modules/carritoUI.js';
import { estadoActual } from './modules/horario.js';
import { enlaceWhatsApp } from './modules/whatsapp.js';
import { $$ } from './utils/dom.js';

function pintarEstado() {
  const e = estadoActual();
  $$('[data-estado]').forEach((el) => {
    el.textContent = e.texto;
    el.classList.toggle('estado--abierto', e.abierto);
    el.classList.toggle('estado--cerrado', !e.abierto);
  });
}

function pintarDatosFijos() {
  $$('[data-whatsapp]').forEach((a) => {
    a.href = enlaceWhatsApp(a.dataset.whatsapp || '');
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-horario]').forEach((el) => (el.textContent = CONFIG.horario.texto));
  $$('[data-anio]').forEach((el) => (el.textContent = new Date().getFullYear()));
  const numero = CONFIG.whatsapp.replace(/^591/, '+591 ');
  $$('[data-numero]').forEach((el) => (el.textContent = numero));
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarCatalogo();
  iniciarCarritoUI();
  carrito.cargar(); // dispara el primer dibujado del carrito
  pintarDatosFijos();
  pintarEstado();
  setInterval(pintarEstado, 60000);
});

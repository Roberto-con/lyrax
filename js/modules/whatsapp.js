/**
 * MÓDULO WHATSAPP
 * Arma el mensaje del pedido y el enlace que abre el chat de LYRAX.
 */
import { CONFIG } from '../config.js';
import { dinero, fechaLarga, hora } from '../utils/formato.js';

/** Número de pedido legible: LYX-261013-4821 */
export function generarNumeroPedido(fecha = new Date()) {
  const aa = String(fecha.getFullYear()).slice(2);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  const azar = String(Math.floor(1000 + Math.random() * 9000));
  return `LYX-${aa}${mm}${dd}-${azar}`;
}

/**
 * Devuelve el texto del pedido.
 * pedido = { numero, cliente:{nombre,celular}, entrega:{opcion,direccion,referencia},
 *            fecha: Date|null, pago: opcion, notas, carrito: resumen() }
 */
export function construirMensaje(pedido) {
  const { numero, cliente, entrega, fecha, pago, notas, carrito } = pedido;
  const l = [];
  l.push(`Hola ${CONFIG.tienda.nombre}, quiero hacer este pedido:`);
  l.push('');
  l.push(`*Pedido ${numero || '(se genera al confirmar)'}*`);
  l.push('');
  carrito.items.forEach(({ producto, cantidad, subtotal }) => {
    l.push(`• ${cantidad} × ${producto.nombre} (${producto.unidad.toLowerCase()}): ${dinero(subtotal)}`);
  });
  l.push('');
  l.push(`*Total de productos: ${dinero(carrito.total)}*`);
  if (entrega.opcion?.pideDireccion) l.push('_El costo del delivery se coordina por este chat._');
  l.push('');
  l.push(`*Nombre:* ${cliente.nombre || '—'}`);
  l.push(`*Celular:* ${cliente.celular || '—'}`);
  l.push(`*Entrega:* ${entrega.opcion?.nombre || '—'}`);
  if (entrega.opcion?.pideDireccion) {
    l.push(`*Dirección:* ${entrega.direccion || '—'}`);
    if (entrega.referencia) l.push(`*Referencia:* ${entrega.referencia}`);
  }
  l.push(`*Fecha y hora:* ${fecha ? `${fechaLarga(fecha)}, ${hora(fecha.getHours(), fecha.getMinutes())}` : '—'}`);
  l.push(`*Pago:* ${pago ? pago.nombre : '—'}${pago?.id === 'qr' ? ' (envío el comprobante por este chat)' : ''}`);
  if (notas) l.push(`*Notas:* ${notas}`);
  return l.join('\n');
}

export function enlaceWhatsApp(mensaje = '') {
  const base = `https://wa.me/${CONFIG.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

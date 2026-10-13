/**
 * MÓDULO CHECKOUT
 * Formulario del pedido (datos, entrega, fecha, pago), vista previa del
 * mensaje y pantalla de confirmación con envío por WhatsApp y pago QR.
 */
import { CONFIG } from '../config.js';
import * as carrito from './carrito.js';
import { fechasDisponibles, horariosDelDia } from './horario.js';
import { construirMensaje, enlaceWhatsApp, generarNumeroPedido } from './whatsapp.js';
import { avisar } from './avisos.js';
import { $, abrirPanel } from '../utils/dom.js';
import { dinero, escapar, fechaLarga, fechaISO, desdeISO, hora } from '../utils/formato.js';

const CLAVE_CLIENTE = 'lyrax.cliente.v1';
let cerrarPanel = null;

/* ---------- Datos guardados del cliente (para no reescribirlos) ---------- */
function clienteGuardado() {
  try { return JSON.parse(localStorage.getItem(CLAVE_CLIENTE) || '{}'); } catch { return {}; }
}
function guardarCliente(datos) {
  try { localStorage.setItem(CLAVE_CLIENTE, JSON.stringify(datos)); } catch { /* sin almacenamiento */ }
}

/* ---------- Formulario ---------- */
function opcionesHTML(nombre, opciones, seleccion) {
  return opciones.map((o) => `
    <label class="opcion">
      <input type="radio" name="${nombre}" value="${o.id}" ${o.id === seleccion ? 'checked' : ''} required>
      <div><strong>${escapar(o.nombre)}</strong><span>${escapar(o.detalle)}</span></div>
    </label>`).join('');
}

function dibujarFormulario() {
  const c = clienteGuardado();
  $('#checkout-formulario').innerHTML = `
    <div class="checkout">
      <form id="form-pedido" novalidate>
        <fieldset class="grupo">
          <legend>Tus datos</legend>
          <div class="fila">
            <div class="campo">
              <label for="f-nombre">Nombre y apellido</label>
              <input id="f-nombre" name="nombre" autocomplete="name" required value="${escapar(c.nombre || '')}" data-foco-inicial>
              <span class="campo__error" id="e-nombre"></span>
            </div>
            <div class="campo">
              <label for="f-celular">Celular (WhatsApp)</label>
              <input id="f-celular" name="celular" type="tel" inputmode="numeric" autocomplete="tel" placeholder="7xxxxxxx" required value="${escapar(c.celular || '')}">
              <span class="campo__error" id="e-celular"></span>
            </div>
          </div>
        </fieldset>

        <fieldset class="grupo">
          <legend>Entrega</legend>
          <div class="opciones">${opcionesHTML('entrega', CONFIG.entrega.opciones, c.entrega || 'recojo')}</div>
          <div id="zona-direccion" hidden>
            <div class="campo" style="margin-top:14px">
              <label for="f-direccion">Dirección</label>
              <input id="f-direccion" name="direccion" autocomplete="street-address" placeholder="Zona, calle y número" value="${escapar(c.direccion || '')}">
              <span class="campo__error" id="e-direccion"></span>
            </div>
            <div class="campo">
              <label for="f-referencia">Referencia (opcional)</label>
              <input id="f-referencia" name="referencia" placeholder="Ej.: portón azul, frente a la tienda" value="${escapar(c.referencia || '')}">
            </div>
          </div>
        </fieldset>

        <fieldset class="grupo">
          <legend>Fecha y hora de entrega</legend>
          <p class="campo__ayuda" id="ayuda-fecha" style="margin-bottom:12px"></p>
          <div class="fila fila--fecha">
            <div class="campo">
              <label for="f-fecha">Día</label>
              <select id="f-fecha" name="fecha" required></select>
            </div>
            <div class="campo">
              <label for="f-hora">Hora</label>
              <select id="f-hora" name="hora" required></select>
            </div>
          </div>
        </fieldset>

        <fieldset class="grupo">
          <legend>Pago</legend>
          <div class="opciones">${opcionesHTML('pago', CONFIG.pago.opciones, c.pago || 'qr')}</div>
        </fieldset>

        <div class="campo">
          <label for="f-notas">Notas para el pedido (opcional)</label>
          <textarea id="f-notas" name="notas" maxlength="300" placeholder="Ej.: escribir «Feliz cumpleaños» en la caja"></textarea>
        </div>

        <button type="submit" class="boton boton--primario boton--bloque">Confirmar pedido de <span id="total-boton"></span></button>
      </form>

      <aside class="ticket" aria-label="Vista previa del mensaje que nos llegará">
        <div class="ticket__barra"><i></i><i></i><i></i><span>pedido.txt · así nos llega tu pedido</span></div>
        <pre id="ticket-texto"></pre>
      </aside>
    </div>`;
}

/* ---------- Fechas y horas ---------- */
function llenarFechas() {
  const r = carrito.resumen();
  const selFecha = $('#f-fecha');
  const previa = selFecha.value;
  const fechas = fechasDisponibles(r.requiereAnticipacion);
  const hoy = fechaISO(new Date());
  const manana = fechaISO(new Date(Date.now() + 86400000));
  selFecha.innerHTML = fechas.map((f) => {
    const iso = fechaISO(f);
    const prefijo = iso === hoy ? 'Hoy, ' : iso === manana ? 'Mañana, ' : '';
    return `<option value="${iso}">${prefijo}${fechaLarga(f)}</option>`;
  }).join('');
  if (fechas.some((f) => fechaISO(f) === previa)) selFecha.value = previa;

  $('#ayuda-fecha').textContent = r.requiereAnticipacion
    ? `Tu pedido incluye tartas, que preparamos con ${CONFIG.pedidos.horasAnticipacionTartas} horas de anticipación. Atendemos ${CONFIG.horario.texto.toLowerCase()}.`
    : `Atendemos ${CONFIG.horario.texto.toLowerCase()}.`;
  llenarHoras();
}

function llenarHoras() {
  const r = carrito.resumen();
  const selHora = $('#f-hora');
  const previa = selHora.value;
  const iso = $('#f-fecha').value;
  if (!iso) { selHora.innerHTML = ''; return; }
  const horas = horariosDelDia(desdeISO(iso), r.requiereAnticipacion);
  selHora.innerHTML = horas.map((h) => {
    const v = hora(h.getHours(), h.getMinutes());
    return `<option value="${v}">${v}</option>`;
  }).join('');
  if (horas.some((h) => hora(h.getHours(), h.getMinutes()) === previa)) selHora.value = previa;
}

/* ---------- Lectura del formulario ---------- */
function leerPedido(numero = null) {
  const f = $('#form-pedido');
  const datos = new FormData(f);
  const entregaId = datos.get('entrega');
  const pagoId = datos.get('pago');
  let fecha = null;
  if (datos.get('fecha') && datos.get('hora')) {
    fecha = desdeISO(datos.get('fecha'));
    const [h, m] = datos.get('hora').split(':').map(Number);
    fecha.setHours(h, m, 0, 0);
  }
  return {
    numero,
    cliente: {
      nombre: (datos.get('nombre') || '').trim(),
      celular: (datos.get('celular') || '').replace(/\D/g, '').replace(/^591(?=\d{8}$)/, ''),
    },
    entrega: {
      opcion: CONFIG.entrega.opciones.find((o) => o.id === entregaId),
      direccion: (datos.get('direccion') || '').trim(),
      referencia: (datos.get('referencia') || '').trim(),
    },
    fecha,
    pago: CONFIG.pago.opciones.find((o) => o.id === pagoId),
    notas: (datos.get('notas') || '').trim(),
    carrito: carrito.resumen(),
  };
}

function validar(p) {
  const errores = {};
  if (p.cliente.nombre.length < 3) errores.nombre = 'Escribe tu nombre para saber a quién entregar el pedido.';
  if (!/^[67]\d{7}$/.test(p.cliente.celular)) errores.celular = 'Escribe un celular de 8 dígitos que empiece con 6 o 7.';
  if (p.entrega.opcion?.pideDireccion && p.entrega.direccion.length < 5) errores.direccion = 'Escribe la dirección de entrega.';
  ['nombre', 'celular', 'direccion'].forEach((k) => {
    const input = $(`#f-${k}`);
    const msg = $(`#e-${k}`);
    if (!input) return;
    input.setAttribute('aria-invalid', errores[k] ? 'true' : 'false');
    msg.textContent = errores[k] || '';
  });
  if (!p.fecha) errores.fecha = 'No hay horarios disponibles. Escríbenos por WhatsApp.';
  if (p.carrito.vacio) errores.carrito = 'Tu carrito está vacío.';
  return errores;
}

/* ---------- Vista previa ---------- */
function colorear(texto) {
  return escapar(texto)
    .replace(/\*([^*\n]+)\*/g, '<span class="k">*$1*</span>')
    .replace(/_([^_\n]+)_/g, '<span class="c">_$1_</span>')
    .replace(/(Bs [\d.,]+)/g, '<span class="v">$1</span>');
}

function actualizarVista() {
  const p = leerPedido();
  $('#zona-direccion').hidden = !p.entrega.opcion?.pideDireccion;
  $('#ticket-texto').innerHTML = colorear(construirMensaje(p));
  $('#total-boton').textContent = dinero(p.carrito.total);
}

/* ---------- Confirmación ---------- */
function qrVigente() {
  const vence = CONFIG.pago.qr.vence;
  if (!vence) return true;
  return fechaISO(new Date()) <= vence;
}

function mostrarConfirmacion(p) {
  const mensaje = construirMensaje(p);
  const enlace = enlaceWhatsApp(mensaje);
  const esDelivery = p.entrega.opcion?.pideDireccion;
  const total = dinero(p.carrito.total);

  let pasoPago;
  if (p.pago.id === 'qr' && qrVigente()) {
    pasoPago = `
      <li>
        <strong>Paga con QR</strong>
        <p>Escanea el QR desde la app de tu banco, ingresa el monto y envíanos el comprobante en el mismo chat.${esDelivery ? ' El delivery se paga aparte, cuando acordemos el costo.' : ''}</p>
        <div class="qr">
          <span class="qr__monto">${total}</span>
          <img src="${escapar(CONFIG.pago.qr.imagen)}" alt="Código QR de pago de ${escapar(CONFIG.pago.qr.banco)}" width="260">
          <a class="boton boton--secundario" href="${escapar(CONFIG.pago.qr.imagen)}" download="QR-pago-LYRAX.jpg">Descargar QR</a>
        </div>
      </li>`;
  } else if (p.pago.id === 'qr') {
    pasoPago = `<li><strong>Pide el QR de pago</strong><p>Te enviaremos el QR por WhatsApp para que pagues ${total}.</p></li>`;
  } else {
    pasoPago = `<li><strong>Ten listo el pago</strong><p>Pagas ${total} en efectivo al ${esDelivery ? 'recibir' : 'recoger'} tu pedido${esDelivery ? ', más el costo del delivery' : ''}.</p></li>`;
  }

  $('#checkout-formulario').hidden = true;
  const zona = $('#checkout-confirmacion');
  zona.hidden = false;
  zona.innerHTML = `
    <div class="confirmacion">
      <h3>Tu pedido está listo</h3>
      <p>Número de pedido: <span class="confirmacion__numero">${p.numero}</span></p>
      <ol>
        <li>
          <strong>Envíanos el pedido por WhatsApp</strong>
          <p>Se abrirá el chat de ${CONFIG.tienda.nombre} con tu pedido ya escrito. Solo toca enviar.</p>
          <a class="boton boton--whatsapp boton--bloque" id="enlace-enviar" href="${enlace}" target="_blank" rel="noopener" data-foco-inicial>Enviar pedido por WhatsApp</a>
        </li>
        ${pasoPago}
        <li>
          <strong>Espera nuestra confirmación</strong>
          <p>Te responderemos por WhatsApp para confirmar tu pedido${esDelivery ? ' y el costo del delivery' : ''}. Entrega: ${fechaLarga(p.fecha)}, ${hora(p.fecha.getHours(), p.fecha.getMinutes())}.</p>
        </li>
      </ol>
    </div>`;
  $('#checkout-titulo').textContent = 'Pedido confirmado';
  $('#checkout-pie').hidden = false;

  $('#enlace-enviar').addEventListener('click', () => {
    // El pedido ya salió: se vacía el carrito para no enviarlo dos veces
    setTimeout(() => carrito.vaciar(), 300);
    avisar('Abriendo WhatsApp…');
  });
  zona.querySelector('a').focus();
}

/* ---------- API pública ---------- */
export function abrirCheckout() {
  const r = carrito.resumen();
  if (r.vacio) { avisar('Agrega al menos un producto para hacer tu pedido.', 'error'); return; }

  $('#checkout-titulo').textContent = 'Datos del pedido';
  $('#checkout-confirmacion').hidden = true;
  $('#checkout-pie').hidden = true;
  $('#checkout-formulario').hidden = false;
  dibujarFormulario();
  llenarFechas();
  actualizarVista();

  const form = $('#form-pedido');
  form.addEventListener('input', actualizarVista);
  form.addEventListener('change', (e) => {
    if (e.target.id === 'f-fecha') llenarHoras();
    actualizarVista();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    llenarFechas(); // por si pasó el tiempo con el formulario abierto
    const pedido = leerPedido();
    const errores = validar(pedido);
    if (Object.keys(errores).length) {
      const primero = ['nombre', 'celular', 'direccion'].find((k) => errores[k]);
      if (primero) $(`#f-${primero}`).focus(); // el error se muestra bajo el campo
      else avisar(Object.values(errores)[0], 'error', 3500);
      return;
    }
    pedido.numero = generarNumeroPedido();
    guardarCliente({
      nombre: pedido.cliente.nombre,
      celular: pedido.cliente.celular,
      direccion: pedido.entrega.direccion,
      referencia: pedido.entrega.referencia,
      entrega: pedido.entrega.opcion.id,
      pago: pedido.pago.id,
    });
    mostrarConfirmacion(pedido);
  });

  cerrarPanel = abrirPanel($('#checkout'), { alCerrar: () => (cerrarPanel = null) });
}

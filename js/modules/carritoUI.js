/**
 * MÓDULO CARRITO (interfaz)
 * Panel lateral del carrito, contador del encabezado y barra fija en celulares.
 */
import * as carrito from './carrito.js';
import { fotoProducto } from './catalogo.js';
import { abrirCheckout } from './checkout.js';
import { CONFIG } from '../config.js';
import { $, abrirPanel } from '../utils/dom.js';
import { dinero, escapar } from '../utils/formato.js';

let cerrarPanel = null;
let unidadesPrevias = null;

function dibujarPanel(r) {
  const cuerpo = $('#carrito-cuerpo');
  const pie = $('#carrito-pie');

  if (r.vacio) {
    cuerpo.innerHTML = `
      <div class="vacio">
        <p>Tu carrito está vacío. Agrega una tarta o unas masas para empezar.</p>
        <a class="boton boton--secundario" href="#productos-seccion" data-ir-productos>Ver productos</a>
      </div>`;
    pie.hidden = true;
    return;
  }

  cuerpo.innerHTML = `<ul class="carrito-lista">${r.items.map(({ producto: p, cantidad, subtotal }) => `
    <li class="carrito-item">
      <div class="carrito-item__foto">${fotoProducto(p, { conTexto: false })}</div>
      <div>
        <p class="carrito-item__nombre">${escapar(p.nombre)}</p>
        <p class="carrito-item__precio">${dinero(p.precio)} c/u</p>
        <button type="button" class="enlace-quitar" data-quitar="${p.id}">Quitar</button>
      </div>
      <div class="carrito-item__acciones">
        <span class="carrito-item__subtotal">${dinero(subtotal)}</span>
        <div class="cantidad" role="group" aria-label="Cantidad de ${escapar(p.nombre)}">
          <button type="button" data-menos="${p.id}" aria-label="Quitar uno">−</button>
          <output>${cantidad}</output>
          <button type="button" data-mas="${p.id}" aria-label="Agregar uno">+</button>
        </div>
      </div>
    </li>`).join('')}</ul>`;

  $('#carrito-total').textContent = dinero(r.total);
  $('#carrito-nota').innerHTML = r.requiereAnticipacion
    ? `<span class="nota--alerta">Tu pedido incluye tartas: la entrega es desde ${CONFIG.pedidos.horasAnticipacionTartas} horas después de pedir.</span>`
    : 'Si eliges delivery, el costo del envío se coordina por WhatsApp.';
  pie.hidden = false;
}

function dibujarContadores(r) {
  const contador = $('#carrito-contador');
  contador.textContent = r.unidades;
  $('#boton-carrito').setAttribute('aria-label', `Abrir carrito, ${r.unidades} productos`);
  if (unidadesPrevias !== null && r.unidades > unidadesPrevias) {
    contador.classList.remove('salto');
    void contador.offsetWidth; // reinicia la animación
    contador.classList.add('salto');
  }
  unidadesPrevias = r.unidades;

  const barra = $('#barra-movil');
  barra.hidden = r.vacio;
  $('#barra-movil-texto').textContent = `Ver carrito (${r.unidades})`;
  $('#barra-movil-total').textContent = dinero(r.total);
}

export function abrirCarrito() {
  cerrarPanel = abrirPanel($('#carrito'), { alCerrar: () => (cerrarPanel = null) });
}

export function iniciarCarritoUI() {
  carrito.suscribir((r) => {
    dibujarPanel(r);
    dibujarContadores(r);
  });

  $('#boton-carrito').addEventListener('click', abrirCarrito);
  $('#barra-movil-boton').addEventListener('click', abrirCarrito);

  $('#carrito').addEventListener('click', (e) => {
    const b = e.target.closest('button, a');
    if (!b) return;
    if (b.dataset.mas) carrito.agregar(b.dataset.mas);
    if (b.dataset.menos) carrito.cambiarCantidad(b.dataset.menos, carrito.cantidadDe(b.dataset.menos) - 1);
    if (b.dataset.quitar) carrito.quitar(b.dataset.quitar);
    if (b.hasAttribute('data-ir-productos') && cerrarPanel) cerrarPanel();
  });

  $('#boton-continuar').addEventListener('click', () => {
    if (cerrarPanel) cerrarPanel();
    setTimeout(abrirCheckout, 230);
  });
}

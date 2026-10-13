/**
 * MÓDULO CATÁLOGO (interfaz)
 * Dibuja los filtros y las tarjetas de productos.
 */
import { PRODUCTOS, CATEGORIAS } from '../data/productos.js';
import { CONFIG } from '../config.js';
import * as carrito from './carrito.js';
import { avisar } from './avisos.js';
import { $, html } from '../utils/dom.js';
import { dinero, escapar, iniciales } from '../utils/formato.js';

let filtroActual = 'todo';

/** Foto del producto o, si aún no hay foto, un recuadro con sus iniciales. */
export function fotoProducto(p, { conTexto = true } = {}) {
  if (p.imagen) {
    return `<img src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}" loading="lazy" width="800" height="600">`;
  }
  return `<div class="producto__sin-foto" role="img" aria-label="${escapar(p.nombre)}">
      <span>${iniciales(p.nombre)}</span>${conTexto ? '<span>Foto próximamente</span>' : '<span></span>'}
    </div>`;
}

function acciones(p) {
  if (!p.disponible) return '<button class="boton boton--secundario" disabled>Agotado</button>';
  const cant = carrito.cantidadDe(p.id);
  if (!cant) {
    return `<button class="boton boton--primario" data-agregar="${p.id}">Agregar</button>`;
  }
  return `<div class="cantidad" role="group" aria-label="Cantidad de ${escapar(p.nombre)}">
      <button type="button" data-menos="${p.id}" aria-label="Quitar uno">−</button>
      <output aria-live="polite">${cant}</output>
      <button type="button" data-mas="${p.id}" aria-label="Agregar uno">+</button>
    </div>`;
}

function tarjeta(p) {
  const clases = ['producto'];
  if (p.destacado) clases.push('producto--destacado');
  if (!p.disponible) clases.push('producto--agotado');
  return html(`
    <article class="${clases.join(' ')}" data-producto="${p.id}">
      <div class="producto__foto">${fotoProducto(p)}</div>
      <div class="producto__cuerpo">
        <h3 class="producto__nombre">${escapar(p.nombre)}</h3>
        <p class="producto__unidad">${escapar(p.unidad)}</p>
        <p class="producto__desc">${escapar(p.descripcion)}</p>
        ${p.anticipacion ? `<p class="producto__nota">Se pide con ${CONFIG.pedidos.horasAnticipacionTartas} horas de anticipación</p>` : ''}
        <div class="producto__pie">
          <span class="producto__precio">${dinero(p.precio)}</span>
          <div class="producto__acciones">${acciones(p)}</div>
        </div>
      </div>
    </article>`);
}

function dibujarProductos() {
  const grilla = $('#productos');
  const lista = PRODUCTOS
    .filter((p) => filtroActual === 'todo' || p.categoria === filtroActual)
    .sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
  grilla.replaceChildren(...lista.map(tarjeta));
}

function dibujarFiltros() {
  const zona = $('#filtros');
  zona.replaceChildren(...CATEGORIAS.map((c) =>
    html(`<button type="button" class="filtro" data-filtro="${c.id}" aria-pressed="${c.id === filtroActual}">${escapar(c.nombre)}</button>`)));
}

/** Solo actualiza los botones de cantidad (evita redibujar las fotos). */
function actualizarAcciones() {
  document.querySelectorAll('[data-producto]').forEach((card) => {
    const p = PRODUCTOS.find((x) => x.id === card.dataset.producto);
    const zona = card.querySelector('.producto__acciones');
    const enfocado = zona.contains(document.activeElement) ? document.activeElement.dataset : null;
    zona.innerHTML = acciones(p);
    // Mantener el foco del teclado en el mismo control
    if (enfocado) {
      const sel = enfocado.mas ? `[data-mas="${p.id}"]` : enfocado.menos ? `[data-menos="${p.id}"]` : null;
      const nuevo = (sel && zona.querySelector(sel)) || zona.querySelector('button');
      if (nuevo) nuevo.focus();
    }
  });
}

export function iniciarCatalogo() {
  dibujarFiltros();
  dibujarProductos();

  $('#filtros').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filtro]');
    if (!b) return;
    filtroActual = b.dataset.filtro;
    dibujarFiltros();
    dibujarProductos();
  });

  $('#productos').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.agregar) {
      carrito.agregar(b.dataset.agregar);
      const p = PRODUCTOS.find((x) => x.id === b.dataset.agregar);
      avisar(`Agregaste ${p.nombre} al carrito`);
    } else if (b.dataset.mas) {
      carrito.agregar(b.dataset.mas);
    } else if (b.dataset.menos) {
      carrito.cambiarCantidad(b.dataset.menos, carrito.cantidadDe(b.dataset.menos) - 1);
    }
  });

  carrito.suscribir(actualizarAcciones);
}

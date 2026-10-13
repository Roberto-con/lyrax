/** Pequeñas ayudas para trabajar con el DOM. */
export const $ = (selector, raiz = document) => raiz.querySelector(selector);
export const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

/** Crea un elemento a partir de un texto HTML. */
export function html(texto) {
  const t = document.createElement('template');
  t.innerHTML = texto.trim();
  return t.content.firstElementChild;
}

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Abre un panel (drawer o modal) con fondo, foco atrapado y cierre con Esc.
 * Devuelve una función para cerrarlo.
 */
export function abrirPanel(panel, { alCerrar } = {}) {
  const anterior = document.activeElement;
  const fondo = document.getElementById('fondo');
  panel.hidden = false;
  fondo.hidden = false;
  document.body.classList.add('sin-scroll');
  requestAnimationFrame(() => {
    panel.classList.add('abierto');
    fondo.classList.add('visible');
  });

  const primero = panel.querySelector('[data-foco-inicial]') || panel.querySelector(ENFOCABLES);
  setTimeout(() => primero && primero.focus(), 60);

  function teclas(e) {
    if (e.key === 'Escape') cerrar();
    if (e.key !== 'Tab') return;
    const items = [...panel.querySelectorAll(ENFOCABLES)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const [ini, fin] = [items[0], items[items.length - 1]];
    if (e.shiftKey && document.activeElement === ini) { e.preventDefault(); fin.focus(); }
    else if (!e.shiftKey && document.activeElement === fin) { e.preventDefault(); ini.focus(); }
  }

  function cerrar() {
    panel.classList.remove('abierto');
    fondo.classList.remove('visible');
    document.removeEventListener('keydown', teclas);
    fondo.removeEventListener('click', cerrar);
    setTimeout(() => {
      panel.hidden = true;
      if (!document.querySelector('.panel.abierto')) {
        fondo.hidden = true;
        document.body.classList.remove('sin-scroll');
      }
    }, 220);
    if (anterior) anterior.focus();
    if (alCerrar) alCerrar();
  }

  document.addEventListener('keydown', teclas);
  fondo.addEventListener('click', cerrar);
  panel.querySelectorAll('[data-cerrar]').forEach((b) => (b.onclick = cerrar));
  return cerrar;
}

/** MÓDULO AVISOS: mensajes cortos que aparecen y desaparecen solos. */
export function avisar(texto, tipo = 'info', duracion = 2600) {
  const zona = document.getElementById('avisos');
  if (!zona) return;
  zona.replaceChildren(); // un aviso a la vez
  const el = document.createElement('div');
  el.className = `aviso${tipo === 'error' ? ' aviso--error' : ''}`;
  el.textContent = texto;
  zona.appendChild(el);
  setTimeout(() => el.remove(), duracion);
}

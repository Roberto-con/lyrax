# LYRAX — Tienda en línea

Tienda web de **LYRAX** (repostería artesanal, U. E. Santo Tomás "Fe y Alegría").
Hecha con HTML, CSS y JavaScript puro, sin frameworks. Se publica gratis en GitHub Pages.

## Cómo funciona un pedido

1. El cliente agrega productos al carrito. El carrito queda guardado en su navegador aunque cierre la página.
2. Completa nombre, celular, entrega (recojo o delivery), día, hora y forma de pago.
   - Si el pedido lleva **tartas**, solo puede elegir horarios desde **24 horas después**.
   - Solo se ofrecen días y horas de atención (lunes a sábado, de 8:00 a 18:00).
3. La web genera un número de pedido (ej.: `LYX-261013-4821`) y abre WhatsApp con el pedido ya escrito, dirigido al **+591 67157672**.
4. Si eligió QR, ve el QR del Banco Ganadero con el monto a pagar y envía el comprobante por el mismo chat.

## Estructura del proyecto

```
lyrax/
├── index.html              Estructura de la página (HTML)
├── css/
│   ├── base.css            Colores de la marca, tipografías y estilos generales
│   ├── layout.css          Encabezado, portada, secciones y pie
│   └── components.css      Botones, productos, carrito, checkout y avisos
├── js/
│   ├── main.js             Punto de entrada: conecta todos los módulos
│   ├── config.js           ⭐ Datos del negocio: WhatsApp, horario, QR, entrega
│   ├── data/
│   │   └── productos.js    ⭐ Catálogo: productos, precios y fotos
│   ├── modules/
│   │   ├── carrito.js      Lógica del carrito (guardar, sumar, quitar)
│   │   ├── carritoUI.js    Panel lateral del carrito y contador
│   │   ├── catalogo.js     Tarjetas de productos y filtros
│   │   ├── checkout.js     Formulario, validación y confirmación
│   │   ├── horario.js      Abierto/cerrado y fechas de entrega
│   │   ├── whatsapp.js     Mensaje del pedido y enlace de WhatsApp
│   │   └── avisos.js       Mensajes emergentes
│   └── utils/
│       ├── dom.js          Ayudas para el DOM y paneles
│       └── formato.js      Formato de dinero, fechas y textos
└── assets/img/             Logo, QR de pago y fotos de productos
```

Los archivos marcados con ⭐ son los que más se editan. El resto casi nunca se toca.

## Tareas frecuentes

**Cambiar un precio o agregar un producto**
Editar `js/data/productos.js`. Cada producto es un bloque `{ ... }`; copiar uno y cambiar sus datos.
Para marcar un producto como agotado: `disponible: false`.

**Agregar las fotos pendientes** (alfajor, galleta y rollo de canela)
1. Guardar la foto en `assets/img/productos/` (por ejemplo, `alfajor.jpg`, de unos 800 × 600 px).
2. En `js/data/productos.js`, poner la ruta en el campo `imagen`: `imagen: 'assets/img/productos/alfajor.jpg'`.

**Cambiar el QR de pago** (el actual vence el 13 de noviembre de 2026)
1. Reemplazar `assets/img/qr-pago.jpg` por el nuevo QR (mismo nombre).
2. En `js/config.js`, actualizar `pago.qr.vence` con la nueva fecha (`'AAAA-MM-DD'`).
Si el QR vence y no se cambia, la web deja de mostrarlo y le pide al cliente solicitarlo por WhatsApp.

**Cambiar el número de WhatsApp, el horario o las opciones de entrega**
Todo está en `js/config.js`.

**Cambiar colores o tipografías**
Variables al inicio de `css/base.css` (sección `:root`).

## Probar en la computadora

La web usa módulos de JavaScript, por eso **no funciona abriendo `index.html` con doble clic**.
Hay que usar un servidor local:

- **VS Code:** instalar la extensión *Live Server*, clic derecho en `index.html` → *Open with Live Server*.
- **Python:** en la carpeta del proyecto, ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`.

## Publicar en GitHub Pages

1. Crear un repositorio en GitHub (por ejemplo, `lyrax`) y subir **el contenido** de esta carpeta (que `index.html` quede en la raíz).
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Elegir la rama `main` y la carpeta `/ (root)`, y guardar.
4. En uno o dos minutos la tienda estará en `https://USUARIO.github.io/lyrax/`.

Cada vez que se suba un cambio (`git push`), la página se actualiza sola.

## Reparto sugerido del trabajo

| Integrante | Archivos |
|---|---|
| HTML | `index.html` |
| CSS | `css/base.css`, `css/layout.css`, `css/components.css` |
| JavaScript | `js/` (módulos, configuración y catálogo) |

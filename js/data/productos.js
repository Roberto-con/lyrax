/**
 * CATÁLOGO DE PRODUCTOS
 * ---------------------
 * Para agregar un producto, copia un bloque { ... } y cambia sus datos.
 *
 * id           texto único, sin espacios (se usa en el carrito)
 * categoria    debe existir en CATEGORIAS
 * precio       en bolivianos
 * imagen       ruta de la foto; si está vacía se muestra un recuadro con el nombre
 * anticipacion true = se pide con 24 h de anticipación (tartas)
 * disponible   false = aparece como "Agotado" y no se puede agregar
 * destacado    true = aparece primero y con más tamaño
 */
export const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'tartas', nombre: 'Tartas' },
  { id: 'masas', nombre: 'Masas dulces' },
];

export const PRODUCTOS = [
  {
    id: 'tarta-chirimoya-20',
    nombre: 'Tarta de chirimoya con gel de maracuyá',
    categoria: 'tartas',
    precio: 180,
    unidad: 'Tarta de 20 cm, unas 8 porciones',
    descripcion:
      'Relleno cremoso de chirimoya, gel de maracuyá y crumble de almendras tostadas sobre base de galleta. Decorada con crema chantilly.',
    imagen: 'assets/img/productos/tarta-20cm.jpg',
    anticipacion: true,
    disponible: true,
    destacado: true,
  },
  {
    id: 'mini-tarta-chirimoya',
    nombre: 'Mini tarta de chirimoya',
    categoria: 'tartas',
    precio: 55,
    unidad: 'Tarta de 10 cm, para 1 o 2 personas',
    descripcion: 'La misma receta de nuestra tarta estrella, en tamaño individual.',
    imagen: 'assets/img/productos/mini-tarta.jpg',
    anticipacion: true,
    disponible: true,
  },
  {
    id: 'alfajor-maicena',
    nombre: 'Alfajor de maicena',
    categoria: 'masas',
    precio: 5,
    unidad: 'Por unidad',
    descripcion: 'Relleno de dulce de leche y borde de coco rallado.',
    imagen: 'assets/img/productos/alfajor.jpg',
    anticipacion: false,
    disponible: true,
  },
  {
    id: 'galleta-chispas',
    nombre: 'Galleta con chispas de chocolate',
    categoria: 'masas',
    precio: 2,
    unidad: 'Por unidad',
    descripcion: 'Horneada cada día, crujiente por fuera y suave por dentro.',
    imagen: 'assets/img/productos/galleta.jpg',
    anticipacion: false,
    disponible: true,
  },
  {
    id: 'rollo-canela',
    nombre: 'Rollo de canela',
    categoria: 'masas',
    precio: 3,
    unidad: 'Por unidad',
    descripcion: 'Masa suave enrollada con canela y azúcar.',
    imagen: 'assets/img/productos/rollo-canela.jpg',
    anticipacion: false,
    disponible: true,
  },
];

export const buscarProducto = (id) => PRODUCTOS.find((p) => p.id === id);

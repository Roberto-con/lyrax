/**
 * CONFIGURACIÓN GENERAL DE LA TIENDA LYRAX
 * ----------------------------------------
 * Todo lo que cambia con el negocio (teléfono, horario, QR, entrega)
 * se edita AQUÍ. No hace falta tocar los demás archivos.
 */
export const CONFIG = {
  tienda: {
    nombre: 'LYRAX',
    lema: 'El sabor también se programa',
    descripcion: 'Repostería artesanal hecha por estudiantes de Sistemas Informáticos.',
  },

  // Número que recibe los pedidos: solo dígitos, con código de país (591 = Bolivia)
  whatsapp: '59167157672',

  moneda: 'Bs',

  // Horario de atención. Días: 0 = domingo, 1 = lunes ... 6 = sábado
  horario: {
    dias: [1, 2, 3, 4, 5, 6],
    abre: 8,   // 8:00
    cierra: 18, // 18:00
    texto: 'Lunes a sábado, de 8:00 a 18:00',
  },

  pedidos: {
    // Horas mínimas de anticipación para productos marcados con "anticipacion" (tartas)
    horasAnticipacionTartas: 24,
    // Minutos mínimos para preparar pedidos del mismo día (masas)
    minutosPreparacion: 60,
    // Cuántos días hacia adelante se puede elegir la fecha de entrega
    diasMaximos: 14,
    // Intervalo de horarios de entrega (en minutos)
    intervaloHoras: 60,
  },

  entrega: {
    opciones: [
      {
        id: 'recojo',
        nombre: 'Recojo',
        detalle: 'Recoges tu pedido en el local o en el colegio. Sin costo.',
        pideDireccion: false,
      },
      {
        id: 'delivery',
        nombre: 'Delivery en la zona',
        detalle: 'Te lo llevamos. El costo del envío se coordina por WhatsApp según tu dirección.',
        pideDireccion: true,
      },
    ],
  },

  pago: {
    opciones: [
      { id: 'qr', nombre: 'Código QR', detalle: 'Escaneas nuestro QR y envías el comprobante por WhatsApp.' },
      { id: 'efectivo', nombre: 'Efectivo', detalle: 'Pagas al recibir o recoger tu pedido.' },
    ],
    qr: {
      imagen: 'assets/img/qr-pago.jpg',
      banco: 'Banco Ganadero',
      // Fecha de vencimiento del QR (AAAA-MM-DD). Al vencer, la web deja de mostrarlo
      // y pide el QR por WhatsApp. Cuando generen uno nuevo, reemplacen la imagen y esta fecha.
      vence: '2026-11-13',
    },
  },

  // Clave con la que se guarda el carrito en el navegador del cliente
  claveCarrito: 'lyrax.carrito.v1',
};

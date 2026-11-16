/*
  Configuración de la maqueta "Solenne" (tienda de lentes de sol de Facundo).
  Nombre, logo, precios y modelos son DE EJEMPLO: se cambian acá cuando estén los reales.
*/
window.CONFIG = {
  negocio: {
    nombre: "Solenne",
    whatsapp: "5493516069281",              // maqueta: WhatsApp de Facundo (cambiar por el de la tienda)
    instagram: "solenne.lentes",            // de ejemplo
    ciudad: "Córdoba",
    horario: "Atendemos por WhatsApp de lunes a sábados de 10 a 20 h",
    extra: "Showroom con cita previa en Nueva Córdoba"
  },

  // IA de Google (Gemini). Sin clave, el asistente responde igual con la información de la página.
  gemini: { clave: "", modelos: ["gemini-flash-latest", "gemini-2.5-flash"] },

  // Dónde se guardan los contactos (se usa el primero completo). Si los dos están vacíos, viajan por WhatsApp.
  contactos: { appsScriptUrl: "", formsubmitEmail: "" },

  // Condiciones de venta (EJEMPLO, noviembre 2026)
  pagos: {
    cuotasSinInteres: 3,
    descTransferencia: 0.10,
    envioGratisDesde: 120000,
    cambiosDias: 30,
    garantiaMeses: 6
  },

  /*
    Modelos de ejemplo. Cada uno se dibuja en 3D con:
      forma:   cateye | cuadrado | redondo | aviador | rectangular | hexagonal
      armazon: negro | carey | cristal | hueso | oro | plata | bordo
      cristal: humo | marron | degrade | verde | espejado | rosa
    medidas: [ancho de lente, puente, largo de patilla] en milímetros (como vienen grabadas en la patilla).
    caras:   formas de cara a las que mejor les queda (para la guía "Tu lente ideal").
    Cuando estén las fotos reales, se agrega foto: "archivo.jpg" y la tarjeta la muestra.
  */
  productos: [
    { id: "monaco",   nombre: "Mónaco",   forma: "cateye",      armazon: "negro",  cristal: "humo",     precio: 89000, medidas: [54, 18, 145], tag: "Más vendido", polarizado: true,
      detalle: "Cat-eye de acetato pulido. Levanta la mirada y estiliza la cara.", caras: ["redonda", "ovalada", "corazon"], estilo: ["audaz", "clasico"],
      variantes: [["negro", "humo"], ["carey", "marron"], ["hueso", "humo"]] },
    { id: "riviera",  nombre: "Riviera",  forma: "cuadrado",    armazon: "carey",  cristal: "degrade",  precio: 94000, medidas: [58, 17, 145], tag: "Oversize", polarizado: true,
      detalle: "Oversize cuadrado con mucha presencia. Cubre bien del sol y del viento.", caras: ["ovalada", "redonda", "alargada"], estilo: ["audaz"],
      variantes: [["carey", "degrade"], ["negro", "humo"], ["bordo", "marron"]] },
    { id: "capri",    nombre: "Capri",    forma: "redondo",     armazon: "cristal", cristal: "verde",   precio: 79000, medidas: [49, 21, 140], tag: "Nuevo", polarizado: false,
      detalle: "Redondo de acetato transparente con cristal verde clásico.", caras: ["cuadrada", "corazon", "alargada"], estilo: ["minimal", "clasico"],
      variantes: [["cristal", "verde"], ["carey", "verde"], ["negro", "humo"]] },
    { id: "ibiza",    nombre: "Ibiza",    forma: "aviador",     armazon: "oro",    cristal: "degrade",  precio: 99000, medidas: [58, 14, 140], tag: "Metal", polarizado: true,
      detalle: "Aviador de metal dorado con doble puente y plaquetas regulables.", caras: ["cuadrada", "ovalada", "corazon"], estilo: ["clasico", "deportivo"],
      variantes: [["oro", "degrade"], ["oro", "verde"], ["plata", "espejado"]] },
    { id: "tulum",    nombre: "Tulum",    forma: "rectangular", armazon: "hueso",  cristal: "humo",     precio: 76000, medidas: [55, 19, 145], tag: "", polarizado: false,
      detalle: "Rectangular fino estilo noventas. Liviano para todo el día.", caras: ["redonda", "ovalada", "corazon"], estilo: ["minimal", "audaz"],
      variantes: [["hueso", "humo"], ["negro", "humo"], ["bordo", "rosa"]] },
    { id: "positano", nombre: "Positano", forma: "hexagonal",   armazon: "plata",  cristal: "espejado", precio: 92000, medidas: [52, 20, 145], tag: "Espejado", polarizado: true,
      detalle: "Hexagonal de metal plateado con cristal espejado azul.", caras: ["redonda", "ovalada", "alargada"], estilo: ["deportivo", "audaz"],
      variantes: [["plata", "espejado"], ["oro", "marron"], ["plata", "humo"]] }
  ],

  // Fotos de ambiente (Unsplash, licencia gratuita; se reemplazan por las fotos propias de la marca)
  fotos: {
    editorial: "photo-1766228385031-ad983e6a360e",
    calle: ["photo-1564086334005-5c65e4f9f242", "photo-1614252369475-531eba835eb1", "photo-1784154752284-3959332ed722", "photo-1766228385031-ad983e6a360e"]
  }
};

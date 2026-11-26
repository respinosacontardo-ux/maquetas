/*
  Configuración de la maqueta "Trópico Importados" (tienda de lentes de sol de Facundo).
  Nombre, logo y precios son DE EJEMPLO; los modelos y sus fotos son los reales: se cambian acá cuando estén los reales.
*/
window.CONFIG = {
  negocio: {
    nombre: "Trópico Importados",
    corto: "Trópico",
    whatsapp: "5493516069281",              // maqueta: WhatsApp de Facundo (cambiar por el de la tienda)
    instagram: "tropico.importados",            // de ejemplo
    ciudad: "Córdoba",                        // Córdoba, Argentina
    horario: "Atendemos por WhatsApp de lunes a sábados de 10 a 20 h",
    extra: "Córdoba, Argentina · showroom con cita previa en Nueva Córdoba"
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
    garantiaMeses: 6
  },

  /*
    Modelos reales (fotos de Facundo, 20-11-2026). Cada par viene con su estuche.
    fotos:   las 3 vistas que se ven al abrir el modelo (en img/). La primera es la de la tarjeta.
    forma, armazon y cristal: solo se usan para el probador con selfie y para la guía "Tu lente ideal".
      forma:   cateye | cuadrado | redondo | aviador | rectangular | hexagonal
      armazon: negro | carey | cristal | hueso | oro | plata | bordo
      cristal: humo | marron | degrade | verde | espejado | rosa
    Precios DE EJEMPLO: cambiarlos por los reales.
  */
  productos: [
    { id: "cannes",   nombre: "Cannes",   fotos: ["0912-1", "0912-2", "0912-3"], forma: "cuadrado",    armazon: "oro",   cristal: "humo",    precio: 98000, tag: "Más vendido",
      detalle: "Cuadrado de metal dorado con aro negro y patillas con terminación acanalada. Cristal gris oscuro.", caras: ["redonda", "ovalada", "corazon"], estilo: ["clasico", "audaz"] },
    { id: "milano",   nombre: "Milano",   fotos: ["0921-1", "0921-2", "0921-3"], forma: "aviador",     armazon: "oro",   cristal: "degrade", precio: 92000, tag: "Doble puente",
      detalle: "Cuadrado de doble puente, dorado y negro, con patillas a rayas rojo y verde. Cristal degradé gris.", caras: ["cuadrada", "ovalada", "redonda"], estilo: ["clasico", "audaz"] },
    { id: "siena",    nombre: "Siena",    fotos: ["0923-1", "0923-2", "0923-3"], forma: "aviador",     armazon: "carey", cristal: "marron",  precio: 92000, tag: "",
      detalle: "Doble puente con frente de carey rosado y metal dorado. Cristal marrón degradé, cálido y suave.", caras: ["cuadrada", "ovalada", "alargada"], estilo: ["clasico", "minimal"] },
    { id: "positano", nombre: "Positano", fotos: ["0895-1", "0895-2", "0895-3"], forma: "hexagonal",   armazon: "oro",   cristal: "degrade", precio: 95000, tag: "Nuevo",
      detalle: "Octogonal de metal dorado con patillas color marfil. Cristal azul que baja a ámbar.", caras: ["redonda", "ovalada", "alargada"], estilo: ["audaz"] },
    { id: "mykonos",  nombre: "Mykonos",  fotos: ["0885-1", "0885-2", "0885-3"], forma: "hexagonal",   armazon: "plata", cristal: "degrade", precio: 89000, tag: "Sin aro",
      detalle: "Cristal al aire en azul degradé, sin aro, con patillas negras anchas y detalle plateado.", caras: ["redonda", "ovalada", "corazon"], estilo: ["audaz", "minimal"] },
    { id: "capri",    nombre: "Capri",    fotos: ["0902-1", "0902-2", "0902-3"], forma: "redondo",     armazon: "oro",   cristal: "rosa",    precio: 86000, tag: "",
      detalle: "Redondo de metal dorado con patillas nude. Cristal rosado degradé, delicado y femenino.", caras: ["cuadrada", "corazon", "alargada"], estilo: ["minimal", "clasico"] },
    { id: "amalfi",   nombre: "Amalfi",   fotos: ["0898-1", "0898-2", "0898-3"], forma: "redondo",     armazon: "bordo", cristal: "marron",  precio: 86000, tag: "",
      detalle: "Ovalado de acetato chocolate con puente dorado. Cristal marrón degradé.", caras: ["cuadrada", "corazon", "alargada"], estilo: ["clasico", "minimal"] },
    { id: "marbella", nombre: "Marbella", fotos: ["0918-1", "0918-2", "0918-3"], forma: "rectangular", armazon: "plata", cristal: "humo",    precio: 89000, tag: "Metal",
      detalle: "Rectangular de metal plateado con barra superior. Cristal gris liso, sobrio y elegante.", caras: ["redonda", "ovalada", "corazon"], estilo: ["clasico", "deportivo"] },
    { id: "monaco",   nombre: "Mónaco",   fotos: ["0907-1", "0907-2", "0907-3"], forma: "cuadrado",    armazon: "negro", cristal: "degrade", precio: 84000, tag: "",
      detalle: "Oversize de acetato negro con borde dorado y detalle metálico en la patilla. Cristal degradé.", caras: ["ovalada", "redonda", "alargada"], estilo: ["audaz", "clasico"] },
    { id: "riviera",  nombre: "Riviera",  fotos: ["0887-1", "0887-2", "0887-3"], forma: "cuadrado",    armazon: "negro", cristal: "degrade", precio: 84000, tag: "Oversize",
      detalle: "Cuadrado grande de acetato negro con puente plano. Cubre bien del sol y del viento.", caras: ["ovalada", "redonda", "alargada"], estilo: ["audaz"] },
    { id: "ibiza",    nombre: "Ibiza",    fotos: ["0891-1", "0891-2", "0891-3"], forma: "rectangular", armazon: "negro", cristal: "degrade", precio: 82000, tag: "Máscara",
      detalle: "Cristal único tipo máscara, en acetato negro mate. Mucha presencia, estilo deportivo.", caras: ["ovalada", "redonda", "corazon"], estilo: ["deportivo", "audaz"] },
    { id: "tulum",    nombre: "Tulum",    fotos: ["0916-1", "0916-2", "0916-3"], forma: "cateye",      armazon: "negro", cristal: "humo",    precio: 79000, tag: "",
      detalle: "Ovalado cat-eye de acetato negro, liviano y chico. Cristal gris para todos los días.", caras: ["redonda", "ovalada", "cuadrada"], estilo: ["minimal", "clasico"] }
  ],

  // Fotos de ambiente (Unsplash, licencia gratuita; se reemplazan por las fotos propias de la marca)
  fotos: {
    grupos: ["grupo-0926", "grupo-0927"],          // fotos de varios modelos juntos (img/)
    // Campaña: modelos con lentes de estilo parecido (fotos de referencia, no son lentes de la tienda)
    modelos: [
      { id: "photo-1679507655428-ab3d50356bac", modelo: "positano", txt: "Dorado · cristal degradé", alt: "Mujer con lentes dorados de cristal degradé", pos: "50% 20%" },
      { id: "photo-1614252369475-531eba835eb1", modelo: "milano",   txt: "Doble puente · degradé",   alt: "Hombre con lentes aviador dorados de doble puente y campera de cuero", pos: "50% 25%" },
      { id: "photo-1687610265701-1255ece05d75", modelo: "tulum",    txt: "Acetato negro",            alt: "Mujer con lentes negros de acetato", pos: "50% 30%" },
      { id: "photo-1636619953466-f2dfd50b3d5e", modelo: "cannes",   txt: "Cuadrado dorado",          alt: "Hombre con lentes cuadrados dorados y campera marrón", pos: "50% 22%" }
    ],
    calle: ["photo-1564086334005-5c65e4f9f242", "photo-1614252369475-531eba835eb1", "photo-1784154752284-3959332ed722", "photo-1766228385031-ad983e6a360e"]
  }
};

// Cada modelo tiene un solo color: el probador 3D usa esta combinación (no tocar).
window.CONFIG.productos.forEach(function (p) { p.variantes = [[p.armazon, p.cristal]]; });

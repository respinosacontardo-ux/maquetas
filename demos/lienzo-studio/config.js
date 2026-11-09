/*
  Configuración de la web demo "Lienzo Studio" (tienda de ropa de lino inventada para mostrar el servicio).
  Todo lo que cambia con un cliente real está acá: datos, IA, contactos, productos, talles y condiciones de pago.
*/
window.CONFIG = {
  negocio: {
    nombre: "Lienzo Studio",
    whatsapp: "5493516069281",                 // demo: WhatsApp de Facundo Social Media (cambiar por el de la tienda)
    direccion: "Gurruchaga 1720, Palermo Soho",
    ciudad: "Buenos Aires",
    horario: "Lunes a sábados de 11 a 20 h · Domingos de 14 a 19 h",
    extra: "Probador y retiro en el local sin cargo"
  },

  // IA de Google (Gemini). Sin clave, el asistente responde igual con la información de la página.
  gemini: { clave: "", modelos: ["gemini-flash-latest", "gemini-2.5-flash"] },

  // Dónde se guardan los contactos (se usa el primero completo). Si los dos están vacíos, viajan por WhatsApp.
  contactos: { appsScriptUrl: "", formsubmitEmail: "" },

  // Condiciones de venta (EJEMPLO, noviembre 2026)
  pagos: {
    cuotasSinInteres: 3,     // cuotas sin interés con tarjeta
    descTransferencia: 0.10, // 10 % off pagando por transferencia
    envioGratisDesde: 120000,
    cambiosDias: 30
  },

  // Tabla de talles: contorno de cadera en cm (máximo de cada talle). Cambiar por la de la marca.
  talles: [["XS", 90], ["S", 96], ["M", 102], ["L", 108], ["XL", 116], ["XXL", 124]],

  // Productos de ejemplo (precios en pesos). tipo: vestido | pantalon | conjunto | hombre. tono: tierra | claro | color
  productos: [
    { id: "ter", nombre: "Vestido Terracota",   detalle: "Camisero de lino con cinturón",       tipo: "vestido",  tono: "tierra", precio: 89000, foto: "photo-1789110853872-f416085557fa", tag: "El de la portada" },
    { id: "nub", nombre: "Vestido Nube",        detalle: "Lino blanco con lazo de cuerda",      tipo: "vestido",  tono: "claro",  precio: 84000, foto: "photo-1789110520302-3df8ce0410f0", tag: "Nuevo" },
    { id: "sal", nombre: "Solero Salvia",       detalle: "Tiritas finas, largo midi",           tipo: "vestido",  tono: "color",  precio: 72000, foto: "photo-1789110519607-6176d668fb72", tag: "Últimos talles" },
    { id: "bri", nombre: "Pantalón Brisa",      detalle: "Lino con cordón · Oliva, malva o salvia", tipo: "pantalon", tono: "tierra", precio: 64000, foto: "photo-1789110520148-bb52ba37759b", tag: "3 colores" },
    { id: "sol", nombre: "Pantalón Sol",        detalle: "Tiro alto con cinto de cuero",        tipo: "pantalon", tono: "color",  precio: 68000, foto: "photo-1789110519976-ea1f044db897", tag: "" },
    { id: "ama", nombre: "Pantalón Amapola",    detalle: "Pierna recta, lino rojo",             tipo: "pantalon", tono: "color",  precio: 68000, foto: "photo-1789110854331-6d3cabfef781", tag: "" },
    { id: "dun", nombre: "Conjunto Duna",       detalle: "Remera de algodón + pantalón ancho",  tipo: "conjunto", tono: "claro",  precio: 96000, foto: "photo-1789110853687-71692f0e86be", tag: "Conjunto" },
    { id: "are", nombre: "Mono Arena",          detalle: "Enterito de lino con botones",        tipo: "conjunto", tono: "claro",  precio: 98000, foto: "photo-1726591383658-37fc19442523", tag: "" },
    { id: "rio", nombre: "Camisa Río",          detalle: "Hombre · Lino azul lavado",           tipo: "hombre",   tono: "color",  precio: 58000, foto: "photo-1740711152088-88a009e877bb", tag: "Hombre" }
  ]
};

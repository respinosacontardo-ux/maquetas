/*
  Configuración de la propuesta web para M de Maestro (@mdemaestro.cl).
  Todo lo que cambia con el cliente está acá: datos del negocio, IA, contactos y precios del cotizador.
*/
window.CONFIG = {
  negocio: {
    nombre: "M de Maestro",
    whatsapp: "56941940081",                 // número que publican en Instagram (con código de país, sin +)
    instagram: "mdemaestro.cl",
    zona: "Santiago y comunas de la Región Metropolitana",
    desde: 2014,                              // "Experiencia profesional desde 2014"
    horario: "Lunes a viernes de 9:00 a 18:00 · Sábados de 9:00 a 13:00"  // ← confirmar con el cliente
  },

  // IA de Google (Gemini). Sin clave, el asistente y el cotizador funcionan igual con las respuestas de la página.
  // Restringir la clave a la URL publicada en Google Cloud → Credenciales → Restricciones de sitios web.
  gemini: {
    clave: "",
    modelos: ["gemini-flash-latest", "gemini-2.5-flash"]  // se prueba el primero; si falla, el siguiente
  },

  // Dónde se guardan los contactos que deja la gente (se usa el primero que esté completo).
  // Si los dos están vacíos, el contacto igual llega: el resultado se envía por WhatsApp.
  contactos: {
    appsScriptUrl: "",   // web app de Google Apps Script que agrega filas a una planilla (ver apps-script.gs)
    formsubmitEmail: ""  // o un email que recibe cada contacto vía formsubmit.co
  },

  // Supuestos del cotizador (CLP, IVA incluido, mano de obra + materiales). Son valores de referencia
  // de mercado en Santiago para la propuesta: ajustarlos con M de Maestro antes de publicar.
  //   area:   reparar | remodelar | construir (agrupa las opciones en el paso 1)
  //   precio: valor por unidad; unidad: "m²" o "arreglos" (reparaciones puntuales)
  cotizador: {
    tipos: {
      reparacion: { area: "Reparar",   nombre: "Reparaciones del hogar",       precio: 145000, unidad: "arreglos", def: 3,  max: 15,  semanas: [1, 2],  desc: "Gasfitería, electricidad SEC, humedad, filtraciones, puertas y ventanas." },
      techumbre:  { area: "Reparar",   nombre: "Techumbre y filtraciones",     precio: 62000,  unidad: "m²",       def: 30, max: 200, semanas: [1, 3],  desc: "Cambio de cubierta, canaletas, impermeabilización y sellos." },
      bano:       { area: "Remodelar", nombre: "Baño",                         precio: 950000, unidad: "m²",       def: 5,  max: 15,  semanas: [2, 3],  desc: "Demolición, impermeabilización, cerámica o porcelanato y artefactos." },
      cocina:     { area: "Remodelar", nombre: "Cocina",                       precio: 700000, unidad: "m²",       def: 9,  max: 30,  semanas: [3, 4],  desc: "Muebles, mesón, revestimientos, gasfitería y electricidad." },
      interior:   { area: "Remodelar", nombre: "Interiores, pisos y pintura",  precio: 95000,  unidad: "m²",       def: 50, max: 250, semanas: [1, 4],  desc: "Pisos, revestimientos, pintura, cielos e iluminación." },
      oficina:    { area: "Remodelar", nombre: "Oficina o local comercial",    precio: 280000, unidad: "m²",       def: 60, max: 400, semanas: [3, 7],  desc: "Habilitación, tabiques, electricidad y terminaciones para abrir." },
      ampliacion: { area: "Construir", nombre: "Ampliación o segundo piso",    precio: 830000, unidad: "m²",       def: 25, max: 120, semanas: [8, 14], desc: "Obra gruesa, techumbre y terminaciones, con permiso municipal." },
      terraza:    { area: "Construir", nombre: "Terraza, quincho o radier",    precio: 420000, unidad: "m²",       def: 18, max: 100, semanas: [2, 5],  desc: "Radier, pavimentos, muros, pérgola o estructura metálica." }
    },
    terminaciones: {
      esencial: { nombre: "Esencial",  factor: 1,    desc: "Materiales nacionales de buena calidad, sin sobrecostos." },
      premium:  { nombre: "Premium",   factor: 1.25, desc: "Porcelanato, grifería de diseño, iluminación LED." },
      autor:    { nombre: "De diseño", factor: 1.55, desc: "Mármol o cuarzo, muebles a medida y detalles de arquitectura." }
    },
    extras: {
      electrica:  { nombre: "Electricidad con certificado SEC",  precio: 1200000 },
      gasfiteria: { nombre: "Gasfitería nueva",                  precio: 950000 },
      muebles:    { nombre: "Muebles a medida",                  precio: 1700000 },
      permiso:    { nombre: "Permiso de edificación",            precio: 1300000 },
      recepcion:  { nombre: "Recepción final municipal",         precio: 700000 },
      leymono:    { nombre: "Regularización Ley del Mono",       precio: 950000 },
      patente:    { nombre: "Patente comercial (local)",         precio: 450000 },
      retiro:     { nombre: "Retiro de escombros y aseo",        precio: 320000 }
    },
    comunasRecargo: { "Vitacura": 1.05, "Lo Barnechea": 1.07, "Colina": 1.06, "Buin": 1.06 }, // traslado
    margen: 0.15   // el rango se muestra ±15%
  }
};

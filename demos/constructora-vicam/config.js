/*
  Configuración de la propuesta web para Constructora Vicam (@constructoravicam).
  Todo lo que cambia con el cliente está acá: datos del negocio, IA, contactos y precios del cotizador.
*/
window.CONFIG = {
  negocio: {
    nombre: "Constructora Vicam",
    whatsapp: "56926811826",                 // número del link de su perfil de Instagram (con código de país, sin +)
    instagram: "constructoravicam",
    zona: "Santiago, Pucón y California",
    horario: "Lunes a viernes de 9:00 a 18:00"  // ← confirmar con el cliente
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
  // de mercado en Santiago para la propuesta: ajustarlos con Vicam antes de publicar.
  //   area:   agrupa las opciones en el paso 1
  //   precio: valor por unidad; unidad: "m²" o "arreglos"
  cotizador: {
    tipos: {
      bano:     { area: "Remodelación", nombre: "Baño",                          precio: 1050000, unidad: "m²", def: 5,  max: 15,  semanas: [3, 4],  desc: "Ducha en obra, desagüe lineal, revestimientos y grifería." },
      cocina:   { area: "Remodelación", nombre: "Cocina",                        precio: 780000,  unidad: "m²", def: 10, max: 30,  semanas: [4, 6],  desc: "Muebles a medida, mesones, revestimientos e instalaciones." },
      integral: { area: "Remodelación", nombre: "Casa o departamento completo",  precio: 340000,  unidad: "m²", def: 80, max: 300, semanas: [8, 14], desc: "Redistribución, pisos, baños, cocina, electricidad y terminaciones." },
      comercial:{ area: "Comercial",    nombre: "Oficina, local o cafetería",    precio: 420000,  unidad: "m²", def: 70, max: 400, semanas: [6, 10], desc: "Habilitación llave en mano: tabiques, cielos, mobiliario e instalaciones." },
      acceso:   { area: "Comercial",    nombre: "Accesibilidad universal",       precio: 260000,  unidad: "m²", def: 25, max: 150, semanas: [3, 6],  desc: "Rampas, baños accesibles y circulaciones según la Ley 20.422." },
      civil:    { area: "Obras civiles", nombre: "Obra civil o ampliación",      precio: 880000,  unidad: "m²", def: 30, max: 250, semanas: [10, 18], desc: "Ampliaciones, radieres, muros, estructuras y obra gruesa." }
    },
    terminaciones: {
      esencial: { nombre: "Estándar",      factor: 1,    desc: "Materiales de línea, buena calidad y bien instalados." },
      premium:  { nombre: "Premium",       factor: 1.3,  desc: "Porcelanatos importados, grifería de diseño, iluminación LED." },
      autor:    { nombre: "Con arquitecto", factor: 1.65, desc: "Proyecto con estudio de diseño, muebles curvos y detalles a medida." }
    },
    extras: {
      diseno:     { nombre: "Proyecto de diseño interior",     precio: 1800000 },
      electrica:  { nombre: "Electricidad nueva con TE1",       precio: 1400000 },
      sanitaria:  { nombre: "Red sanitaria nueva",              precio: 1100000 },
      muebles:    { nombre: "Muebles y carpintería a medida",   precio: 2400000 },
      clima:      { nombre: "Climatización",                    precio: 1600000 },
      permiso:    { nombre: "Permisos y recepción municipal",   precio: 1300000 }
    },
    comunasRecargo: { "Pucón": 1.12, "Lo Barnechea": 1.04, "Chicureo": 1.05 }, // traslado de equipo y materiales
    margen: 0.15   // el rango se muestra ±15%
  }
};

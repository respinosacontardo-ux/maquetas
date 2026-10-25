/*
  Configuración de la demo "Fragua Remodelaciones" (marca ficticia).
  Todo lo que cambia de un cliente a otro está acá: datos del negocio, IA, contactos y precios del cotizador.
*/
window.CONFIG = {
  negocio: {
    nombre: "Fragua Remodelaciones",
    whatsapp: "5493516069281",              // ← número real del cliente (con código de país, sin +)
    email: "hola@fraguaremodelaciones.cl",   // ← email real del cliente
    zona: "Providencia, Ñuñoa, Las Condes, La Reina, Vitacura, Macul, San Miguel y Santiago Centro",
    oficina: "Av. Italia 1450, Providencia",
    horario: "Lunes a viernes de 8:30 a 18:30 · Sábados de 9:00 a 13:00"
  },

  // IA de Google (Gemini). Sin clave, el asistente y el cotizador funcionan igual con respuestas de la página.
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

  // Supuestos del cotizador (CLP, IVA incluido, mano de obra + materiales). Son de referencia para la demo:
  // ajustarlos con el cliente antes de publicar.
  cotizador: {
    tipos: {
      bano:     { nombre: "Baño",                    m2: 980000, semanas: [2, 3],  m2Def: 5,  m2Max: 15,  desc: "Demolición, impermeabilización, cerámica o porcelanato y artefactos." },
      cocina:   { nombre: "Cocina",                  m2: 720000, semanas: [3, 4],  m2Def: 9,  m2Max: 30,  desc: "Muebles, cubierta, revestimientos, gasfitería y electricidad." },
      ampliacion: { nombre: "Ampliación o 2.º piso", m2: 860000, semanas: [8, 14], m2Def: 25, m2Max: 120, desc: "Obra gruesa, techumbre y terminaciones, con permiso municipal." },
      depto:    { nombre: "Departamento completo",   m2: 310000, semanas: [5, 8],  m2Def: 60, m2Max: 200, desc: "Pisos, pintura, baños, cocina e iluminación de punta a punta." },
      terraza:  { nombre: "Terraza o quincho",       m2: 450000, semanas: [3, 5],  m2Def: 18, m2Max: 80,  desc: "Radier, pérgola o techumbre, revestimientos y parrilla." }
    },
    terminaciones: {
      esencial: { nombre: "Esencial",  factor: 1,    desc: "Cerámica nacional, grifería estándar, pintura lavable." },
      premium:  { nombre: "Premium",   factor: 1.28, desc: "Porcelanato, grifería de diseño, iluminación LED." },
      autor:    { nombre: "De autor",  factor: 1.6,  desc: "Piedra o microcemento, muebles a medida, detalles de arquitectura." }
    },
    extras: {
      electrica:  { nombre: "Instalación eléctrica nueva",  precio: 1450000 },
      gasfiteria: { nombre: "Gasfitería nueva (cobre/PPR)", precio: 1100000 },
      muebles:    { nombre: "Muebles a medida",             precio: 1900000 },
      proyecto:   { nombre: "Proyecto de arquitectura 3D",  precio: 650000 },
      permiso:    { nombre: "Permiso municipal (DOM)",       precio: 1200000 },
      retiro:     { nombre: "Retiro de escombros y aseo",    precio: 380000 }
    },
    comunasRecargo: { "Vitacura": 1.06, "Las Condes": 1.04, "Lo Barnechea": 1.08 }, // traslado y estacionamiento
    margen: 0.12   // el rango se muestra ±12%
  }
};

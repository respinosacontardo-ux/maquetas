/*
  Configuración de la demo "Cuarzo Piscinas" (marca ficticia).
  Todo lo que cambia de un cliente a otro está acá: datos del negocio, IA, contactos y precios del cotizador.
*/
window.CONFIG = {
  negocio: {
    nombre: "Cuarzo Piscinas",
    whatsapp: "5493516069281",           // ← número real del cliente (con código de país, sin +)
    email: "hola@cuarzopiscinas.cl",      // ← email real del cliente
    zona: "Las Condes, Vitacura, Lo Barnechea, La Dehesa y Chicureo (Santiago oriente)",
    showroom: "Av. La Dehesa 1201, Lo Barnechea",
    horario: "Lunes a viernes de 9:00 a 19:00 · Sábados de 10:00 a 14:00"
  },

  // IA de Google (Gemini). Sin clave, el asistente y el cotizador funcionan igual con respuestas de la página.
  // Restringir la clave a la URL publicada en Google Cloud → Credenciales → Restricciones de sitios web.
  gemini: {
    clave: "",
    modelos: ["gemini-flash-latest", "gemini-2.5-flash"]  // se prueba el primero; si falla, el siguiente
  },

  // Dónde se guardan los contactos que deja la gente (se usa el primero que esté completo)
  contactos: {
    appsScriptUrl: "",   // web app de Google Apps Script que agrega filas a una planilla
    formsubmitEmail: ""  // o un email que recibe cada contacto vía formsubmit.co
  },

  // Supuestos del cotizador (CLP, IVA incluido). Son de referencia para la demo: ajustarlos con el cliente.
  cotizador: {
    tipos: {
      hormigon: { nombre: "Hormigón armado", m2: 690000, semanas: [6, 8], desc: "A medida, cualquier forma. La más durable." },
      fibra: { nombre: "Fibra de vidrio", m2: 430000, semanas: [2, 3], desc: "Instalación rápida. Hasta 10 × 4,5 m.", max: [10, 4.5] },
      infinito: { nombre: "Borde infinito", m2: 950000, semanas: [8, 11], desc: "Desborde hacia la vista. Ideal en pendiente." },
      spa: { nombre: "Piscina + spa", m2: 760000, semanas: [7, 9], desc: "Hormigón con spa climatizado integrado.", fijo: 5800000 }
    },
    obraBase: 2500000,          // excavación, retiro de tierra, instalaciones y sala de máquinas
    factorProfundidad: 0.25,    // +25% por cada metro sobre 1,4 m de profundidad promedio
    terminaciones: {
      esencial: { nombre: "Esencial", factor: 1, desc: "Revestimiento cementicio, borde de piedra reconstituida." },
      premium: { nombre: "Premium", factor: 1.22, desc: "Mosaico vítreo, borde de piedra natural, escalera integrada." },
      signature: { nombre: "Signature", factor: 1.5, desc: "Porcelanato o piedra full, detalles de diseño y paisajismo." }
    },
    extras: {
      climatizacion: { nombre: "Climatización (bomba de calor)", precio: 3900000 },
      led: { nombre: "Iluminación LED", precio: 950000 },
      cascada: { nombre: "Cascada o lámina de agua", precio: 1400000 },
      cubierta: { nombre: "Cubierta automática", precio: 6800000 },
      deck: { nombre: "Deck perimetral", precio: 4200000 },
      robot: { nombre: "Robot limpiafondos", precio: 1250000 },
      domotica: { nombre: "Control desde el celular", precio: 1100000 }
    },
    comunasRecargo: { "Lo Barnechea": 1.05, "Chicureo": 1.05, "La Dehesa": 1.05 }, // acceso y pendiente
    margen: 0.1,                // el rango se muestra ±10%
    mantencionBase: 90000,      // mantención mensual: base + por cada m³ de agua
    mantencionM3: 1500
  }
};

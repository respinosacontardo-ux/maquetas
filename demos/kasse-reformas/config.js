/*
  Configuración de la web de KASSE Reformas Integrales (boceto preparado por Facundo Social Media).
  Todo lo que cambia con los datos reales de la empresa está acá: contacto, IA, contactos y supuestos del presupuestador.
*/
window.CONFIG = {
  negocio: {
    nombre: "KASSE Reformas Integrales",
    corto: "Kasse",
    instagram: "kasse_reformas",
    whatsapp: "5493516069281",          // BOCETO: WhatsApp de Facundo Social Media. Cambiar por el de Kasse.
    zona: "Provincia de Tarragona",
    pueblos: "Tarragona, Salou, La Pineda, Albiol y alrededores",
    horario: "Lunes a viernes de 8:00 a 18:00 · Sábados con cita previa", // EJEMPLO: confirmar con Kasse
    experiencia: 20
  },

  // IA de Google (Gemini). Sin clave, el asistente responde igual con la información de la página.
  gemini: { clave: "", modelos: ["gemini-flash-latest", "gemini-2.5-flash"] },

  // Dónde se guardan los contactos (se usa el primero completo). Si los dos están vacíos, viajan por WhatsApp.
  contactos: { appsScriptUrl: "", formsubmitEmail: "" },

  // Presupuestador: precios ORIENTATIVOS en euros por m² (sin IVA). Ajustarlos con las tarifas reales de Kasse.
  presupuesto: {
    tipos: {
      bano:      { nombre: "Baño",                     m2: [3, 12, 5],    eurM2: { basica: 850, media: 1150, alta: 1550 }, minimo: { basica: 4200, media: 5800, alta: 8200 }, semanas: [2, 3] },
      cocina:    { nombre: "Cocina",                   m2: [5, 25, 10],   eurM2: { basica: 650, media: 950,  alta: 1350 }, minimo: { basica: 5000, media: 7200, alta: 10500 }, semanas: [3, 4] },
      integral:  { nombre: "Reforma integral de piso", m2: [40, 200, 90], eurM2: { basica: 340, media: 520,  alta: 780 },  minimo: { basica: 14000, media: 22000, alta: 32000 }, semanas: [8, 14] },
      rehab:     { nombre: "Masía o rehabilitación",   m2: [20, 300, 80], eurM2: { basica: 180, media: 280,  alta: 420 },  minimo: { basica: 6000, media: 9000, alta: 14000 }, semanas: [4, 12] },
      exterior:  { nombre: "Exteriores", m2: [6, 200, 30], eurM2: { basica: 85, media: 135, alta: 200 }, minimo: { basica: 1800, media: 2600, alta: 3800 }, semanas: [1, 3] }
    },
    estado: { bien: 1, regular: 1.1, mal: 1.25 },   // multiplica según cómo está hoy el espacio
    margen: 0.12                                     // ± del rango que se muestra
  }
};

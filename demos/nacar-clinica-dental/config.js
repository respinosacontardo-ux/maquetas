/*
  Configuración de la web demo "Nácar Clínica Dental" (marca inventada para mostrar el servicio).
  Todo lo que cambia con un cliente real está acá: datos del negocio, IA, contactos y valores del planificador.
*/
window.CONFIG = {
  negocio: {
    nombre: "Nácar Clínica Dental",
    whatsapp: "5493516069281",                 // demo: WhatsApp de Facundo Social Media (cambiar por el de la clínica)
    direccion: "Av. Hipólito Yrigoyen 450, Nueva Córdoba",
    ciudad: "Córdoba",
    horario: "Lunes a viernes de 9 a 20 h · Sábados de 9 a 13 h",
    urgencias: "Urgencias el mismo día, de lunes a sábado"
  },

  // IA de Google (Gemini). Sin clave, el asistente responde igual con la información de la página.
  // Restringir la clave a la URL publicada en Google Cloud → Credenciales → Restricciones de sitios web.
  gemini: {
    clave: "",
    modelos: ["gemini-flash-latest", "gemini-2.5-flash"]  // se prueba el primero; si falla, el siguiente
  },

  // Dónde se guardan los contactos que deja la gente (se usa el primero que esté completo).
  // Si los dos están vacíos, el contacto igual llega: la solicitud se envía por WhatsApp.
  contactos: {
    appsScriptUrl: "",   // web app de Google Apps Script que agrega filas a una planilla
    formsubmitEmail: ""  // o un email que recibe cada contacto vía formsubmit.co
  },

  // Valores de referencia del planificador (ARS, noviembre 2026). Son de EJEMPLO para la demo:
  // con un cliente real se reemplazan por su lista de precios.
  //   desde / hasta: rango orientativo del tratamiento completo
  //   sesiones:      cantidad típica de visitas
  tratamientos: {
    control:      { nombre: "Control y limpieza profesional", desde: 45000,   hasta: 70000,   sesiones: "1 visita",          icono: "escudo" },
    blanqueamiento:{ nombre: "Blanqueamiento LED",             desde: 280000,  hasta: 380000,  sesiones: "1 o 2 visitas",     icono: "brillo" },
    alineadores:  { nombre: "Ortodoncia invisible",           desde: 2600000, hasta: 4400000, sesiones: "6 a 18 meses",      icono: "alineador" },
    implante:     { nombre: "Implante dental",                desde: 1300000, hasta: 1900000, sesiones: "3 a 4 visitas",     icono: "implante" },
    carillas:     { nombre: "Carillas de porcelana",          desde: 420000,  hasta: 560000,  sesiones: "2 o 3 visitas (por pieza)", icono: "carilla" },
    urgencia:     { nombre: "Atención de urgencia",           desde: 40000,   hasta: 90000,   sesiones: "el mismo día",      icono: "rayo" }
  },
  consultaInicial: 35000  // primera consulta con diagnóstico y plan (se descuenta si arrancás el tratamiento)
};

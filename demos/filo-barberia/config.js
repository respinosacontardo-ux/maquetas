/*
  Configuración de la web demo "Filo Barbería" (marca inventada para mostrar el servicio).
  Todo lo que cambia con un cliente real está acá: datos del negocio, IA, contactos y servicios.
*/
window.CONFIG = {
  negocio: {
    nombre: "Filo Barbería",
    whatsapp: "5493516069281",                 // demo: WhatsApp de Facundo Social Media (cambiar por el de la barbería)
    direccion: "Fructuoso Rivera 520, Güemes",
    ciudad: "Córdoba",
    horario: "Martes a sábado de 10 a 21 h",
    extra: "Domingos y lunes cerrado · Sin espera con turno"
  },

  // IA de Google (Gemini). Sin clave, el asistente responde igual con la información de la página.
  gemini: {
    clave: "",
    modelos: ["gemini-flash-latest", "gemini-2.5-flash"]
  },

  // Dónde se guardan los contactos (se usa el primero completo). Si los dos están vacíos, viajan por WhatsApp.
  contactos: {
    appsScriptUrl: "",
    formsubmitEmail: ""
  },

  // Servicios y precios (ARS, noviembre 2026). Son de EJEMPLO para la demo.
  servicios: {
    corte:   { nombre: "Corte",                         precio: 18000, duracion: "40 min" },
    fade:    { nombre: "Corte fade + diseño",            precio: 21000, duracion: "50 min" },
    barba:   { nombre: "Barba y perfilado",              precio: 12000, duracion: "25 min" },
    combo:   { nombre: "Corte + barba",                  precio: 26000, duracion: "60 min" },
    navaja:  { nombre: "Afeitado clásico a navaja",      precio: 16000, duracion: "35 min" },
    ritual:  { nombre: "Ritual Filo (corte, barba, toalla caliente y mascarilla)", precio: 34000, duracion: "80 min" },
    color:   { nombre: "Color o decoloración",           precio: 45000, duracion: "desde 90 min" },
    ninos:   { nombre: "Corte niños (hasta 12 años)",    precio: 14000, duracion: "30 min" }
  },

  barberos: {
    nico:  { nombre: "Nico",  especialidad: "fades, diseños y cortes modernos" },
    tomas: { nombre: "Tomás", especialidad: "clásicos, barba y navaja" },
    leo:   { nombre: "Leo",   especialidad: "rulos, texturas y color" }
  }
};

/*
  Configuración de la web demo "Altura Automotores" (concesionaria multimarca inventada para mostrar el servicio).
  Todo lo que cambia con un cliente real está acá: datos, IA, contactos, stock y supuestos de financiación.
*/
window.CONFIG = {
  negocio: {
    nombre: "Altura Automotores",
    whatsapp: "5493516069281",                 // demo: WhatsApp de Facundo Social Media (cambiar por el de la concesionaria)
    direccion: "Av. Rafael Núñez 4620, Cerro de las Rosas",
    ciudad: "Córdoba",
    horario: "Lunes a viernes de 9 a 19 h · Sábados de 9 a 13 h",
    extra: "Test drive con turno, también a domicilio"
  },

  // IA de Google (Gemini). Sin clave, el asistente responde igual con la información de la página.
  gemini: { clave: "", modelos: ["gemini-flash-latest", "gemini-2.5-flash"] },

  // Dónde se guardan los contactos (se usa el primero completo). Si los dos están vacíos, viajan por WhatsApp.
  contactos: { appsScriptUrl: "", formsubmitEmail: "" },

  // Supuestos de la calculadora (EJEMPLO, noviembre 2026). Cambiar por los del banco o financiera real.
  financiacion: {
    tna: 0.39,               // tasa nominal anual del crédito prendario en pesos
    tasaCero: 12,            // promo de ejemplo: 0 km en 12 cuotas con tasa 0 %
    maxFinanciable: 0.7,     // se financia hasta el 70 % del valor
    plazos: [12, 24, 36, 48, 60]
  },

  // Stock de ejemplo (precios en pesos, valores de referencia para la demo)
  stock: [
    { id: "pk",  marca: "Pickup 4x4", modelo: "Doble cabina V6 Off-Road", anio: 2026, km: 0,     precio: 94500000, cero: true,  pickup: true,  motor: "V6 biturbo · 400 CV", caja: "Automática 10 vel.", foto: "",                                 tag: "La de la portada" },
    { id: "rg0", marca: "Ford",       modelo: "Ranger XLT 3.0 V6 4x4",    anio: 2026, km: 0,     precio: 68900000, cero: true,  pickup: true,  motor: "V6 3.0 · 250 CV",     caja: "Automática 10 vel.", foto: "photo-1700943937372-12c2611b5af8", tag: "0 km · Entrega inmediata" },
    { id: "hgr", marca: "Toyota",     modelo: "Hilux GR-Sport 4x4",       anio: 2026, km: 0,     precio: 72500000, cero: true,  pickup: true,  motor: "2.8 TD · 224 CV",     caja: "Automática 6 vel.",  foto: "photo-1758393605683-e28bb39d8917", tag: "0 km" },
    { id: "208", marca: "Peugeot",    modelo: "208 Allure 1.6",           anio: 2026, km: 0,     precio: 29900000, cero: true,  pickup: false, motor: "1.6 · 115 CV",        caja: "Automática 6 vel.",  foto: "photo-1650370794692-cc384a8a7d42", tag: "0 km · Tasa 0 %" },
    { id: "am",  marca: "Volkswagen", modelo: "Amarok V6 Highline",       anio: 2022, km: 45000, precio: 48000000, cero: false, pickup: true,  motor: "V6 3.0 TDI · 258 CV", caja: "Automática 8 vel.",  foto: "photo-1748156344878-90351f495fae", tag: "Usado seleccionado" },
    { id: "hx",  marca: "Toyota",     modelo: "Hilux SRV 2.8 4x4",        anio: 2019, km: 98000, precio: 36500000, cero: false, pickup: true,  motor: "2.8 TD · 177 CV",     caja: "Manual 6 vel.",      foto: "photo-1631377875413-b1e3e660bfa2", tag: "Service oficial" },
    { id: "rgu", marca: "Ford",       modelo: "Ranger 3.2 4x4 preparada", anio: 2019, km: 82000, precio: 39800000, cero: false, pickup: true,  motor: "3.2 TD · 200 CV",     caja: "Automática 6 vel.",  foto: "photo-1785179566113-cb8d4c5df690", tag: "Preparada off-road" },
    { id: "q5",  marca: "Audi",       modelo: "Q5 Sportback 45 TFSI",     anio: 2023, km: 14000, precio: 58000000, cero: false, pickup: false, motor: "2.0 TFSI · 265 CV",   caja: "S tronic 7",         foto: "photo-1769641156833-d5789dd62875", tag: "Como nueva" },
    { id: "x3",  marca: "BMW",        modelo: "X3 xDrive30i",             anio: 2021, km: 42000, precio: 47000000, cero: false, pickup: false, motor: "2.0 · 252 CV",        caja: "Steptronic 8",       foto: "photo-1605437139441-590d3a529b08", tag: "Único dueño" }
  ]
};

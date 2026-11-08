/*
  Configuración de la web demo "Vértice Automotores" (marca inventada para mostrar el servicio).
  Todo lo que cambia con un cliente real está acá: datos, IA, contactos, stock y supuestos de financiación.
*/
window.CONFIG = {
  negocio: {
    nombre: "Vértice Automotores",
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

  // Supuestos de la calculadora de cuotas (EJEMPLO, noviembre 2026). Cambiar por los del banco o financiera real.
  financiacion: {
    tipoCambio: 1450,        // ARS por USD, referencia para pasar el saldo a pesos
    tna: 0.42,               // tasa nominal anual del crédito prendario en pesos
    maxFinanciable: 0.7,     // se financia hasta el 70 % del valor del auto
    plazos: [12, 24, 36, 48]
  },

  // Stock de ejemplo (precios en USD, valores de referencia para la demo)
  stock: [
    { id: "f458",  marca: "Ferrari", modelo: "458 Spider",            anio: 2014, km: 18500, precio: 245000, motor: "V8 4.5 · 570 CV", caja: "Doble embrague F1", foto: "",                                 tag: "Destacado del mes" },
    { id: "r8",    marca: "Audi",    modelo: "R8 V10 Performance",    anio: 2019, km: 22000, precio: 168000, motor: "V10 5.2 · 620 CV", caja: "S tronic 7",        foto: "photo-1603584173870-7f23fdae1b7a", tag: "Único dueño" },
    { id: "x5",    marca: "BMW",     modelo: "X5 xDrive40i M Sport",  anio: 2022, km: 31000, precio: 98000,  motor: "6 cil. 3.0 · 340 CV", caja: "Steptronic 8",    foto: "photo-1615908397724-6dc711db34a7", tag: "Garantía oficial" },
    { id: "q5",    marca: "Audi",    modelo: "Q5 Sportback 45 TFSI",  anio: 2023, km: 14000, precio: 72000,  motor: "4 cil. 2.0 · 265 CV", caja: "S tronic 7",      foto: "photo-1769641156833-d5789dd62875", tag: "Como nuevo" },
    { id: "x3",    marca: "BMW",     modelo: "X3 xDrive30i",          anio: 2021, km: 42000, precio: 58000,  motor: "4 cil. 2.0 · 252 CV", caja: "Steptronic 8",    foto: "photo-1605437139441-590d3a529b08", tag: "Service oficial" },
    { id: "4r",    marca: "Toyota",  modelo: "4Runner TRD Pro",       anio: 2021, km: 38000, precio: 69000,  motor: "V6 4.0 · 270 CV", caja: "Automática 5",      foto: "photo-1621993202323-f438eec934ff", tag: "Importado" },
    { id: "x6",    marca: "BMW",     modelo: "X6 xDrive40i M Sport",  anio: 2022, km: 26000, precio: 115000, motor: "6 cil. 3.0 · 340 CV", caja: "Steptronic 8",    foto: "photo-1574761489603-c6c98152de56", tag: "Full equipo" }
  ]
};

/*
  Configuración de la propuesta web para Iturralde Ingeniería & Construcción (@iturralde_ingconstruccion).
  Todo lo que cambia con el cliente está acá: datos del negocio, IA, contactos y precios del cotizador.
*/
window.CONFIG = {
  negocio: {
    nombre: "Iturralde Ingeniería & Construcción",
    corto: "Iturralde",
    whatsapp: "56977300010",                 // número de su perfil de Instagram (con código de país, sin +)
    instagram: "iturralde_ingconstruccion",
    zona: "Santiago y Región Metropolitana",
    horario: "Lunes a viernes de 9:00 a 18:00 · Emergencias 24/7"  // ← confirmar con el cliente
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

  // Supuestos del cotizador (CLP, IVA incluido). Valores de referencia de mercado en Santiago para la
  // propuesta: ajustarlos con Iturralde antes de publicar.
  //   area:     agrupa las opciones en el paso 1
  //   precio:   valor por unidad; unidad (plural) y uno (singular) para mostrar la cantidad
  //   pregunta / ayuda: textos del paso de tamaño
  cotizador: {
    tipos: {
      techo:      { area: "Mantención y emergencias", nombre: "Techumbre, canaletas y filtraciones", precio: 38000,  unidad: "m²", def: 60, max: 400, semanas: [1, 2], desc: "Limpieza y cambio de canaletas, reparación de techumbres y ductos de aguas lluvias.", pregunta: "¿Cuántos m² de techo?", ayuda: "Una casa promedio tiene entre 80 y 150 m² de techumbre." },
      imper:      { area: "Mantención y emergencias", nombre: "Impermeabilización de terrazas",     precio: 32000,  unidad: "m²", def: 25, max: 300, semanas: [1, 2], desc: "Membranas y sellos para terrazas, losas y jardineras." },
      verticales: { area: "Mantención y emergencias", nombre: "Verticales sanitarias (edificios)",   precio: 95000,  unidad: "pisos", uno: "piso", def: 10, max: 40, semanas: [1, 1], desc: "Limpieza profesional de verticales: obstrucciones, malos olores y rebalses.", pregunta: "¿Cuántos pisos tiene el edificio?", ayuda: "Se cotiza por vertical y por piso; en la visita contamos cuántas verticales hay." },
      palomas:    { area: "Mantención y emergencias", nombre: "Tratamiento antipalomas",             precio: 22000,  unidad: "m²", def: 40, max: 500, semanas: [1, 1], desc: "Limpieza, mallas, púas y control para casas, edificios y empresas.", pregunta: "¿Cuántos m² hay que proteger?", ayuda: "Suma techos, cornisas y balcones donde se posan las palomas." },
      inspeccion: { area: "Inspección técnica",       nombre: "Inspección de entrega de vivienda",   precio: 3200,   unidad: "m²", def: 70, max: 300, semanas: [1, 1], desc: "Revisión antes de firmar la entrega, con informe técnico y fotografías.", pregunta: "¿Cuántos m² tiene la propiedad?", ayuda: "Revisamos terminaciones, instalaciones, filtraciones, niveles y sellos." },
      remodela:   { area: "Obras y remodelaciones",   nombre: "Remodelación, pisos y revestimientos", precio: 210000, unidad: "m²", def: 30, max: 250, semanas: [2, 6], desc: "Baños, cocinas, pisos, revestimientos y terminaciones." },
      ampliacion: { area: "Obras y remodelaciones",   nombre: "Ampliación, quincho o terraza",        precio: 620000, unidad: "m²", def: 20, max: 120, semanas: [4, 10], desc: "Ampliaciones, quinchos, terrazas y cobertizos." },
      cierres:    { area: "Obras y remodelaciones",   nombre: "Muros, cierres, portones y rejas",     precio: 145000, unidad: "metros lineales", uno: "metro lineal", def: 15, max: 150, semanas: [1, 3], desc: "Muros de cierre, portones, rejas y cercos.", pregunta: "¿Cuántos metros lineales?", ayuda: "Mide el largo total del cierre o reja que necesitas." }
    },
    terminaciones: {
      esencial: { nombre: "Correctiva",  factor: 1,    desc: "Resolver el problema puntual con materiales estándar." },
      premium:  { nombre: "Preventiva",  factor: 1.15, desc: "Incluye revisión del entorno y garantía de mantención." },
      autor:    { nombre: "Urgente 24/7", factor: 1.35, desc: "Atención de emergencia fuera de horario o en el día." }
    },
    extras: {
      informe:    { nombre: "Informe técnico con fotos",         precio: 90000 },
      plan:       { nombre: "Plan de mantención anual",          precio: 480000 },
      altura:     { nombre: "Trabajo en altura (andamio/arnés)", precio: 250000 },
      retiro:     { nombre: "Retiro de escombros y aseo",        precio: 180000 }
    },
    comunasRecargo: { "Lo Barnechea": 1.05, "Colina": 1.06, "Buin": 1.06, "Talagante": 1.06 }, // traslado
    margen: 0.15,   // el rango se muestra ±15%
    textos: {       // textos del cotizador propios de este rubro
      paso3: "¿Qué tipo de servicio?",
      paso3ayuda: "Define la urgencia y el alcance del trabajo."
    }
  }
};

/* Constructora Vicam (propuesta): animaciones, cotizador, asistente con IA y guardado de contactos. */
(function () {
  "use strict";
  var C = window.CONFIG, N = C.negocio, Q = C.cotizador;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fino = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function clp(n) { return "$" + Math.round(n).toLocaleString("es-CL"); }
  function millones(n) { return "$" + (n / 1e6).toLocaleString("es-CL", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + " M"; }
  // Montos chicos en pesos; desde un millón, en millones
  function monto(n) { return n < 1e6 ? clp(n) : millones(n); }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Datos del negocio en la página ---------- */
  var COMUNAS = ["Las Condes", "Vitacura", "Lo Barnechea", "Providencia", "Ñuñoa", "La Reina", "Santiago Centro", "Chicureo", "Huechuraba", "Peñalolén", "La Florida", "Maipú", "Pucón", "Otra comuna"];
  $("#cHor").textContent = N.horario;
  $("#fHor").textContent = N.horario.split(" · ")[0];
  $("#cZona").textContent = N.zona;
  $("#cTel").textContent = "+" + N.whatsapp.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, "$1 $2 $3 $4");
  $$(".ig-link").forEach(function (a) { a.href = "https://www.instagram.com/" + N.instagram + "/"; });
  $("#fComuna").innerHTML = COMUNAS.map(function (c) { return "<option>" + c + "</option>"; }).join("");
  $("#cWa").href = $("#waFab").href = wa("Hola Cristóbal y Rubén, vi su trabajo en la web y me gustaría cotizar un proyecto.");
  $("#tramWa").href = wa("Hola Cristóbal y Rubén, necesito adaptar un espacio a la Ley de Accesibilidad Universal y quiero cotizar.");

  /* ---------- Header y menú ---------- */
  var hdr = $("#hdr"), menuBtn = $("#menuBtn");
  function solid() { hdr.classList.toggle("solid", scrollY > 10 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  menuBtn.onclick = function () {
    var on = hdr.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", on); solid();
  };
  $$("#nav a").forEach(function (a) { a.onclick = function () { hdr.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); solid(); }; });

  /* ---------- IA (Gemini) ---------- */
  function hayIA() { return !!(C.gemini && C.gemini.clave); }
  async function gemini(opts) {
    var ultimoError;
    for (var i = 0; i < C.gemini.modelos.length; i++) {
      var url = "https://generativelanguage.googleapis.com/v1beta/models/" + C.gemini.modelos[i] + ":generateContent?key=" + encodeURIComponent(C.gemini.clave);
      var body = { contents: opts.contents, generationConfig: { temperature: opts.temperatura == null ? 0.5 : opts.temperatura, maxOutputTokens: 2048 } };
      if (opts.sistema) body.system_instruction = { parts: [{ text: opts.sistema }] };
      if (opts.json) body.generationConfig.responseMimeType = "application/json";
      try {
        var r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!r.ok) { ultimoError = new Error("Gemini " + r.status); continue; }
        var d = await r.json();
        var t = ((d.candidates || [])[0] || {}).content;
        t = t && t.parts ? t.parts.map(function (p) { return p.text || ""; }).join("") : "";
        if (t) return t;
        ultimoError = new Error("Respuesta vacía");
      } catch (e) { ultimoError = e; }
    }
    throw ultimoError;
  }

  /* ---------- Contactos ---------- */
  function guardarContacto(datos) {
    datos = Object.assign({ fecha: new Date().toLocaleString("es-CL"), pagina: location.href.split("#")[0] }, datos);
    // Respaldo local: nunca es el único lugar donde queda el contacto (sin planilla ni email, llega por WhatsApp)
    try { var l = JSON.parse(localStorage.getItem("vicam-contactos") || "[]"); l.push(datos); localStorage.setItem("vicam-contactos", JSON.stringify(l.slice(-20))); } catch (e) {}
    var k = C.contactos || {};
    if (k.appsScriptUrl) return fetch(k.appsScriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(datos) }).catch(function () {});
    if (k.formsubmitEmail) return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(k.formsubmitEmail), {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.assign({ _subject: "Nuevo contacto web · " + N.nombre, _template: "table" }, datos))
    }).catch(function () {});
    return Promise.resolve();
  }

  /* ---------- Formulario de contacto ---------- */
  $("#contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, err = $("#cErr");
    var nombre = f.nombre.value.trim(), tel = f.telefono.value.trim();
    if (!nombre) { err.textContent = "Cuéntanos tu nombre."; f.nombre.focus(); return; }
    if (tel.replace(/\D/g, "").length < 8) { err.textContent = "Revisa tu número de WhatsApp."; f.telefono.focus(); return; }
    err.textContent = "";
    guardarContacto({ origen: "Formulario de contacto", nombre: nombre, telefono: tel, comuna: f.comuna.value, mensaje: f.mensaje.value.trim() });
    var ok = $("#cOk");
    ok.innerHTML = "¡Gracias, " + esc(nombre.split(" ")[0]) + "! Te escribimos por WhatsApp para coordinar la visita. " +
      '<a href="' + wa("¡Hola! Soy " + nombre + ", de " + f.comuna.value + ". Quiero cotizar: " + f.mensaje.value.trim()) + '" target="_blank" rel="noopener" style="color:var(--blue);font-weight:600">Adelantar por WhatsApp →</a>';
    ok.style.display = "block";
    f.querySelector("button[type=submit]").disabled = true;
  });

  /* ---------- Cotizador ---------- */
  var PLAZOS = ["Lo antes posible", "En 1 a 3 meses", "En 3 a 6 meses", "Solo estoy cotizando"];
  var s = { tipo: null, m2: 6, term: null, extras: [], comuna: "Las Condes", plazo: null, nombre: "", email: "", tel: "", ia: null };
  var paso = 0, qz = $("#qz");
  var TITULOS = ["Tipo de trabajo", "Tamaño", "Terminaciones", "Extras y trámites", "Ubicación y plazo", "Tus datos", "Tu estimación"];
  function cant(t, n) { return t.unidad === "m²" ? n + " m²" : n + (n === 1 ? " arreglo" : " arreglos"); }

  function calcular() {
    var t = Q.tipos[s.tipo], f = Q.terminaciones[s.term] || Q.terminaciones.esencial;
    var obra = t.precio * s.m2 * f.factor;
    var lineas = [[t.nombre + " · " + cant(t, s.m2) + " · " + f.nombre, obra]];
    s.extras.forEach(function (k) { lineas.push([Q.extras[k].nombre, Q.extras[k].precio]); obra += Q.extras[k].precio; });
    var rec = Q.comunasRecargo[s.comuna] || 1;
    var total = obra * rec;
    var r = function (n) { return Math.round(n / 50000) * 50000; };
    // Trabajos grandes alargan la obra dentro del rango del tipo
    var frac = Math.min(1, s.m2 / t.max);
    var sem = [t.semanas[0], Math.max(t.semanas[0] + 1, Math.round(t.semanas[0] + (t.semanas[1] - t.semanas[0]) * (0.5 + frac)))];
    return { total: total, min: r(total * (1 - Q.margen)), max: r(total * (1 + Q.margen)), lineas: lineas, semanas: sem, recargo: rec };
  }

  function nav(puede, texto) {
    return '<div class="qz-nav">' + (paso > 0 ? '<button type="button" class="qz-back">← Volver</button>' : "<span></span>") +
      '<button type="button" class="btn btn-blue qz-next"' + (puede ? "" : " disabled") + ">" + (texto || "Continuar") + "</button></div>";
  }

  function pintar(foco) {
    var total = TITULOS.length - 1, h = "";
    h += '<div class="qz-top"><span>' + (paso < total ? "Paso " + (paso + 1) + " de " + total : "Resultado") + "</span><span>" + TITULOS[paso] + "</span></div>";
    h += '<div class="qz-bar"><i style="width:' + Math.round((paso + 1) / (total + 1) * 100) + '%"></i></div>';
    if (paso === 0) {
      var areas = {};
      Object.keys(Q.tipos).forEach(function (k) { (areas[Q.tipos[k].area] = areas[Q.tipos[k].area] || []).push(k); });
      h += "<h3>¿Qué necesitas?</h3><p class=\"qz-hint\">Elige el trabajo principal; los extras y trámites vienen después.</p>" +
        Object.keys(areas).map(function (a) {
          return '<p class="opt-area">' + a + '</p><div class="opts two">' + areas[a].map(function (k) { var t = Q.tipos[k]; return '<button type="button" class="opt' + (s.tipo === k ? " sel" : "") + '" data-tipo="' + k + '"><b>' + t.nombre + "</b><span>" + t.desc + "</span></button>"; }).join("") + "</div>";
        }).join("");
    } else if (paso === 1) {
      var t = Q.tipos[s.tipo], m2 = t.unidad === "m²";
      h += "<h3>" + (m2 ? "¿Cuántos metros cuadrados?" : "¿Cuántos arreglos son?") + "</h3><p class=\"qz-hint\">" + (m2 ? "Una aproximación basta: lo medimos en la visita técnica." : "Cuenta cada problema por separado: una filtración, un enchufe que no funciona, una puerta que no cierra…") + "</p>" +
        '<div class="range-row"><label for="qM2">' + (m2 ? "Superficie" : "Cantidad") + '</label><output id="oM2">' + cant(t, s.m2) + "</output></div>" +
        '<input type="range" id="qM2" min="1" max="' + t.max + '" step="1" value="' + s.m2 + '">' +
        '<p class="note" style="margin-top:10px">' + (m2 ? "Referencia: un baño típico mide 4–6 m², una cocina 8–12 m² y un dormitorio 10–12 m²." : "Si son muchos arreglos en una misma propiedad, la visita técnica sin costo es la mejor forma de cotizarlos juntos.") + "</p>" + nav(true);
    } else if (paso === 2) {
      h += "<h3>¿Qué nivel de terminaciones?</h3><p class=\"qz-hint\">Define materiales, grifería e iluminación.</p><div class=\"opts\">" +
        Object.keys(Q.terminaciones).map(function (k) { var t = Q.terminaciones[k]; return '<button type="button" class="opt' + (s.term === k ? " sel" : "") + '" data-term="' + k + '"><b>' + t.nombre + "</b><span>" + t.desc + "</span></button>"; }).join("") + "</div>";
    } else if (paso === 3) {
      h += "<h3>¿Algo más?</h3><p class=\"qz-hint\">Opcional. Marca lo que también necesitas, incluidos los trámites municipales.</p><div class=\"chips\">" +
        Object.keys(Q.extras).map(function (k) { var on = s.extras.indexOf(k) >= 0; return '<button type="button" class="chip' + (on ? " sel" : "") + '" data-extra="' + k + '" aria-pressed="' + on + '">' + Q.extras[k].nombre + "</button>"; }).join("") +
        "</div>" + nav(true, s.extras.length ? "Continuar" : "Sin extras, continuar");
    } else if (paso === 4) {
      h += "<h3>¿Dónde y para cuándo?</h3><p class=\"qz-hint\">Nos ayuda a planificar la visita y el equipo.</p>" +
        '<div class="field"><label for="qComuna">Comuna</label><select class="inp" id="qComuna">' + COMUNAS.map(function (c) { return "<option" + (c === s.comuna ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></div>" +
        '<div class="field"><label>¿Para cuándo?</label><div class="chips">' + PLAZOS.map(function (p) { return '<button type="button" class="chip' + (s.plazo === p ? " sel" : "") + '" data-plazo="' + p + '">' + p + "</button>"; }).join("") + "</div></div>" + nav(!!s.plazo);
    } else if (paso === 5) {
      h += "<h3>¿A dónde te enviamos la estimación?</h3><p class=\"qz-hint\">Te la mostramos ahora mismo y te dejamos una copia para que la revises con calma.</p>" +
        '<div class="field"><label for="qNombre">Nombre</label><input class="inp" id="qNombre" autocomplete="name" value="' + esc(s.nombre) + '"></div>' +
        '<div class="two"><div class="field"><label for="qTel">WhatsApp</label><input class="inp" id="qTel" inputmode="tel" autocomplete="tel" placeholder="+56 9 1234 5678" value="' + esc(s.tel) + '"></div>' +
        '<div class="field"><label for="qEmail">Email <span style="color:var(--steel);font-weight:400">(opcional)</span></label><input class="inp" id="qEmail" type="email" autocomplete="email" value="' + esc(s.email) + '"></div></div>' +
        '<p class="err" id="qErr" role="alert"></p><p class="note">Usamos tus datos solo para enviarte esta estimación y coordinar la visita si la quieres.</p>' + nav(true, "Ver mi estimación");
    } else {
      var c = calcular();
      h += "<h3>Tu estimación, " + esc(s.nombre.split(" ")[0]) + "</h3>" +
        '<div class="res-big"><small>Rango estimado con IVA, materiales y mano de obra</small><b>' + monto(c.min) + " – " + monto(c.max) + "</b><span>Trabajo de " + c.semanas[0] + " a " + c.semanas[1] + " semanas · " + esc(s.comuna) + "</span></div>" +
        '<ul class="res-list">' + c.lineas.map(function (l) { return "<li><span>" + esc(l[0]) + "</span><span>≈ " + clp(l[1]) + "</span></li>"; }).join("") +
        (c.recargo > 1 ? "<li><span>Traslado de equipo y materiales a " + esc(s.comuna) + "</span><span>+" + Math.round((c.recargo - 1) * 100) + "%</span></li>" : "") + "</ul>" +
        '<div class="ia-box" id="iaBox"><b><i></i>Recomendaciones para tu obra</b><p id="iaTxt">' + (hayIA() ? "Preparando recomendaciones…" : esc(consejosLocales())) + "</p></div>" +
        '<p class="note">Estimación orientativa calculada con valores de referencia de mercado en Santiago. El precio final se define con la visita técnica sin costo y se entrega por escrito.</p>' +
        '<div class="res-acts"><a class="btn btn-blue" target="_blank" rel="noopener" href="' + wa(resumen(c)) + '">Agendar visita por WhatsApp</a><button type="button" class="btn btn-line" id="qOtra">Cotizar otro trabajo</button></div>';
    }
    qz.innerHTML = h;
    enlazar();
    if (paso === 6 && hayIA()) recomendacionesIA();
    if (foco) { var t1 = $("h3", qz); if (t1) { t1.tabIndex = -1; t1.focus({ preventScroll: true }); } }
  }

  function consejosLocales() {
    var tips = {
      bano: "Si cambias tina por ducha en obra, un desagüe lineal permite piso continuo sin cortes de cerámica; solo hay que limpiarlo más seguido. Revisa las cañerías antes de cerrar muros.",
      cocina: "Define con el diseñador la distribución y los enchufes antes de pedir los muebles: los muebles a medida se fabrican con las medidas finales de obra, no con las del plano.",
      integral: "En una remodelación completa conviene partir por instalaciones (electricidad y sanitarias) y terminar con pisos y muebles. Coordinar un solo equipo evita que un gremio rompa lo que dejó listo otro.",
      comercial: "Para un local o cafetería, revisa temprano lo que pide la municipalidad para la patente y la Seremi si hay alimentos: así la obra se diseña pensando en la recepción y en abrir a tiempo.",
      acceso: "La Ley 20.422 exige rutas accesibles en edificios de uso público: rampas con pendiente máxima, baño accesible y puertas de ancho mínimo. Conviene revisar todo el recorrido, no solo la entrada.",
      civil: "Antes de diseñar una ampliación, confirma en la Dirección de Obras cuánto puedes construir en tu terreno. El cálculo estructural y el permiso evitan problemas al vender o regularizar."
    };
    return tips[s.tipo] || "";
  }

  async function recomendacionesIA() {
    var c = calcular();
    try {
      var txt = await gemini({
        sistema: "Eres jefe de obra de una empresa de remodelaciones en Santiago de Chile. Escribes en español de Chile con tuteo. Das 2 o 3 recomendaciones prácticas y concretas (máximo 70 palabras en total, en un solo párrafo, sin markdown ni listas). No menciones precios nuevos ni inventes datos.",
        contents: [{ role: "user", parts: [{ text: "Trabajo: " + Q.tipos[s.tipo].nombre + ", " + cant(Q.tipos[s.tipo], s.m2) + ", terminaciones " + Q.terminaciones[s.term].nombre + ", extras: " + (s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") || "ninguno") + ", comuna " + s.comuna + ", plazo " + s.plazo + ". Rango estimado " + monto(c.min) + " a " + monto(c.max) + "." }] }],
        temperatura: 0.6
      });
      s.ia = txt.replace(/\*\*/g, "").trim();
    } catch (e) { s.ia = consejosLocales(); }
    var p = $("#iaTxt"); if (p) p.textContent = s.ia;
  }

  function resumen(c) {
    return "¡Hola " + N.nombre + "! Soy " + s.nombre + ". Usé el cotizador de la web:\n" +
      "• Trabajo: " + Q.tipos[s.tipo].nombre + " (" + cant(Q.tipos[s.tipo], s.m2) + ")\n" +
      "• Terminaciones: " + Q.terminaciones[s.term].nombre + "\n" +
      (s.extras.length ? "• Extras: " + s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") + "\n" : "") +
      "• Comuna: " + s.comuna + " · Plazo: " + s.plazo + "\n" +
      "• Estimación: " + monto(c.min) + " – " + monto(c.max) + "\n" +
      "Quiero agendar la visita técnica sin costo.";
  }

  function irA(n) { paso = n; pintar(true); }
  function enlazar() {
    var back = $(".qz-back", qz), next = $(".qz-next", qz);
    if (back) back.onclick = function () { irA(paso - 1); };
    $$("[data-tipo]", qz).forEach(function (b) { b.onclick = function () { elegirTipo(b.dataset.tipo); irA(1); }; });
    $$("[data-term]", qz).forEach(function (b) { b.onclick = function () { s.term = b.dataset.term; irA(3); }; });
    $$("[data-extra]", qz).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.extra, i = s.extras.indexOf(k);
        if (i >= 0) s.extras.splice(i, 1); else s.extras.push(k);
        b.classList.toggle("sel", i < 0); b.setAttribute("aria-pressed", i < 0);
        next.textContent = s.extras.length ? "Continuar" : "Sin extras, continuar";
      };
    });
    $$("[data-plazo]", qz).forEach(function (b) {
      b.onclick = function () { s.plazo = b.dataset.plazo; $$("[data-plazo]", qz).forEach(function (x) { x.classList.toggle("sel", x === b); }); next.disabled = false; };
    });
    var r = $("#qM2", qz);
    if (r) r.oninput = function () { s.m2 = +r.value; $("#oM2").textContent = cant(Q.tipos[s.tipo], s.m2); };
    var com = $("#qComuna", qz); if (com) com.onchange = function () { s.comuna = com.value; };
    var otra = $("#qOtra", qz); if (otra) otra.onclick = function () { s.tipo = null; s.term = null; s.extras = []; s.ia = null; irA(0); };
    if (next) next.onclick = function () {
      if (paso === 5) {
        s.nombre = $("#qNombre").value.trim(); s.tel = $("#qTel").value.trim(); s.email = $("#qEmail").value.trim();
        var err = $("#qErr");
        if (!s.nombre) { err.textContent = "Cuéntanos tu nombre."; $("#qNombre").focus(); return; }
        if (s.tel.replace(/\D/g, "").length < 8) { err.textContent = "Revisa tu número de WhatsApp: lo usamos para enviarte la estimación."; $("#qTel").focus(); return; }
        if (s.email && !/^\S+@\S+\.\S+$/.test(s.email)) { err.textContent = "Revisa tu email o déjalo en blanco."; $("#qEmail").focus(); return; }
        var c = calcular();
        guardarContacto({
          origen: "Cotizador", nombre: s.nombre, telefono: s.tel, email: s.email, comuna: s.comuna, plazo: s.plazo,
          obra: Q.tipos[s.tipo].nombre + " · " + cant(Q.tipos[s.tipo], s.m2) + " · " + Q.terminaciones[s.term].nombre,
          extras: s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") || "Ninguno",
          estimacion: monto(c.min) + " – " + monto(c.max)
        });
      }
      irA(paso + 1);
    };
  }
  function elegirTipo(k) {
    if (s.tipo !== k) { s.tipo = k; s.m2 = Q.tipos[k].def; }
  }

  // Atajos al cotizador desde la portada y las tarjetas de servicios
  $("#quick").addEventListener("submit", function (e) {
    e.preventDefault();
    var k = $("#quickTipo").value;
    if (k) { elegirTipo(k); paso = 1; } else paso = 0;
    pintar();
    $("#cotizador").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
  $$("[data-tipo-link]").forEach(function (a) {
    a.addEventListener("click", function () { elegirTipo(a.dataset.tipoLink); paso = 1; pintar(); });
  });
  pintar();

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), chatM = $("#chatM"), chatI = $("#chatI"), fab = $("#aiFab"), historial = [];
  var FAQS = $$("#faq details").map(function (d) { return { q: d.querySelector("summary").textContent.trim(), a: d.querySelector("p").textContent.trim() }; });
  var SUGERENCIAS = ["¿Cuánto cuesta remodelar un baño?", "¿Hacen locales y cafeterías?", "¿Qué es la accesibilidad universal?", "¿Trabajan en Pucón?"];

  var SISTEMA = [
    "Eres el asistente virtual de " + N.nombre + ", constructora dirigida por Cristóbal y Rubén Montt, especialista en remodelación de casas y oficinas, obras civiles y adaptaciones a la Ley de Accesibilidad Universal. Trabaja en " + N.zona + ".",
    "Hablas en español de Chile, con tuteo, cercano y profesional. Respuestas cortas: 2 a 4 frases, sin listas largas ni markdown.",
    "Usa SOLO esta información; si no sabes algo (precios exactos, disponibilidad, temas técnicos que no están), dilo y ofrece que Cristóbal o Rubén lo confirmen por WhatsApp. Nunca inventes datos.",
    "Proyectos de referencia: cafetería Chiamo en Las Condes (habilitación completa con muebles curvos), baño Huinganal en Lo Barnechea (tina por ducha en obra con desagüe lineal), cocina y baño Tauro junto a Estudio Lenga (un walking closet convertido en dos baños), cocina en Ismael Valdés Vergara, obras en Pucón.",
    "Servicios: baños, cocinas, remodelación integral de casas y departamentos, oficinas, locales y cafeterías llave en mano, accesibilidad universal (rampas, baños accesibles, circulaciones), obras civiles y ampliaciones. Trabajan en conjunto con estudios de arquitectura y diseño.",
    "Horario: " + N.horario + ". WhatsApp: +" + N.whatsapp + ". Instagram: @" + N.instagram + ".",
    "Preguntas frecuentes:\n" + FAQS.map(function (f) { return "P: " + f.q + "\nR: " + f.a; }).join("\n"),
    "Cuando la persona muestre interés en precios o en avanzar, invítala a usar el cotizador de la página (da un rango en 60 segundos) o a escribirle a Cristóbal y Rubén por WhatsApp."
  ].join("\n\n");

  function abrir() {
    chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none";
    if (!chatM.children.length) bot("¡Hola! 👋 Soy el asistente de " + N.nombre + ". Pregúntame lo que quieras sobre remodelaciones, locales comerciales, accesibilidad universal u obras civiles.", { chips: true });
    if (fino) setTimeout(function () { chatI.focus({ preventScroll: true }); }, 250);
  }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.onclick = abrir; $("#chatX").onclick = cerrar;
  addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });

  function burbuja(cls, texto) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = texto; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(texto, o) {
    o = o || {};
    $$(".msg-acts", chatM).forEach(function (a) { a.remove(); });
    burbuja("bot", texto);
    var acts = document.createElement("div"); acts.className = "msg-acts";
    if (o.chips) SUGERENCIAS.forEach(function (q) { var b = document.createElement("button"); b.type = "button"; b.textContent = q; b.onclick = function () { enviar(q); }; acts.appendChild(b); });
    else {
      var cot = document.createElement("button"); cot.type = "button"; cot.className = "pri"; cot.textContent = "Cotizar en línea";
      cot.onclick = function () { if (innerWidth < 700) cerrar(); $("#cotizador").scrollIntoView({ behavior: "smooth" }); };
      var w = document.createElement("a"); w.className = "wa"; w.target = "_blank"; w.rel = "noopener"; w.textContent = "WhatsApp";
      var ultima = historial.filter(function (h) { return h.role === "user"; }).pop();
      w.href = wa("¡Hola " + N.nombre + "! " + (ultima ? "Les consulto: " + ultima.parts[0].text : "Quiero información."));
      acts.appendChild(cot); acts.appendChild(w);
    }
    chatM.appendChild(acts); chatM.scrollTop = chatM.scrollHeight;
  }

  // Respuesta sin IA: la pregunta frecuente más parecida
  function local(q) {
    var n = function (x) { return x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " "); };
    var VAC = " de la el los las un una que con por para mi me es en y o se su lo como hay tienen puedo quiero cuanto cual cuales ";
    var raiz = function (w) { return w.slice(0, 5); };
    var ws = n(q).split(/\s+/).filter(function (w) { return w.length > 2 && VAC.indexOf(" " + w + " ") < 0; }).map(raiz);
    var syn = { cuest: "cuest", preci: "cuest", valor: "cuest", sale: "cuest", cobra: "cuest", demor: "demor", tarda: "demor", plazo: "demor", tiemp: "demor", seman: "demor", permi: "permi", munic: "permi", pagar: "paga", pago: "paga", cuota: "paga", tarje: "paga", garan: "garan", comun: "comun", zona: "comun", donde: "comun", visit: "visit", vivie: "vivie", vivir: "vivie" };
    var mejor = null, pts = 0;
    FAQS.forEach(function (f) {
      var fw = n(f.q).split(/\s+/).map(raiz), fa = n(f.a).split(/\s+/).map(raiz), p = 0;
      ws.forEach(function (w) { var w2 = syn[w] || w; if (fw.some(function (x) { return x === w || (syn[x] || x) === w2; })) p += 2; else if (fa.indexOf(w) >= 0) p += 0.5; });
      if (p > pts) { pts = p; mejor = f; }
    });
    var nq = n(q);
    if (/horari|abren|atienden/.test(nq)) return "Atendemos de " + N.horario.charAt(0).toLowerCase() + N.horario.slice(1) + ". La visita técnica es sin costo y la coordinamos según tu disponibilidad.";
    if (/pucon|california|sur|region/.test(nq)) return "Sí: trabajamos en Santiago, en Pucón y también en California. Cuéntanos dónde está tu proyecto por WhatsApp y coordinamos la visita.";
    if (/acces|rampa|20 ?422|discapac|silla/.test(nq)) return "La Ley 20.422 de accesibilidad universal exige que los espacios de uso público tengan rutas accesibles: rampas, baños accesibles y puertas y pasillos de ancho mínimo. Adaptamos locales, oficinas y edificios para cumplirla; el cotizador te da un rango para tu caso.";
    if (/local|cafeter|restaur|oficina|comercial|tienda/.test(nq)) return "Sí, habilitamos oficinas, locales y cafeterías llave en mano, como la cafetería Chiamo en Las Condes: tabiques, cielos, instalaciones, muebles a medida y terminaciones. Escríbenos con los metros y el rubro y te orientamos.";
    if (/cocina/.test(nq) && /cuest|preci|valor|sale/.test(nq)) return "Como referencia, una cocina de 8 a 12 m² suele quedar entre $7 y $12 millones según muebles y cubierta, IVA incluido. El cotizador te da un rango para tu caso en 60 segundos.";
    if (pts >= 2) return mejor.a;
    return "Buena pregunta. Esa te la responde mejor nuestro equipo por WhatsApp, en minutos. Si quieres un valor de referencia, el cotizador te da un rango en 60 segundos.";
  }

  async function enviar(texto) {
    texto = texto.trim(); if (!texto) return;
    burbuja("me", texto); chatI.value = "";
    historial.push({ role: "user", parts: [{ text: texto }] });
    var t = document.createElement("div"); t.className = "msg bot typing"; t.innerHTML = "<i></i><i></i><i></i>"; chatM.appendChild(t); chatM.scrollTop = chatM.scrollHeight;
    var r;
    if (hayIA()) {
      try { r = (await gemini({ sistema: SISTEMA, contents: historial.slice(-12) })).trim(); } catch (e) { r = null; }
    }
    if (!r) { await new Promise(function (ok) { setTimeout(ok, 700); }); r = local(texto); }
    historial.push({ role: "model", parts: [{ text: r }] });
    t.remove(); bot(r.replace(/\*\*/g, ""));
  }
  $("#chatF").addEventListener("submit", function (e) { e.preventDefault(); enviar(chatI.value); });

  /* ---------- Animaciones ---------- */
  function animar() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST || reduce) { document.documentElement.classList.remove("js"); contar(true); return; }
    gsap.registerPlugin(ST);
    // Portada
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-photo img", { scale: 1.14, duration: 2, ease: "power2.out" }, 0)
      .from(".hero h1 .ln > span", { yPercent: 110, duration: 1, stagger: 0.1 }, 0.1)
      .from(".hero-in", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.4)
      .from(".hero-card", { y: 26, opacity: 0, duration: 0.8, stagger: 0.12 }, 0.6)
      .add(function () { contar(); }, 0.8);
    gsap.to(".hero-photo img", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    // Entradas escalonadas
    ST.batch(".rv", { start: "top 88%", once: true, onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true }); } });
    // Línea de progreso de "Cómo trabajamos"
    gsap.to(".steps-line i", { scaleX: 1, ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 55%", scrub: true } });
    // Parallax de las fotos
    $$(".ph img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    addEventListener("load", function () { ST.refresh(); });
  }
  var contado = false;
  function contar(directo) {
    if (contado) return; contado = true;
    $$("[data-count]").forEach(function (el) {
      var fin = +el.dataset.count;
      if (directo || !window.gsap) { el.textContent = fin; return; }
      var o = { v: 0 };
      var go = function () { window.gsap.to(o, { v: fin, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v); } }); };
      // Las cifras fuera de pantalla cuentan cuando aparecen
      if (el.closest(".hero")) go();
      else window.ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: go });
    });
  }
  // Tarjetas que se inclinan con el mouse
  if (fino && !reduce) $$(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 5) + "deg) rotateY(" + ((x - 0.5) * 6) + "deg) translateY(-3px)";
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });
  if (window.gsap && window.ScrollTrigger) animar();
  else addEventListener("load", animar);
  // Si las librerías no cargan, el contenido igual queda visible
  setTimeout(function () { if (!window.gsap) { document.documentElement.classList.remove("js"); contar(true); } }, 4000);
})();

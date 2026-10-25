/* Fragua Remodelaciones (demo): animaciones, cotizador, asistente con IA y guardado de contactos. */
(function () {
  "use strict";
  var C = window.CONFIG, N = C.negocio, Q = C.cotizador;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fino = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function clp(n) { return "$" + Math.round(n).toLocaleString("es-CL"); }
  function millones(n) { return "$" + (n / 1e6).toLocaleString("es-CL", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + " M"; }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Datos del negocio en la página ---------- */
  var COMUNAS = ["Providencia", "Ñuñoa", "Las Condes", "La Reina", "Vitacura", "Macul", "San Miguel", "Santiago Centro", "Lo Barnechea", "Otra"];
  $("#cDir").textContent = N.oficina;
  $("#cHor").textContent = N.horario;
  $("#fHor").textContent = N.horario.split(" · ")[0];
  $("#cMail").textContent = N.email;
  $("#fComuna").innerHTML = COMUNAS.map(function (c) { return "<option>" + c + "</option>"; }).join("");
  $("#cWa").href = $("#waFab").href = wa("¡Hola " + N.nombre + "! Quiero cotizar una remodelación.");

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
    try { var l = JSON.parse(localStorage.getItem("fragua-contactos") || "[]"); l.push(datos); localStorage.setItem("fragua-contactos", JSON.stringify(l.slice(-20))); } catch (e) {}
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
    ok.innerHTML = "¡Gracias, " + esc(nombre.split(" ")[0]) + "! Te escribimos por WhatsApp para coordinar la visita técnica. " +
      '<a href="' + wa("¡Hola! Soy " + nombre + ", de " + f.comuna.value + ". Quiero agendar una visita técnica sin costo. " + f.mensaje.value.trim()) + '" target="_blank" rel="noopener" style="color:var(--ember);font-weight:600">Adelantar por WhatsApp →</a>';
    ok.style.display = "block";
    f.querySelector("button[type=submit]").disabled = true;
  });

  /* ---------- Cotizador ---------- */
  var PLAZOS = ["Lo antes posible", "En 1 a 3 meses", "En 3 a 6 meses", "Solo estoy cotizando"];
  var s = { tipo: null, m2: 6, term: null, extras: [], comuna: "Providencia", plazo: null, nombre: "", email: "", tel: "", ia: null };
  var paso = 0, qz = $("#qz");
  var TITULOS = ["Tipo de obra", "Superficie", "Terminaciones", "Extras", "Ubicación y plazo", "Tus datos", "Tu estimación"];

  function calcular() {
    var t = Q.tipos[s.tipo], f = Q.terminaciones[s.term] || Q.terminaciones.esencial;
    var obra = t.m2 * s.m2 * f.factor;
    var lineas = [[t.nombre + " · " + s.m2 + " m² · " + f.nombre, obra]];
    s.extras.forEach(function (k) { lineas.push([Q.extras[k].nombre, Q.extras[k].precio]); obra += Q.extras[k].precio; });
    var rec = Q.comunasRecargo[s.comuna] || 1;
    var total = obra * rec;
    var r = function (n) { return Math.round(n / 100000) * 100000; };
    // Superficies grandes alargan la obra dentro del rango del tipo
    var frac = Math.min(1, s.m2 / t.m2Max);
    var sem = [t.semanas[0], Math.max(t.semanas[0] + 1, Math.round(t.semanas[0] + (t.semanas[1] - t.semanas[0]) * (0.5 + frac)))];
    return { total: total, min: r(total * (1 - Q.margen)), max: r(total * (1 + Q.margen)), lineas: lineas, semanas: sem, recargo: rec };
  }

  function nav(puede, texto) {
    return '<div class="qz-nav">' + (paso > 0 ? '<button type="button" class="qz-back">← Volver</button>' : "<span></span>") +
      '<button type="button" class="btn btn-ember qz-next"' + (puede ? "" : " disabled") + ">" + (texto || "Continuar") + "</button></div>";
  }

  function pintar(foco) {
    var total = TITULOS.length - 1, h = "";
    h += '<div class="qz-top"><span>' + (paso < total ? "Paso " + (paso + 1) + " de " + total : "Resultado") + "</span><span>" + TITULOS[paso] + "</span></div>";
    h += '<div class="qz-bar"><i style="width:' + Math.round((paso + 1) / (total + 1) * 100) + '%"></i></div>';
    if (paso === 0) {
      h += "<h3>¿Qué quieres remodelar?</h3><p class=\"qz-hint\">Elige la obra principal; los extras vienen después.</p><div class=\"opts\">" +
        Object.keys(Q.tipos).map(function (k) { var t = Q.tipos[k]; return '<button type="button" class="opt' + (s.tipo === k ? " sel" : "") + '" data-tipo="' + k + '"><b>' + t.nombre + "</b><span>" + t.desc + "</span></button>"; }).join("") + "</div>";
    } else if (paso === 1) {
      var t = Q.tipos[s.tipo];
      h += "<h3>¿Cuántos metros cuadrados?</h3><p class=\"qz-hint\">Una aproximación basta: lo medimos en la visita técnica.</p>" +
        '<div class="range-row"><label for="qM2">Superficie</label><output id="oM2">' + s.m2 + " m²</output></div>" +
        '<input type="range" id="qM2" min="2" max="' + t.m2Max + '" step="1" value="' + s.m2 + '">' +
        '<p class="note" style="margin-top:10px">Referencia: un baño típico mide 4–6 m², una cocina 8–12 m² y un dormitorio 10–12 m².</p>' + nav(true);
    } else if (paso === 2) {
      h += "<h3>¿Qué nivel de terminaciones?</h3><p class=\"qz-hint\">Define materiales, grifería e iluminación.</p><div class=\"opts\">" +
        Object.keys(Q.terminaciones).map(function (k) { var t = Q.terminaciones[k]; return '<button type="button" class="opt' + (s.term === k ? " sel" : "") + '" data-term="' + k + '"><b>' + t.nombre + "</b><span>" + t.desc + "</span></button>"; }).join("") + "</div>";
    } else if (paso === 3) {
      h += "<h3>¿Algo más?</h3><p class=\"qz-hint\">Opcional. Marca lo que también necesitas.</p><div class=\"chips\">" +
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
        '<div class="res-big"><small>Rango estimado con IVA, materiales y mano de obra</small><b>' + millones(c.min) + " – " + millones(c.max) + "</b><span>Obra de " + c.semanas[0] + " a " + c.semanas[1] + " semanas · " + esc(s.comuna) + "</span></div>" +
        '<ul class="res-list">' + c.lineas.map(function (l) { return "<li><span>" + esc(l[0]) + "</span><span>≈ " + clp(l[1]) + "</span></li>"; }).join("") +
        (c.recargo > 1 ? "<li><span>Traslado y estacionamiento en " + esc(s.comuna) + "</span><span>+" + Math.round((c.recargo - 1) * 100) + "%</span></li>" : "") + "</ul>" +
        '<div class="ia-box" id="iaBox"><b><i></i>Recomendaciones para tu obra</b><p id="iaTxt">' + (hayIA() ? "Preparando recomendaciones…" : esc(consejosLocales())) + "</p></div>" +
        '<p class="note">Estimación orientativa calculada con valores de referencia de mercado en Santiago. El precio final se define con la visita técnica sin costo y se entrega por escrito.</p>' +
        '<div class="res-acts"><a class="btn btn-ember" target="_blank" rel="noopener" href="' + wa(resumen(c)) + '">Agendar visita por WhatsApp</a><button type="button" class="btn btn-line" id="qOtra">Cotizar otra obra</button></div>';
    }
    qz.innerHTML = h;
    enlazar();
    if (paso === 6 && hayIA()) recomendacionesIA();
    if (foco) { var t1 = $("h3", qz); if (t1) { t1.tabIndex = -1; t1.focus({ preventScroll: true }); } }
  }

  function consejosLocales() {
    var tips = {
      bano: "Revisa el estado de las cañerías antes de cerrar muros: si son de fierro galvanizado, conviene cambiarlas ahora. Una ducha a ras de piso con shower door se limpia más fácil que una tina.",
      cocina: "Define primero el layout (en L, en U o con isla) y la ubicación de los enchufes. Las cubiertas de cuarzo resisten mejor las manchas que el granito claro.",
      ampliacion: "Antes de diseñar, confirma en la DOM el coeficiente de constructibilidad de tu terreno. El cálculo estructural es obligatorio para un segundo piso.",
      depto: "Revisa el reglamento de copropiedad: muchos edificios limitan horarios de ruido y exigen avisar a la administración. Pisos y pintura primero, muebles al final.",
      terraza: "Considera la orientación del sol para la pérgola y deja prevista una salida de agua y enchufes exteriores para la parrilla."
    };
    return tips[s.tipo] || "";
  }

  async function recomendacionesIA() {
    var c = calcular();
    try {
      var txt = await gemini({
        sistema: "Eres jefe de obra de una empresa de remodelaciones en Santiago de Chile. Escribes en español de Chile con tuteo. Das 2 o 3 recomendaciones prácticas y concretas (máximo 70 palabras en total, en un solo párrafo, sin markdown ni listas). No menciones precios nuevos ni inventes datos.",
        contents: [{ role: "user", parts: [{ text: "Obra: " + Q.tipos[s.tipo].nombre + ", " + s.m2 + " m², terminaciones " + Q.terminaciones[s.term].nombre + ", extras: " + (s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") || "ninguno") + ", comuna " + s.comuna + ", plazo " + s.plazo + ". Rango estimado " + millones(c.min) + " a " + millones(c.max) + "." }] }],
        temperatura: 0.6
      });
      s.ia = txt.replace(/\*\*/g, "").trim();
    } catch (e) { s.ia = consejosLocales(); }
    var p = $("#iaTxt"); if (p) p.textContent = s.ia;
  }

  function resumen(c) {
    return "¡Hola " + N.nombre + "! Soy " + s.nombre + ". Usé el cotizador de la web:\n" +
      "• Obra: " + Q.tipos[s.tipo].nombre + " (" + s.m2 + " m²)\n" +
      "• Terminaciones: " + Q.terminaciones[s.term].nombre + "\n" +
      (s.extras.length ? "• Extras: " + s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") + "\n" : "") +
      "• Comuna: " + s.comuna + " · Plazo: " + s.plazo + "\n" +
      "• Estimación: " + millones(c.min) + " – " + millones(c.max) + "\n" +
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
    if (r) r.oninput = function () { s.m2 = +r.value; $("#oM2").textContent = s.m2 + " m²"; };
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
          obra: Q.tipos[s.tipo].nombre + " · " + s.m2 + " m² · " + Q.terminaciones[s.term].nombre,
          extras: s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") || "Ninguno",
          estimacion: millones(c.min) + " – " + millones(c.max)
        });
      }
      irA(paso + 1);
    };
  }
  function elegirTipo(k) {
    if (s.tipo !== k) { s.tipo = k; s.m2 = Q.tipos[k].m2Def; }
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
  var SUGERENCIAS = ["¿Cuánto cuesta un baño?", "¿Cuánto demora la obra?", "¿Necesito permiso?", "¿Cómo se paga?"];

  var SISTEMA = [
    "Eres el asistente virtual de " + N.nombre + ", empresa de remodelaciones y ampliaciones en Santiago de Chile (comunas: " + N.zona + ").",
    "Hablas en español de Chile, con tuteo, cercano y profesional. Respuestas cortas: 2 a 4 frases, sin listas largas ni markdown.",
    "Usa SOLO esta información; si no sabes algo (precios exactos, disponibilidad, temas técnicos que no están), dilo y ofrece que el equipo lo confirme por WhatsApp. Nunca inventes datos.",
    "Servicios: remodelación de baños (2 a 3 semanas), cocinas (3 a 4 semanas), departamentos completos (5 a 8 semanas), ampliaciones y segundos pisos con permiso municipal (2 a 3 meses), terrazas y quinchos. Extras: instalación eléctrica nueva, gasfitería nueva, muebles a medida, proyecto 3D, trámite de permiso en la DOM, retiro de escombros.",
    "Forma de trabajo: presupuesto cerrado por partida, plazo por contrato con descuento por atraso, jefe de obra dedicado, fotos de avance diarias por WhatsApp, garantía escrita de 2 años, visita técnica sin costo y presupuesto en 48 horas.",
    "Oficina: " + N.oficina + ". Horario: " + N.horario + ". Email: " + N.email + ".",
    "Preguntas frecuentes:\n" + FAQS.map(function (f) { return "P: " + f.q + "\nR: " + f.a; }).join("\n"),
    "Cuando la persona muestre interés en precios o en avanzar, invítala a usar el cotizador de la página (da un rango en 60 segundos) o a agendar la visita técnica sin costo por WhatsApp."
  ].join("\n\n");

  function abrir() {
    chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none";
    if (!chatM.children.length) bot("¡Hola! 👋 Soy el asistente de " + N.nombre + ". Pregúntame lo que quieras sobre tu remodelación: precios, plazos, permisos, garantía…", { chips: true });
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
      var cot = document.createElement("button"); cot.type = "button"; cot.className = "pri"; cot.textContent = "Cotizar mi obra";
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
    if (/oficina|direccion|ubicad/.test(nq)) return "Nuestra oficina está en " + N.oficina + ". Igual vamos a tu casa para la visita técnica sin costo.";
    if (/cocina/.test(nq) && /cuest|preci|valor|sale/.test(nq)) return "Una cocina de 8 a 12 m² suele quedar entre $6 y $11 millones según muebles y cubierta, IVA incluido. El cotizador te da un rango para tu caso en 60 segundos.";
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

/* Cuarzo Piscinas (demo): animaciones, cotizador, asistente con IA y guardado de contactos. */
(function () {
  "use strict";
  var C = window.CONFIG, N = C.negocio, Q = C.cotizador;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fino = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function clp(n) { return "$" + Math.round(n).toLocaleString("es-CL"); }
  function millones(n) { return "$" + (n / 1e6).toLocaleString("es-CL", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + " M"; }
  function coma(n) { return String(n).replace(".", ","); }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Datos del negocio en la página ---------- */
  $("#cDir").textContent = N.showroom;
  $("#cHor").textContent = N.horario;
  $("#cWa").href = $("#waFab").href = wa("¡Hola " + N.nombre + "! Quiero información para construir una piscina.");

  /* ---------- Header y menú ---------- */
  var hdr = $("#hdr"), menuBtn = $("#menuBtn");
  function solid() { hdr.classList.toggle("solid", scrollY > 40 || hdr.classList.contains("open")); }
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
    // Respaldo local: nunca es el único lugar donde queda el contacto
    try { var l = JSON.parse(localStorage.getItem("cuarzo-contactos") || "[]"); l.push(datos); localStorage.setItem("cuarzo-contactos", JSON.stringify(l.slice(-20))); } catch (e) {}
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
    ok.innerHTML = "¡Gracias, " + esc(nombre.split(" ")[0]) + "! Recibimos tus datos y te escribimos por WhatsApp para coordinar la visita. " +
      '<a href="' + wa("¡Hola! Soy " + nombre + ", de " + f.comuna.value + ". Quiero agendar una visita sin costo. " + f.mensaje.value.trim()) + '" target="_blank" rel="noopener" style="color:var(--aqua-2);font-weight:700">Adelantar por WhatsApp →</a>';
    ok.style.display = "block";
    f.querySelector("button[type=submit]").disabled = true;
  });

  /* ---------- Cotizador ---------- */
  var COMUNAS = ["Las Condes", "Vitacura", "Lo Barnechea", "La Dehesa", "Chicureo", "Colina", "La Reina", "Providencia", "Otra"];
  var PLAZOS = ["Este verano", "En 3 a 6 meses", "Próxima temporada", "Solo estoy cotizando"];
  var s = { tipo: null, largo: 8, ancho: 4, prof: 1.4, term: null, extras: [], comuna: "Las Condes", plazo: null, foto: null, ia: null, nombre: "", email: "", tel: "" };
  var paso = 0, qz = $("#qz");
  var TITULOS = ["Tipo de piscina", "Medidas", "Terminaciones", "Extras", "Tu patio", "Tus datos", "Tu estimación"];

  function calcular() {
    var t = Q.tipos[s.tipo], area = s.largo * s.ancho, vol = area * s.prof;
    var piscina = area * t.m2 * (1 + (s.prof - 1.4) * Q.factorProfundidad) + Q.obraBase + (t.fijo || 0);
    piscina *= Q.terminaciones[s.term].factor;
    var lineas = [[t.nombre + " " + coma(s.largo) + " × " + coma(s.ancho) + " m · " + Q.terminaciones[s.term].nombre, piscina]];
    var total = piscina;
    s.extras.forEach(function (k) { lineas.push([Q.extras[k].nombre, Q.extras[k].precio]); total += Q.extras[k].precio; });
    var rec = Q.comunasRecargo[s.comuna] || 1;
    if (rec > 1) { lineas.push(["Acceso y pendiente en " + s.comuna, total * (rec - 1)]); total *= rec; }
    var r = function (n) { return Math.round(n / 100000) * 100000; };
    return { area: area, litros: Math.round(vol * 1000), total: total, min: r(total * (1 - Q.margen)), max: r(total * (1 + Q.margen)),
      semanas: t.semanas, mant: Math.round((Q.mantencionBase + vol * Q.mantencionM3) / 1000) * 1000, lineas: lineas };
  }

  function nav(puede, texto) {
    return '<div class="qz-nav">' + (paso ? '<button type="button" class="back" data-back>← Volver</button>' : "<span></span>") +
      '<button type="button" class="btn btn-pri" data-next' + (puede ? "" : " disabled") + ">" + (texto || "Siguiente") + ' <svg aria-hidden="true"><use href="#i-arrow"/></svg></button></div>';
  }

  function pintar(dir) {
    var html = "", total = TITULOS.length - 1;
    var top = '<div class="qz-top"><span>' + (paso < total ? "PASO " + (paso + 1) + " DE " + total : "RESULTADO") + "</span><span>" + TITULOS[paso] + '</span></div><div class="qz-bar"><i style="width:' + Math.round(paso / total * 100) + '%"></i></div>';

    if (paso === 0) {
      html = "<h3>¿Qué piscina sueñas?</h3><p class='hint'>Elige el tipo de construcción. Si no sabes, elige hormigón: lo vemos juntos en la visita.</p><div class='opts'>" +
        Object.keys(Q.tipos).map(function (k) { var t = Q.tipos[k]; return '<button type="button" class="opt' + (s.tipo === k ? " sel" : "") + '" data-tipo="' + k + '"><b>' + t.nombre + "</b><span>" + t.desc + "</span><small>Obra de " + t.semanas[0] + " a " + t.semanas[1] + " semanas</small></button>"; }).join("") +
        "</div>" + nav(!!s.tipo);
    } else if (paso === 1) {
      var t = Q.tipos[s.tipo], maxL = t.max ? t.max[0] : 16, maxA = t.max ? t.max[1] : 8;
      s.largo = Math.min(s.largo, maxL); s.ancho = Math.min(s.ancho, maxA);
      html = "<h3>¿De qué tamaño?</h3><p class='hint'>Una piscina familiar típica mide 8 × 4 m. Mueve las barras y mira cómo cambia.</p>" +
        '<div class="dims"><div>' +
        rango("largo", "Largo", 3, maxL, 0.5, s.largo, " m") + rango("ancho", "Ancho", 2, maxA, 0.5, s.ancho, " m") + rango("prof", "Profundidad promedio", 1, 2.2, 0.1, s.prof, " m") +
        '<div class="facts"><span id="fArea"></span><span id="fLit"></span></div>' + (t.max ? '<p class="hint" style="margin:12px 0 0">La fibra de vidrio viene hasta ' + t.max[0] + " × " + String(t.max[1]).replace(".", ",") + " m.</p>" : "") +
        '</div><div class="pool-view" aria-hidden="true"><div class="pool" id="pv"></div><div class="meta" id="pvm"></div></div></div>' + nav(true);
    } else if (paso === 2) {
      html = "<h3>¿Qué terminaciones?</h3><p class='hint'>Definen el revestimiento, los bordes y el nivel de detalle.</p><div class='opts' style='grid-template-columns:1fr'>" +
        Object.keys(Q.terminaciones).map(function (k) { var t = Q.terminaciones[k]; return '<button type="button" class="opt' + (s.term === k ? " sel" : "") + '" data-term="' + k + '"><b>' + t.nombre + "</b><span>" + t.desc + "</span></button>"; }).join("") +
        "</div>" + nav(!!s.term);
    } else if (paso === 3) {
      html = "<h3>¿Algún extra?</h3><p class='hint'>Opcional. Puedes elegir varios o ninguno.</p><div class='chips'>" +
        Object.keys(Q.extras).map(function (k) { return '<button type="button" class="chip' + (s.extras.indexOf(k) >= 0 ? " sel" : "") + '" data-extra="' + k + '" aria-pressed="' + (s.extras.indexOf(k) >= 0) + '">' + Q.extras[k].nombre + "</button>"; }).join("") +
        "</div>" + nav(true);
    } else if (paso === 4) {
      html = "<h3>Tu patio</h3><p class='hint'>¿Dónde sería la obra y para cuándo la quieres?</p>" +
        '<div class="field"><label for="qComuna">Comuna</label><select class="inp" id="qComuna">' + COMUNAS.map(function (c) { return "<option" + (c === s.comuna ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></div>" +
        '<div class="field"><label>¿Para cuándo?</label><div class="chips">' + PLAZOS.map(function (p) { return '<button type="button" class="chip' + (s.plazo === p ? " sel" : "") + '" data-plazo="' + p + '">' + p + "</button>"; }).join("") + "</div></div>" +
        '<div class="field"><label>Foto de tu patio <span style="color:var(--muted);font-weight:500">(opcional)</span></label>' +
        '<label class="drop" for="qFoto">' + (s.foto ? '<img src="' + s.foto.url + '" alt="Foto de tu patio">' : '<span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>') +
        "<div><b>" + (s.foto ? "Cambiar foto" : "Sube una foto y la IA analiza tu espacio") + "</b><span>" + (hayIA() ? "Te recomienda tamaño, tipo y ubicación ideal." : "La revisamos en la visita técnica.") + "</span></div></label>" +
        '<input type="file" id="qFoto" accept="image/*" hidden><div class="ai-out' + (s.ia ? " on" : "") + '" id="qIA">' + (s.ia ? iaHTML() : "") + "</div></div>" + nav(!!s.plazo);
    } else if (paso === 5) {
      html = "<h3>¿A dónde te enviamos la estimación?</h3><p class='hint'>Te mostramos el resultado al instante y te lo dejamos por escrito.</p>" +
        '<div class="field"><label for="qNom">Nombre</label><input class="inp" id="qNom" autocomplete="name" value="' + esc(s.nombre) + '"></div>' +
        '<div class="two"><div class="field"><label for="qMail">Email</label><input class="inp" id="qMail" type="email" inputmode="email" autocomplete="email" value="' + esc(s.email) + '"></div>' +
        '<div class="field"><label for="qTel">WhatsApp</label><input class="inp" id="qTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="+56 9" value="' + esc(s.tel) + '"></div></div>' +
        '<label class="check"><input type="checkbox" id="qOk"' + (s.ok ? " checked" : "") + "> Acepto que " + N.nombre + " me contacte por email o WhatsApp con mi cotización.</label>" +
        '<p class="err" id="qErr" role="alert"></p>' + nav(true, "Ver mi estimación");
    } else {
      var c = calcular();
      html = "<h3>" + esc(s.nombre.split(" ")[0]) + ", tu piscina costaría entre</h3>" +
        '<div class="res-price">' + millones(c.min) + " y " + millones(c.max) + "<small>IVA incluido · " + clp(c.min) + " – " + clp(c.max) + "</small></div>" +
        '<div class="res-grid"><div><b>' + String(c.area).replace(".", ",") + ' m²</b><span>de espejo de agua</span></div><div><b>' + c.litros.toLocaleString("es-CL") + '</b><span>litros</span></div><div><b>' + c.semanas[0] + "–" + c.semanas[1] + ' sem.</b><span>de obra</span></div></div>' +
        '<ul class="res-list">' + c.lineas.map(function (l) { return "<li><span>" + esc(l[0]) + "</span><span>≈ " + clp(l[1]) + "</span></li>"; }).join("") +
        "<li><span>Mantención en temporada</span><span>≈ " + clp(c.mant) + "/mes</span></li></ul>" +
        (s.ia ? '<div class="ai-out on" style="margin-top:14px">' + iaHTML(true) + "</div>" : "") +
        '<p class="disclaimer"><b>Estimación orientativa</b> en base a valores de referencia de Santiago oriente. El precio final y cerrado se define después de la visita técnica sin costo (suelo, accesos, pendiente e instalaciones).</p>' +
        '<div class="qz-nav"><button type="button" class="back" data-back>← Ajustar</button><a class="btn btn-pri" target="_blank" rel="noopener" href="' + wa(resumen(c)) + '"><svg aria-hidden="true"><use href="#i-wa"/></svg> Agendar visita sin costo</a></div>';
    }
    qz.innerHTML = top + '<div class="qz-step on">' + html + "</div>";
    if (dir && innerWidth < 980) qz.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    enlazar();
  }

  function rango(id, label, min, max, step, val, suf) {
    return '<div class="rng"><label for="r-' + id + '">' + label + ' <output id="o-' + id + '">' + String(val).replace(".", ",") + suf + '</output></label><input type="range" id="r-' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></div>';
  }

  function vista() {
    var pv = $("#pv"); if (!pv) return;
    // A escala dentro del recuadro: 16 m de largo ocupan el 88% del ancho
    pv.style.width = (s.largo / 16 * 88) + "%";
    pv.style.height = (s.ancho / 16 * 88) + "%";
    var area = s.largo * s.ancho;
    $("#pvm").textContent = String(s.largo).replace(".", ",") + " × " + String(s.ancho).replace(".", ",") + " m";
    $("#fArea").textContent = area.toLocaleString("es-CL") + " m²";
    $("#fLit").textContent = Math.round(area * s.prof * 1000).toLocaleString("es-CL") + " litros";
  }

  function iaHTML(corto) {
    var a = s.ia;
    if (a.error) return "No pudimos analizar la foto esta vez. La revisamos en la visita técnica.";
    return "<b>✨ Análisis de tu patio con IA</b><br>" + esc(a.observaciones) +
      (a.largo && a.ancho ? "<br><b>Recomendación:</b> " + esc(Q.tipos[a.tipo] ? Q.tipos[a.tipo].nombre : "Hormigón armado") + " de " + String(a.largo).replace(".", ",") + " × " + String(a.ancho).replace(".", ",") + " m." +
        (corto ? "" : ' <button type="button" class="chip" data-usar style="margin-top:10px">Usar estas medidas</button>') : "");
  }

  function resumen(c) {
    return "¡Hola " + N.nombre + "! Soy " + s.nombre + ". Usé el cotizador de la web:\n" +
      "• " + Q.tipos[s.tipo].nombre + " de " + coma(s.largo) + " × " + coma(s.ancho) + " m (prof. " + coma(s.prof) + " m)\n" +
      "• Terminación " + Q.terminaciones[s.term].nombre + "\n" +
      (s.extras.length ? "• Extras: " + s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") + "\n" : "") +
      "• Comuna: " + s.comuna + " · " + s.plazo + "\n" +
      "• Estimación: " + millones(c.min) + " a " + millones(c.max) + "\n" +
      "Quiero agendar la visita técnica sin costo.";
  }

  async function analizarFoto(file) {
    var url = URL.createObjectURL(file);
    var b64 = await achicar(file);
    s.foto = { url: url }; s.ia = null;
    pintar();
    if (!hayIA()) return;
    var out = $("#qIA"); out.classList.add("on");
    out.innerHTML = '<span class="spin"></span> Analizando tu patio…';
    try {
      var t = await gemini({
        json: true, temperatura: 0.3,
        sistema: "Eres un arquitecto especialista en piscinas residenciales en Santiago de Chile. Analizas fotos de patios. Responde SOLO JSON.",
        contents: [{ role: "user", parts: [
          { inline_data: { mime_type: "image/jpeg", data: b64 } },
          { text: 'Analiza esta foto de un patio para construir una piscina. Responde JSON con: {"es_patio": boolean, "largo": número en metros (múltiplo de 0.5, entre 3 y 14), "ancho": número en metros (múltiplo de 0.5, entre 2 y 6), "tipo": "hormigon"|"fibra"|"infinito"|"spa", "observaciones": "2 frases en español de Chile (tuteo) sobre el espacio disponible, la mejor ubicación (sol, árboles, accesos, pendiente) y por qué ese tipo"}. Si no es un patio o exterior, es_patio=false y observaciones explica que la foto no muestra un patio. Sé prudente con las medidas: es una estimación visual.' }
        ] }]
      });
      var a = JSON.parse(t.replace(/^```json|```$/g, "").trim());
      if (!a.es_patio) { a.largo = a.ancho = null; }
      s.ia = a;
    } catch (e) { s.ia = { error: true }; }
    if (paso === 4) { $("#qIA").innerHTML = iaHTML(); enlazar(); }
  }

  // Foto reducida a 1024 px para enviarla rápido a la IA
  function achicar(file) {
    return new Promise(function (ok, mal) {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1024 / Math.max(img.width, img.height));
        var cv = document.createElement("canvas"); cv.width = img.width * k; cv.height = img.height * k;
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        ok(cv.toDataURL("image/jpeg", 0.82).split(",")[1]);
      };
      img.onerror = mal; img.src = URL.createObjectURL(file);
    });
  }

  function enlazar() {
    var next = $("[data-next]", qz), back = $("[data-back]", qz);
    if (back) back.onclick = function () { paso = paso === 6 ? 5 : paso - 1; pintar(true); };
    $$("[data-tipo]", qz).forEach(function (b) { b.onclick = function () { s.tipo = b.dataset.tipo; paso = 1; pintar(true); }; });
    $$("[data-term]", qz).forEach(function (b) { b.onclick = function () { s.term = b.dataset.term; paso = 3; pintar(true); }; });
    $$("[data-extra]", qz).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.extra, i = s.extras.indexOf(k);
        if (i >= 0) s.extras.splice(i, 1); else s.extras.push(k);
        b.classList.toggle("sel", i < 0); b.setAttribute("aria-pressed", i < 0);
      };
    });
    $$("[data-plazo]", qz).forEach(function (b) {
      b.onclick = function () { s.plazo = b.dataset.plazo; $$("[data-plazo]", qz).forEach(function (x) { x.classList.toggle("sel", x === b); }); next.disabled = false; };
    });
    ["largo", "ancho", "prof"].forEach(function (k) {
      var r = $("#r-" + k, qz); if (!r) return;
      r.oninput = function () { s[k] = +r.value; $("#o-" + k).textContent = String(s[k]).replace(".", ",") + " m"; vista(); };
    });
    vista();
    var com = $("#qComuna", qz); if (com) com.onchange = function () { s.comuna = com.value; };
    var foto = $("#qFoto", qz); if (foto) foto.onchange = function () { if (foto.files[0]) analizarFoto(foto.files[0]); };
    var usar = $("[data-usar]", qz);
    if (usar) usar.onclick = function () { s.largo = s.ia.largo; s.ancho = s.ia.ancho; if (Q.tipos[s.ia.tipo]) s.tipo = s.ia.tipo; usar.textContent = "✓ Medidas aplicadas"; usar.disabled = true; };
    if (next) next.onclick = function () {
      if (paso === 5) {
        s.nombre = $("#qNom").value.trim(); s.email = $("#qMail").value.trim(); s.tel = $("#qTel").value.trim(); s.ok = $("#qOk").checked;
        var err = $("#qErr");
        if (!s.nombre) { err.textContent = "Cuéntanos tu nombre."; $("#qNom").focus(); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) { err.textContent = "Revisa tu email."; $("#qMail").focus(); return; }
        if (s.tel.replace(/\D/g, "").length < 8) { err.textContent = "Revisa tu número de WhatsApp."; $("#qTel").focus(); return; }
        if (!s.ok) { err.textContent = "Necesitamos tu autorización para enviarte la cotización."; return; }
        var c = calcular();
        guardarContacto({ origen: "Cotizador", nombre: s.nombre, email: s.email, telefono: s.tel, comuna: s.comuna, plazo: s.plazo,
          piscina: Q.tipos[s.tipo].nombre + " " + s.largo + "×" + s.ancho + " m, prof. " + s.prof + " m, " + Q.terminaciones[s.term].nombre,
          extras: s.extras.map(function (k) { return Q.extras[k].nombre; }).join(", ") || "Ninguno",
          estimacion: clp(c.min) + " – " + clp(c.max), analisis_ia: s.ia && !s.ia.error ? s.ia.observaciones : "" });
      }
      paso++; pintar(true);
    };
  }
  pintar();

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), chatM = $("#chatM"), chatI = $("#chatI"), fab = $("#aiFab"), historial = [];
  var FAQS = $$("#faq details").map(function (d) { return { q: d.querySelector("summary").textContent.trim(), a: d.querySelector("p").textContent.trim() }; });
  var SUGERENCIAS = ["¿Cuánto cuesta una piscina?", "¿Cuánto demora la obra?", "¿Hormigón o fibra?", "¿Necesito permiso?"];

  var SISTEMA = [
    "Eres el asistente virtual de " + N.nombre + ", empresa que diseña y construye piscinas residenciales en " + N.zona + ", Chile.",
    "Hablas en español de Chile, con tuteo, cálido y profesional. Respuestas cortas: 2 a 4 frases, sin listas largas ni markdown.",
    "Usa SOLO esta información; si no sabes algo (precios exactos, disponibilidad, datos técnicos que no están), dilo y ofrece que el equipo lo confirme por WhatsApp. Nunca inventes datos.",
    "Servicios: piscinas de hormigón armado a medida, fibra de vidrio (hasta 10 × 4,5 m), borde infinito, piscina con spa, climatización con bomba de calor, iluminación LED, cascadas, cubiertas automáticas, deck, robot limpiafondos y control desde el celular. Proyecto 3D antes de construir, presupuesto cerrado, plazos por contrato, mantención del primer verano incluida.",
    "Showroom: " + N.showroom + ". Horario: " + N.horario + ". Visita técnica sin costo.",
    "Preguntas frecuentes:\n" + FAQS.map(function (f) { return "P: " + f.q + "\nR: " + f.a; }).join("\n"),
    "Cuando la persona muestre interés en precio o en avanzar, invítala a usar el cotizador de la página (da un rango en 60 segundos) o a agendar la visita técnica sin costo por WhatsApp."
  ].join("\n\n");

  function abrir() {
    chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none";
    if (!chatM.children.length) bot("¡Hola! 👋 Soy el asistente de " + N.nombre + ". Pregúntame lo que quieras sobre tu futura piscina: precios, plazos, permisos, mantención…", { chips: true });
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
      var cot = document.createElement("button"); cot.type = "button"; cot.className = "pri"; cot.textContent = "Cotizar mi piscina";
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
    var syn = { cuest: "cuest", preci: "cuest", valor: "cuest", sale: "cuest", demor: "demor", tarda: "demor", plazo: "demor", tiemp: "demor", permi: "permi", munic: "permi", pagar: "paga", pago: "paga", cuota: "paga", fibra: "fibra", hormi: "fibra", mante: "mante", garan: "garan", comun: "comun", zona: "comun", donde: "comun" };
    var mejor = null, pts = 0;
    FAQS.forEach(function (f) {
      var fw = n(f.q).split(/\s+/).map(raiz), fa = n(f.a).split(/\s+/).map(raiz), p = 0;
      ws.forEach(function (w) { var w2 = syn[w] || w; if (fw.some(function (x) { return x === w || (syn[x] || x) === w2; })) p += 2; else if (fa.indexOf(w) >= 0) p += 0.5; });
      if (p > pts) { pts = p; mejor = f; }
    });
    if (/horari|abren|atienden/.test(n(q))) return "Atendemos de " + N.horario.charAt(0).toLowerCase() + N.horario.slice(1) + ". La visita técnica es sin costo y la coordinamos según tu disponibilidad.";
    if (/showroom|direccion|ubicad|oficina/.test(n(q))) return "Nuestro showroom está en " + N.showroom + ". Igual vamos a tu casa para la visita técnica sin costo.";
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
    tl.from(".hero-bg img", { scale: 1.22, duration: 2.2, ease: "power2.out" }, 0)
      .from(".hero h1 .ln > span", { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.15)
      .from(".hero-in", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.5)
      .from(".hero-card", { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.7)
      .add(function () { contar(); }, 0.9);
    gsap.to(".hero-bg", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".caustics", { xPercent: -6, yPercent: 4, scale: 1.1, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });
    // Entradas escalonadas
    ST.batch(".rv", { start: "top 88%", once: true, onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true }); } });
    // Línea de progreso de "Cómo trabajamos"
    var vertical = innerWidth <= 900;
    gsap.to(".steps-line i", { [vertical ? "scaleY" : "scaleX"]: 1, ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 60%", scrub: true } });
    // Parallax de las fotos de proyectos
    $$(".ph img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    addEventListener("load", function () { ST.refresh(); });
  }
  function contar(directo) {
    $$("[data-count]").forEach(function (el) {
      var fin = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.textContent.replace(/^[+\d.,\s]+/, "");
      suf = suf ? " " + suf.trim() : "";
      if (directo || !window.gsap) { el.textContent = pre + fin + suf; return; }
      var o = { v: 0 };
      window.gsap.to(o, { v: fin, duration: 1.8, ease: "power2.out", onUpdate: function () { el.textContent = pre + Math.round(o.v) + suf; } });
    });
  }
  // Tarjetas que se inclinan con el mouse
  if (fino && !reduce) $$(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 7) + "deg) rotateY(" + ((x - 0.5) * 9) + "deg) translateY(-4px)";
      c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });
  if (window.gsap && window.ScrollTrigger) animar();
  else addEventListener("load", animar);
  // Si las librerías no cargan, el contenido igual queda visible
  setTimeout(function () { if (!window.gsap) document.documentElement.classList.remove("js"); }, 4000);
})();

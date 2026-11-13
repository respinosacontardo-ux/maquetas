/* KASSE Reformas Integrales (boceto): proyectos, calculadora de reformas, asistente con IA, contactos y animaciones. */
(function () {
  var C = window.CONFIG, N = C.negocio, PR = C.presupuesto;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || /estatico/.test(location.search);

  function eur(n) { return Math.round(n / 100) * 100 >= 1000 ? (Math.round(n / 100) * 100).toLocaleString("es-ES") + " €" : Math.round(n) + " €"; }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Básicos ---------- */
  function enlazarWA(scope) { $$("[data-wa]", scope).forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; }); }
  enlazarWA();
  $("#cZona").textContent = N.zona + ": " + N.pueblos;
  $("#cHor").textContent = N.horario;
  var zonas = ["Tarragona", "Salou", "La Pineda", "Albiol", "Vila-seca", "Reus", "Cambrils", "Baños", "Cocinas", "Masías", "Exteriores"];
  $("#ribbon").innerHTML = zonas.concat(zonas).map(function (z) { return "<span>" + z + "</span>"; }).join("");

  var hdr = $("#hdr"), burger = $("#burger");
  function solid() { hdr.classList.toggle("solid", scrollY > 10 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  burger.addEventListener("click", function () { var o = hdr.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.textContent = o ? "Cerrar" : "Menú"; solid(); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); burger.setAttribute("aria-expanded", false); burger.textContent = "Menú"; solid(); }); });

  /* ---------- Proyectos (fotos de @kasse_reformas) ---------- */
  var PROY = [
    { f: "bano-marmol", cat: "banos", lugar: "Baño", t: "Baño de mármol con techo de luz", p: "Porcelánico efecto mármol de suelo a techo, ducha a ras de suelo con rociador de techo, inodoro suspendido y un techo de luz que lo ilumina todo. Los detalles sobre el mármol son pura terapia.", big: true },
    { f: "bano-adaptado", cat: "banos", lugar: "Baño adaptado", t: "Una sorpresa para volver a casa", p: "Para una familia amiga de hace más de 30 años: barras de apoyo en la ducha y el lavabo para prevenir caídas y ganar autonomía, con las vigas originales a la vista." },
    { f: "bano-salou", cat: "banos", lugar: "Salou", t: "El arte de lo esencial", p: "Un baño en Salou transformado con microcemento, ducha de obra con hornacina y suelo hidráulico en blanco y negro. Constancia, cero excusas y mucho corazón." },
    { f: "salon", cat: "interiores", lugar: "Reforma integral", t: "De la obra a un hogar", p: "Paredes alisadas, suelo laminado en roble claro y electricidad renovada. De un espacio en obra a la calidez de un verdadero hogar." },
    { f: "masia-arbol", cat: "rehab", lugar: "Masía de Alfred", t: "El desafío de 6 toneladas", p: "Un árbol de seis toneladas cayó sobre la masía. Saneamos, reconstruimos y estabilizamos la estructura. Ver la satisfacción de Alfred al recuperar su hogar es nuestra mejor recompensa.", big: true },
    { f: "aseo-exterior", cat: "exteriores", lugar: "Masía", t: "Aseo exterior en el campo", p: "Construcción nueva con acabado en mortero, teja árabe y puerta metálica, integrada entre los olivos. De vuelta a la masía de Alfred, siempre con soluciones de calidad." },
    { f: "cobertizo", cat: "exteriores", lugar: "Terraza", t: "Cobertizo de madera", p: "Para una clienta fiel: cobertizo de madera tratada con barniz de exterior y cubierto para proteger del sol y la lluvia. Ideal para herramientas o un rincón al aire libre." },
    { f: "pista-albiol", cat: "exteriores", lugar: "Albiol", t: "Rehabilitación de pista", p: "Las raíces habían levantado el suelo. Reutilizamos las losas, nivelamos, reforzamos la base con piedra y hormigón armado y rejuntamos en el color elegido por el cliente." },
    { f: "cerramiento", cat: "exteriores", lugar: "Finca", t: "Cerramiento de acero", p: "Murete de bloque y malla de acero galvanizado con postes reforzados: un cambio radical en seguridad para toda la finca." }
  ];
  var CATS = [["todo", "Todos"], ["banos", "Baños"], ["interiores", "Interiores"], ["rehab", "Rehabilitación"], ["exteriores", "Exteriores"]], cat = "todo", listos = false;
  function pintarProy() {
    var l = PROY.filter(function (x) { return cat === "todo" || x.cat === cat; });
    $("#grid").innerHTML = l.map(function (x) {
      return '<figure class="pj' + (x.big && cat === "todo" ? " big" : "") + '" tabindex="0" data-f="' + x.f + '"><img src="img/' + x.f + '.jpg" alt="' + esc(x.t) + '" loading="lazy"><figcaption><small>' + esc(x.lugar) + "</small><b>" + esc(x.t) + "</b></figcaption></figure>";
    }).join("");
    $$(".pj").forEach(function (el) {
      el.onclick = function () { abrirLB(el.dataset.f); };
      el.onkeydown = function (e) { if (e.key === "Enter") abrirLB(el.dataset.f); };
    });
    if (window.gsap && !reduced && listos) gsap.fromTo(".pj", { opacity: 0, y: 40, rotateX: 12, transformPerspective: 1000 }, { opacity: 1, y: 0, rotateX: 0, duration: .8, stagger: .06, ease: "power3.out", clearProps: "transform" });
  }
  $("#filters").innerHTML = CATS.map(function (c) { return '<button type="button" class="fbtn' + (c[0] === cat ? " on" : "") + '" data-c="' + c[0] + '">' + c[1] + "</button>"; }).join("");
  $$("#filters .fbtn").forEach(function (b) { b.onclick = function () { cat = b.dataset.c; $$("#filters .fbtn").forEach(function (x) { x.classList.toggle("on", x === b); }); pintarProy(); }; });
  pintarProy();
  var lb = $("#lb");
  function abrirLB(f) {
    var x = PROY.filter(function (p) { return p.f === f; })[0]; if (!x) return;
    $("#lbI").src = "img/" + x.f + ".jpg"; $("#lbI").alt = x.t; $("#lbT").textContent = x.lugar; $("#lbH").textContent = x.t; $("#lbP").textContent = x.p;
    lb.classList.add("on");
  }
  $("#lbX").onclick = function () { lb.classList.remove("on"); };
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });

  /* ---------- Preguntas frecuentes ---------- */
  var FAQ = [
    ["¿La visita y el presupuesto tienen coste?", "No. Vamos a tu casa, medimos y te enviamos un presupuesto desglosado partida por partida, sin coste ni compromiso.", ["visita", "coste", "cobra", "gratis", "presupuesto", "compromiso"]],
    ["¿Cuánto tarda una reforma?", "Depende del trabajo: un baño suele llevar de 2 a 3 semanas, una cocina de 3 a 4 y un piso completo de 2 a 3 meses. Te damos el calendario por escrito antes de empezar.", ["tarda", "plazo", "semanas", "tiempo", "cuando", "cuánto dura", "dura"]],
    ["¿En qué zonas trabajáis?", "En toda la provincia de Tarragona: Tarragona, Salou, La Pineda, Vila-seca, Reus, Cambrils, Albiol y alrededores. Para otras zonas, consúltanos.", ["zona", "donde", "dónde", "pueblo", "salou", "reus", "cambrils", "tarragona", "albiol", "pineda"]],
    ["¿Os encargáis de los permisos?", "Te orientamos sobre la licencia o comunicación de obra que pide tu ayuntamiento y te preparamos la documentación técnica que haga falta.", ["permiso", "licencia", "ayuntamiento", "papeles", "tramite", "trámite"]],
    ["¿Cómo se paga la obra?", "Lo habitual es pagar por fases según avanza la obra, siempre contra presupuesto firmado. Nada de pagos sorpresa al final.", ["pago", "pagar", "fases", "adelanto", "señal", "factura"]],
    ["¿Hacéis también masías y casas antiguas?", "Sí. Saneamos, reforzamos estructuras, rehacemos tejados y fachadas, respetando las vigas y los materiales originales siempre que se puede.", ["masia", "masía", "antigua", "tejado", "estructura", "fachada", "viga"]],
    ["¿Puedo seguir viviendo en casa durante la obra?", "En baños y cocinas, normalmente sí: organizamos la obra por zonas, protegemos lo que no se toca y limpiamos cada día. En una reforma integral te recomendamos salir unas semanas.", ["vivir", "casa durante", "mudar", "polvo", "ruido", "limpieza"]],
    ["¿Tenéis garantía?", "Sí. Te damos garantía por escrito de nuestro trabajo y respondemos después de la entrega.", ["garantia", "garantía", "problema", "despues", "después"]]
  ];
  $("#faq").innerHTML = FAQ.map(function (f, i) {
    return '<div class="fq rv"><button aria-expanded="false" aria-controls="fa' + i + '">' + esc(f[0]) + '<i></i></button><div class="fa" id="fa' + i + '"><div><p>' + esc(f[1]) + "</p></div></div></div>";
  }).join("");
  $$(".fq button").forEach(function (b) {
    b.addEventListener("click", function () {
      var q = b.parentNode, o = !q.classList.contains("open");
      $$(".fq.open").forEach(function (x) { x.classList.remove("open"); x.firstChild.setAttribute("aria-expanded", false); });
      q.classList.toggle("open", o); b.setAttribute("aria-expanded", o);
    });
  });

  /* ---------- IA (Gemini) ---------- */
  function hayIA() { return !!(C.gemini && C.gemini.clave); }
  function gemini(contents, sistema) {
    var modelos = C.gemini.modelos.slice();
    function probar() {
      var m = modelos.shift();
      if (!m) return Promise.reject(new Error("sin modelos"));
      var body = { contents: contents, systemInstruction: { parts: [{ text: sistema }] }, generationConfig: { temperature: 0.5, maxOutputTokens: 500 } };
      return fetch("https://generativelanguage.googleapis.com/v1beta/models/" + m + ":generateContent?key=" + C.gemini.clave, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { var t = j.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join(""); if (!t) throw new Error("vacío"); return t; })
        .catch(function (e) { if (modelos.length) return probar(); throw e; });
    }
    return probar();
  }

  /* ---------- Contactos ---------- */
  function guardarContacto(datos) {
    datos.fecha = new Date().toISOString(); datos.origen = N.nombre + " (web)";
    try {
      if (C.contactos.appsScriptUrl) return fetch(C.contactos.appsScriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
      if (C.contactos.formsubmitEmail) return fetch("https://formsubmit.co/ajax/" + C.contactos.formsubmitEmail, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
    } catch (e) {}
    return Promise.resolve(false);
  }
  function telOk(t) { return String(t).replace(/\D/g, "").length >= 9; }

  /* ---------- Calculadora de reformas (4 pasos) ---------- */
  var TIPOS = Object.keys(PR.tipos).map(function (k) { return [k, PR.tipos[k].nombre]; });
  var SUBT = { bano: "Ducha, alicatado, sanitarios", cocina: "Muebles, encimera, instalaciones", integral: "Piso o casa completa", rehab: "Estructura, tejado, fachada", exterior: "Cobertizo, pista, cerramiento" };
  var ESTADOS = [["bien", "Bien, solo actualizar"], ["regular", "Regular, algo deteriorado"], ["mal", "Mal: humedad o daños"]];
  var CALIDADES = [["basica", "Básica", "Buena relación calidad-precio"], ["media", "Media", "Lo que más se pide"], ["alta", "Alta", "Materiales premium"]];
  var tool = $("#tool"), paso = 1, S = { tipo: null, m2: null, estado: "regular", calidad: "media", pueblo: "", nombre: "", tel: "" };

  function calc() {
    var t = PR.tipos[S.tipo], base = Math.max(t.eurM2[S.calidad] * S.m2, t.minimo[S.calidad]) * PR.estado[S.estado];
    var sem = t.semanas;
    if (S.tipo === "integral" || S.tipo === "rehab") { var f = Math.min(1, Math.max(0, (S.m2 - t.m2[0]) / (t.m2[1] - t.m2[0]))); sem = [Math.round(lerp(sem[0], sem[1], f * .6)), Math.round(lerp(sem[0] + 2, sem[1], f))]; }
    return { min: base * (1 - PR.margen), max: base * (1 + PR.margen), sem: sem };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function opts(nombre, lista, valor, sub) {
    return '<div class="opts">' + lista.map(function (x) {
      return '<button type="button" class="opt' + (valor === x[0] ? " sel" : "") + '" data-' + nombre + '="' + esc(x[0]) + '"><b>' + esc(x[1]) + "</b><span>" + esc(sub ? sub[x[0]] : x[2] || "") + "</span></button>";
    }).join("") + "</div>";
  }
  function chips(nombre, lista, valor) {
    return '<div class="chips">' + lista.map(function (x) { return '<button type="button" class="chip' + (valor === x[0] ? " sel" : "") + '" data-' + nombre + '="' + esc(x[0]) + '">' + esc(x[1]) + "</button>"; }).join("") + "</div>";
  }
  function navBtns(puede, texto) {
    return '<div class="tool-nav">' + (paso > 1 ? '<button type="button" class="btn btn-g" data-atras>‹ Volver</button>' : "<span></span>") +
      '<button type="button" class="btn btn-p" data-sig' + (puede ? "" : " disabled") + ">" + texto + "</button></div>";
  }
  function cabecera(titulo, sub) {
    return '<div class="prog"><i style="width:' + (paso * 25) + '%"></i></div><p class="pstep">Paso ' + Math.min(paso, 4) + " de 4</p><h3>" + titulo + '</h3><p class="sub">' + sub + "</p>";
  }
  function pintar() {
    var h = "", t = S.tipo && PR.tipos[S.tipo];
    if (paso === 1) {
      h = cabecera("¿Qué quieres reformar?", "Elige el tipo de obra.") + opts("tipo", TIPOS, S.tipo, SUBT) + navBtns(!!S.tipo, "Siguiente");
    } else if (paso === 2) {
      if (S.m2 == null || S.m2 < t.m2[0] || S.m2 > t.m2[1]) S.m2 = t.m2[2];
      h = cabecera("¿Cuántos metros tiene?", "Una medida aproximada es suficiente.") +
        '<div class="rngv"><span>' + t.m2[0] + ' m²</span><b id="m2V">' + S.m2 + ' m²</b><span>' + t.m2[1] + " m²</span></div>" +
        '<input class="rng" id="pM2" type="range" min="' + t.m2[0] + '" max="' + t.m2[1] + '" step="1" value="' + S.m2 + '" aria-label="Metros cuadrados">' +
        '<p class="qlabel" style="margin-top:22px">¿Cómo está hoy?</p>' + chips("estado", ESTADOS, S.estado) + navBtns(true, "Siguiente");
    } else if (paso === 3) {
      h = cabecera("¿Qué acabados buscas?", "Influye en el precio de materiales y sanitarios.") + opts("calidad", CALIDADES, S.calidad) +
        '<label class="fld" style="margin-top:18px"><span>Pueblo o ciudad de la obra</span><input id="pPue" placeholder="Ej.: Salou" value="' + esc(S.pueblo) + '"></label>' + navBtns(true, "Siguiente");
    } else if (paso === 4) {
      h = cabecera("¿A dónde te enviamos el resultado?", "Te mostramos la estimación y te escribimos para la visita sin coste. No compartimos tus datos.") +
        '<label class="fld"><span>Nombre</span><input id="pNom" autocomplete="name" value="' + esc(S.nombre) + '"></label>' +
        '<label class="fld"><span>Teléfono o WhatsApp</span><input id="pTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="600 123 456" value="' + esc(S.tel) + '"></label>' +
        '<p class="err" id="pErr"></p>' + navBtns(true, "Ver mi estimación");
    } else h = resultado();
    tool.innerHTML = h;
    enlazar();
  }
  function resultado() {
    var r = calc(), t = PR.tipos[S.tipo];
    return '<div class="prog"><i style="width:100%"></i></div><p class="pstep">Tu estimación</p>' +
      "<h3>" + esc(S.nombre.split(" ")[0] || "Listo") + ", esta es tu estimación</h3>" +
      '<div class="res-top"><small>Precio orientativo · ' + esc(t.nombre) + "</small><b>" + eur(r.min) + " – " + eur(r.max) + "</b><span>IVA no incluido · " + S.m2 + " m² · calidad " + esc(CALIDADES.filter(function (c) { return c[0] === S.calidad; })[0][1].toLowerCase()) + "</span></div>" +
      '<div class="res-grid"><div><small>Plazo estimado</small><b>' + r.sem[0] + " a " + r.sem[1] + ' semanas</b></div><div><small>Siguiente paso</small><b>Visita sin coste</b></div></div>' +
      '<p class="note">Estimación orientativa con precios de referencia de la zona. El precio final depende del estado real, los materiales que elijas y lo que encontremos en la visita, y te lo damos por escrito en el presupuesto desglosado.</p>' +
      '<div class="tool-nav"><button type="button" class="btn btn-g" data-reini>‹ Calcular otra</button><a class="btn btn-w" target="_blank" rel="noopener" href="' + wa(resumenWA(r, t)) + '">Pedir visita por WhatsApp</a></div>';
  }
  function resumenWA(r, t) {
    return "Hola Kasse! Soy " + S.nombre + ". Hice la calculadora en vuestra web:\n• Obra: " + t.nombre + " (" + S.m2 + " m²)\n• Estado: " + ESTADOS.filter(function (e) { return e[0] === S.estado; })[0][1] + "\n• Acabados: " + S.calidad + (S.pueblo ? "\n• Lugar: " + S.pueblo : "") + "\n• Estimación: " + eur(r.min) + " – " + eur(r.max) + "\n¿Cuándo podríais venir a verlo?";
  }
  function enlazar() {
    $$("[data-tipo]", tool).forEach(function (b) { b.onclick = function () { S.tipo = b.dataset.tipo; S.m2 = null; pintar(); }; });
    $$("[data-estado]", tool).forEach(function (b) { b.onclick = function () { S.estado = b.dataset.estado; pintar(); }; });
    $$("[data-calidad]", tool).forEach(function (b) { b.onclick = function () { var p = $("#pPue"); if (p) S.pueblo = p.value.trim(); S.calidad = b.dataset.calidad; pintar(); }; });
    var r = $("#pM2", tool);
    if (r) r.oninput = function () { S.m2 = +r.value; $("#m2V").textContent = S.m2 + " m²"; };
    var atras = $("[data-atras]", tool); if (atras) atras.onclick = function () { paso--; pintar(); };
    var re = $("[data-reini]", tool); if (re) re.onclick = function () { paso = 1; S.tipo = null; pintar(); };
    var sig = $("[data-sig]", tool);
    if (sig) sig.onclick = function () {
      if (paso === 3) S.pueblo = $("#pPue").value.trim();
      if (paso < 4) { paso++; pintar(); return; }
      S.nombre = $("#pNom").value.trim(); S.tel = $("#pTel").value.trim();
      if (!S.nombre || !telOk(S.tel)) { $("#pErr").textContent = "Escribe tu nombre y un teléfono válido para ver la estimación."; return; }
      var c = calc();
      guardarContacto({ nombre: S.nombre, telefono: S.tel, obra: S.tipo, m2: S.m2, estado: S.estado, calidad: S.calidad, pueblo: S.pueblo, estimacion: eur(c.min) + " - " + eur(c.max) });
      paso = 5; pintar();
    };
  }
  pintar();

  /* ---------- Formulario ---------- */
  $("#form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, nom = f.nombre.value.trim(), tel = f.telefono.value.trim(), tipo = f.tipo.value, con = f.consulta.value.trim();
    if (!nom || !telOk(tel)) { $("#formErr").textContent = "Escribe tu nombre y un teléfono válido."; return; }
    $("#formErr").textContent = "";
    guardarContacto({ nombre: nom, telefono: tel, obra: tipo, consulta: con, tipo: "formulario" });
    $("#formOk").style.display = "block";
    open(wa("Hola Kasse! Soy " + nom + " (" + tel + "). Quiero reformar: " + tipo + ". " + (con || "¿Podéis venir a verlo?")), "_blank");
    f.reset();
  });

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), fab = $("#aiFab"), chatM = $("#chatM"), chatI = $("#chatI"), hist = [];
  var SUG = ["¿Cuánto cuesta reformar un baño?", "¿En qué zonas trabajáis?", "¿La visita tiene coste?", "¿Hacéis masías?"];
  function abrir() { chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none"; if (!chatM.children.length) saludo(); setTimeout(function () { chatI.focus(); }, 250); }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.addEventListener("click", abrir); $("#chatX").addEventListener("click", cerrar);
  function burbuja(cls, texto) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = texto; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(texto, consulta) {
    var d = burbuja("b", texto);
    var a = document.createElement("a"); a.className = "wa"; a.target = "_blank"; a.rel = "noopener";
    a.href = wa("Hola Kasse! " + (consulta ? "Pregunté en la web: " + consulta : "Quiero pedir presupuesto.")); a.textContent = "Seguir por WhatsApp ›";
    d.appendChild(document.createElement("br")); d.appendChild(a);
    chatM.scrollTop = chatM.scrollHeight;
  }
  function saludo() {
    burbuja("b", "¡Hola! Soy el asistente de Kasse. Te ayudo con reformas de baños, cocinas, pisos, masías y exteriores en la provincia de Tarragona. ¿Qué quieres reformar?");
    $("#chatC").innerHTML = SUG.map(function (s) { return '<button type="button">' + esc(s) + "</button>"; }).join("");
    $$("#chatC button").forEach(function (b) { b.onclick = function () { preguntar(b.textContent); }; });
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function rango(k) { var t = PR.tipos[k], m = t.m2[2]; return eur(Math.max(t.eurM2.basica * m, t.minimo.basica)) + " y " + eur(Math.max(t.eurM2.alta * m, t.minimo.alta)) + " para unos " + m + " m²"; }
  function local(q) {
    var n = norm(q), precio = /precio|cuanto|cuesta|sale|presupuesto|vale|coste/.test(n);
    if (precio && /bano|ducha|banera/.test(n)) return "Un baño completo suele estar entre " + rango("bano") + ", IVA aparte. Para tu caso, usa la calculadora de esta página o pide la visita sin coste.";
    if (precio && /cocina/.test(n)) return "Una cocina suele estar entre " + rango("cocina") + ", sin electrodomésticos ni IVA. Con la calculadora lo ajustas a tus metros.";
    if (precio && /piso|integral|casa|completa/.test(n)) return "Una reforma integral va de " + PR.tipos.integral.eurM2.basica + " a " + PR.tipos.integral.eurM2.alta + " € por m² según acabados, IVA aparte. La calculadora te da el rango para tus metros.";
    if (/masia|tejado|estructura|fachada|viga/.test(n)) return "Sí, hacemos masías y rehabilitación: saneamiento, refuerzo de estructura, tejados y fachadas. Por ejemplo, reconstruimos la masía de Alfred después de que le cayera encima un árbol de 6 toneladas.";
    if (/cobertizo|pista|patio|cerramiento|valla|jardin|exterior/.test(n)) return "Sí: cobertizos de madera, pistas y patios, cerramientos de acero y aseos exteriores. Cuéntanos qué necesitas y te lo presupuestamos.";
    if (/horario|abris|abren|hora/.test(n)) return N.horario + ".";
    var mejor = null, puntos = 0;
    FAQ.forEach(function (f) { var p = f[2].filter(function (c) { return n.indexOf(norm(c)) > -1; }).length; if (p > puntos) { puntos = p; mejor = f; } });
    if (mejor) return mejor[1];
    if (precio) return "Depende del tipo de obra y de los metros. Usa la calculadora de esta página para ver un rango orientativo, o pide la visita: el presupuesto desglosado no tiene coste.";
    return "Eso te lo respondemos mejor por WhatsApp. Si quieres, cuéntame qué quieres reformar, en qué pueblo y cuántos metros tiene.";
  }
  function sistema() {
    var l = Object.keys(PR.tipos).map(function (k) { var t = PR.tipos[k]; return "- " + t.nombre + ": de " + t.eurM2.basica + " a " + t.eurM2.alta + " €/m² (mínimo " + t.minimo.basica + " €), " + t.semanas[0] + "-" + t.semanas[1] + " semanas"; }).join("\n");
    return "Eres el asistente virtual de " + N.nombre + ", empresa de reformas con más de " + N.experiencia + " años en el sector que trabaja en la " + N.zona + " (" + N.pueblos + "), España. Hablas en español de España, tuteando, cercano y breve (máx. 3 oraciones). " +
      "Servicios: baños, cocinas, reformas integrales de pisos y casas, masías y rehabilitación (estructura, tejados, fachadas), exteriores (cobertizos, pistas, cerramientos, aseos exteriores) y adaptaciones de accesibilidad. Horario: " + N.horario + ".\n" +
      "Precios orientativos sin IVA:\n" + l + "\nPreguntas frecuentes:\n" + FAQ.map(function (f) { return "- " + f[0] + " " + f[1]; }).join("\n") +
      "\nNunca inventes datos que no estén aquí ni des un precio cerrado: aclara que es orientativo e invita a usar la calculadora de la página o a pedir la visita sin coste por WhatsApp.";
  }
  function preguntar(q) {
    q = q.trim(); if (!q) return;
    burbuja("u", q); chatI.value = ""; $("#chatC").innerHTML = "";
    hist.push({ role: "user", parts: [{ text: q }] });
    if (!hayIA()) { setTimeout(function () { var r = local(q); hist.push({ role: "model", parts: [{ text: r }] }); bot(r, q); }, 450); return; }
    var tip = burbuja("b t", "Escribiendo…");
    gemini(hist.slice(-12), sistema())
      .then(function (r) { tip.remove(); hist.push({ role: "model", parts: [{ text: r }] }); bot(r.trim(), q); })
      .catch(function () { tip.remove(); var r = local(q); hist.push({ role: "model", parts: [{ text: r }] }); bot(r, q); });
  }
  $("#chatF").addEventListener("submit", function (e) { e.preventDefault(); preguntar(chatI.value); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") { cerrar(); lb.classList.remove("on"); } });

  /* ---------- Animaciones ---------- */
  function contar(directo) {
    $$("[data-count]").forEach(function (el) {
      var fin = parseFloat(el.dataset.count);
      if (directo || !window.gsap || el.closest(".h3d")) { el.textContent = fin; return; }
      var o = { v: 0 }; el.textContent = 0;
      gsap.to(o, { v: fin, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%" }, onUpdate: function () { el.textContent = Math.round(o.v); } });
    });
  }
  if (!window.gsap || reduced) { listos = true; $$(".rv").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; }); contar(true); return; }
  gsap.registerPlugin(ScrollTrigger);
  contar(false);
  var TARJ = ".card,.step,.q,.cbox,.tool,.why div,.pics";
  $$(".rv").forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el) % 4;
    if (el.matches(TARJ)) {
      gsap.fromTo(el, { opacity: 0, y: 90, z: -160, rotateX: 22, transformPerspective: 1100, transformOrigin: "50% 100%" },
        { opacity: 1, y: 0, z: 0, rotateX: 0, duration: 1.2, ease: "power3.out", delay: i * .08, clearProps: "transform", scrollTrigger: { trigger: el, start: "top 92%" } });
    } else {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: i * .07, scrollTrigger: { trigger: el, start: "top 90%" } });
    }
  });
  listos = true;
  gsap.fromTo(".pj", { opacity: 0, y: 60, rotateX: 14, transformPerspective: 1000 }, { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: .07, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: "#grid", start: "top 85%" } });
  $$("[data-par]").forEach(function (im) {
    gsap.fromTo(im, { yPercent: -7, scale: 1.15 }, { yPercent: 7, scale: 1.15, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });
  $$(".sec .head h2, .final h2").forEach(function (h) {
    gsap.fromTo(h, { rotateX: -50, transformPerspective: 700, transformOrigin: "50% 100%" }, { rotateX: 0, ease: "none", scrollTrigger: { trigger: h, start: "top 100%", end: "top 60%", scrub: true } });
  });
  gsap.to("#lineFill", { width: "100%", ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 60%", scrub: true } });
  $$(".step").forEach(function (s, i) {
    ScrollTrigger.create({ trigger: "#steps", start: "top+=" + (i * 60) + " 72%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } });
  });
})();

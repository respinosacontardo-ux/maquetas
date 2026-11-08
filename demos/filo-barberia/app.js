/* Filo Barbería (demo): animaciones, buscador de corte, asistente con IA y guardado de contactos. */
(function () {
  var C = window.CONFIG, N = C.negocio, SV = C.servicios, BB = C.barberos;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ars(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Básicos ---------- */
  $$("[data-wa]").forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });
  $("#cDir").textContent = N.direccion;
  $("#cHor").textContent = N.horario;
  $("#cExt").textContent = N.extra;

  var hdr = $("#hdr"), burger = $("#burger");
  function solid() { hdr.classList.toggle("solid", scrollY > 10 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  burger.addEventListener("click", function () {
    var o = hdr.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.textContent = o ? "× Cerrar" : "+ Menú"; solid();
  });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); burger.setAttribute("aria-expanded", false); burger.textContent = "+ Menú"; solid(); }); });

  /* ---------- Lista de precios ---------- */
  $("#precios").innerHTML = Object.keys(SV).map(function (k) {
    var s = SV[k], nom = s.nombre.split(" (")[0];
    return '<div class="pr rv"><b>' + esc(nom) + "<small>" + esc(s.duracion) + "</small></b><i></i><span>" + ars(s.precio) + "</span></div>";
  }).join("") + '<p class="pnote">Precios de ejemplo de esta web demo (noviembre 2026). El Ritual Filo incluye corte, barba, toalla caliente y mascarilla.</p>';

  /* ---------- Preguntas frecuentes ---------- */
  var FAQ = [
    ["¿Hace falta turno?", "Te recomendamos reservar: con turno no esperás nada. Si venís sin turno te atendemos en el primer hueco libre, pero los viernes y sábados suele estar lleno.", ["turno", "reserv", "sin turno", "espera", "esperar"]],
    ["¿Cuánto dura un corte?", "Un corte lleva unos 40 minutos; corte + barba, una hora; y el Ritual Filo completo, unos 80 minutos.", ["dura", "tarda", "tiempo", "minutos"]],
    ["¿Puedo llevar una foto del corte que quiero?", "¡Sí, es lo mejor! Mandala por WhatsApp al reservar y te asignamos el barbero que mejor hace ese estilo.", ["foto", "imagen", "referencia"]],
    ["¿Cortan pelo con rulos?", "Sí. Leo se especializa en rulos y texturas: corta en seco cuando hace falta y te explica cómo cuidarlos en casa.", ["rulo", "ondulado", "afro", "crespo", "rizo"]],
    ["¿Atienden chicos?", "Sí, corte niños hasta 12 años, con paciencia y sin apuro. Ideal los martes y miércoles a la tarde.", ["niño", "nene", "hijo", "chico", "pibe"]],
    ["¿Qué medios de pago aceptan?", "Efectivo, transferencia, QR y tarjetas de débito y crédito.", ["pago", "pagar", "tarjeta", "transfer", "efectivo", "mercado pago", "qr"]],
    ["¿Tienen gift cards?", "Sí, de cualquier servicio. Te la mandamos por WhatsApp lista para regalar o la retirás en el local.", ["regalo", "regalar", "gift", "voucher", "tarjeta de regalo"]],
    ["¿Qué pasa si llego tarde o no puedo ir?", "Avisanos por WhatsApp y te lo reprogramamos sin problema. Si llegás más de 15 minutos tarde, puede que tengamos que acortar el servicio.", ["tarde", "cancel", "reprogram", "no puedo"]]
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
  function gemini(contents, sistema, json) {
    var modelos = C.gemini.modelos.slice();
    function probar() {
      var m = modelos.shift();
      if (!m) return Promise.reject(new Error("sin modelos"));
      var body = { contents: contents, systemInstruction: { parts: [{ text: sistema }] }, generationConfig: { temperature: 0.6, maxOutputTokens: 500 } };
      if (json) body.generationConfig.responseMimeType = "application/json";
      return fetch("https://generativelanguage.googleapis.com/v1beta/models/" + m + ":generateContent?key=" + C.gemini.clave, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { var t = j.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join(""); if (!t) throw new Error("vacío"); return t; })
        .catch(function (e) { if (modelos.length) return probar(); throw e; });
    }
    return probar();
  }

  /* ---------- Guardado de contactos ---------- */
  function guardarContacto(datos) {
    datos.fecha = new Date().toISOString(); datos.origen = N.nombre + " (web)";
    try {
      if (C.contactos.appsScriptUrl) return fetch(C.contactos.appsScriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
      if (C.contactos.formsubmitEmail) return fetch("https://formsubmit.co/ajax/" + C.contactos.formsubmitEmail, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
    } catch (e) {}
    return Promise.resolve(false);
  }
  function telOk(t) { return String(t).replace(/\D/g, "").length >= 8; }

  /* ---------- Encontrá tu corte (5 pasos) ---------- */
  var CARAS = {
    ovalada:  { n: "Ovalada",  d: "proporcionada",       p: '<ellipse cx="12" cy="12" rx="6.5" ry="9"/>' },
    redonda:  { n: "Redonda",  d: "ancho y alto parecidos", p: '<circle cx="12" cy="12" r="8.5"/>' },
    cuadrada: { n: "Cuadrada", d: "mandíbula marcada",    p: '<path d="M5.5 5.5c0-1.5 1-2.5 2.5-2.5h8c1.5 0 2.5 1 2.5 2.5v9c0 3-3 6.5-6.5 6.5S5.5 17.5 5.5 14.5z"/>' },
    alargada: { n: "Alargada", d: "más alta que ancha",   p: '<rect x="6.5" y="2" width="11" height="20" rx="5.5"/>' }
  };
  var ESTILOS = {
    clasico:  { n: "Clásico prolijo",     d: "para la oficina y el finde", p: '<path d="M6 10c0-4 3-6 6-6s6 2 6 6"/><path d="M9 4.6 8 10M6 10h12"/><ellipse cx="12" cy="14" rx="6" ry="7"/>' },
    fade:     { n: "Fade moderno",        d: "degradé marcado arriba",     p: '<path d="M6 12V9c0-3 3-5 6-5s6 2 6 5v3"/><path d="M6 14h1M6 16h2M17 14h1M16 16h2"/><path d="M8 6c2 1 6 1 8 0"/>' },
    simple:   { n: "Bajo mantenimiento",  d: "corto y listo",              p: '<circle cx="12" cy="12" r="8"/><path d="M5 9h14" stroke-dasharray="1.5 1.5"/>' },
    distinto: { n: "Algo distinto",       d: "me animo a cambiar",         p: '<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>' }
  };
  var PELO = ["Lacio", "Ondulado", "Rulos", "Poco pelo o entradas"];
  var BARBA = ["Sin barba", "Barba corta", "Barba larga"];
  var DIAS = ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  var FRANJAS = ["Mañana (10 a 14 h)", "Tarde (14 a 18 h)", "Noche (18 a 21 h)"];

  var tool = $("#tool"), paso = 1, S = { cara: null, pelo: null, barba: null, estilo: null, dia: null, franja: null, nombre: "", tel: "", email: "" };
  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>"; }
  function chips(nombre, lista, valor) {
    return '<div class="chips">' + lista.map(function (x) { return '<button type="button" class="chip' + (valor === x ? " sel" : "") + '" data-' + nombre + '="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>";
  }
  function opts(nombre, mapa, valor) {
    return '<div class="opts">' + Object.keys(mapa).map(function (k) {
      var o = mapa[k];
      return '<button type="button" class="opt' + (valor === k ? " sel" : "") + '" data-' + nombre + '="' + k + '">' + ic(o.p) + "<div><b>" + esc(o.n) + "</b><span>" + esc(o.d) + "</span></div></button>";
    }).join("") + "</div>";
  }
  function navBtns(puede, texto) {
    return '<div class="tool-nav">' + (paso > 1 ? '<button type="button" class="btn btn-g" data-atras>‹ Volver</button>' : "<span></span>") +
      '<button type="button" class="btn btn-p" data-sig' + (puede ? "" : " disabled") + ">" + texto + "</button></div>";
  }
  function cabecera(titulo, sub) {
    return '<div class="prog"><i style="width:' + (paso * 20) + '%"></i></div><p class="pstep">Paso ' + Math.min(paso, 5) + " de 5</p><h3>" + titulo + '</h3><p class="sub">' + sub + "</p>";
  }

  function pintar() {
    var h = "";
    if (paso === 1) h = cabecera("¿Qué forma tiene tu cara?", "Mirate al espejo con el pelo para atrás. Si dudás, elegí la más parecida.") + opts("cara", CARAS, S.cara) + navBtns(!!S.cara, "Siguiente");
    else if (paso === 2) h = cabecera("Tu pelo y tu barba", "Con esto elegimos la técnica y el barbero.") +
      '<p class="qlabel">Tipo de pelo</p>' + chips("pelo", PELO, S.pelo) +
      '<p class="qlabel" style="margin-top:22px">Barba</p>' + chips("barba", BARBA, S.barba) + navBtns(!!(S.pelo && S.barba), "Siguiente");
    else if (paso === 3) h = cabecera("¿Qué estilo buscás?", "No hay respuesta incorrecta: es lo que te hace sentir cómodo.") + opts("estilo", ESTILOS, S.estilo) + navBtns(!!S.estilo, "Siguiente");
    else if (paso === 4) h = cabecera("¿Cuándo te queda bien venir?", "Te reservamos el primer turno libre en ese horario.") +
      '<p class="qlabel">Día</p>' + chips("dia", DIAS, S.dia) +
      '<p class="qlabel" style="margin-top:22px">Horario</p>' + chips("franja", FRANJAS, S.franja) + navBtns(!!(S.dia && S.franja), "Siguiente");
    else if (paso === 5) h = cabecera("¿A dónde te mandamos tu corte?", "Te escribimos para confirmar el turno. No compartimos tus datos.") +
      '<label class="fld"><span>Nombre</span><input id="pNom" autocomplete="name" value="' + esc(S.nombre) + '"></label>' +
      '<label class="fld"><span>WhatsApp</span><input id="pTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="351 555 1234" value="' + esc(S.tel) + '"></label>' +
      '<label class="fld"><span>Email (opcional)</span><input id="pMail" type="email" autocomplete="email" value="' + esc(S.email) + '"></label>' +
      '<p class="err" id="pErr"></p>' + navBtns(true, "Ver mi corte");
    else h = resultado();
    tool.innerHTML = h;
    enlazar();
  }

  /* Recomendación: estilo × forma de cara, ajustada por tipo de pelo */
  function recomendar() {
    var c = S.cara, e = S.estilo, rulos = S.pelo === "Rulos", poco = S.pelo === "Poco pelo o entradas";
    var corte, porque, barbero, cada;
    if (poco) {
      corte = e === "clasico" ? "Crew cut prolijo" : "Buzz cut con degradé";
      porque = "Con entradas, llevar los costados bien cortos y arriba parejo equilibra la cabeza y hace que se note mucho menos. Queda prolijo y es súper fácil de mantener.";
      barbero = "nico"; cada = "2 a 3 semanas";
    } else if (e === "fade") {
      corte = rulos ? "Taper fade con rulos definidos" : { redonda: "Mid fade con volumen arriba", cuadrada: "Skin fade con crop texturizado", alargada: "Low fade con flequillo texturizado" }[c] || "Mid fade con textura arriba";
      porque = { redonda: "El volumen arriba y los costados cortos estiran visualmente la cara.", cuadrada: "Tu mandíbula marcada es protagonista: el skin fade la resalta y el crop suaviza la frente.", alargada: "Un fade bajo y el flequillo hacia adelante acortan la cara y la equilibran." }[c] || "Tu forma de cara admite casi todo: un fade medio con textura arriba te va a quedar natural.";
      if (rulos) porque = "Dejamos los rulos libres arriba y bajamos de a poco a los costados para que tengan forma y no se abran.";
      barbero = rulos ? "leo" : "nico"; cada = "2 a 3 semanas";
    } else if (e === "clasico") {
      corte = { redonda: "Side part con laterales cortos", cuadrada: "Corte ejecutivo con raya al costado", alargada: "Clásico con volumen lateral y poca altura" }[c] || "Side part clásico peinado con pomada";
      porque = { redonda: "La raya al costado y algo de altura arman ángulos que afinan la cara.", cuadrada: "Las líneas rectas del corte ejecutivo acompañan tu mandíbula: elegante y firme.", alargada: "Sin altura arriba y con algo de volumen al costado, la cara se ve más proporcionada." }[c] || "Un clásico de tijera que va con todo y se peina en un minuto.";
      if (rulos) { corte = "Clásico a tijera con rulos controlados"; porque = "Cortamos a tijera para que los rulos queden prolijos y con peso, sin volumen de más a los costados."; }
      barbero = rulos ? "leo" : "tomas"; cada = "3 a 4 semanas";
    } else if (e === "simple") {
      corte = rulos ? "Rulos cortos con taper" : (c === "alargada" ? "Crew cut con flequillo corto" : "Crew cut");
      porque = "Corto, prolijo y sin peinado: te levantás y ya está. Lo ajustamos a tu forma de cara para que no quede genérico.";
      barbero = rulos ? "leo" : "nico"; cada = "3 a 4 semanas";
    } else {
      corte = rulos ? "Rulos con mullet moderno" : (c === "redonda" ? "Textured crop decolorado" : "Mullet moderno con fade");
      porque = "Algo con personalidad que se nota sin ser exagerado. Lo charlamos en el sillón y, si querés, sumamos color o un diseño.";
      barbero = "leo"; cada = "3 semanas";
    }
    var serv = S.barba === "Barba larga" ? "ritual" : S.barba === "Barba corta" ? "combo" : (e === "fade" && !poco ? "fade" : "corte");
    return { corte: corte, porque: porque, barbero: BB[barbero], serv: SV[serv], cada: cada };
  }

  function resultado() {
    var r = recomendar();
    return '<div class="prog"><i style="width:100%"></i></div><p class="pstep">Tu corte</p>' +
      "<h3>" + esc(S.nombre.split(" ")[0] || "Listo") + ", esto te va a quedar bien</h3>" +
      '<div class="res"><div class="res-top"><small>Corte recomendado</small><b>' + esc(r.corte) + "</b></div>" +
      '<p id="consejo" style="font-size:15px;color:var(--mute)">' + esc(r.porque) + "</p>" +
      '<div><div class="res-row"><span>Servicio</span><b>' + esc(r.serv.nombre.split(" (")[0]) + "</b></div>" +
      '<div class="res-row"><span>Tu barbero</span><b>' + esc(r.barbero.nombre) + " · " + esc(r.barbero.especialidad.split(",")[0]) + "</b></div>" +
      '<div class="res-row"><span>Duración y precio</span><b>' + esc(r.serv.duracion) + " · " + ars(r.serv.precio) + "</b></div>" +
      '<div class="res-row"><span>Turno solicitado</span><b>' + esc(S.dia) + ", " + esc(S.franja.split(" (")[0].toLowerCase()) + "</b></div>" +
      '<div class="res-row"><span>Retoque ideal</span><b>cada ' + esc(r.cada) + "</b></div></div>" +
      '<p class="note">Recomendación orientativa: tu barbero la ajusta en el sillón según tu pelo. Precios de ejemplo de esta web demo.</p>' +
      '<div class="tool-nav"><button type="button" class="btn btn-g" data-reini>‹ Empezar de nuevo</button><a class="btn btn-p" target="_blank" rel="noopener" href="' + wa(resumenWA(r)) + '">Reservar por WhatsApp</a></div></div>';
  }
  function resumenWA(r) {
    return "Hola Filo! Soy " + S.nombre + ". Hice el buscador de cortes en la web:\n• Corte: " + r.corte + "\n• Servicio: " + r.serv.nombre.split(" (")[0] + "\n• Barbero: " + r.barbero.nombre + "\n• Turno: " + S.dia + ", " + S.franja + "\n¿Me confirman disponibilidad?";
  }

  function enlazar() {
    ["cara", "estilo", "pelo", "barba", "dia", "franja"].forEach(function (k) {
      $$("[data-" + k + "]", tool).forEach(function (b) { b.onclick = function () { S[k] = b.dataset[k]; pintar(); }; });
    });
    var atras = $("[data-atras]", tool); if (atras) atras.onclick = function () { paso--; pintar(); };
    var re = $("[data-reini]", tool); if (re) re.onclick = function () { paso = 1; S.cara = S.pelo = S.barba = S.estilo = S.dia = S.franja = null; pintar(); };
    var sig = $("[data-sig]", tool);
    if (sig) sig.onclick = function () {
      if (paso < 5) { paso++; pintar(); return; }
      S.nombre = $("#pNom").value.trim(); S.tel = $("#pTel").value.trim(); S.email = $("#pMail").value.trim();
      if (!S.nombre || !telOk(S.tel)) { $("#pErr").textContent = "Completá tu nombre y un WhatsApp válido para ver tu corte."; return; }
      var r = recomendar();
      guardarContacto({ nombre: S.nombre, telefono: S.tel, email: S.email, cara: S.cara, pelo: S.pelo, barba: S.barba, estilo: S.estilo, corte: r.corte, turno: S.dia + " " + S.franja });
      paso = 6; pintar();
      if (hayIA()) {
        var p = "Cliente: cara " + S.cara + ", pelo " + S.pelo + ", " + S.barba + ", estilo " + ESTILOS[S.estilo].n + ". Corte sugerido: " + r.corte + ".";
        gemini([{ role: "user", parts: [{ text: p }] }], "Sos barbero de " + N.nombre + " en Córdoba, Argentina. En voseo, canchero y claro, explicá en 2 oraciones (máx. 45 palabras) por qué ese corte le queda bien a este cliente y un tip para mantenerlo. Sin precios. Respondé JSON {\"consejo\": \"...\"}.", true)
          .then(function (t) { var j = JSON.parse(t); if (j.consejo && $("#consejo")) $("#consejo").textContent = j.consejo; }).catch(function () {});
      }
    };
  }
  pintar();

  /* ---------- Formulario ---------- */
  $("#form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, nom = f.nombre.value.trim(), tel = f.telefono.value.trim(), con = f.consulta.value.trim();
    if (!nom || !telOk(tel)) { $("#formErr").textContent = "Completá tu nombre y un WhatsApp válido."; return; }
    $("#formErr").textContent = "";
    guardarContacto({ nombre: nom, telefono: tel, consulta: con, tipo: "formulario" });
    $("#formOk").style.display = "block";
    open(wa("Hola Filo! Soy " + nom + " (" + tel + "). " + (con || "Quiero reservar un turno.")), "_blank");
    f.reset();
  });

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), fab = $("#aiFab"), chatM = $("#chatM"), chatI = $("#chatI"), hist = [];
  var SUG = ["¿Hay turno hoy?", "¿Cuánto sale corte + barba?", "¿Cortan rulos?", "¿Dónde están?"];
  function abrir() { chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none"; if (!chatM.children.length) saludo(); setTimeout(function () { chatI.focus(); }, 250); }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.addEventListener("click", abrir); $("#chatX").addEventListener("click", cerrar);
  function burbuja(cls, texto) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = texto; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(texto, consulta) {
    var d = burbuja("b", texto);
    var a = document.createElement("a"); a.className = "wa"; a.target = "_blank"; a.rel = "noopener";
    a.href = wa("Hola Filo! " + (consulta ? "Consulté en la web: " + consulta : "Quiero reservar un turno.")); a.textContent = "Reservar por WhatsApp ›";
    d.appendChild(document.createElement("br")); d.appendChild(a);
    chatM.scrollTop = chatM.scrollHeight;
  }
  function saludo() {
    burbuja("b", "¡Buenas! Soy Filo IA ✂️ Te ayudo con turnos, precios, servicios y qué corte te puede quedar. ¿Qué necesitás?");
    $("#chatC").innerHTML = SUG.map(function (s) { return "<button type=\"button\">" + esc(s) + "</button>"; }).join("");
    $$("#chatC button").forEach(function (b) { b.onclick = function () { preguntar(b.textContent); }; });
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function local(q) {
    var n = norm(q), quiere = /(cuanto|precio|sale|cuesta|valor|cobran|costo)/.test(n);
    var claves = { combo: ["corte y barba", "corte + barba", "corte con barba"], ritual: ["ritual", "toalla", "completo"], navaja: ["navaja", "afeit"], fade: ["fade", "degrade", "diseno"], color: ["color", "decolor", "tintur", "platinado", "mechas"], ninos: ["nino", "nene", "hijo", "chico"], barba: ["barba", "perfil"], corte: ["corte", "cortar", "pelo"] };
    if (quiere) for (var k in claves) {
      if (claves[k].some(function (c) { return n.indexOf(c) > -1; })) { var s = SV[k]; return s.nombre + ": " + ars(s.precio) + " (" + s.duracion + "). Si querés, probá el buscador \"Encontrá tu corte\" y te reservamos el turno."; }
    }
    if (/(hoy|ahora|turno libre|disponib|hay turno)/.test(n)) return "Para hoy depende de cómo venga la agenda: escribinos por WhatsApp y te pasamos el primer turno libre al toque. " + N.horario + ".";
    if (/(que corte|me queda|recomend|cara)/.test(n)) return "Depende de tu forma de cara y tu pelo. Probá el buscador \"Encontrá tu corte\" de esta página: en un minuto te recomienda corte, barbero y precio.";
    if (/(donde|direccion|ubicad|llego|queda)/.test(n)) return "Estamos en " + N.direccion + ", " + N.ciudad + ", a dos cuadras del Paseo de las Artes.";
    if (/(horario|abren|cierran|domingo|lunes|hora)/.test(n)) return N.horario + ". " + N.extra + ".";
    var mejor = null, puntos = 0;
    FAQ.forEach(function (f) { var p = f[2].filter(function (c) { return n.indexOf(norm(c)) > -1; }).length; if (p > puntos) { puntos = p; mejor = f; } });
    if (mejor) return mejor[1];
    if (quiere) return "El corte sale " + ars(SV.corte.precio) + ", corte + barba " + ars(SV.combo.precio) + " y el Ritual Filo " + ars(SV.ritual.precio) + ". ¿Qué servicio te interesa?";
    if (/(turno|reserv|cita)/.test(n)) return "¡Dale! Escribinos por WhatsApp con día y horario y te confirmamos barbero y hora en minutos.";
    return "Esa te la responde mejor el equipo por WhatsApp. Si querés, contame qué servicio buscás y te paso el precio.";
  }
  function sistema() {
    var lista = Object.keys(SV).map(function (k) { return "- " + SV[k].nombre + ": " + ars(SV[k].precio) + " (" + SV[k].duracion + ")"; }).join("\n");
    var equipo = Object.keys(BB).map(function (k) { return "- " + BB[k].nombre + ": " + BB[k].especialidad; }).join("\n");
    return "Sos Filo IA, el asistente de " + N.nombre + " (" + N.direccion + ", " + N.ciudad + ", Argentina). Hablás en español rioplatense con voseo, canchero, amable y breve (máx. 3 oraciones). " +
      "Horario: " + N.horario + ". " + N.extra + ".\nServicios y precios:\n" + lista + "\nBarberos:\n" + equipo +
      "\nPreguntas frecuentes:\n" + FAQ.map(function (f) { return "- " + f[0] + " " + f[1]; }).join("\n") +
      "\nNunca inventes datos que no estén acá. Para reservar, invitá a escribir por WhatsApp o a usar el buscador \"Encontrá tu corte\" de la página.";
  }
  function preguntar(q) {
    q = q.trim(); if (!q) return;
    burbuja("u", q); chatI.value = ""; $("#chatC").innerHTML = "";
    hist.push({ role: "user", parts: [{ text: q }] });
    if (!hayIA()) { setTimeout(function () { var r = local(q); hist.push({ role: "model", parts: [{ text: r }] }); bot(r, q); }, 450); return; }
    var tip = burbuja("b t", "Escribiendo…");
    gemini(hist.slice(-12), sistema(), false)
      .then(function (r) { tip.remove(); hist.push({ role: "model", parts: [{ text: r }] }); bot(r.trim(), q); })
      .catch(function () { tip.remove(); var r = local(q); hist.push({ role: "model", parts: [{ text: r }] }); bot(r, q); });
  }
  $("#chatF").addEventListener("submit", function (e) { e.preventDefault(); preguntar(chatI.value); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });

  /* ---------- Animaciones ---------- */
  function contar(directo) {
    $$("[data-count]").forEach(function (el) {
      var fin = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
      var fmt = function (v) { return v.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      if (directo || !window.gsap) { el.textContent = fmt(fin); return; }
      var o = { v: 0 }; el.textContent = fmt(0);
      gsap.to(o, { v: fin, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: function () { el.textContent = fmt(o.v); } });
    });
  }

  if (!window.gsap || reduced) { $$(".rv").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; }); contar(true); return; }
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".hero .rv", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: .12, delay: .15 });
  contar(false);

  // Entradas en 3D: los bloques suben desde atrás, inclinados, y se enderezan
  var TARJ = ".card,.tcard,.step,.q,.cbox,.tool,.plan-side,.stage,.bb,.pr";
  $$(".rv").filter(function (e) { return !e.closest(".hero"); }).forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el) % 4;
    if (el.matches(TARJ)) {
      gsap.fromTo(el, { opacity: 0, y: 90, z: -160, rotateX: 26, transformPerspective: 1100, transformOrigin: "50% 100%" },
        { opacity: 1, y: 0, z: 0, rotateX: 0, duration: 1.2, ease: "power3.out", delay: i * .08, clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 92%" } });
    } else {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" }, delay: i * .07 });
    }
  });

  // Foto del salón: llega recostada en 3D y se endereza
  gsap.fromTo(".after .ph", { rotateX: 34, scale: .84, y: 40 }, { rotateX: 0, scale: 1, y: 0, ease: "none",
    scrollTrigger: { trigger: ".after .stage", start: "top 98%", end: "top 25%", scrub: true } });
  gsap.from(".float", { opacity: 0, y: 30, duration: .9, ease: "power3.out", stagger: .14, scrollTrigger: { trigger: ".after .stage", start: "top 50%" } });

  // Titulares: giro en 3D ligado al scroll, como una placa de cine que se levanta
  $$(".sec h2").forEach(function (h) {
    if (h.closest(".cbox")) return;
    gsap.fromTo(h, { rotateX: -55, transformPerspective: 700, transformOrigin: "50% 100%" }, { rotateX: 0, ease: "none",
      scrollTrigger: { trigger: h, start: "top 100%", end: "top 62%", scrub: true } });
  });

  $$("[data-par]").forEach(function (img) {
    var d = +img.dataset.par;
    gsap.fromTo(img, { yPercent: -d / 2 }, { yPercent: d / 2 - 8, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  gsap.to("#lineFill", { width: "100%", ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 60%", scrub: true } });
  $$(".step").forEach(function (s, i) {
    ScrollTrigger.create({ trigger: "#steps", start: "top+=" + (i * 60) + " 72%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } });
  });
})();

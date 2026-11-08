/* Nácar Clínica Dental (demo): animaciones, planificador de sonrisa, asistente con IA y guardado de contactos. */
(function () {
  var C = window.CONFIG, N = C.negocio, T = C.tratamientos;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ars(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }
  function rango(t) { return ars(t.desde) + " a " + ars(t.hasta); }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var ICON = {
    escudo: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    brillo: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>',
    alineador: '<path d="M4 9c0-2 2-4 8-4s8 2 8 4-1 6-3 8c-1 1-3 0-5 0s-4 1-5 0c-2-2-3-6-3-8z"/><path d="M8 9h8"/>',
    implante: '<path d="M8 3h8l-1 5H9z"/><path d="M10 8v3h4V8M10 11l.5 2h3l.5-2M10.5 13l.5 2h2l.5-2M11 15l1 6 1-6"/>',
    carilla: '<rect x="6" y="3" width="12" height="18" rx="5"/><path d="M9 8c1 .7 2 1 3 1s2-.3 3-1"/>',
    rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICON[k] + "</svg>"; }

  /* ---------- Básicos: links de WhatsApp, header, datos de contacto ---------- */
  $$("[data-wa]").forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });
  $("#cDir").textContent = N.direccion;
  $("#cHor").textContent = N.horario;
  $("#cUrg").textContent = N.urgencias;

  var hdr = $("#hdr"), burger = $("#burger");
  function solid() { hdr.classList.toggle("solid", scrollY > 10 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  burger.addEventListener("click", function () {
    var o = hdr.classList.toggle("open"); burger.setAttribute("aria-expanded", o); solid();
  });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); burger.setAttribute("aria-expanded", false); solid(); }); });

  /* ---------- Preguntas frecuentes (también alimentan al asistente) ---------- */
  var FAQ = [
    ["¿Atienden urgencias?", "Sí. Si tenés dolor, una pieza rota o una infección, te atendemos el mismo día de lunes a sábado. Escribinos por WhatsApp y te damos el primer turno libre.", ["urgencia", "dolor", "duele", "hoy", "rot", "infecc", "flemon", "flemón"]],
    ["¿Duele ponerse un implante?", "No. Se hace con anestesia local y, si lo preferís, con sedación consciente. Los días siguientes puede haber una molestia leve que se controla con un analgésico común.", ["implante", "duele", "dolor"]],
    ["¿Cuánto dura la ortodoncia invisible?", "Depende de cada caso: entre 6 y 18 meses. En la primera consulta escaneamos tu boca y te mostramos en 3D cómo van a moverse tus dientes y cuánto tiempo lleva.", ["ortodoncia", "alineador", "invisible", "bracket", "dura"]],
    ["¿El blanqueamiento daña el esmalte?", "No, hecho por un profesional es seguro. Usamos geles con protección del esmalte y luz LED. Puede haber algo de sensibilidad uno o dos días.", ["blanque", "esmalte", "blanco", "manchas"]],
    ["¿Trabajan con obras sociales y prepagas?", "Sí, con las principales prepagas de Córdoba. Escribinos tu cobertura por WhatsApp y te confirmamos qué cubre en tu plan.", ["obra social", "prepaga", "cobertura", "osde", "swiss", "apross", "galeno", "sancor"]],
    ["¿Cuánto cuesta la primera consulta?", "La primera consulta con diagnóstico 3D y plan por escrito sale " + ars(C.consultaInicial) + ". Si arrancás el tratamiento, te la descontamos.", ["consulta", "primera", "cuesta", "precio", "valor", "sale"]],
    ["¿Atienden a chicos?", "Sí. Tenemos odontopediatría, con una primera visita tranquila y de juego para que los chicos se acostumbren al consultorio.", ["chico", "niño", "nene", "hijo", "pediatr", "infant"]],
    ["¿Puedo pagar en cuotas?", "Sí, con tarjeta de crédito en cuotas, y en tratamientos largos como la ortodoncia también podés pagar mes a mes.", ["cuota", "pago", "pagar", "tarjeta", "financ"]]
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
      var body = { contents: contents, systemInstruction: { parts: [{ text: sistema }] }, generationConfig: { temperature: 0.5, maxOutputTokens: 500 } };
      if (json) body.generationConfig.responseMimeType = "application/json";
      return fetch("https://generativelanguage.googleapis.com/v1beta/models/" + m + ":generateContent?key=" + C.gemini.clave, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { var t = j.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join(""); if (!t) throw new Error("vacío"); return t; })
        .catch(function (e) { if (modelos.length) return probar(); throw e; });
    }
    return probar();
  }

  /* ---------- Guardado de contactos (planilla o email; si no hay, viaja por WhatsApp) ---------- */
  function guardarContacto(datos) {
    datos.fecha = new Date().toISOString(); datos.origen = N.nombre + " (web)";
    try {
      if (C.contactos.appsScriptUrl) {
        return fetch(C.contactos.appsScriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
      }
      if (C.contactos.formsubmitEmail) {
        return fetch("https://formsubmit.co/ajax/" + C.contactos.formsubmitEmail, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
      }
    } catch (e) {}
    return Promise.resolve(false);
  }
  function telOk(t) { return String(t).replace(/\D/g, "").length >= 8; }

  /* ---------- Planificador de sonrisa (4 pasos) ---------- */
  var tool = $("#tool"), paso = 1, S = { trat: null, control: null, dolor: null, dia: null, franja: null, nombre: "", tel: "", email: "" };
  var DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  var FRANJAS = ["Mañana (9 a 13 h)", "Tarde (14 a 20 h)"];
  var CONTROL = ["Menos de 6 meses", "Entre 6 y 12 meses", "Más de un año", "No me acuerdo"];
  var DOLOR = ["No", "A veces, sensibilidad", "Sí, ahora"];

  function chips(nombre, lista, valor) {
    return '<div class="chips">' + lista.map(function (x) { return '<button type="button" class="chip' + (valor === x ? " sel" : "") + '" data-' + nombre + '="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>";
  }
  function navBtns(puede, texto) {
    return '<div class="tool-nav">' + (paso > 1 ? '<button type="button" class="btn btn-g" data-atras>‹ Volver</button>' : "<span></span>") +
      '<button type="button" class="btn btn-p" data-sig' + (puede ? "" : " disabled") + ">" + texto + "</button></div>";
  }
  function cabecera(titulo, sub) {
    return '<div class="prog"><i style="width:' + (paso * 25) + '%"></i></div><p class="pstep">Paso ' + Math.min(paso, 4) + " de 4</p><h3>" + titulo + '</h3><p class="sub">' + sub + "</p>";
  }

  function pintar() {
    var h = "";
    if (paso === 1) {
      h = cabecera("¿Qué te gustaría resolver?", "Elegí la opción que más se parece a lo que buscás.") +
        '<div class="opts">' + Object.keys(T).map(function (k) {
          var t = T[k];
          return '<button type="button" class="opt' + (S.trat === k ? " sel" : "") + '" data-trat="' + k + '">' + svg(t.icono) + "<div><b>" + esc(t.nombre) + "</b><span>" + esc(t.sesiones) + "</span></div></button>";
        }).join("") + "</div>" + navBtns(!!S.trat, "Siguiente");
    } else if (paso === 2) {
      h = cabecera("Contanos un poco más", "Con esto ajustamos la recomendación a tu caso.") +
        '<p class="qlabel">¿Hace cuánto fue tu último control?</p>' + chips("control", CONTROL, S.control) +
        '<p class="qlabel" style="margin-top:20px">¿Tenés dolor o sensibilidad?</p>' + chips("dolor", DOLOR, S.dolor) +
        navBtns(!!(S.control && S.dolor), "Siguiente");
    } else if (paso === 3) {
      h = cabecera("¿Cuándo te queda mejor venir?", "Te reservamos el primer turno libre en ese horario.") +
        '<p class="qlabel">Día</p>' + chips("dia", DIAS, S.dia) +
        '<p class="qlabel" style="margin-top:20px">Horario</p>' + chips("franja", FRANJAS, S.franja) +
        navBtns(!!(S.dia && S.franja), "Siguiente");
    } else if (paso === 4) {
      h = cabecera("¿A dónde te mandamos tu plan?", "Te escribimos para confirmar el turno. No compartimos tus datos.") +
        '<label class="fld"><span>Nombre</span><input id="pNom" autocomplete="name" value="' + esc(S.nombre) + '"></label>' +
        '<label class="fld"><span>WhatsApp</span><input id="pTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="351 555 1234" value="' + esc(S.tel) + '"></label>' +
        '<label class="fld"><span>Email (opcional)</span><input id="pMail" type="email" autocomplete="email" value="' + esc(S.email) + '"></label>' +
        '<p class="err" id="pErr"></p>' + navBtns(true, "Ver mi plan");
    } else {
      h = resultado();
    }
    tool.innerHTML = h;
    enlazar();
  }

  function consejoLocal() {
    var t = T[S.trat], c = [];
    if (S.dolor === "Sí, ahora") c.push("Como tenés dolor ahora, lo primero es aliviarlo: te damos prioridad de urgencia y después seguimos con " + t.nombre.toLowerCase() + ".");
    else if (S.dolor === "A veces, sensibilidad") c.push("La sensibilidad que mencionás la revisamos en la primera consulta: muchas veces se resuelve con un tratamiento simple.");
    if (S.control === "Más de un año" || S.control === "No me acuerdo") c.push("Como pasó un tiempo desde tu último control, sumamos una limpieza profesional antes de empezar.");
    if (!c.length) c.push("Tu caso es ideal para arrancar directo con " + t.nombre.toLowerCase() + " después del diagnóstico 3D.");
    return c.join(" ");
  }

  function resultado() {
    var t = T[S.trat];
    return '<div class="prog"><i style="width:100%"></i></div><p class="pstep">Tu plan</p>' +
      "<h3>" + esc(S.nombre.split(" ")[0] || "Listo") + ", este es tu punto de partida</h3>" +
      '<div class="res"><div class="res-top"><small>Tratamiento recomendado</small><b>' + esc(t.nombre) + "</b><small>" + esc(t.sesiones) + "</small></div>" +
      '<p id="consejo" style="font-size:15px;color:var(--slate)">' + esc(consejoLocal()) + "</p>" +
      '<div><div class="res-row"><span>Valor orientativo</span><b>' + rango(t) + "</b></div>" +
      '<div class="res-row"><span>Primera consulta con diagnóstico 3D</span><b>' + ars(C.consultaInicial) + "</b></div>" +
      '<div class="res-row"><span>Turno solicitado</span><b>' + esc(S.dia) + ", " + esc(S.franja.split(" (")[0].toLowerCase()) + "</b></div></div>" +
      '<p class="note">Estimación orientativa: el valor final depende del diagnóstico en consulta y se entrega por escrito antes de empezar. Valores de ejemplo de esta web demo.</p>' +
      '<div class="tool-nav"><button type="button" class="btn btn-g" data-reini>‹ Empezar de nuevo</button><a class="btn btn-p" target="_blank" rel="noopener" href="' + wa(resumenWA()) + '">Confirmar turno por WhatsApp</a></div></div>';
  }
  function resumenWA() {
    var t = T[S.trat];
    return "Hola Nácar! Soy " + S.nombre + ". Hice el planificador en la web:\n• Quiero: " + t.nombre + "\n• Último control: " + S.control + "\n• Dolor: " + S.dolor + "\n• Turno: " + S.dia + ", " + S.franja + "\n¿Me confirman disponibilidad?";
  }

  function enlazar() {
    $$("[data-trat]", tool).forEach(function (b) { b.onclick = function () { S.trat = b.dataset.trat; pintar(); }; });
    ["control", "dolor", "dia", "franja"].forEach(function (k) {
      $$("[data-" + k + "]", tool).forEach(function (b) { b.onclick = function () { S[k] = b.dataset[k]; pintar(); }; });
    });
    var atras = $("[data-atras]", tool); if (atras) atras.onclick = function () { paso--; pintar(); };
    var re = $("[data-reini]", tool); if (re) re.onclick = function () { paso = 1; S.trat = S.control = S.dolor = S.dia = S.franja = null; pintar(); };
    var sig = $("[data-sig]", tool);
    if (sig) sig.onclick = function () {
      if (paso < 4) { paso++; pintar(); return; }
      S.nombre = $("#pNom").value.trim(); S.tel = $("#pTel").value.trim(); S.email = $("#pMail").value.trim();
      if (!S.nombre || !telOk(S.tel)) { $("#pErr").textContent = "Completá tu nombre y un WhatsApp válido para ver tu plan."; return; }
      guardarContacto({ nombre: S.nombre, telefono: S.tel, email: S.email, tratamiento: T[S.trat].nombre, control: S.control, dolor: S.dolor, turno: S.dia + " " + S.franja });
      paso = 5; pintar();
      if (hayIA()) {
        var p = "Paciente: quiere " + T[S.trat].nombre + "; último control: " + S.control + "; dolor: " + S.dolor + ".";
        gemini([{ role: "user", parts: [{ text: p }] }], "Sos odontólogo/a de " + N.nombre + " en Córdoba, Argentina. Escribí en voseo, cálido y claro, un consejo personalizado de 2 oraciones (máx. 45 palabras) para este paciente sobre por dónde empezar. No des diagnósticos ni precios. Respondé JSON {\"consejo\": \"...\"}.", true)
          .then(function (t) { var j = JSON.parse(t); if (j.consejo && $("#consejo")) $("#consejo").textContent = j.consejo; }).catch(function () {});
      }
    };
  }
  pintar();

  /* ---------- Formulario de contacto ---------- */
  $("#form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, nom = f.nombre.value.trim(), tel = f.telefono.value.trim(), con = f.consulta.value.trim();
    if (!nom || !telOk(tel)) { $("#formErr").textContent = "Completá tu nombre y un WhatsApp válido."; return; }
    $("#formErr").textContent = "";
    guardarContacto({ nombre: nom, telefono: tel, consulta: con, tipo: "formulario" });
    $("#formOk").style.display = "block";
    open(wa("Hola Nácar! Soy " + nom + " (" + tel + "). " + (con || "Quiero pedir un turno.")), "_blank");
    f.reset();
  });

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), fab = $("#aiFab"), chatM = $("#chatM"), chatI = $("#chatI"), hist = [];
  var SUG = ["¿Atienden urgencias hoy?", "¿Cuánto sale un implante?", "¿Trabajan con prepagas?", "¿Dónde están?"];
  function abrir() { chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none"; if (!chatM.children.length) saludo(); setTimeout(function () { chatI.focus(); }, 250); }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.addEventListener("click", abrir); $("#chatX").addEventListener("click", cerrar);
  function burbuja(cls, texto) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = texto; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(texto, consulta) {
    var d = burbuja("b", texto);
    var a = document.createElement("a"); a.className = "wa"; a.target = "_blank"; a.rel = "noopener";
    a.href = wa("Hola Nácar! " + (consulta ? "Consulté en la web: " + consulta : "Quiero pedir un turno.")); a.textContent = "Seguir por WhatsApp ›";
    d.appendChild(document.createElement("br")); d.appendChild(a);
    chatM.scrollTop = chatM.scrollHeight;
  }
  function saludo() {
    burbuja("b", "¡Hola! Soy Nácar IA 👋 Te ayudo con turnos, tratamientos, valores de referencia y coberturas. ¿Qué querés saber?");
    $("#chatC").innerHTML = SUG.map(function (s) { return "<button type=\"button\">" + esc(s) + "</button>"; }).join("");
    $$("#chatC button").forEach(function (b) { b.onclick = function () { preguntar(b.textContent); }; });
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function local(q) {
    var n = norm(q);
    for (var k in T) {
      var t = T[k], claves = { control: ["limpieza", "control", "sarro"], blanqueamiento: ["blanque"], alineadores: ["ortodoncia", "alineador", "invisible", "bracket"], implante: ["implante"], carillas: ["carilla", "diseno de sonrisa"], urgencia: ["urgencia"] }[k];
      if (claves.some(function (c) { return n.indexOf(c) > -1; }) && /(cuanto|precio|sale|cuesta|valor|costo)/.test(n))
        return t.nombre + ": entre " + rango(t) + " como valor orientativo (" + t.sesiones + "). El precio final te lo damos por escrito después del diagnóstico. Si querés, probá el planificador de esta página.";
    }
    if (/(donde|direccion|ubicad|llego|queda)/.test(n)) return "Estamos en " + N.direccion + ", " + N.ciudad + ", a media cuadra de Plaza España.";
    if (/(horario|abren|atienden.*(sabado|domingo)|hora)/.test(n)) return N.horario + ". " + N.urgencias + ".";
    var mejor = null, puntos = 0;
    FAQ.forEach(function (f) { var p = f[2].filter(function (c) { return n.indexOf(norm(c)) > -1; }).length; if (p > puntos) { puntos = p; mejor = f; } });
    if (mejor) return mejor[1];
    if (/(precio|cuanto|sale|cuesta)/.test(n)) return "Depende del tratamiento. La primera consulta con diagnóstico 3D sale " + ars(C.consultaInicial) + " y te la descontamos si arrancás. ¿Sobre qué tratamiento querés saber?";
    if (/(turno|reserv|cita)/.test(n)) return "¡Dale! Escribinos por WhatsApp y te damos el primer turno libre. También podés usar el planificador de esta página para elegir día y horario.";
    return "Esa consulta te la responde mejor nuestro equipo por WhatsApp. Si querés, contame qué tratamiento te interesa y te paso un valor de referencia.";
  }
  function sistema() {
    var tr = Object.keys(T).map(function (k) { return "- " + T[k].nombre + ": " + rango(T[k]) + " (" + T[k].sesiones + ")"; }).join("\n");
    return "Sos Nácar IA, el asistente de " + N.nombre + " (" + N.direccion + ", " + N.ciudad + ", Argentina). Hablás en español rioplatense con voseo, cálido y breve (máx. 3 oraciones). " +
      "Horario: " + N.horario + ". " + N.urgencias + ". Primera consulta con diagnóstico 3D: " + ars(C.consultaInicial) + ", se descuenta si arranca el tratamiento.\nValores orientativos:\n" + tr +
      "\nPreguntas frecuentes:\n" + FAQ.map(function (f) { return "- " + f[0] + " " + f[1]; }).join("\n") +
      "\nNunca inventes datos que no estén acá ni des diagnósticos médicos. Aclará que los valores son orientativos. Invitá a usar el planificador de la página o a escribir por WhatsApp para el turno.";
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
      var o = { v: 0 };
      gsap.to(o, { v: fin, duration: 1.8, ease: "power2.out", delay: .5, onUpdate: function () { el.textContent = fmt(o.v); } });
    });
  }

  if (!window.gsap || reduced) { $$(".rv").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; }); contar(true); return; }
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".hero .rv", { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: .1, delay: .1 });
  gsap.from(".float", { opacity: 0, y: 24, scale: .96, duration: .9, ease: "power3.out", stagger: .14, delay: .7 });
  contar(false);

  $$(".rv").filter(function (e) { return !e.closest(".hero"); }).forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: .95, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" }, delay: (Array.prototype.indexOf.call(el.parentNode.children, el) % 4) * .07 });
  });

  $$("[data-par]").forEach(function (img) {
    var d = +img.dataset.par;
    gsap.fromTo(img, { yPercent: -d / 2 }, { yPercent: d / 2 - 8, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  gsap.to("#lineFill", { width: "100%", ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 60%", scrub: true } });
  $$(".step").forEach(function (s, i) {
    ScrollTrigger.create({ trigger: "#steps", start: "top+=" + (i * 60) + " 72%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } });
  });

  if (matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotateY: x * 7, rotateX: -y * 7, y: -4, transformPerspective: 900, duration: .4, ease: "power2.out" });
      });
      c.addEventListener("mouseleave", function () { gsap.to(c, { rotateY: 0, rotateX: 0, y: 0, duration: .6, ease: "power3.out" }); });
    });
  }
})();

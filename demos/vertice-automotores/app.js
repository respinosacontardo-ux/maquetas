/* Vértice Automotores (demo): stock, calculadora de cuotas, asistente con IA, contactos y animaciones. */
(function () {
  var C = window.CONFIG, N = C.negocio, F = C.financiacion, STOCK = C.stock;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function usd(n) { return "USD " + Math.round(n).toLocaleString("es-AR"); }
  function ars(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }
  function km(n) { return n.toLocaleString("es-AR") + " km"; }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nombre(a) { return a.marca + " " + a.modelo; }
  function img(id, w) { return "https://images.unsplash.com/" + id + "?w=" + (w || 900) + "&q=80&auto=format&fit=crop"; }
  var DEPORTIVOS = ["f458", "r8"];

  /* ---------- Básicos ---------- */
  function enlazarWA(scope) { $$("[data-wa]", scope).forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; }); }
  enlazarWA();
  $("#cDir").textContent = N.direccion;
  $("#cHor").textContent = N.horario;
  $("#cExt").textContent = N.extra;

  var hdr = $("#hdr"), burger = $("#burger");
  function solid() { hdr.classList.toggle("solid", scrollY > 10 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  burger.addEventListener("click", function () { var o = hdr.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.textContent = o ? "× Cerrar" : "+ Menú"; solid(); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); burger.setAttribute("aria-expanded", false); burger.textContent = "+ Menú"; solid(); }); });

  /* ---------- Stock con filtros ---------- */
  var FILTROS = [["todos", "Todos"], ["suv", "SUV"], ["dep", "Deportivos"], ["80", "Hasta USD 80.000"]], filtro = "todos";
  function tarjeta(a) {
    var foto = a.foto ? '<img src="' + img(a.foto) + '" alt="' + esc(nombre(a)) + " " + a.anio + '" loading="lazy">'
      : "<div><b>" + esc(a.modelo) + "</b><span>Lo viste arriba en 3D · Deslizá hasta el inicio</span></div>";
    return '<article class="car rv' + (a.foto ? "" : " feat") + '"><div class="ph">' + foto + '<span class="t">' + esc(a.tag) + "</span></div>" +
      '<div class="bd"><h3><small>' + esc(a.marca) + " · " + a.anio + "</small>" + esc(a.modelo) + "</h3>" +
      '<div class="meta"><span>' + km(a.km) + "</span><span>" + esc(a.motor) + "</span><span>" + esc(a.caja) + "</span></div>" +
      '<div class="row"><span class="price"><small>USD</small>' + a.precio.toLocaleString("es-AR") + '</span><a data-wa="Hola Vértice! Me interesa el ' + esc(nombre(a)) + " " + a.anio + ' (' + km(a.km) + '). ¿Sigue disponible?">Consultar ›</a></div></div></article>';
  }
  function pintarStock() {
    var lista = STOCK.filter(function (a) {
      if (filtro === "suv") return DEPORTIVOS.indexOf(a.id) < 0;
      if (filtro === "dep") return DEPORTIVOS.indexOf(a.id) > -1;
      if (filtro === "80") return a.precio <= 80000;
      return true;
    });
    var g = $("#stockGrid");
    g.innerHTML = lista.map(tarjeta).join("");
    enlazarWA(g);
    if (window.gsap && !reduced && arranco) gsap.fromTo($$(".car", g), { opacity: 0, y: 40, rotateX: 14, transformPerspective: 1000 }, { opacity: 1, y: 0, rotateX: 0, duration: .8, stagger: .07, ease: "power3.out", clearProps: "transform" });
    else $$(".car", g).forEach(function (c) { if (arranco || reduced) { c.style.opacity = 1; c.style.transform = "none"; } });
  }
  var arranco = false;
  $("#filters").innerHTML = FILTROS.map(function (f) { return '<button type="button" class="fbtn' + (f[0] === filtro ? " on" : "") + '" data-f="' + f[0] + '">' + f[1] + "</button>"; }).join("");
  $$("#filters .fbtn").forEach(function (b) { b.onclick = function () { filtro = b.dataset.f; $$("#filters .fbtn").forEach(function (x) { x.classList.toggle("on", x === b); }); pintarStock(); }; });
  pintarStock();

  /* ---------- Preguntas frecuentes ---------- */
  var FAQ = [
    ["¿Los autos tienen garantía?", "Sí. Todos los usados tienen 12 meses de garantía escrita sobre motor y caja, y los que todavía tienen garantía oficial de fábrica la conservan.", ["garantia", "garantía", "falla", "se rompe"]],
    ["¿Toman mi usado como parte de pago?", "Sí. Lo tasamos en el día a valor de mercado, con revisión en nuestro taller, y lo descontamos del precio del auto que elegís.", ["usado", "parte de pago", "permuta", "entrego", "tasa", "toman"]],
    ["¿Cómo funciona la financiación?", "Trabajamos con créditos prendarios en pesos de bancos y financieras, hasta 48 cuotas y hasta el 70 % del valor del auto. La pre-aprobación sale en 24 h.", ["financ", "cuota", "credito", "crédito", "prendario", "banco", "tasa"]],
    ["¿Puedo hacer un test drive?", "Sí, con turno: en el showroom o a domicilio dentro de Córdoba capital. Solo necesitás tu registro vigente.", ["test", "probar", "manejar", "prueba"]],
    ["¿Los precios son en dólares?", "Los autos se publican en dólares, como es habitual en el mercado de importados. Se pueden pagar en dólares o en pesos al tipo de cambio del día, y la parte financiada se toma en pesos.", ["dolar", "dólar", "peso", "precio", "moneda", "cambio"]],
    ["¿Se encargan de la transferencia?", "Sí. La gestoría está incluida: transferencia, formulario 08, verificación policial y cambio de radicación si hace falta.", ["transfer", "papeles", "gestor", "08", "verificacion", "patente"]],
    ["¿Consiguen autos que no están en stock?", "Sí. Buscamos e importamos por pedido el modelo, año y color que quieras, con la misma revisión y garantía.", ["pedido", "conseguir", "importar", "no tienen", "buscan", "color"]],
    ["¿Hacen envíos al interior?", "Sí. Entregamos en todo el país con transporte asegurado, y la documentación viaja con el auto.", ["envio", "envío", "interior", "otra provincia", "mandan", "llevan"]]
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

  /* ---------- Contactos ---------- */
  function guardarContacto(datos) {
    datos.fecha = new Date().toISOString(); datos.origen = N.nombre + " (web)";
    try {
      if (C.contactos.appsScriptUrl) return fetch(C.contactos.appsScriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
      if (C.contactos.formsubmitEmail) return fetch("https://formsubmit.co/ajax/" + C.contactos.formsubmitEmail, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) }).then(function () { return true; }).catch(function () { return false; });
    } catch (e) {}
    return Promise.resolve(false);
  }
  function telOk(t) { return String(t).replace(/\D/g, "").length >= 8; }

  /* ---------- Calculadora de cuotas (4 pasos) ---------- */
  var tool = $("#tool"), paso = 1, S = { auto: null, entrega: null, usado: 0, anticipo: 0, plazo: null, nombre: "", tel: "", email: "" };
  function auto() { return STOCK.filter(function (a) { return a.id === S.auto; })[0]; }
  function calc() {
    var a = auto(), precio = a ? a.precio : 0, usado = S.entrega === "Sí" ? Math.max(0, +S.usado || 0) : 0;
    var saldo = Math.max(0, precio - usado - S.anticipo), max = precio * F.maxFinanciable;
    var n = S.plazo || 24, i = F.tna / 12, P = saldo * F.tipoCambio;
    var cuota = P > 0 ? P * i / (1 - Math.pow(1 + i, -n)) : 0;
    return { precio: precio, usado: usado, saldo: saldo, max: max, ok: saldo <= max, pesos: P, cuota: cuota, total: cuota * n, n: n };
  }
  function chips(nombre, lista, valor) {
    return '<div class="chips">' + lista.map(function (x) { return '<button type="button" class="chip' + (String(valor) === String(x) ? " sel" : "") + '" data-' + nombre + '="' + esc(x) + '">' + esc(x) + (nombre === "plazo" ? " cuotas" : "") + "</button>"; }).join("") + "</div>";
  }
  function navBtns(puede, texto) {
    return '<div class="tool-nav">' + (paso > 1 ? '<button type="button" class="btn btn-g" data-atras>‹ Volver</button>' : "<span></span>") +
      '<button type="button" class="btn btn-p" data-sig' + (puede ? "" : " disabled") + ">" + texto + "</button></div>";
  }
  function cabecera(titulo, sub) {
    return '<div class="prog"><i style="width:' + (paso * 25) + '%"></i></div><p class="pstep">Paso ' + Math.min(paso, 4) + " de 4</p><h3>" + titulo + '</h3><p class="sub">' + sub + "</p>";
  }
  function paso2Resumen() {
    var c = calc();
    return '<div class="res-row"><span>A financiar</span><b>' + usd(c.saldo) + "</b></div>" +
      (c.ok ? '<p class="note">Financiamos hasta el ' + Math.round(F.maxFinanciable * 100) + " % del valor (" + usd(c.max) + ").</p>"
        : '<p class="err">Para financiar, el saldo no puede superar el ' + Math.round(F.maxFinanciable * 100) + " % del valor (" + usd(c.max) + "). Subí el anticipo o el valor de tu usado.</p>");
  }

  function pintar() {
    var h = "";
    if (paso === 1) {
      h = cabecera("¿Qué auto te gusta?", "Elegí uno del stock. Los valores son de referencia.") + '<div class="opts">' + STOCK.map(function (a) {
        return '<button type="button" class="opt' + (S.auto === a.id ? " sel" : "") + '" data-auto="' + a.id + '"><b>' + esc(nombre(a)) + "</b><span>" + a.anio + " · " + usd(a.precio) + "</span></button>";
      }).join("") + "</div>" + navBtns(!!S.auto, "Siguiente");
    } else if (paso === 2) {
      var a = auto(), c = calc(), maxAnt = Math.max(0, a.precio - c.usado);
      if (S.anticipo > maxAnt) S.anticipo = maxAnt;
      h = cabecera("¿Cuánto ponés?", "Sumá tu usado y el anticipo en efectivo. El resto lo financiamos en pesos.") +
        '<p class="qlabel">¿Entregás un usado?</p>' + chips("entrega", ["No", "Sí"], S.entrega) +
        (S.entrega === "Sí" ? '<label class="fld" style="margin-top:16px"><span>Valor estimado de tu usado (USD)</span><input id="pUsado" type="number" inputmode="numeric" min="0" step="500" placeholder="Ej.: 18000" value="' + (S.usado || "") + '"></label>' : "") +
        '<p class="qlabel" style="margin-top:22px">Anticipo en efectivo</p>' +
        '<div class="rngv"><span>USD 0</span><b id="antV">' + usd(S.anticipo) + "</b><span id=\"antMax\">" + usd(maxAnt) + "</span></div>" +
        '<input class="rng" id="pAnt" type="range" min="0" max="' + maxAnt + '" step="1000" value="' + S.anticipo + '" aria-label="Anticipo en dólares">' +
        '<div id="p2res">' + paso2Resumen() + "</div>" + navBtns(!!S.entrega && c.ok, "Siguiente");
    } else if (paso === 3) {
      h = cabecera("¿En cuántas cuotas?", "Cuotas fijas en pesos, sistema francés.") + chips("plazo", F.plazos, S.plazo) +
        (S.plazo ? '<div style="margin-top:24px">' + resumenCuota() + "</div>" : "") + navBtns(!!S.plazo, "Siguiente");
    } else if (paso === 4) {
      h = cabecera("¿A dónde te mandamos la propuesta?", "Un asesor te escribe con la tasa final del banco. No compartimos tus datos.") +
        '<label class="fld"><span>Nombre</span><input id="pNom" autocomplete="name" value="' + esc(S.nombre) + '"></label>' +
        '<label class="fld"><span>WhatsApp</span><input id="pTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="351 555 1234" value="' + esc(S.tel) + '"></label>' +
        '<label class="fld"><span>Email (opcional)</span><input id="pMail" type="email" autocomplete="email" value="' + esc(S.email) + '"></label>' +
        '<p class="err" id="pErr"></p>' + navBtns(true, "Ver mi propuesta");
    } else h = resultado();
    tool.innerHTML = h;
    enlazar();
  }
  function resumenCuota() {
    var c = calc();
    return '<div class="res-top"><small>Cuota estimada</small><b>' + ars(c.cuota) + '</b><span>por mes · ' + c.n + " cuotas fijas</span></div>";
  }
  function resultado() {
    var a = auto(), c = calc();
    return '<div class="prog"><i style="width:100%"></i></div><p class="pstep">Tu propuesta</p>' +
      "<h3>" + esc(S.nombre.split(" ")[0] || "Listo") + ", este es tu " + esc(a.modelo) + "</h3>" +
      '<div class="res">' + resumenCuota() +
      '<div><div class="res-row"><span>Auto</span><b>' + esc(nombre(a)) + " " + a.anio + "</b></div>" +
      '<div class="res-row"><span>Precio</span><b>' + usd(c.precio) + "</b></div>" +
      (c.usado ? '<div class="res-row"><span>Tu usado (a tasar)</span><b>− ' + usd(c.usado) + "</b></div>" : "") +
      '<div class="res-row"><span>Anticipo</span><b>− ' + usd(S.anticipo) + "</b></div>" +
      '<div class="res-row"><span>Saldo financiado</span><b>' + usd(c.saldo) + " · " + ars(c.pesos) + "</b></div>" +
      '<div class="res-row"><span>Total en cuotas</span><b>' + ars(c.total) + "</b></div></div>" +
      '<p class="note">Estimación orientativa: tasa nominal anual de referencia del ' + Math.round(F.tna * 100) + " % y dólar a " + ars(F.tipoCambio) + ". La cuota final depende de la aprobación crediticia, la tasa del banco y la tasación de tu usado. Valores de ejemplo de esta web demo.</p>" +
      '<div class="tool-nav"><button type="button" class="btn btn-g" data-reini>‹ Empezar de nuevo</button><a class="btn btn-p" target="_blank" rel="noopener" href="' + wa(resumenWA()) + '">Reservar por WhatsApp</a></div></div>';
  }
  function resumenWA() {
    var a = auto(), c = calc();
    return "Hola Vértice! Soy " + S.nombre + ". Calculé mi cuota en la web:\n• Auto: " + nombre(a) + " " + a.anio + " (" + usd(a.precio) + ")\n• Usado: " + (c.usado ? usd(c.usado) : "no entrego") + "\n• Anticipo: " + usd(S.anticipo) + "\n• " + c.n + " cuotas de " + ars(c.cuota) + " (estimado)\n¿Me confirman la tasa y la disponibilidad?";
  }
  function enlazar() {
    $$("[data-auto]", tool).forEach(function (b) { b.onclick = function () { S.auto = b.dataset.auto; S.anticipo = 0; pintar(); }; });
    $$("[data-entrega]", tool).forEach(function (b) { b.onclick = function () { S.entrega = b.dataset.entrega; pintar(); }; });
    $$("[data-plazo]", tool).forEach(function (b) { b.onclick = function () { S.plazo = +b.dataset.plazo; pintar(); }; });
    var u = $("#pUsado", tool);
    if (u) u.onchange = function () { S.usado = Math.max(0, +u.value || 0); pintar(); };
    var r = $("#pAnt", tool);
    if (r) r.oninput = function () {
      S.anticipo = +r.value; $("#antV").textContent = usd(S.anticipo); $("#p2res").innerHTML = paso2Resumen();
      var sig = $("[data-sig]", tool), c = calc(); if (sig) sig.disabled = !(S.entrega && c.ok);
    };
    var atras = $("[data-atras]", tool); if (atras) atras.onclick = function () { paso--; pintar(); };
    var re = $("[data-reini]", tool); if (re) re.onclick = function () { paso = 1; S.auto = S.entrega = S.plazo = null; S.usado = S.anticipo = 0; pintar(); };
    var sig = $("[data-sig]", tool);
    if (sig) sig.onclick = function () {
      if (paso < 4) { paso++; pintar(); return; }
      S.nombre = $("#pNom").value.trim(); S.tel = $("#pTel").value.trim(); S.email = $("#pMail").value.trim();
      if (!S.nombre || !telOk(S.tel)) { $("#pErr").textContent = "Completá tu nombre y un WhatsApp válido para ver tu propuesta."; return; }
      var a = auto(), c = calc();
      guardarContacto({ nombre: S.nombre, telefono: S.tel, email: S.email, auto: nombre(a) + " " + a.anio, usado: c.usado, anticipo: S.anticipo, cuotas: c.n, cuota: Math.round(c.cuota) });
      paso = 5; pintar();
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
    open(wa("Hola Vértice! Soy " + nom + " (" + tel + "). " + (con || "Quiero hacer una consulta.")), "_blank");
    f.reset();
  });

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), fab = $("#aiFab"), chatM = $("#chatM"), chatI = $("#chatI"), hist = [];
  var SUG = ["¿Qué SUV tienen?", "¿Toman mi usado?", "¿Cómo es la financiación?", "¿Dónde están?"];
  function abrir() { chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none"; if (!chatM.children.length) saludo(); setTimeout(function () { chatI.focus(); }, 250); }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.addEventListener("click", abrir); $("#chatX").addEventListener("click", cerrar);
  function burbuja(cls, texto) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = texto; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(texto, consulta) {
    var d = burbuja("b", texto);
    var a = document.createElement("a"); a.className = "wa"; a.target = "_blank"; a.rel = "noopener";
    a.href = wa("Hola Vértice! " + (consulta ? "Consulté en la web: " + consulta : "Quiero hacer una consulta.")); a.textContent = "Hablar con un asesor ›";
    d.appendChild(document.createElement("br")); d.appendChild(a);
    chatM.scrollTop = chatM.scrollHeight;
  }
  function saludo() {
    burbuja("b", "¡Hola! Soy el asesor virtual de Vértice. Te ayudo con el stock, precios, financiación, tu usado y turnos de test drive. ¿Qué estás buscando?");
    $("#chatC").innerHTML = SUG.map(function (s) { return "<button type=\"button\">" + esc(s) + "</button>"; }).join("");
    $$("#chatC button").forEach(function (b) { b.onclick = function () { preguntar(b.textContent); }; });
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function local(q) {
    var n = norm(q);
    var hit = STOCK.filter(function (a) { return n.indexOf(norm(a.modelo.split(" ")[0])) > -1 || (n.indexOf(norm(a.marca)) > -1 && n.indexOf(norm(a.modelo.split(" ")[0])) > -1); });
    if (!hit.length) hit = STOCK.filter(function (a) { return n.indexOf(norm(a.marca)) > -1; });
    if (hit.length) return hit.map(function (a) { return nombre(a) + " " + a.anio + ", " + km(a.km) + ": " + usd(a.precio); }).join("\n") + "\nSi querés, calculá la cuota en la sección \"Calculá tu cuota\" o coordinamos un test drive.";
    if (/(suv|camioneta|familiar)/.test(n)) return "En SUV tenemos: " + STOCK.filter(function (a) { return DEPORTIVOS.indexOf(a.id) < 0; }).map(function (a) { return nombre(a) + " " + a.anio + " (" + usd(a.precio) + ")"; }).join(", ") + ".";
    if (/(deportiv|coupe|rapido)/.test(n)) return "En deportivos tenemos el Ferrari 458 Spider 2014 (" + usd(STOCK[0].precio) + ") y el Audi R8 V10 2019 (" + usd(STOCK[1].precio) + "). El Ferrari es el que viste en 3D al principio de la página.";
    if (/(donde|direccion|ubicad|llego|showroom)/.test(n)) return "El showroom está en " + N.direccion + ", " + N.ciudad + ". " + N.horario + ".";
    if (/(horario|abren|cierran|sabado|hora)/.test(n)) return N.horario + ". " + N.extra + ".";
    var mejor = null, puntos = 0;
    FAQ.forEach(function (f) { var p = f[2].filter(function (c) { return n.indexOf(norm(c)) > -1; }).length; if (p > puntos) { puntos = p; mejor = f; } });
    if (mejor) return mejor[1];
    if (/(precio|cuanto|sale|cuesta|barato)/.test(n)) return "El stock va de " + usd(Math.min.apply(null, STOCK.map(function (a) { return a.precio; }))) + " a " + usd(Math.max.apply(null, STOCK.map(function (a) { return a.precio; }))) + ". ¿Qué tipo de auto y presupuesto tenés en mente?";
    return "Esa te la responde mejor un asesor por WhatsApp. Si querés, contame qué auto y presupuesto buscás y te digo qué tenemos.";
  }
  function sistema() {
    var lista = STOCK.map(function (a) { return "- " + nombre(a) + " " + a.anio + ", " + km(a.km) + ", " + a.motor + ", " + usd(a.precio); }).join("\n");
    return "Sos el asesor virtual de " + N.nombre + ", concesionaria premium en " + N.direccion + ", " + N.ciudad + ", Argentina. Hablás en español rioplatense con voseo, profesional, cálido y breve (máx. 3 oraciones). " +
      "Horario: " + N.horario + ". " + N.extra + ".\nStock (precios de referencia en USD):\n" + lista +
      "\nFinanciación: créditos prendarios en pesos hasta " + F.plazos[F.plazos.length - 1] + " cuotas y hasta el " + Math.round(F.maxFinanciable * 100) + " % del valor.\nPreguntas frecuentes:\n" + FAQ.map(function (f) { return "- " + f[0] + " " + f[1]; }).join("\n") +
      "\nNunca inventes autos, precios ni condiciones que no estén acá. No cierres operaciones: invitá a usar la calculadora de cuotas o a hablar con un asesor por WhatsApp.";
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
      gsap.to(o, { v: fin, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%" }, onUpdate: function () { el.textContent = fmt(o.v); } });
    });
  }

  if (!window.gsap || reduced) { arranco = true; $$(".rv").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; }); contar(true); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(".hero .rv", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: .12, delay: .2 });
  contar(false);

  // Entradas en 3D: las tarjetas suben desde atrás, inclinadas, y se enderezan
  var TARJ = ".card,.car,.step,.q,.cbox,.tool,.plan-side";
  $$(".rv").filter(function (e) { return !e.closest(".hero"); }).forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el) % 4;
    if (el.matches(TARJ)) {
      gsap.fromTo(el, { opacity: 0, y: 90, z: -160, rotateX: 24, transformPerspective: 1100, transformOrigin: "50% 100%" },
        { opacity: 1, y: 0, z: 0, rotateX: 0, duration: 1.2, ease: "power3.out", delay: i * .08, clearProps: "transform", scrollTrigger: { trigger: el, start: "top 92%" } });
    } else {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, delay: i * .07 });
    }
  });
  arranco = true;

  // Titulares: se levantan en 3D ligados al scroll
  $$(".sec .head h2, .final h2").forEach(function (h) {
    gsap.fromTo(h, { rotateX: -50, transformPerspective: 700, transformOrigin: "50% 100%" }, { rotateX: 0, ease: "none", scrollTrigger: { trigger: h, start: "top 100%", end: "top 60%", scrub: true } });
  });

  gsap.to("#lineFill", { width: "100%", ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 60%", scrub: true } });
  $$(".step").forEach(function (s, i) {
    ScrollTrigger.create({ trigger: "#steps", start: "top+=" + (i * 60) + " 72%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } });
  });
})();

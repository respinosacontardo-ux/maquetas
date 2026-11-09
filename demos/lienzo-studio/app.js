/* Lienzo Studio (demo, tienda de ropa de lino): tienda con filtros, guía de talle y look, asistente con IA, contactos y animaciones. */
(function () {
  var C = window.CONFIG, N = C.negocio, P = C.pagos, PROD = C.productos, TALLES = C.talles;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ars(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }
  function cuota(n) { return ars(n / P.cuotasSinInteres); }
  function wa(texto) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(texto); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function img(id, w) { return "https://images.unsplash.com/" + id + "?w=" + (w || 800) + "&q=80&auto=format&fit=crop"; }

  /* ---------- Básicos ---------- */
  function enlazarWA(scope) { $$("[data-wa]", scope).forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; }); }
  enlazarWA();
  $("#cDir").textContent = N.direccion;
  $("#cHor").textContent = N.horario;
  $("#cExt").textContent = N.extra;

  var hdr = $("#hdr"), burger = $("#burger");
  function solid() { hdr.classList.toggle("solid", scrollY > 10 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  burger.addEventListener("click", function () { var o = hdr.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.textContent = o ? "Cerrar" : "Menú"; solid(); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); burger.setAttribute("aria-expanded", false); burger.textContent = "Menú"; solid(); }); });

  /* ---------- Tienda con filtros ---------- */
  var FILTROS = [["todo", "Todo"], ["vestido", "Vestidos"], ["pantalon", "Pantalones"], ["conjunto", "Conjuntos"], ["hombre", "Hombre"], ["70", "Hasta $70 mil"]], filtro = "todo";
  function tarjeta(a) {
    return '<article class="car rv"><div class="ph"><img src="' + img(a.foto) + '" alt="' + esc(a.nombre + ", " + a.detalle) + '" loading="lazy"><span class="t">' + esc(a.tag) + "</span></div>" +
      '<div class="bd"><h3>' + esc(a.nombre) + '</h3><p class="meta">' + esc(a.detalle) + "</p>" +
      '<div class="row"><span class="price">' + ars(a.precio) + "<small>" + P.cuotasSinInteres + " × " + cuota(a.precio) + " sin interés</small></span>" +
      '<a data-wa="Hola Lienzo! Me interesa el ' + esc(a.nombre) + " (" + ars(a.precio) + '). ¿Qué talles tienen?">Consultar talle ›</a></div></div></article>';
  }
  var arranco = false;
  function pintarTienda() {
    var lista = PROD.filter(function (a) {
      if (filtro === "todo") return true;
      if (filtro === "70") return a.precio <= 70000;
      return a.tipo === filtro;
    });
    var g = $("#stockGrid");
    g.innerHTML = lista.map(tarjeta).join("");
    enlazarWA(g);
    if (window.gsap && !reduced && arranco) gsap.fromTo($$(".car", g), { opacity: 0, y: 40, rotateX: 14, transformPerspective: 1000 }, { opacity: 1, y: 0, rotateX: 0, duration: .8, stagger: .07, ease: "power3.out", clearProps: "transform" });
    else $$(".car", g).forEach(function (c) { if (arranco || reduced) { c.style.opacity = 1; c.style.transform = "none"; } });
  }
  $("#filters").innerHTML = FILTROS.map(function (f) { return '<button type="button" class="fbtn' + (f[0] === filtro ? " on" : "") + '" data-f="' + f[0] + '">' + f[1] + "</button>"; }).join("");
  $$("#filters .fbtn").forEach(function (b) { b.onclick = function () { filtro = b.dataset.f; $$("#filters .fbtn").forEach(function (x) { x.classList.toggle("on", x === b); }); pintarTienda(); }; });
  pintarTienda();

  /* ---------- Preguntas frecuentes ---------- */
  var FAQ = [
    ["¿Hacen envíos a todo el país?", "Sí. En CABA y GBA llega en 24 a 48 h y al interior en 3 a 6 días hábiles, con seguimiento. El envío es gratis en compras desde " + ars(P.envioGratisDesde) + ".", ["envio", "envío", "mandan", "interior", "provincia", "llega", "demora", "tarda"]],
    ["¿Cómo sé qué talle me va?", "Usá la guía \"Tu talle y tu look\" de esta página: con tu contorno de cadera te decimos el talle. Si dudás entre dos, escribinos por WhatsApp y te asesoramos según el calce que te guste.", ["talle", "medida", "queda", "calce", "tamaño", "grande", "chico"]],
    ["¿Puedo cambiar una prenda?", "Sí, tenés " + P.cambiosDias + " días para cambiarla, sin usar y con la etiqueta. En el showroom es sin cargo; por correo te pasamos una etiqueta de envío.", ["cambio", "cambiar", "devol", "no me queda"]],
    ["¿Cuáles son los medios de pago?", "Tarjetas de crédito en " + P.cuotasSinInteres + " cuotas sin interés, débito, Mercado Pago y transferencia con " + Math.round(P.descTransferencia * 100) + " % de descuento.", ["pago", "pagar", "cuota", "tarjeta", "transfer", "mercado", "descuento", "efectivo"]],
    ["¿Cómo se cuida el lino?", "Lavarropas en frío con programa delicado, sin secarropas, y secado a la sombra. Se plancha húmedo a temperatura media. Con cada lavado queda más suave.", ["lavar", "cuidado", "plancha", "arruga", "encoge", "lino"]],
    ["¿Tienen local para probarme?", "Sí, el showroom está en " + N.direccion + ". " + N.horario + ". También podés comprar online y retirar sin cargo.", ["local", "showroom", "probar", "direccion", "dirección", "donde", "dónde", "retiro", "retirar"]],
    ["¿Hacen talles grandes?", "La colección va de XS a XXL y medimos cada prenda terminada. Si buscás un talle que no aparece, preguntanos: algunos modelos se hacen a pedido.", ["xxl", "grande", "especial", "plus"]],
    ["¿Venden por mayor?", "Sí, tenemos una lista mayorista para tiendas, con compra mínima. Escribinos por WhatsApp y te la mandamos.", ["mayor", "mayorista", "revend", "local propio", "por cantidad"]]
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
  function telOk(t) { return String(t).replace(/\D/g, "").length >= 8; }

  /* ---------- Guía de talle y look (4 pasos) ---------- */
  var OCASIONES = [["Día a día", "Oficina, facultad, mandados"], ["Finde y playa", "Viajes, pileta, verano"], ["Evento de día", "Casamiento, bautismo, almuerzo"], ["Viaje", "Pocas prendas que combinen"]];
  var PRENDAS = [["vestido", "Vestidos"], ["pantalon", "Pantalones"], ["conjunto", "Conjuntos y monos"], ["hombre", "Hombre"]];
  var TONOS = [["tierra", "Tierra"], ["claro", "Claros"], ["color", "Con color"]];
  var tool = $("#tool"), paso = 1, S = { ocasion: null, prenda: null, tono: null, cadera: 98, calce: "Al cuerpo", nombre: "", tel: "", email: "" };

  function talle() {
    var c = S.cadera + (S.calce === "Holgado" ? 4 : 0);
    for (var i = 0; i < TALLES.length; i++) if (c <= TALLES[i][1]) return TALLES[i][0];
    return TALLES[TALLES.length - 1][0];
  }
  function recomendados() {
    var puntaje = function (p) {
      var s = 0;
      if (p.tipo === S.prenda) s += 3;
      if (p.tono === S.tono) s += 2;
      if (S.ocasion === "Evento de día" && p.tipo === "vestido") s += 1;
      if (S.ocasion === "Viaje" && (p.tipo === "conjunto" || p.tipo === "pantalon")) s += 1;
      if (S.ocasion === "Finde y playa" && p.tono !== "tierra") s += 1;
      if (S.prenda !== "hombre" && p.tipo === "hombre") s -= 5;
      if (S.prenda === "hombre" && p.tipo !== "hombre") s -= 1;
      return s;
    };
    return PROD.slice().sort(function (a, b) { return puntaje(b) - puntaje(a); }).slice(0, 3);
  }
  function opts(nombre, lista, valor) {
    return '<div class="opts">' + lista.map(function (x) {
      var v = x[0], t = x[1];
      return '<button type="button" class="opt' + (valor === v ? " sel" : "") + '" data-' + nombre + '="' + esc(v) + '"><b>' + esc(nombre === "ocasion" ? v : t) + "</b>" + (nombre === "ocasion" ? "<span>" + esc(t) + "</span>" : "") + "</button>";
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
    var h = "";
    if (paso === 1) {
      h = cabecera("¿Para qué lo querés?", "Elegí la ocasión y te armamos el look.") + opts("ocasion", OCASIONES, S.ocasion) + navBtns(!!S.ocasion, "Siguiente");
    } else if (paso === 2) {
      h = cabecera("¿Qué te gusta usar?", "Elegí el tipo de prenda y los tonos que más usás.") +
        '<p class="qlabel">Prenda</p>' + chips("prenda", PRENDAS, S.prenda) +
        '<p class="qlabel" style="margin-top:22px">Tonos</p>' + chips("tono", TONOS, S.tono) + navBtns(!!(S.prenda && S.tono), "Siguiente");
    } else if (paso === 3) {
      h = cabecera("Tus medidas", "Medí la parte más ancha de la cadera con un centímetro, sin apretar.") +
        '<p class="qlabel">Contorno de cadera</p><div class="rngv"><span>80 cm</span><b id="cadV">' + S.cadera + ' cm</b><span>130 cm</span></div>' +
        '<input class="rng" id="pCad" type="range" min="80" max="130" step="1" value="' + S.cadera + '" aria-label="Contorno de cadera en centímetros">' +
        '<p class="qlabel" style="margin-top:22px">¿Cómo te gusta que te quede?</p>' + chips("calce", [["Al cuerpo", "Al cuerpo"], ["Holgado", "Holgado"]], S.calce) +
        '<div class="res-top" style="margin-top:24px"><small>Tu talle estimado</small><b id="talleV">' + talle() + "</b><span>Según la tabla de talles de la colección</span></div>" + navBtns(true, "Siguiente");
    } else if (paso === 4) {
      h = cabecera("¿A dónde te mandamos tu look?", "Te escribimos con tu talle y la disponibilidad. No compartimos tus datos.") +
        '<label class="fld"><span>Nombre</span><input id="pNom" autocomplete="name" value="' + esc(S.nombre) + '"></label>' +
        '<label class="fld"><span>WhatsApp</span><input id="pTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="11 5555 1234" value="' + esc(S.tel) + '"></label>' +
        '<label class="fld"><span>Email (opcional)</span><input id="pMail" type="email" autocomplete="email" value="' + esc(S.email) + '"></label>' +
        '<p class="err" id="pErr"></p>' + navBtns(true, "Ver mi look");
    } else h = resultado();
    tool.innerHTML = h;
    enlazar();
  }
  function resultado() {
    var r = recomendados(), t = talle();
    return '<div class="prog"><i style="width:100%"></i></div><p class="pstep">Tu look</p>' +
      "<h3>" + esc(S.nombre.split(" ")[0] || "Listo") + ", este es tu look</h3>" +
      '<div class="res"><div class="res-top"><small>Tu talle sugerido</small><b>' + t + "</b><span>" + esc(S.ocasion) + " · " + esc(S.calce.toLowerCase()) + "</span></div>" +
      '<div class="picks">' + r.map(function (p) { return '<div class="pick"><img src="' + img(p.foto, 400) + '" alt="' + esc(p.nombre) + '" loading="lazy"><div><b>' + esc(p.nombre) + "</b>" + ars(p.precio) + "</div></div>"; }).join("") + "</div>" +
      '<p class="note">Recomendación orientativa según la tabla de talles de la colección: cada prenda tiene su calce y el talle final te lo confirmamos por WhatsApp antes de pagar. Productos y precios de ejemplo de esta web demo.</p>' +
      '<div class="tool-nav"><button type="button" class="btn btn-g" data-reini>‹ Empezar de nuevo</button><a class="btn btn-p" target="_blank" rel="noopener" href="' + wa(resumenWA(r, t)) + '">Pedirlo por WhatsApp</a></div></div>';
  }
  function resumenWA(r, t) {
    return "Hola Lienzo! Soy " + S.nombre + ". Hice la guía de talles en la web:\n• Ocasión: " + S.ocasion + "\n• Cadera: " + S.cadera + " cm (" + S.calce.toLowerCase() + ") → talle " + t + "\n• Me gustaron: " + r.map(function (p) { return p.nombre; }).join(", ") + "\n¿Tienen mi talle?";
  }
  function enlazar() {
    $$("[data-ocasion]", tool).forEach(function (b) { b.onclick = function () { S.ocasion = b.dataset.ocasion; pintar(); }; });
    $$("[data-prenda]", tool).forEach(function (b) { b.onclick = function () { S.prenda = b.dataset.prenda; pintar(); }; });
    $$("[data-tono]", tool).forEach(function (b) { b.onclick = function () { S.tono = b.dataset.tono; pintar(); }; });
    $$("[data-calce]", tool).forEach(function (b) { b.onclick = function () { S.calce = b.dataset.calce; pintar(); }; });
    var r = $("#pCad", tool);
    if (r) r.oninput = function () { S.cadera = +r.value; $("#cadV").textContent = S.cadera + " cm"; $("#talleV").textContent = talle(); };
    var atras = $("[data-atras]", tool); if (atras) atras.onclick = function () { paso--; pintar(); };
    var re = $("[data-reini]", tool); if (re) re.onclick = function () { paso = 1; S.ocasion = S.prenda = S.tono = null; pintar(); };
    var sig = $("[data-sig]", tool);
    if (sig) sig.onclick = function () {
      if (paso < 4) { paso++; pintar(); return; }
      S.nombre = $("#pNom").value.trim(); S.tel = $("#pTel").value.trim(); S.email = $("#pMail").value.trim();
      if (!S.nombre || !telOk(S.tel)) { $("#pErr").textContent = "Completá tu nombre y un WhatsApp válido para ver tu look."; return; }
      guardarContacto({ nombre: S.nombre, telefono: S.tel, email: S.email, ocasion: S.ocasion, prenda: S.prenda, tono: S.tono, cadera: S.cadera, talle: talle() });
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
    open(wa("Hola Lienzo! Soy " + nom + " (" + tel + "). " + (con || "Quiero hacer una consulta.")), "_blank");
    f.reset();
  });

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), fab = $("#aiFab"), chatM = $("#chatM"), chatI = $("#chatI"), hist = [];
  var SUG = ["¿Qué vestidos tienen?", "¿Cómo sé mi talle?", "¿Hacen envíos?", "¿Dónde está el local?"];
  function abrir() { chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none"; if (!chatM.children.length) saludo(); setTimeout(function () { chatI.focus(); }, 250); }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.addEventListener("click", abrir); $("#chatX").addEventListener("click", cerrar);
  function burbuja(cls, texto) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = texto; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(texto, consulta) {
    var d = burbuja("b", texto);
    var a = document.createElement("a"); a.className = "wa"; a.target = "_blank"; a.rel = "noopener";
    a.href = wa("Hola Lienzo! " + (consulta ? "Consulté en la web: " + consulta : "Quiero hacer una consulta.")); a.textContent = "Seguir por WhatsApp ›";
    d.appendChild(document.createElement("br")); d.appendChild(a);
    chatM.scrollTop = chatM.scrollHeight;
  }
  function saludo() {
    burbuja("b", "¡Hola! Soy la asistente virtual de Lienzo. Te ayudo con la colección, talles, envíos, cambios y medios de pago. ¿Qué estás buscando?");
    $("#chatC").innerHTML = SUG.map(function (s) { return "<button type=\"button\">" + esc(s) + "</button>"; }).join("");
    $$("#chatC button").forEach(function (b) { b.onclick = function () { preguntar(b.textContent); }; });
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function lista(arr) { return arr.map(function (p) { return p.nombre + " (" + ars(p.precio) + ")"; }).join(", "); }
  function local(q) {
    var n = norm(q);
    var hit = PROD.filter(function (p) { return new RegExp("\\b" + norm(p.nombre.split(" ")[1] || "-") + "\\b").test(n); });
    if (hit.length) return hit.map(function (p) { return p.nombre + ": " + p.detalle.toLowerCase() + ", " + ars(p.precio) + " o " + P.cuotasSinInteres + " cuotas de " + cuota(p.precio) + " sin interés."; }).join("\n") + "\n¿Querés que te confirme tu talle?";
    if (/vestido|solero/.test(n)) return "Vestidos de la colección: " + lista(PROD.filter(function (p) { return p.tipo === "vestido"; })) + ".";
    if (/pantalon/.test(n)) return "Pantalones: " + lista(PROD.filter(function (p) { return p.tipo === "pantalon"; })) + ".";
    if (/hombre|camisa/.test(n)) return "Para hombre tenemos la " + lista(PROD.filter(function (p) { return p.tipo === "hombre"; })) + ". Pronto suman más modelos.";
    if (/conjunto|mono|enterito/.test(n)) return "Conjuntos y monos: " + lista(PROD.filter(function (p) { return p.tipo === "conjunto"; })) + ".";
    if (/horario|abren|cierran|domingo|sabado/.test(n)) return N.horario + ". " + N.extra + ".";
    var mejor = null, puntos = 0;
    FAQ.forEach(function (f) { var p = f[2].filter(function (c) { return n.indexOf(norm(c)) > -1; }).length; if (p > puntos) { puntos = p; mejor = f; } });
    if (mejor) return mejor[1];
    if (/precio|cuanto|sale|cuesta|barato/.test(n)) return "La colección va de " + ars(Math.min.apply(null, PROD.map(function (p) { return p.precio; }))) + " a " + ars(Math.max.apply(null, PROD.map(function (p) { return p.precio; }))) + ", en " + P.cuotasSinInteres + " cuotas sin interés o con " + Math.round(P.descTransferencia * 100) + " % off por transferencia.";
    return "Eso te lo respondemos mejor por WhatsApp. Si querés, contame qué prenda buscás y para qué ocasión, y te recomiendo.";
  }
  function sistema() {
    var l = PROD.map(function (p) { return "- " + p.nombre + ": " + p.detalle + ", " + ars(p.precio); }).join("\n");
    return "Sos la asistente virtual de " + N.nombre + ", tienda de ropa de lino hecha en Buenos Aires, con showroom en " + N.direccion + ", " + N.ciudad + ", Argentina. Hablás en español rioplatense con voseo, cálida, con buen gusto y breve (máx. 3 oraciones). " +
      "Horario: " + N.horario + ". " + N.extra + ".\nColección (precios en pesos):\n" + l +
      "\nPagos: " + P.cuotasSinInteres + " cuotas sin interés con tarjeta, " + Math.round(P.descTransferencia * 100) + " % off por transferencia. Envío gratis desde " + ars(P.envioGratisDesde) + ". Cambios en " + P.cambiosDias + " días. Talles XS a XXL.\nPreguntas frecuentes:\n" + FAQ.map(function (f) { return "- " + f[0] + " " + f[1]; }).join("\n") +
      "\nNunca inventes prendas, colores, precios ni stock que no estén acá. Para el talle, invitá a usar la guía \"Tu talle y tu look\"; para comprar, a escribir por WhatsApp.";
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
  var TARJ = ".card,.car,.step,.q,.cbox,.tool,.plan-side,.look figure";
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

  // Lookbook: las fotos se desplazan dentro de su marco (parallax)
  $$("[data-par]").forEach(function (im, i) {
    gsap.fromTo(im, { yPercent: -8, scale: 1.16 }, { yPercent: 8, scale: 1.16, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Titulares: se levantan en 3D ligados al scroll
  $$(".sec .head h2, .final h2").forEach(function (h) {
    gsap.fromTo(h, { rotateX: -50, transformPerspective: 700, transformOrigin: "50% 100%" }, { rotateX: 0, ease: "none", scrollTrigger: { trigger: h, start: "top 100%", end: "top 60%", scrub: true } });
  });

  gsap.to("#lineFill", { width: "100%", ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 60%", scrub: true } });
  $$(".step").forEach(function (s, i) {
    ScrollTrigger.create({ trigger: "#steps", start: "top+=" + (i * 60) + " 72%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } });
  });
})();

/* Trópico Importados (maqueta, tienda de lentes de sol): colección con fotos reales (3 vistas por modelo, cada par con estuche),
   compra por forma, probador con selfie, guía "Tu lente ideal" que pide WhatsApp, calidad,
   asistente con IA, contactos y animaciones. */
(function () {
  var C = window.CONFIG, N = C.negocio, P = C.pagos, PROD = C.productos;
  var COL = window.SOLENNE_COLORES || { armazon: {}, cristal: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var V3 = function () { return window.SOLENNE_3D && window.SOLENNE_3D.ok && window.SOLENNE_3D.visor(); };

  function ars(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }
  function cuota(n) { return ars(n / P.cuotasSinInteres); }
  function wa(t) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(t); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function foto(id, w) { return "https://images.unsplash.com/" + id + "?w=" + (w || 900) + "&q=80&auto=format&fit=crop"; }
  function porId(id) { return PROD.filter(function (p) { return p.id === id; })[0]; }
  function nomA(v) { return (COL.armazon[v[0]] || [v[0]])[0]; }
  function nomC(v) { return (COL.cristal[v[1]] || [v[1]])[0]; }
  function nomCol(v) { return nomA(v) + " / " + nomC(v); }
  function imgDe(id, v, vista) { var o = window.SOLENNE_IMG && window.SOLENNE_IMG[id] && window.SOLENNE_IMG[id][v[0] + "|" + v[1]]; return o && o[vista]; }
  function esMetal(p) { return p.armazon === "oro" || p.armazon === "plata"; }
  function img(n) { return "img/" + n + ".jpg"; }
  var COLOR_TXT = { oro: "Dorado", plata: "Plateado", negro: "Negro", carey: "Carey", bordo: "Chocolate", hueso: "Hueso", cristal: "Transparente" };
  function colorDe(p) { return (COLOR_TXT[p.armazon] || nomA(p.variantes[0])) + " · cristal " + nomC(p.variantes[0]).toLowerCase(); }
  var FORMAS = { cateye: "Cat-eye", cuadrado: "Cuadrado", redondo: "Redondo", aviador: "Aviador", rectangular: "Rectangular", hexagonal: "Hexagonal" };
  var CHK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8.5l3 3 7-7"/></svg>';

  /* ---------- Básicos ---------- */
  function enlazarWA(scope) { $$("[data-wa]", scope).forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; }); }
  enlazarWA();
  $("#cWa").textContent = "+" + N.whatsapp.replace(/^(\d{2})(\d)(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4 $5");
  $("#cIg").textContent = "@" + N.instagram;
  $("#cHor").textContent = N.horario;
  $("#cExt").textContent = N.extra;
  $("#cEnv").textContent = "A todo el país · gratis desde " + ars(P.envioGratisDesde);
  var TOP = ["Desde Córdoba, Argentina, a todo el país", "Envío gratis desde " + ars(P.envioGratisDesde), "Cada par con su estuche", P.cuotasSinInteres + " cuotas sin interés"];
  $("#topbar").innerHTML = TOP.map(function (t, i) { return (i ? "<i" + (i > 1 ? ' class="x"' : "") + "></i>" : "") + '<span' + (i > 1 ? ' class="x"' : "") + ">" + esc(t) + "</span>"; }).join("");

  var hdr = $("#hdr"), burger = $("#burger");
  function solid() { hdr.classList.toggle("solid", scrollY > innerHeight * .55 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  burger.addEventListener("click", function () { var o = hdr.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.textContent = o ? "Cerrar" : "Menú"; solid(); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); burger.setAttribute("aria-expanded", false); burger.textContent = "Menú"; solid(); }); });

  /* ---------- Franja de confianza ---------- */
  var IC = {
    camion: '<path d="M2 6h11v10H2zM13 10h4l4 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    vuelta: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>',
    escudo: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    tarjeta: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    caja: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    estuche: '<rect x="2" y="8" width="20" height="9" rx="4.5"/><path d="M6 8V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>',
    funda: '<path d="M6 3h12l-1 18H7z"/><path d="M8 7h8"/>',
    gamuza: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 10l6-6M4 16L16 4M8 20L20 8M14 20l6-6"/>',
    tarjetaG: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h6M7 14h10"/><circle cx="17" cy="9.5" r="1.5"/>',
    sticker: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 9 9h-6a3 3 0 0 1-3-3z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'
  };
  function ico(k, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' + (w ? ' width="' + w + '"' : "") + ">" + IC[k] + "</svg>"; }
  var TRUST = [["camion", "Envío gratis", "Desde " + ars(P.envioGratisDesde) + " a todo el país"], ["pin", "Córdoba, Argentina", "Showroom con cita en Nueva Córdoba"], ["escudo", "Garantía de " + P.garantiaMeses + " meses", "En bisagras y armazón"], ["estuche", "Estuche incluido", "Con cada par, sin costo extra"], ["tarjeta", P.cuotasSinInteres + " cuotas sin interés", Math.round(P.descTransferencia * 100) + " % off por transferencia"]];
  $("#trust").innerHTML = TRUST.map(function (t) { return '<div class="it">' + ico(t[0]) + "<div><b>" + esc(t[1]) + "</b><span>" + esc(t[2]) + "</span></div></div>"; }).join("");

  /* ---------- Comprá por forma ---------- */
  var forma = null;
  function pintarFormas() {
    $("#shapes").innerHTML = Object.keys(FORMAS).map(function (k) {
      var ps = PROD.filter(function (p) { return p.forma === k; }), p = ps[0], src = p && img(p.fotos[1]);
      if (!ps.length) return "";
      return '<button type="button" class="shape rv' + (forma === k ? " on" : "") + '" data-forma="' + k + '"><div class="im">' + (src ? '<img src="' + src + '" alt="">' : "") + "</div><b>" + FORMAS[k] + "</b><span>" + ps.length + (ps.length === 1 ? " modelo" : " modelos") + "</span></button>";
    }).join("");
    $$("#shapes .shape").forEach(function (b) {
      if (arranco) { b.style.opacity = 1; b.style.transform = "none"; }
      b.onclick = function () { forma = forma === b.dataset.forma ? null : b.dataset.forma; pintarFormas(); pintarFiltros(); pintarGrid(); $("#coleccion").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); };
    });
  }

  /* ---------- Colección ---------- */
  var FILTROS = [["todo", "Todos"], ["acetato", "Acetato"], ["metal", "Metal"], ["90", "Hasta $90 mil"]], filtro = "todo";
  var elegida = {}; PROD.forEach(function (p) { elegida[p.id] = 0; });
  function badges(p) {
    var b = [];
    if (p.tag) b.push("<span>" + esc(p.tag) + "</span>");
    return '<div class="badges">' + b.join("") + "</div>";
  }
  function tarjeta(p) {
    return '<article class="prod rv" data-id="' + p.id + '" tabindex="0" role="button" aria-label="Ver fotos de los ' + esc(p.nombre) + '">' +
      '<div class="ph"><img class="main" src="' + img(p.fotos[0]) + '" alt="Lentes ' + esc(p.nombre) + ", " + esc(colorDe(p)) + ', con su estuche" loading="lazy">' +
      '<img class="alt" src="' + img(p.fotos[1]) + '" alt="" loading="lazy">' + badges(p) +
      '<span class="v3d"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="3.5" width="13" height="10" rx="2"/><circle cx="8" cy="8.5" r="2.6"/><path d="M5.5 3.5l1-2h3l1 2"/></svg>Ver 3 fotos</span></div>' +
      '<div class="bd"><div><h3>' + esc(p.nombre) + '</h3><p class="meta">' + esc(colorDe(p)) + '</p></div><div class="price">' + ars(p.precio) + "<small>" + P.cuotasSinInteres + " × " + cuota(p.precio) + "</small></div></div>" +
      '<div class="meta2"><span>' + FORMAS[p.forma] + " · " + (esMetal(p) ? "Metal" : "Acetato") + '</span><span class="est">' + ico("estuche", 15) + "Incluye estuche</span></div></article>";
  }
  var arranco = false;
  function lista() {
    return PROD.filter(function (p) {
      if (forma && p.forma !== forma) return false;
      if (filtro === "acetato") return !esMetal(p);
      if (filtro === "metal") return esMetal(p);
      if (filtro === "90") return p.precio <= 90000;
      return true;
    });
  }
  function pintarGrid() {
    var g = $("#grid"), l = lista();
    g.innerHTML = l.length ? l.map(tarjeta).join("") : '<p class="lead">No hay modelos con esa combinación. Probá con otro filtro.</p>';
    $$(".prod", g).forEach(function (el) {
      el.addEventListener("click", function (e) {
        abrirVisor(el.dataset.id);
      });
      el.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target === el) { e.preventDefault(); abrirVisor(el.dataset.id); } });
    });
    if (arranco) {
      if (window.gsap && !reduced) gsap.fromTo($$(".prod", g), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .7, stagger: .06, ease: "power3.out" });
      else $$(".prod", g).forEach(function (c) { c.style.opacity = 1; c.style.transform = "none"; });
    }
  }
  function pintarFiltros() {
    $("#filters").innerHTML = FILTROS.map(function (f) { return '<button type="button" class="fbtn' + (f[0] === filtro ? " on" : "") + '" data-f="' + f[0] + '">' + f[1] + "</button>"; }).join("") +
      (forma ? '<button type="button" class="chip-x" id="fx">' + FORMAS[forma] + " ✕</button>" : "");
    $$("#filters .fbtn").forEach(function (b) { b.onclick = function () { filtro = b.dataset.f; pintarFiltros(); pintarGrid(); }; });
    var fx = $("#fx"); if (fx) fx.onclick = function () { forma = null; pintarFormas(); pintarFiltros(); pintarGrid(); };
  }
  pintarFormas(); pintarFiltros(); pintarGrid();
  document.addEventListener("solenne:imagen", function () { pintarTryChips(); if (!tImg) cargarTry(tModel); else dibujar(); });
  document.addEventListener("solenne:imagenes", function () { if (paso === 5) pintarTool(); });

  /* ---------- Visor de fotos ---------- */
  var viewer = $("#viewer"), vid = null, vfoto = 0, ultimoFoco = null;
  var CRISTAL_TXT = {
    humo: "Gris: no cambia los colores. El más neutro para todos los días.",
    marron: "Marrón: sube el contraste y descansa la vista con sol fuerte.",
    degrade: "Degradé: más oscuro arriba y más claro abajo. Ideal para ciudad y para manejar.",
    verde: "Verde: el clásico. Colores naturales y buen contraste.",
    espejado: "Espejado: refleja parte de la luz. Para playa y sol intenso.",
    rosa: "Rosado: más claro y de moda. Para la ciudad y las tardes."
  };
  var VISTAS = ["Con su estuche", "De frente", "Detalle"];
  function verFoto(i) {
    var p = porId(vid), n = p.fotos.length; vfoto = (i + n) % n;
    var im = $("#vImg"); im.classList.remove("in"); void im.offsetWidth;
    im.src = img(p.fotos[vfoto]); im.alt = "Lentes " + p.nombre + ": " + VISTAS[vfoto].toLowerCase(); im.classList.add("in");
    $("#vCount").textContent = (vfoto + 1) + " / " + n + " · " + VISTAS[vfoto];
    $$("#vThumbs button").forEach(function (b, k) { b.classList.toggle("on", k === vfoto); b.setAttribute("aria-current", k === vfoto); });
  }
  function abrirVisor(id) {
    var p = porId(id); vid = id; ultimoFoco = document.activeElement;
    $("#vTag").textContent = FORMAS[p.forma] + " · " + (esMetal(p) ? "Metal" : "Acetato");
    $("#vName").textContent = p.nombre;
    $("#vPrice").innerHTML = ars(p.precio) + "<small>" + P.cuotasSinInteres + " cuotas sin interés de " + cuota(p.precio) + " · " + ars(p.precio * (1 - P.descTransferencia)) + " por transferencia</small>";
    $("#vDet").textContent = p.detalle;
    $("#vColor").textContent = colorDe(p);
    $("#vThumbs").innerHTML = p.fotos.map(function (f, k) { return '<button type="button" aria-label="' + VISTAS[k] + '"><img src="' + img(f) + '" alt=""></button>'; }).join("");
    $$("#vThumbs button").forEach(function (b, k) { b.onclick = function () { verFoto(k); }; });
    verFoto(0);
    pintarAcc(p);
    $("#vTrio").innerHTML = ["Envío gratis desde " + ars(P.envioGratisDesde), "Desde Córdoba, Argentina", "Garantía " + P.garantiaMeses + " meses"].map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
    var adv = $("#vAdv"); adv.href = wa("Hola Trópico! Estoy mirando los " + p.nombre + " y quiero que me ayuden a elegir."); adv.target = "_blank"; adv.rel = "noopener";
    var otros = PROD.filter(function (x) { return x.id !== id && x.forma !== p.forma; }).slice(0, 2);
    $("#vPair").innerHTML = otros.map(function (x) { return '<button type="button" data-otro="' + x.id + '"><img src="' + img(x.fotos[0]) + '" alt=""><b style="font-weight:500">' + esc(x.nombre) + "</b><span style='color:var(--iron)'>" + ars(x.precio) + "</span></button>"; }).join("");
    $$("#vPair [data-otro]").forEach(function (b) { b.onclick = function () { abrirVisor(b.dataset.otro); $(".vinfo").scrollTop = 0; }; });
    var a = $("#vWa"); a.href = wa("Hola Trópico! Quiero los " + p.nombre + " (" + colorDe(p) + ", " + ars(p.precio) + "). ¿Tienen stock?"); a.target = "_blank"; a.rel = "noopener";
    viewer.classList.add("on"); viewer.setAttribute("aria-hidden", "false"); document.body.classList.add("lock");
    setTimeout(function () { $("#vClose").focus(); }, 60);
  }
  function pintarAcc(p) {
    $("#vAcc").innerHTML =
      "<details open><summary>Qué incluye</summary><div class='in'><p>Los lentes con su estuche. Los revisamos uno por uno antes de despacharlos.</p></div></details>" +
      "<details><summary>El cristal</summary><div class='in'><p>" + esc(CRISTAL_TXT[p.cristal] || "") + "</p><p>Con filtro UV400: bloquea los rayos UVA y UVB.</p></div></details>" +
      "<details><summary>Materiales</summary><div class='in'><p>" + (esMetal(p) ? "Frente de metal " + (p.armazon === "oro" ? "dorado" : "plateado") + " con plaquetas regulables." : "Acetato pulido con bisagras metálicas.") + "</p></div></details>" +
      "<details><summary>Envíos y garantía</summary><div class='in'><p>Despachamos desde Córdoba, Argentina, en 24 h hábiles y con seguimiento. Envío gratis desde " + ars(P.envioGratisDesde) + ". " + P.garantiaMeses + " meses de garantía en bisagras y armazón.</p></div></details>";
  }
  function cerrarVisor() {
    viewer.classList.remove("on"); viewer.setAttribute("aria-hidden", "true"); document.body.classList.remove("lock");
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  $("#vClose").onclick = cerrarVisor;
  $("#vPrev").onclick = function () { verFoto(vfoto - 1); };
  $("#vNext").onclick = function () { verFoto(vfoto + 1); };
  (function () {
    var st = $(".vstage"), x0 = null;
    st.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    st.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) verFoto(vfoto + (dx < 0 ? 1 : -1)); x0 = null; });
  })();
  $("#vTry").onclick = function () { tModel = vid; tVar = 0; cerrarVisor(); pintarTryChips(); cargarTry(tModel); location.hash = "#probador"; };
  var hl = $("#heroLens"); if (hl) hl.onclick = function () { abrirVisor(hl.dataset.id); };

  /* ---------- Probador con selfie ---------- */
  var cv = $("#tCanvas"), cx = cv.getContext("2d"), W = cv.width, H = cv.height;
  var tModel = PROD[0].id, tVar = 0, tImg = null, selfie = null;
  var TS = { x: W / 2, y: 500, w: W * .44, rot: 0 };
  function pintarTryChips() {
    $("#tModels").innerHTML = PROD.map(function (p) { return '<button type="button" class="chip' + (p.id === tModel ? " sel" : "") + '" data-t="' + p.id + '">' + esc(p.nombre) + "</button>"; }).join("");
    $$("#tModels .chip").forEach(function (b) { b.onclick = function () { tModel = b.dataset.t; tVar = 0; pintarTryChips(); cargarTry(tModel); }; });
    var p = porId(tModel); var a = $("#tWa"); a.href = wa("Hola Trópico! Me probé los " + p.nombre + " en el probador de la web y me gustaron. ¿Tienen stock?"); a.target = "_blank"; a.rel = "noopener";
  }
  function cargarTry(id) {
    var p = porId(id), src = imgDe(id, p.variantes[tVar], "frente");
    if (!src) { tImg = null; dibujar(); return; }
    var im = new Image(); im.onload = function () { tImg = im; dibujar(); }; im.src = src;
  }
  function cara() {
    var g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#e6dccd"); g.addColorStop(1, "#f6f2ec");
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.fillStyle = "#2b211b"; cx.beginPath(); cx.ellipse(450, 470, 255, 300, 0, 0, 7); cx.fill();
    cx.fillStyle = "#d8a985"; cx.fillRect(392, 700, 116, 200);
    cx.fillStyle = "#171717"; cx.beginPath(); cx.ellipse(450, 1130, 380, 250, 0, Math.PI, 0); cx.fill();
    cx.fillStyle = "#e4b691"; cx.beginPath(); cx.ellipse(450, 520, 182, 238, 0, 0, 7); cx.fill();
    cx.fillStyle = "#2b211b"; cx.beginPath(); cx.ellipse(450, 335, 205, 112, 0, Math.PI, 0); cx.fill();
    cx.fillStyle = "#3a2618"; [[382, 505], [518, 505]].forEach(function (e) { cx.beginPath(); cx.ellipse(e[0], e[1], 15, 9, 0, 0, 7); cx.fill(); });
    cx.strokeStyle = "#b8795a"; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(450, 530); cx.quadraticCurveTo(440, 590, 458, 600); cx.stroke();
    cx.strokeStyle = "#a4544b"; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(408, 660); cx.quadraticCurveTo(450, 684, 492, 660); cx.stroke();
    cx.fillStyle = "rgba(23,23,23,.55)"; cx.font = "26px Inter, sans-serif"; cx.textAlign = "center"; cx.fillText("Cara de ejemplo · subí tu selfie", 450, 1092);
  }
  function dibujar() {
    cx.clearRect(0, 0, W, H);
    if (selfie) { var s = Math.max(W / selfie.width, H / selfie.height), w = selfie.width * s, h = selfie.height * s; cx.drawImage(selfie, (W - w) / 2, (H - h) / 2, w, h); }
    else cara();
    if (tImg) {
      var hh = TS.w * tImg.height / tImg.width;
      cx.save(); cx.translate(TS.x, TS.y); cx.rotate(TS.rot * Math.PI / 180);
      cx.drawImage(tImg, -TS.w / 2, -hh / 2, TS.w, hh); cx.restore();
    }
    var p = porId(tModel), lbl = "trópico · " + p.nombre;
    cx.font = "32px Inter, sans-serif"; var tw = cx.measureText(lbl).width;
    cx.fillStyle = "rgba(255,255,255,.88)"; cx.beginPath(); if (cx.roundRect) cx.roundRect(28, H - 92, tw + 44, 60, 30); else cx.rect(28, H - 92, tw + 44, 60); cx.fill();
    cx.fillStyle = "#171717"; cx.textAlign = "left"; cx.fillText(lbl, 50, H - 51);
  }
  $("#tSize").oninput = function () { TS.w = W * this.value / 100; dibujar(); };
  $("#tRot").oninput = function () { TS.rot = +this.value; dibujar(); };
  $("#tCenter").onclick = function () { TS.x = W / 2; TS.y = selfie ? H * .42 : 500; dibujar(); };
  $("#tFile").onchange = function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { selfie = im; TS.x = W / 2; TS.y = H * .42; dibujar(); }; im.src = r.result; }; r.readAsDataURL(f);
  };
  $("#tDown").onclick = function () {
    var a = document.createElement("a"); a.download = "tropico-" + tModel + ".jpg"; a.href = cv.toDataURL("image/jpeg", .9); document.body.appendChild(a); a.click(); a.remove();
  };
  var drag = null;
  function pt(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; }
  cv.addEventListener("pointerdown", function (e) { var q = pt(e); drag = { dx: q.x - TS.x, dy: q.y - TS.y }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", function (e) { if (!drag) return; var q = pt(e); TS.x = q.x - drag.dx; TS.y = q.y - drag.dy; dibujar(); });
  cv.addEventListener("pointerup", function () { drag = null; }); cv.addEventListener("pointercancel", function () { drag = null; });
  pintarTryChips(); dibujar();

  /* ---------- Fotos ---------- */
  /* Campaña: fotos de modelos (Unsplash, de referencia) con el estilo parecido de la colección */
  $("#camp").innerHTML = C.fotos.modelos.map(function (m, i) {
    var p = porId(m.modelo);
    return '<figure class="cf c' + (i + 1) + '"><img src="' + foto(m.id, i === 0 ? 1300 : 900) + '" alt="' + esc(m.alt) + '" loading="lazy"' + (m.pos ? ' style="object-position:' + m.pos + '"' : "") + '>' +
      '<span class="ref">Foto de referencia</span><figcaption><span><small>' + esc(m.txt) + "</small><b>Estilo " + esc(p.nombre) + '</b></span><button class="go" type="button" data-ver="' + p.id + '">Ver el ' + esc(p.nombre) + " →</button></figcaption></figure>";
  }).join("");
  $$("#camp [data-ver]").forEach(function (b) { b.onclick = function () { abrirVisor(b.dataset.ver); }; });

  /* Órbita 3D: los doce modelos en un anillo que gira con el scroll */
  var ring = $("#ring");
  ring.innerHTML = PROD.map(function (p, i) { return '<button type="button" class="oi" data-ver="' + p.id + '" aria-label="Ver ' + esc(p.nombre) + '" style="transform:rotateY(' + (i * 360 / PROD.length) + 'deg) translateZ(var(--or))"><img src="' + img(p.fotos[0]) + '" alt="" loading="lazy"><span>' + esc(p.nombre) + "</span></button>"; }).join("");
  $$("#ring [data-ver]").forEach(function (b) { b.onclick = function () { abrirVisor(b.dataset.ver); }; });
  function orbitar(g) {
    ring.style.transform = "translateZ(calc(var(--or) * -1)) rotateX(" + (-8 + Math.sin(g / 360 * Math.PI) * 4) + "deg) rotateY(" + (-g) + "deg)";
    var k = ((Math.round(g / (360 / PROD.length)) % PROD.length) + PROD.length) % PROD.length;
    $("#orbitName").textContent = PROD[k].nombre;
  }
  orbitar(0);

  /* Reseñas (de ejemplo) */
  var RES = [
    ["Camila R.", "Nueva Córdoba", "milano", "Los elegí por las fotos y llegaron exactamente iguales. El estuche es hermoso, parece de óptica cara.", "hace 3 días"],
    ["Martín G.", "Rosario", "cannes", "Antes de comprar me mandaron un video por WhatsApp. Los Cannes dorados no me los saco más.", "hace 1 semana"],
    ["Lucía P.", "Neuquén", "riviera", "Llegaron en tres días, impecables. Me probé tres modelos con la selfie hasta decidirme.", "hace 2 semanas"],
    ["Agustina M.", "Villa Carlos Paz", "capri", "Súper livianos y el cristal rosado es divino. Ya le encargué otros a mi hermana.", "hace 5 días"],
    ["Joaquín F.", "CABA", "ibiza", "Muy buena atención. Pregunté de todo y me respondieron al toque. Los uso para manejar.", "hace 4 días"],
    ["Sofía L.", "Mendoza", "positano", "La forma hexagonal me encantó. Vinieron con su estuche y bien protegidos en la caja.", "hace 3 semanas"],
    ["Valentina C.", "Córdoba", "tulum", "Los retiré en el showroom y me ayudaron a elegir. Chiquitos y cómodos, justo lo que buscaba.", "hace 1 semana"],
    ["Tomás B.", "Salta", "monaco", "Pagué en 3 cuotas y llegaron antes de lo que decía el seguimiento. Calidad muy buena.", "hace 2 semanas"],
    ["Florencia D.", "Mar del Plata", "amalfi", "El color chocolate es más lindo en persona. Los uso todos los días en la playa.", "hace 6 días"],
    ["Nicolás A.", "Tucumán", "marbella", "Plateados, finos y bien terminados. Las bisagras se sienten firmes.", "hace 1 mes"]
  ];
  var AVC = ["#c9c1ff", "#9fd8ff", "#ffd8a8", "#b8f0cf", "#ffc2d6"];
  function resena(r, i) {
    var p = porId(r[2]), ini = r[0].split(" ").map(function (w) { return w[0]; }).join("");
    return '<article class="rc"><div class="top"><span class="av" style="background:' + AVC[i % AVC.length] + '">' + esc(ini) + '</span><span class="nm">' + esc(r[0]) + "<small>" + esc(r[1]) + " · " + esc(r[4]) + '</small></span><span class="ok">Compra verificada</span></div>' +
      '<span class="st" aria-label="5 estrellas">★★★★★</span><p>' + esc(r[3]) + '</p><button class="pr" type="button" data-ver="' + p.id + '"><img src="' + img(p.fotos[0]) + '" alt="" loading="lazy"><span>Compró <b>' + esc(p.nombre) + '</b></span><span class="demo">Ejemplo</span></button></article>';
  }
  var r1 = RES.slice(0, 5).map(resena).join(""), r2 = RES.slice(5).map(function (r, i) { return resena(r, i + 2); }).join("");
  $("#rvw1").innerHTML = r1 + r1; $("#rvw2").innerHTML = r2 + r2;
  $$("#rvw1 .rc, #rvw2 .rc").forEach(function (c, i) { if (i % 10 >= 5) c.setAttribute("aria-hidden", "true"); });
  $$(".rvw [data-ver]").forEach(function (b) { b.onclick = function () { abrirVisor(b.dataset.ver); }; });
  var BARS = [["Calidad", "4,9", 98], ["Igual a las fotos", "5,0", 100], ["Atención", "4,9", 98], ["Envío", "4,8", 96]];
  $("#rbars").innerHTML = BARS.map(function (b) { return '<div class="rbar"><span>' + b[0] + "<b>" + b[1] + '</b></span><i><em style="--w:' + b[2] + '%"></em></i></div>'; }).join("");

  /* ---------- Calidad y caja ---------- */
  var SPECS = [
    ["Armazón", "Acetato de celulosa pulido", "Más liviano y cálido que el plástico común; no se decolora con el sol."],
    ["Bisagra", "Metálica de 5 barriles", "Abre y cierra miles de veces sin aflojarse."],
    ["Cristal", "Policarbonato · UV400", "Filtra el 100 % de los rayos UVA y UVB, y resiste golpes."],
    ["Categoría", "3 (sol fuerte)", "Deja pasar entre 8 y 18 % de la luz: la categoría recomendada para el verano."],
    ["Polarizado", "En los modelos marcados", "Corta el reflejo del agua, la nieve y el asfalto."],
    ["Control", "Par por par", "Revisamos alineación, bisagras y cristales antes de despachar."]
  ];
  $("#specs").innerHTML = SPECS.map(function (s) { return '<div class="spec"><dt>' + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "<small>" + esc(s[2]) + "</small></dd></div>"; }).join("");
  $("#craftImg").src = img("0912-3");
  $("#craftBtn").onclick = function () { abrirVisor("cannes"); };
  var BOX = [["estuche", "Estuche incluido", "Cada par viaja y se guarda en su estuche"], ["escudo", "Revisados uno por uno", "Bisagras, cristales y alineación antes de enviar"], ["camion", "Envío a todo el país", "Con seguimiento, gratis desde " + ars(P.envioGratisDesde)], ["tarjetaG", "Garantía de " + P.garantiaMeses + " meses", "En bisagras y armazón"]];
  $("#box").innerHTML = BOX.map(function (b) { return '<div class="rv">' + ico(b[0]) + "<b>" + esc(b[1]) + "</b><span>" + esc(b[2]) + "</span></div>"; }).join("");

  /* ---------- Preguntas frecuentes ---------- */
  var FAQ = [
    ["¿Vienen con estuche?", "Sí, todos los modelos vienen con su estuche, sin costo extra. Lo podés ver en las fotos de cada modelo.", ["estuche", "funda", "caja", "incluye", "trae", "viene"]],
    ["¿Qué significa UV400 y categoría 3?", "UV400 quiere decir que el cristal bloquea el 100 % de los rayos UVA y UVB. Categoría 3 es cuánto oscurece: deja pasar entre 8 y 18 % de la luz, lo recomendado para sol fuerte de verano.", ["uv", "400", "categoria", "categoría", "protec", "rayos", "ojos"]],
    ["¿Cómo sé si me quedan bien?", "Mirá las fotos de cada modelo, probátelos con tu selfie en el probador o hacé la guía \"Tu lente ideal\". Si tenés dudas, escribinos por WhatsApp y te mandamos más fotos o un video.", ["tamaño", "medida", "talle", "queda", "grande", "chico", "cara"]],
    ["¿Hacen envíos a todo el país?", "Sí. Despachamos en 24 h hábiles con seguimiento: en Córdoba llega en 24 a 48 h y al resto del país en 3 a 6 días hábiles. Gratis desde " + ars(P.envioGratisDesde) + ".", ["envio", "envío", "mandan", "llega", "demora", "tarda", "correo", "provincia"]],
    ["¿Cómo pago?", "Con tarjeta de crédito en " + P.cuotasSinInteres + " cuotas sin interés, débito, Mercado Pago o transferencia con " + Math.round(P.descTransferencia * 100) + " % de descuento. Te pasamos el link de pago por WhatsApp.", ["pago", "pagar", "cuota", "tarjeta", "transfer", "mercado", "descuento", "efectivo"]],
    ["¿Tienen garantía?", "Sí, todos tienen " + P.garantiaMeses + " meses de garantía en bisagras y armazón. Si tenés cualquier problema con tu par, escribinos por WhatsApp y lo resolvemos.", ["garant", "rompe", "roto", "falla", "cambio", "cambiar"]],
    ["¿Dónde están?", "Estamos en Córdoba, Argentina. Vendemos online y despachamos a todo el país; si estás en Córdoba, podés verlos en el showroom de Nueva Córdoba con cita previa.", ["donde", "dónde", "ubic", "cordoba", "córdoba", "local", "showroom", "retiro", "retirar"]],
    ["¿Se pueden graduar?", "Los modelos de acetato admiten cristales recetados en cualquier óptica. Si querés, te recomendamos una en tu ciudad.", ["gradu", "receta", "aumento", "optica", "óptica", "miopia"]]
  ];
  $("#faq").innerHTML = FAQ.map(function (f, i) { return '<div class="fq rv"><button type="button" aria-expanded="false" aria-controls="fa' + i + '">' + esc(f[0]) + '<i></i></button><div class="fa" id="fa' + i + '"><div><p>' + esc(f[1]) + "</p></div></div></div>"; }).join("");
  $$(".fq button").forEach(function (b) {
    b.addEventListener("click", function () {
      var q = b.parentNode, o = !q.classList.contains("open");
      $$(".fq.open").forEach(function (x) { x.classList.remove("open"); x.firstChild.setAttribute("aria-expanded", false); });
      q.classList.toggle("open", o); b.setAttribute("aria-expanded", o);
    });
  });

  /* ---------- IA (Gemini) y contactos ---------- */
  function hayIA() { return !!(C.gemini && C.gemini.clave); }
  function gemini(contents, sistema) {
    var modelos = C.gemini.modelos.slice();
    function probar() {
      var m = modelos.shift(); if (!m) return Promise.reject(new Error("sin modelos"));
      return fetch("https://generativelanguage.googleapis.com/v1beta/models/" + m + ":generateContent?key=" + C.gemini.clave, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: contents, systemInstruction: { parts: [{ text: sistema }] }, generationConfig: { temperature: .5, maxOutputTokens: 500 } })
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { var t = j.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join(""); if (!t) throw new Error("vacío"); return t; })
        .catch(function (e) { if (modelos.length) return probar(); throw e; });
    }
    return probar();
  }
  function guardarContacto(d) {
    d.fecha = new Date().toISOString(); d.origen = N.nombre + " (web)";
    try {
      if (C.contactos.appsScriptUrl) return fetch(C.contactos.appsScriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(d) }).then(function () { return true; }).catch(function () { return false; });
      if (C.contactos.formsubmitEmail) return fetch("https://formsubmit.co/ajax/" + C.contactos.formsubmitEmail, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) }).then(function () { return true; }).catch(function () { return false; });
    } catch (e) {}
    return Promise.resolve(false);
  }
  function telOk(t) { return String(t).replace(/\D/g, "").length >= 8; }

  /* ---------- Tu lente ideal (4 pasos) ---------- */
  var CARAS = [
    ["ovalada", "Ovalada", "Más larga que ancha, mentón suave", '<ellipse cx="23" cy="28" rx="15" ry="21"/>'],
    ["redonda", "Redonda", "Ancho y largo parecidos, mejillas llenas", '<circle cx="23" cy="28" r="18"/>'],
    ["cuadrada", "Cuadrada", "Mandíbula marcada, frente ancha", '<rect x="6" y="9" width="34" height="38" rx="7"/>'],
    ["corazon", "Corazón", "Frente ancha, mentón fino", '<path d="M6 14c0-5 6-7 17-7s17 2 17 7c0 15-9 28-17 34C15 42 6 29 6 14z"/>'],
    ["alargada", "Alargada", "Bastante más larga que ancha", '<rect x="10" y="4" width="26" height="48" rx="12"/>']
  ];
  var ESTILOS = [["clasico", "Clásico"], ["audaz", "Audaz"], ["minimal", "Minimal"], ["deportivo", "Deportivo"]];
  var USOS = [["ciudad", "Ciudad y día a día"], ["playa", "Playa y pileta"], ["manejo", "Manejar"], ["todo", "Un poco de todo"]];
  var tool = $("#tool"), paso = 1, S = { cara: null, estilo: null, uso: null, nombre: "", tel: "" };
  function recomendados() {
    return PROD.map(function (p) {
      var s = 0;
      if (p.caras.indexOf(S.cara) > -1) s += 4;
      if (p.estilo.indexOf(S.estilo) > -1) s += 3;
      if (S.uso === "manejo" && (p.cristal === "degrade" || p.cristal === "marron")) s += 1.5;
      if (S.uso === "playa" && (p.cristal === "humo" || p.cristal === "marron")) s += 1.5;
      if (S.uso === "ciudad" && (p.cristal === "degrade" || p.cristal === "rosa")) s += 1;
      return { p: p, s: s };
    }).sort(function (a, b) { return b.s - a.s; }).slice(0, 2).map(function (x) { return x.p; });
  }
  var POR_QUE = {
    ovalada: "Tu cara es equilibrada: te quedan casi todas las formas, sobre todo las con presencia.",
    redonda: "Las formas angulosas o con esquinas suben y estilizan las facciones redondas.",
    cuadrada: "Las curvas suavizan una mandíbula marcada y equilibran la frente ancha.",
    corazon: "Formas más anchas abajo o livianas arriba equilibran una frente ancha y un mentón fino.",
    alargada: "Los armazones grandes y altos acortan visualmente una cara larga."
  };
  function cab(t, s) { return '<div class="prog"><i style="width:' + (paso * 25) + '%"></i></div><p class="pstep">Paso ' + Math.min(paso, 4) + " de 4</p><h3>" + t + '</h3><p class="sub">' + s + "</p>"; }
  function nav(puede, txt) { return '<div class="tool-nav">' + (paso > 1 ? '<button type="button" class="btn btn-o" data-atras>Volver</button>' : "<span></span>") + '<button type="button" class="btn btn-p" data-sig' + (puede ? "" : " disabled") + ">" + txt + "</button></div>"; }
  function chipsT(nombre, lista, val) { return '<div class="chips">' + lista.map(function (x) { return '<button type="button" class="chip' + (val === x[0] ? " sel" : "") + '" data-' + nombre + '="' + x[0] + '">' + esc(x[1]) + "</button>"; }).join("") + "</div>"; }
  function pintarTool() {
    var h;
    if (paso === 1) h = cab("¿Qué forma tiene tu cara?", "Mirate al espejo con el pelo recogido y elegí la más parecida.") +
      '<div class="opts">' + CARAS.map(function (c) { return '<button type="button" class="opt' + (S.cara === c[0] ? " sel" : "") + '" data-cara="' + c[0] + '"><svg viewBox="0 0 46 56" fill="none" stroke="currentColor" stroke-width="1.5">' + c[3] + "</svg>" + esc(c[1]) + "<span>" + esc(c[2]) + "</span></button>"; }).join("") + "</div>" + nav(!!S.cara, "Siguiente");
    else if (paso === 2) h = cab("¿Cómo es tu estilo?", "Pensá en la ropa que más usás.") + chipsT("estilo", ESTILOS, S.estilo) + nav(!!S.estilo, "Siguiente");
    else if (paso === 3) h = cab("¿Para qué los vas a usar?", "Así te recomendamos el cristal que más te conviene.") + chipsT("uso", USOS, S.uso) + nav(!!S.uso, "Siguiente");
    else if (paso === 4) h = cab("¿A dónde te mandamos tu recomendación?", "Te escribimos con los modelos, colores y stock. No compartimos tus datos.") +
      '<label class="fld"><span>Nombre</span><input id="pNom" autocomplete="name" value="' + esc(S.nombre) + '"></label>' +
      '<label class="fld"><span>WhatsApp</span><input id="pTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="351 555 1234" value="' + esc(S.tel) + '"></label>' +
      '<p class="err" id="pErr"></p>' + nav(true, "Ver mis lentes");
    else h = resultado();
    tool.innerHTML = h; enlazarTool();
  }
  function resultado() {
    var r = recomendados();
    return '<div class="prog"><i style="width:100%"></i></div><p class="pstep">Tu recomendación</p><h3>' + esc(S.nombre.split(" ")[0]) + ', estos van con vos</h3><p class="sub">' + esc(POR_QUE[S.cara]) + "</p>" +
      '<div class="picks">' + r.map(function (p) {
        return '<div class="pick"><img src="' + img(p.fotos[0]) + '" alt="Lentes ' + esc(p.nombre) + '"><b>' + esc(p.nombre) + "</b><p>" + ars(p.precio) + ' · con estuche</p><button type="button" data-ver="' + p.id + '">Ver fotos</button></div>';
      }).join("") + "</div>" +
      '<p class="note">Recomendación orientativa según la forma de la cara y el uso. Cada cara es única: probalos con tu selfie o consultanos por WhatsApp antes de comprar.</p>' +
      '<div class="tool-nav"><button type="button" class="btn btn-o" data-reini>Empezar de nuevo</button><a class="btn btn-p" target="_blank" rel="noopener" href="' + wa("Hola Trópico! Soy " + S.nombre + ". Hice la guía en la web: cara " + S.cara + ", estilo " + S.estilo + ", uso: " + S.uso + ". Me recomendaron los " + r.map(function (p) { return p.nombre; }).join(" y ") + ". ¿Tienen stock?") + '">Pedirlos por WhatsApp</a></div>';
  }
  function enlazarTool() {
    ["cara", "estilo", "uso"].forEach(function (k) { $$("[data-" + k + "]", tool).forEach(function (b) { b.onclick = function () { S[k] = b.dataset[k]; pintarTool(); }; }); });
    $$("[data-ver]", tool).forEach(function (b) { b.onclick = function () { abrirVisor(b.dataset.ver); }; });
    var at = $("[data-atras]", tool); if (at) at.onclick = function () { paso--; pintarTool(); };
    var re = $("[data-reini]", tool); if (re) re.onclick = function () { paso = 1; S.cara = S.estilo = S.uso = null; pintarTool(); };
    var sg = $("[data-sig]", tool);
    if (sg) sg.onclick = function () {
      if (paso < 4) { paso++; pintarTool(); return; }
      S.nombre = $("#pNom").value.trim(); S.tel = $("#pTel").value.trim();
      if (!S.nombre || !telOk(S.tel)) { $("#pErr").textContent = "Completá tu nombre y un WhatsApp válido para ver tu recomendación."; return; }
      guardarContacto({ nombre: S.nombre, telefono: S.tel, cara: S.cara, estilo: S.estilo, uso: S.uso, recomendados: recomendados().map(function (p) { return p.nombre; }).join(", "), tipo: "Tu lente ideal" });
      paso = 5; pintarTool();
    };
  }
  pintarTool();

  /* ---------- Formulario y novedades ---------- */
  $("#form").addEventListener("submit", function (e) {
    e.preventDefault();
    var nom = $("#fNom").value.trim(), tel = $("#fTel").value.trim(), con = $("#fCon").value.trim();
    if (!nom || !telOk(tel)) { $("#formErr").textContent = "Completá tu nombre y un WhatsApp válido."; return; }
    $("#formErr").textContent = "";
    guardarContacto({ nombre: nom, telefono: tel, consulta: con, tipo: "asesor" });
    $("#formOk").style.display = "block";
    window.open(wa("Hola Trópico! Soy " + nom + " (" + tel + "). " + (con || "Quiero que un asesor me ayude a elegir.")), "_blank");
    e.target.reset();
  });
  var colorFav = null;
  $("#newsCol").innerHTML = [["negro", "Negro"], ["carey", "Carey"], ["cristal", "Cristal"], ["metal", "Metal dorado"], ["color", "Con color"]].map(function (c) { return '<button type="button" class="chip" data-col="' + c[0] + '">' + c[1] + "</button>"; }).join("");
  $$("#newsCol .chip").forEach(function (b) { b.onclick = function () { colorFav = b.dataset.col; $$("#newsCol .chip").forEach(function (x) { x.classList.toggle("sel", x === b); }); }; });
  $("#news").addEventListener("submit", function (e) {
    e.preventDefault();
    var tel = $("#newsTel").value.trim(), m = $("#newsMsg");
    if (!colorFav) { m.textContent = "Elegí tu color favorito."; return; }
    if (!telOk(tel)) { m.textContent = "Escribí un WhatsApp válido."; return; }
    guardarContacto({ telefono: tel, colorFavorito: colorFav, tipo: "novedades" });
    m.textContent = "¡Listo! Te avisamos por WhatsApp cuando entren modelos en ese color."; e.target.reset(); colorFav = null;
    $$("#newsCol .chip").forEach(function (x) { x.classList.remove("sel"); });
  });

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), fab = $("#aiFab"), chatM = $("#chatM"), chatI = $("#chatI"), hist = [];
  var SUG = ["¿Qué modelos tienen?", "¿Cuál me queda con cara redonda?", "¿Vienen con estuche?", "¿Cómo pago?"];
  function abrir() { chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none"; if (!chatM.children.length) saludo(); setTimeout(function () { chatI.focus(); }, 250); }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.addEventListener("click", abrir); $("#chatX").addEventListener("click", cerrar);
  function burbuja(cls, t) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = t; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(t, q) {
    var d = burbuja("b", t), a = document.createElement("a");
    a.className = "wa"; a.target = "_blank"; a.rel = "noopener"; a.href = wa("Hola Trópico! " + (q ? "Consulté en la web: " + q : "Quiero hacer una consulta.")); a.textContent = "Seguir por WhatsApp ›";
    d.appendChild(document.createElement("br")); d.appendChild(a); chatM.scrollTop = chatM.scrollHeight;
  }
  function saludo() {
    burbuja("b", "¡Hola! Soy la asistente de Trópico. Te ayudo a elegir modelo según tu cara, y con envíos y pagos. ¿Qué estás buscando?");
    $("#chatC").innerHTML = SUG.map(function (s) { return '<button type="button">' + esc(s) + "</button>"; }).join("");
    $$("#chatC button").forEach(function (b) { b.onclick = function () { preguntar(b.textContent); }; });
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function local(q) {
    var n = norm(q);
    var hit = PROD.filter(function (p) { return n.indexOf(norm(p.nombre)) > -1; });
    if (hit.length) return hit.map(function (p) { return p.nombre + ": " + p.detalle + " " + ars(p.precio) + " o " + P.cuotasSinInteres + " cuotas de " + cuota(p.precio) + ". Viene con su estuche."; }).join("\n") + "\nTocá el modelo en la colección para ver sus 3 fotos.";
    for (var i = 0; i < CARAS.length; i++) if (n.indexOf(CARAS[i][0]) > -1 || n.indexOf(norm(CARAS[i][1])) > -1) {
      var k = CARAS[i][0], r = PROD.filter(function (p) { return p.caras.indexOf(k) > -1; });
      return POR_QUE[k] + " Te recomendamos: " + r.map(function (p) { return p.nombre; }).join(", ") + ". Si querés, hacé la guía \"Tu lente ideal\" para afinar la elección.";
    }
    for (var f in FORMAS) if (n.indexOf(norm(FORMAS[f]).replace("-", "")) > -1 || n.indexOf(norm(FORMAS[f])) > -1) {
      var rf = PROD.filter(function (p) { return p.forma === f; });
      return FORMAS[f] + ": " + rf.map(function (p) { return p.nombre + " (" + ars(p.precio) + ")"; }).join(", ") + ". Los encontrás en \"Comprá por forma\".";
    }
    if (/modelo|tienen|catalogo|coleccion|cuales/.test(n)) return "Tenemos " + PROD.length + " modelos: " + PROD.map(function (p) { return p.nombre + " (" + ars(p.precio) + ")"; }).join(", ") + ". Todos vienen con su estuche; tocá cualquiera en la colección para ver sus fotos.";
    var mejor = null, pts = 0;
    FAQ.forEach(function (fq) { var c = fq[2].filter(function (w) { return n.indexOf(norm(w)) > -1; }).length; if (c > pts) { pts = c; mejor = fq; } });
    if (mejor) return mejor[1];
    if (/precio|cuanto|sale|cuesta|valor/.test(n)) { var ps = PROD.map(function (p) { return p.precio; }); return "Los modelos van de " + ars(Math.min.apply(null, ps)) + " a " + ars(Math.max.apply(null, ps)) + ", en " + P.cuotasSinInteres + " cuotas sin interés o con " + Math.round(P.descTransferencia * 100) + " % off por transferencia."; }
    if (/horario|atienden|showroom|local|direccion/.test(n)) return N.horario + ". " + N.extra + ".";
    return "Eso te lo respondemos mejor por WhatsApp. Si me contás la forma de tu cara y para qué los querés, te recomiendo un modelo.";
  }
  function sistema() {
    return "Sos la asistente virtual de " + N.nombre + ", tienda online de lentes de sol con base en " + N.ciudad + ", Argentina. Hablás en español rioplatense con voseo, cálida, con buen gusto y breve (máximo 3 oraciones). " +
      N.horario + ". " + N.extra + ".\nModelos (precios en pesos):\n" + PROD.map(function (p) { return "- " + p.nombre + " (" + FORMAS[p.forma] + "): " + p.detalle + " " + ars(p.precio) + ". Color: " + colorDe(p) + ". Viene con estuche. Ideal para caras: " + p.caras.join(", ") + "."; }).join("\n") +
      "\nPagos: " + P.cuotasSinInteres + " cuotas sin interés, " + Math.round(P.descTransferencia * 100) + " % off por transferencia. Envío gratis desde " + ars(P.envioGratisDesde) + ". Garantía de " + P.garantiaMeses + " meses. No ofrezcas cambios ni devoluciones con plazo: si preguntan, que lo consulten por WhatsApp. Todos UV400 y todos vienen con su estuche.\nPreguntas frecuentes:\n" + FAQ.map(function (f) { return "- " + f[0] + " " + f[1]; }).join("\n") +
      "\nNo hables de marcas ni de su procedencia: si preguntan, invitá a consultarlo por WhatsApp. Nunca inventes modelos, colores, precios ni stock que no estén acá. Para elegir, invitá a la guía \"Tu lente ideal\" o al probador con selfie; para comprar, a escribir por WhatsApp.";
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
  addEventListener("keydown", function (e) { if (e.key === "Escape") { if (viewer.classList.contains("on")) cerrarVisor(); else cerrar(); } });

  /* ---------- Animaciones ---------- */
  function contar(directo) {
    $$("[data-count]").forEach(function (el) {
      var fin = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
      var fmt = function (v) { return v.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      if (directo || !window.gsap) { el.textContent = fmt(fin); return; }
      var o = { v: 0 }; el.textContent = fmt(0);
      gsap.to(o, { v: fin, duration: 2, ease: "power2.out", onUpdate: function () { el.textContent = fmt(o.v); }, scrollTrigger: { trigger: el, start: "top 90%" } });
    });
  }
  if (!window.gsap || reduced) { $("#rbars").classList.add("on"); arranco = true; $$(".rv").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; }); $$(".step").forEach(function (s) { s.classList.add("on"); }); contar(true); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(".hero .rv", { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: .12, delay: .5 });
  gsap.from(".hero-meta span", { opacity: 0, y: -10, duration: .9, stagger: .1, delay: .9, ease: "power3.out" });
  gsap.set([".orb", "#heroLens"], { x: 0, y: 0, xPercent: -50, yPercent: -50 });
  gsap.from(".orb i", { opacity: 0, duration: 2.2, stagger: .25, delay: .3, ease: "power2.out" });
  gsap.fromTo(".orb", { y: 0, rotate: 0, opacity: 1 }, { y: function () { return -innerHeight * .2; }, rotate: 18, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  contar(false);
  $$(".rv").filter(function (e) { return !e.closest(".hero"); }).forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el) % 6;
    if (el.matches(".prod,.card,.tcard,.tool,.cbox,figure,.tstage,.shape,.box>div,.fitcard,.vis,.news")) {
      gsap.fromTo(el, { opacity: 0, y: 70, rotateX: 16, transformPerspective: 1100, transformOrigin: "50% 100%" },
        { opacity: 1, y: 0, rotateX: 0, duration: 1.05, ease: "power3.out", delay: i * .06, clearProps: "transform", scrollTrigger: { trigger: el, start: "top 94%" } });
    } else gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: "power3.out", delay: i * .06, scrollTrigger: { trigger: el, start: "top 92%" } });
  });
  arranco = true;
  /* Órbita: el anillo gira 360° mientras la sección queda fija */
  var og = { g: 0 };
  gsap.to(og, { g: 360, ease: "none", onUpdate: function () { orbitar(og.g); }, scrollTrigger: { trigger: ".orbit-sec", start: "top top", end: "bottom bottom", scrub: .6 } });
  gsap.from(".orbit", { scale: .7, opacity: 0, rotateX: 30, ease: "power2.out", scrollTrigger: { trigger: ".orbit-sec", start: "top 80%", end: "top top", scrub: true } });
  gsap.from(".orbit-head > *", { opacity: 0, y: 30, stagger: .1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".orbit-sec", start: "top 60%" } });
  /* Campaña: cada foto entra girando en 3D y la imagen se desplaza por dentro */
  $$(".cf").forEach(function (f, i) {
    var lado = i % 2 ? 1 : -1;
    gsap.fromTo(f, { rotateY: 22 * lado, rotateX: 10, z: -260, opacity: 0, transformPerspective: 1400 },
      { rotateY: 0, rotateX: 0, z: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: f, start: "top 98%", end: "top 45%", scrub: .8 } });
    gsap.fromTo(f.querySelector("img"), { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
  });
  ScrollTrigger.create({ trigger: "#rbars", start: "top 88%", onEnter: function () { $("#rbars").classList.add("on"); } });
  gsap.to("#lineFill", { width: "100%", ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 55%", scrub: true } });
  $$(".step").forEach(function (s, i) { ScrollTrigger.create({ trigger: "#steps", start: "top+=" + (i * 50) + " 72%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } }); });
  if (hl) {
    gsap.fromTo(".hero-lens .tilt", { opacity: 0, y: 40, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: "power3.out", delay: .2 });
    gsap.from(".hero-lens .cap", { opacity: 0, y: 10, duration: 1, delay: 1.2, ease: "power3.out" });
    gsap.to(".hero-lens .tilt img", { y: -14, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.fromTo(".hero-lens .float", { rotateY: 0, rotateX: 0, z: 0, scale: 1, opacity: 1 }, { rotateY: -38, rotateX: 18, z: -120, scale: .82, opacity: .25, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.fromTo(hl, { y: 0 }, { y: function () { return innerHeight * .2; }, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    if (matchMedia("(hover: hover)").matches) addEventListener("pointermove", function (e) {
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      gsap.to(".hero-lens .tilt", { rotateY: x * 16, rotateX: -y * 10, duration: .9, ease: "power2.out" });
    }, { passive: true });
  }
  if (matchMedia("(hover: hover)").matches) $$(".box>div,.card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transition = "transform .08s"; c.style.transform = "perspective(900px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg)"; });
    c.addEventListener("pointerleave", function () { c.style.transition = "transform .5s"; c.style.transform = ""; });
  });
})();

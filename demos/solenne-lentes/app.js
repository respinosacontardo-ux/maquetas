/* Solenne (maqueta, tienda de lentes de sol): colección con visor 3D, probador con selfie,
   guía "Tu lente ideal" que pide WhatsApp, asistente con IA, contactos y animaciones. */
(function () {
  var C = window.CONFIG, N = C.negocio, P = C.pagos, PROD = C.productos;
  var COL = window.SOLENNE_COLORES || { armazon: {}, cristal: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ars(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }
  function cuota(n) { return ars(n / P.cuotasSinInteres); }
  function wa(t) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(t); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function foto(id, w) { return "https://images.unsplash.com/" + id + "?w=" + (w || 900) + "&q=80&auto=format&fit=crop"; }
  function porId(id) { return PROD.filter(function (p) { return p.id === id; })[0]; }
  function nomCol(v) { return (COL.armazon[v[0]] || [v[0]])[0] + " · cristal " + ((COL.cristal[v[1]] || [v[1]])[0]).toLowerCase(); }
  function imgDe(id, v, vista) { var o = window.SOLENNE_IMG && window.SOLENNE_IMG[id] && window.SOLENNE_IMG[id][v[0] + "|" + v[1]]; return o && o[vista]; }

  /* ---------- Básicos ---------- */
  function enlazarWA(scope) { $$("[data-wa]", scope).forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; }); }
  enlazarWA();
  $("#cWa").textContent = "+" + N.whatsapp.replace(/^(\d{2})(\d)(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4 $5");
  $("#cIg").textContent = "@" + N.instagram;
  $("#cHor").textContent = N.horario;
  $("#cExt").textContent = N.extra;
  $("#cEnv").textContent = "A todo el país · gratis desde " + ars(P.envioGratisDesde);

  var hdr = $("#hdr"), burger = $("#burger");
  function solid() { hdr.classList.toggle("solid", scrollY > innerHeight * .55 || hdr.classList.contains("open")); }
  addEventListener("scroll", solid, { passive: true }); solid();
  burger.addEventListener("click", function () { var o = hdr.classList.toggle("open"); burger.setAttribute("aria-expanded", o); burger.textContent = o ? "Cerrar" : "Menú"; solid(); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { hdr.classList.remove("open"); burger.setAttribute("aria-expanded", false); burger.textContent = "Menú"; solid(); }); });

  var cinta = ["Protección UV400", "Envíos a todo el país", P.cuotasSinInteres + " cuotas sin interés", Math.round(P.descTransferencia * 100) + " % off por transferencia", "Estuche rígido y gamuza de regalo", "Cambios en " + P.cambiosDias + " días", "Garantía de " + P.garantiaMeses + " meses"];
  $("#strip").innerHTML = cinta.concat(cinta).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");

  /* ---------- Colección ---------- */
  var FILTROS = [["todo", "Todos"], ["acetato", "Acetato"], ["metal", "Metal"], ["polarizado", "Polarizados"], ["90", "Hasta $90 mil"]], filtro = "todo";
  var elegida = {}; PROD.forEach(function (p) { elegida[p.id] = 0; });
  function esMetal(p) { return p.armazon === "oro" || p.armazon === "plata"; }
  function tarjeta(p) {
    var v = p.variantes[elegida[p.id]], src = imgDe(p.id, v, "tres");
    return '<article class="prod rv" data-id="' + p.id + '" tabindex="0" role="button" aria-label="Ver ' + esc(p.nombre) + ' en 3D">' +
      '<div class="ph">' + (src ? '<img src="' + src + '" alt="Lentes ' + esc(p.nombre) + ", " + esc(nomCol(v)) + '">' : '<span class="ld">Armando el 3D…</span>') +
      (p.tag ? '<span class="t">' + esc(p.tag) + "</span>" : "") +
      '<span class="v3d"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1.5l5.5 3v7L8 14.5l-5.5-3v-7z M2.5 4.5L8 7.5l5.5-3 M8 7.5v7"/></svg>Ver en 3D</span></div>' +
      '<div class="bd"><div><h3>' + esc(p.nombre) + '</h3><p class="meta">' + esc(nomCol(v)) + '</p></div><div class="price">' + ars(p.precio) + "<small>" + P.cuotasSinInteres + " × " + cuota(p.precio) + "</small></div></div>" +
      '<div class="sws">' + p.variantes.map(function (x, i) {
        return '<button type="button" class="sw' + (i === elegida[p.id] ? " on" : "") + '" data-sw="' + i + '" aria-label="' + esc(nomCol(x)) + '"><i style="background:' + ((COL.armazon[x[0]] || [0, "#999"])[1]) + '"></i></button>';
      }).join("") + "</div></article>";
  }
  var arranco = false;
  function pintarGrid() {
    var lista = PROD.filter(function (p) {
      if (filtro === "acetato") return !esMetal(p);
      if (filtro === "metal") return esMetal(p);
      if (filtro === "polarizado") return p.polarizado;
      if (filtro === "90") return p.precio <= 90000;
      return true;
    });
    var g = $("#grid"); g.innerHTML = lista.map(tarjeta).join("");
    $$(".prod", g).forEach(function (el) {
      el.addEventListener("click", function (e) {
        var sw = e.target.closest("[data-sw]");
        if (sw) { e.stopPropagation(); elegida[el.dataset.id] = +sw.dataset.sw; actualizarTarjeta(el.dataset.id); return; }
        abrirVisor(el.dataset.id);
      });
      el.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target === el) { e.preventDefault(); abrirVisor(el.dataset.id); } });
    });
    if (arranco) {
      if (window.gsap && !reduced) gsap.fromTo($$(".prod", g), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .7, stagger: .06, ease: "power3.out" });
      else $$(".prod", g).forEach(function (c) { c.style.opacity = 1; c.style.transform = "none"; });
    }
  }
  function actualizarTarjeta(id) {
    var el = $('.prod[data-id="' + id + '"]'); if (!el) return;
    var p = porId(id), v = p.variantes[elegida[id]], src = imgDe(id, v, "tres"), ph = $(".ph", el);
    var im = $("img", ph);
    if (src) {
      if (!im) { im = document.createElement("img"); var ld = $(".ld", ph); if (ld) ld.remove(); ph.insertBefore(im, ph.firstChild); }
      im.src = src; im.alt = "Lentes " + p.nombre + ", " + nomCol(v);
    }
    $(".meta", el).textContent = nomCol(v);
    $$(".sw", el).forEach(function (s, i) { s.classList.toggle("on", i === elegida[id]); });
  }
  $("#filters").innerHTML = FILTROS.map(function (f) { return '<button type="button" class="fbtn' + (f[0] === filtro ? " on" : "") + '" data-f="' + f[0] + '">' + f[1] + "</button>"; }).join("");
  $$("#filters .fbtn").forEach(function (b) { b.onclick = function () { filtro = b.dataset.f; $$("#filters .fbtn").forEach(function (x) { x.classList.toggle("on", x === b); }); pintarGrid(); }; });
  pintarGrid();
  document.addEventListener("solenne:imagen", function (e) {
    var d = e.detail, p = porId(d.id);
    if (p && p.variantes[elegida[d.id]][0] + "|" + p.variantes[elegida[d.id]][1] === d.k) actualizarTarjeta(d.id);
    pintarTryChips(); if (!tImg) cargarTry(tModel); else dibujar();
  });
  document.addEventListener("solenne:imagenes", function () {
    if (!(window.SOLENNE_3D && window.SOLENNE_3D.ok)) $$(".prod .ld").forEach(function (l) { l.textContent = "Vista 3D no disponible en este navegador"; });
  });

  /* ---------- Visor 3D ---------- */
  var viewer = $("#viewer"), vid = null, vvar = 0, ultimoFoco = null;
  function abrirVisor(id) {
    var p = porId(id); vid = id; vvar = elegida[id]; ultimoFoco = document.activeElement;
    $("#vTag").textContent = (p.tag ? p.tag + " · " : "") + (esMetal(p) ? "Metal" : "Acetato") + (p.polarizado ? " · Polarizado" : "");
    $("#vName").textContent = p.nombre;
    $("#vPrice").innerHTML = ars(p.precio) + "<small>" + P.cuotasSinInteres + " cuotas sin interés de " + cuota(p.precio) + " · " + ars(p.precio * (1 - P.descTransferencia)) + " por transferencia</small>";
    $("#vDet").textContent = p.detalle;
    $("#m1").textContent = p.medidas[0]; $("#m2").textContent = p.medidas[1]; $("#m3").textContent = p.medidas[2];
    $("#vChecks").innerHTML = [
      "Protección UV400 (filtra el 100 % de los rayos UVA y UVB)",
      p.polarizado ? "Cristal polarizado: corta el reflejo del agua y el asfalto" : "Cristal de policarbonato liviano y resistente",
      esMetal(p) ? "Armazón de metal con plaquetas regulables" : "Acetato pulido a mano con bisagra metálica",
      "Estuche rígido, gamuza y garantía de " + P.garantiaMeses + " meses"
    ].map(function (t) { return '<li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8.5l3 3 7-7"/></svg>' + esc(t) + "</li>"; }).join("");
    pintarCombos(p);
    viewer.classList.add("on"); viewer.setAttribute("aria-hidden", "false"); document.body.classList.add("lock");
    $("#vHint").style.opacity = 1; $("#vSpin").classList.add("on"); $("#vFold").textContent = "Plegar patillas"; $("#vFold").classList.remove("on");
    $$("[data-v]").forEach(function (b) { b.classList.remove("on"); });
    var V = window.SOLENNE_3D && window.SOLENNE_3D.ok && window.SOLENNE_3D.visor();
    if (V) { var v = p.variantes[vvar]; V.abrir({ forma: p.forma, armazon: v[0], cristal: v[1] }); }
    else { var st = $(".vstage"); var s = imgDe(id, p.variantes[vvar], "tres"); st.style.background = s ? "var(--fog) url(" + s + ") center/contain no-repeat" : "var(--fog)"; }
    actualizarWAVisor();
    setTimeout(function () { $("#vClose").focus(); }, 60);
  }
  function pintarCombos(p) {
    $("#vCombos").innerHTML = p.variantes.map(function (v, i) {
      return '<button type="button" class="combo' + (i === vvar ? " on" : "") + '" data-c="' + i + '"><span class="dd"><i style="background:' + (COL.armazon[v[0]] || [0, "#999"])[1] + '"></i><i style="background:' + (COL.cristal[v[1]] || [0, "#333"])[1] + '"></i></span>' + esc(nomCol(v)) + "</button>";
    }).join("");
    $$("#vCombos .combo").forEach(function (b) {
      b.onclick = function () {
        vvar = +b.dataset.c; elegida[vid] = vvar; actualizarTarjeta(vid);
        var v = p.variantes[vvar], V = window.SOLENNE_3D && window.SOLENNE_3D.ok && window.SOLENNE_3D.visor();
        if (V) V.colores(v[0], v[1]);
        $$("#vCombos .combo").forEach(function (x) { x.classList.toggle("on", x === b); });
        actualizarWAVisor();
      };
    });
  }
  function actualizarWAVisor() {
    var p = porId(vid), v = p.variantes[vvar];
    $("#vWa").href = wa("Hola Solenne! Quiero los " + p.nombre + " (" + nomCol(v) + ", " + ars(p.precio) + "). ¿Tienen stock?");
    $("#vWa").target = "_blank"; $("#vWa").rel = "noopener";
  }
  function cerrarVisor() {
    viewer.classList.remove("on"); viewer.setAttribute("aria-hidden", "true"); document.body.classList.remove("lock");
    var V = window.SOLENNE_3D && window.SOLENNE_3D.ok && window.SOLENNE_3D.visor(); if (V) V.cerrar();
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  $("#vClose").onclick = cerrarVisor;
  $$("[data-v]").forEach(function (b) { b.onclick = function () { var V = window.SOLENNE_3D.visor(); if (!V) return; V.vista(b.dataset.v); $$("[data-v]").forEach(function (x) { x.classList.toggle("on", x === b); }); $("#vSpin").classList.remove("on"); }; });
  $("#vFold").onclick = function () { var V = window.SOLENNE_3D.visor(); if (!V) return; var pl = V.plegar(); this.textContent = pl ? "Abrir patillas" : "Plegar patillas"; this.classList.toggle("on", pl); };
  $("#vSpin").onclick = function () { var V = window.SOLENNE_3D.visor(); if (!V) return; this.classList.toggle("on", V.girar()); };
  document.addEventListener("solenne:manual", function () { $("#vHint").style.opacity = 0; $("#vSpin").classList.remove("on"); });
  $("#vTry").onclick = function () { tModel = vid; tVar = vvar; cerrarVisor(); pintarTryChips(); cargarTry(tModel); location.hash = "#probador"; };

  /* ---------- Probador con selfie ---------- */
  var cv = $("#tCanvas"), cx = cv.getContext("2d"), W = cv.width, H = cv.height;
  var tModel = PROD[0].id, tVar = 0, tImg = null, selfie = null;
  var TS = { x: W / 2, y: 500, w: W * .44, rot: 0 };
  function pintarTryChips() {
    $("#tModels").innerHTML = PROD.map(function (p) { return '<button type="button" class="chip' + (p.id === tModel ? " sel" : "") + '" data-t="' + p.id + '">' + esc(p.nombre) + "</button>"; }).join("");
    $$("#tModels .chip").forEach(function (b) { b.onclick = function () { tModel = b.dataset.t; tVar = elegida[tModel]; pintarTryChips(); cargarTry(tModel); }; });
    var p = porId(tModel); var a = $("#tWa"); a.href = wa("Hola Solenne! Me probé los " + p.nombre + " en el probador de la web y me gustaron. ¿Tienen stock?"); a.target = "_blank"; a.rel = "noopener";
  }
  function cargarTry(id) {
    var p = porId(id), src = imgDe(id, p.variantes[tVar], "frente");
    if (!src) { tImg = null; dibujar(); return; }
    var im = new Image(); im.onload = function () { tImg = im; dibujar(); }; im.src = src;
  }
  function cara() {
    var g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#c9d3ea"); g.addColorStop(1, "#eceef3");
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
    var p = porId(tModel), lbl = "solenne · " + p.nombre;
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
    var a = document.createElement("a"); a.download = "solenne-" + tModel + ".jpg"; a.href = cv.toDataURL("image/jpeg", .9); document.body.appendChild(a); a.click(); a.remove();
  };
  var drag = null;
  function pt(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; }
  cv.addEventListener("pointerdown", function (e) { var q = pt(e); drag = { dx: q.x - TS.x, dy: q.y - TS.y }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", function (e) { if (!drag) return; var q = pt(e); TS.x = q.x - drag.dx; TS.y = q.y - drag.dy; dibujar(); });
  cv.addEventListener("pointerup", function () { drag = null; }); cv.addEventListener("pointercancel", function () { drag = null; });
  pintarTryChips(); dibujar();

  /* ---------- Fotos ---------- */
  $("#filmImg").src = foto(C.fotos.editorial, 1800);
  var altG = ["Mujer con lentes cat-eye entre hojas de palmera", "Hombre con lentes aviador dorados y campera de cuero", "Mujer con lentes de acetato bordó junto a la pileta", "Mujer con lentes blancos en la rambla"];
  $("#gal").innerHTML = C.fotos.calle.map(function (id, i) { return '<figure class="rv"><img src="' + foto(id, i === 0 ? 1100 : 700) + '" alt="' + esc(altG[i]) + '" loading="lazy">' + (i === 0 ? "<figcaption>#SolenneEnLaCalle</figcaption>" : "") + "</figure>"; }).join("");

  /* ---------- Ventajas ---------- */
  var IC = {
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    capas: '<path d="M3 8l9-5 9 5-9 5z"/><path d="M3 13l9 5 9-5"/>',
    cubo: '<path d="M12 2l8.5 4.7v10.6L12 22l-8.5-4.7V6.7z"/><path d="M3.5 6.7L12 11.4l8.5-4.7M12 11.4V22"/>',
    caja: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>',
    camion: '<path d="M2 6h11v10H2zM13 10h4l4 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    escudo: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'
  };
  var FEATS = [
    ["sol", "UV400 en todos", "Filtran el 100 % de los rayos UVA y UVB. Cuidan tus ojos aunque el cristal sea claro."],
    ["capas", "Polarizados de verdad", "Cortan el reflejo del agua, la nieve y el asfalto. Ideales para manejar y para la playa."],
    ["cubo", "Miralos en 3D", "Giralos, acercalos y cambiá colores antes de comprar. Sabés exactamente qué te llega."],
    ["caja", "Llegan listos para regalar", "Estuche rígido, gamuza de microfibra y tarjeta de garantía en una caja con tu nombre."],
    ["camion", "Envíos a todo el país", "Despachamos en 24 h hábiles con seguimiento. Gratis desde " + ars(P.envioGratisDesde) + "."],
    ["escudo", "Cambios y garantía", P.cambiosDias + " días para cambiarlos y " + P.garantiaMeses + " meses de garantía en bisagras y armazón."]
  ];
  $("#feats").innerHTML = FEATS.map(function (f) { return '<div class="card rv"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + IC[f[0]] + "</svg></span><h3>" + esc(f[1]) + "</h3><p>" + esc(f[2]) + "</p></div>"; }).join("");

  /* ---------- Preguntas frecuentes ---------- */
  var FAQ = [
    ["¿Qué significa UV400?", "Que el cristal bloquea toda la radiación ultravioleta hasta 400 nanómetros, o sea el 100 % de los rayos UVA y UVB. Todos nuestros modelos son UV400.", ["uv", "400", "protec", "rayos", "ojos", "sol"]],
    ["¿Cuál es la diferencia entre polarizado y no polarizado?", "Los dos protegen igual del sol (UV400). El polarizado además corta el reflejo del agua, la nieve y el asfalto: se ve más nítido y cansa menos la vista. Los modelos polarizados lo dicen en su ficha.", ["polariz", "reflejo", "manejar", "agua", "nieve"]],
    ["¿Cómo sé qué tamaño me queda?", "Fijate las medidas de la ficha (ancho de cristal, puente y patilla) y comparalas con unos lentes que ya tengas: vienen grabadas en la patilla. También podés usar el probador con tu selfie o la guía \"Tu lente ideal\".", ["tamaño", "medida", "talle", "queda", "grande", "chico", "cara"]],
    ["¿Hacen envíos a todo el país?", "Sí. Despachamos en 24 h hábiles con seguimiento: en Córdoba llega en 24 a 48 h y al resto del país en 3 a 6 días hábiles. El envío es gratis desde " + ars(P.envioGratisDesde) + ".", ["envio", "envío", "mandan", "llega", "demora", "tarda", "correo", "provincia"]],
    ["¿Cómo pago?", "Con tarjeta de crédito en " + P.cuotasSinInteres + " cuotas sin interés, débito, Mercado Pago o transferencia con " + Math.round(P.descTransferencia * 100) + " % de descuento. Te pasamos el link de pago por WhatsApp.", ["pago", "pagar", "cuota", "tarjeta", "transfer", "mercado", "descuento", "efectivo"]],
    ["¿Puedo cambiarlos?", "Sí, tenés " + P.cambiosDias + " días para cambiarlos sin usar, con su estuche. Además tienen " + P.garantiaMeses + " meses de garantía en bisagras y armazón.", ["cambio", "cambiar", "devol", "garant", "rompe", "roto"]],
    ["¿Se pueden graduar?", "Los modelos de acetato admiten cristales recetados en cualquier óptica. Si querés, te recomendamos una en tu ciudad.", ["gradu", "receta", "aumento", "optica", "óptica", "miopia"]],
    ["¿Venden por mayor?", "Sí, tenemos lista mayorista para ópticas y tiendas, con compra mínima. Escribinos por WhatsApp y te la mandamos.", ["mayor", "mayorista", "revend", "cantidad", "local"]]
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
      if ((S.uso === "manejo" || S.uso === "playa") && p.polarizado) s += 2;
      if (S.uso === "ciudad" && !p.polarizado) s += .5;
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
    else if (paso === 3) h = cab("¿Para qué los vas a usar?", "Así sabemos si te conviene un cristal polarizado.") + chipsT("uso", USOS, S.uso) + nav(!!S.uso, "Siguiente");
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
        var src = imgDe(p.id, p.variantes[0], "tres");
        return '<div class="pick">' + (src ? '<img src="' + src + '" alt="Lentes ' + esc(p.nombre) + '">' : "") + "<b>" + esc(p.nombre) + "</b><p>" + ars(p.precio) + (p.polarizado ? " · polarizado" : "") + '</p><button type="button" data-ver="' + p.id + '">Ver en 3D</button></div>';
      }).join("") + "</div>" +
      '<p class="note">Recomendación orientativa según la forma de la cara y el uso. Cada cara es única: probalos con tu selfie o consultanos por WhatsApp antes de comprar.</p>' +
      '<div class="tool-nav"><button type="button" class="btn btn-o" data-reini>Empezar de nuevo</button><a class="btn btn-p" target="_blank" rel="noopener" href="' + wa("Hola Solenne! Soy " + S.nombre + ". Hice la guía en la web: cara " + S.cara + ", estilo " + S.estilo + ", uso: " + S.uso + ". Me recomendaron los " + r.map(function (p) { return p.nombre; }).join(" y ") + ". ¿Tienen stock?") + '">Pedirlos por WhatsApp</a></div>';
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
  document.addEventListener("solenne:imagenes", function () { if (paso === 5) pintarTool(); });

  /* ---------- Formulario ---------- */
  $("#form").addEventListener("submit", function (e) {
    e.preventDefault();
    var nom = $("#fNom").value.trim(), tel = $("#fTel").value.trim(), con = $("#fCon").value.trim();
    if (!nom || !telOk(tel)) { $("#formErr").textContent = "Completá tu nombre y un WhatsApp válido."; return; }
    $("#formErr").textContent = "";
    guardarContacto({ nombre: nom, telefono: tel, consulta: con, tipo: "formulario" });
    $("#formOk").style.display = "block";
    window.open(wa("Hola Solenne! Soy " + nom + " (" + tel + "). " + (con || "Quiero hacer una consulta.")), "_blank");
    e.target.reset();
  });

  /* ---------- Asistente ---------- */
  var chat = $("#chat"), fab = $("#aiFab"), chatM = $("#chatM"), chatI = $("#chatI"), hist = [];
  var SUG = ["¿Qué modelos tienen?", "¿Cuál me queda con cara redonda?", "¿Son polarizados?", "¿Cuánto tarda el envío?"];
  function abrir() { chat.classList.add("on"); fab.style.opacity = "0"; fab.style.pointerEvents = "none"; if (!chatM.children.length) saludo(); setTimeout(function () { chatI.focus(); }, 250); }
  function cerrar() { chat.classList.remove("on"); fab.style.opacity = ""; fab.style.pointerEvents = ""; }
  fab.addEventListener("click", abrir); $("#chatX").addEventListener("click", cerrar);
  function burbuja(cls, t) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = t; chatM.appendChild(d); chatM.scrollTop = chatM.scrollHeight; return d; }
  function bot(t, q) {
    var d = burbuja("b", t), a = document.createElement("a");
    a.className = "wa"; a.target = "_blank"; a.rel = "noopener"; a.href = wa("Hola Solenne! " + (q ? "Consulté en la web: " + q : "Quiero hacer una consulta.")); a.textContent = "Seguir por WhatsApp ›";
    d.appendChild(document.createElement("br")); d.appendChild(a); chatM.scrollTop = chatM.scrollHeight;
  }
  function saludo() {
    burbuja("b", "¡Hola! Soy la asistente de Solenne. Te ayudo a elegir modelo según tu cara, y con medidas, envíos y pagos. ¿Qué estás buscando?");
    $("#chatC").innerHTML = SUG.map(function (s) { return '<button type="button">' + esc(s) + "</button>"; }).join("");
    $$("#chatC button").forEach(function (b) { b.onclick = function () { preguntar(b.textContent); }; });
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function local(q) {
    var n = norm(q);
    var hit = PROD.filter(function (p) { return n.indexOf(norm(p.nombre)) > -1; });
    if (hit.length) return hit.map(function (p) { return p.nombre + ": " + p.detalle + " " + ars(p.precio) + " o " + P.cuotasSinInteres + " cuotas de " + cuota(p.precio) + ". Medidas " + p.medidas.join("-") + " mm." + (p.polarizado ? " Polarizado." : ""); }).join("\n") + "\nTocá el modelo en la colección para verlo en 3D.";
    for (var i = 0; i < CARAS.length; i++) if (n.indexOf(CARAS[i][0]) > -1 || n.indexOf(norm(CARAS[i][1])) > -1) {
      var k = CARAS[i][0], r = PROD.filter(function (p) { return p.caras.indexOf(k) > -1; });
      return POR_QUE[k] + " Te recomendamos: " + r.map(function (p) { return p.nombre; }).join(", ") + ". Si querés, hacé la guía \"Tu lente ideal\" para afinar la elección.";
    }
    if (/modelo|tienen|catalogo|coleccion|cuales/.test(n)) return "Tenemos " + PROD.length + " modelos: " + PROD.map(function (p) { return p.nombre + " (" + ars(p.precio) + ")"; }).join(", ") + ". Todos se pueden ver en 3D en la colección.";
    var mejor = null, pts = 0;
    FAQ.forEach(function (f) { var c = f[2].filter(function (w) { return n.indexOf(norm(w)) > -1; }).length; if (c > pts) { pts = c; mejor = f; } });
    if (mejor) return mejor[1];
    if (/precio|cuanto|sale|cuesta|valor/.test(n)) { var ps = PROD.map(function (p) { return p.precio; }); return "Los modelos van de " + ars(Math.min.apply(null, ps)) + " a " + ars(Math.max.apply(null, ps)) + ", en " + P.cuotasSinInteres + " cuotas sin interés o con " + Math.round(P.descTransferencia * 100) + " % off por transferencia."; }
    if (/horario|atienden|showroom|local|direccion/.test(n)) return N.horario + ". " + N.extra + ".";
    return "Eso te lo respondemos mejor por WhatsApp. Si me contás la forma de tu cara y para qué los querés, te recomiendo un modelo.";
  }
  function sistema() {
    return "Sos la asistente virtual de " + N.nombre + ", tienda online de lentes de sol de diseño con base en " + N.ciudad + ", Argentina. Hablás en español rioplatense con voseo, cálida, con buen gusto y breve (máximo 3 oraciones). " +
      N.horario + ". " + N.extra + ".\nModelos (precios en pesos):\n" + PROD.map(function (p) { return "- " + p.nombre + ": " + p.detalle + " " + ars(p.precio) + ". Medidas " + p.medidas.join("-") + " mm. " + (p.polarizado ? "Polarizado. " : "") + "Colores: " + p.variantes.map(nomCol).join("; ") + ". Ideal para caras: " + p.caras.join(", ") + "."; }).join("\n") +
      "\nPagos: " + P.cuotasSinInteres + " cuotas sin interés, " + Math.round(P.descTransferencia * 100) + " % off por transferencia. Envío gratis desde " + ars(P.envioGratisDesde) + ". Cambios en " + P.cambiosDias + " días, garantía de " + P.garantiaMeses + " meses. Todos UV400.\nPreguntas frecuentes:\n" + FAQ.map(function (f) { return "- " + f[0] + " " + f[1]; }).join("\n") +
      "\nNunca menciones ni compares con marcas de otras empresas. Nunca inventes modelos, colores, precios ni stock que no estén acá. Para elegir, invitá a la guía \"Tu lente ideal\" o al probador con selfie; para comprar, a escribir por WhatsApp.";
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
      gsap.to(o, { v: fin, duration: 2, delay: .8, ease: "power2.out", onUpdate: function () { el.textContent = fmt(o.v); } });
    });
  }
  if (!window.gsap || reduced) { arranco = true; $$(".rv").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; }); $$(".step").forEach(function (s) { s.classList.add("on"); }); contar(true); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(".hero .rv", { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: .12, delay: .5 });
  gsap.from(".fl", { opacity: 0, y: 20, scale: .9, duration: .9, stagger: .15, delay: 1.1, ease: "back.out(1.6)" });
  gsap.to(".fl.a", { y: -10, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".fl.b", { y: 12, duration: 3.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".hero .mark", { yPercent: 40, opacity: .3, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  contar(false);
  $$(".rv").filter(function (e) { return !e.closest(".hero"); }).forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el) % 4;
    if (el.matches(".prod,.card,.tcard,.tool,.cbox,figure,.tstage")) {
      gsap.fromTo(el, { opacity: 0, y: 80, rotateX: 18, transformPerspective: 1100, transformOrigin: "50% 100%" },
        { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: "power3.out", delay: i * .07, clearProps: "transform", scrollTrigger: { trigger: el, start: "top 92%" } });
    } else gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: "power3.out", delay: i * .06, scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  arranco = true;
  gsap.fromTo("#filmImg", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".film", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.to("#lineFill", { width: "100%", ease: "none", scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 55%", scrub: true } });
  $$(".step").forEach(function (s, i) { ScrollTrigger.create({ trigger: "#steps", start: "top+=" + (i * 50) + " 72%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } }); });
  // Inclinación 3D de las tarjetas con el mouse
  if (matchMedia("(hover: hover)").matches) $$(".card,.tcard").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transition = "transform .08s"; c.style.transform = "perspective(900px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg)"; });
    c.addEventListener("pointerleave", function () { c.style.transition = "transform .5s"; c.style.transform = ""; });
  });
})();

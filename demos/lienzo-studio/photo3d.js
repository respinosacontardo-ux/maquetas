/*
  Portada cinematográfica de Lienzo: fotos reales (Unsplash) con movimiento de cámara en 3D ligado al scroll.
  Toma 1: la campaña. Toma 2: la prenda del mes con etiquetas de detalle. Toma 3: el mismo pantalón en tres colores.
*/
(function () {
  var host = document.getElementById("h3d");
  if (!host) return;
  var reduced = document.body.classList.contains("reduced");
  var U = function (id, w) { return "https://images.unsplash.com/" + id + "?w=" + w + "&q=82&auto=format&fit=crop"; };

  // fotos: tamaño original, encuadre (object-position) y texto alternativo
  var FOTOS = {
    campana: { id: "photo-1764298493197-a1c1cce57800", w: 3471, h: 5207, pos: [0.5, 0.32], alt: "Mujer con sombrero de paja y prenda larga de lino apoyada en una pared" },
    vestido: { id: "photo-1789110853872-f416085557fa", w: 3548, h: 5322, pos: [0.5, 0.35], alt: "Vestido camisero de lino color terracota con cinturón" },
    oliva:   { id: "photo-1789110520148-bb52ba37759b", w: 4480, h: 6720, pos: [0.5, 0.45], alt: "Pantalón de lino con cordón color oliva" },
    malva:   { id: "photo-1789110520406-ebee1a8b4f23", w: 4480, h: 6720, pos: [0.5, 0.45], alt: "Pantalón de lino con cordón color malva" },
    salvia:  { id: "photo-1789110520410-4fce7246f844", w: 4480, h: 6720, pos: [0.5, 0.45], alt: "Pantalón de lino con cordón color salvia" }
  };
  var COLORES = [["oliva", "Oliva", "#6b5a3a"], ["malva", "Malva", "#c9a3a8"], ["salvia", "Salvia", "#a9c2b0"]];
  var PUNTOS = [ // etiquetas sobre el vestido (coordenadas de la foto, 0..1)
    { el: "lb1", u: 0.62, v: 0.16 },
    { el: "lb2", u: 0.57, v: 0.33 },
    { el: "lb3", u: 0.47, v: 0.62 }
  ];

  /* ---------- Escena ---------- */
  var sticky = host.querySelector(".sticky");
  var escena = document.createElement("div"); escena.className = "shots";
  sticky.insertBefore(escena, sticky.firstChild);
  var ancho = function () { return innerWidth < 760 ? 900 : 1600; };
  function foto(clave, lazy) {
    var f = FOTOS[clave], img = new Image(); img.alt = f.alt; img.decoding = "async"; if (lazy) img.loading = "lazy";
    img.src = U(f.id, ancho());
    img.style.objectPosition = (f.pos[0] * 100) + "% " + (f.pos[1] * 100) + "%";
    return img;
  }
  function toma(cls) {
    var s = document.createElement("div"); s.className = "shot " + cls;
    var inn = document.createElement("div"); inn.className = "in";
    s.appendChild(inn); escena.appendChild(s);
    return { s: s, inn: inn };
  }
  var T0 = toma("t0"); T0.img = foto("campana"); T0.inn.appendChild(T0.img);
  var T1 = toma("t1"); T1.img = foto("vestido"); T1.f = FOTOS.vestido; T1.inn.appendChild(T1.img);
  var T2 = toma("t2"); T2.imgs = {};
  COLORES.forEach(function (c, i) { var im = foto(c[0], true); im.className = i ? "" : "on"; T2.inn.appendChild(im); T2.imgs[c[0]] = im; });
  var veladura = document.createElement("div"); veladura.className = "vig"; escena.appendChild(veladura);
  var barrido = document.createElement("div"); barrido.className = "sweep"; escena.appendChild(barrido);

  // las etiquetas viven dentro de la toma 2 para moverse con ella
  PUNTOS.forEach(function (p) { p.node = document.getElementById(p.el); if (p.node) T1.inn.appendChild(p.node); });

  T0.img.addEventListener("load", function () { host.classList.add("ready"); });
  if (T0.img.complete) host.classList.add("ready");
  setTimeout(function () { host.classList.add("ready"); }, 4000);

  /* ---------- Colores ---------- */
  var swBox = document.getElementById("swatches"), swName = document.getElementById("swName");
  if (swBox) {
    swBox.innerHTML = COLORES.map(function (c, i) { return '<button type="button" class="sw' + (i ? "" : " on") + '" aria-label="' + c[1] + '" title="' + c[1] + '"><i style="background:' + c[2] + '"></i></button>'; }).join("");
    swName.textContent = COLORES[0][1];
    Array.prototype.forEach.call(swBox.children, function (b, i) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(swBox.children, function (x) { x.classList.toggle("on", x === b); });
        Object.keys(T2.imgs).forEach(function (k) { T2.imgs[k].classList.toggle("on", k === COLORES[i][0]); });
        swName.textContent = COLORES[i][1];
      });
    });
  }

  /* ---------- Coordenadas de foto → pantalla (object-fit: cover) ---------- */
  function ubicar() {
    var im = T1.img, W = im.clientWidth, H = im.clientHeight, f = T1.f;
    var contain = getComputedStyle(im).objectFit === "contain";
    var s = (contain ? Math.min : Math.max)(W / f.w, H / f.h), dw = f.w * s, dh = f.h * s;
    var ox = im.offsetLeft + (W - dw) * f.pos[0], oy = im.offsetTop + (H - dh) * f.pos[1];
    PUNTOS.forEach(function (p) { if (p.node) { p.x = ox + p.u * dw; p.y = oy + p.v * dh; } });
  }
  addEventListener("resize", ubicar); ubicar(); T1.img.addEventListener("load", ubicar);

  /* ---------- Movimiento según el scroll ---------- */
  var sm = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var paneles = [].slice.call(host.querySelectorAll(".ch"));
  var rangos = [[-1, -1, 0.13, 0.21], [0.25, 0.33, 0.56, 0.63], [0.67, 0.75, 2, 2]];
  var cue = host.querySelector(".cue"), num = document.getElementById("chapNum");
  var prog = 0, suave = 0, mx = 0, my = 0, smx = 0, smy = 0, movil = innerWidth < 760;
  addEventListener("resize", function () { movil = innerWidth < 760; });
  addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

  function poner(el, o, tx, ty, rx, ry, sc) {
    el.s.style.opacity = o;
    el.s.style.visibility = o < 0.01 ? "hidden" : "visible";
    el.inn.style.transform = "translate3d(" + tx + "%," + ty + "%,0) rotateX(" + rx + "deg) rotateY(" + ry + "deg) scale(" + sc + ")";
  }

  function aplicar(p, t) {
    paneles.forEach(function (el, i) {
      var r = rangos[i], o = (r[0] < 0 ? 1 : sm(r[0], r[1], p)) * (1 - sm(r[2], r[3], p));
      el.style.opacity = o;
      el.style.transform = (movil ? "" : "translateY(-50%) ") + "translateY(" + ((1 - o) * (p < r[1] ? 34 : -34)) + "px)";
      el.style.visibility = o < 0.02 ? "hidden" : "visible";
    });
    if (cue) cue.style.opacity = 1 - sm(0.02, 0.08, p);
    if (num) num.textContent = p < 0.24 ? "00" : p < 0.65 ? "01" : "02";

    var a0 = sm(0, 0.26, p), f01 = sm(0.2, 0.3, p), f12 = sm(0.58, 0.68, p), a1 = sm(0.22, 0.64, p), a2 = sm(0.6, 1, p);
    var res = Math.sin(t * 0.4) * 0.6;   // respiración sutil de la cámara
    // toma 1: la campaña se aleja y gira en 3D
    poner(T0, 1 - f01, lerp(0, 4, a0) + smx * -1.2, smy * -1, lerp(0, 3, a0), lerp(-6, 4, a0) + smx * 3, lerp(1.12, 1.0, a0) + res * 0.004);
    // toma 2: la prenda entra desde la derecha y gira como en un probador
    poner(T1, f01 * (1 - f12), lerp(8, -2, a1) + smx * -1.2, lerp(2, -1, a1), lerp(-3, 2, a1), lerp(-14, 6, a1) + smx * 3, lerp(1.1, 1.0, a1));
    // toma 3: se eleva y se acerca mientras elegís el color
    poner(T2, f12, lerp(-4, 0, a2) + smx * -1.2, lerp(4, 0, a2), lerp(8, 0, a2), lerp(12, -3, a2) + smx * 3, lerp(1.1, 1.0, a2) + res * 0.004);

    barrido.style.transform = "translateX(" + lerp(-60, 600, (p * 2.4) % 1) + "%) skewX(-18deg)";
    barrido.style.opacity = 0.6 * Math.sin(Math.PI * ((p * 2.4) % 1));

    PUNTOS.forEach(function (q, i) {
      if (!q.node) return;
      var o = sm(0.36 + i * 0.03, 0.41 + i * 0.03, p) * (1 - sm(0.54, 0.59, p));
      q.node.style.opacity = o; q.node.style.visibility = o < 0.02 ? "hidden" : "visible";
      q.node.style.transform = "translate(" + q.x + "px," + q.y + "px)" + (movil ? "" : " translateX(-100%)");
    });
  }

  if (window.ScrollTrigger && !reduced) {
    ScrollTrigger.create({ trigger: host, start: "top top", end: "bottom bottom", onUpdate: function (s) { prog = s.progress; } });
  }
  var visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: "120px" }).observe(host);
  var t0 = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    suave += (prog - suave) * 0.09;
    smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    aplicar(suave, reduced ? 0 : (now - t0) / 1000);
  })(performance.now());
})();

/*
  Portada cinematográfica de Altura: fotos reales de la Ford Ranger (Unsplash) con movimiento de cámara en 3D
  ligado al scroll. Cada capítulo es una toma: acercamiento, travelling lateral con etiquetas y elección de color
  (cada color es otra foto real de la camioneta).
*/
(function () {
  var host = document.getElementById("h3d");
  if (!host) return;
  var reduced = document.body.classList.contains("reduced");
  var U = function (id, w) { return "https://images.unsplash.com/" + id + "?w=" + w + "&q=82&auto=format&fit=crop"; };

  // tomas: foto, encuadre (object-position) y puntos de interés en coordenadas de la foto (0..1)
  var FOTOS = {
    gris:    { id: "photo-1700943937372-12c2611b5af8", w: 1600, h: 2000, pos: [0.42, 0.62], alt: "Ford Ranger Raptor gris en un camino de otoño" },
    naranja: { id: "photo-1641974785585-211f7e89822f", w: 1400, h: 933,  pos: [0.62, 0.62], alt: "Ford Ranger naranja en la montaña" },
    negro:   { id: "photo-1678037055154-492f436ea5a4", w: 1400, h: 932,  pos: [0.62, 0.6],  alt: "Ford Ranger negra en la nieve" }
  };
  var COLORES = [["negro", "Negro", "#0e0f11"], ["gris", "Gris grafito", "#5b5f64"], ["naranja", "Naranja", "#c2581c"]];
  var PUNTOS = [ // etiquetas sobre la toma 2 (Ranger naranja)
    { el: "lb1", u: 0.43, v: 0.66 },
    { el: "lb2", u: 0.565, v: 0.77 },
    { el: "lb3", u: 0.6, v: 0.5 }
  ];

  /* ---------- Escena ---------- */
  var sticky = host.querySelector(".sticky");
  var escena = document.createElement("div"); escena.className = "shots";
  sticky.insertBefore(escena, sticky.firstChild);
  function toma(clave, cls) {
    var f = FOTOS[clave], s = document.createElement("div"); s.className = "shot " + (cls || "");
    var inn = document.createElement("div"); inn.className = "in";
    var img = new Image(); img.alt = f.alt; img.decoding = "async";
    img.src = U(f.id, innerWidth < 760 ? (f.w > f.h ? 1400 : 900) : 2000);
    img.style.objectPosition = (f.pos[0] * 100) + "% " + (f.pos[1] * 100) + "%";
    img.dataset.k = clave;
    inn.appendChild(img); s.appendChild(inn); escena.appendChild(s);
    return { s: s, inn: inn, img: img, f: f };
  }
  var T0 = toma("gris", "t0"), T1 = toma("naranja", "t1");
  // la foto de portada es vertical: en compu va a la derecha, sobre una copia desenfocada que llena el fondo
  var fondo = new Image(); fondo.alt = ""; fondo.className = "blur"; fondo.src = U(FOTOS.gris.id, 600);
  T0.inn.insertBefore(fondo, T0.img);
  var T2 = { s: document.createElement("div"), inn: document.createElement("div"), imgs: {} };
  T2.s.className = "shot t2"; T2.inn.className = "in"; T2.s.appendChild(T2.inn); escena.appendChild(T2.s);
  COLORES.forEach(function (c, i) {
    var f = FOTOS[c[0]], img = new Image(); img.alt = f.alt; img.decoding = "async"; img.loading = "lazy";
    img.src = U(f.id, innerWidth < 760 ? (f.w > f.h ? 1400 : 900) : 2000);
    img.style.objectPosition = (f.pos[0] * 100) + "% " + (f.pos[1] * 100) + "%";
    img.className = i ? "" : "on";
    T2.inn.appendChild(img); T2.imgs[c[0]] = img;
  });
  var v2 = document.createElement("div"); v2.className = "vig2"; T2.s.appendChild(v2);
  var veladura = document.createElement("div"); veladura.className = "vig"; escena.appendChild(veladura);
  var barrido = document.createElement("div"); barrido.className = "sweep"; escena.appendChild(barrido);

  // las etiquetas viven dentro de la toma 2 para moverse con ella
  PUNTOS.forEach(function (p) { p.node = document.getElementById(p.el); if (p.node) T1.inn.appendChild(p.node); });

  T0.img.addEventListener("load", function () { host.classList.add("ready"); });
  if (T0.img.complete) host.classList.add("ready");

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
    var s = Math.max(W / f.w, H / f.h), dw = f.w * s, dh = f.h * s;
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
    // toma 1: acercamiento lento con giro en 3D
    poner(T0, 1 - f01, lerp(0, -3, a0) + smx * -1.2, smy * -1, lerp(0, 2, a0), lerp(-5, 3, a0) + smx * 3, lerp(1.16, 1.02, a0) + res * 0.004);
    // toma 2: travelling lateral, la camioneta "pasa" frente a la cámara
    poner(T1, f01 * (1 - f12), lerp(5, -5, a1) + smx * -1.2, lerp(1.5, -1, a1), lerp(-3, 2, a1), lerp(9, -6, a1) + smx * 3, lerp(1.18, 1.06, a1));
    // toma 3: se eleva y se acerca mientras elegís el color
    poner(T2, f12, smx * -1.2, lerp(3, 0, a2), lerp(7, 0, a2), lerp(-4, 2, a2) + smx * 3, lerp(1.12, 1.0, a2) + res * 0.004);

    barrido.style.transform = "translateX(" + lerp(-60, 160, (p * 2.4) % 1) + "%) skewX(-18deg)";
    barrido.style.opacity = 0.5 * Math.sin(Math.PI * ((p * 2.4) % 1));

    PUNTOS.forEach(function (q, i) {
      if (!q.node) return;
      var o = sm(0.38 + i * 0.02, 0.43 + i * 0.02, p) * (1 - sm(0.54, 0.59, p));
      q.node.style.opacity = o; q.node.style.visibility = o < 0.02 ? "hidden" : "visible";
      q.node.style.transform = "translate(" + q.x + "px," + (q.y + (q.node.classList.contains("dn") ? 54 : q.node.classList.contains("up") ? -64 : 0)) + "px)" + (movil ? " translateX(-100%)" : "");
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

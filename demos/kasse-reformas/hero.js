/*
  Portada de Kasse: fotos reales de sus obras con movimiento de cámara en 3D ligado al scroll.
  Toma 1: baño de mármol. Toma 2: baño adaptado con etiquetas de detalle. Toma 3: la masía de Alfred.
*/
(function () {
  var host = document.getElementById("h3d");
  if (!host) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || /estatico/.test(location.search);
  var shots = [].slice.call(host.querySelectorAll(".shot")).map(function (s) { return { s: s, inn: s.querySelector(".in") }; });
  var paneles = [].slice.call(host.querySelectorAll(".ch"));
  var etiquetas = [].slice.call(host.querySelectorAll(".lbl"));
  var cue = host.querySelector(".cue"), num = document.getElementById("chapNum");
  var rangos = [[-1, -1, 0.2, 0.28], [0.32, 0.4, 0.6, 0.67], [0.71, 0.79, 2, 2]];

  var sm = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var prog = 0, suave = 0, mx = 0, my = 0, smx = 0, smy = 0, movil = innerWidth < 860;
  addEventListener("resize", function () { movil = innerWidth < 860; });
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
      el.style.visibility = o < 0.02 ? "hidden" : "visible";
      el.style.transform = (movil ? "" : "translateY(-50%) ") + "translateY(" + ((1 - o) * (p < r[1] ? 36 : -36)) + "px)";
    });
    if (cue) cue.style.opacity = 1 - sm(0.02, 0.08, p);
    if (num) num.textContent = p < 0.3 ? "01" : p < 0.69 ? "02" : "03";

    var f01 = sm(0.26, 0.36, p), f12 = sm(0.62, 0.72, p);
    var a0 = sm(0, 0.32, p), a1 = sm(0.28, 0.68, p), a2 = sm(0.64, 1, p);
    var res = Math.sin(t * 0.5) * 0.5, gx = smx * 4, gy = smy * -3;
    // toma 1: el baño de mármol se aleja y gira hacia la izquierda
    poner(shots[0], 1 - f01, lerp(0, -6, a0), lerp(0, 3, a0), lerp(0, 6, a0) + gy, lerp(-8, 10, a0) + gx, lerp(1.04, 0.94, a0) + res * 0.004);
    // toma 2: el baño adaptado entra girando, como si la cámara rodeara la obra
    poner(shots[1], f01 * (1 - f12), lerp(10, -3, a1), lerp(4, -2, a1), lerp(-6, 3, a1) + gy, lerp(-22, 8, a1) + gx, lerp(1.08, 1.0, a1));
    // toma 3: la masía sube desde abajo y se endereza
    poner(shots[2], f12, lerp(0, 0, a2), lerp(14, 0, a2), lerp(16, 0, a2) + gy, lerp(10, -4, a2) + gx, lerp(1.1, 1.0, a2) + res * 0.004);

    etiquetas.forEach(function (q, i) {
      var o = sm(0.42 + i * 0.03, 0.46 + i * 0.03, p) * (1 - sm(0.58, 0.63, p));
      q.style.opacity = o; q.style.visibility = o < 0.02 ? "hidden" : "visible";
    });
  }

  window.__heroFijar = function (p) { prog = suave = p; aplicar(p, 0); }; // para pruebas
  if (reduced || !window.ScrollTrigger) {
    // sin animación: se muestra la primera toma fija
    aplicar(0, 0);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({ trigger: host, start: "top top", end: "bottom bottom", onUpdate: function (s) { prog = s.progress; } });
  var visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: "120px" }).observe(host);
  var t0 = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    suave += (prog - suave) * 0.09;
    smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    aplicar(suave, (now - t0) / 1000);
  })(performance.now());
})();

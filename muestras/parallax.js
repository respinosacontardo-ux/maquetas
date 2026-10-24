/*
  Parallax de fotos con GSAP + ScrollTrigger, compartido por las muestras y maquetas de Facundo Social Media.
  Uso: <script src="/muestras/parallax.js" defer></script>
  - Cada foto del contenido (no la portada) aparece escalando de 0.7 a 1.2 y de opacidad 0 a 1
    a lo largo de 600px de scroll (400px en el celular, para que no quede transparente casi toda la pantalla),
    con ease "power2.out".
  - Además se desplaza en vertical más lento que el scroll (yPercent -10 → 10 = 20% de su alto),
    lo que da sensación de profundidad. La foto queda recortada por su recuadro, así nunca se ven bordes vacíos.
  Si la persona prefiere menos movimiento o GSAP no carga, las fotos quedan quietas y visibles.
*/
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/";
  var RECORRIDO = matchMedia("(max-width: 700px)").matches ? 400 : 600;

  function cargar(src, listo) {
    var s = document.createElement("script");
    s.src = src; s.onload = listo;
    document.head.appendChild(s);
  }

  // Recuadro que recorta la foto: su contenedor si solo la envuelve a ella; si no, uno nuevo
  function recuadro(img) {
    var p = img.parentElement;
    var soloFoto = p && [].every.call(p.children, function (c) { return c === img || getComputedStyle(c).position === "absolute"; });
    if (soloFoto && !/^(SECTION|MAIN|BODY|A)$/.test(p.tagName) && !/container|wrap|grid/i.test(p.className)) return p;
    var box = document.createElement("div");
    box.className = "fsm-parallax";
    box.style.cssText = "overflow:hidden;border-radius:" + getComputedStyle(img).borderRadius;
    p.insertBefore(box, img);
    box.appendChild(img);
    return box;
  }

  function fotos() {
    return [].filter.call(document.querySelectorAll("main img, section img"), function (img) {
      if (img.closest("section.hero, header, nav, footer, .wa-float, .fx3d-stage, [class*='logo'], [class*='avatar']")) return false;
      var r = img.getBoundingClientRect();
      return (r.width || img.width) >= 120;
    });
  }

  function iniciar() {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    fotos().forEach(function (img) {
      var box = recuadro(img);
      if (getComputedStyle(box).position === "static") box.style.position = "relative";
      box.style.overflow = "hidden";
      img.style.willChange = "transform, opacity";
      // Carga inmediata: con la foto transparente y achicada, la carga diferida del navegador a veces no arranca
      if (img.loading === "lazy") img.loading = "eager";
      // Aparición: escala 0.7 → 1.2 y opacidad 0 → 1 a lo largo del recorrido
      gsap.fromTo(img, { scale: 0.7, opacity: 0 }, {
        scale: 1.2, opacity: 1, ease: "power2.out",
        scrollTrigger: { trigger: box, start: "top bottom", end: "+=" + RECORRIDO, scrub: true }
      });
      // Profundidad: la foto se mueve 20% más lento que el scroll
      gsap.fromTo(img, { yPercent: -10 }, {
        yPercent: 10, ease: "none",
        scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    // Las fotos que cargan tarde cambian el alto de la página: se recalculan las posiciones
    addEventListener("load", function () { window.ScrollTrigger.refresh(); });
  }

  function start() {
    if (window.gsap && window.ScrollTrigger) return iniciar();
    var conScroll = function () { window.ScrollTrigger ? iniciar() : cargar(CDN + "ScrollTrigger.min.js", iniciar); };
    window.gsap ? conScroll() : cargar(CDN + "gsap.min.js", conScroll);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/*
  Efectos 3D compartidos para las muestras de Facundo Social Media.
  Uso: <script src="/muestras/fx3d.js" data-theme="estetica|kinesiologia|gimnasio|barberia" defer></script>
  - Escena 3D (Three.js) detrás del contenido de la portada (section.hero), con objetos del rubro.
  - Los objetos reaccionan al mouse/inclinación y al scroll.
  - Tarjetas que se inclinan en 3D al pasar el mouse.
  Si el navegador no tiene WebGL o la persona prefiere menos movimiento, la página queda como antes.
*/
(function () {
  var script = document.currentScript;
  var THEME = (script && script.dataset.theme) || "estetica";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = matchMedia("(max-width: 700px)").matches;

  var THEMES = {
    estetica:     { a: 0xc9938a, b: 0x6b3a4b, c: 0xf3e6dd, light: true },
    kinesiologia: { a: 0x0f9488, b: 0xff7a59, c: 0x5eead4, light: true },
    gimnasio:     { a: 0xc6f432, b: 0xffffff, c: 0x3f4a0c, light: false },
    barberia:     { a: 0xc9a25b, b: 0xc8642f, c: 0xf2ead9, light: false }
  };
  var T = THEMES[THEME] || THEMES.estetica;

  /* ---------- Tarjetas con inclinación 3D ---------- */
  function tilt() {
    if (reduce || !matchMedia("(hover: hover)").matches) return;
    var sel = "[class*='card']:not([class*='cards']), .plan, .price-card, .service, .team-member, .testimonial, .review";
    document.querySelectorAll(sel).forEach(function (c) {
      if (c.closest("header, nav, footer") || c.offsetWidth < 160) return;
      c.style.transformStyle = "preserve-3d";
      c.style.willChange = "transform";
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = "transform .08s ease-out";
        c.style.transform = "perspective(900px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg) translateZ(6px)";
      });
      c.addEventListener("pointerleave", function () {
        c.style.transition = "transform .5s ease";
        c.style.transform = "";
      });
    });
  }

  /* ---------- Fotos con profundidad 3D al hacer scroll ---------- */
  function depth() {
    if (reduce) return;
    var tiles = [];
    document.querySelectorAll("main img, section img").forEach(function (img) {
      if (img.closest("section.hero, header, nav, footer, .fx3d-stage")) return;
      if (img.width && img.width < 120) return;
      // se mueve el recuadro que contiene la foto (si es una tarjeta chica), si no la foto misma
      var el = img.parentElement && img.parentElement.children.length <= 3 && !/section|container|wrap/i.test(img.parentElement.className + img.parentElement.tagName) ? img.parentElement : img;
      if (tiles.indexOf(el) === -1) tiles.push(el);
    });
    // Galerías armadas con fondos de imagen (sin <img>)
    document.querySelectorAll("[class*='gallery'] > *, [class*='galeria'] > *").forEach(function (el) {
      if (!el.closest("section.hero") && tiles.indexOf(el) === -1 && !tiles.some(function (x) { return el.contains(x) || x.contains(el); })) tiles.push(el);
    });
    if (!tiles.length) return;
    tiles.forEach(function (el) { el.style.willChange = "transform"; el.style.transformOrigin = "center center"; });
    var ticking = false;
    function update() {
      ticking = false;
      var vh = innerHeight;
      tiles.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)); // -1 arriba … 1 abajo
        el.style.transform = "perspective(900px) rotateX(" + (d * -14).toFixed(2) + "deg) translateZ(" + ((1 - Math.abs(d)) * 18).toFixed(1) + "px) scale(" + (1 - Math.abs(d) * 0.05).toFixed(3) + ")";
      });
    }
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- Escena 3D de la portada ---------- */
  function scene() {
    var hero = document.querySelector("section.hero");
    if (!hero || !window.THREE || reduce) return;
    var cs = getComputedStyle(hero);
    if (cs.position === "static") hero.style.position = "relative";
    hero.style.isolation = "isolate";
    hero.style.overflow = "hidden";

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:0;transition:opacity 1.2s ease";
    hero.insertBefore(canvas, hero.firstChild);
    // En el celular el 3D va de fondo y suave, en los bordes: no ocupa lugar ni tapa el texto
    var OPACIDAD = mobile ? (T.light ? "0.5" : "0.6") : "1";

    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobile, alpha: true }); }
    catch (e) { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
    var sc = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(0, 0, 14);

    sc.add(new THREE.AmbientLight(0xffffff, T.light ? 0.75 : 0.35));
    var key = new THREE.DirectionalLight(0xffffff, T.light ? 0.9 : 1.2); key.position.set(5, 6, 8); sc.add(key);
    var rim = new THREE.PointLight(T.a, 2.2, 40); rim.position.set(-6, -3, 6); sc.add(rim);

    var M = function (color, o) {
      o = o || {};
      return new THREE.MeshStandardMaterial({ color: color, metalness: o.m != null ? o.m : 0.55, roughness: o.r != null ? o.r : 0.25,
        transparent: o.op != null, opacity: o.op != null ? o.op : 1, wireframe: !!o.w });
    };
    var group = new THREE.Group(); sc.add(group);
    var items = [];
    // x positivo = a la derecha del texto (en el celular se reacomodan en los bordes: ver más abajo)
    var add = function (mesh, x, y, z, spin) {
      mesh.position.set(x, y, z); mesh.userData = { y: y, spin: spin || 0.3, ph: Math.random() * 6 };
      group.add(mesh); items.push(mesh); return mesh;
    };

    if (THEME === "estetica") {
      // Perlas y burbujas brillantes, anillo de "esmalte"
      add(new THREE.Mesh(new THREE.SphereGeometry(1.25, 64, 64), M(T.c, { m: 0.2, r: 0.08 })), 5.2, 1.6, -1, 0.2);
      add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 48, 48), M(T.a, { m: 0.4, r: 0.12 })), 3.6, -1.9, 1, 0.3);
      add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), M(T.b, { m: 0.5, r: 0.15 })), 6.6, -0.6, 0.5, 0.4);
      add(new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.09, 24, 120), M(T.a, { m: 0.9, r: 0.2 })), 5.2, 1.6, -1.2, 0.25);
      add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), M(T.c, { m: 0.2, r: 0.1 })), -6.2, 2.6, -2, 0.5);
      add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), M(T.a, { m: 0.3, r: 0.1, op: 0.7 })), -5.6, -2.8, -1, 0.35);
    } else if (THEME === "kinesiologia") {
      // Doble hélice de esferas (movimiento/salud) + cápsulas
      var helix = new THREE.Group();
      for (var i = 0; i < 26; i++) {
        var t = i / 25 * Math.PI * 3, yy = (i - 12.5) * 0.28;
        [0, Math.PI].forEach(function (off, k) {
          var s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), M(k ? T.b : T.a, { m: 0.3, r: 0.2 }));
          s.position.set(Math.cos(t + off) * 1.1, yy, Math.sin(t + off) * 1.1); helix.add(s);
        });
        var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), M(T.c, { m: 0.1, r: 0.6, op: 0.55 }));
        bar.position.y = yy; bar.rotation.z = Math.PI / 2; bar.rotation.y = -t; helix.add(bar);
      }
      add(helix, 5.4, 0, -1, 0.35).rotation.z = 0.35;
      var cap = function () { var g = new THREE.Group(); var m1 = M(T.a, { m: 0.2, r: 0.15 }), m2 = M(0xffffff, { m: 0.1, r: 0.2 });
        var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 32), m1); c1.position.y = 0.3;
        var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 32), m2); c2.position.y = -0.3;
        var s1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 16), m1); s1.position.y = 0.6;
        var s2 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 16), m2); s2.position.y = -0.6;
        g.add(c1, c2, s1, s2); return g; };
      add(cap(), -5.8, 2.2, -1, 0.5).rotation.z = 0.8;
      add(cap(), 2.9, -2.6, 1, 0.45).rotation.z = -0.6;
      add(new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 16, 90), M(T.b, { m: 0.6, r: 0.2 })), -6.4, -2.4, -2, 0.3);
    } else if (THEME === "gimnasio") {
      // Mancuerna metálica + discos + icosaedro de alambre neón
      var db = new THREE.Group(), steel = M(0x9ca3af, { m: 1, r: 0.25 }), plate = M(0x18181b, { m: 0.8, r: 0.35 }), neon = M(T.a, { m: 0.3, r: 0.3 });
      var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.6, 24), steel); handle.rotation.z = Math.PI / 2; db.add(handle);
      [-1, 1].forEach(function (s) {
        [0, 0.38].forEach(function (o, j) {
          var p = new THREE.Mesh(new THREE.CylinderGeometry(j ? 0.72 : 0.95, j ? 0.72 : 0.95, 0.3, 48), j ? neon : plate);
          p.rotation.z = Math.PI / 2; p.position.x = s * (1.25 + o); db.add(p);
        });
      });
      add(db, 4.6, 1.4, 0, 0.4).rotation.set(0.4, 0.3, -0.35);
      add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), M(T.a, { w: true, m: 0, r: 1 })), -5.4, 2.4, -2, 0.25);
      add(new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.32, 24, 64), plate), 5.6, -2.4, -1.5, 0.35);
      add(new THREE.Mesh(new THREE.OctahedronGeometry(0.6), neon), -3.6, -2.8, 0.5, 0.6);
    } else {
      // Poste de barbería con franjas + anillos de bronce + tijera estilizada
      var cv = document.createElement("canvas"); cv.width = 128; cv.height = 512; var g2 = cv.getContext("2d");
      g2.fillStyle = "#f2ead9"; g2.fillRect(0, 0, 128, 512);
      for (var k = -6; k < 14; k++) { g2.fillStyle = k % 2 ? "#c8642f" : "#1e3a5f"; g2.beginPath();
        g2.moveTo(0, k * 64); g2.lineTo(128, k * 64 - 64); g2.lineTo(128, k * 64 - 32); g2.lineTo(0, k * 64 + 32); g2.fill(); }
      var tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      var pole = new THREE.Group();
      var glassT = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 3.4, 48), new THREE.MeshStandardMaterial({ map: tex, metalness: 0.1, roughness: 0.3 }));
      var brass = M(T.a, { m: 1, r: 0.2 });
      var capT = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), brass); capT.position.y = 1.85;
      var ringT = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.25, 48), brass); ringT.position.y = 1.75;
      var ringB = ringT.clone(); ringB.position.y = -1.75;
      var capB = capT.clone(); capB.rotation.x = Math.PI; capB.position.y = -1.85;
      pole.add(glassT, capT, ringT, ringB, capB);
      pole.userData.tex = tex;
      add(pole, 5.4, 0.3, -0.5, 0).rotation.z = 0.12;
      add(new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.07, 16, 100), brass), -5.6, 2.2, -2, 0.3);
      add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.16, 120, 16), brass), -4.4, -2.6, 0, 0.4);
      add(new THREE.Mesh(new THREE.OctahedronGeometry(0.45), M(T.b, { m: 0.7, r: 0.25 })), 2.8, -2.8, 1, 0.6);
    }

    if (mobile) {
      // Posiciones para una portada angosta y alta (cámara en z=14: x llega a ±2,5 aprox.)
      var LUGARES = [[1.9, 4.3, -1, 0.5], [-2.2, 1.6, -2, 0.38], [2.3, -1.8, -1, 0.36], [-2.0, -4.2, -1, 0.34], [2.1, -5.2, -2, 0.3], [-2.3, 5.0, -2, 0.3]];
      items.forEach(function (m, i) {
        var l = LUGARES[i % LUGARES.length];
        m.position.set(l[0], l[1], l[2]); m.userData.y = l[1];
        m.scale.multiplyScalar(l[3]);
      });
    }

    // Polvo brillante suave
    var N = mobile ? 160 : 360, pos = new Float32Array(N * 3);
    for (var p = 0; p < N; p++) { pos[p * 3] = (Math.random() - 0.5) * 22; pos[p * 3 + 1] = (Math.random() - 0.5) * 12; pos[p * 3 + 2] = (Math.random() - 0.5) * 8 - 2; }
    var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: T.a, size: mobile ? 0.05 : 0.04, transparent: true, opacity: T.light ? 0.55 : 0.7 }));
    sc.add(dust);

    function size() {
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      cam.position.z = 14;
    }
    size(); addEventListener("resize", size);

    var mx = 0, my = 0, visible = true;
    addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    addEventListener("deviceorientation", function (e) { if (e.gamma != null) { mx = Math.max(-0.5, Math.min(0.5, e.gamma / 60)); my = Math.max(-0.5, Math.min(0.5, (e.beta - 40) / 60)); } }, { passive: true });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);

    var clock = new THREE.Clock();
    setTimeout(function () { canvas.style.opacity = OPACIDAD; }, 60);
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      var t = clock.getElapsedTime();
      var sy = Math.min(scrollY / Math.max(hero.clientHeight, 1), 1.5);
      items.forEach(function (m, i) {
        m.rotation.y += 0.004 * (m.userData.spin * 2 + 0.3);
        m.rotation.x += 0.0025 * m.userData.spin;
        m.position.y = m.userData.y + Math.sin(t * 0.9 + m.userData.ph) * 0.28 + sy * (mobile ? 0.8 : 1.2 + i * 0.35);
        if (m.userData.tex) m.userData.tex.offset.y = -t * 0.25;
      });
      dust.rotation.y = t * 0.03;
      group.rotation.y += (mx * 0.35 - group.rotation.y) * 0.05;
      group.rotation.x += (my * 0.22 - group.rotation.x) * 0.05;
      renderer.render(sc, cam);
    })();
  }

  function start() {
    tilt();
    depth();
    if (reduce) return;
    if (window.THREE) return scene();
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = scene;
    document.head.appendChild(s);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

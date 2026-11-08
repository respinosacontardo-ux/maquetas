/*
  Portada 3D de Nácar: un diente de porcelana modelado en código (Three.js r128).
  Al bajar, el diente gira, sus raíces se disuelven y aparece un implante de titanio:
  la corona se separa (vista explotada con etiquetas) y vuelve a encajar.
*/
(function () {
  var host = document.getElementById("h3d");
  var canvas = document.getElementById("toothCanvas");
  if (!host || !canvas || !window.THREE) return;
  var reduced = document.body.classList.contains("reduced");

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { host.classList.add("no3d"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.4, 11);

  /* ---------- Entorno de estudio (softboxes) para los reflejos ---------- */
  (function () {
    var env = new THREE.Scene();
    var room = new THREE.Mesh(new THREE.BoxGeometry(20, 14, 20), new THREE.MeshBasicMaterial({ color: 0x5d6673, side: THREE.BackSide }));
    env.add(room);
    function box(w, h, x, y, z, ry, rx, c, k) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.y = ry || 0; m.rotation.x = rx || 0; env.add(m);
    }
    box(10, 3, 0, 6.5, 0, 0, Math.PI / 2, 0xffffff, 3);      // luz cenital
    box(4, 8, -9.5, 1, 2, Math.PI / 2, 0, 0xffffff, 2.4);     // softbox izquierdo
    box(4, 8, 9.5, 1, -2, -Math.PI / 2, 0, 0xdfeaff, 1.8);    // softbox derecho, frío
    box(6, 2, 0, -1, 9.5, Math.PI, 0, 0xffffff, 1.4);         // frente
    box(3, 3, 4, -3, -9.5, 0, 0, 0x5ab0ff, 1.2);              // acento azul
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.035).texture;
    pm.dispose();
  })();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c4d4, 0.25));
  var key = new THREE.DirectionalLight(0xfff8ee, 1.3); key.position.set(3, 5, 4); scene.add(key);
  var rim = new THREE.DirectionalLight(0x8cc4ff, 0.7); rim.position.set(-4, 1, -3); scene.add(rim);

  /* ---------- Utilidades de geometría ---------- */
  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  // promedia normales de vértices repetidos (costuras de la esfera) para que no se vean líneas
  function soldar(geo) {
    geo.computeVertexNormals();
    var p = geo.attributes.position, n = geo.attributes.normal, map = {};
    for (var i = 0; i < p.count; i++) {
      var k = Math.round(p.getX(i) * 1e4) + "_" + Math.round(p.getY(i) * 1e4) + "_" + Math.round(p.getZ(i) * 1e4);
      (map[k] = map[k] || []).push(i);
    }
    Object.keys(map).forEach(function (k) {
      var ids = map[k]; if (ids.length < 2) return;
      var v = new THREE.Vector3();
      ids.forEach(function (i) { v.x += n.getX(i); v.y += n.getY(i); v.z += n.getZ(i); });
      v.normalize();
      ids.forEach(function (i) { n.setXYZ(i, v.x, v.y, v.z); });
    });
    n.needsUpdate = true;
    return geo;
  }

  /* Corona de molar: esfera deformada → sección cuadrada redondeada, 4 cúspides y surcos */
  function corona() {
    var g = new THREE.SphereGeometry(1, 160, 120), p = g.attributes.position;
    var cusps = [[0.4, 0.34], [-0.4, 0.34], [0.42, -0.34], [-0.38, -0.36]];
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      var a = Math.atan2(z, x), n = 4;
      var sq = Math.pow(Math.pow(Math.abs(Math.cos(a)), n) + Math.pow(Math.abs(Math.sin(a)), n), -1 / n);
      var s = 1 + (sq - 1) * 0.55;
      var neck = y < 0 ? 1 - 0.42 * smooth(0, -1, y) : 1 + 0.03 * Math.sin(y * Math.PI);
      var X = x * s * 1.05 * neck, Z = z * s * 0.94 * neck;
      var Y = y >= 0 ? y * 0.7 : y * 0.95;
      var w = smooth(0.5, 0.97, y);
      if (w > 0) {
        var bump = 0;
        cusps.forEach(function (c) { var dx = X - c[0], dz = Z - c[1]; bump += Math.exp(-(dx * dx + dz * dz) / 0.075); });
        Y += w * (0.13 * bump - 0.08);
        Y -= w * 0.075 * Math.exp(-(X * X) / 0.01) * (1 - 0.5 * Math.exp(-(Z * Z) / 0.3));
        Y -= w * 0.05 * Math.exp(-(Z * Z) / 0.012);
      }
      p.setXYZ(i, X, Y, Z);
    }
    return soldar(g);
  }

  /* Raíz: torno con punta redondeada */
  function raiz(alto, r0) {
    var pts = [], N = 40;
    for (var i = 0; i <= N; i++) {
      var t = i / N; // 0 = punta, 1 = arriba
      var r = t === 0 ? 0 : r0 * Math.pow(t, 0.42) * (0.9 + 0.1 * t);
      pts.push(new THREE.Vector2(r, -alto + alto * t));
    }
    pts.push(new THREE.Vector2(0.001, 0.02));
    var g = new THREE.LatheGeometry(pts, 64);
    g.scale(1, 1, 0.78);
    return soldar(g);
  }

  /* Implante de titanio: núcleo cónico con roscas */
  function implanteGeo() {
    var pts = [new THREE.Vector2(0.001, -1.42)], L = 1.4, paso = 0.085;
    for (var y = -1.38; y <= 0; y += 0.006) {
      var t = (y + L) / L;                                   // 0 abajo, 1 arriba
      var taper = 0.55 + 0.45 * smooth(0, 0.35, t);
      var core = 0.17 * taper;
      var fase = ((y / paso) % 1 + 1) % 1, tri = 1 - Math.abs(fase * 2 - 1);
      var rosca = y > -0.1 ? 0 : 0.075 * taper * Math.pow(tri, 1.6);
      var r = y > -0.1 ? 0.235 : core + rosca;
      if (y < -1.3) r *= smooth(-1.43, -1.3, y) * 0.6 + 0.4;
      pts.push(new THREE.Vector2(r, y));
    }
    pts.push(new THREE.Vector2(0.2, 0.02), new THREE.Vector2(0.001, 0.02));
    return new THREE.LatheGeometry(pts, 72);
  }

  /* ---------- Materiales ---------- */
  var esmalte = new THREE.MeshPhysicalMaterial({ color: 0xf3efe7, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.15 });
  var dentina = new THREE.MeshPhysicalMaterial({ color: 0xefe6d6, roughness: 0.4, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3, transparent: true, envMapIntensity: 0.9 });
  var titanio = new THREE.MeshPhysicalMaterial({ color: 0xc8ccd3, roughness: 0.26, metalness: 1, clearcoat: 0.3, transparent: true, envMapIntensity: 1.4 });

  /* ---------- Modelo ---------- */
  var root = new THREE.Group();      // posición y escala según pantalla
  var spin = new THREE.Group();      // giro
  root.add(spin); scene.add(root);

  var crown = new THREE.Mesh(corona(), esmalte);
  spin.add(crown);

  var raices = new THREE.Group();
  [[-0.34, 0.14, 1.55, 0.34], [0.35, -0.16, 1.45, 0.33], [0.02, 0.02, 1.35, 0.26]].forEach(function (r, i) {
    var m = new THREE.Mesh(raiz(r[2], r[3]), dentina);
    m.position.set(r[0], -0.45, i === 2 ? -0.18 : 0.06);
    m.rotation.z = r[1]; if (i === 2) m.rotation.x = -0.12;
    raices.add(m);
  });
  spin.add(raices);

  var implante = new THREE.Group();
  var pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.21, 0.42, 6, 1), titanio);
  pilar.position.y = -0.38;
  var tornillo = new THREE.Mesh(implanteGeo(), titanio);
  tornillo.position.y = -0.62;
  implante.add(pilar, tornillo);
  spin.add(implante);

  /* sombra suave de contacto */
  var cv = document.createElement("canvas"); cv.width = cv.height = 128;
  var cx = cv.getContext("2d"), gr = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(20,40,80,.35)"); gr.addColorStop(1, "rgba(20,40,80,0)");
  cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
  var sombra = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = -2.45;
  root.add(sombra);

  /* partículas de luz */
  var N = 140, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 9; pos[i * 3 + 1] = (Math.random() - .5) * 6; pos[i * 3 + 2] = (Math.random() - .5) * 5 - 1; }
  var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var dots = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x5aa9ff, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dots);

  /* ---------- Etiquetas de la vista explotada ---------- */
  var labels = [
    { el: document.getElementById("lb1"), obj: crown, at: new THREE.Vector3(0.95, 0.15, 0) },
    { el: document.getElementById("lb2"), obj: pilar, at: new THREE.Vector3(0.18, 0.05, 0) },
    { el: document.getElementById("lb3"), obj: tornillo, at: new THREE.Vector3(0.24, -0.7, 0) }
  ];

  /* ---------- Estado según el scroll ---------- */
  var prog = 0, suave = 0, mx = 0, my = 0, smx = 0, smy = 0, movil = false, visible = true;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ventana(p, a, b, c, d) { return smooth(a, b, p) * (1 - smooth(c, d, p)); }

  var glow = host.querySelector(".glow"), cue = host.querySelector(".cue");
  var paneles = [].slice.call(host.querySelectorAll(".ch"));
  var rangos = [[-1, -0.5, 0.14, 0.22], [0.24, 0.32, 0.56, 0.63], [0.66, 0.74, 2, 2]];

  function aplicar(p, t) {
    // paneles de texto
    paneles.forEach(function (el, i) {
      var r = rangos[i], o = ventana(p, r[0], r[1], r[2], r[3]);
      el.style.opacity = o;
      el.style.transform = (movil ? "" : "translateY(-50%) ") + "translateY(" + ((1 - o) * (p < r[1] ? 30 : -30)) + "px)";
      el.style.visibility = o < 0.02 ? "hidden" : "visible";
    });

    var rootsOut = smooth(0.24, 0.36, p);           // raíces se disuelven
    var implIn = smooth(0.28, 0.42, p);             // aparece el implante
    var exp = smooth(0.36, 0.46, p) * (1 - smooth(0.58, 0.68, p)); // vista explotada

    raices.visible = rootsOut < 0.999;
    dentina.opacity = 1 - rootsOut;
    raices.position.y = -rootsOut * 0.8;
    raices.scale.setScalar(1 - rootsOut * 0.15);
    implante.visible = implIn > 0.001;
    titanio.opacity = implIn;
    implante.position.y = lerp(-2.6, 0, implIn) - exp * 0.15;
    crown.position.y = exp * 1.05;
    pilar.position.y = -0.38 + exp * 0.42;

    // posición: derecha → derecha → izquierda (en celular, centrado abajo)
    var lado = movil ? 0 : lerp(lerp(1.75, 1.85, smooth(0.2, 0.32, p)), -1.95, smooth(0.6, 0.72, p));
    root.position.x = lado;
    root.position.y = movil ? lerp(-1.15, -1.25, exp) : lerp(0.55, 0.1, exp);
    var esc = movil ? 0.72 : 1;
    root.scale.setScalar(esc * (1 + 0.08 * exp));
    sombra.material.opacity = 1 - exp * 0.6;

    spin.rotation.y = t * 0.18 + p * Math.PI * 2.2 + smx * 0.35;
    spin.rotation.x = 0.32 - 0.18 * exp + smy * 0.15;
    spin.rotation.z = -0.08 + 0.1 * Math.sin(t * 0.6);
    spin.position.y = Math.sin(t * 1.1) * 0.06;

    dots.rotation.y = t * 0.02 + p * 0.6;
    dots.position.y = p * 1.5;

    if (cue) cue.style.opacity = 1 - smooth(0.02, 0.08, p);

    // halo detrás del diente
    if (glow) {
      var c = new THREE.Vector3(0, -0.5, 0); root.localToWorld(c); c.project(camera);
      glow.style.transform = "translate(" + ((c.x + 1) / 2 * canvas.clientWidth) + "px," + ((1 - c.y) / 2 * canvas.clientHeight) + "px) scale(" + (1 + 0.1 * exp) + ")";
    }

    // etiquetas
    labels.forEach(function (l, i) {
      if (!l.el) return;
      var o = smooth(0.42 + i * 0.015, 0.47 + i * 0.015, p) * (1 - smooth(0.56, 0.6, p));
      l.el.style.opacity = o;
      l.el.style.visibility = o < 0.02 ? "hidden" : "visible";
      if (o < 0.02) return;
      var v = l.at.clone(); l.obj.localToWorld(v); v.project(camera);
      var w = canvas.clientWidth, h = canvas.clientHeight;
      l.el.style.transform = "translate(" + ((v.x + 1) / 2 * w) + "px," + ((1 - v.y) / 2 * h) + "px)";
    });
  }

  function medir() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    movil = w < 760;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = movil ? 38 : 30;
    camera.updateProjectionMatrix();
    host.classList.toggle("is-m", movil);
  }
  addEventListener("resize", medir); medir();

  addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  if (window.ScrollTrigger && !reduced) {
    ScrollTrigger.create({ trigger: host, start: "top top", end: "bottom bottom", onUpdate: function (s) { prog = s.progress; } });
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: "100px" }).observe(host);
  }

  var t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    var t = reduced ? 0 : (now - t0) / 1000;
    suave += (prog - suave) * 0.09;
    smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    aplicar(suave, t);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  host.classList.add("ready");
})();

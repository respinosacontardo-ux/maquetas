/* Trópico · fondo galáctico 3D (Three.js r128).
   Una galaxia espiral y un campo de estrellas detrás de toda la página.
   Al bajar, la cámara gira alrededor de la galaxia y se acerca: el fondo se mueve en 3D con el scroll.
   Respeta "reducir movimiento" y en el celular usa menos partículas. */
(function () {
  var cv = document.getElementById("space");
  if (!cv || !window.THREE) return;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mob = Math.min(innerWidth, innerHeight) < 700;
  var r;
  try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, powerPreference: "low-power" }); }
  catch (e) { return; }
  r.setPixelRatio(Math.min(devicePixelRatio || 1, mob ? 1.5 : 1.75));
  r.setClearColor(0x000000, 0);
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(58, 1, 0.1, 600);

  // Punto redondo y suave para cada estrella
  function punto() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.22, "rgba(255,255,255,.85)"); gr.addColorStop(0.5, "rgba(255,255,255,.18)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var TEX = punto();
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Galaxia espiral */
  var G = mob ? 13000 : 16000, BR = 4, RAD = 30, SPIN = 0.9, JIT = mob ? 1.45 : 2.2;
  var gp = new Float32Array(G * 3), gc = new Float32Array(G * 3);
  var cIn = new THREE.Color("#ffe2c4"), cMid = new THREE.Color("#b9a8ff"), cOut = new THREE.Color("#4f7dff");
  for (var i = 0; i < G; i++) {
    var rad = Math.pow(Math.random(), 1.6) * RAD, br = (i % BR) / BR * Math.PI * 2, sp = rad * SPIN;
    var j = function () { return Math.pow(Math.random(), 3) * (Math.random() < .5 ? 1 : -1) * (0.25 + rad * 0.09) * JIT; };
    gp[i * 3] = Math.cos(br + sp) * rad + j();
    gp[i * 3 + 1] = j() * 0.35;
    gp[i * 3 + 2] = Math.sin(br + sp) * rad + j();
    var t = rad / RAD, c = t < .35 ? cIn.clone().lerp(cMid, t / .35) : cMid.clone().lerp(cOut, (t - .35) / .65);
    gc[i * 3] = c.r; gc[i * 3 + 1] = c.g; gc[i * 3 + 2] = c.b;
  }
  var gg = new THREE.BufferGeometry();
  gg.setAttribute("position", new THREE.BufferAttribute(gp, 3));
  gg.setAttribute("color", new THREE.BufferAttribute(gc, 3));
  var gm = new THREE.PointsMaterial({ size: mob ? 0.2 : 0.26, map: TEX, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95 });
  var galaxy = new THREE.Points(gg, gm);
  var gal = new THREE.Group(); gal.add(galaxy); gal.rotation.x = 0.32; gal.rotation.z = -0.18;
  scene.add(gal);

  /* Nebulosa: manchas de luz suaves sobre los brazos, para que se lea la espiral y no parezca ruido */
  var N = mob ? 260 : 340, np = new Float32Array(N * 3), nc = new Float32Array(N * 3);
  var nCol = [new THREE.Color("#7b6cff"), new THREE.Color("#4f7dff"), new THREE.Color("#c48bff"), new THREE.Color("#ffb6a3")];
  for (i = 0; i < N; i++) {
    var nr = 3 + Math.pow(Math.random(), 1.1) * (RAD - 4), nb = (i % BR) / BR * Math.PI * 2 + nr * SPIN + rnd(-0.18, 0.18);
    np[i * 3] = Math.cos(nb) * nr + rnd(-1.2, 1.2); np[i * 3 + 1] = rnd(-0.3, 0.3); np[i * 3 + 2] = Math.sin(nb) * nr + rnd(-1.2, 1.2);
    var cc = nCol[nr < 9 ? 3 * (Math.random() < .5) : (Math.random() * 3) | 0], kk = rnd(0.5, 1) * (1 - nr / RAD * 0.5);
    nc[i * 3] = cc.r * kk; nc[i * 3 + 1] = cc.g * kk; nc[i * 3 + 2] = cc.b * kk;
  }
  var ng = new THREE.BufferGeometry();
  ng.setAttribute("position", new THREE.BufferAttribute(np, 3));
  ng.setAttribute("color", new THREE.BufferAttribute(nc, 3));
  var nm = new THREE.PointsMaterial({ size: mob ? 7 : 6, map: TEX, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.16 });
  gal.add(new THREE.Points(ng, nm));

  // Núcleo brillante
  var core = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX, color: 0xffe6cf, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
  core.scale.set(mob ? 12 : 16, mob ? 12 : 16, 1); gal.add(core);

  /* Campo de estrellas lejanas */
  var S = mob ? 1500 : 3200, sp2 = new Float32Array(S * 3), sc = new Float32Array(S * 3);
  var pal = [[1, 1, 1], [0.8, 0.85, 1], [0.78, 0.72, 1], [1, 0.93, 0.85]];
  for (i = 0; i < S; i++) {
    var u = Math.random() * Math.PI * 2, v = Math.acos(rnd(-1, 1)), d = rnd(70, 220);
    sp2[i * 3] = d * Math.sin(v) * Math.cos(u); sp2[i * 3 + 1] = d * Math.cos(v); sp2[i * 3 + 2] = d * Math.sin(v) * Math.sin(u);
    var p = pal[(Math.random() * pal.length) | 0], k = rnd(0.45, 1);
    sc[i * 3] = p[0] * k; sc[i * 3 + 1] = p[1] * k; sc[i * 3 + 2] = p[2] * k;
  }
  var sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(sp2, 3));
  sg.setAttribute("color", new THREE.BufferAttribute(sc, 3));
  var stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: mob ? 1.5 : 1.25, map: TEX, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(stars);

  /* Tamaño */
  var W = 0, H = 0;
  function medir() {
    var w = innerWidth, h = Math.max(innerHeight, document.documentElement.clientHeight);
    if (w === W && Math.abs(h - H) < 120) return;
    W = w; H = h; r.setSize(w, h, false); cam.aspect = w / h;
    cam.fov = w < h ? 72 : 58; cam.updateProjectionMatrix();
  }
  medir(); addEventListener("resize", medir);

  /* Scroll: la cámara gira alrededor de la galaxia, sube y se acerca */
  var meta = 0, prog = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  function leer() {
    var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    meta = Math.min(1, Math.max(0, scrollY / max));
  }
  leer(); addEventListener("scroll", leer, { passive: true });
  if (matchMedia("(hover: hover)").matches) addEventListener("pointermove", function (e) { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  var heroH = function () { var h = document.getElementById("hero"); return h ? h.offsetHeight : innerHeight; };
  var t0 = performance.now(), visible = true;
  document.addEventListener("visibilitychange", function () { visible = !document.hidden; if (visible) loop(); });

  function pintar(t) {
    prog += (meta - prog) * 0.06;
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    var a = -0.35 + prog * Math.PI * 1.6;               // giro alrededor
    var rr = (mob ? 34 : 40) - Math.sin(prog * Math.PI) * (mob ? 12 : 16);          // se acerca en el medio de la página
    var hh = (mob ? 30 : 15) - prog * (mob ? 40 : 26);                              // baja hasta quedar casi de canto
    cam.position.set(Math.sin(a) * rr + mx * 4, hh - my * 3, Math.cos(a) * rr);
    cam.lookAt(0, mob ? -4 : -7, 0);
    gal.rotation.y = t * 0.000035;
    stars.rotation.y = t * 0.000008 + prog * 0.6;
    stars.rotation.x = prog * 0.25;
    // En el inicio la galaxia brilla; más abajo queda de fondo para que se lea el contenido
    var enHero = Math.min(1, scrollY / (heroH() * 0.9));
    gm.opacity = 0.95 - enHero * 0.62;
    nm.opacity = (mob ? 0.2 : 0.16) - enHero * 0.1;
    core.material.opacity = 0.55 - enHero * 0.47;
    r.render(scene, cam);
  }
  function loop() {
    if (!visible) return;
    pintar(performance.now() - t0);
    if (!reduced) requestAnimationFrame(loop);
  }
  loop();
  if (reduced) addEventListener("scroll", function () { prog = meta; pintar(0); }, { passive: true });
})();

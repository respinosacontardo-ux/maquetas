/*
  Portada 3D de Filo: una navaja de barbero modelada en código (Three.js r128).
  Al bajar, la navaja gira, se abre con la hoja de acero a la vista (con etiquetas)
  y una luz roja recorre el filo.
*/
(function () {
  var host = document.getElementById("h3d");
  var canvas = document.getElementById("razorCanvas");
  if (!host || !canvas || !window.THREE) return;
  var reduced = document.body.classList.contains("reduced");

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { host.classList.add("no3d"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  /* ---------- Estudio oscuro con tiras de luz (reflejos del acero) ---------- */
  (function () {
    var env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(24, 16, 24), new THREE.MeshBasicMaterial({ color: 0x161616, side: THREE.BackSide })));
    function tira(w, h, x, y, z, ry, rx, c, k) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.y = ry || 0; m.rotation.x = rx || 0; env.add(m);
    }
    tira(16, 3, 0, 7.5, 0, 0, Math.PI / 2, 0xffffff, 4);       // tira cenital
    tira(1.4, 10, -11, 0, 3, Math.PI / 2, 0, 0xffffff, 3);         // tira izquierda
    tira(1.0, 10, 11, 1, 1, -Math.PI / 2, 0, 0xffffff, 2.2);       // tira derecha
    tira(14, 2.2, 0, -1, 11.5, Math.PI, 0, 0xffffff, 2.2);           // frente bajo
    tira(2.5, 8, 6, 0, -11, 0, 0, 0xff2936, 2.4);                  // acento rojo
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.02).texture;
    pm.dispose();
  })();

  scene.add(new THREE.AmbientLight(0xffffff, 0.08));
  var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-3, 5, 6); scene.add(key);
  var rojo = new THREE.PointLight(0xff2936, 0, 7, 1.6); scene.add(rojo);

  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- Hoja: perfil 2D extruido, afilado en cuña hacia el filo ---------- */
  function hojaGeo() {
    var s = new THREE.Shape();
    s.moveTo(-0.75, 0.05);                       // cola (tang)
    s.quadraticCurveTo(-0.85, 0.0, -0.75, -0.06);
    s.lineTo(-0.1, -0.1);
    s.quadraticCurveTo(0.2, -0.12, 0.42, -0.36);   // talón
    s.quadraticCurveTo(1.8, -0.43, 3.15, -0.4);    // filo levemente curvo
    s.quadraticCurveTo(3.32, -0.38, 3.32, -0.12);  // punta redondeada
    s.lineTo(3.3, 0.24);
    s.quadraticCurveTo(3.28, 0.32, 3.15, 0.32);
    s.lineTo(0.5, 0.26);                           // lomo
    s.quadraticCurveTo(0.25, 0.25, 0.1, 0.13);
    s.lineTo(-0.75, 0.05);
    var g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 24 });
    g.translate(0, 0, -0.035);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (x > 0.35) { var t = (y + 0.43) / 0.75; p.setZ(i, z * (0.08 + 0.92 * Math.min(1, Math.max(0, t)))); } // cuña: fina en el filo
    }
    g.computeVertexNormals();
    return g;
  }

  /* ---------- Cacha del mango: perfil alargado y redondeado ---------- */
  function cachaGeo() {
    var s = new THREE.Shape();
    s.moveTo(-0.38, 0);
    s.quadraticCurveTo(-0.38, 0.42, 0.05, 0.44);
    s.bezierCurveTo(1.5, 0.48, 3.0, 0.4, 3.9, 0.36);
    s.quadraticCurveTo(4.3, 0.34, 4.3, 0);
    s.quadraticCurveTo(4.3, -0.34, 3.9, -0.36);
    s.bezierCurveTo(3.0, -0.4, 1.5, -0.48, 0.05, -0.44);
    s.quadraticCurveTo(-0.38, -0.42, -0.38, 0);
    var g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 6, curveSegments: 40 });
    g.computeVertexNormals();
    return g;
  }

  var acero = new THREE.MeshPhysicalMaterial({ color: 0xe9ecf0, metalness: 1, roughness: 0.17, clearcoat: 0.6, clearcoatRoughness: 0.05, envMapIntensity: 2.3 });
  var asta = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0d, metalness: 0, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 });
  var bronce = new THREE.MeshPhysicalMaterial({ color: 0xd9a35a, metalness: 1, roughness: 0.25, envMapIntensity: 1.3 });

  /* ---------- Armado ---------- */
  var root = new THREE.Group();     // posición en pantalla
  var spin = new THREE.Group();     // giro general
  var razor = new THREE.Group();    // navaja, con el perno en el origen
  root.add(spin); spin.add(razor); scene.add(root);

  var mango = new THREE.Group();
  var c1 = new THREE.Mesh(cachaGeo(), asta); c1.position.z = 0.075;
  var c2 = new THREE.Mesh(cachaGeo(), asta); c2.position.z = -0.125;
  mango.add(c1, c2);
  function perno(x) {
    var g = new THREE.Group();
    var eje = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 20), bronce); eje.rotation.x = Math.PI / 2;
    var a = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 28), bronce); a.rotation.x = Math.PI / 2; a.position.z = 0.205;
    var b = a.clone(); b.position.z = -0.205;
    g.add(eje, a, b); g.position.x = x; return g;
  }
  var pernoA = perno(0), pernoB = perno(3.95);
  var cuña = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.06), asta); cuña.position.x = 4.0;
  mango.add(pernoA, pernoB, cuña);
  razor.add(mango);

  var hojaPivot = new THREE.Group();  // gira sobre el perno
  var hoja = new THREE.Mesh(hojaGeo(), acero);
  hoja.position.y = 0.05;
  hojaPivot.add(hoja);
  razor.add(hojaPivot);

  /* reflejo/sombra suave debajo */
  var cv = document.createElement("canvas"); cv.width = cv.height = 128;
  var cx = cv.getContext("2d"), gr = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,.07)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
  var piso = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  piso.rotation.x = -Math.PI / 2; piso.position.y = -1.9;
  root.add(piso);

  /* polvo en suspensión */
  var N = 160, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 12; pos[i * 3 + 1] = (Math.random() - .5) * 7; pos[i * 3 + 2] = (Math.random() - .5) * 6 - 1; }
  var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var polvo = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0.35, depthWrite: false }));
  scene.add(polvo);

  /* ---------- Etiquetas ---------- */
  var labels = [
    { el: document.getElementById("lb1"), obj: hoja, at: new THREE.Vector3(2.2, 0.0, 0.04) },
    { el: document.getElementById("lb2"), obj: razor, at: new THREE.Vector3(0, 0, 0.22), dy: -54 },
    { el: document.getElementById("lb3"), obj: mango, at: new THREE.Vector3(1.5, -0.25, 0.14), dy: 54 }
  ];

  var prog = 0, suave = 0, mx = 0, my = 0, smx = 0, smy = 0, movil = false, visible = true;
  function ventana(p, a, b, c, d) { return (a < 0 ? 1 : smooth(a, b, p)) * (1 - smooth(c, d, p)); }
  var paneles = [].slice.call(host.querySelectorAll(".ch"));
  var rangos = [[-1, -1, 0.13, 0.21], [0.25, 0.33, 0.55, 0.62], [0.66, 0.74, 2, 2]];
  var spot = host.querySelector(".spot"), cue = host.querySelector(".cue"), num = document.getElementById("chapNum");
  var tmp = new THREE.Vector3();

  function aplicar(p, t) {
    paneles.forEach(function (el, i) {
      var r = rangos[i], o = ventana(p, r[0], r[1], r[2], r[3]);
      el.style.opacity = o;
      el.style.transform = (movil ? "" : "translateY(-50%) ") + "translateY(" + ((1 - o) * (p < r[1] ? 34 : -34)) + "px)";
      el.style.visibility = o < 0.02 ? "hidden" : "visible";
    });
    if (cue) cue.style.opacity = 1 - smooth(0.02, 0.08, p);
    if (num) num.textContent = p < 0.24 ? "00" : p < 0.64 ? "01" : "02";

    var abre = smooth(0.2, 0.42, p);                    // la hoja se abre
    var ang = -(0.22 + abre * (Math.PI * 0.94 - 0.22));   // en reposo asoma la hoja
    hojaPivot.rotation.z = ang;
    // cerrada: hoja metida entre las cachas (a lo largo del mango); abierta: hacia el otro lado
    razor.position.x = lerp(-1.95, -0.5, abre);   // mantiene la navaja centrada mientras se abre

    // posición en pantalla
    var lado = movil ? 0 : lerp(lerp(2.25, 2.2, smooth(0.2, 0.34, p)), -2.15, smooth(0.6, 0.73, p));
    root.position.x = lado;
    root.position.y = movil ? lerp(-1.75, -1.55, abre) : lerp(-0.1, 0.1, abre);
    var esc = (movil ? 0.52 : 0.92) * lerp(1, movil ? 0.78 : 0.5, abre) * (1 - 0.12 * smooth(0.6, 0.75, p));
    root.scale.setScalar(esc);

    // giro: en reposo, diagonal; al abrir, se pone de frente; al final gira para que la luz recorra el filo
    var giroFinal = smooth(0.62, 0.95, p);
    spin.rotation.z = lerp(0.42, 0.12, abre) + Math.sin(t * 0.5) * 0.03;
    spin.rotation.y = (1 - abre) * (Math.sin(t * 0.35) * 0.5 + p * 9) + smx * 0.35 + giroFinal * 0.3 * Math.sin(t * 0.6 + 1);
    spin.rotation.x = lerp(-0.35, -0.1, abre) + smy * 0.2 + giroFinal * 0.12;
    spin.position.y = Math.sin(t * 0.9) * 0.06;

    // luz roja que recorre el filo
    var barrido = smooth(0.4, 0.9, p);
    rojo.intensity = barrido * 3.2 * (1 - smooth(0.96, 1, p) * 0.5);
    tmp.set(lerp(3.2, -0.2, (Math.sin(t * 0.8) + 1) / 2), -0.6, 0.8); hoja.localToWorld(tmp); rojo.position.copy(tmp);

    polvo.rotation.y = t * 0.015 + p * 0.5;
    polvo.position.y = p * 1.4;

    if (spot) {
      tmp.set(0, 0, 0); root.localToWorld(tmp); tmp.project(camera);
      spot.style.transform = "translate(" + ((tmp.x + 1) / 2 * canvas.clientWidth) + "px," + ((1 - tmp.y) / 2 * canvas.clientHeight) + "px)";
    }

    labels.forEach(function (l, i) {
      if (!l.el) return;
      var o = smooth(0.4 + i * 0.015, 0.45 + i * 0.015, p) * (1 - smooth(0.55, 0.6, p));
      l.el.style.opacity = o;
      l.el.style.visibility = o < 0.02 ? "hidden" : "visible";
      if (o < 0.02) return;
      tmp.copy(l.at); l.obj.localToWorld(tmp); tmp.project(camera);
      l.el.style.transform = "translate(" + ((tmp.x + 1) / 2 * canvas.clientWidth) + "px," + ((1 - tmp.y) / 2 * canvas.clientHeight + (l.dy || 0)) + "px)";
    });
  }

  function medir() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    movil = w < 760;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = movil ? 36 : 30;
    camera.updateProjectionMatrix();
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

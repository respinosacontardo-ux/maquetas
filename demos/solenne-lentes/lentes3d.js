/*
  Solenne · lentes en 3D modelados en código (Three.js r128).
  - build(spec): arma un par de lentes (armazón, cristales, puente, bisagras y patillas que se pliegan).
  - Portada: los lentes flotan, siguen el mouse y al bajar giran, pliegan las patillas y se alejan.
  - Miniaturas: renderiza cada modelo del catálogo a imagen (una sola vez) para las tarjetas y el probador.
  - Visor: al tocar un modelo se abre en grande; se gira arrastrando, se acerca con la rueda o pellizcando,
    cambia de color en vivo y tiene vistas de detalle (bisagra, cristal, perfil).
  Si no hay WebGL, la página sigue funcionando con las tarjetas sin 3D.
*/
(function () {
  if (!window.THREE) return;
  var T = THREE;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = matchMedia("(max-width: 760px)").matches;

  /* ---------------- Materiales ---------------- */
  var tortoiseTex = null;
  function carey() {
    if (tortoiseTex) return tortoiseTex;
    var c = document.createElement("canvas"); c.width = c.height = 512;
    var x = c.getContext("2d");
    x.fillStyle = "#4a2209"; x.fillRect(0, 0, 512, 512);
    var cols = ["#2a1104", "#7a3f12", "#a5611f", "#c98a3a", "#1a0a02", "#5e2c0b"];
    for (var i = 0; i < 420; i++) {
      var r = 6 + Math.random() * 34;
      var g = x.createRadialGradient(0, 0, 0, 0, 0, r);
      var col = cols[i % cols.length];
      g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
      x.save(); x.translate(Math.random() * 512, Math.random() * 512); x.scale(1, .55 + Math.random() * .6); x.rotate(Math.random() * 3);
      x.globalAlpha = .55 + Math.random() * .4; x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill(); x.restore();
    }
    tortoiseTex = new T.CanvasTexture(c);
    tortoiseTex.wrapS = tortoiseTex.wrapT = T.RepeatWrapping;
    tortoiseTex.repeat.set(1.4, 1.4);
    tortoiseTex.encoding = T.sRGBEncoding;
    return tortoiseTex;
  }
  var gradTex = {};
  function degradeTex(top, bottom) {
    var k = top + bottom;
    if (gradTex[k]) return gradTex[k];
    var c = document.createElement("canvas"); c.width = 4; c.height = 256;
    var x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, bottom); g.addColorStop(.85, top); g.addColorStop(1, top);
    x.fillStyle = g; x.fillRect(0, 0, 4, 256);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
    return (gradTex[k] = t);
  }

  var ARMAZON = {
    negro:   { color: 0x0d0d0e, metal: false },
    carey:   { color: 0xffffff, metal: false, carey: true },
    cristal: { color: 0xe9e2d6, metal: false, transparente: true },
    hueso:   { color: 0xeee6d6, metal: false },
    bordo:   { color: 0x4a0d12, metal: false },
    oro:     { color: 0xd8b26a, metal: true },
    plata:   { color: 0xc9ccd1, metal: true }
  };
  var CRISTAL = {
    humo:     { color: 0x15181a, opacity: .9 },
    marron:   { color: 0x3b2410, opacity: .88 },
    degrade:  { grad: ["#2b1a0c", "#c7a888"], opacity: .9 },
    verde:    { color: 0x1f2e1c, opacity: .9 },
    espejado: { color: 0x2f62d9, opacity: .95, espejo: true },
    rosa:     { color: 0xb46a72, opacity: .7 }
  };
  // Para mostrar el color en los botones (CSS)
  window.SOLENNE_COLORES = {
    armazon: { negro: ["Negro", "#111"], carey: ["Carey", "linear-gradient(135deg,#2a1104,#a5611f 45%,#4a2209)"], cristal: ["Cristal", "linear-gradient(135deg,#f4efe6,#d7cdbd)"], hueso: ["Hueso", "#eee6d6"], bordo: ["Bordó", "#4a0d12"], oro: ["Dorado", "linear-gradient(135deg,#f3dca4,#b98f45)"], plata: ["Plateado", "linear-gradient(135deg,#f1f2f4,#9da2aa)"] },
    cristal: { humo: ["Humo", "#15181a"], marron: ["Marrón", "#3b2410"], degrade: ["Degradé", "linear-gradient(#2b1a0c,#c7a888)"], verde: ["Verde G15", "#1f2e1c"], espejado: ["Espejado azul", "linear-gradient(135deg,#9cc0ff,#2f62d9)"], rosa: ["Rosa", "#b46a72"] }
  };

  function matArmazon(k) {
    var a = ARMAZON[k] || ARMAZON.negro;
    if (a.metal) return new T.MeshStandardMaterial({ color: a.color, metalness: 1, roughness: .22, envMapIntensity: 1.3 });
    var m = new T.MeshPhysicalMaterial({ color: a.color, roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: k === "negro" || k === "bordo" ? .55 : .9 });
    if (a.carey) m.map = carey();
    if (a.transparente) { m.transparent = true; m.opacity = .5; m.roughness = .05; m.depthWrite = false; }
    return m;
  }
  function matCristal(k) {
    var c = CRISTAL[k] || CRISTAL.humo;
    var m = new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: c.opacity, roughness: .03, metalness: c.espejo ? .85 : .05, clearcoat: 1, clearcoatRoughness: .02, reflectivity: .6, envMapIntensity: c.espejo ? 2 : .7, side: T.DoubleSide, depthWrite: false });
    if (c.grad) m.map = degradeTex(c.grad[0], c.grad[1]); else m.color.setHex(c.color);
    return m;
  }

  /* ---------------- Formas de los cristales ---------------- */
  function se(c, n) { return Math.sign(c) * Math.pow(Math.abs(c), 2 / n); }
  function lensPts(forma) {
    var P = [], N = 96, i, t, c, s, x, y;
    if (forma === "hexagonal") {
      var R = .52, V = [];
      for (i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2; V.push([R * Math.cos(a) * 1.08, R * Math.sin(a) * .92]); }
      for (i = 0; i < 6; i++) for (var j = 0; j < 16; j++) {
        var A = V[i], B = V[(i + 1) % 6], u = j / 16;
        P.push(new T.Vector2(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u));
      }
      return P;
    }
    for (i = 0; i < N; i++) {
      t = i / N * Math.PI * 2; c = Math.cos(t); s = Math.sin(t);
      if (forma === "redondo") { x = .47 * c; y = .45 * s; }
      else if (forma === "cuadrado") { x = .62 * se(c, 4.2); y = .5 * se(s, 4.2); if (y < 0) y *= 1 - .12 * Math.max(0, -x / .62); }
      else if (forma === "rectangular") { x = .6 * se(c, 6); y = .27 * se(s, 6); }
      else if (forma === "aviador") {
        x = .58 * c;
        y = s > 0 ? .3 * Math.pow(s, .55) : -.58 * Math.pow(-s, .85) * (1 - .18 * c);
        if (s > 0) y += .04 * c;
      } else { // cateye
        x = .58 * se(c, 2.6); y = .36 * se(s, 2.6);
        var u = Math.max(0, x / .58);
        if (y > 0) y += .34 * Math.pow(u, 3) * (y / .36) + .1 * Math.pow(u, 4) - .07 * Math.max(0, -x / .58) * (y / .36);
        if (y < 0) y *= 1 - .3 * u;
        x += .07 * Math.pow(u, 5) * Math.max(0, y / .36);
      }
      P.push(new T.Vector2(x, y));
    }
    return P;
  }
  function offset(pts, d) {
    var n = pts.length;
    return pts.map(function (p, i) {
      var a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      var tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1;
      return new T.Vector2(p.x + ty / l * d, p.y - tx / l * d); // normal hacia afuera (sentido antihorario)
    });
  }
  function bbox(pts) {
    var b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
    pts.forEach(function (p) { b.x0 = Math.min(b.x0, p.x); b.x1 = Math.max(b.x1, p.x); b.y0 = Math.min(b.y0, p.y); b.y1 = Math.max(b.y1, p.y); });
    return b;
  }

  /* ---------------- Armado de un par ---------------- */
  function build(spec) {
    var metal = ARMAZON[spec.armazon] && ARMAZON[spec.armazon].metal;
    var rim = metal ? .045 : (spec.forma === "rectangular" ? .07 : .085);
    var depth = metal ? .04 : .085;
    var pts = lensPts(spec.forma), out = offset(pts, rim), bb = bbox(out);
    var gap = spec.forma === "redondo" ? .26 : (metal ? .22 : .17);
    var cx = -bb.x0 + gap / 2; // centro de cada cristal (el borde interior queda a gap/2 del centro)

    var fm = matArmazon(spec.armazon), lm = matCristal(spec.cristal);
    var root = new T.Group(), front = new T.Group(); root.add(front);

    // Aro (armazón con agujero) y cristal, para los dos lados
    var shape = new T.Shape(out); shape.holes.push(new T.Path(pts.slice().reverse()));
    var rimGeo = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: metal ? .012 : .02, bevelSize: metal ? .01 : .018, bevelSegments: 4, curveSegments: 8 });
    rimGeo.translate(0, 0, -depth / 2);
    var lensGeo = new T.ShapeGeometry(new T.Shape(pts), 1);
    var lb = bbox(pts), uv = lensGeo.attributes.uv, pos = lensGeo.attributes.position;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - lb.x0) / (lb.x1 - lb.x0), (pos.getY(i) - lb.y0) / (lb.y1 - lb.y0));
    // leve curvatura del cristal (base 6), para que refleje como uno real
    for (i = 0; i < pos.count; i++) pos.setZ(i, -.06 * (Math.pow(pos.getX(i), 2) + Math.pow(pos.getY(i), 2)));
    lensGeo.computeVertexNormals();

    var lenses = [], hinges = [];
    [-1, 1].forEach(function (side) {
      var g = new T.Group(); g.position.x = side * cx; g.scale.x = side; // el izquierdo es espejo del derecho
      var r = new T.Mesh(rimGeo, fm); g.add(r);
      var l = new T.Mesh(lensGeo, lm); l.position.z = .005; l.renderOrder = 2; g.add(l); lenses.push(l);
      front.add(g);
      // punto de bisagra: borde exterior, a la altura del tercio superior
      var hy = bb.y1 * .45;
      var hx = side * (cx + bb.x1 - rim * .3);
      hinges.push(new T.Vector3(hx, hy, -depth / 2));
    });
    // Rimless arriba para metal: barra superior fina
    // Puente
    var inner = cx + bb.x0 + rim * .4, by = metal ? bb.y1 * .55 : bb.y1 * .42;
    var bc = new T.QuadraticBezierCurve3(new T.Vector3(-inner, by, 0), new T.Vector3(0, by + (metal ? .06 : .1), .03), new T.Vector3(inner, by, 0));
    front.add(new T.Mesh(new T.TubeGeometry(bc, 24, metal ? .022 : .05, 12, false), fm));
    if (metal) {
      var bc2 = new T.QuadraticBezierCurve3(new T.Vector3(-inner - .02, bb.y1 * .98, -.005), new T.Vector3(0, bb.y1 * 1.02, 0), new T.Vector3(inner + .02, bb.y1 * .98, -.005));
      if (spec.forma === "aviador") front.add(new T.Mesh(new T.TubeGeometry(bc2, 24, .018, 10, false), fm));
      // plaquetas
      var pm = new T.MeshPhysicalMaterial({ color: 0xf3f1ec, transparent: true, opacity: .6, roughness: .1, clearcoat: 1 });
      [-1, 1].forEach(function (s) {
        var p = new T.Mesh(new T.SphereGeometry(.06, 16, 12), pm); p.scale.set(.5, 1, .35); p.position.set(s * (inner + .06), by - .22, -.08); front.add(p);
        var arm = new T.Mesh(new T.CylinderGeometry(.008, .008, .14, 6), fm); arm.position.set(s * (inner + .04), by - .12, -.05); arm.rotation.x = .9; front.add(arm);
      });
    }

    // Patillas (con pivote en la bisagra, se pliegan)
    var temples = [];
    hinges.forEach(function (h, k) {
      var side = k === 0 ? -1 : 1;
      var piv = new T.Group(); piv.position.copy(h); root.add(piv);
      var L = 2.35;
      var curve = new T.CatmullRomCurve3([
        new T.Vector3(0, 0, 0), new T.Vector3(side * .04, 0, -.5), new T.Vector3(side * .07, -.01, -1.4),
        new T.Vector3(side * .06, -.06, -1.95), new T.Vector3(side * .03, -.3, -L)
      ]);
      var tm = new T.Mesh(new T.TubeGeometry(curve, 60, metal ? .022 : .038, 10, false), fm);
      if (!metal) tm.scale.set(1, 1, 1);
      piv.add(tm);
      if (metal) { // punteras de acetato
        var tip = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(curve.getPoints(30).slice(19)), 20, .035, 10, false), matArmazon("negro")); piv.add(tip);
      }
      // bisagra metálica (cilindro de 5 barriles)
      var hm = new T.MeshStandardMaterial({ color: 0xc9ccd1, metalness: 1, roughness: .25 });
      var hg = new T.Mesh(new T.CylinderGeometry(.03, .03, .14, 16), hm); hg.position.set(side * .02, 0, -.06); piv.add(hg);
      // flecha decorativa metálica (detalle de marca) en acetato
      if (!metal) { var pin = new T.Mesh(new T.BoxGeometry(.012, .035, .3), hm); pin.position.set(side * .045, 0, -.32); piv.add(pin); }
      piv.userData.side = side;
      temples.push(piv);
    });

    root.userData = {
      spec: spec, lenses: lenses, temples: temples, frontW: (cx + bb.x1) * 2,
      hinge: hinges[1].clone(),
      fold: function (v) { // 0 abiertas, 1 plegadas
        temples.forEach(function (p, k) {
          var s = p.userData.side;
          p.rotation.y = s * v * Math.PI * .49; // giran hacia adentro, como al cerrar los lentes
          p.position.y = hinges[k].y + (k === 0 ? -.035 : .035) * v;
        });
      },
      setColores: function (armazon, cristal) {
        var nf = matArmazon(armazon), nl = matCristal(cristal);
        root.traverse(function (o) {
          if (!o.isMesh) return;
          if (o.material === fm) o.material = nf;
          else if (o.material === lm) o.material = nl;
        });
        fm.dispose(); lm.dispose(); fm = nf; lm = nl;
        spec.armazon = armazon; spec.cristal = cristal;
      }
    };
    root.userData.fold(0);
    return root;
  }

  /* ---------------- Entorno de estudio (reflejos) ---------------- */
  function entorno(renderer, cielo) {
    var env = new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(30, 20, 30), new T.MeshBasicMaterial({ color: cielo ? 0x1a2a52 : 0x24262b, side: T.BackSide }))); // sala oscura: el cuerpo se ve negro y los brillos los dan los paneles
    function caja(w, h, x, y, z, ry, rx, c) {
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); env.add(m);
    }
    caja(14, 3, 0, 9, 0, 0, Math.PI / 2, 0xffffff);          // softbox cenital
    caja(6, 9, -12, 1, 4, Math.PI / 2, 0, 0xf4f6ff);         // lateral izquierdo
    caja(4, 9, 12, 1, -3, -Math.PI / 2, 0, 0xffffff);        // lateral derecho
    caja(10, 2, 0, 3, -14, 0, 0, cielo ? 0x3c68ff : 0xdfe3ea); // banda de fondo
    caja(30, 8, 0, -9, 0, 0, -Math.PI / 2, 0x2a2c30);         // piso oscuro
    var pm = new T.PMREMGenerator(renderer);
    var tex = pm.fromScene(env, .03).texture; pm.dispose();
    return tex;
  }
  function crearRenderer(canvas, opts) {
    var r = new T.WebGLRenderer(Object.assign({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" }, opts || {}));
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    r.outputEncoding = T.sRGBEncoding;
    r.toneMapping = T.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.physicallyCorrectLights = true;
    return r;
  }
  function luces(scene) {
    scene.add(new T.HemisphereLight(0xffffff, 0x9aa3b5, .6));
    var d = new T.DirectionalLight(0xffffff, 2.4); d.position.set(3, 5, 6); scene.add(d);
    var d2 = new T.DirectionalLight(0xb9c8ff, 1.1); d2.position.set(-5, 1, -3); scene.add(d2);
  }

  var C = window.CONFIG, PROD = (C && C.productos) || [];
  function porId(id) { for (var i = 0; i < PROD.length; i++) if (PROD[i].id === id) return PROD[i]; return PROD[0]; }

  /* ---------------- Miniaturas e imágenes de frente ---------------- */
  var IMG = window.SOLENNE_IMG = {};
  var mini = null; // un solo renderer para todas las miniaturas
  // Recorta el borde transparente, para que en el probador el ancho de la imagen sea el ancho del armazón
  function recortar(src, w, h) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var x = c.getContext("2d"); x.drawImage(src, 0, 0);
    var d = x.getImageData(0, 0, w, h).data, x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) if (d[(yy * w + xx) * 4 + 3] > 8) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    if (x1 <= x0) return src.toDataURL("image/png");
    var o = document.createElement("canvas"); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
    o.getContext("2d").drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o.toDataURL("image/png");
  }
  function renderMini(spec, w, h, vista) {
    if (!mini) {
      var cv = document.createElement("canvas");
      var rr = crearRenderer(cv, { preserveDrawingBuffer: true }); rr.setPixelRatio(1);
      var s0 = new T.Scene(); s0.environment = entorno(rr, false); luces(s0);
      mini = { r: rr, sc: s0, cv: cv };
    }
    var r = mini.r, sc = mini.sc, cv2 = mini.cv;
    r.setSize(w, h, false);
    var cam = new T.PerspectiveCamera(vista === "frente" ? 14 : 24, w / h, .1, 100);
    var g = build(Object.assign({}, spec)); sc.add(g);
    var fw = g.userData.frontW;
    if (vista === "frente") { cam.position.set(0, 0, fw * 4.3); g.rotation.set(0, 0, 0); }
    else { cam.position.set(0, .25, fw * 2.55); g.rotation.set(.18, -.62, 0); g.position.x = .18; g.userData.fold(.0); }
    cam.lookAt(0, vista === "frente" ? 0 : -.08, 0);
    r.render(sc, cam);
    var url = vista === "frente" ? recortar(cv2, w, h) : cv2.toDataURL("image/png");
    sc.remove(g); g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    return url;
  }
  function miniaturas() {
    PROD.forEach(function (p) {
      IMG[p.id] = {};
      p.variantes.forEach(function (v) {
        var spec = { forma: p.forma, armazon: v[0], cristal: v[1] };
        // Una sola pasada por modelo y color, en dos vistas
        IMG[p.id][v[0] + "|" + v[1]] = { tres: null, frente: null, spec: spec };
      });
    });
    // Renderiza de a una para no trabar la página
    var cola = [];
    PROD.forEach(function (p) { p.variantes.forEach(function (v) { cola.push([p, v]); }); });
    function paso() {
      var it = cola.shift();
      if (!it) {
        if (mini) { mini.sc.environment.dispose(); mini.r.dispose(); if (mini.r.forceContextLoss) mini.r.forceContextLoss(); mini = null; }
        document.dispatchEvent(new CustomEvent("solenne:imagenes")); return;
      }
      var k = it[1][0] + "|" + it[1][1], o = IMG[it[0].id][k];
      try {
        o.tres = renderMini(o.spec, 900, 600, "tres");
        o.frente = renderMini(o.spec, 1000, 400, "frente");
      } catch (e) {}
      document.dispatchEvent(new CustomEvent("solenne:imagen", { detail: { id: it[0].id, k: k } }));
      setTimeout(paso, 30);
    }
    paso();
  }

  /* ---------------- Portada ---------------- */
  function portada() {
    var host = document.getElementById("hero3d"), canvas = document.getElementById("heroCanvas");
    if (!host || !canvas) return;
    var r; try { r = crearRenderer(canvas); } catch (e) { host.classList.add("no3d"); return; }
    var sc = new T.Scene(); sc.environment = entorno(r, true); luces(sc);
    var cam = new T.PerspectiveCamera(26, 1, .1, 100);
    var p = porId("monaco");
    var g = build({ forma: p.forma, armazon: p.armazon, cristal: p.cristal });
    var hold = new T.Group(); hold.add(g); sc.add(hold);
    var fw = g.userData.frontW;
    function size() {
      var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
      r.setSize(w, h, false); cam.aspect = w / h;
      var angosto = cam.aspect < 1;
      var fit = fw * (angosto ? 3.7 / cam.aspect : 3.6), ly = angosto ? -fit * .085 : -.55;
      cam.position.set(0, ly, Math.max(fit, 6.4)); cam.lookAt(0, ly, 0); cam.updateProjectionMatrix(); // lentes arriba, texto abajo
    }
    size(); addEventListener("resize", size);
    var mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    if (window.DeviceOrientationEvent && mobile) addEventListener("deviceorientation", function (e) { if (e.gamma != null) { mx = Math.max(-.5, Math.min(.5, e.gamma / 60)); my = Math.max(-.5, Math.min(.5, (e.beta - 45) / 90)); } }, { passive: true });
    var visible = true;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) loop(); }).observe(host);
    var t0 = performance.now(), corriendo = false;
    host.classList.add("ready");
    function loop() {
      if (corriendo) return; corriendo = true;
      requestAnimationFrame(function f(now) {
        if (!visible) { corriendo = false; return; }
        var t = (now - t0) / 1000;
        var hero = host.parentNode, hh = hero.offsetHeight || innerHeight;
        var pr = Math.max(0, Math.min(1, scrollY / (hh * .9)));
        tx += (mx - tx) * .06; ty += (my - ty) * .06;
        var intro = reduced ? 1 : Math.min(1, t / 1.6), e = 1 - Math.pow(1 - intro, 3);
        hold.rotation.y = (1 - e) * -1.4 + tx * .7 + pr * 2.2 + (reduced ? 0 : Math.sin(t * .5) * .08);
        hold.rotation.x = ty * .35 + .06 + pr * .35;
        hold.position.y = (reduced ? 0 : Math.sin(t * .9) * .05) + pr * .6;
        var s = (.75 + .25 * e) * (1 - pr * .35); hold.scale.setScalar(s);
        g.userData.fold(Math.max(0, Math.min(1, (pr - .15) * 1.8)));
        r.render(sc, cam);
        requestAnimationFrame(f);
      });
    }
    loop();
  }

  /* ---------------- Visor 3D del catálogo ---------------- */
  var V = null;
  function visor() {
    var canvas = document.getElementById("vCanvas"); if (!canvas) return null;
    var r; try { r = crearRenderer(canvas); } catch (e) { return null; }
    var sc = new T.Scene(); sc.environment = entorno(r, false); luces(sc);
    var cam = new T.PerspectiveCamera(28, 1, .05, 100);
    var hold = new T.Group(); sc.add(hold);
    var st = { rx: .12, ry: -.6, z: 6, tx: 0, ty: 0, tz: 0, auto: !reduced, fold: 0 };
    var cur = { rx: .12, ry: -.6, z: 6, tx: 0, ty: 0, tz: 0, fold: 0 };
    var g = null, abierto = false, vel = 0, zMin = 2.2, zMax = 8;
    function size() {
      var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
      r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    addEventListener("resize", size);
    // Arrastrar para girar, rueda o pellizco para acercar
    var ptrs = {}, last = null, pinch = 0;
    canvas.addEventListener("pointerdown", function (e) { canvas.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.clientX, e.clientY]; last = [e.clientX, e.clientY]; st.auto = false; vel = 0; document.dispatchEvent(new Event("solenne:manual")); });
    canvas.addEventListener("pointermove", function (e) {
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(ptrs);
      if (ids.length === 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinch) st.z = Math.max(zMin, Math.min(zMax, st.z * pinch / d));
        pinch = d; return;
      }
      var dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
      st.ry += dx * .009; vel = dx * .009;
      st.rx = Math.max(-1.2, Math.min(1.2, st.rx + dy * .007));
    });
    function up(e) { delete ptrs[e.pointerId]; pinch = 0; var ids = Object.keys(ptrs); if (ids.length) last = ptrs[ids[0]]; }
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", function (e) { e.preventDefault(); st.z = Math.max(zMin, Math.min(zMax, st.z * (1 + e.deltaY * .0012))); }, { passive: false });

    function loop() {
      if (!abierto) return;
      if (st.auto) st.ry += .0045; else if (Math.abs(vel) > .0002) { st.ry += vel; vel *= .93; }
      ["rx", "ry", "z", "tx", "ty", "tz", "fold"].forEach(function (k) { cur[k] += (st[k] - cur[k]) * .09; });
      if (g) { hold.rotation.set(cur.rx, cur.ry, 0); g.userData.fold(cur.fold); }
      cam.position.set(cur.tx, cur.ty, cur.tz + cur.z); cam.lookAt(cur.tx, cur.ty, cur.tz);
      r.render(sc, cam);
      requestAnimationFrame(loop);
    }
    var VISTAS = {
      inicio:   { rx: .12, ry: -.6, z: 6, tx: 0, ty: 0 },
      frente:   { rx: 0, ry: 0, z: 5.6, tx: 0, ty: 0 },
      perfil:   { rx: .05, ry: -Math.PI / 2, z: 6.4, tx: 0, ty: 0 },
      bisagra:  { rx: .2, ry: -1.05, z: 1.5, foco: "bisagra" },
      cristal:  { rx: -.05, ry: -.25, z: 1.9, foco: "cristal" },
      arriba:   { rx: 1.05, ry: 0, z: 6.5, tx: 0, ty: 0 }
    };
    return V = {
      abrir: function (spec) {
        if (g) { hold.remove(g); g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
        g = build(Object.assign({}, spec)); hold.add(g);
        var fw = g.userData.frontW, k = Math.max(1, 1.25 / (canvas.clientWidth / Math.max(1, canvas.clientHeight))); // más lejos si la pantalla es angosta
        zMin = fw * .7; zMax = fw * 4.5 * k;
        VISTAS.inicio.z = fw * 3.1 * k; VISTAS.frente.z = fw * 2.9 * k; VISTAS.perfil.z = fw * 2.6 * k; VISTAS.arriba.z = fw * 3 * k;
        Object.assign(st, VISTAS.inicio, { tx: 0, ty: 0, tz: 0, auto: !reduced, fold: 0 });
        Object.assign(cur, VISTAS.inicio, { tx: 0, ty: 0, tz: 0, ry: -2.6, z: fw * 4, fold: .9 });
        abierto = true; requestAnimationFrame(function () { size(); loop(); });
      },
      cerrar: function () { abierto = false; },
      colores: function (a, c) { if (g) g.userData.setColores(a, c); },
      vista: function (k) {
        var v = VISTAS[k]; st.rx = v.rx; st.ry = v.ry; st.z = v.z; st.tx = st.ty = st.tz = 0;
        if (v.foco && g) { // apunta la cámara a la bisagra o al cristal derecho, ya girados
          var p = v.foco === "bisagra" ? g.userData.hinge.clone().add(new T.Vector3(0, 0, -.1)) : new T.Vector3(g.userData.frontW * .27, 0, 0);
          p.applyEuler(new T.Euler(v.rx, v.ry, 0)); st.tx = p.x; st.ty = p.y; st.tz = p.z;
        }
        st.auto = false; vel = 0;
      },
      plegar: function () { st.fold = st.fold > .5 ? 0 : 1; return st.fold > .5; },
      girar: function () { st.auto = !st.auto; return st.auto; },
      zoom: function (f) { st.z = Math.max(zMin, Math.min(zMax, st.z * f)); }
    };
  }

  /* ---------------- Arranque ---------------- */
  var ok = (function () { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); } catch (e) { return false; } })();
  window.SOLENNE_3D = { ok: ok, build: build, visor: function () { return V || visor(); } };
  if (!ok) { document.documentElement.classList.add("no3d"); document.dispatchEvent(new CustomEvent("solenne:imagenes")); return; }
  portada();
  // Las miniaturas se generan apenas la portada arrancó
  setTimeout(miniaturas, 250);
})();

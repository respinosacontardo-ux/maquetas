/*
  Portada 3D de la concesionaria: una camioneta 4x4 doble cabina 0 km modelada en código (sin marca ni logos)
  en un showroom oscuro. Al bajar: gira de 3/4 a perfil con las ruedas en movimiento y etiquetas,
  y después se va a la izquierda de cola mientras el visitante elige el color.
*/
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("h3d");
const canvas = document.getElementById("carCanvas");
const reduced = document.body.classList.contains("reduced");

const COLORES = [
  { n: "Naranja Fuego", c: "#c84a12" },
  { n: "Gris Plomo", c: "#4b4f55" },
  { n: "Negro Profundo", c: "#0d0d0f" },
  { n: "Blanco Glaciar", c: "#e8e7e2" },
  { n: "Azul Petróleo", c: "#153246" },
  { n: "Rojo Malbec", c: "#5e1020" }
];

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) { host.classList.add("no3d"); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.setClearColor(0x100904, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x100904, 11, 22);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
const mira = new THREE.Vector3(0, 0.55, 0);

/* ---------- Showroom: piso con charco de luz cálida y líneas de velocidad ---------- */
function texturaRadial(stops, size = 512) {
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const cx = cv.getContext("2d"), g = cx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  cx.fillStyle = g; cx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const piso = new THREE.Mesh(new THREE.CircleGeometry(9, 96),
  new THREE.MeshBasicMaterial({ map: texturaRadial([[0, "#3a2414"], [0.35, "#22150b"], [0.7, "#140b05"], [1, "#100904"]]), fog: false }));
piso.rotation.x = -Math.PI / 2;
scene.add(piso);

const anillo = new THREE.Mesh(new THREE.RingGeometry(3.15, 3.17, 160),
  new THREE.MeshBasicMaterial({ color: 0xffedd7, transparent: true, opacity: 0.18 }));
anillo.rotation.x = -Math.PI / 2; anillo.position.y = 0.002;
scene.add(anillo);

const raya = new THREE.Group(); scene.add(raya);   // líneas de velocidad (se ven al "andar")
const rayaMat = new THREE.MeshBasicMaterial({ color: 0xffedd7, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const RAYAS = [];
for (let i = 0; i < 26; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 1 + Math.random() * 2.4), rayaMat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((Math.random() - 0.5) * 7, 0.004, (Math.random() - 0.5) * 14);
  m.userData.v = 0.6 + Math.random() * 0.8;
  raya.add(m); RAYAS.push(m);
}

const luzBrasa = new THREE.DirectionalLight(0xff7a2a, 1.4); luzBrasa.position.set(-5, 3, -4); scene.add(luzBrasa);
const luzKey = new THREE.DirectionalLight(0xfff1e0, 0.8); luzKey.position.set(4, 6, 5); scene.add(luzKey);

/* ---------- Camioneta 4x4 doble cabina, modelada en código (sin marca ni logos) ---------- */
const root = new THREE.Group(); scene.add(root);   // posición en pantalla
const giro = new THREE.Group(); root.add(giro);    // giro de la camioneta
const pintura = new THREE.MeshPhysicalMaterial({ color: COLORES[0].c, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05 });
const negro = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, metalness: 0.2, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.3 });
const plastico = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0, roughness: 0.85 });
const grafito = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, metalness: 0.85, roughness: 0.35 });
const aluminio = new THREE.MeshStandardMaterial({ color: 0xb9bcc1, metalness: 1, roughness: 0.3 });
const caucho = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0, roughness: 0.92 });
const vidrio = new THREE.MeshPhysicalMaterial({ color: 0x07090c, metalness: 0.4, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide });
const luzBlanca = new THREE.MeshBasicMaterial({ color: 0xfff6e8 });
const luzAmbar = new THREE.MeshBasicMaterial({ color: 0xffa21f });
const luzRoja = new THREE.MeshBasicMaterial({ color: 0xff1a12 });
let ruedas = [], anclas = null;

function caja(w, h, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); (parent || cam).add(m); return m;
}
// pasa un perfil 2D (x = largo, y = alto) a un sólido con el largo sobre Z y el frente hacia +Z
function extruir(shape, ancho, bisel, mat) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: ancho - 2 * bisel, bevelEnabled: bisel > 0, bevelThickness: bisel, bevelSize: bisel * 0.85, bevelSegments: 5, curveSegments: 28 });
  g.translate(0, 0, -(ancho - 2 * bisel) / 2);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

const cam = new THREE.Group();
const W = 2.0, WR = 0.66, WC = 0.47, EJE = 1.72;

// carrocería: silueta lateral con pasarruedas
const s = new THREE.Shape();
const a = Math.asin((0.6 - WC) / WR);
s.moveTo(-2.7, 0.64);
s.lineTo(-2.73, 1.22);
s.lineTo(-0.62, 1.24);
s.lineTo(-0.56, 1.3);
s.lineTo(-0.49, 1.94);
s.quadraticCurveTo(-0.46, 2.02, -0.3, 2.02);
s.lineTo(0.76, 2.02);
s.quadraticCurveTo(0.9, 2.01, 0.96, 1.94);
s.lineTo(1.52, 1.43);
s.lineTo(2.42, 1.35);
s.quadraticCurveTo(2.76, 1.33, 2.79, 1.1);
s.lineTo(2.81, 0.74);
s.lineTo(2.62, 0.6);
s.lineTo(EJE + WR * Math.cos(a), 0.6);
s.absarc(EJE, WC, WR, a, Math.PI - a, false);
s.lineTo(-EJE + WR * Math.cos(a), 0.6);
s.absarc(-EJE, WC, WR, a, Math.PI - a, false);
s.lineTo(-2.62, 0.6);
s.lineTo(-2.7, 0.64);
cam.add(extruir(s, W, 0.07, pintura));

// ventanillas laterales (sobresalen apenas de los costados)
const sv = new THREE.Shape();
sv.moveTo(-0.41, 1.37); sv.lineTo(-0.38, 1.88); sv.quadraticCurveTo(-0.36, 1.93, -0.28, 1.93);
sv.lineTo(0.74, 1.93); sv.lineTo(1.34, 1.44); sv.lineTo(-0.41, 1.37);
const gv = new THREE.ExtrudeGeometry(sv, { depth: W + 0.012, bevelEnabled: false });
gv.translate(0, 0, -(W + 0.012) / 2); gv.rotateY(-Math.PI / 2);
cam.add(new THREE.Mesh(gv, vidrio));
[-1, 1].forEach((k) => caja(0.012, 0.58, 0.07, negro, k * (W / 2 + 0.008), 1.64, 0.2));   // parante B

// parabrisas y luneta
const pb = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.26, 0.7), vidrio);
pb.rotation.x = Math.atan2(0.72, -0.694); pb.position.set(0, 1.685 + 0.058, 1.24 + 0.052); cam.add(pb);
const lu = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.34, 0.48), vidrio);
lu.rotation.y = Math.PI; lu.rotation.x = -0.1; lu.position.set(0, 1.64, -0.6); cam.add(lu);

// capot con domo, rejillas y barra de luces
caja(0.95, 0.07, 0.75, pintura, 0, 1.43, 1.98);
[-0.32, 0.32].forEach((x) => { for (let i = 0; i < 3; i++) caja(0.16, 0.02, 0.03, plastico, x, 1.47, 1.78 + i * 0.07); });
caja(1.32, 0.07, 0.1, plastico, 0, 2.12, 0.82);
caja(1.24, 0.03, 0.02, luzBlanca, 0, 2.12, 0.875);

// frente: parrilla, faros, luces ámbar, paragolpes y cubrecárter
caja(1.56, 0.44, 0.1, negro, 0, 0.98, 2.86);
for (let i = 0; i < 4; i++) caja(1.46, 0.025, 0.04, grafito, 0, 0.84 + i * 0.09, 2.92);
[-0.14, 0, 0.14].forEach((x) => caja(0.07, 0.025, 0.03, luzAmbar, x, 1.16, 2.93));
[-1, 1].forEach((k) => {
  caja(0.26, 0.09, 0.06, luzBlanca, k * 0.76, 1.12, 2.855);
  caja(0.03, 0.3, 0.06, luzBlanca, k * 0.9, 1.02, 2.845);
  caja(0.12, 0.05, 0.05, luzBlanca, k * 0.62, 0.7, 2.96);
});
caja(2.02, 0.24, 0.26, grafito, 0, 0.68, 2.82);
const cubre = caja(1.15, 0.05, 0.55, aluminio, 0, 0.55, 2.7); cubre.rotation.x = -0.25;
[-0.45, 0.45].forEach((x) => caja(0.06, 0.1, 0.12, luzRoja, x, 0.68, 2.97));      // ganchos de remolque

// cola: ópticas, paragolpes, manija
[-1, 1].forEach((k) => caja(0.1, 0.46, 0.05, luzRoja, k * 0.92, 1.0, -2.81));
caja(2.02, 0.22, 0.24, grafito, 0, 0.68, -2.76);
caja(0.3, 0.05, 0.03, plastico, 0, 1.12, -2.81);

// caja: tapa rígida y barra antivuelco
caja(1.86, 0.03, 2.02, plastico, 0, 1.305, -1.64);
const tubo = (x1, y1, z1, x2, y2, z2) => {
  const p1 = new THREE.Vector3(x1, y1, z1), p2 = new THREE.Vector3(x2, y2, z2), L = p1.distanceTo(p2);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, L, 14), negro);
  m.position.copy(p1).add(p2).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
  cam.add(m);
};
tubo(-0.82, 1.3, -0.84, -0.78, 1.82, -0.84); tubo(0.82, 1.3, -0.84, 0.78, 1.82, -0.84); tubo(-0.78, 1.82, -0.84, 0.78, 1.82, -0.84);
tubo(-0.8, 1.8, -0.84, -0.82, 1.3, -1.38); tubo(0.8, 1.8, -0.84, 0.82, 1.3, -1.38);

// costados: estribos, espejos, manijas, guardabarros ensanchados
[-1, 1].forEach((k) => {
  caja(0.2, 0.06, 2.3, plastico, k * 1.05, 0.62, 0);
  caja(0.1, 0.18, 0.26, negro, k * 1.12, 1.5, 1.08);
  caja(0.12, 0.04, 0.05, negro, k * 1.04, 1.48, 1.12);
  [0.62, -0.12].forEach((z) => caja(0.02, 0.035, 0.16, negro, k * (W / 2 + 0.012), 1.32, z));
  [EJE, -EJE].forEach((z) => {
    const f = new THREE.Mesh(new THREE.TorusGeometry(WR + 0.02, 0.07, 10, 40, Math.PI * 0.86), plastico);
    f.rotation.y = Math.PI / 2; f.rotation.x = 0;
    f.rotation.order = "YXZ";
    f.rotation.z = Math.PI * 0.07;
    f.scale.set(1, 1, 0.55);
    f.position.set(k * (W / 2 + 0.01), WC, z);
    cam.add(f);
  });
});
caja(1.55, 0.24, 4.4, grafito, 0, 0.5, 0);   // chasis

// ruedas todo terreno
function rueda(lado) {
  const g = new THREE.Group(), gira = new THREE.Group(); g.add(gira);
  const perfil = [[0.29, -0.15], [0.4, -0.17], [0.45, -0.155], [0.47, -0.11], [0.47, 0.11], [0.45, 0.155], [0.4, 0.17], [0.29, 0.15]].map(([r, y]) => new THREE.Vector2(r, y));
  const cub = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), caucho); cub.rotation.z = Math.PI / 2; gira.add(cub);
  for (let i = 0; i < 30; i++) {
    const th = (i / 30) * Math.PI * 2, r = 0.475;
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.085), caucho);
    t.position.set(i % 2 ? 0.06 : -0.06, Math.cos(th) * r, Math.sin(th) * r); t.rotation.x = th; gira.add(t);
  }
  const llanta = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 40), grafito); llanta.rotation.z = Math.PI / 2; gira.add(llanta);
  for (let i = 0; i < 6; i++) {
    const th = (i / 6) * Math.PI * 2, rayo = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.07), grafito);
    rayo.position.set(0.14, Math.cos(th) * 0.15, Math.sin(th) * 0.15); rayo.rotation.x = th; gira.add(rayo);
  }
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.016, 8, 48), aluminio); aro.rotation.y = Math.PI / 2; aro.position.x = 0.14; gira.add(aro);
  const tapa = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 20), aluminio); tapa.rotation.z = Math.PI / 2; tapa.position.x = 0.15; gira.add(tapa);
  if (lado < 0) g.rotation.y = Math.PI;
  ruedas.push(gira);
  return g;
}
[[1, EJE], [-1, EJE], [1, -EJE], [-1, -EJE]].forEach(([k, z]) => { const r = rueda(k); r.position.set(k * 0.9, WC, z); cam.add(r); });

// sombra de contacto
(function () {
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 256;
  const cx = cv.getContext("2d"), g = cx.createRadialGradient(64, 128, 10, 64, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,.85)"); g.addColorStop(0.55, "rgba(0,0,0,.5)"); g.addColorStop(1, "rgba(0,0,0,0)");
  cx.fillStyle = g; cx.fillRect(0, 0, 128, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.006; cam.add(m);
})();

const ESC = 0.74;
cam.scale.setScalar(ESC);
cam.rotation.y = Math.PI;          // el frente mira hacia -Z, como espera la coreografía del scroll
giro.add(cam);
anclas = {
  motor: new THREE.Vector3(0, 1.46 * ESC, -2.0 * ESC),
  rueda: new THREE.Vector3(-1.05 * ESC, 0.47 * ESC, -EJE * ESC),
  cabina: new THREE.Vector3(-0.8 * ESC, 1.82 * ESC, 0.84 * ESC)
};
requestAnimationFrame(() => host.classList.add("ready"));

/* ---------- Colores (capítulo 2) ---------- */
const swBox = document.getElementById("swatches"), swName = document.getElementById("swName");
const colorObj = new THREE.Color(COLORES[0].c), colorMeta = new THREE.Color(COLORES[0].c);
if (swBox) {
  swBox.innerHTML = COLORES.map((k, i) => `<button type="button" class="sw${i ? "" : " on"}" aria-label="${k.n}" title="${k.n}"><i style="background:${k.c}"></i></button>`).join("");
  swName.textContent = COLORES[0].n;
  [...swBox.children].forEach((b, i) => b.addEventListener("click", () => {
    [...swBox.children].forEach((x) => x.classList.toggle("on", x === b));
    colorMeta.set(COLORES[i].c); swName.textContent = COLORES[i].n;
  }));
}

/* ---------- Estado según el scroll ---------- */
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const paneles = [...host.querySelectorAll(".ch")];
const rangos = [[-1, -1, 0.13, 0.21], [0.25, 0.33, 0.56, 0.63], [0.67, 0.75, 2, 2]];
const labels = [
  { el: document.getElementById("lb1"), k: "motor", w: [0.36, 0.41], dy: 0 },
  { el: document.getElementById("lb2"), k: "rueda", w: [0.38, 0.43], dy: 64 },
  { el: document.getElementById("lb3"), k: "cabina", w: [0.40, 0.45], dy: -72 }
];
const cue = host.querySelector(".cue"), num = document.getElementById("chapNum");
let prog = 0, suave = 0, mx = 0, my = 0, smx = 0, smy = 0, movil = false, visible = true, ultimo = performance.now(), rodado = 0;
const v = new THREE.Vector3();

function aplicar(p, t, dt) {
  paneles.forEach((el, i) => {
    const r = rangos[i], o = (r[0] < 0 ? 1 : sm(r[0], r[1], p)) * (1 - sm(r[2], r[3], p));
    el.style.opacity = o;
    el.style.transform = (movil ? "" : "translateY(-50%) ") + `translateY(${(1 - o) * (p < r[1] ? 34 : -34)}px)`;
    el.style.visibility = o < 0.02 ? "hidden" : "visible";
  });
  if (cue) cue.style.opacity = 1 - sm(0.02, 0.08, p);
  if (num) num.textContent = p < 0.24 ? "00" : p < 0.65 ? "01" : "02";

  const perfil = sm(0.2, 0.4, p);           // gira a perfil
  const cola = sm(0.6, 0.78, p);            // se va a la izquierda mostrando la cola
  const anda = sm(0.24, 0.34, p) * (1 - sm(0.56, 0.66, p)); // "maneja": ruedas y líneas

  // giro del auto (el modelo mira hacia +Z)
  const a0 = -2.35 + Math.sin(t * 0.25) * 0.12 * (1 - perfil);   // 3/4 frontal
  const a1 = -Math.PI / 2;                                         // perfil
  const a2 = 0.75;                                                 // 3/4 trasero
  giro.rotation.y = lerp(lerp(a0, a1, perfil), a2 + Math.PI * 2 * 0 , cola) + smx * 0.25;

  // posición en pantalla
  const x = movil ? 0 : lerp(lerp(2.25, 1.45, perfil), -2.0, cola);
  root.position.x = x;
  root.position.z = movil ? 0 : lerp(0, 0.4, perfil) - cola * 0.3;
  root.scale.setScalar(movil ? 0.78 : lerp(1, 0.86, perfil * (1 - cola)));

  // cámara: baja un poco al pasar a perfil y se eleva al final
  const camY = lerp(lerp(1.9, 1.25, perfil), 2.2, cola) - smy * 0.3;
  const camZ = movil ? lerp(11.5, 12.5, perfil) : lerp(lerp(10.8, 11.2, perfil), 10.6, cola);
  camera.position.set(movil ? 0 : lerp(0, 0.6, perfil) * (1 - cola), camY, camZ);
  mira.set(0, movil ? lerp(2.7, 1.55, Math.max(perfil, cola)) : 0.55, 0);
  camera.lookAt(mira);

  // ruedas y líneas de velocidad
  rodado += dt * (0.5 + anda * 9);
  ruedas.forEach((w) => { w.rotation.x = rodado * 3; });
  rayaMat.opacity = anda * 0.35;
  raya.rotation.y = giro.rotation.y;
  raya.position.copy(root.position);
  RAYAS.forEach((m) => { m.position.z -= dt * m.userData.v * 9 * anda; if (m.position.z < -7) m.position.z += 14; });
  anillo.position.x = root.position.x; anillo.position.z = root.position.z;
  piso.position.x = root.position.x * 0.6;

  // color
  colorObj.lerp(colorMeta, 0.08); pintura.color.copy(colorObj);

  // etiquetas
  labels.forEach((l) => {
    if (!l.el) return;
    const o = anclas ? sm(l.w[0], l.w[1], p) * (1 - sm(0.54, 0.6, p)) : 0;
    l.el.style.opacity = o; l.el.style.visibility = o < 0.02 ? "hidden" : "visible";
    if (o < 0.02) return;
    v.copy(anclas[l.k]); giro.localToWorld(v); v.project(camera);
    l.el.style.transform = `translate(${(v.x + 1) / 2 * canvas.clientWidth}px,${(1 - v.y) / 2 * canvas.clientHeight + (l.dy || 0)}px)` + (movil ? " translateX(-100%)" : "");
  });
}

function medir() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  movil = w < 760;
  host.classList.toggle("is-m", movil);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = movil ? 40 : 32;
  camera.updateProjectionMatrix();
}
addEventListener("resize", medir); medir();
addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

function conectarScroll() {
  if (window.ScrollTrigger && !reduced) {
    ScrollTrigger.create({ trigger: host, start: "top top", end: "bottom bottom", onUpdate: (s) => { prog = s.progress; } });
  }
}
if (window.ScrollTrigger) conectarScroll(); else addEventListener("load", conectarScroll);
new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { rootMargin: "120px" }).observe(host);

const t0 = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - ultimo) / 1000); ultimo = now;
  if (!visible) return;
  const t = reduced ? 0 : (now - t0) / 1000;
  suave += (prog - suave) * 0.08;
  smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
  aplicar(suave, t, reduced ? 0 : dt);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

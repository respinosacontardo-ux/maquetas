/*
  Portada 3D de Vértice: un auto real (Ferrari 458 Italia, modelo glTF con licencia CC BY de vicent091036)
  en un showroom oscuro. Al bajar: gira de 3/4 a perfil con las ruedas en movimiento y etiquetas,
  y después se va a la izquierda de cola mientras el visitante elige el color.
*/
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("h3d");
const canvas = document.getElementById("carCanvas");
const reduced = document.body.classList.contains("reduced");

const COLORES = [
  { n: "Rosso Corsa", c: "#a40f0b" },
  { n: "Arancio Brasa", c: "#dc5000" },
  { n: "Nero Daytona", c: "#0c0c0e" },
  { n: "Bianco Avus", c: "#e9e6df" },
  { n: "Blu Tour de France", c: "#16264f" },
  { n: "Grigio Silverstone", c: "#5d6166" }
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

/* ---------- Auto ---------- */
const root = new THREE.Group(); scene.add(root);   // posición en pantalla
const giro = new THREE.Group(); root.add(giro);    // giro del auto
const pintura = new THREE.MeshPhysicalMaterial({ color: COLORES[0].c, metalness: 1, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.03 });
const detalles = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 1, roughness: 0.4 });
const vidrio = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.25, roughness: 0, transmission: 0.8 });
let ruedas = [], anclas = null, cargado = false;

const draco = new DRACOLoader();
draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/");
const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
loader.load("assets/ferrari.glb", (gltf) => {
  const car = gltf.scene.children[0];
  const set = (n, m) => { const o = car.getObjectByName(n); if (o) o.material = m; };
  set("body", pintura);
  ["rim_fl", "rim_fr", "rim_rr", "rim_rl", "trim"].forEach((n) => set(n, detalles));
  set("glass", vidrio);
  ruedas = ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"].map((n) => car.getObjectByName(n)).filter(Boolean);

  // sombra de contacto del propio modelo
  const ao = new THREE.Mesh(new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/ferrari_ao.png"), blending: THREE.MultiplyBlending, toneMapped: false, transparent: true, premultipliedAlpha: true }));
  ao.rotation.x = -Math.PI / 2; ao.renderOrder = 2;
  car.add(ao);
  car.updateMatrixWorld(true);   // todavía sin padre: el espacio del mundo == espacio local del auto

  const box = new THREE.Box3().setFromObject(car), s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  // el largo del auto va sobre el eje Z en este modelo
  anclas = {
    motor: new THREE.Vector3(c.x, box.min.y + s.y * 0.82, c.z - s.z * 0.22),
    cabina: new THREE.Vector3(c.x, box.min.y + s.y * 0.92, c.z + s.z * 0.05),
    rueda: ruedas[0] ? ruedas[0].getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(s.x * 0.45, 0.33, s.z * 0.32)
  };
  giro.add(car);
  cargado = true;
  host.classList.add("ready");
}, undefined, () => host.classList.add("no3d"));

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
  const x = movil ? 0 : lerp(lerp(2.6, 1.45, perfil), -2.0, cola);
  root.position.x = x;
  root.position.z = movil ? 0 : lerp(0, 0.4, perfil) - cola * 0.3;
  root.scale.setScalar(movil ? 0.78 : lerp(1, 0.86, perfil * (1 - cola)));

  // cámara: baja un poco al pasar a perfil y se eleva al final
  const camY = lerp(lerp(1.9, 1.25, perfil), 2.2, cola) - smy * 0.3;
  const camZ = movil ? lerp(11.5, 12.5, perfil) : lerp(lerp(10.8, 11.2, perfil), 10.6, cola);
  camera.position.set(movil ? 0 : lerp(0, 0.6, perfil) * (1 - cola), camY, camZ);
  mira.set(0, movil ? lerp(2.35, 1.55, Math.max(perfil, cola)) : 0.55, 0);
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

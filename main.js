// Three.js — subtle grid + floating particles
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const DARK_BG  = new THREE.Color(0x0f1117);
const LIGHT_BG = new THREE.Color(0xf8f9fc);
renderer.setClearColor(DARK_BG, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.z = 5;

// Grid
const gridMatDark  = new THREE.LineBasicMaterial({ color: 0x1e2535, transparent: true, opacity: 0.7 });
const gridMatLight = new THREE.LineBasicMaterial({ color: 0xd0d7e3, transparent: true, opacity: 0.8 });
const gridLines = [];
for (let i = -20; i <= 20; i++) {
  const h = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-30, i * 1.2, -6), new THREE.Vector3(30, i * 1.2, -6)]);
  const v = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.8, -15, -6), new THREE.Vector3(i * 1.8, 15, -6)]);
  const lh = new THREE.Line(h, gridMatDark);
  const lv = new THREE.Line(v, gridMatDark);
  scene.add(lh); scene.add(lv);
  gridLines.push(lh, lv);
}

// Particles
const N = 1200;
const pos = new Float32Array(N * 3);
const col = new Float32Array(N * 3);
const blueCol = new THREE.Color(0x3b82f6);
const dimDark  = new THREE.Color(0x2a3148);
const dimLight = new THREE.Color(0xb0bcd4);

for (let i = 0; i < N; i++) {
  const i3 = i * 3;
  pos[i3]   = (Math.random() - 0.5) * 30;
  pos[i3+1] = (Math.random() - 0.5) * 18;
  pos[i3+2] = (Math.random() - 0.5) * 8 - 2;
  const isBlue = Math.random() < 0.12;
  const c = isBlue ? blueCol : dimDark;
  col[i3] = c.r; col[i3+1] = c.g; col[i3+2] = c.b;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
const mat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true });
const points = new THREE.Points(geo, mat);
scene.add(points);

// Theme switch handler (called from HTML)
window.onThemeChange = function(isLight) {
  renderer.setClearColor(isLight ? LIGHT_BG : DARK_BG, 1);
  const gMat = isLight ? gridMatLight : gridMatDark;
  gridLines.forEach(l => l.material = gMat);
  const colAttr = geo.attributes.color;
  const dim = isLight ? dimLight : dimDark;
  for (let i = 0; i < N; i++) {
    const i3 = i * 3;
    const isBlue = Math.random() < 0.12;
    const c = isBlue ? blueCol : dim;
    colAttr.setXYZ(i, c.r, c.g, c.b);
  }
  colAttr.needsUpdate = true;
};

// Mouse
let mx = 0, my = 0, tmx = 0, tmy = 0;
window.addEventListener('mousemove', e => {
  tmx = (e.clientX / window.innerWidth - 0.5) * 0.5;
  tmy = (e.clientY / window.innerHeight - 0.5) * 0.3;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  mx += (tmx - mx) * 0.04;
  my += (tmy - my) * 0.04;
  camera.position.x = mx;
  camera.position.y = -my;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
})();

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const siblings = [...e.target.parentElement.querySelectorAll('.reveal')];
    const i = siblings.indexOf(e.target);
    setTimeout(() => e.target.classList.add('visible'), i * 80);
    obs.unobserve(e.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Active nav
const navLinks = document.querySelectorAll('.nav-links a');
const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));
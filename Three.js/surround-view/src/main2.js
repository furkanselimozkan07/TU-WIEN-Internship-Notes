// ============================================================
// SURROUND VIEW SİMÜLATÖRÜ - v2
// ============================================================

// --- TEMEL KURULUM ---
const sahne = new THREE.Scene();
sahne.background = new THREE.Color(0x111111);

const kamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
kamera.position.set(0, 0, 12);
kamera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- IŞIK ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
sahne.add(ambientLight);

// --- ZEMİN ---
const zeminGeo = new THREE.PlaneGeometry(14, 14);
const zeminMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
const zemin = new THREE.Mesh(zeminGeo, zeminMat);
sahne.add(zemin);

// Grid çizgileri
const gridHelper = new THREE.GridHelper(14, 14, 0x444444, 0x333333);
gridHelper.rotation.x = Math.PI / 2;
sahne.add(gridHelper);

// --- ROBOT GÖVDE ---
const robotGeo = new THREE.BoxGeometry(2, 1, 0.6);
const robotMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
const robot = new THREE.Mesh(robotGeo, robotMat);
robot.position.set(0, 0, 0.4);
sahne.add(robot);

// Robot yön göstergesi (ön taraf - beyaz şerit)
const onGeo = new THREE.BoxGeometry(1.8, 0.1, 0.61);
const onMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const onSerit = new THREE.Mesh(onGeo, onMat);
onSerit.position.set(0, 0.45, 0.4);
sahne.add(onSerit);

// --- 4 KAMERA (ok şeklinde) ---
const kameraRenkleri = {
  on:   0x22c55e,  // yeşil
  arka: 0xef4444,  // kırmızı
  sol:  0xf59e0b,  // sarı
  sag:  0xa855f7   // mor
};

function kameraOku(renk, x, y, rotZ) {
  const geo = new THREE.ConeGeometry(0.2, 0.6, 8);
  const mat = new THREE.MeshBasicMaterial({ color: renk });
  const ok = new THREE.Mesh(geo, mat);
  ok.position.set(x, y, 0.7);
  ok.rotation.z = rotZ;
  sahne.add(ok);
  return ok;
}

const kamOnOk   = kameraOku(kameraRenkleri.on,   0,    0.8,  0);
const kamArkaOk = kameraOku(kameraRenkleri.arka,  0,   -0.8,  Math.PI);
const kamSolOk  = kameraOku(kameraRenkleri.sol,  -1.2,  0,    -Math.PI / 2);
const kamSagOk  = kameraOku(kameraRenkleri.sag,   1.2,  0,     Math.PI / 2);

// --- KAMERA ALGI ALANLARI (transparan daireler) ---
function algiDairesi(renk, x, y, r) {
  const geo = new THREE.CircleGeometry(r, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: renk,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide
  });
  const daire = new THREE.Mesh(geo, mat);
  daire.position.set(x, y, 0.01);
  sahne.add(daire);

  // Daire kenarı
  const edgeGeo = new THREE.RingGeometry(r - 0.05, r, 32);
  const edgeMat = new THREE.MeshBasicMaterial({
    color: renk,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.set(x, y, 0.02);
  sahne.add(edge);
}

algiDairesi(kameraRenkleri.on,    0,    2.5, 2.2);
algiDairesi(kameraRenkleri.arka,  0,   -2.5, 2.2);
algiDairesi(kameraRenkleri.sol,  -2.5,  0,   2.2);
algiDairesi(kameraRenkleri.sag,   2.5,  0,   2.2);

// --- ÇEVRE NESNELERİ (engeller) ---
function engel(renk, x, y, w, h) {
  const geo = new THREE.BoxGeometry(w, h, 1);
  const mat = new THREE.MeshBasicMaterial({ color: renk });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, 0.5);
  sahne.add(mesh);
}

engel(0x64748b,  4,   3,  1.2, 1.2);  // gri kutu
engel(0x64748b, -4,  -2,  0.8, 1.8);  // gri kutu
engel(0x64748b,  3,  -4,  1.5, 0.8);  // gri kutu
engel(0xdc2626, -3,   4,  0.6, 0.6);  // kırmızı engel

// --- ETIKETLER (canvas texture ile) ---
function etiketOlustur(metin, renk) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = renk;
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(metin, 128, 45);
  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(1.2, 0.3);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  return new THREE.Mesh(geo, mat);
}

const etiketler = [
  { metin: 'ÖN',   renk: '#22c55e', x:  0,    y:  1.4 },
  { metin: 'ARKA', renk: '#ef4444', x:  0,    y: -1.4 },
  { metin: 'SOL',  renk: '#f59e0b', x: -1.8,  y:  0   },
  { metin: 'SAĞ',  renk: '#a855f7', x:  1.8,  y:  0   },
];

etiketler.forEach(e => {
  const etiket = etiketOlustur(e.metin, e.renk);
  etiket.position.set(e.x, e.y, 0.8);
  sahne.add(etiket);
});

// --- MOUSE ile DÖNDÜRME (basit orbit) ---
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let rotX = 0, rotZ = 0;

document.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
document.addEventListener('mouseup',   () => { isDragging = false; });
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - prevMouse.x;
  const dy = e.clientY - prevMouse.y;
  rotZ -= dx * 0.01;
  rotX += dy * 0.01;
  rotX = Math.max(-Math.PI / 2, Math.min(0, rotX)); // sadece yukarıdan aşağıya
  kamera.position.set(
    12 * Math.sin(rotZ) * Math.cos(rotX),
    12 * Math.sin(rotX),  // <- düzeltildi
    12 * Math.cos(rotZ) * Math.cos(rotX)
  );
  kamera.lookAt(0, 0, 0);
  prevMouse = { x: e.clientX, y: e.clientY };
});

// Scroll ile zoom
document.addEventListener('wheel', e => {
  kamera.position.multiplyScalar(e.deltaY > 0 ? 1.1 : 0.9);
  kamera.lookAt(0, 0, 0);
});

// --- PENCERE BOYUTU DEĞİŞİNCE ---
window.addEventListener('resize', () => {
  kamera.aspect = window.innerWidth / window.innerHeight;
  kamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- ANİMASYON ---
function animate() {
  requestAnimationFrame(animate);

  // Kamera oklarını robotla birlikte tut
  [kamOnOk, kamArkaOk, kamSolOk, kamSagOk].forEach(ok => {
    // Hafif titreşim efekti (canlı kamera hissi)
    ok.position.z = 0.7 + Math.sin(Date.now() * 0.005) * 0.03;
  });

  renderer.render(sahne, kamera);
}
animate();
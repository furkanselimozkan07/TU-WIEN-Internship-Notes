// ============================================================
// SURROUND VIEW SİMÜLATÖRÜ - v3 (Robot Hareket + Kameralar)
// ============================================================

const sahne = new THREE.Scene();
sahne.background = new THREE.Color(0x111111);

const kamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

kamera.position.set(0, 0, 16);
kamera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- IŞIK ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
sahne.add(ambientLight);

// --- ZEMİN ---
const zeminGeo = new THREE.PlaneGeometry(20, 20);
const zeminMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
const zemin = new THREE.Mesh(zeminGeo, zeminMat);
sahne.add(zemin);

const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
gridHelper.rotation.x = Math.PI / 2;
sahne.add(gridHelper);

// --- ROBOT GRUBU (gövde + kameralar birlikte hareket eder) ---
const robotGrubu = new THREE.Group();
sahne.add(robotGrubu);

// Gövde
const robotGeo = new THREE.BoxGeometry(2, 1, 0.6);
const robotMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
const robotGovde = new THREE.Mesh(robotGeo, robotMat);
robotGovde.position.set(0, 0, 0.4);
robotGrubu.add(robotGovde);

// Ön şerit
const onSeritGeo = new THREE.BoxGeometry(1.8, 0.1, 0.61);
const onSeritMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const onSerit = new THREE.Mesh(onSeritGeo, onSeritMat);
onSerit.position.set(0, 0.45, 0.4);
robotGrubu.add(onSerit);

// --- KAMERA OKLARI ---
function kameraOku(renk, x, y, rotZ) {
  const geo = new THREE.ConeGeometry(0.2, 0.6, 8);
  const mat = new THREE.MeshBasicMaterial({ color: renk });
  const ok = new THREE.Mesh(geo, mat);
  ok.position.set(x, y, 0.7);
  ok.rotation.z = rotZ;
  robotGrubu.add(ok);
  return ok;
}

kameraOku(0x22c55e,  0,    0.8,  0);
kameraOku(0xef4444,  0,   -0.8,  Math.PI);
kameraOku(0xf59e0b, -1.2,  0,   -Math.PI / 2);
kameraOku(0xa855f7,  1.2,  0,    Math.PI / 2);

// --- ALGI DAİRELERİ (robotla birlikte hareket eder) ---
function algiDairesi(renk, x, y) {
  const geo = new THREE.CircleGeometry(2.2, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: renk, transparent: true, opacity: 0.08, side: THREE.DoubleSide
  });
  const daire = new THREE.Mesh(geo, mat);
  daire.position.set(x, y, 0.01);
  robotGrubu.add(daire);

  const edgeGeo = new THREE.RingGeometry(2.15, 2.2, 32);
  const edgeMat = new THREE.MeshBasicMaterial({
    color: renk, transparent: true, opacity: 0.5, side: THREE.DoubleSide
  });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.set(x, y, 0.02);
  robotGrubu.add(edge);
}

algiDairesi(0x22c55e,  0,    2.5);
algiDairesi(0xef4444,  0,   -2.5);
algiDairesi(0xf59e0b, -2.5,  0);
algiDairesi(0xa855f7,  2.5,  0);

// --- ÇEVRE ENGELLERİ ---
const engelListesi = [];

function engel(renk, x, y, w, h) {
  const geo = new THREE.BoxGeometry(w, h, 1.2);
  const mat = new THREE.MeshBasicMaterial({ color: renk });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, 0.6);
  sahne.add(mesh);
  engelListesi.push({ mesh, x, y, w, h });
}

engel(0x64748b,  5,   3,  1.2, 1.2);
engel(0x64748b, -5,  -3,  0.8, 1.8);
engel(0x64748b,  4,  -5,  1.5, 0.8);
engel(0xdc2626, -4,   5,  0.6, 0.6);
engel(0x64748b, -6,   1,  1.0, 2.0);
engel(0x64748b,  6,  -1,  1.0, 1.0);

// --- KLAVYE DURUMU ---
const tuslar = {};
document.addEventListener('keydown', e => { tuslar[e.key.toLowerCase()] = true; });
document.addEventListener('keyup',   e => { tuslar[e.key.toLowerCase()] = false; });

// Robot durumu
const robotDurum = {
  x: 0, y: 0,
  aci: 0,          // derece cinsinden
  hiz: 0.05,
  donusHizi: 2     // derece/frame
};

// --- MOUSE ORBİT ---
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let camRotZ = 0, camRotX = -0.3;
let camRadius = 16;

document.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
document.addEventListener('mouseup',   () => { isDragging = false; });
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  camRotZ -= (e.clientX - prevMouse.x) * 0.01;
  camRotX += (e.clientY - prevMouse.y) * 0.01;
  camRotX = Math.max(-Math.PI / 2, Math.min(-0.05, camRotX));
  prevMouse = { x: e.clientX, y: e.clientY };
});
document.addEventListener('wheel', e => {
  camRadius = Math.max(5, Math.min(30, camRadius + e.deltaY * 0.02));
});

// --- PENCERE BOYUTU ---
window.addEventListener('resize', () => {
  kamera.aspect = window.innerWidth / window.innerHeight;
  kamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- HUD: klavye bilgisi ---
const hud = document.createElement('div');
hud.style.cssText = `
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.7); color: white; padding: 10px 24px;
  border-radius: 12px; font-family: monospace; font-size: 14px;
  border: 1px solid #333; letter-spacing: 1px;
`;
hud.innerHTML = '⬆ W  |  ⬇ S  |  ⬅ A  |  ➡ D  |  🖱 Mouse: döndür  |  Scroll: zoom';
document.body.appendChild(hud);

// --- ANİMASYON ---
function animate() {
  requestAnimationFrame(animate);

  // Klavye ile robot hareketi
  if (tuslar['w']) {
    robotDurum.x += robotDurum.hiz * Math.sin(robotDurum.aci * Math.PI / 180);
    robotDurum.y += robotDurum.hiz * Math.cos(robotDurum.aci * Math.PI / 180);
  }
  if (tuslar['s']) {
    robotDurum.x -= robotDurum.hiz * Math.sin(robotDurum.aci * Math.PI / 180);
    robotDurum.y -= robotDurum.hiz * Math.cos(robotDurum.aci * Math.PI / 180);
  }
  if (tuslar['a']) robotDurum.aci += robotDurum.donusHizi;
  if (tuslar['d']) robotDurum.aci -= robotDurum.donusHizi;

  // Sınır: zeminden çıkmasın
  robotDurum.x = Math.max(-9, Math.min(9, robotDurum.x));
  robotDurum.y = Math.max(-9, Math.min(9, robotDurum.y));

  // Robot grubunu güncelle
  robotGrubu.position.set(robotDurum.x, robotDurum.y, 0);
  robotGrubu.rotation.z = robotDurum.aci * Math.PI / 180;

  // Kamera pozisyonu (robotu takip eder)
  kamera.position.set(
    robotDurum.x + camRadius * Math.sin(camRotZ) * Math.cos(camRotX),
    robotDurum.y + camRadius * Math.sin(camRotX),
    camRadius * Math.cos(camRotZ) * Math.cos(camRotX)
  );
  kamera.lookAt(robotDurum.x, robotDurum.y, 0);

  renderer.render(sahne, kamera);
}
animate();
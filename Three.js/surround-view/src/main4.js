// ============================================================
// SURROUND VIEW SİMÜLATÖRÜ - v4 (Engel Tespiti + Uyarı)
// ============================================================

const sahne = new THREE.Scene();
sahne.background = new THREE.Color(0x111111);

const kamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
sahne.add(ambientLight);

// --- ZEMİN ---
const zeminGeo = new THREE.PlaneGeometry(20, 20);
const zeminMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
sahne.add(new THREE.Mesh(zeminGeo, zeminMat));
const grid = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
grid.rotation.x = Math.PI / 2;
sahne.add(grid);

// --- ROBOT GRUBU ---
const robotGrubu = new THREE.Group();
sahne.add(robotGrubu);

const robotGovde = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 0.6),
  new THREE.MeshBasicMaterial({ color: 0x2563eb })
);
robotGovde.position.set(0, 0, 0.4);
robotGrubu.add(robotGovde);

const onSerit = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.1, 0.61),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
onSerit.position.set(0, 0.45, 0.4);
robotGrubu.add(onSerit);

// --- KAMERA OKLARI ---
const kameraYonleri = [
  { renk: 0x22c55e, x:  0,    y:  0.8, rotZ: 0,             isim: 'on'   },
  { renk: 0xef4444, x:  0,    y: -0.8, rotZ: Math.PI,       isim: 'arka' },
  { renk: 0xf59e0b, x: -1.2,  y:  0,   rotZ: -Math.PI / 2, isim: 'sol'  },
  { renk: 0xa855f7, x:  1.2,  y:  0,   rotZ:  Math.PI / 2, isim: 'sag'  },
];

const kameraOkMeshler = {};
kameraYonleri.forEach(k => {
  const ok = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.6, 8),
    new THREE.MeshBasicMaterial({ color: k.renk })
  );
  ok.position.set(k.x, k.y, 0.7);
  ok.rotation.z = k.rotZ;
  robotGrubu.add(ok);
  kameraOkMeshler[k.isim] = ok;
});

// --- ALGI DAİRELERİ ---
const algıDaireMeshler = {};
const algıMesafe = 2.5;

kameraYonleri.forEach(k => {
  // Dolgu
  const daire = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 32),
    new THREE.MeshBasicMaterial({ color: k.renk, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
  );
  daire.position.set(k.x, k.y, 0.01);
  robotGrubu.add(daire);

  // Kenar
  const edge = new THREE.Mesh(
    new THREE.RingGeometry(2.15, 2.2, 32),
    new THREE.MeshBasicMaterial({ color: k.renk, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  edge.position.set(k.x, k.y, 0.02);
  robotGrubu.add(edge);

  algıDaireMeshler[k.isim] = { daire, edge, orijinalRenk: k.renk };
});

// --- ENGELLER ---
const engelListesi = [];

function engelEkle(x, y, w, h) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x64748b });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), mat);
  mesh.position.set(x, y, 0.6);
  sahne.add(mesh);
  engelListesi.push({ mesh, mat, x, y, w, h, orijinalRenk: 0x64748b });
}

engelEkle( 5,  3,  1.2, 1.2);
engelEkle(-5, -3,  0.8, 1.8);
engelEkle( 4, -5,  1.5, 0.8);
engelEkle(-4,  5,  0.6, 0.6);
engelEkle(-6,  1,  1.0, 2.0);
engelEkle( 6, -1,  1.0, 1.0);

// --- KLAVYE ---
const tuslar = {};
document.addEventListener('keydown', e => { tuslar[e.key.toLowerCase()] = true; });
document.addEventListener('keyup',   e => { tuslar[e.key.toLowerCase()] = false; });

const robotDurum = { x: 0, y: 0, aci: 0, hiz: 0.05, donusHizi: 2 };

// --- MOUSE ORBİT ---
let isDragging = false, prevMouse = { x: 0, y: 0 };
let camRotZ = 0, camRotX = -0.3, camRadius = 16;

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
window.addEventListener('resize', () => {
  kamera.aspect = window.innerWidth / window.innerHeight;
  kamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- HUD PANEL ---
const hud = document.createElement('div');
hud.style.cssText = `
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.75); color: white; padding: 10px 24px;
  border-radius: 12px; font-family: monospace; font-size: 14px;
  border: 1px solid #333;
`;
hud.innerHTML = '⬆ W &nbsp;|&nbsp; ⬇ S &nbsp;|&nbsp; ⬅ A &nbsp;|&nbsp; ➡ D &nbsp;|&nbsp; 🖱 döndür &nbsp;|&nbsp; scroll: zoom';
document.body.appendChild(hud);

// --- UYARI PANELI ---
const uyariPanel = document.createElement('div');
uyariPanel.style.cssText = `
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.85); color: white; padding: 12px 28px;
  border-radius: 12px; font-family: monospace; font-size: 15px;
  border: 2px solid #333; min-width: 360px; text-align: center;
  transition: border-color 0.2s;
`;
document.body.appendChild(uyariPanel);

// --- MESAFE HESABI (robot yönüne göre) ---
function mesafeHesapla(robotX, robotY, robotAciRad, yon) {
  // Her kameranın dünya koordinatındaki pozisyonu
  const offset = { on: [0, algıMesafe], arka: [0, -algıMesafe], sol: [-algıMesafe, 0], sag: [algıMesafe, 0] };
  const [ox, oy] = offset[yon];

  // Robota göre offset'i döndür
  const cos = Math.cos(robotAciRad);
  const sin = Math.sin(robotAciRad);
  const wx = robotX + (ox * sin + oy * cos);  // dünya X
  const wy = robotY + (ox * cos - oy * sin);  // dünya Y  (düzeltildi)

  let enYakin = Infinity;
  engelListesi.forEach(e => {
    const dx = wx - e.x;
    const dy = wy - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < enYakin) enYakin = dist;
  });
  return enYakin;
}

// --- ANİMASYON ---
function animate() {
  requestAnimationFrame(animate);

  // Hareket
  const aciRad = robotDurum.aci * Math.PI / 180;
  if (tuslar['w']) { robotDurum.x += robotDurum.hiz * Math.sin(aciRad); robotDurum.y += robotDurum.hiz * Math.cos(aciRad); }
  if (tuslar['s']) { robotDurum.x -= robotDurum.hiz * Math.sin(aciRad); robotDurum.y -= robotDurum.hiz * Math.cos(aciRad); }
  if (tuslar['a']) robotDurum.aci += robotDurum.donusHizi;
  if (tuslar['d']) robotDurum.aci -= robotDurum.donusHizi;

  robotDurum.x = Math.max(-9, Math.min(9, robotDurum.x));
  robotDurum.y = Math.max(-9, Math.min(9, robotDurum.y));

  robotGrubu.position.set(robotDurum.x, robotDurum.y, 0);
  robotGrubu.rotation.z = aciRad;

  // --- ENGEL TESPİTİ ---
  const esikYakin  = 2.0;  // kırmızı uyarı
  const esikOrta   = 3.5;  // sarı uyarı

  const mesafeler = {};
  ['on', 'arka', 'sol', 'sag'].forEach(yon => {
    mesafeler[yon] = mesafeHesapla(robotDurum.x, robotDurum.y, aciRad, yon);
  });

  // Algı dairesi renklerini güncelle
  const yonRenkler = { on: 0x22c55e, arka: 0xef4444, sol: 0xf59e0b, sag: 0xa855f7 };
  let enTehlikeli = { mesafe: Infinity, yon: null };

  ['on', 'arka', 'sol', 'sag'].forEach(yon => {
    const m = mesafeler[yon];
    const { daire, edge } = algıDaireMeshler[yon];
    let renk;

    if (m < esikYakin) {
      renk = 0xff0000;
      daire.material.opacity = 0.35;
      edge.material.opacity  = 1.0;
    } else if (m < esikOrta) {
      renk = 0xffaa00;
      daire.material.opacity = 0.18;
      edge.material.opacity  = 0.75;
    } else {
      renk = yonRenkler[yon];
      daire.material.opacity = 0.08;
      edge.material.opacity  = 0.5;
    }

    daire.material.color.setHex(renk);
    edge.material.color.setHex(renk);

    if (m < enTehlikeli.mesafe) enTehlikeli = { mesafe: m, yon };
  });

  // Uyarı paneli güncelle
  const yonTr = { on: 'ÖN', arka: 'ARKA', sol: 'SOL', sag: 'SAĞ' };
  if (enTehlikeli.mesafe < esikYakin) {
    uyariPanel.style.borderColor = '#ff0000';
    uyariPanel.style.color = '#ff4444';
    uyariPanel.innerHTML = `⚠️ KRİTİK UYARI — ${yonTr[enTehlikeli.yon]} KAMERA &nbsp;|&nbsp; Mesafe: ${enTehlikeli.mesafe.toFixed(1)}m`;
  } else if (enTehlikeli.mesafe < esikOrta) {
    uyariPanel.style.borderColor = '#ffaa00';
    uyariPanel.style.color = '#ffcc44';
    uyariPanel.innerHTML = `⚡ DİKKAT — ${yonTr[enTehlikeli.yon]} KAMERA &nbsp;|&nbsp; Mesafe: ${enTehlikeli.mesafe.toFixed(1)}m`;
  } else {
    uyariPanel.style.borderColor = '#333';
    uyariPanel.style.color = '#44ff88';
    uyariPanel.innerHTML
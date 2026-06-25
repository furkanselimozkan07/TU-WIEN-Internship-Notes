// --- SAHNE, KAMERA, RENDERER ---
const sahne = new THREE.Scene();

// Kamera: Z ekseninde yukarı kaldırıyoruz (kuş bakışı)
const kamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
kamera.position.set(0, 0, 8);   // X=0, Y=0, Z=8 → tam yukarıdan bakıyor
kamera.lookAt(0, 0, 0);         // Sahnenin merkezine bak

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- ZEMİN (HALI) ---
const halıGeometrisi = new THREE.PlaneGeometry(10, 10);
const halıMateryali = new THREE.MeshBasicMaterial({ color: 0x1a472a, side: THREE.DoubleSide });
const zemin = new THREE.Mesh(halıGeometrisi, halıMateryali);
sahne.add(zemin);

// --- ROBOT (basit bir kutu) ---
const robotGeometrisi = new THREE.BoxGeometry(1, 1, 0.5);
const robotMateryali = new THREE.MeshBasicMaterial({ color: 0xff6600 });
const robot = new THREE.Mesh(robotGeometrisi, robotMateryali);
robot.position.set(0, 0, 0.3);  // Zeminin biraz üstünde
sahne.add(robot);

// --- ANİMASYON DÖNGÜSÜ ---
function animate() {
  requestAnimationFrame(animate);
  robot.rotation.z += 0.01;     // Robot hafifçe dönsün
  renderer.render(sahne, kamera);
}
animate();
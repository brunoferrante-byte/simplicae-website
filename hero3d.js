/* Simplicae hero scene: loose line segments settle into one playing surface after another. */
import * as THREE from './vendor/three.module.min.js';

const hero = document.querySelector('.hero');
const canvas = document.getElementById('hero3d');
const label = document.getElementById('hero3dLabel');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STEP = 0.16;      // target length of one segment, in scene units
const FIELD_WIDTH = 10; // every playing surface is scaled to this length
const TAU = Math.PI * 2;

/* ---------- playing surfaces, drawn in metres and scaled to FIELD_WIDTH ---------- */
function surface(lengthMetres, draw) {
  const k = FIELD_WIDTH / lengthMetres;
  const segs = [];
  const line = (x1, z1, x2, z2) => {
    x1 *= k; z1 *= k; x2 *= k; z2 *= k;
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, z2 - z1) / STEP));
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n;
      segs.push([x1 + (x2 - x1) * a, z1 + (z2 - z1) * a, x1 + (x2 - x1) * b, z1 + (z2 - z1) * b]);
    }
  };
  const arc = (cx, cz, r, a0, a1) => {
    cx *= k; cz *= k; r *= k;
    const n = Math.max(3, Math.round(Math.abs(a1 - a0) * r / STEP));
    for (let i = 0; i < n; i++) {
      const a = a0 + (a1 - a0) * i / n, b = a0 + (a1 - a0) * (i + 1) / n;
      segs.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r, cx + Math.cos(b) * r, cz + Math.sin(b) * r]);
    }
  };
  const rect = (x1, z1, x2, z2) => { line(x1, z1, x2, z1); line(x2, z1, x2, z2); line(x2, z2, x1, z2); line(x1, z2, x1, z1); };
  /* a box that opens onto an end line: two sides and a front */
  const box = (endX, depth, halfW, s) => {
    const front = endX - s * depth;
    line(endX, -halfW, front, -halfW); line(front, -halfW, front, halfW); line(front, halfW, endX, halfW);
  };
  draw({ line, arc, rect, box });
  return segs;
}

const pitch = surface(105, ({ line, arc, rect, box }) => {
  const hl = 52.5, hw = 34;
  rect(-hl, -hw, hl, hw);
  line(0, -hw, 0, hw);
  arc(0, 0, 9.15, 0, TAU);
  for (const s of [-1, 1]) {
    box(s * hl, 16.5, 20.16, s);            // penalty area
    box(s * hl, 5.5, 9.16, s);              // goal area
    box(s * hl, -2, 3.66, s);               // goal
    const mid = s < 0 ? 0 : Math.PI;
    arc(s * (hl - 11), 0, 9.15, mid - 0.926, mid + 0.926); // penalty arc
  }
});

const court = surface(28, ({ line, arc, rect, box }) => {
  const hl = 14, hw = 7.5;
  rect(-hl, -hw, hl, hw);
  line(0, -hw, 0, hw);
  arc(0, 0, 1.8, 0, TAU);
  for (const s of [-1, 1]) {
    const mid = s < 0 ? 0 : Math.PI;
    const bx = s * (hl - 1.575);            // basket
    box(s * hl, 5.8, 2.45, s);              // key
    arc(s * (hl - 5.8), 0, 1.8, 0, TAU);    // free-throw circle
    line(s * hl, -6.6, bx - s * 1.415, -6.6);
    line(s * hl, 6.6, bx - s * 1.415, 6.6);
    arc(bx, 0, 6.75, mid - 1.359, mid + 1.359); // three-point arc
    arc(bx, 0, 1.25, mid - Math.PI / 2, mid + Math.PI / 2);
    arc(bx, 0, 0.45, 0, TAU);               // hoop
    line(s * (hl - 1.2), -0.9, s * (hl - 1.2), 0.9); // backboard
  }
});

const rink = surface(61, ({ line, arc }) => {
  const hl = 30.5, hw = 13, R = 8.5, gl = 27.15;
  line(-hl + R, -hw, hl - R, -hw); line(-hl + R, hw, hl - R, hw);
  line(-hl, -hw + R, -hl, hw - R); line(hl, -hw + R, hl, hw - R);
  arc(hl - R, hw - R, R, 0, Math.PI / 2);
  arc(-hl + R, hw - R, R, Math.PI / 2, Math.PI);
  arc(-hl + R, -hw + R, R, Math.PI, Math.PI * 1.5);
  arc(hl - R, -hw + R, R, Math.PI * 1.5, TAU);
  line(0, -hw, 0, hw);                      // centre line
  line(-7.62, -hw, -7.62, hw); line(7.62, -hw, 7.62, hw); // blue lines
  arc(0, 0, 4.57, 0, TAU);
  for (const s of [-1, 1]) {
    line(s * gl, -11.26, s * gl, 11.26);    // goal line
    arc(s * gl, 0, 1.83, s < 0 ? -Math.PI / 2 : Math.PI / 2, s < 0 ? Math.PI / 2 : Math.PI * 1.5); // crease
    arc(s * 21.05, -6.7, 4.57, 0, TAU);     // face-off circles
    arc(s * 21.05, 6.7, 4.57, 0, TAU);
  }
});

const diamond = surface(180, ({ line, arc }) => {
  const hx = -50, far = 100, q = Math.PI / 4, b = 27.43 * Math.SQRT1_2;
  line(hx, 0, hx + far * Math.SQRT1_2, -far * Math.SQRT1_2); // foul lines
  line(hx, 0, hx + far * Math.SQRT1_2, far * Math.SQRT1_2);
  arc(hx, 0, far, -q, q);                   // outfield fence
  line(hx, 0, hx + b, b); line(hx + b, b, hx + 2 * b, 0);   // base paths
  line(hx + 2 * b, 0, hx + b, -b); line(hx + b, -b, hx, 0);
  arc(hx + 18.44, 0, 29, -1.251, 1.251);    // infield edge
  arc(hx + 18.44, 0, 2.74, 0, TAU);         // mound
  arc(hx, 0, 3.96, 0, TAU);                 // home plate circle
  arc(hx + b, b, 1.2, 0, TAU); arc(hx + 2 * b, 0, 1.2, 0, TAU); arc(hx + b, -b, 1.2, 0, TAU); // bases
});

const rugby = surface(120, ({ line, rect }) => {
  const hl = 60, hw = 35, cross = [-50, -28, -10, 0, 10, 28, 50];
  rect(-hl, -hw, hl, hw);
  for (const x of cross) line(x, -hw, x, hw); // try, 22 m, 10 m and halfway lines
  for (const z of [-30, -20, 20, 30]) for (const x of cross) line(x - 2.5, z, x + 2.5, z); // 5 m and 15 m dashes
  for (const s of [-1, 1]) {                // posts
    line(s * 50, -2.8, s * 53, -2.8); line(s * 50, 2.8, s * 53, 2.8); line(s * 53, -2.8, s * 53, 2.8);
  }
});

/* ---------- turn each surface into the same number of poses ---------- */
const N = Math.max(pitch.length, court.length, rink.length, diamond.length, rugby.length);
const UP = new THREE.Vector3(0, 1, 0);

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function poses(segs) {
  const list = segs.slice();
  while (list.length < N) list.push(segs[Math.floor(Math.random() * segs.length)]);
  return shuffle(list).map(([x1, z1, x2, z2]) => ({
    pos: new THREE.Vector3((x1 + x2) / 2, 0, (z1 + z2) / 2),
    quat: new THREE.Quaternion().setFromAxisAngle(UP, Math.atan2(-(z2 - z1), x2 - x1)),
    len: Math.hypot(x2 - x1, z2 - z1),
  }));
}
function chaos() {
  const out = [];
  for (let i = 0; i < N; i++) {
    out.push({
      pos: new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 6 - 1.5, (Math.random() - 0.5) * 11),
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU)),
      len: STEP * (0.7 + Math.random() * 0.9),
    });
  }
  return out;
}

const SCATTER = chaos();
const SURFACES = [
  { name: 'Pitch', poses: poses(pitch) },
  { name: 'Court', poses: poses(court) },
  { name: 'Rink', poses: poses(rink) },
  { name: 'Diamond', poses: poses(diamond) },
  { name: 'Field', poses: poses(rugby) },
];
const delay = Float32Array.from({ length: N }, () => Math.random());

/* ---------- scene ---------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (err) {
  renderer = null;
}

if (renderer) {
  hero.classList.add('has-3d');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0e2214, 13, 27);
  const camera = new THREE.PerspectiveCamera(35, 2, 0.1, 100);
  camera.position.set(0, 8.5, 12);
  camera.lookAt(0, 0, 0);

  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 0.035, 0.035),
    new THREE.MeshBasicMaterial({ color: 0xE1F905, transparent: true, opacity: 0.92 }),
    N
  );
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = w >= 900;
    group.position.set(wide ? 4.5 : 0, 0, wide ? -1.4 : -3);
    group.scale.setScalar(wide ? 0.7 : 0.8);
  }

  const SETTLE = 2.6, STAGGER = 0.9, HOLD = 3.6, LOOSEN = 0.32;
  const ease = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1);

  let from = SCATTER, target = 0, to = SURFACES[0].poses, t0 = 0.4, firstMove = true;

  function setLabel(text) {
    label.classList.remove('show');
    window.setTimeout(() => { label.textContent = text; label.classList.add('show'); }, 350);
  }

  function place(time) {
    const e = time - t0;
    for (let i = 0; i < N; i++) {
      const u = Math.min(1, Math.max(0, (e - delay[i] * STAGGER) / SETTLE));
      const k = ease(u);
      const a = from[i], b = to[i], c = SCATTER[i];
      p.lerpVectors(a.pos, b.pos, k);
      q.slerpQuaternions(a.quat, b.quat, k);
      if (!firstMove) {                       // between surfaces, loosen partway back toward disorder
        const loose = Math.sin(Math.PI * k) * LOOSEN;
        p.lerp(c.pos, loose);
        q.slerp(c.quat, loose);
      }
      sc.x = a.len + (b.len - a.len) * k;
      m.compose(p, q, sc);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (e > SETTLE + STAGGER + HOLD) {
      from = to;
      target = (target + 1) % SURFACES.length;
      to = SURFACES[target].poses;
      t0 = time;
      firstMove = false;
      setLabel(SURFACES[target].name);
    }
  }

  let pointerX = 0, pointerY = 0, visible = true, running = false;
  window.addEventListener('pointermove', (ev) => {
    pointerX = ev.clientX / window.innerWidth - 0.5;
    pointerY = ev.clientY / window.innerHeight - 0.5;
  });

  const clock = new THREE.Clock();
  let time = 0;
  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    running = true;
    time += clock.getDelta();
    place(time);
    group.rotation.y += ((Math.sin(time * 0.18) * 0.22 + pointerX * 0.25) - group.rotation.y) * 0.04;
    group.rotation.x += ((pointerY * 0.08) - group.rotation.x) * 0.04;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function wake() { if (!running && visible && !document.hidden) { clock.getDelta(); requestAnimationFrame(frame); } }

  resize();
  window.addEventListener('resize', () => { resize(); if (reduceMotion) renderer.render(scene, camera); });

  if (reduceMotion) {
    /* no motion: show the finished pitch, still */
    firstMove = true; from = SURFACES[0].poses; to = SURFACES[0].poses;
    place(t0 + SETTLE + STAGGER);
    label.textContent = SURFACES[0].name; label.classList.add('show');
    renderer.render(scene, camera);
  } else {
    setLabel(SURFACES[0].name);
    new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; wake(); }).observe(hero);
    document.addEventListener('visibilitychange', wake);
    wake();
  }
}

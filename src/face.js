// The silly face the last brick pulls at the loser. Built in brick-local units.
import * as THREE from 'three';

const easeOutBack = (t) => {
  const c = 1.9;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};
const clamp01 = (t) => Math.min(1, Math.max(0, t));

export function createFace(brickDepth) {
  const front = brickDepth / 2;
  const group = new THREE.Group();

  const white = new THREE.MeshStandardMaterial({ color: 0xfff8ec, roughness: 0.35 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x0d0a08, roughness: 0.5 });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x2a0b0b, roughness: 0.8 });
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0xe8607a, roughness: 0.42 });

  function eye(x, y, radius) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, front + radius * 0.35);
    pivot.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 28, 20), white));
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.46, 20, 14),
      ink,
    );
    pivot.add(pupil);
    group.add(pivot);
    return {
      pivot,
      pupil,
      radius,
      offset: new THREE.Vector2(0, 0),
      velocity: new THREE.Vector2(0, 0),
    };
  }
  // Mismatched on purpose.
  const eyes = [eye(-0.27, 0.17, 0.17), eye(0.25, 0.2, 0.125)];

  function brow(x, y, tilt, width) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.035, 0.03), ink);
    mesh.position.set(x, y, front + 0.25);
    mesh.rotation.z = tilt;
    group.add(mesh);
    return { mesh, tilt, y };
  }
  const brows = [brow(-0.27, 0.262, 0.3, 0.26), brow(0.25, 0.262, -0.42, 0.21)];

  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.2, 28, 14), mouthMat);
  mouth.scale.set(1, 0.42, 0.16);
  mouth.position.set(0.02, -0.075, front);
  group.add(mouth);

  // One buck tooth, because it is funnier than two.
  const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.02), white);
  tooth.position.set(-0.05, -0.022, front + 0.03);
  group.add(tooth);

  // The tongue hinges at the lip so it can wag.
  const tongue = new THREE.Group();
  tongue.position.set(0.05, -0.08, front + 0.03);
  const blade = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.16, 8, 16), tongueMat);
  blade.scale.set(1.25, 1, 0.42);
  blade.position.y = -0.1;
  tongue.add(blade);
  const crease = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.15, 0.004),
    new THREE.MeshStandardMaterial({ color: 0xa83450, roughness: 0.6 }),
  );
  crease.position.set(0, -0.11, 0.03);
  tongue.add(crease);
  group.add(tongue);

  group.visible = false;
  let age = -1;
  let wasGoing = false;

  function show(staticPose = false) {
    group.visible = true;
    age = staticPose ? 10 : 0;
    wasGoing = false;
  }

  function hide() {
    group.visible = false;
    age = -1;
  }

  /** `sway` is how far the head moved this frame; the pupils react to it. */
  function update(dt, sway, frozen = false) {
    if (age < 0) return;
    age += dt;

    const popL = easeOutBack(clamp01(age / 0.28));
    const popR = easeOutBack(clamp01((age - 0.14) / 0.28));
    eyes[0].pivot.scale.setScalar(Math.max(0.0001, popL));
    eyes[1].pivot.scale.setScalar(Math.max(0.0001, popR));

    const tongueOut = easeOutBack(clamp01((age - 0.34) / 0.22));
    tongue.scale.set(1, Math.max(0.0001, tongueOut), 1);
    const going = age > 0.34;
    const startedTongue = going && !wasGoing;
    wasGoing = going;

    if (frozen) {
      tongue.rotation.z = 0.18;
      eyes[0].pupil.position.set(0.05, -0.04, eyes[0].radius * 0.68);
      eyes[1].pupil.position.set(-0.05, -0.02, eyes[1].radius * 0.68);
      return startedTongue;
    }

    tongue.rotation.z = Math.sin(age * 15) * 0.38;
    tongue.rotation.x = 0.25 + Math.sin(age * 7) * 0.14;
    brows[0].mesh.position.y = brows[0].y + Math.abs(Math.sin(age * 5)) * 0.03;
    brows[1].mesh.position.y = brows[1].y + Math.abs(Math.sin(age * 5 + 1)) * 0.035;
    brows[0].mesh.rotation.z = brows[0].tilt + Math.sin(age * 3) * 0.2;

    // Googly pupils: a damped spring thrown around by the head, and every few
    // seconds they cross.
    const crossing = age % 3.4 > 2.6;
    eyes.forEach((e, i) => {
      const targetX = crossing ? (i === 0 ? 0.55 : -0.55) * e.radius : 0;
      const targetY = crossing ? -0.1 * e.radius : -0.4 * e.radius;
      const k = 70;
      const damp = 3.4;
      e.velocity.x += ((targetX - e.offset.x) * k - e.velocity.x * damp - sway.x * 34) * dt;
      e.velocity.y += ((targetY - e.offset.y) * k - e.velocity.y * damp - sway.y * 34) * dt;
      e.offset.addScaledVector(e.velocity, dt);
      const limit = e.radius * 0.72;
      if (e.offset.length() > limit) {
        e.offset.setLength(limit);
        e.velocity.multiplyScalar(-0.45);
      }
      const z = Math.sqrt(Math.max(0, e.radius * e.radius - e.offset.lengthSq())) * 0.72;
      e.pupil.position.set(e.offset.x, e.offset.y, z);
    });
    return startedTongue;
  }

  return { group, show, hide, update };
}

// The yard: real-time 3D stacks, thrown bricks, dust, and the last brick's revenge.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  clayTextures,
  wallTextures,
  groundTextures,
  chalkMark,
  dustSprite,
} from './textures.js';
import { createFace } from './face.js';
import { createGlyphs } from './glyphs.js';

const BRICK = { w: 1.16, h: 0.5, d: 0.56 };
const PILE_X = [-1.42, 0, 1.42];
const GRAVITY = 15;
const PULL_OUT = 0.34;
const HERO_SCALE = 2.75;
const VIEW_W = 4.3; // world units the stacks need across
const VIEW_H = 4.5; // and upward, with room for the total above the tallest
const LOOK_AT_Y = 1.6;
const DUST_COUNT = 64;

const restY = (index) => BRICK.h / 2 + index * BRICK.h;

export function createScene(canvas, { reducedMotion, onThud, onTongue, onStrike, onFrame }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const SOOT = 0x17130f;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SOOT);
  scene.fog = new THREE.Fog(SOOT, 12, 30);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.5, 80);
  const viewDir = new THREE.Vector3(0, 0.2, 1).normalize();
  const lookAt = new THREE.Vector3(0, LOOK_AT_Y, 0);
  let shake = 0;
  let cameraBase = new THREE.Vector3();

  // Dusk: a low warm sun from the right, so the tallest stack's shadow falls
  // across the wall above the shorter ones on every screen. Cool sky elsewhere.
  scene.add(new THREE.HemisphereLight(0x8496b8, 0x2a2018, 1.5));
  const sun = new THREE.DirectionalLight(0xffb078, 5.2);
  sun.position.set(7, 2.7, 3.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -6;
  sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6;
  sun.shadow.camera.bottom = -3;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 24;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 7;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x87a2d8, 0.85);
  rim.position.set(-6, 3.5, -1);
  scene.add(rim);
  // A soft fill from the viewer keeps shadowed bricks readable against the wall.
  const fill = new THREE.DirectionalLight(0xffd9c0, 0.75);
  fill.position.set(0, 2.5, 8);
  scene.add(fill);
  const SUN_DAY = sun.intensity;

  const ground = groundTextures();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 40),
    new THREE.MeshStandardMaterial({ map: ground.map, bumpMap: ground.bump, bumpScale: 1.6, roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 8;
  floor.receiveShadow = true;
  scene.add(floor);

  const wall = wallTextures();
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 24),
    new THREE.MeshLambertMaterial({
      map: wall.map,
      bumpMap: wall.bump,
      bumpScale: 1.8,
      color: new THREE.Color(0.3, 0.5, 0.8),
      // Skips the film curve, which would crush shadows to pure black, and
      // glows faintly from its own map so the courses survive inside a shadow.
      toneMapped: false,
      emissive: 0xffffff,
      emissiveMap: wall.map,
      emissiveIntensity: 0.62,
    }),
  );
  wall.map.repeat.set(9, 3.6);
  wall.bump.repeat.set(9, 3.6);
  backWall.position.set(0, 12, -1.15);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Stone-and-glass lettering: the name on the wall, and each pile's count on the ground.
  const glyphs = createGlyphs(renderer);

  const WALL_Z = backWall.position.z + 0.2;
  const title = glyphs.makeWord('2-4-6', { size: 0.64, bolts: true });
  title.group.position.set(-1.04, 2.82, WALL_Z);
  scene.add(title.group);

  const byline = glyphs.makeWord('A.R.C. ALBERTO', { size: 0.15, gap: 0.028, space: 0.07 });
  byline.group.position.set(-1.04, 2.5, WALL_Z);
  scene.add(byline.group);

  const loser = glyphs.makeWord('LOSER', { size: 0.86, gap: 0.09, bolts: true });
  loser.group.position.set(0, 2.2, WALL_Z);
  loser.group.visible = false;
  scene.add(loser.group);

  const counts = PILE_X.map((x) => {
    const holder = new THREE.Group();
    holder.position.set(x, 0.05, 1.5);
    holder.rotation.x = -0.98;
    scene.add(holder);
    return { holder, word: null, value: null, chosen: false };
  });

  function showTitle(on) {
    title.group.visible = on;
    byline.group.visible = on;
    loser.group.visible = !on;
    counts.forEach((c) => (c.holder.visible = on));
  }

  function strike(word) {
    if (reducedMotion) return;
    word.strike();
    onStrike?.();
    wake();
  }

  // Dust
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    map: dustSprite(),
    color: 0xc9a587,
    size: 0.6,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  dust.visible = false;
  scene.add(dust);
  const dustState = Array.from({ length: DUST_COUNT }, () => ({ life: 0, vx: 0, vy: 0, vz: 0 }));
  let dustCursor = 0;

  function puff(x, y, z, amount) {
    if (reducedMotion) return;
    for (let i = 0; i < amount; i++) {
      const s = dustState[dustCursor];
      const a = Math.random() * Math.PI * 2;
      const v = 0.5 + Math.random() * 1.1;
      s.life = 0.45 + Math.random() * 0.4;
      s.vx = Math.cos(a) * v;
      s.vy = 0.25 + Math.random() * 0.5;
      s.vz = Math.sin(a) * v * 0.6;
      dustPositions[dustCursor * 3] = x + Math.cos(a) * 0.3;
      dustPositions[dustCursor * 3 + 1] = y;
      dustPositions[dustCursor * 3 + 2] = z + Math.sin(a) * 0.15;
      dustCursor = (dustCursor + 1) % DUST_COUNT;
    }
    dust.visible = true;
    wake();
  }

  // Bricks
  const geometry = new RoundedBoxGeometry(BRICK.w, BRICK.h, BRICK.d, 4, 0.032);
  const clay = [clayTextures(), clayTextures(), clayTextures()];
  const bricks = new Map();
  const face = createFace(BRICK.d);
  const markTexture = chalkMark();
  const markGeometry = new THREE.PlaneGeometry(BRICK.w * 0.98, BRICK.h * 0.96);
  const markMaterial = new THREE.MeshBasicMaterial({
    map: markTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    fog: false,
  });

  function makeBrick(id, pile, index) {
    const skin = clay[Math.floor(Math.random() * clay.length)];
    const color = new THREE.Color().setHSL(
      0.038 + Math.random() * 0.022,
      0.55 + Math.random() * 0.14,
      0.4 + Math.random() * 0.1,
    );
    const material = new THREE.MeshStandardMaterial({
      map: skin.map,
      bumpMap: skin.bump,
      bumpScale: 1.5,
      color,
      roughness: 0.93,
      emissive: 0xff6a20,
      emissiveIntensity: 0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mark = new THREE.Mesh(markGeometry, markMaterial);
    mark.position.z = BRICK.d / 2 + 0.003;
    mark.visible = false;
    mesh.add(mark);
    const brick = {
      mark,
      id,
      pile,
      index,
      mesh,
      jitterX: (Math.random() - 0.5) * 0.07,
      jitterRot: (Math.random() - 0.5) * 0.09,
      y: restY(index),
      vy: 0,
      z: 0,
      selected: false,
      state: 'stacked', // stacked | thrown | hero
      delay: 0,
      thrown: null,
    };
    mesh.position.set(PILE_X[pile] + brick.jitterX, brick.y, 0);
    mesh.rotation.y = brick.jitterRot;
    scene.add(mesh);
    bricks.set(id, brick);
    return brick;
  }

  function disposeBrick(brick) {
    scene.remove(brick.mesh);
    brick.mesh.material.dispose();
    bricks.delete(brick.id);
  }

  let hero = null;
  let heroClock = 0;
  const heroLast = new THREE.Vector2();
  let sunTarget = SUN_DAY;

  let free = { x: 0, y: 0, w: 1, h: 1 };
  let width = 1;
  let height = 1;
  let halfWorldW = 4;
  let viewShift = 0;
  let groundShift = 0;
  let stageShift = 0;
  let viewReady = false;

  function applyView() {
    camera.setViewOffset(
      width,
      height,
      width / 2 - (free.x + free.w / 2),
      height / 2 - (free.y + free.h / 2) - viewShift,
      width,
      height,
    );
    camera.updateMatrixWorld();
  }

  function layout(area) {
    if (area) free = area;
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const byHeight = (VIEW_H * height) / (2 * tanV * Math.max(free.h, 1));
    const byWidth = (VIEW_W * width) / (2 * tanV * camera.aspect * Math.max(free.w, 1));
    const distance = Math.max(byHeight, byWidth, 6);
    // The fog follows the camera, so a far-back phone view isn't dimmer than a desktop one.
    scene.fog.near = distance + 4;
    scene.fog.far = distance + 22;
    cameraBase = lookAt.clone().addScaledVector(viewDir, distance);
    camera.position.copy(cameraBase);
    camera.lookAt(lookAt);
    // Slide the picture so the stacks sit in the space the chalk text leaves,
    // standing just above the controls when there's height to spare.
    const pxPerUnit = height / (2 * distance * tanV);
    const spare = free.h / pxPerUnit - VIEW_H;
    // Leaves room below the stacks for the counts on the ground.
    groundShift = Math.max(0, spare / 2 - 0.5) * pxPerUnit;
    // The last brick takes the middle of the stage.
    stageShift = -(LOOK_AT_Y - (BRICK.h * HERO_SCALE) / 2) * pxPerUnit;
    viewShift = hero ? stageShift : groundShift;
    camera.updateProjectionMatrix();
    applyView();
    viewReady = true;
    halfWorldW = distance * tanV * camera.aspect;
    wake();
  }

  function setPileCount(pile, count) {
    const slot = counts[pile];
    if (slot.value !== count) {
      if (slot.word) slot.holder.remove(slot.word.group);
      slot.word = glyphs.makeWord(String(count), { size: 0.66, depth: 0.12 });
      slot.word.setChosen(slot.chosen);
      slot.holder.add(slot.word.group);
      slot.value = count;
    }
    wake();
  }

  function newRound(piles, animated = true) {
    [...bricks.values()].forEach(disposeBrick);
    if (hero) {
      hero = null;
      face.group.removeFromParent();
      face.hide();
    }
    sunTarget = SUN_DAY;
    showTitle(true);
    strike(title);
    piles.forEach((pile, p) => {
      setPileCount(p, pile.length);
      pile.forEach((id, i) => {
        const brick = makeBrick(id, p, i);
        if (animated && !reducedMotion) {
          brick.y = restY(i) + 7 + i * 1.2;
          brick.delay = p * 0.07 + i * 0.09;
          brick.mesh.position.y = brick.y;
        }
      });
    });
    wake();
  }

  function setSelected(ids) {
    let chosen = -1;
    for (const brick of bricks.values()) {
      const on = ids.includes(brick.id);
      brick.selected = on;
      brick.mesh.material.emissiveIntensity = on ? 0.2 : 0;
      brick.mark.visible = on;
      if (on) chosen = brick.pile;
      if (reducedMotion) {
        brick.z = on ? PULL_OUT : 0;
        brick.mesh.position.z = brick.z;
      }
    }
    counts.forEach((c, p) => {
      c.chosen = p === chosen;
      c.word?.setChosen(c.chosen);
    });
    wake();
  }

  /** Hurl `ids` out of the yard. `heroId`, when given, stays to mock the loser. */
  function removeBricks(ids, heroId = null) {
    const removed = ids.map((id) => bricks.get(id)).filter(Boolean);
    if (!heroId) strike(title);
    removed.forEach((brick, i) => {
      if (brick.id === heroId) return;
      if (reducedMotion) {
        disposeBrick(brick);
        return;
      }
      const side = brick.pile === 1 ? (brick.index % 2 ? 1 : -1) : brick.pile === 0 ? -1 : 1;
      brick.state = 'thrown';
      brick.delay = i * 0.07;
      brick.thrown = {
        vx: (side * (halfWorldW + 1.6)) / 0.72 + (Math.random() - 0.5),
        vy: 5 + Math.random() * 1.2,
        vz: 1 + Math.random() * 1.4,
        rx: 6 + Math.random() * 5,
        ry: 3 + Math.random() * 6,
        rz: side * (5 + Math.random() * 5),
        age: 0,
      };
    });

    // Everything left in the emptied pile drops onto what is beneath it.
    PILE_X.forEach((_, p) => {
      [...bricks.values()]
        .filter((b) => b.pile === p && b.state === 'stacked' && !ids.includes(b.id))
        .sort((a, b) => a.index - b.index)
        .forEach((b, i) => {
          b.index = i;
          if (reducedMotion) {
            b.y = restY(i);
            b.mesh.position.y = b.y;
          }
        });
    });

    if (heroId) {
      hero = bricks.get(heroId);
      hero.state = 'hero';
      hero.from = hero.mesh.position.clone();
      hero.fromRot = hero.mesh.rotation.y;
      heroClock = reducedMotion ? 10 : 0;
      hero.mesh.material.emissiveIntensity = 0;
      hero.mark.visible = false;
      hero.mesh.add(face.group);
      if (reducedMotion) {
        viewShift = stageShift;
        applyView();
        placeHeroStatic();
      }
    }
    wake();
  }

  function placeHeroStatic() {
    hero.mesh.position.set(0, (BRICK.h * HERO_SCALE) / 2, 0.5);
    hero.mesh.rotation.set(0, 0, 0);
    hero.mesh.scale.setScalar(HERO_SCALE);
    face.show(true);
    face.update(0, heroLast, true);
    sun.intensity = sunTarget;
    showTitle(false);
    onTongue?.();
  }

  const sway = new THREE.Vector2();

  function updateHero(dt) {
    heroClock += dt;
    const m = hero.mesh;
    const LAND = 0.62;
    if (heroClock < LAND) {
      const t = heroClock / LAND;
      const eased = t * t * (3 - 2 * t);
      const base = (BRICK.h * THREE.MathUtils.lerp(1, HERO_SCALE, eased)) / 2;
      m.position.x = THREE.MathUtils.lerp(hero.from.x, 0, eased);
      m.position.z = THREE.MathUtils.lerp(hero.from.z, 0.5, eased);
      m.position.y = THREE.MathUtils.lerp(hero.from.y, base, eased) + Math.sin(t * Math.PI) * 1.5;
      m.rotation.y = THREE.MathUtils.lerp(hero.fromRot, 0, eased);
      m.rotation.x = Math.sin(t * Math.PI * 2) * 0.5;
      m.scale.setScalar(THREE.MathUtils.lerp(1, HERO_SCALE, eased));
      return;
    }
    if (!hero.landed) {
      hero.landed = true;
      onThud?.(1.3);
      puff(0, 0.04, 0.5, 26);
      shake = 0.14;
      face.show();
      showTitle(false);
      strike(loser);
    }
    const t = heroClock - LAND;
    const hop = Math.abs(Math.sin(t * 4.6));
    const squash = 1 - 0.13 * (1 - hop) ** 3;
    m.scale.set(HERO_SCALE * (2 - squash), HERO_SCALE * squash, HERO_SCALE);
    const y = (BRICK.h * HERO_SCALE * squash) / 2 + hop * 0.34;
    const rotZ = Math.sin(t * 2.3) * 0.16;
    const rotY = Math.sin(t * 1.5) * 0.3;
    sway.set(rotY - heroLast.x, y - heroLast.y);
    heroLast.set(rotY, y);
    m.position.set(0, y, 0.5);
    m.rotation.set(0, rotY, rotZ);
    if (face.update(dt, sway)) onTongue?.();
  }

  function updateBrick(brick, dt) {
    const m = brick.mesh;
    if (brick.delay > 0) {
      brick.delay -= dt;
      return true;
    }

    if (brick.state === 'thrown') {
      const t = brick.thrown;
      t.age += dt;
      t.vy -= GRAVITY * dt;
      m.position.x += t.vx * dt;
      m.position.y += t.vy * dt;
      m.position.z += t.vz * dt;
      m.rotation.x += t.rx * dt;
      m.rotation.y += t.ry * dt;
      m.rotation.z += t.rz * dt;
      if (t.age > 1.1) disposeBrick(brick);
      return true;
    }

    let moving = false;
    const rest = restY(brick.index);
    if (brick.y > rest + 0.0005 || brick.vy !== 0) {
      moving = true;
      brick.vy -= GRAVITY * dt;
      brick.y += brick.vy * dt;
      if (brick.y <= rest) {
        brick.y = rest;
        const impact = -brick.vy;
        if (impact > 1.1) {
          brick.vy = impact * 0.2;
          onThud?.(Math.min(1, impact / 11));
          if (impact > 2) {
            puff(m.position.x, Math.max(0.05, rest - BRICK.h / 2), 0.1, Math.min(9, Math.round(impact)));
            shake = Math.max(shake, Math.min(0.05, impact * 0.004));
          }
        } else {
          brick.vy = 0;
        }
      }
      m.position.y = brick.y;
    }

    const targetZ = brick.selected ? PULL_OUT : 0;
    if (Math.abs(brick.z - targetZ) > 0.001) {
      moving = true;
      brick.z += (targetZ - brick.z) * (1 - Math.exp(-dt * 20));
      m.position.z = brick.z;
    }
    return moving;
  }

  function updateDust(dt) {
    let alive = false;
    for (let i = 0; i < DUST_COUNT; i++) {
      const s = dustState[i];
      if (s.life <= 0) {
        dustPositions[i * 3 + 1] = -5;
        continue;
      }
      alive = true;
      s.life -= dt;
      s.vx *= 1 - 2.4 * dt;
      s.vz *= 1 - 2.4 * dt;
      s.vy *= 1 - 1.4 * dt;
      dustPositions[i * 3] += s.vx * dt;
      dustPositions[i * 3 + 1] += s.vy * dt;
      dustPositions[i * 3 + 2] += s.vz * dt;
    }
    dustGeometry.attributes.position.needsUpdate = true;
    dust.visible = alive;
    return alive;
  }

  // The loop sleeps whenever nothing moves, so an idle game costs no battery.
  let raf = 0;
  let last = 0;

  function frame(now) {
    raf = 0;
    // Slow devices take bigger steps, so a dropped brick still lands on time.
    const dt = Math.min(0.08, (now - last) / 1000 || 0.016);
    last = now;
    let busy = false;

    for (const brick of [...bricks.values()]) {
      if (brick.state === 'hero') continue;
      if (updateBrick(brick, dt)) busy = true;
    }
    if (hero && !reducedMotion) {
      updateHero(dt);
      busy = true;
    }
    if (updateDust(dt)) busy = true;
    if (title.update(dt)) busy = true;
    if (loser.update(dt)) busy = true;

    const shiftTarget = hero ? stageShift : groundShift;
    if (viewReady && Math.abs(viewShift - shiftTarget) > 0.5) {
      viewShift += (shiftTarget - viewShift) * (1 - Math.exp(-dt * 4));
      applyView();
      busy = true;
    }

    if (Math.abs(sun.intensity - sunTarget) > 0.01) {
      sun.intensity += (sunTarget - sun.intensity) * (1 - Math.exp(-dt * 3));
      busy = true;
    }

    if (shake > 0.001) {
      camera.position.set(
        cameraBase.x + (Math.random() - 0.5) * shake,
        cameraBase.y + (Math.random() - 0.5) * shake,
        cameraBase.z,
      );
      shake *= Math.exp(-dt * 11);
      busy = true;
    } else if (shake !== 0) {
      shake = 0;
      camera.position.copy(cameraBase);
    }

    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    onFrame?.();
    if (busy) wake();
  }

  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  const corner = new THREE.Vector3();
  const box = new THREE.Box3();

  /** Screen rectangle of a brick, used to place its invisible tap target. */
  function brickRect(id) {
    const brick = bricks.get(id);
    if (!brick) return null;
    const m = brick.mesh;
    m.updateWorldMatrix(true, false);
    let l = Infinity;
    let r = -Infinity;
    let t = Infinity;
    let b = -Infinity;
    box.copy(geometry.boundingBox || (geometry.computeBoundingBox(), geometry.boundingBox));
    for (const sx of [box.min.x, box.max.x]) {
      for (const sy of [box.min.y, box.max.y]) {
        // Front face only, so one brick's target doesn't cover the one above.
        corner.set(sx, sy, box.max.z).applyMatrix4(m.matrixWorld).project(camera);
        const px = (corner.x * 0.5 + 0.5) * width;
        const py = (-corner.y * 0.5 + 0.5) * height;
        l = Math.min(l, px);
        r = Math.max(r, px);
        t = Math.min(t, py);
        b = Math.max(b, py);
      }
    }
    return { x: l, y: t, w: r - l, h: b - t };
  }

  /** Screen point just above the top of a pile, for the running total. */
  function pileTop(pile, height) {
    corner.set(PILE_X[pile], restY(Math.max(0, height - 1)) + BRICK.h * 0.5 + 0.34, 0).project(camera);
    return {
      x: (corner.x * 0.5 + 0.5) * width,
      y: (-corner.y * 0.5 + 0.5) * window.innerHeight,
    };
  }

  layout();

  return { layout, newRound, setSelected, removeBricks, setPileCount, brickRect, pileTop, wake };
}

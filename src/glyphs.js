// Stone-and-glass lettering, built live: each glyph is one heavy shape, fractured
// down the middle into rough stone on the left and polished glass on the right,
// with lightning in the break. Style inspired by Frmt_ Alphabet [Rock & Glass]
// by BL/S (CC BY 4.0). No artwork from that set is used here.
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier.js';
import fontData from './glyph-font.json';

const font = new FontLoader().parse(fontData);

function wobble(x, y, z) {
  return (
    Math.sin(x * 17.3 + y * 5.1) * 0.5 +
    Math.sin(y * 23.7 - z * 11.9 + 1.3) * 0.3 +
    Math.sin(z * 31.1 + x * 41.7 + y * 37.3) * 0.2
  );
}

/** Where the fracture runs at height `y`. */
function fractureAt(y, size, seed) {
  return (
    (Math.sin(y * 14 + seed) * 0.05 + Math.sin(y * 37 + seed * 2) * 0.035) * size +
    Math.sin(y * 3 + seed) * 0.04 * size
  );
}

function stoneTexture() {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#b9a88f';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 7000; i++) {
    const shade = Math.random();
    g.fillStyle =
      shade > 0.55
        ? `rgba(60,48,36,${0.1 + Math.random() * 0.35})`
        : `rgba(235,222,200,${0.08 + Math.random() * 0.3})`;
    g.beginPath();
    g.arc(Math.random() * S, Math.random() * S, Math.random() * 3.2 + 0.4, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

/** A dark sky with bright bands for the glass to reflect. */
function glassReflections(renderer) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, '#16345c');
  sky.addColorStop(0.5, '#071426');
  sky.addColorStop(1, '#02050a');
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#ffd9b0';
  g.fillRect(350, 60, 46, 90);
  g.fillStyle = '#bfe4ff';
  g.fillRect(40, 30, 150, 22);
  g.fillRect(230, 150, 30, 60);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(t).texture;
  pmrem.dispose();
  t.dispose();
  return env;
}

export function createGlyphs(renderer) {
  const stone = new THREE.MeshStandardMaterial({
    map: stoneTexture(),
    roughness: 1,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  // The chosen pile's count glows like hot stone.
  const stoneChosen = stone.clone();
  stoneChosen.emissive = new THREE.Color(0xe8935a);
  stoneChosen.emissiveIntensity = 0.55;

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x1f6fff,
    emissive: 0x0a3a8c,
    roughness: 0.06,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMap: glassReflections(renderer),
    envMapIntensity: 2.4,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const boltGlow = new THREE.MeshBasicMaterial({
    color: 0xff9d3c,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const boltCore = boltGlow.clone();
  boltCore.color = new THREE.Color(0xfff2d2);

  const cache = new Map();

  /** Fracture one character into stone and glass, cached by character and size. */
  function glyphGeometry(char, size, depth) {
    const key = `${char}|${size}|${depth}`;
    if (cache.has(key)) return cache.get(key);

    const text = new TextGeometry(char, {
      font,
      size,
      depth,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: depth * 0.16,
      bevelSize: size * 0.018,
      bevelSegments: 2,
    });
    text.computeBoundingBox();
    const box = text.boundingBox;
    const cx = (box.min.x + box.max.x) / 2;
    text.translate(-cx, 0, -depth / 2);

    const fine = new TessellateModifier(size * 0.075, 5).modify(text);
    text.dispose();
    const pos = fine.attributes.position;
    const nor = fine.attributes.normal;
    const uv = fine.attributes.uv;
    const seed = char.charCodeAt(0);

    const stonePos = [];
    const stoneUv = [];
    const glassPos = [];
    const glassNor = [];
    for (let i = 0; i < pos.count; i += 3) {
      const midX = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
      const midY = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
      const isStone = midX < fractureAt(midY, size, seed);
      for (let j = i; j < i + 3; j++) {
        const x = pos.getX(j);
        const y = pos.getY(j);
        const z = pos.getZ(j);
        if (isStone) {
          // Displace by position alone, so shared corners stay joined.
          const amount = size * 0.016;
          stonePos.push(
            x + wobble(x, y, z) * amount,
            y + wobble(y + 2, z, x) * amount,
            z + wobble(z + 5, x, y) * amount,
          );
          stoneUv.push(uv ? x * 0.9 : 0, uv ? y * 0.9 + z * 0.7 : 0);
        } else {
          glassPos.push(x, y, z);
          glassNor.push(nor.getX(j), nor.getY(j), nor.getZ(j));
        }
      }
    }
    fine.dispose();

    const stoneGeo = new THREE.BufferGeometry();
    stoneGeo.setAttribute('position', new THREE.Float32BufferAttribute(stonePos, 3));
    stoneGeo.setAttribute('uv', new THREE.Float32BufferAttribute(stoneUv, 2));
    stoneGeo.computeVertexNormals();
    const glassGeo = new THREE.BufferGeometry();
    glassGeo.setAttribute('position', new THREE.Float32BufferAttribute(glassPos, 3));
    glassGeo.setAttribute('normal', new THREE.Float32BufferAttribute(glassNor, 3));

    const result = {
      stone: stoneGeo,
      glass: glassGeo,
      width: box.max.x - box.min.x,
      height: box.max.y,
      seed,
    };
    cache.set(key, result);
    return result;
  }

  function jaggedBolt(top, bottom, seed, width) {
    const steps = 12;
    const positions = [];
    const indices = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = top + (bottom - top) * t;
      const ends = i === 0 || i === steps ? 0.2 : 1;
      const x = fractureAt(y, 1, seed) * 0.4 + (Math.random() - 0.5) * 0.16 * ends;
      const w = width * (1 - t * 0.5);
      positions.push(x - w, y, 0, x + w, y, 0);
      if (i < steps) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    return geometry;
  }

  /**
   * A word as a group, centred on x = 0 with its baseline at y = 0.
   * `bolts` puts lightning in each glyph's fracture.
   */
  function makeWord(text, { size, depth = size * 0.3, gap = size * 0.14, space = size * 0.4, bolts = false }) {
    const group = new THREE.Group();
    const parts = [];
    const stoneMeshes = [];
    let x = 0;

    for (const char of text) {
      if (char === ' ') {
        x += space;
        continue;
      }
      const geo = glyphGeometry(char, size, depth);
      const glyph = new THREE.Group();
      const rock = new THREE.Mesh(geo.stone, stone);
      rock.castShadow = true;
      const pane = new THREE.Mesh(geo.glass, glass);
      pane.castShadow = true;
      pane.renderOrder = 2;
      glyph.add(rock, pane);
      stoneMeshes.push(rock);
      glyph.position.x = x + geo.width / 2;
      x += geo.width + gap;
      group.add(glyph);

      if (bolts && geo.height > size * 0.4) {
        const glow = new THREE.Mesh(new THREE.BufferGeometry(), boltGlow.clone());
        const core = new THREE.Mesh(new THREE.BufferGeometry(), boltCore.clone());
        glow.position.z = core.position.z = depth / 2 + 0.03;
        glow.renderOrder = core.renderOrder = 3;
        glyph.add(glow, core);
        parts.push({ glow, core, seed: geo.seed, top: geo.height + size * 0.28, bottom: -size * 0.12, size });
      }
    }

    const width = x - gap;
    group.children.forEach((g) => (g.position.x -= width / 2));

    let strikeAge = Infinity;
    let flash = 0;

    function reshape(part) {
      part.glow.geometry.dispose();
      part.core.geometry.dispose();
      const seed = part.seed + Math.random() * 6;
      const base = jaggedBolt(part.top, part.bottom, seed, part.size * 0.05);
      part.glow.geometry = base;
      const core = base.clone();
      const p = core.attributes.position;
      for (let i = 0; i < p.count; i += 2) {
        const mid = (p.getX(i) + p.getX(i + 1)) / 2;
        const half = (p.getX(i + 1) - p.getX(i)) * 0.16;
        p.setX(i, mid - half);
        p.setX(i + 1, mid + half);
      }
      part.core.geometry = core;
    }

    function setBoltLevel(level) {
      for (const part of parts) {
        part.glow.material.opacity = level * 0.55;
        part.core.material.opacity = level;
      }
    }

    parts.forEach(reshape);
    setBoltLevel(0.5);

    return {
      group,
      width,
      /** Lightning flickers through the break for a moment. */
      strike(animated = true) {
        if (!animated || !parts.length) return;
        strikeAge = 0;
        flash = 0;
      },
      setChosen(on) {
        stoneMeshes.forEach((m) => (m.material = on ? stoneChosen : stone));
      },
      /** Advance the flicker; returns true while it is still running. */
      update(dt) {
        if (strikeAge === Infinity) return false;
        strikeAge += dt;
        flash -= dt;
        if (strikeAge > 0.5) {
          strikeAge = Infinity;
          parts.forEach(reshape);
          setBoltLevel(0.5);
          return true;
        }
        if (flash <= 0) {
          flash = 0.05;
          parts.forEach(reshape);
          setBoltLevel(0.55 + Math.random() * 0.75);
        }
        return true;
      },
    };
  }

  return { makeWord };
}

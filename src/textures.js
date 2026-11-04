// Every surface in the yard is painted on a canvas at load, so no raster files ship.
import * as THREE from 'three';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(c, { color = false, repeat = null } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

function speckle(ctx, w, h, count, rMax, colors, rand = Math.random) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h, rand() * rMax + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** One fired clay face: mottled colour, sand grit and a stamped maker's mark. */
export function clayTextures() {
  const W = 1024;
  const H = 512;
  const [mapC, m] = canvas(W, H);
  const [bumpC, b] = canvas(W, H);

  m.fillStyle = '#e7dcd0';
  m.fillRect(0, 0, W, H);
  b.fillStyle = '#909090';
  b.fillRect(0, 0, W, H);

  // Large firing blotches
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 40 + Math.random() * 170;
    const g = m.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() > 0.42;
    const a = 0.1 + Math.random() * 0.22;
    g.addColorStop(0, dark ? `rgba(70,30,18,${a})` : `rgba(255,214,170,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g;
    m.fillRect(x - r, y - r, r * 2, r * 2);
  }
  speckle(m, W, H, 6000, 1.5, ['rgba(44,20,12,.5)', 'rgba(255,226,190,.35)', 'rgba(20,10,8,.42)']);
  speckle(b, W, H, 9000, 2, ['rgba(0,0,0,.55)', 'rgba(255,255,255,.4)', 'rgba(60,60,60,.5)']);

  // Pits and drag marks from the mould
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const len = 12 + Math.random() * 90;
    b.strokeStyle = 'rgba(0,0,0,.45)';
    b.lineWidth = 0.7 + Math.random() * 2;
    b.beginPath();
    b.moveTo(x, y);
    b.lineTo(x + len, y + (Math.random() - 0.5) * 8);
    b.stroke();
  }

  // The stamped frog with the maker's mark
  const fw = 560;
  const fh = 220;
  const fx = (W - fw) / 2;
  const fy = (H - fh) / 2;
  b.fillStyle = 'rgba(0,0,0,.5)';
  b.beginPath();
  b.roundRect(fx, fy, fw, fh, 26);
  b.fill();
  m.fillStyle = 'rgba(50,20,12,.3)';
  m.beginPath();
  m.roundRect(fx, fy, fw, fh, 26);
  m.fill();
  for (const [ctx, style] of [[b, '#e0e0e0'], [m, 'rgba(255,224,190,.42)']]) {
    ctx.fillStyle = style;
    ctx.font = '700 118px "Cabin Sketch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A.R.C.', W / 2, H / 2 + 6);
  }

  return { map: toTexture(mapC, { color: true }), bump: toTexture(bumpC) };
}

/** Soot-blackened wall: courses of brick you can only just make out. */
export function wallTextures() {
  const W = 1024;
  const H = 1024;
  const [mapC, m] = canvas(W, H);
  const [bumpC, b] = canvas(W, H);
  m.fillStyle = '#17120e';
  m.fillRect(0, 0, W, H);
  b.fillStyle = '#404040';
  b.fillRect(0, 0, W, H);

  const rows = 14;
  const bh = H / rows;
  const bw = W / 4;
  for (let r = 0; r < rows; r++) {
    for (let c = -1; c < 5; c++) {
      const x = c * bw + (r % 2 ? bw / 2 : 0);
      const y = r * bh;
      const v = 14 + Math.random() * 15;
      m.fillStyle = `rgb(${v + 6},${v},${v - 4})`;
      m.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      b.fillStyle = `rgb(${150 + Math.random() * 60},${150 + Math.random() * 60},${150 + Math.random() * 60})`;
      b.fillRect(x + 4, y + 4, bw - 8, bh - 8);
    }
  }
  speckle(m, W, H, 7000, 1.6, ['rgba(0,0,0,.5)', 'rgba(120,105,90,.12)']);
  speckle(b, W, H, 7000, 2, ['rgba(0,0,0,.4)', 'rgba(255,255,255,.2)']);
  return {
    map: toTexture(mapC, { color: true, repeat: [3, 2] }),
    bump: toTexture(bumpC, { repeat: [3, 2] }),
  };
}

/** Packed earth and brick dust. */
export function groundTextures() {
  const S = 1024;
  const [mapC, m] = canvas(S, S);
  const [bumpC, b] = canvas(S, S);
  m.fillStyle = '#4a3a2c';
  m.fillRect(0, 0, S, S);
  b.fillStyle = '#808080';
  b.fillRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 30 + Math.random() * 150;
    const g = m.createRadialGradient(x, y, 0, x, y, r);
    const c = ['rgba(120,56,32,.2)', 'rgba(18,14,10,.3)', 'rgba(140,116,90,.14)'][i % 3];
    g.addColorStop(0, c);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g;
    m.fillRect(x - r, y - r, r * 2, r * 2);
  }
  speckle(m, S, S, 15000, 1.8, ['rgba(16,12,8,.55)', 'rgba(180,150,120,.28)', 'rgba(130,60,36,.4)']);
  speckle(b, S, S, 15000, 2.6, ['rgba(0,0,0,.6)', 'rgba(255,255,255,.5)']);
  return {
    map: toTexture(mapC, { color: true, repeat: [4, 4] }),
    bump: toTexture(bumpC, { repeat: [4, 4] }),
  };
}

/** A number chalked on the ground. The canvas is reused when the count changes. */
export function chalkNumber() {
  const [c, ctx] = canvas(256, 256);
  const texture = toTexture(c, { color: true });
  const draw = (value) => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff';
    ctx.font = '400 240px "Patrick Hand", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), 128, 136);
    // Rub some of it out so it reads as chalk dragged across rough ground.
    ctx.globalCompositeOperation = 'destination-out';
    speckle(ctx, 256, 256, 650, 1.2, ['rgba(0,0,0,.9)']);
    ctx.globalCompositeOperation = 'source-over';
    texture.needsUpdate = true;
  };
  return { texture, draw };
}

/** A rough chalk loop scrawled around a chosen brick's face. */
export function chalkMark() {
  const W = 512;
  const H = 220;
  const [c, ctx] = canvas(W, H);
  ctx.strokeStyle = '#ffb27c';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.lineWidth = pass ? 9 : 15;
    ctx.beginPath();
    const inset = 18 + pass * 9;
    const points = [];
    const n = 9;
    const wob = () => (Math.random() - 0.5) * 9;
    for (let i = 0; i <= n; i++) points.push([inset + ((W - inset * 2) * i) / n + wob(), inset + wob()]);
    for (let i = 1; i <= 3; i++) points.push([W - inset + wob(), inset + ((H - inset * 2) * i) / 3 + wob()]);
    for (let i = n - 1; i >= 0; i--) points.push([inset + ((W - inset * 2) * i) / n + wob(), H - inset + wob()]);
    for (let i = 2; i >= 0; i--) points.push([inset + wob(), inset + ((H - inset * 2) * i) / 3 + wob()]);
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'destination-out';
  speckle(ctx, W, H, 2600, 1.3, ['rgba(0,0,0,.95)']);
  ctx.globalCompositeOperation = 'source-over';
  return toTexture(c, { color: true });
}

export function dustSprite() {
  const [c, ctx] = canvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return toTexture(c, { color: true });
}

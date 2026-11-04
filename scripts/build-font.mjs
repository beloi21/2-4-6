// Turns the characters the game shows into a small 3D font file, src/glyph-font.json.
// Run with: node scripts/build-font.mjs
// Source font: Archivo Black, SIL Open Font License.
import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';

const CHARS = '0123456-.ARCLBETOS';
const bytes = readFileSync('node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff');
const font = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));

const glyphs = {};
for (const char of CHARS) {
  const glyph = font.charToGlyph(char);
  const r = Math.round;
  const parts = glyph.path.commands.map((c) => {
    if (c.type === 'M') return `m ${r(c.x)} ${r(c.y)}`;
    if (c.type === 'L') return `l ${r(c.x)} ${r(c.y)}`;
    if (c.type === 'Q') return `q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)}`;
    if (c.type === 'C') return `b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)}`;
    return 'z';
  });
  glyphs[char] = { ha: r(glyph.advanceWidth), x_min: r(glyph.xMin ?? 0), x_max: r(glyph.xMax ?? 0), o: parts.join(' ') };
}

writeFileSync(
  'src/glyph-font.json',
  JSON.stringify({
    familyName: 'Archivo Black',
    resolution: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    boundingBox: { xMin: font.tables.head.xMin, yMin: font.tables.head.yMin, xMax: font.tables.head.xMax, yMax: font.tables.head.yMax },
    underlinePosition: -100,
    underlineThickness: 50,
    glyphs,
  }),
);
console.log(Object.keys(glyphs).join(''), font.unitsPerEm);

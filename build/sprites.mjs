// Sprite sheets for the Haust basemaps: highway shields, the place dot and point-feature icons.
//   node build/sprites.mjs        (after `node styles/build.mjs`; reads colors from the style files)
// Icons are drawn here as SVG on a 15-unit grid and rasterized with headless Chrome at 1x and 2x.
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THEMES = ['topographic', 'canvas', 'atlas', 'dark'];

// Glyphs: white-on-badge pictographs, 15x15 grid. `g` = glyph color, `b` = badge color (for knock-outs).
const GLYPHS = {
  // train, seen head-on: body, windscreen, lamps, rails
  train: (g, b) => `<rect x="4" y="2.2" width="7" height="8.3" rx="1.6" fill="${g}"/>
    <rect x="5.2" y="3.7" width="4.6" height="2.7" rx=".5" fill="${b}"/>
    <circle cx="5.8" cy="8.5" r=".75" fill="${b}"/><circle cx="9.2" cy="8.5" r=".75" fill="${b}"/>
    <path d="M5.3 11.2 4.2 13M9.7 11.2 10.8 13" stroke="${g}" stroke-width="1.1" stroke-linecap="round"/>`,
  airport: g => `<path fill="${g}" d="M7.5 1.6c.6 0 1 .8 1 1.8V6l4.9 3v1.3L8.5 8.8v2.7l1.5 1.1v1l-2.5-.7-2.5.7v-1l1.5-1.1V8.8L1.6 10.3V9l4.9-3V3.4c0-1 .4-1.8 1-1.8z"/>`,
  // boat: funnel, cabin, hull
  ferry: g => `<path fill="${g}" d="M6.8 2.6h1.4v2h2V7.2H4.8V4.6h2zM2.3 8.3h10.4l-1.6 3.9H3.9z"/>`,
  stadium: g => `<ellipse cx="7.5" cy="7.5" rx="5" ry="3.7" fill="none" stroke="${g}" stroke-width="1.5"/>
    <ellipse cx="7.5" cy="7.5" rx="2" ry="1.1" fill="${g}"/>`,
  hospital: g => `<path fill="${g}" d="M6 3h3v3h3v3H9v3H6V9H3V6h3z"/>`,
  school: g => `<path fill="${g}" d="M7.5 3 13.6 5.8 7.5 8.6 1.4 5.8z"/>
    <path fill="${g}" d="M4 7.9v2.3c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5V7.9L7.5 9.6z"/>`,
  museum: g => `<path fill="${g}" d="M7.5 2.4l5.2 3.1v1H2.3v-1zM3.4 7.4H5V11H3.4zM6.7 7.4h1.6V11H6.7zM10 7.4h1.6V11H10zM2.3 11.6h10.4v1.3H2.3z"/>`,
};
// name -> [glyph, badge shape, which theme token colors the badge]
const ICONS = {
  rail: ['train', 'square', 'iconTransit'], metro: ['train', 'round', 'iconTransit'],
  ferry: ['ferry', 'round', 'iconTransit'], airport: ['airport', 'round', 'iconPlace'],
  stadium: ['stadium', 'square', 'iconPlace'], hospital: ['hospital', 'square', 'iconPlace'],
  school: ['school', 'square', 'iconPlace'], museum: ['museum', 'square', 'iconPlace'],
};
const CELL = 20, ICON = 19;   // shields are 20px; icons are a 17px badge inside a 1px ring

function sheet(t) {
  const items = {}; let x = 0; const parts = [];
  const shield = (name, r, fill, stroke, pad) => {
    parts.push(`<rect x="${x + 0.5}" y="0.5" width="19" height="19" rx="${r}" fill="${fill}" stroke="${stroke}"/>`);
    items[name] = { x, y: 0, width: CELL, height: CELL, stretchX: [[pad, CELL - pad]], stretchY: [[pad, CELL - pad]],
      content: [4, 3, 16, 17] };
    x += CELL;
  };
  shield('shield', 3.5, t.shieldFill, t.shieldStroke, 6);        // US and other routes
  shield('shield-i', 4.5, t.shieldI, t.shieldI, 7);              // Interstates: solid
  shield('shield-s', 9.5, t.shieldFill, t.shieldStroke, 9.5);    // state routes: pill
  parts.push(`<circle cx="${x + 6}" cy="6" r="4.25" fill="${t.label}" stroke="${t.halo}" stroke-width="1.5"/>`);
  items.dot = { x, y: 0, width: 12, height: 12 }; x += 12;
  for (const [name, [glyph, shape, token]] of Object.entries(ICONS)) {
    const b = t[token], g = t.iconGlyph;
    parts.push(`<g transform="translate(${x},0)">
      <rect x="0.5" y="0.5" width="18" height="18" rx="${shape === 'round' ? 9 : 4}" fill="${b}" stroke="${t.halo}"/>
      <g transform="translate(2,2)">${GLYPHS[glyph](g, b)}</g></g>`);
    items[name] = { x, y: 0, width: ICON, height: ICON }; x += ICON;
  }
  return { w: x, h: CELL, items,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${CELL}" viewBox="0 0 ${x} ${CELL}">${parts.join('')}</svg>` };
}

fs.mkdirSync(path.join(ROOT, 'sprites'), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const slug of THEMES) {
  const t = JSON.parse(fs.readFileSync(path.join(ROOT, 'styles', `haust-${slug}.json`), 'utf8')).metadata['haust:tokens'];
  const s = sheet(t);
  for (const k of [1, 2]) {
    const pg = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: k });
    await pg.setContent(`<body style="margin:0;background:transparent">${s.svg}</body>`);
    const base = path.join(ROOT, 'sprites', slug + (k === 2 ? '@2x' : ''));
    await pg.screenshot({ path: base + '.png', omitBackground: true, clip: { x: 0, y: 0, width: s.w, height: s.h } });
    await pg.close();
    const json = Object.fromEntries(Object.entries(s.items).map(([n, i]) => [n, {
      x: i.x * k, y: 0, width: i.width * k, height: i.height * k, pixelRatio: k,
      ...(i.stretchX ? { stretchX: i.stretchX.map(r => r.map(v => v * k)), stretchY: i.stretchY.map(r => r.map(v => v * k)),
        content: i.content.map(v => v * k) } : {}) }]));
    fs.writeFileSync(base + '.json', JSON.stringify(json));
  }
  console.log('sprites', slug, Object.keys(s.items).length, 'images');
}
await browser.close();

// Zoom-ladder screenshots of every style. Usage: node build/shots.mjs [outdir] [style,style]
// Needs the viewer running (node web/serve.mjs 8660).
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(process.argv[2] || path.join(HERE, '../shots'));
const STYLES = (process.argv[3] || 'topographic,canvas,atlas,dark').split(',');
export const VIEWS = [
  ['01-region', [-87.9, 41.9], 8.2], ['02-metro', [-87.72, 41.88], 10.5],
  ['02b-city11', [-87.68, 41.9], 11.2], ['03-preserves', [-87.87, 41.68], 11.5], ['03b-city12', [-87.67, 41.91], 12.0], ['04-city', [-87.655, 41.925], 12.5],
  ['05-ohare', [-87.905, 41.977], 13], ['06-suburb', [-88.15, 41.77], 13.6],
  ['07-downtown', [-87.632, 41.884], 14.6], ['08-street', [-87.6553, 41.9484], 16.3],
];
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const style of STYLES) {
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  pg.on('console', m => { if (m.type() === 'error') console.log('  console error:', m.text().slice(0, 300)); });
  await pg.goto(`http://localhost:8660/?style=${style}#10/41.88/-87.63`);
  await pg.waitForFunction('window.map && map.loaded()', null, { timeout: 60000 });
  await pg.addStyleTag({ content: '#bar,#zoom{display:none}' });
  for (const [name, c, z] of VIEWS) {
    await pg.evaluate(([c, z]) => map.jumpTo({ center: c, zoom: z }), [c, z]);
    await pg.waitForFunction('map.loaded() && map.areTilesLoaded() && !map.isMoving()', null, { timeout: 60000 });
    await pg.waitForTimeout(900);
    await pg.screenshot({ path: path.join(OUT, `${style}-${name}-z${z}.png`) });
  }
  await pg.close(); console.log('shot', style);
}
await b.close();

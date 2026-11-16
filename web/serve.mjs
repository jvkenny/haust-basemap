// Static server for the Haust basemaps, with HTTP Range support (PMTiles needs it).
//   node web/serve.mjs [port]
// Env: PORT, BASEMAP_AREA (which tiles/<area>.pmtiles the styles point at; default chicagoland),
//      TILES_DIR (where the .pmtiles live; default ./tiles).
// Styles are served with {base} and {area} filled in, so any MapLibre map can load
//   http://<host>:<port>/styles/haust-topographic.json   (with the pmtiles protocol registered).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +(process.argv[2] || process.env.PORT || 8660);
const AREA = process.env.BASEMAP_AREA || 'chicagoland';
const TILES = path.resolve(process.env.TILES_DIR || path.join(ROOT, 'tiles'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.pbf': 'application/x-protobuf',
  '.pmtiles': 'application/octet-stream', '.svg': 'image/svg+xml' };
const PUBLIC = ['web', 'styles', 'fonts', 'sprites', 'tiles', 'examples'];
http.createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Expose-Headers': 'Content-Range, Content-Length, ETag' };
  let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { p = '/bad'; }
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  if (p === '/healthz') { res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    return res.end(JSON.stringify({ ok: true, area: AREA, tiles: fs.existsSync(path.join(TILES, AREA + '.pmtiles')) })); }
  if (p === '/') p = '/web/index.html';
  if (p === '/catalog.json') p = '/styles/catalog.json';
  const top = p.split('/')[1];
  const file = top === 'tiles' ? path.join(TILES, p.slice('/tiles/'.length)) : path.join(ROOT, p);
  const inside = file.startsWith(top === 'tiles' ? TILES + path.sep : ROOT + path.sep);
  if (!PUBLIC.includes(top) || !inside || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, cors); return res.end('not found');
  }
  const head = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    'Accept-Ranges': 'bytes', 'Cache-Control': top === 'fonts' ? 'max-age=86400' : 'no-cache', ...cors };
  if (top === 'styles' && file.endsWith('.json')) {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const body = fs.readFileSync(file, 'utf8').replaceAll('{base}', `${proto}://${req.headers.host}`).replaceAll('{area}', AREA);
    res.writeHead(200, { ...head, 'Content-Length': Buffer.byteLength(body) }); return res.end(body);
  }
  const size = fs.statSync(file).size;
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  if (m) {
    const start = +m[1], end = m[2] ? Math.min(+m[2], size - 1) : size - 1;
    if (start > end) { res.writeHead(416, { ...cors, 'Content-Range': `bytes */${size}` }); return res.end(); }
    res.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...head, 'Content-Length': size });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '0.0.0.0', () => console.log(`basemap on :${PORT}  area=${AREA}  tiles=${TILES}`));

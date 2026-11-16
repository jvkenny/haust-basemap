// Haust basemap series: one tileset (OpenMapTiles schema), four styles.
//   node styles/build.mjs            -> styles/haust-{topographic,canvas,atlas,dark}.json
//   node build/sprites.mjs           -> sprites/ (shields, dot, point icons) from the tokens in those files
// Every color is a Haust swatch (styles/palette.json) or a stated mix of two.
// Edit this file, never the generated JSON.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const P = JSON.parse(fs.readFileSync(path.join(HERE, 'palette.json'), 'utf8'));
const S = Object.fromEntries(Object.entries(P.swatches).map(([k, v]) => [k, v.hex]));
const B = P.basemap, A = P.atlas, D = P.dark_mode;
const WHITE = '#FFFFFF', BLACK = '#000000';

// ---- color helpers ---------------------------------------------------------
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v)))
  .toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };

// ---- type: serif names the land and water, condensed sans names what people built
const F = {
  serif: ['EB Garamond Regular'], serifI: ['EB Garamond Italic'],
  serifM: ['EB Garamond Medium'], serifMI: ['EB Garamond Medium Italic'],
  serifSB: ['EB Garamond SemiBold'],
  sans: ['Roboto Condensed Regular'], sansB: ['Roboto Condensed Bold'],
  sansI: ['Roboto Condensed Italic'], sansL: ['Roboto Condensed Light'],
};

// ---- themes ----------------------------------------------------------------
// roadLow / mwLow: the single-line color before a class gets its casing.
// minorLow: local streets never go dark on a light ground, or they out-shout the arterials.
const CANVAS_LAND = S.frost;
const THEMES = {
  topographic: {
    name: 'Haust Topographic',
    land: B.land, water: B.water, waterLine: B.water_line, shore: 0,
    park: B.park, wood: B.woodland, farmland: mix(B.land, B.park, 0.35),
    wetland: mix(B.water, B.park, 0.5), sand: mix(B.land, S.birch, 0.16),
    residential: mix(B.land, S.lichen, 0.035), industrial: mix(B.land, S.lichen, 0.1),
    institutional: mix(B.land, S.lichen_rose, 0.12), cemetery: mix(B.park, S.lichen, 0.12),
    airport: mix(B.land, S.lichen, 0.08), runway: mix(B.land, S.lichen, 0.3),
    building: mix(B.land, B.building, 0.62), buildingLine: mix(B.building, S.lichen, 0.18), buildingZoom: 13,
    roadFill: B.road_major, roadCase: mix(B.road_casing, S.lichen, 0.35), roadLow: mix(B.road_casing, S.lichen, 0.45),
    minorLow: mix(B.land, WHITE, 0.6),
    mwFill: mix(WHITE, S.birch, 0.27), mwCase: mix(S.birch, S.umber, 0.45), mwLow: mix(S.birch, S.umber, 0.35),
    majFill: mix(WHITE, S.birch, 0.2),
    path: mix(B.road_casing, B.land, 0.3), rail: mix(S.lichen, B.land, 0.25), transit: S.silfra,
    boundary: B.boundary, label: B.label, labelMuted: S.lichen, labelHood: S.basalt, labelWater: B.label_water,
    labelPark: S.deep_moss, labelRoad: mix(S.basalt, S.lichen, 0.4), halo: B.halo, haloW: 1.4,
    shieldI: S.silfra,
    hill: { shadow: S.silfra, highlight: WHITE, accent: S.basalt, exag: 0.18 },
    density: 1,
  },
  canvas: {
    // Neutral, not blue: the first classes of the fissure and glacial ramps must stay visible on it.
    name: 'Haust Canvas',
    land: CANVAS_LAND, water: mix(S.whitewater, S.overcast, 0.4), waterLine: S.overcast, shore: 0,
    park: mix(CANVAS_LAND, S.lava_moss, 0.1), wood: mix(CANVAS_LAND, S.lava_moss, 0.14), farmland: CANVAS_LAND,
    wetland: mix(S.whitewater, CANVAS_LAND, 0.5), sand: CANVAS_LAND,
    residential: CANVAS_LAND, industrial: mix(CANVAS_LAND, S.lichen, 0.05),
    institutional: mix(CANVAS_LAND, S.lichen, 0.035), cemetery: mix(CANVAS_LAND, S.lava_moss, 0.08),
    airport: mix(CANVAS_LAND, S.lichen, 0.06), runway: mix(S.mist, S.lichen, 0.25),
    building: mix(CANVAS_LAND, S.overcast, 0.09), buildingLine: mix(S.mist, S.overcast, 0.22), buildingZoom: 15,
    roadFill: WHITE, roadCase: mix(S.mist, S.lichen, 0.2), roadLow: mix(S.mist, S.lichen, 0.28),
    minorLow: mix(S.mist, S.lichen, 0.1),
    mwFill: WHITE, mwCase: mix(S.mist, S.lichen, 0.32), mwLow: mix(S.mist, S.lichen, 0.42),
    majFill: WHITE,
    path: mix(S.mist, S.lichen, 0.2), rail: mix(S.mist, S.lichen, 0.3), transit: mix(S.storm, S.lichen, 0.3),
    boundary: mix(S.storm, S.lichen, 0.4), label: S.silfra, labelMuted: S.hengill, labelHood: S.silfra,
    labelWater: S.silfra, labelTransit: S.silfra,
    labelPark: mix(S.silfra, S.deep_moss, 0.4), labelRoad: mix(S.hengill, S.silfra, 0.5), halo: S.frost, haloW: 1.2,
    shieldStroke: mix(S.mist, S.overcast, 0.7), shieldText: S.hengill, shieldI: mix(S.mist, S.overcast, 0.5),
    shieldIText: S.silfra,
    hill: null, density: 0.5,
  },
  atlas: {
    // Inked, like the printed plate: streets are single lines, buildings are outlines.
    name: 'Haust Atlas',
    land: A.land, water: A.water, waterLine: A.water_line, shore: 1,
    shoreColor: mix(A.water_line, A.water, 0.35),
    park: mix(A.land, A.wash_alt, 0.5), wood: mix(A.land, A.wash_alt, 0.7), farmland: A.land,
    wetland: mix(A.water, A.wash_alt, 0.45), sand: mix(A.land, S.birch, 0.12),
    residential: A.land, industrial: mix(A.land, S.lichen, 0.08),
    institutional: mix(A.land, S.lichen_rose, 0.1), cemetery: mix(A.land, A.wash_alt, 0.35),
    airport: mix(A.land, S.lichen, 0.07), runway: mix(A.land, S.lichen, 0.35),
    building: A.land, buildingLine: mix(A.land, S.umber, 0.3), buildingZoom: 14, buildingLineZoom: 14,
    inked: true, ink: mix(A.land, S.umber, 0.5), inkMinor: mix(A.land, S.umber, 0.3),
    roadFill: A.textbox, roadCase: mix(A.land, S.umber, 0.5), roadLow: mix(A.land, S.umber, 0.5),
    minorLow: mix(A.land, S.umber, 0.3),
    mwFill: mix(A.textbox, S.ochre, 0.22), mwCase: mix(S.umber, A.land, 0.25), mwLow: mix(S.umber, A.land, 0.25),
    majFill: A.textbox,
    path: mix(A.land, S.lichen, 0.4), rail: mix(A.border_intl, A.land, 0.4), transit: A.neatline,
    boundary: A.border, label: A.label, labelMuted: A.label_region, labelHood: A.label_region,
    labelWater: A.label_water, labelPark: S.deep_moss, labelRoad: A.label_region, halo: A.land, haloW: 1.3,
    shieldI: A.neatline, hoodScale: 1.12, hoodTrack: 0.2,
    hill: null, density: 0.85,
  },
  dark: {
    name: 'Haust Dark',
    land: D.background, water: mix(D.background, S.silfra_teal, 0.3), waterLine: mix(D.background, S.bruarfoss, 0.4), shore: 0,
    park: mix(D.background, S.deep_moss, 0.38), wood: mix(D.background, S.deep_moss, 0.5), farmland: D.background,
    wetland: mix(D.background, S.silfra_teal, 0.18), sand: mix(D.background, S.ochre, 0.12),
    residential: D.background, industrial: mix(D.background, S.silfra, 0.1),
    institutional: mix(D.background, S.lichen_rose, 0.06), cemetery: mix(D.background, S.deep_moss, 0.25),
    airport: mix(D.background, S.silfra, 0.16), runway: mix(D.background, D.muted, 0.3),
    building: mix(D.background, D.surface, 0.7), buildingLine: mix(D.surface, D.muted, 0.14), buildingZoom: 13,
    roadFill: mix(D.surface, D.muted, 0.3), roadCase: mix(D.background, BLACK, 0.35), roadLow: mix(D.surface, D.muted, 0.3),
    minorLow: mix(D.surface, D.muted, 0.16),
    mwFill: mix(D.surface, S.birch, 0.22), mwCase: mix(D.background, BLACK, 0.4), mwLow: mix(D.surface, S.birch, 0.28),
    majFill: mix(D.surface, D.muted, 0.44),
    path: mix(D.surface, D.muted, 0.3), rail: mix(D.surface, D.muted, 0.3), transit: S.hengill,
    boundary: S.hengill, label: D.text, labelMuted: D.muted, labelHood: D.muted, labelWater: S.meltwater,
    labelTransit: S.storm,
    labelPark: D.categorical[3], labelRoad: D.muted, halo: D.background, haloW: 1.9,
    shieldFill: D.surface, shieldI: S.silfra, shieldIText: D.text,
    hill: { shadow: BLACK, highlight: S.silfra, accent: BLACK, exag: 0.15 },
    density: 0.9,
  },
};
const withDefaults = t => ({
  labelTransit: t.transit, shieldStroke: t.labelMuted, shieldText: t.label,
  shieldFill: mix(t.halo, t.land, 0.3), shieldIText: t.halo, shoreColor: t.waterLine,
  buildingLineZoom: 15, hoodScale: 1, hoodTrack: 0.12,
  iconTransit: t.labelTransit || t.transit, iconPlace: t.labelMuted, iconGlyph: t.halo, ...t });

// ---- expression helpers ----------------------------------------------------
const get = k => ['get', k];
const isIn = (k, vals) => ['match', get(k), vals, true, false];
const zoomW = (stops, mult = 1, base = 1.5) => {
  const e = ['interpolate', ['exponential', base], ['zoom']];
  for (const [z, w] of stops) e.push(z, typeof mult === 'number' ? w * mult : ['*', w, mult]);
  return e;
};
const zoomC = stops => ['interpolate', ['linear'], ['zoom'], ...stops.flat()];
const NAME = ['coalesce', get('name:en'), get('name:latin'), get('name')];
const GREAT_LAKES = ['Lake Michigan', 'Lake Superior', 'Lake Huron', 'Lake Erie', 'Lake Ontario'];

// road groups: [id, class filter, width stops, casing zoom, first zoom drawn]
const ROADS = [
  ['service', isIn('class', ['service', 'track']), [[14, 0.6], [16, 2.5], [18, 7], [20, 16]], 15, 14],
  ['minor', isIn('class', ['minor', 'busway']), [[12, 0.4], [13, 0.9], [14, 1.8], [16, 6], [18, 14], [20, 30]], 13.5, 12],
  ['secondary', isIn('class', ['secondary', 'tertiary']), [[9, 0.3], [11, 0.9], [12, 1.5], [14, 3.2], [16, 8], [18, 18], [20, 36]], 12, 9],
  ['primary', isIn('class', ['trunk', 'primary']), [[7, 0.4], [10, 1.3], [12, 2.4], [14, 4.4], [16, 10], [18, 22], [20, 42]], 12, 6],
  ['motorway', ['==', get('class'), 'motorway'], [[5, 0.5], [8, 1.2], [10, 1.9], [12, 3], [14, 5.5], [16, 12], [18, 26], [20, 48]], 10, 4],
];
const RAMP = ['case', ['==', get('ramp'), 1], 0.6, 1];
const BRUNNEL = {
  tunnel: ['==', get('brunnel'), 'tunnel'],
  road: ['!', isIn('brunnel', ['tunnel', 'bridge'])],
  bridge: ['==', get('brunnel'), 'bridge'],
};

function layers(t) {
  const L = [];
  const add = (id, type, sourceLayer, o = {}) => L.push({
    id, type, ...(sourceLayer ? { source: 'osm', 'source-layer': sourceLayer } : {}), ...o });
  const dense = t.density;

  add('background', 'background', null, { paint: { 'background-color': t.land } });

  // -- ground ---------------------------------------------------------------
  const lu = (id, cls, color, minzoom = 9) => add('landuse-' + id, 'fill', 'landuse', {
    minzoom, filter: isIn('class', cls), paint: { 'fill-color': color, 'fill-antialias': false } });
  if (t.residential !== t.land) lu('residential', ['residential', 'suburb', 'neighbourhood'], t.residential, 8);
  lu('industrial', ['industrial', 'railway', 'quarry', 'garages'], t.industrial);
  lu('institutional', ['hospital', 'school', 'university', 'college', 'kindergarten', 'commercial', 'retail', 'stadium'], t.institutional, 11);
  lu('cemetery', ['cemetery'], t.cemetery, 11);
  const lc = (id, cls, color, minzoom = 5) => add('landcover-' + id, 'fill', 'landcover', {
    minzoom, filter: isIn('class', cls),
    paint: { 'fill-color': color, 'fill-antialias': false, 'fill-opacity': zoomC([[minzoom, 0.55], [10, 1]]) } });
  if (t.farmland !== t.land) lc('farmland', ['farmland'], t.farmland, 8);
  if (t.sand !== t.land) lc('sand', ['sand'], t.sand, 9);
  lc('grass', ['grass'], t.park, 8);
  lc('wood', ['wood'], t.wood, 5);
  lc('wetland', ['wetland'], t.wetland, 8);
  add('park', 'fill', 'park', { minzoom: 6, paint: { 'fill-color': t.park, 'fill-opacity': 0.55, 'fill-antialias': false } });
  lu('pitch', ['pitch', 'playground', 'track'], mix(t.park, t.wood, 0.5), 14);
  add('aeroway-area', 'fill', 'aeroway', { minzoom: 10,
    filter: ['all', ['==', ['geometry-type'], 'Polygon'], isIn('class', ['aerodrome', 'apron', 'helipad'])],
    paint: { 'fill-color': t.airport } });

  // -- relief ---------------------------------------------------------------
  if (t.hill) add('hillshade', 'hillshade', null, { source: 'terrain', paint: {
    'hillshade-illumination-direction': 315, 'hillshade-illumination-anchor': 'map',
    'hillshade-exaggeration': zoomC([[5, t.hill.exag], [12, t.hill.exag], [16, t.hill.exag * 0.45]]),
    'hillshade-shadow-color': t.hill.shadow, 'hillshade-highlight-color': t.hill.highlight,
    'hillshade-accent-color': t.hill.accent } });

  // -- boundaries that the water fill should hide (lake boundaries carry no maritime flag)
  add('boundary-county', 'line', 'boundary', { minzoom: 9,
    filter: ['all', ['==', get('admin_level'), 6], ['!=', get('maritime'), 1]],
    paint: { 'line-color': t.boundary, 'line-opacity': 0.45, 'line-dasharray': [3, 2], 'line-width': 0.7 } });
  add('boundary-state', 'line', 'boundary', { minzoom: 3,
    filter: ['all', ['==', get('admin_level'), 4], ['!=', get('maritime'), 1]],
    paint: { 'line-color': t.boundary, 'line-opacity': 0.7, 'line-dasharray': [5, 2, 1, 2],
      'line-width': zoomW([[3, 0.5], [8, 1], [14, 1.6]]) } });

  // -- water ----------------------------------------------------------------
  add('waterway-tunnel', 'line', 'waterway', { minzoom: 12, filter: BRUNNEL.tunnel,
    paint: { 'line-color': t.waterLine, 'line-opacity': 0.35, 'line-dasharray': [3, 2],
      'line-width': zoomW([[12, 0.6], [16, 2], [20, 8]]) } });
  add('waterway-small', 'line', 'waterway', { minzoom: t.shore ? 9 : 11,
    filter: ['all', isIn('class', ['stream', 'drain', 'ditch']), ['!', BRUNNEL.tunnel]],
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': t.shore ? t.waterLine : t.water, 'line-opacity': t.shore ? 0.7 : 1,
      'line-width': zoomW([[9, 0.3], [13, t.shore ? 0.6 : 0.9], [16, 2], [20, 8]]) } });
  add('waterway-river', 'line', 'waterway', { minzoom: 6,
    filter: ['all', isIn('class', ['river', 'canal']), ['!', BRUNNEL.tunnel]],
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': t.shore ? t.waterLine : t.water,
      'line-width': zoomW([[6, 0.4], [10, t.shore ? 0.8 : 1.2], [13, 2], [16, 5], [20, 18]]) } });
  add('water', 'fill', 'water', { filter: ['!', BRUNNEL.tunnel], paint: { 'fill-color': t.water } });
  // Shoreline fades out before the zooms where split water polygons would show their seams.
  if (t.shore) add('water-shore', 'line', 'water', { minzoom: 4, maxzoom: 13.5, filter: ['!', BRUNNEL.tunnel],
    paint: { 'line-color': t.shoreColor, 'line-opacity': zoomC([[4, 0.6], [11, 0.5], [13.5, 0]]),
      'line-width': zoomW([[4, 0.3], [10, 0.5], [13, 0.7]]) } });

  // -- aeroways, buildings ----------------------------------------------------
  add('aeroway-runway', 'line', 'aeroway', { minzoom: 10,
    filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', get('class'), 'runway']],
    paint: { 'line-color': t.runway, 'line-width': zoomW([[10, 1], [13, 6], [16, 40], [18, 140]], 1, 1.6) } });
  add('aeroway-taxiway', 'line', 'aeroway', { minzoom: 13,
    filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', get('class'), 'taxiway']],
    paint: { 'line-color': t.runway, 'line-width': zoomW([[13, 0.4], [16, 5], [18, 18]]) } });
  if (t.building !== t.land) add('building', 'fill', 'building', { minzoom: t.buildingZoom,
    paint: { 'fill-color': t.building, 'fill-opacity': zoomC([[t.buildingZoom, 0], [t.buildingZoom + 0.6, 1]]) } });
  add('building-line', 'line', 'building', { minzoom: t.buildingLineZoom,
    paint: { 'line-color': t.buildingLine, 'line-width': zoomW([[t.buildingLineZoom, 0.3], [18, 0.8]]),
      'line-opacity': zoomC([[t.buildingLineZoom, 0], [t.buildingLineZoom + 0.5, 1]]) } });

  // Stable insertion points for overlays: map.addLayer(layer, 'haust-below-roads' | 'haust-below-labels').
  add('haust-below-roads', 'background', null, { paint: { 'background-opacity': 0 } });

  // -- transportation: tunnel, ground, bridge -------------------------------
  const FOOT = ['footway', 'steps', 'corridor', 'platform'];
  for (const [pass, bf] of Object.entries(BRUNNEL)) {
    const tun = pass === 'tunnel', br = pass === 'bridge';
    const lineF = extra => ['all', ['==', ['geometry-type'], 'LineString'], bf, extra];
    // OpenMapTiles does not flag sidewalks, so footways wait until street level.
    add(`${pass}-footway`, 'line', 'transportation', { minzoom: 16,
      filter: lineF(['all', ['==', get('class'), 'path'], isIn('subclass', FOOT)]),
      paint: { 'line-color': t.path, 'line-dasharray': [2.5, 1.5],
        'line-opacity': tun ? 0.3 : zoomC([[16, 0], [16.6, 0.7]]), 'line-width': zoomW([[16, 0.6], [20, 3]]) } });
    add(`${pass}-path`, 'line', 'transportation', { minzoom: 14.5,
      filter: lineF(['all', ['==', get('class'), 'path'], ['!', isIn('subclass', FOOT)]]),
      paint: { 'line-color': t.path, 'line-dasharray': [2.5, 1.5], 'line-opacity': tun ? 0.4 : 1,
        'line-width': zoomW([[14, 0.5], [17, 1], [20, 3]]) } });
    add(`${pass}-pier`, 'line', 'transportation', { minzoom: 14, filter: lineF(['==', get('class'), 'pier']),
      paint: { 'line-color': t.land, 'line-width': zoomW([[14, 1], [18, 8]]) } });
    const inkedGroup = id => t.inked && id !== 'motorway';
    for (const [id, f, w, cz] of ROADS) {
      if (inkedGroup(id)) continue;
      add(`${pass}-${id}-case`, 'line', 'transportation', { minzoom: cz - 0.4, filter: lineF(f),
        layout: { 'line-cap': br || tun ? 'butt' : 'round', 'line-join': 'round' },
        paint: { 'line-color': id === 'motorway' ? t.mwCase : t.roadCase,
          'line-opacity': tun ? 0.5 : zoomC([[cz - 0.4, 0], [cz + 0.2, 1]]),
          ...(tun ? { 'line-dasharray': [2, 1] } : {}),
          'line-gap-width': zoomW(w, RAMP),
          'line-width': zoomW([[cz, 0.7], [16, br ? 1.5 : 1.2], [20, br ? 2.4 : 1.8]]) } });
    }
    for (const [id, f, w, cz, lz] of ROADS) {
      const local = id === 'minor' || id === 'service';
      if (inkedGroup(id)) {
        add(`${pass}-${id}`, 'line', 'transportation', { minzoom: lz, filter: lineF(f),
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': local ? t.inkMinor : t.ink, 'line-opacity': tun ? 0.4 : 1,
            'line-width': zoomW(w, ['*', local ? 0.4 : 0.5, RAMP]) } });
        continue;
      }
      const fill = id === 'motorway' ? t.mwFill : id === 'primary' ? t.majFill : t.roadFill;
      const low = id === 'motorway' ? t.mwLow : local ? t.minorLow : t.roadLow;
      add(`${pass}-${id}`, 'line', 'transportation', { minzoom: lz, filter: lineF(f),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': zoomC([[cz - 0.4, low], [cz + 0.2, fill]]),
          'line-opacity': tun ? 0.55 : 1, 'line-width': zoomW(w, RAMP) } });
    }
    add(`${pass}-rail`, 'line', 'transportation', { minzoom: 11, filter: lineF(['==', get('class'), 'rail']),
      paint: { 'line-color': t.rail, 'line-opacity': tun ? 0.35 : zoomC([[11, 0.45], [14, 1]]),
        'line-width': zoomW([[11, 0.5], [13, 0.8], [16, 1.6], [20, 4]]) } });
    add(`${pass}-rail-ties`, 'line', 'transportation', { minzoom: 15.5,
      filter: lineF(['all', ['==', get('class'), 'rail'], ['!', ['has', 'service']]]),
      paint: { 'line-color': t.rail, 'line-opacity': tun ? 0.3 : 0.9, 'line-dasharray': [0.25, 4],
        'line-width': zoomW([[15.5, 3], [20, 10]]) } });
    add(`${pass}-transit`, 'line', 'transportation', { minzoom: 11, filter: lineF(['==', get('class'), 'transit']),
      paint: { 'line-color': t.transit, 'line-opacity': tun ? 0.45 : 0.9,
        ...(tun ? { 'line-dasharray': [3, 1.5] } : {}),
        'line-width': zoomW([[11, 0.5], [14, 1.2], [16, 1.5], [20, 3]]) } });
  }
  add('ferry', 'line', 'transportation', { minzoom: 9, filter: ['==', get('class'), 'ferry'],
    paint: { 'line-color': t.waterLine, 'line-dasharray': [4, 3], 'line-width': 0.8, 'line-opacity': 0.55 } });

  add('boundary-country', 'line', 'boundary', {
    filter: ['all', ['==', get('admin_level'), 2], ['!=', get('maritime'), 1]],
    paint: { 'line-color': t.boundary, 'line-width': zoomW([[2, 0.6], [8, 1.4], [14, 2.2]]) } });

  add('haust-below-labels', 'background', null, { paint: { 'background-opacity': 0 } });

  // -- labels -----------------------------------------------------------------
  const halo = { 'text-halo-color': t.halo, 'text-halo-width': t.haloW, 'text-halo-blur': 0.4 };
  const onWater = { 'text-color': t.labelWater, 'text-halo-color': t.water, 'text-halo-width': 1 };
  const text = (id, sl, o) => add(id, 'symbol', sl, o);

  const waterway = (id, cls, minzoom, size) => text('label-waterway-' + id, 'waterway', { minzoom,
    filter: ['all', isIn('class', cls), ['has', 'name']],
    layout: { 'symbol-placement': 'line', 'text-field': NAME, 'text-font': F.serifI, 'text-size': size,
      'text-letter-spacing': 0.12, 'symbol-spacing': 450, 'text-max-angle': 30 },
    paint: onWater });
  waterway('stream', ['stream', 'drain', 'ditch'], 13, zoomC([[13, 11], [16, 13]]));
  waterway('river', ['river', 'canal'], 11, zoomC([[11, 11.5], [16, 15]]));
  text('label-water-line', 'water_name', {
    filter: ['all', ['==', ['geometry-type'], 'LineString'], ['!', ['match', NAME, GREAT_LAKES, true, false]]],
    layout: { 'symbol-placement': 'line', 'text-field': NAME, 'text-font': F.serifMI,
      'text-size': zoomC([[6, 13], [12, 17]]), 'text-letter-spacing': 0.25, 'symbol-spacing': 600 },
    paint: onWater });
  // At z14 the tiles add every named fountain and pond, so point labels step down there.
  text('label-water', 'water_name', {
    filter: ['all', ['!=', ['geometry-type'], 'LineString'], ['!', ['match', NAME, GREAT_LAKES, true, false]]],
    layout: { 'text-field': NAME, 'text-max-width': 6,
      'text-font': ['step', ['zoom'], ['literal', F.serifMI], 14, ['literal', F.serifI]],
      'text-size': ['interpolate', ['linear'], ['zoom'], 4, 11, 9, ['match', get('class'), ['ocean', 'sea'], 20, 13],
        13.9, ['match', get('class'), ['ocean', 'sea'], 22, 13], 14, 11.5],
      'text-letter-spacing': ['step', ['zoom'], ['match', get('class'), ['ocean', 'sea'], 0.4, 0.2], 14, 0.05],
      'text-transform': ['match', get('class'), ['ocean', 'sea'], 'uppercase', 'none'] },
    paint: onWater });
  // Great Lakes: hand-placed, because the tiles carry one centerline that rarely lands in view.
  add('label-great-lakes', 'symbol', null, { source: 'annot',
    filter: ['all', ['>=', ['zoom'], get('minz')], ['<', ['zoom'], get('maxz')]],
    layout: { 'text-field': get('name'), 'text-font': F.serifMI, 'text-transform': 'uppercase',
      'text-letter-spacing': 0.32, 'text-line-height': 1.35, 'text-max-width': 5,
      'text-size': zoomC([[4, 12], [7, 17], [9, 21], [12, 26]]) },
    paint: onWater });

  text('label-park', 'poi', { minzoom: 12.5,
    filter: ['all', isIn('class', ['park', 'cemetery', 'golf', 'zoo', 'garden']),
      ['<=', get('rank'), ['step', ['zoom'], 3, 14, 10, 15.5, 30]]],
    layout: { 'text-field': NAME, 'text-font': F.serifI, 'text-size': zoomC([[12, 11.5], [16, 14]]),
      'text-max-width': 7, 'text-letter-spacing': 0.05, 'text-padding': 6 },
    paint: { 'text-color': t.labelPark, ...halo } });
  text('label-natural-park', 'park', { minzoom: 8, filter: ['has', 'rank'],
    layout: { 'text-field': NAME, 'text-font': F.serifI, 'text-size': zoomC([[8, 11.5], [14, 15]]),
      'text-max-width': 8, 'text-letter-spacing': 0.08 },
    paint: { 'text-color': t.labelPark, ...halo } });

  // roads: condensed sans along the line (above it on the inked theme)
  const roadName = (id, cls, minzoom, size) => text('label-road-' + id, 'transportation_name', { minzoom,
    filter: ['all', isIn('class', cls), ['has', 'name']],
    layout: { 'symbol-placement': 'line', 'text-field': NAME, 'text-font': F.sans, 'text-size': size,
      'text-letter-spacing': 0.04, 'symbol-spacing': 350, 'text-max-angle': 30,
      ...(t.inked && id !== 'motorway' ? { 'text-offset': [0, -0.75] } : {}),
      'text-pitch-alignment': 'viewport' },
    paint: { 'text-color': t.labelRoad, ...halo } });
  roadName('minor', ['minor', 'service', 'track', 'path'], dense < 0.7 ? 16 : 15, zoomC([[15, 10.5], [18, 13]]));
  roadName('secondary', ['secondary', 'tertiary'], dense < 0.7 ? 14.5 : 12.3, zoomC([[12.3, 10.5], [18, 14]]));
  roadName('primary', ['trunk', 'primary'], dense < 0.7 ? 13 : 12, zoomC([[12, 11], [18, 15]]));
  roadName('motorway', ['motorway'], 12, zoomC([[12, 11], [18, 15]]));
  const REF = ['case', ['==', ['slice', get('ref'), 0, 2], 'I '], ['slice', get('ref'), 2], get('ref')];
  text('label-shield', 'transportation_name', { minzoom: 7,
    filter: ['all', ['has', 'ref'], ['<=', get('ref_length'), 6],
      ['step', ['zoom'], ['==', get('class'), 'motorway'], 10, isIn('class', ['motorway', 'trunk', 'primary']),
        13, isIn('class', ['motorway', 'trunk', 'primary', 'secondary'])]],
    layout: { 'symbol-placement': 'line', 'symbol-spacing': zoomC([[7, 220], [12, 600], [16, 900]]),
      'text-field': REF, 'text-font': F.sansB, 'text-size': 10.5, 'text-letter-spacing': 0.03,
      'text-rotation-alignment': 'viewport', 'text-pitch-alignment': 'viewport',
      'icon-image': ['match', get('network'), 'us-interstate', 'shield-i', 'us-state', 'shield-s', 'shield'],
      'icon-text-fit': 'both', 'icon-text-fit-padding': [2, 4.5, 1.5, 4.5],
      'icon-rotation-alignment': 'viewport', 'text-padding': 12 },
    paint: { 'text-color': ['match', get('network'), 'us-interstate', t.shieldIText, t.shieldText] } });

  // stations, airports, landmarks
  // Point features carry a pictograph badge: square = railway station, round = rapid transit.
  const below = { 'text-anchor': 'top', 'text-offset': [0, 0.85], 'text-optional': true, 'icon-padding': 1 };
  text('label-station', 'poi', { minzoom: dense < 0.7 ? 14 : 12.5,
    filter: ['all', ['==', get('class'), 'railway'], isIn('subclass', ['station', 'halt', 'subway', 'tram_stop'])],
    layout: { 'text-field': ['step', ['zoom'], '', dense < 0.7 ? 15 : 13.5, NAME], 'text-font': F.sansB,
      'text-size': zoomC([[13, 10], [17, 12.5]]), ...below,
      'icon-image': ['match', get('subclass'), ['subway', 'tram_stop'], 'metro', 'rail'],
      'icon-size': zoomC([[12.5, 0.6], [14, 0.8], [16, 1]]),
      'symbol-sort-key': ['match', get('subclass'), ['subway', 'tram_stop'], 2, 1],
      'text-max-width': 7, 'text-padding': 3 },
    paint: { 'text-color': t.labelTransit, ...halo } });
  text('label-ferry', 'poi', { minzoom: 15.5, filter: ['==', get('class'), 'ferry_terminal'],
    layout: { 'text-field': ['step', ['zoom'], '', 16.5, NAME], 'text-font': F.sansB, 'text-size': 10.5, ...below,
      'icon-image': 'ferry', 'icon-size': 0.85, 'text-max-width': 7 },
    paint: { 'text-color': t.labelTransit, ...halo } });
  text('label-airport', 'aerodrome_label', { minzoom: 8, filter: ['has', 'iata'],
    layout: { 'text-field': ['step', ['zoom'], get('iata'), 11, NAME], 'text-font': F.sansB,
      'text-size': zoomC([[9, 11], [14, 13.5]]), 'text-max-width': 8, ...below, 'text-optional': false,
      'icon-image': 'airport', 'icon-size': zoomC([[8, 0.8], [12, 1]]) },
    paint: { 'text-color': t.labelMuted, ...halo } });
  const LANDMARK = ['stadium', 'museum', 'attraction', 'college', 'university', 'hospital', 'town_hall'];
  const ICON = ['match', get('class'), 'stadium', 'stadium', 'hospital', 'hospital',
    ['college', 'university'], 'school', 'museum'];
  text('label-landmark', 'poi', { minzoom: dense < 0.7 ? 15.5 : 13.5,
    filter: ['all', isIn('class', LANDMARK), ['<=', get('rank'), ['step', ['zoom'], 2, 14, 4, 15, 12, 16, 40]],
      // the hospital class also holds clinics and doctors' offices
      ['any', ['!=', get('class'), 'hospital'], ['==', get('subclass'), 'hospital']]],
    layout: { 'text-field': NAME, 'text-font': F.sansB, 'text-size': zoomC([[14, 11.5], [17, 13]]),
      'text-max-width': 7, 'text-padding': 6, ...below, 'text-optional': false,
      'icon-image': ICON, 'icon-size': zoomC([[13.5, 0.75], [16, 1]]) },
    paint: { 'text-color': t.labelMuted, ...halo } });
  const QUIET_POI = ['park', 'cemetery', 'golf', 'zoo', 'garden', 'railway', 'bus', 'parking', 'bicycle_parking',
    'shop', 'grocery', 'fast_food', 'clothing_store', 'alcohol_shop', 'laundry', ...LANDMARK];
  if (dense >= 0.85) text('label-poi', 'poi', { minzoom: 16,
    filter: ['all', ['!', isIn('class', QUIET_POI)], ['<=', get('rank'), ['step', ['zoom'], 6, 17, 20, 18, 80]]],
    layout: { 'text-field': NAME, 'text-font': F.sans, 'text-size': 11, 'text-max-width': 7, 'text-padding': 8 },
    paint: { 'text-color': t.labelMuted, ...halo } });

  // places: neighborhoods are regions (serif, tracked caps) in two tiers; towns are settlements (sans)
  const hs = t.hoodScale;
  text('label-neighbourhood', 'place', { minzoom: 13, maxzoom: 17,
    filter: isIn('class', ['quarter', 'neighbourhood']),
    layout: { 'text-field': NAME, 'text-font': F.serifSB, 'text-transform': 'uppercase',
      'text-letter-spacing': t.hoodTrack, 'text-size': zoomC([[13, 11 * hs], [16, 13.5 * hs]]), 'text-max-width': 7,
      'symbol-sort-key': get('rank'), 'text-padding': 4 },
    paint: { 'text-color': t.labelMuted, ...halo } });
  text('label-community', 'place', { minzoom: 10.8, maxzoom: 16, filter: ['==', get('class'), 'suburb'],
    layout: { 'text-field': NAME, 'text-font': F.serifSB, 'text-transform': 'uppercase',
      'text-letter-spacing': t.hoodTrack, 'text-max-width': 6.5, 'text-line-height': 1.1,
      'text-size': zoomC([[11, 12 * hs], [13, 14.5 * hs], [15, 17 * hs]]),
      'symbol-sort-key': get('rank'), 'text-padding': 4 },
    paint: { 'text-color': t.labelHood, ...halo } });
  text('label-village', 'place', { minzoom: 10, maxzoom: 16,
    filter: isIn('class', ['village', 'hamlet', 'isolated_dwelling']),
    layout: { 'text-field': NAME, 'text-font': F.sans, 'text-size': zoomC([[10, 11], [15, 14]]),
      'text-max-width': 7, 'symbol-sort-key': get('rank') },
    paint: { 'text-color': t.label, ...halo } });
  const BIG = ['<=', ['coalesce', get('rank'), 99], 8], bump = ['case', BIG, 1.5, 0];
  text('label-town', 'place', { minzoom: 7, maxzoom: 15, filter: ['==', get('class'), 'town'],
    layout: { 'text-field': NAME, 'text-font': ['case', BIG, ['literal', F.sansB], ['literal', F.sans]],
      'text-size': ['interpolate', ['linear'], ['zoom'], 7, ['+', 11, bump], 11, ['+', 13, bump], 14, ['+', 17, bump]],
      'text-max-width': 7, 'symbol-sort-key': get('rank'),
      'icon-image': ['step', ['zoom'], 'dot', 10, ''], 'icon-size': 0.5,
      'text-variable-anchor': ['step', ['zoom'], ['literal', ['bottom-left', 'top-left', 'bottom-right', 'top-right']], 10, ['literal', ['center']]],
      'text-radial-offset': ['step', ['zoom'], 0.35, 10, 0], 'text-padding': 4 },
    paint: { 'text-color': t.label, ...halo } });
  // States sit under cities in the stack, so a major city wins its spot before the state name does.
  text('label-state', 'place', { minzoom: 3, maxzoom: 9, filter: ['==', get('class'), 'state'],
    layout: { 'text-field': NAME, 'text-font': F.serif, 'text-transform': 'uppercase',
      'text-letter-spacing': 0.3, 'text-size': zoomC([[3, 10], [8, 17]]), 'text-max-width': 6 },
    paint: { 'text-color': t.labelMuted, 'text-opacity': 0.8, ...halo } });
  text('label-city', 'place', { minzoom: 3, maxzoom: 14, filter: ['==', get('class'), 'city'],
    layout: { 'text-field': NAME, 'text-font': F.sansB,
      'text-size': ['interpolate', ['linear'], ['zoom'], 3, ['step', get('rank'), 13, 4, 11], 8, ['step', get('rank'), 18, 4, 15, 8, 13], 13, ['step', get('rank'), 26, 4, 21, 8, 18]],
      'text-max-width': 7, 'symbol-sort-key': get('rank'), 'text-letter-spacing': 0.02,
      'icon-image': ['step', ['zoom'], 'dot', 9, ''], 'icon-size': 0.7,
      'text-variable-anchor': ['step', ['zoom'], ['literal', ['bottom-left', 'top-left', 'bottom-right', 'top-right']], 9, ['literal', ['center']]],
      'text-radial-offset': ['step', ['zoom'], 0.4, 9, 0], 'text-padding': 4 },
    paint: { 'text-color': t.label, ...halo, 'text-halo-width': t.haloW + 0.3 } });
  text('label-country', 'place', { maxzoom: 7, filter: ['==', get('class'), 'country'],
    layout: { 'text-field': NAME, 'text-font': F.serifSB, 'text-transform': 'uppercase',
      'text-letter-spacing': 0.25, 'text-size': zoomC([[1, 10], [6, 18]]), 'text-max-width': 6 },
    paint: { 'text-color': t.label, ...halo } });
  return L;
}

// Hand-placed labels for the Great Lakes: [name, lon, lat, from zoom, to zoom).
const LAKE_LABELS = [
  ['Lake\nMichigan', -87.0, 43.9, 4, 7.5], ['Lake\nMichigan', -87.15, 42.35, 7.5, 9.6],
  ['Lake\nMichigan', -87.38, 41.98, 9.6, 12.2],
  ['Lake Superior', -87.6, 47.7, 4, 9], ['Lake\nHuron', -82.4, 44.8, 4, 9],
  ['Lake Erie', -81.2, 42.2, 4.5, 9], ['Lake Ontario', -77.8, 43.65, 4.5, 9],
];

// ---- emit styles -----------------------------------------------------------
// {base} and {area} are filled in by web/serve.mjs when it serves the style.
const TILES = process.env.BASEMAP_TILES || 'pmtiles://{base}/tiles/{area}.pmtiles';
const ASSETS = process.env.BASEMAP_ASSETS || '{base}';
for (const [slug, raw] of Object.entries(THEMES)) {
  const t = withDefaults(raw);
  const style = {
    version: 8, name: t.name,
    metadata: { 'haust:theme': slug, 'haust:palette': `${P.name} v${P.version}`, 'haust:tokens': t },
    center: [-87.63, 41.88], zoom: 11,
    glyphs: `${ASSETS}/fonts/{fontstack}/{range}.pbf`,
    sprite: `${ASSETS}/sprites/${slug}`,
    sources: {
      osm: { type: 'vector', url: TILES,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://openmaptiles.org/">OpenMapTiles</a>' },
      annot: { type: 'geojson', data: { type: 'FeatureCollection', features: LAKE_LABELS.map(
        ([name, x, y, minz, maxz]) => ({ type: 'Feature', properties: { name, minz, maxz },
          geometry: { type: 'Point', coordinates: [x, y] } })) } },
      ...(t.hill ? { terrain: { type: 'raster-dem', encoding: 'terrarium', tileSize: 256, maxzoom: 14,
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        attribution: 'Terrain © Mapzen' } } : {}),
    },
    layers: layers(t),
  };
  fs.writeFileSync(path.join(HERE, `haust-${slug}.json`), JSON.stringify(style, null, 1));
  console.log(`haust-${slug}.json  ${style.layers.length} layers`);
}
// ---- catalog: what an agent or a script needs to pick and load a style ------
const USE = {
  topographic: 'General reference map. Use when the basemap itself is the content or no other choice is stated.',
  canvas: 'Quiet neutral ground. Use under thematic overlays: choropleths, dot maps, heat maps, routes.',
  atlas: 'Printed historical-atlas look. Use for narrative and historical maps with a few routes or points on top.',
  dark: 'Dark ground. Use for dashboards, live desks and anything shown on a dark page.',
};
fs.writeFileSync(path.join(HERE, 'catalog.json'), JSON.stringify({
  name: 'Haust Basemaps', schema: 'OpenMapTiles', tiles: TILES, area: '{area}',
  requires: 'MapLibre GL JS with the PMTiles protocol registered (pmtiles >= 3)',
  attribution: '© OpenStreetMap contributors · © OpenMapTiles',
  styles: Object.fromEntries(Object.entries(THEMES).map(([slug, raw]) => {
    const t = withDefaults(raw);
    return [slug, { name: t.name, url: `${ASSETS}/styles/haust-${slug}.json`, use: USE[slug],
      scheme: slug === 'dark' ? 'dark' : 'light', hillshade: !!t.hill,
      colors: { land: t.land, water: t.water, label: t.label, halo: t.halo } }];
  })),
  anchors: {
    'haust-below-roads': 'Insert area overlays (choropleths, washes, rasters) here: above land, water and buildings, below roads and labels.',
    'haust-below-labels': 'Insert line and point overlays here: above roads, below every label.',
  },
  sprites: ['shield', 'shield-i', 'shield-s', 'dot', 'rail', 'metro', 'ferry', 'airport', 'stadium', 'hospital', 'school', 'museum'],
  fonts: Object.values(F).flat(),
}, null, 1));
console.log('styles ok — run `node build/sprites.mjs` if theme colors changed');

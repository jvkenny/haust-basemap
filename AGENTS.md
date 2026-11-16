# Haust Basemaps — notes for agents

Four MapLibre GL styles over one PMTiles tileset (OpenMapTiles schema). You are most likely
here to either **use** a basemap in a map you are building, or **change** how the basemaps look.

## Using a basemap

Everything you need is in `GET <host>/catalog.json`: style URLs, what each style is for, the
overlay anchors, sprite names and font stacks. `<host>` is wherever `web/serve.mjs` runs.

```js
maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile);          // once per page
const map = new maplibregl.Map({ container: 'map', style: `${HOST}/styles/haust-canvas.json` });
map.on('load', () => {
  map.addLayer(myFillLayer, 'haust-below-roads');    // areas: under roads and labels
  map.addLayer(myLineLayer, 'haust-below-labels');   // lines and points: under labels only
});
```

Pick the style by job, not taste:

| Style | Use it when |
|---|---|
| `canvas` | you are putting data on top (choropleth, dots, routes). The default for thematic maps. |
| `topographic` | the basemap is the content, or nothing else is specified. |
| `atlas` | a narrative or historical map with a few routes or places on top. |
| `dark` | the page is dark: dashboards, live desks. |

Rules that keep maps built on these correct:

- Always pass an anchor as the second argument to `addLayer`. Without it your layer covers the labels.
- `haust-below-roads` and `haust-below-labels` exist in every style and will not be renamed.
  Do not anchor to any other layer id; the rest may change.
- Keep the attribution control. Maps must credit "© OpenStreetMap contributors © OpenMapTiles".
- Tiles stop at zoom 14 and overzoom above that; the area covered is whatever `<host>/healthz` reports.
- A working page to copy from: `examples/overlay.html`.
- Overlay colors: the styles are built from the Haust palette (`styles/palette.json`). Its
  categorical and sequential ramps are designed to read on these grounds.

## Changing the basemaps

- **Edit `styles/build.mjs`, never `styles/haust-*.json`** (generated). Then `node styles/build.mjs`.
- Colors live in `THEMES` as palette swatches or `mix(a, b, t)` of two. Do not add raw hex.
- Road widths and the zoom where each class gets its casing live in `ROADS`.
- Icons and shields are SVG in `build/sprites.mjs`; run it after changing theme colors or glyphs.
- Type: EB Garamond names land and water, Roboto Condensed names what people built. Two families only.
- Check your change: `node web/serve.mjs 8660` then `node build/shots.mjs shots/check` renders
  ten views of every style. Look at the zooms between 11 and 14, where road hierarchy is fragile.
- Tiles: `build/build_tiles.sh <area>` (small areas, macOS) or `build/remote/build_area.sh <area>`
  (large areas, Linux build host; needs about 20 GB of heap for a continent).

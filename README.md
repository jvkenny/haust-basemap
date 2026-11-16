# Haust Basemaps

Four vector basemaps drawn from one tileset, in the Haust palette.

| Style | For |
|---|---|
| **Topographic** | General reference map |
| **Canvas** | A quiet ground under thematic overlays |
| **Atlas** | The printed historical-atlas look: cream land, pale water, thin hydrography |
| **Dark** | Dashboards and live desks |

The styles are MapLibre GL style JSON over tiles in the OpenMapTiles schema, built from
OpenStreetMap with Planetiler and stored as PMTiles.

## Use one

Run the server next to a tileset, then point any MapLibre map at a style:

```bash
node web/serve.mjs 8660        # serves styles, fonts, sprites and tiles/<area>.pmtiles
```

```js
maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile);
new maplibregl.Map({ container: 'map', style: 'http://localhost:8660/styles/haust-canvas.json' });
```

- `/catalog.json` lists the styles, what each is for, and the two overlay anchors
  (`haust-below-roads`, `haust-below-labels`).
- `examples/overlay.html` is a complete page with data placed under the labels.
- `AGENTS.md` is the short version of all this for coding agents.

## Layout

```
styles/build.mjs      generator: palette + theme tokens -> styles/haust-*.json, catalog.json
styles/palette.json   the Haust palette (source of truth for every color)
build/sprites.mjs     shields, place dot and point icons (SVG -> sprites/)
fonts/                SDF glyphs: EB Garamond (land and water), Roboto Condensed (what people built)
tiles/                <area>.pmtiles (not in git)
build/build_tiles.sh  Planetiler build for a small area (macOS)
build/remote/         Planetiler build for a continent on a Linux host
build/glyphs.js       TTF -> glyph PBFs
build/shots.mjs       ten screenshots of every style, for review
web/                  viewer and a static server with HTTP Range support
examples/             minimal pages to copy from
```

## Build

```bash
build/build_tiles.sh chicagoland     # tiles/chicagoland.pmtiles (edit the script's source paths for your area)
node styles/build.mjs                # the four style files and the catalog
node build/sprites.mjs               # sprites (needs Chrome; only after color or icon changes)
node web/serve.mjs 8660              # http://localhost:8660
```

`build/build_tiles.sh check us` reports the disk a larger build needs before starting it.
Edit `styles/build.mjs`, never the generated `haust-*.json`. No tiles are hosted publicly;
build your own from OpenStreetMap with the scripts here.

## Design rules

- Serif names the land and water. Condensed sans names what people built.
- Large areas stay quiet; saturated color is left for whatever you put on top.
- Every color is a Haust swatch or a stated mix of two.

## Credits and licenses

- Map data © OpenStreetMap contributors, ODbL.
- Tile schema © OpenMapTiles, CC-BY 4.0. Maps made with these tiles must credit
  "© OpenMapTiles © OpenStreetMap contributors".
- Tiles built with Planetiler (Apache-2.0).
- EB Garamond (SIL OFL 1.1), Roboto Condensed (Apache-2.0); see `fonts/LICENSES.md`.
- Terrain: Mapzen / AWS Terrain Tiles.
- Code and styles in this repository: MIT, see LICENSE.

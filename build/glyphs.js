// TTF -> MapLibre SDF glyph PBFs. Usage: node glyphs.js
const fontnik = require('fontnik'), fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'fontsrc'), OUT = path.join(__dirname, '..', 'fonts');
const FONTS = {
  'EB Garamond Regular': 'EBGaramond-Regular.ttf',
  'EB Garamond Italic': 'EBGaramond-Italic.ttf',
  'EB Garamond Medium': 'EBGaramond-Medium.ttf',
  'EB Garamond Medium Italic': 'EBGaramond-MediumItalic.ttf',
  'EB Garamond SemiBold': 'EBGaramond-SemiBold.ttf',
  'Roboto Condensed Regular': 'RobotoCondensed-Regular.ttf',
  'Roboto Condensed Bold': 'RobotoCondensed-Bold.ttf',
  'Roboto Condensed Italic': 'RobotoCondensed-Italic.ttf',
  'Roboto Condensed Light': 'RobotoCondensed-Light.ttf',
};
const range = (font, start) => new Promise((res, rej) =>
  fontnik.range({ font, start, end: start + 255 }, (e, d) => e ? rej(e) : res(d)));
(async () => {
  for (const [name, file] of Object.entries(FONTS)) {
    const font = fs.readFileSync(path.join(SRC, file));
    const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    for (let s = 0; s < 65536; s += 256)
      fs.writeFileSync(path.join(dir, `${s}-${s + 255}.pbf`), await range(font, s));
    console.log('ok', name);
  }
})();

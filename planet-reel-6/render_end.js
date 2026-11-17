// node render_end.js <outdir>  — renders 50 end-card frames (2s @25fps)
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const fs = require('fs'), path = require('path');
  await p.goto('file://' + path.resolve(__dirname, 'end.html'));
  const svg = fs.readFileSync(path.resolve(__dirname, 'assets/p.svg'), 'utf8');
  await p.evaluate(s => { document.getElementById('logo').innerHTML = s; }, svg);
  await p.evaluate(() => document.fonts.ready);
  for (let k = 0; k < 50; k++) {
    await p.evaluate(t => render(t), k / 25);
    await p.screenshot({ path: `${out}/e${String(k).padStart(3, '0')}.png` });
  }
  await b.close();
})();

// node render_end.js <outdir>  — renders 50 end-card frames (2s @25fps)
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://127.0.0.1:8765/end.html');
  await p.waitForFunction('window.READY===1');
  await p.evaluate(() => document.fonts.ready);
  for (let k = 0; k < 50; k++) {
    await p.evaluate(t => render(t), k / 25);
    await p.screenshot({ path: `${out}/e${String(k).padStart(3, '0')}.png` });
  }
  await b.close();
})();

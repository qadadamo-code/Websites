// usage: node render.js out_dir fps start end [worker nworkers] | node render.js out_dir --times 1,2,3
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  let times = [];
  if (process.argv[3] === '--times') times = process.argv[4].split(',').map(Number).map((t, i) => [t, 't' + t.toFixed(2)]);
  else {
    const fps = +process.argv[3], s = +process.argv[4], e = +process.argv[5], w = +(process.argv[6] || 0), nw = +(process.argv[7] || 1);
    const n0 = Math.round(s * fps), n1 = Math.round(e * fps);
    for (let n = n0; n < n1; n++) if (n % nw === w) times.push([n / fps, String(n).padStart(5, '0')]);
  }
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  pg.setDefaultTimeout(300000);
  await pg.goto('file://' + path.resolve(__dirname, 'index.html'));
  await pg.evaluate(() => window.ready);
  for (const [t, name] of times) {
    await pg.evaluate(t => window.renderAt(t), t);
    await pg.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 93 });
  }
  await b.close();
})();

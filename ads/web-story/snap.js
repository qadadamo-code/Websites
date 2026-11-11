const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => document.fonts.ready);
  const ts = process.argv.slice(2).map(Number);
  for (const t of ts) { await p.evaluate(t => render(t), t); await p.screenshot({ path: `/tmp/snap/f${t}.jpg`, type: 'jpeg', quality: 70 }); }
  await b.close();
})();

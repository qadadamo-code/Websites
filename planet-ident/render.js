// usage: node render.js out_dir [start end step] [w h]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [,, out = 'frames', a = '0', b = '15', step = String(1/30), w = '1920', h = '1080', port='8765'] = process.argv;
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(+port);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await br.newPage({ viewport: { width: +w, height: +h } });
  pg.on('console', (m) => console.log('PAGE', m.text())); pg.on('pageerror', (e) => console.log('ERR', e.message));
  await pg.goto(`http://localhost:${port}/index.html?w=${w}&h=${h}`);
  await pg.waitForFunction(() => window.ready).catch(()=>{});
  await pg.evaluate(() => window.ready);
  const times = [];
  if (a.includes(',')) a.split(',').forEach((x) => times.push(+x)); else for (let t = +a; t < +b - 1e-6; t += +step) times.push(t);
  for (const t of times) {
    const t0 = Date.now();
    const data = await pg.evaluate((t) => { window.renderAt(t); return document.querySelector('canvas').toDataURL('image/jpeg', 0.94); }, t);
    const fi = Math.round(t * 30);
    fs.writeFileSync(path.join(out, `f${String(fi).padStart(4, '0')}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
    if (times.length < 30) console.log('t', t.toFixed(2), Date.now() - t0, 'ms');
  }
  await br.close(); srv.close();
})();

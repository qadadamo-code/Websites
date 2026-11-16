// usage: node render.js out_dir start end [fps]   or   node render.js out_dir t1,t2,...
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [,, out = 'frames', a = '0', b = '46', fps = '30', port = '8771'] = process.argv;
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(+port);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch();
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', (e) => console.log('ERR', e.message));
  await pg.goto(`http://localhost:${port}/index.html`);
  await pg.waitForFunction(() => window.ready); await pg.waitForTimeout(800);
  const times = [];
  if (a.includes(',') || b === 'x') a.split(',').forEach((x) => times.push(+x)); else { const n = Math.round((+b - +a) * +fps); for (let i = 0; i < n; i++) times.push(+a + i / +fps); }
  for (const t of times) {
    await pg.evaluate((t) => window.renderAt(t), t);
    const name = b === 'x' || a.includes(',') ? `t${t.toFixed(2)}.jpg` : `f${String(Math.round(t * +fps)).padStart(5, '0')}.jpg`;
    await pg.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 92 });
  }
  await br.close(); srv.close();
})();

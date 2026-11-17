// node render.js out start end fps port   |  node render.js out t1,t2 x
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [,, out = 'frames', a = '0', b = '13', fps = '60', port = '8791'] = process.argv;
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(+port);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.setDefaultTimeout(300000); pg.on('pageerror', (e) => console.log('ERR', e.message)); pg.on('console', (m) => console.log('LOG', m.text()));
  await pg.goto(`http://localhost:${port}/index.html`);
  await pg.waitForFunction(() => window.ready, null, { timeout: 120000 }); await pg.waitForTimeout(500);
  const times = []; const still = b === 'x';
  if (still) a.split(',').forEach((x) => times.push(+x)); else { const i0 = Math.round(+a * +fps), i1 = Math.round(+b * +fps); for (let i = i0; i < i1; i++) times.push(i / +fps); }
  for (const t of times) {
    await pg.evaluate((t) => window.renderAt(t), t);
    const name = still ? `t${t.toFixed(2)}.jpg` : `f${String(Math.round(t * +fps)).padStart(5, '0')}.png`;
    await pg.screenshot({ path: path.join(out, name), type: still ? 'jpeg' : 'png', ...(still ? { quality: 85 } : {}) });
  }
  await br.close(); srv.close();
})();

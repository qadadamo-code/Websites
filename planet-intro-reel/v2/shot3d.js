const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8791);
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', (m) => console.log(m.text())); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('http://localhost:8791/p3d.html'); await p.waitForFunction(() => window.done, null, { timeout: 120000 });
  await p.screenshot({ path: 'assets/p3d.png' }); await b.close(); srv.close(); })();

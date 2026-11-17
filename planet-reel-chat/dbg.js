const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.argv[2];
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.end(d); }); }).listen(8790);
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
 await pg.goto('http://localhost:8790/index.html'); await pg.waitForFunction(() => window.ready);
 const r = await pg.evaluate(process.argv[3]); console.log(JSON.stringify(r)); await br.close(); srv.close(); })();

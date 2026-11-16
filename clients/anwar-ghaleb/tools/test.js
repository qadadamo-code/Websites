const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const root=path.resolve(__dirname,'..');
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end();}const ext=path.extname(p);r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.html':'text/html','.css':'text/css','.woff2':'font/woff2'}[ext]||'application/octet-stream'});r.end(d);});}).listen(8765);
(async()=>{const specs=JSON.parse(fs.readFileSync(process.argv[2]));const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:800,height:800}});
p.on('console',m=>console.log('C:',m.text()));p.on('pageerror',e=>console.log('E:',e.message));
await p.goto('http://localhost:8765/tools/render.html');await p.waitForFunction('window.ready',null,{timeout:60000});
for(const s of specs){const d=await p.evaluate(s=>window.shot(s),s);fs.writeFileSync(path.join(out,s.id+'.png'),Buffer.from(d.split(',')[1],'base64'));console.log('ok',s.id);}
await b.close();srv.close();})();

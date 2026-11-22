const { chromium } = require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end();}const ext=path.extname(p);r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.html':'text/html','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'}[ext]||'application/octet-stream'});r.end(d);});}).listen(+process.env.PORT||8766);
(async()=>{const [url,out,w,h,full,wait]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:+w||1400,height:+h||900},deviceScaleFactor:1});p.on('pageerror',e=>console.log('E:',e.message));p.on('console',m=>{if(m.type()=='error')console.log('C:',m.text())});
await p.goto('http://localhost:'+(process.env.PORT||8766)+url);await p.waitForTimeout(+wait||1500);
if(process.env.EVAL){await p.evaluate(process.env.EVAL);await p.waitForTimeout(1500);}
await p.screenshot({path:out,fullPage:full=='1'});await b.close();srv.close();})();

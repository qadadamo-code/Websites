const { chromium } = require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');const PORT=8770+Math.floor(Math.random()*100);
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end();}const ext=path.extname(p);r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.html':'text/html','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'}[ext]||'application/octet-stream'});r.end(d);});}).listen(PORT);
(async()=>{const [q,prefix,w,h,secs,pre]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:+w,height:+h},deviceScaleFactor:1,isMobile:+w<800,hasTouch:+w<800});const p=await ctx.newPage();p.on('pageerror',e=>console.log('E:',e.message));p.on('console',m=>{if(m.type()=='error')console.log('C:',m.text())});
await p.goto(`http://localhost:${PORT}/index.html${q||''}`);await p.waitForTimeout(4500);
if(pre){await p.evaluate(pre);await p.waitForTimeout(1200);}
for(const s of secs.split(',')){
  if(s!=='top'){await p.evaluate(async s=>{const el=document.querySelector(s);const y=el.getBoundingClientRect().top+scrollY-70;for(let i=0;i<=10;i++){window.scrollTo(0,y*i/10);await new Promise(r=>setTimeout(r,60));}if(window.AGLenis)window.AGLenis.scrollTo(y,{immediate:true});},s);await p.waitForTimeout(2200);}
  await p.screenshot({path:`/tmp/claude-0/${prefix}_${s.replace(/[^a-z0-9]/gi,'')}.jpg`,quality:80});}
await b.close();srv.close();})();

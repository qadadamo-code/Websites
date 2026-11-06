// usage: node snap.js t1 t2 ... -> snaps/t.jpg
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(const t of process.argv.slice(2)){await p.evaluate(t=>render(t),+t);await p.screenshot({path:'snaps/'+t+'.jpg',type:'jpeg',quality:60});}
await b.close();})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const ts=process.argv.slice(2).map(Number);
for(const t of ts){await p.evaluate(t=>render(t),t);await p.waitForTimeout(150);await p.screenshot({path:`out/s-${t}.jpg`,type:'jpeg',quality:70});}
await b.close();})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const v=process.argv[2];await p.goto('file://'+process.cwd()+'/reel.html?v='+v);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const ts=process.argv.slice(3).map(Number);
for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`snap/${v}-${t}.jpg`,type:'jpeg',quality:80});}
await b.close();})();

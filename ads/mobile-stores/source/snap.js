const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
for(const t of process.argv.slice(2)){await p.evaluate(t=>render(t),+t);await p.screenshot({path:`snap/${t}.jpg`,type:'jpeg',quality:70});}
await b.close();})();

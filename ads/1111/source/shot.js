const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:2000},deviceScaleFactor:1});
await p.goto('file://'+process.cwd()+'/kit.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
const ids=await p.$$eval('.art',a=>a.map(x=>x.id));
for(const id of ids){await (await p.$('#'+id)).screenshot({path:`out/${id}.jpg`,type:'jpeg',quality:93});}
await b.close();})();

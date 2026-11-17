const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const v of ['sa','ae'])for(const f of ['post','story']){await p.goto('file://'+process.cwd()+`/kit.html?v=${v}&f=${f}`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
await p.locator('#st').screenshot({path:`out/${f}-${v}.jpg`,type:'jpeg',quality:92});}
await b.close();})();

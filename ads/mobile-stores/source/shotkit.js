const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1000}});
await p.goto('file://'+process.cwd()+'/kit.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(const id of ['c1','c2','c3','c4','c5','p1','s1']){const el=await p.$('#'+id);await el.screenshot({path:`kit/out-${id}.jpg`,type:'jpeg',quality:92});}
await b.close();})();

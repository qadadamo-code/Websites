const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:3500,height:2000}});
await p.goto('file://'+process.cwd()+'/kit.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(const id of ['c1','c2','c3','c4','c5','c6','post','story']){await (await p.$('#'+id)).screenshot({path:`kit/${id}.jpg`,type:'jpeg',quality:92});}
await b.close();})();

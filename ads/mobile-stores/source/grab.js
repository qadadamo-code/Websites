const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1.5});
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
for(const [t,name] of [[13.6,'chat'],[19.4,'store'],[22.3,'grid'],[24.8,'order'],[3.0,'search']]){
 await p.evaluate(t=>{render(t);const w=document.getElementById('phoneWrap');w.style.transform='none';w.style.opacity=1;document.getElementById('phone').style.filter='none';
 document.getElementById('night').style.background='transparent';document.getElementById('tap').style.opacity=0;document.querySelectorAll('.chip,#meter,#cap,#stamp').forEach(e=>e.style.opacity=0);},t);
 const el=await p.$('#phone');await el.screenshot({path:`kit/ph-${name}.png`,omitBackground:true});}
await b.close();})();

const {chromium}=require('playwright');
(async()=>{const ts=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(const t of ts){await p.evaluate(t=>render(+t),t);await p.screenshot({path:`/tmp/claude-0/-home-claude-Websites/d16d723c-c150-5a22-9fa6-4c205152eeb6/scratchpad/s_${t}.png`});}
await b.close();})();

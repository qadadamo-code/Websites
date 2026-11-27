const {chromium}=require('playwright');const {execSync}=require('child_process');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const ts=process.argv.slice(2).map(Number);
for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`snap/o_${t}.png`,omitBackground:true});
execSync(`ffmpeg -loglevel error -y -ss ${t} -i base.mp4 -i snap/o_${t}.png -frames:v 1 -filter_complex "[0][1]overlay,scale=360:-1" snap/f_${t}.jpg`);}
await b.close();})();

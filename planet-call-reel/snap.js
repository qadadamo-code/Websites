const {chromium}=require('playwright');
(async()=>{const ts=process.argv.slice(3).map(Number);const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('console',m=>console.log('C:',m.text()));p.on('pageerror',e=>console.log('E:',e.message));
await p.goto('file://'+process.cwd()+'/reel.html');await p.waitForFunction(()=>window.READY===1,{timeout:10000});
for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`/tmp/snap_${t}.png`});}
await b.close();
const {execSync}=require('child_process');
execSync(`python3 -c "
from PIL import Image
ts=${JSON.stringify(ts)}
ims=[Image.open('/tmp/snap_%s.png'%t).resize((270,480)) for t in ts]
g=Image.new('RGB',(270*min(6,len(ims)),480*((len(ims)+5)//6)),'white')
for i,im in enumerate(ims): g.paste(im,((i%6)*270,(i//6)*480))
g.save('${process.argv[2]}')"`)})();

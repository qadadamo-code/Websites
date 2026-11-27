const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-i','base.mp4','-f','image2pipe','-framerate','30','-c:v','png','-i','-','-i','mix.wav','-filter_complex','[0:v][1:v]overlay=format=auto,format=yuv420p[v]','-map','[v]','-map','2:a','-c:v','libx264','-crf','19','-preset','medium','-profile:v','high','-c:a','aac','-b:a','192k','-t','46','-movflags','+faststart','out.mp4'],{stdio:['pipe','inherit','inherit']});
const N=46*30;
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/30);const buf=await p.screenshot({type:'png',omitBackground:true});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done');})();

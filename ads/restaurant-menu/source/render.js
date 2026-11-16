const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-i','mix.wav','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out/reel-restaurants.mp4'],{stdio:['pipe','inherit','inherit']});
const N=Math.round(41*30);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/30);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done');})();

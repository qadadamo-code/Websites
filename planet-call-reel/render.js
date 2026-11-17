// node render.js out.mp4 [start] [end]
const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const out=process.argv[2],fps=30,st=+(process.argv[3]||0),en=+(process.argv[4]||39);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/reel.html');await p.waitForFunction(()=>window.READY===1);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium',out],{stdio:['pipe','inherit','inherit']});
const N=Math.round((en-st)*fps);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),st+i/fps);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150==0)console.log('frame',i,'/',N);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();})();

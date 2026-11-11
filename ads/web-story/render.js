// node render.js out.mp4 [fps] [start] [end]
const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const out = process.argv[2] || 'out.mp4', fps = +(process.argv[3] || 30);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => document.fonts.ready);
  const dur = await p.evaluate(() => DUR); const N = Math.round(dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { await p.evaluate(t => render(t), i / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 150 === 0) console.log(i, '/', N); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done');
})();

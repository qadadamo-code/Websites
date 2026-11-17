// node render_caps.js <outdir> — one transparent PNG per caption (cap0.png ...)
const { chromium } = require('playwright');
const path = require('path');
const CAPS = [
  'بنفكّر في <b>مشروعك</b>',
  'بنفهم <b>جمهورك</b>',
  'بندير <b>صفحاتك</b>',
  'بنبني <b>موقعك</b>',
  'بنصمّم <b>هويتك</b>',
  'بنطلق <b>إعلاناتك</b>',
  'لكل <b>نشاط</b>',
  'وبنصوّر <b>محتواك</b>',
];
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, 'caps.html'));
  await p.evaluate(() => document.fonts.ready);
  for (let i = 0; i < CAPS.length; i++) {
    await p.evaluate(h => { document.getElementById('c').innerHTML = h; }, CAPS[i]);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${out}/cap${i}.png`, omitBackground: true });
  }
  await b.close();
})();

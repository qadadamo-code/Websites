const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/reel.html');await p.waitForFunction(()=>window.READY===1);
const d=await p.evaluate(()=>({PH,L,priceIn,priceOut,signIn,signOut,hangup,giftIn,endIn,TOTAL}));require('fs').writeFileSync('timeline.json',JSON.stringify(d,null,1));await b.close()})();

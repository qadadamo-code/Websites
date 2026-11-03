// Dotted planet with orbit + mint moon, drawn deterministically for time t (seconds).
const PTS=(()=>{const N=1500,g=Math.PI*(3-Math.sqrt(5)),a=[];for(let i=0;i<N;i++){const y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),t=g*i;a.push([Math.cos(t)*r,y,Math.sin(t)*r])}return a})();
function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
const STARS=(()=>{const r=rng(7);return Array.from({length:160},()=>[r(),r(),r()*1.6+.3,r()*6.28])})();
function setupCanvas(c){const d=2;c.width=c.clientWidth*d;c.height=c.clientHeight*d;const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return x}
function drawPlanet(ctx,W,H,o,t){
  // o: {cx,cy,R,stars,alpha,moon}
  const {cx,cy,R}=o,al=o.alpha??1;ctx.clearRect(0,0,W,H);
  if(o.stars!==false)for(const s of STARS){ctx.fillStyle=`rgba(233,238,247,${(.25+.35*Math.sin(t*2+s[3]))*al})`;ctx.beginPath();ctx.arc(s[0]*W,s[1]*H,s[2],0,6.28);ctx.fill()}
  // glow
  let g=ctx.createRadialGradient(cx,cy,R*.2,cx,cy,R*1.5);g.addColorStop(0,`rgba(20,54,89,${.55*al})`);g.addColorStop(1,'rgba(6,9,26,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*1.5,0,6.28);ctx.fill();
  const rot=t*.35,tilt=-.35,cr=Math.cos(rot),sr=Math.sin(rot),ct=Math.cos(tilt),st=Math.sin(tilt);
  for(const p of PTS){let x=p[0]*cr-p[2]*sr,z=p[0]*sr+p[2]*cr,y=p[1];const y2=y*ct-z*st,z2=y*st+z*ct;if(z2<-.05)continue;const k=(z2+1)/2;
    // mint tint on lit side
    const m=Math.max(0,(x*-.6+y2*-.4+z2*.7));ctx.fillStyle=`rgba(${Math.round(146+87*(1-m))},${Math.round(197+41*(1-m))},${Math.round(180+67*(1-m))},${(.12+.75*k*k)*al})`;
    ctx.beginPath();ctx.arc(cx+x*R,cy+y2*R,(.6+1.6*k)*R/300,0,6.28);ctx.fill()}
  // orbit
  const oa=-.32,rx=R*1.55,ry=R*.36;ctx.save();ctx.translate(cx,cy);ctx.rotate(oa);ctx.strokeStyle=`rgba(184,224,210,${.35*al})`;ctx.lineWidth=R/220;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,6.28);ctx.stroke();
  if(o.moon!==false){const a=t*.9+.6,mx=Math.cos(a)*rx,my=Math.sin(a)*ry;const front=Math.sin(a)>0;const mr=R*.11;
    const gg=ctx.createRadialGradient(mx,my,0,mx,my,mr*4);gg.addColorStop(0,`rgba(146,197,180,${.45*al})`);gg.addColorStop(1,'rgba(146,197,180,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(mx,my,mr*4,0,6.28);ctx.fill();
    ctx.fillStyle=`rgba(146,197,180,${(front?1:.55)*al})`;ctx.beginPath();ctx.arc(mx,my,mr,0,6.28);ctx.fill()}
  ctx.restore()}
function fmtCd(sec){sec=Math.max(0,Math.round(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60,p=n=>String(n).padStart(2,'0');return[p(h),p(m),p(s)]}
function cdHTML(sec,size){const [h,m,s]=fmtCd(sec);const u=(v,l)=>`<div class="u"><b style="font-size:${size}px">${v}</b><small style="font-size:${size*.28}px">${l}</small></div>`;const sp=`<span class="sep" style="font-size:${size*.7}px;padding-bottom:${size*.45}px">:</span>`;return u(h,'ساعة')+sp+u(m,'دقيقة')+sp+u(s,'ثانية')}
// shrink an element's font until each nowrap line fits maxW
function fit(el,maxW){let fs=parseFloat(getComputedStyle(el).fontSize);el.style.whiteSpace='nowrap';el.style.display='inline-block';while(el.scrollWidth>maxW&&fs>20){fs-=2;el.style.fontSize=fs+'px'}el.style.display='';}

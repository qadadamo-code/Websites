/* STERN IP — hero sky: a night sky over Africa & the Middle East. Land is drawn as starlight,
   Cairo HQ sends light to every STERN office; correspondents twinkle as a constellation. */
(function(){
  var d=document,w=window,cv=d.getElementById('sky');
  if(!cv||!w.STERN_DOTS||!w.STERN_CITIES)return;
  var D=w.STERN_DOTS,C=w.STERN_CITIES,RTL=d.documentElement.dir==='rtl';
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx=cv.getContext('2d'),dpr=Math.min(w.devicePixelRatio||1,2),W,H,sc,ox,oy,mob,vis=true,t0=performance.now();
  var mx=0,my=0,tx=0,ty=0;
  var offices=['amman','riyadh','dubai','kuwait','algiers','khartoum','nairobi','addis','yaounde','harare','joburg'];
  var corr=['casablanca','tunis','beirut','baghdad','doha','manama','muscat','sanaa','tripoli','istanbul','nicosia','damascus','lagos','accra','dar','kampala','luanda','dakar','kigali','mogadishu','tehran','karachi','erbil','djibouti','windhoek','maputo','antananarivo'];
  var links=[['casablanca','tunis'],['tunis','tripoli'],['beirut','damascus'],['damascus','baghdad'],['baghdad','tehran'],['doha','manama'],['muscat','karachi'],['lagos','accra'],['kampala','kigali'],['kigali','dar'],['luanda','windhoek'],['maputo','antananarivo'],['mogadishu','djibouti'],['istanbul','nicosia'],['erbil','baghdad'],['sanaa','djibouti'],['dakar','accra']];
  var stars=[];for(var i=0;i<240;i++)stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.1+.2,p:Math.random()*7,s:.5+Math.random()*1.5});
  var dots=[];for(var j=0;j<D.p.length;j+=2)dots.push({x:D.p[j],y:D.p[j+1],p:Math.random()*7});
  function size(){
    var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    mob=W<760;
    var vbw=760,vbh=720,vbx=130,vby=110; // crop of the projected map
    sc=mob?Math.max(W/vbw,H*.5/vbh)*1.0:Math.min(W*.62/vbw,H*1.02/vbh);
    var cxm=mob?W*.5:(RTL?W*.3:W*.68),cym=mob?H*.24:H*.5;
    ox=cxm-(vbx+vbw/2)*sc;oy=cym-(vby+vbh/2)*sc;
  }
  size();w.addEventListener('resize',size);
  w.addEventListener('pointermove',function(e){tx=(e.clientX/W-.5);ty=(e.clientY/H-.5)},{passive:true});
  if('IntersectionObserver' in w)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);
  var born=performance.now();
  function P(k,px,py){var c=C[k];return[ox+c[0]*sc+px,oy+c[1]*sc+py]}
  function frame(now){
    if(!reduce)requestAnimationFrame(frame);
    if(!vis)return;
    var t=(now-t0)/1000,age=Math.min(1,(now-born)/2600);
    mx+=(tx-mx)*.04;my+=(ty-my)*.04;
    ctx.clearRect(0,0,W,H);
    // glow behind the continent
    var hq=P('cairo',0,0),g=ctx.createRadialGradient(hq[0],hq[1],0,hq[0],hq[1],Math.max(W,H)*.6);
    g.addColorStop(0,'rgba(46,83,148,.34)');g.addColorStop(.5,'rgba(27,54,115,.12)');g.addColorStop(1,'rgba(4,9,24,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // background stars (deep layer)
    for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=(.25+.45*(.5+.5*Math.sin(t*s.s+s.p)));ctx.fillStyle='#e3ebff';
      ctx.beginPath();ctx.arc(s.x*W-mx*8,s.y*H-my*8,s.r,0,7);ctx.fill()}
    // land as starlight
    var px=-mx*22,py=-my*22,rr=Math.max(.9,sc*D.s*.17);
    for(var j=0;j<dots.length;j++){var o=dots[j],x=ox+o.x*sc+px,y=oy+o.y*sc+py;if(x<-4||y<-4||x>W+4||y>H+4)continue;
      var dd=Math.hypot(x-hq[0],y-hq[1]),rev=age*Math.max(W,H)*1.1;if(dd>rev)continue;
      ctx.globalAlpha=.24+.16*(.5+.5*Math.sin(t*.8+o.p));ctx.fillStyle='#a9c1f2';ctx.fillRect(x-rr/2,y-rr/2,rr,rr)}
    ctx.globalAlpha=1;
    hq=P('cairo',px,py);
    // correspondent constellation
    ctx.strokeStyle='rgba(169,193,242,.16)';ctx.lineWidth=.8;
    links.forEach(function(l){var a=P(l[0],px,py),b=P(l[1],px,py);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()});
    corr.forEach(function(k,i){var p=P(k,px,py),tw=.5+.5*Math.sin(t*1.6+i);ctx.strokeStyle='rgba(169,193,242,'+(.35+.4*tw)+')';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(p[0],p[1],2.2,0,7);ctx.stroke()});
    // arcs Cairo -> offices
    offices.forEach(function(k,i){
      var p=P(k,px,py),dx=p[0]-hq[0],dy=p[1]-hq[1],len=Math.hypot(dx,dy),cx=(hq[0]+p[0])/2+dy*.18,cy=(hq[1]+p[1])/2-Math.abs(dx)*.12-len*.18;
      var grow=Math.max(0,Math.min(1,(age*1.6-i*.05)));if(grow<=0)return;
      ctx.strokeStyle='rgba(169,193,242,.38)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hq[0],hq[1]);
      var steps=26;for(var s=1;s<=Math.round(steps*grow);s++){var u=s/steps,q=1-u;ctx.lineTo(q*q*hq[0]+2*q*u*cx+u*u*p[0],q*q*hq[1]+2*q*u*cy+u*u*p[1])}ctx.stroke();
      if(grow<1)return;
      var u=((t*.22+i*.17)%1),q=1-u,x=q*q*hq[0]+2*q*u*cx+u*u*p[0],y=q*q*hq[1]+2*q*u*cy+u*u*p[1];
      ctx.fillStyle='rgba(255,255,255,'+(.9*(1-u*.6))+')';ctx.shadowColor='#cfe0ff';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,1.7,0,7);ctx.fill();
      ctx.fillStyle='#a9c1f2';ctx.shadowColor='#a9c1f2';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(p[0],p[1],3.2,0,7);ctx.fill();ctx.shadowBlur=0;
    });
    // Cairo: the star
    var pr=(t%2.6)/2.6;
    ctx.strokeStyle='rgba(255,255,255,'+(.8*(1-pr))+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(hq[0],hq[1],5+pr*34,0,7);ctx.stroke();
    ctx.save();ctx.translate(hq[0],hq[1]);ctx.rotate(t*.15);ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=22;
    ctx.beginPath();for(var k=0;k<8;k++){var a=k*Math.PI/4,r=k%2?2.2:8;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.restore();ctx.shadowBlur=0;
    // fade towards the headline side for legibility
    if(!mob){var fg=ctx.createLinearGradient(RTL?W:0,0,RTL?W*.35:W*.65,0);fg.addColorStop(0,'rgba(4,9,24,.85)');fg.addColorStop(.55,'rgba(4,9,24,.35)');fg.addColorStop(1,'rgba(4,9,24,0)');ctx.fillStyle=fg;ctx.fillRect(0,0,W,H)}
    else{var fm=ctx.createLinearGradient(0,H*.12,0,H*.5);fm.addColorStop(0,'rgba(4,9,24,0)');fm.addColorStop(1,'rgba(4,9,24,.94)');ctx.fillStyle=fm;ctx.fillRect(0,H*.12,W,H*.88)}
  }
  requestAnimationFrame(frame);
})();

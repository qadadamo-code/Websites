/* STERN IP — 3D metal eagle. Feathers are extruded from the traced logo and assemble around a glowing core. */
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import PIECES from './pieces.json';

const HX=301,HY=124,S=0.01;
function shapeFrom(poly){
  const toV=p=>new THREE.Vector2((p[0]-HX)*S,-(p[1]-HY)*S);
  const sh=new THREE.Shape(poly[0].slice(0,-1).map(toV));
  for(let i=1;i<poly.length;i++)sh.holes.push(new THREE.Path(poly[i].slice(0,-1).map(toV)));
  return sh;
}
function centroid(poly){let x=0,y=0,n=poly[0].length-1;for(let i=0;i<n;i++){x+=poly[0][i][0];y+=poly[0][i][1]}return[(x/n-HX)*S,-(y/n-HY)*S]}

export function mount(canvas,opts={}){
  const dpr=Math.min(window.devicePixelRatio||1,opts.dpr||2);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:!!opts.still,powerPreference:'high-performance'})}catch(e){return null}
  renderer.setPixelRatio(dpr);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(new RoomEnvironment(renderer),0.04).texture;
  if(opts.bg!=null)scene.background=new THREE.Color(opts.bg);
  const cam=new THREE.PerspectiveCamera(30,1,0.1,100);
  cam.position.set(0,0.2,opts.dist||13);

  // lights: cool key, warm-ish rim, blue fill
  const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-4,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0xa9c1f2,3.2);rim.position.set(5,2,-4);scene.add(rim);
  const fill=new THREE.PointLight(0x5d83cc,30,30);fill.position.set(0,-3,4);scene.add(fill);
  const sweep=new THREE.PointLight(0xffffff,0,12);sweep.position.set(-8,1.5,3);scene.add(sweep);

  const faceMat=new THREE.MeshPhysicalMaterial({color:opts.face||0x1d3a78,metalness:0.85,roughness:0.32,clearcoat:1,clearcoatRoughness:0.18,envMapIntensity:1.2});
  const edgeMat=new THREE.MeshPhysicalMaterial({color:0xdfe7f5,metalness:1,roughness:0.18,envMapIntensity:1.6});
  const coreFace=new THREE.MeshPhysicalMaterial({color:0x2e5394,metalness:0.8,roughness:0.25,clearcoat:1,emissive:0x5d83cc,emissiveIntensity:0});
  // dust of stars around the eagle for depth
  let stars=null;
  if(opts.stars){const n=opts.stars,g=new THREE.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(Math.random()-.5)*26;p[i*3+1]=(Math.random()-.5)*14;p[i*3+2]=-2-Math.random()*14}g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const sc=document.createElement('canvas');sc.width=sc.height=32;const sx=sc.getContext('2d');const sg=sx.createRadialGradient(16,16,0,16,16,16);sg.addColorStop(0,'rgba(255,255,255,1)');sg.addColorStop(1,'rgba(169,193,242,0)');sx.fillStyle=sg;sx.fillRect(0,0,32,32);
    stars=new THREE.Points(g,new THREE.PointsMaterial({size:.09,map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.8}));scene.add(stars)}

  const eagle=new THREE.Group();scene.add(eagle);
  const feathers=[];
  let core=null;
  PIECES.forEach((poly,i)=>{
    const isCore=i===PIECES.length-1;
    const geo=new THREE.ExtrudeGeometry(shapeFrom(poly),{depth:isCore?0.26:0.18,bevelEnabled:true,bevelThickness:0.05,bevelSize:0.035,bevelSegments:4,curveSegments:4});
    geo.translate(0,0,isCore?-0.13:-0.09);
    const c=centroid(poly);
    geo.translate(-c[0],-c[1],0);
    const m=new THREE.Mesh(geo,[isCore?coreFace:faceMat,edgeMat]);
    m.position.set(c[0],c[1],0);
    const piv=new THREE.Group();piv.add(m);eagle.add(piv);
    const home={x:c[0],y:c[1]};
    // scattered start
    const a=Math.atan2(c[1],c[0])||Math.random()*6.28,r=6+Math.random()*5;
    const st={x:Math.cos(a)*r,y:Math.sin(a)*r*0.7,z:-6-Math.random()*10,rx:(Math.random()-.5)*6,ry:(Math.random()-.5)*6,rz:(Math.random()-.5)*4};
    const f={mesh:m,home,st,d:Math.hypot(c[0],c[1]),core:isCore};
    if(isCore)core=f;else feathers.push(f);
  });
  feathers.sort((a,b)=>a.d-b.d);

  // glow sprite at the heart (the "Stern" star)
  const gc=document.createElement('canvas');gc.width=gc.height=256;const gx=gc.getContext('2d');
  const gr=gx.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,'rgba(207,224,255,.85)');gr.addColorStop(.45,'rgba(93,131,204,.25)');gr.addColorStop(1,'rgba(93,131,204,0)');
  gx.fillStyle=gr;gx.fillRect(0,0,256,256);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gc),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  glow.scale.set(1.5,1.5,1);glow.position.z=0.3;eagle.add(glow);

  let W=1,H=1;
  function size(){const r=canvas.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);renderer.setSize(W,H,false);cam.aspect=W/H;
    // fit eagle width (~6 units) into view
    const fitW=(opts.fit||7.2)/ (2*Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*cam.aspect);
    const fitH=(opts.fitH||3.4)/(2*Math.tan(THREE.MathUtils.degToRad(cam.fov/2)));
    cam.position.z=Math.max(fitW,fitH);cam.updateProjectionMatrix()}
  size();
  if(!opts.still)window.addEventListener('resize',size);

  const state={t:0,assemble:opts.assembled?1:0,mx:0,my:0,tx:0,ty:0,scroll:0,rotY:opts.rotY||0,rotX:opts.rotX||0,offX:0,offY:0,glow:opts.assembled?0.55:0};
  function ease(x){return x<0?0:x>1?1:1-Math.pow(1-x,4)}
  function place(){
    const A=state.assemble;
    feathers.forEach((f,i)=>{
      const k=ease((A*1.55)-i*(0.55/feathers.length));
      const q=1-k,m=f.mesh,s=f.st;
      m.position.set(f.home.x*k+s.x*q,f.home.y*k+s.y*q,s.z*q);
      m.rotation.set(s.rx*q,s.ry*q,s.rz*q);
    });
    const kc=ease(A*3);core.mesh.scale.setScalar(0.2+0.8*kc);core.mesh.rotation.z=(1-kc)*2.5;
  }
  place();
  if(!opts.still){
    window.addEventListener('pointermove',e=>{state.tx=e.clientX/innerWidth-.5;state.ty=e.clientY/innerHeight-.5},{passive:true});
  }
  let vis=true,raf=0,last=performance.now();
  if('IntersectionObserver' in window&&!opts.still)new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&!raf)loop(performance.now())}).observe(canvas);
  function frame(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;state.t+=dt;
    state.mx+=(state.tx-state.mx)*.05;state.my+=(state.ty-state.my)*.05;
    const sc=state.scroll;
    eagle.rotation.y=state.rotY+state.mx*0.5+sc*0.9;
    eagle.rotation.x=state.rotX+state.my*0.3+Math.sin(state.t*.6)*0.04-sc*0.25;
    eagle.position.y=Math.sin(state.t*.9)*0.06+state.offY-sc*0.6;
    eagle.position.x=state.offX;
    if(stars){stars.rotation.y=state.mx*0.08+sc*0.25+state.t*0.004;stars.rotation.x=state.my*0.05;stars.position.y=sc*1.2}
    eagle.scale.setScalar(state.scale||1);
    // light sweep across the metal every ~6s
    const ph=(state.t%6.5)/6.5;sweep.position.x=-9+ph*18;sweep.intensity=ph<.6?Math.sin(ph/.6*Math.PI)*28:0;
    glow.material.opacity=Math.min(1,state.glow)*(0.85+0.15*Math.sin(state.t*2.2))*0.8;
    coreFace.emissiveIntensity=state.glow*0.6;
    renderer.render(scene,cam);
  }
  function loop(now){if(!vis){raf=0;return}raf=requestAnimationFrame(loop);frame(now)}
  if(!opts.still)loop(performance.now());else frame(performance.now());
  return {
    state,cam,eagle,renderer,
    set assemble(v){state.assemble=v;place()},get assemble(){return state.assemble},
    render(){frame(performance.now())},
    resize:size,
    snapshot(){frame(performance.now());return canvas.toDataURL('image/png')}
  };
}
window.SternEagle={mount};

/* STERN IP — home stage: the metal eagle assembles feather by feather around the star (Stern),
   then glides aside as the story scrolls. Falls back to the SVG eagle without WebGL. */
(function(){
  var d=document,w=window,root=d.documentElement;
  var RTL=root.dir==='rtl';
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reveal(delay){
    root.classList.remove('h3d');
    if(!w.gsap||reduce)return;
    var h=d.querySelector('.hx');
    var tl=gsap.timeline({delay:delay||0});
    tl.from('.hx-word span',{opacity:0,letterSpacing:'.4em',duration:2.4,ease:'power3.out'},0)
      .from(h.querySelectorAll('.hero-t .w>span'),{yPercent:115,duration:1.2,stagger:.08,ease:'power4.out'},.15)
      .from(h.querySelectorAll('.hx-in .kk,.hx-row,.hero-b>*'),{y:26,opacity:0,duration:1,stagger:.08,ease:'power3.out'},.45)
      .from('.hx-meta span',{opacity:0,y:-10,duration:1,stagger:.1},.5)
      .from('#hd',{opacity:0,duration:.9},.3);
  }
  function start(){
    var cv=d.getElementById('e3d');
    var small=innerWidth<861;
    var ctrl=null;
    try{if(cv&&w.SternEagle)ctrl=SternEagle.mount(cv,{stars:small?140:320,dpr:small?1.75:2,fit:small?6.2:7.2,fitH:small?3.2:3.4})}catch(e){ctrl=null}
    if(!ctrl){root.classList.add('no3d');reveal(0);return}
    var st=ctrl.state;
    /* visible world size at the eagle plane */
    function vis(){var c=ctrl.cam,h=2*Math.tan(c.fov*Math.PI/360)*c.position.z;return{h:h,w:h*c.aspect}}
    /* resting pose in the hero */
    function heroPose(){var v=vis();small=innerWidth<861;return small?{x:0,y:v.h*0.21,s:1}:{x:0,y:v.h*(RTL?.2:.17),s:RTL?.82:.86}}
    var p=heroPose();st.offX=p.x;st.offY=p.y;st.scale=p.s;
    if(reduce||!w.gsap){ctrl.assemble=1;st.glow=.6;reveal(0);return}
    /* assembly */
    st.glow=0;ctrl.assemble=0;
    var a={v:0};
    var tl=gsap.timeline();
    tl.to(st,{glow:1.6,duration:.6,ease:'power2.out'},0)
      .to(a,{v:1,duration:2.6,ease:'power2.inOut',onUpdate:function(){ctrl.assemble=a.v}},.1)
      .to(st,{glow:.32,duration:1.2,ease:'power2.inOut'},1.9)
      .fromTo(st,{rotY:-.9},{rotY:0,duration:3,ease:'power3.out'},0);
    reveal(1.5);
    /* scroll choreography: hero → statement (eagle slides to the free side and turns) */
    if(!w.ScrollTrigger)return;
    gsap.registerPlugin(ScrollTrigger);
    var side=RTL?-1:1;
    var scrollTl=gsap.timeline({scrollTrigger:{trigger:'.hx',start:'top top',endTrigger:'.hx-st',end:'center center',scrub:1.2,invalidateOnRefresh:true}});
    scrollTl.to(st,{scroll:.55,duration:1,ease:'none'},0)
      .to(st,{offX:function(){return small?0:side*vis().w*0.29},offY:function(){return small?vis().h*0.32:-vis().h*0.02},scale:function(){return small?.7:.7},duration:1,ease:'power1.inOut'},0)
      .to(cv,{opacity:function(){return small?.28:1},duration:1,ease:'none'},0);
    /* fade the stage out as the next section arrives */
    gsap.to(cv,{autoAlpha:0,ease:'none',scrollTrigger:{trigger:'.hx-st',start:'bottom 85%',end:'bottom 25%',scrub:true}});
    w.addEventListener('resize',function(){if(scrollTl.progress()===0){var q=heroPose();st.offX=q.x;st.offY=q.y;st.scale=q.s}});
  }
  d.addEventListener('DOMContentLoaded',start);
})();

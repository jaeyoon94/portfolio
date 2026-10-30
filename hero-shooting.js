/* Short, staggered meteor sequences. Static scenery and navigation are independent. */
(() => {
 const hero=document.querySelector('.pm-hero');
 const template=hero?.querySelector('.hero-shooting-star');
 if(!template||hero.dataset.shootingReady)return;
 hero.dataset.shootingReady='true';
 template.remove();
 // Clip the entire meteor, including its pseudo-elements, to the photographed sky.
 const layer=document.createElement("div");
 layer.className="hero-shooting-layer";
 layer.setAttribute("aria-hidden","true");
 hero.append(layer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const menu=document.querySelector('.mobile-menu');
 const active=new Set(),spawnTimers=new Set();
 let eventTimer=0,visible=false,sequenceActive=false,remaining=0,ready=[];
 const random=(min,max)=>min+Math.random()*(max-min);
 const enabled=()=>visible&&!document.hidden&&!reduced.matches&&!menu?.open;

 function crosses(a,b,rect){
  let low=0,high=1;
  for(const [p,d,min,max] of [[a.x,b.x-a.x,rect.left,rect.right],[a.y,b.y-a.y,rect.top,rect.bottom]]){
   if(Math.abs(d)<.0001){if(p<min||p>max)return false;continue;}
   let near=(min-p)/d,far=(max-p)/d;
   if(near>far)[near,far]=[far,near];
   low=Math.max(low,near);high=Math.min(high,far);
   if(low>high)return false;
  }
  return true;
 }

 // Read the layout once per event, never on animation frames.
 function geometry(){
  const bounds=hero.getBoundingClientRect(),w=bounds.width,h=bounds.height;
  const mobile=w<600,tablet=w<1024&&!mobile,pad=mobile?12:14,rects=[];
  function protect(rect){
   if(rect.width&&rect.height)rects.push({left:rect.left-bounds.left-pad,right:rect.right-bounds.left+pad,top:rect.top-bounds.top-pad,bottom:rect.bottom-bounds.top+pad});
  }
  protect(document.querySelector('.header').getBoundingClientRect());
  hero.querySelectorAll('.pm-hero-copy h1,.pm-hero-copy p,.map-label,.map-preview').forEach(el=>{
   const range=document.createRange();range.selectNodeContents(el);[...range.getClientRects()].forEach(protect);
  });
  hero.querySelectorAll('.pm-hero-cta,.map-core').forEach(el=>protect(el.getBoundingClientRect()));
  return{bounds,w,h,mobile,tablet,rects};
 }

 function route(g,size,reserved){
  const {bounds,w,h,mobile,tablet,rects}=g;
  const tightMobile=mobile&&innerHeight<900;
  const ranges=mobile?{
   large:{tail:tightMobile?[180,210]:[200,235],distance:tightMobile?[260,295]:[290,340],head:6,halo:20,thickness:2.3},
   medium:{tail:tightMobile?[140,175]:[150,195],distance:tightMobile?[240,280]:[250,300],head:5,halo:18,thickness:2},
   small:{tail:[110,155],distance:[220,260],head:4.5,halo:16,thickness:1.8}
  }:tablet?{
   large:{tail:[245,285],distance:[430,490],head:6.5,halo:21,thickness:2.5},
   medium:{tail:[185,225],distance:[350,420],head:5.5,halo:18,thickness:2.2},
   small:{tail:[145,185],distance:[300,350],head:4.5,halo:16,thickness:1.8}
  }:{
   large:{tail:[285,345],distance:[610,710],head:7,halo:22,thickness:2.5},
   medium:{tail:[225,280],distance:[500,600],head:6,halo:20,thickness:2.3},
   small:{tail:[160,220],distance:[400,490],head:5,halo:17,thickness:2}
  };
  const spec=ranges[size];
  for(let attempt=0;attempt<420;attempt++){
   const angle=mobile?random(100,110):tablet?random(97,107):random(165,175);
   const radians=angle*Math.PI/180,ux=Math.cos(radians),uy=Math.sin(radians);
   const tail=random(...spec.tail),distance=random(...spec.distance);
   const x=mobile?random(w*.69,w*.84):tablet?random(w*.8,w*.935):random(w*.5,w*.8);
   const y=mobile?random(h*.44,h*.66):tablet?random(h*.29,h*.52):random(h*.14,h*.35);
   const start={x:x-ux*tail,y:y-uy*tail},end={x:x+ux*distance,y:y+uy*distance};
   if(Math.min(start.x,end.x)<14||Math.max(start.x,end.x)>w-14||Math.min(start.y,end.y)<14||Math.max(start.y,end.y)>h-14)continue;
   if(Math.min(start.y,end.y)+bounds.top<14||Math.max(start.y,end.y)+bounds.top>innerHeight-14)continue;
   if(rects.some(rect=>crosses(start,end,rect)))continue;
   const mid={x:x+ux*distance*.5,y:y+uy*distance*.5};
   if(reserved.some(p=>Math.hypot(x-p.x,y-p.y)<(mobile?28:tablet?42:56)||Math.hypot(mid.x-p.mid.x,mid.y-p.mid.y)<(mobile?24:tablet?32:42)||Math.abs(angle-p.angle)<.65))continue;
   const brightness=size==='large'?random(.96,1):size==='medium'?random(.89,.97):random(.85,.93);
   return{x,y,dx:ux*distance,dy:uy*distance,angle,tail,mid,brightness,head:spec.head,halo:spec.halo,thickness:spec.thickness};
  }
  return null;
 }

 function timing(sizes){
  // Plan two visual slots. Five brief flights still fit within about 2.5 seconds.
  for(let attempt=0;attempt<500;attempt++){
   const durations=sizes.map(size=>size==='large'?(sizes.length===5?random(.805,.82):random(.94,1.06)):random(.8,.808));
   const starts=[0];let valid=true;
   for(let i=1;i<sizes.length;i++){
    const start=Math.max(starts[i-1]+random(.15,.43),i>1?starts[i-2]+durations[i-2]+.008:0);
    if(start-starts[i-1]>.43){valid=false;break;}
    starts.push(start);
   }
   if(valid&&Math.max(...starts.map((start,i)=>start+durations[i]))<=(sizes.length===5?2.44:2.5))return starts.map((start,i)=>({delay:start*1000,duration:durations[i]}));
  }
  return null;
 }

 function plan(){
  const g=geometry();let count=g.mobile?4:Math.random()<.5?4:5;
  for(let attempt=0;attempt<14;attempt++){
   if(attempt===8)count=4;
   const others=count===5?['medium','small','medium','small']:['medium','small','medium'];
   for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
   const primary=count===5?2:Math.random()<.5?2:3;
   const sizes=[...others];sizes.splice(primary,0,'large');
   const schedule=timing(sizes);if(!schedule)continue;
   const paths=[],reserved=[];
   const order=sizes.map((size,index)=>({size,index})).sort((a,b)=>({large:0,medium:1,small:2}[a.size]-{large:0,medium:1,small:2}[b.size]));
   for(const {size,index} of order){const path=route(g,size,reserved);if(!path)break;paths[index]=path;reserved.push(path);}
   if(paths.filter(Boolean).length===count)return paths.map((path,i)=>({...path,...schedule[i]}));
  }
  return null;
 }

 function clear(){
  clearTimeout(eventTimer);eventTimer=0;
  spawnTimers.forEach(id=>clearTimeout(id));spawnTimers.clear();
  active.forEach(node=>node.remove());active.clear();ready=[];remaining=0;sequenceActive=false;
 }
 function schedule(first=false){
  if(!enabled()||eventTimer||sequenceActive)return;
  eventTimer=setTimeout(begin,first?random(5000,8000):random(8000,12000));
 }
 function flush(){
  if(!enabled()){clear();return;}
  while(ready.length&&active.size<2){
   const path=ready.shift(),node=template.cloneNode(false);
   for(const [key,value] of Object.entries({x:path.x+'px',y:path.y+'px',dx:path.dx+'px',dy:path.dy+'px',angle:path.angle+'deg',tail:path.tail+'px',duration:path.duration+'s',brightness:path.brightness,head:path.head+'px',halo:path.halo+'px',thickness:path.thickness+'px'}))node.style.setProperty('--shoot-'+key,value);
   node.classList.add('is-flying');active.add(node);layer.append(node);
  }
 }
 function begin(){
  eventTimer=0;if(!enabled()||sequenceActive)return;
  const jobs=plan();if(!jobs){schedule();return;}
  sequenceActive=true;remaining=jobs.length;ready.push(jobs[0]);flush();
  jobs.slice(1).forEach(job=>{
   const id=setTimeout(()=>{spawnTimers.delete(id);if(!sequenceActive||!enabled()){clear();return;}ready.push(job);flush();},job.delay);
   spawnTimers.add(id);
  });
 }
 hero.addEventListener('animationend',event=>{
  if(event.animationName!=='hero-shooting'||!active.delete(event.target))return;
  event.target.remove();remaining--;
  if(remaining===0){sequenceActive=false;schedule();}else flush();
 });
 function sync(){clear();schedule(true);}
 document.addEventListener('visibilitychange',sync);
 menu?.addEventListener('toggle',sync);
 reduced.addEventListener('change',sync);
 addEventListener('resize',sync,{passive:true});
 addEventListener('pagehide',clear);
 addEventListener('pageshow',()=>schedule(true));
 if('IntersectionObserver'in window){
  new IntersectionObserver(([entry])=>{
   const next=entry.isIntersecting&&entry.intersectionRatio>=.15;
   if(next!==visible){visible=next;sync();}
  },{threshold:[0,.15]}).observe(hero);
 }else{visible=true;schedule(true);}
})();

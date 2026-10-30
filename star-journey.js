/* Progressive enhancement: section meaning lives in this map; content never depends on it. */
(() => {
 const root = document.querySelector('.star-journey');
 if (!root) return;
 const map = [
  ['about','discover','first',true], ['profile','identity','milestone',false],
  ['career','journey','milestone',false], ['projects','constellation','project',false],
  ['project-neon','process-collaboration','project',false],
  ['project-undecember','evidence-decision','project',false],
  ['project-slime','lifecycle-transition','project',false],
  ['project-talesrunner','service-business-risk','project',false],
  ['project-dme','workflow-automation','project',false],
  ['project-maplestar','business-expansion','capability',false],
  ['ai-automation','judgment-expansion','capability',true],
  ['closing','arrival','arrival',true], ['contact','next-connection','capability',true]
 ];
 const ns='http://www.w3.org/2000/svg';
 const svgElement = name => document.createElementNS(ns,name);
 const stops=map.map(([id,meaning,kind,dark])=>{
  const target=document.getElementById(id);
  if (!target) return null;
  const star=document.createElement('span');
  star.className='journey-star'+(dark?' is-dark':'');
  star.dataset.section=id;star.dataset.meaning=meaning;star.dataset.kind=kind;
  root.append(star);
  return {target,star,id,x:0,y:0};
 }).filter(Boolean);
 const segments=stops.slice(1).map((stop,i)=>{
  const svg=svgElement('svg');svg.classList.add('journey-segment');svg.dataset.from=stops[i].id;svg.setAttribute('focusable','false');
  const base=svgElement('path'), active=svgElement('path');
  base.setAttribute('class','journey-path journey-path-base');active.setAttribute('class','journey-path journey-path-travelled');active.setAttribute('pathLength','1');
  svg.append(base,active);root.prepend(svg);return {svg,base,active,from:stops[i],to:stop};
 });
 // Only a convergence hook in STEP 1; later work can expand these two quiet branches.
 const arrival=stops.find(s=>s.id==='closing');
 let convergence;
 if(arrival){convergence=svgElement('svg');convergence.classList.add('journey-convergence');convergence.dataset.journeyRole='convergence';convergence.setAttribute('viewBox','0 0 28 48');const p=svgElement('path');p.setAttribute('d','M2 0 Q2 28 14 48 M26 0 Q26 28 14 48');convergence.append(p);root.append(convergence);}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0, dirty=true;
 const clamp=n=>Math.max(0,Math.min(1,n));
 function measure(){
  const mobile=innerWidth<768, tablet=innerWidth<1024;
  const hero=document.querySelector('.pm-hero').getBoundingClientRect();
  const heroBottom=hero.bottom+scrollY;
  stops.forEach((stop,i)=>{
   const r=stop.target.getBoundingClientRect(), css=getComputedStyle(stop.target);
   let left=r.left+(parseFloat(css.paddingLeft)||0), y=r.top+scrollY+(parseFloat(css.paddingTop)||0)+8;
   stop.x=mobile?10:Math.max(14,left-(tablet?18:26)+(tablet?0:[-4,4,0][i%3]));
   if(stop.id==='about') {
    const cta=stop.target.querySelector('.pm-hero-cta').getBoundingClientRect();
    stop.x=innerWidth*(mobile?.61:.84);
    y=mobile?Math.max(cta.bottom+scrollY+40,Math.min(heroBottom-132,cta.bottom+scrollY+68)):hero.top+scrollY+hero.height*(tablet?.34:.38);
   }
   stop.y=y;stop.star.style.left=stop.x+'px';stop.star.style.top=y+'px';
  });
  segments.forEach(s=>{
   const height=Math.max(1,s.to.y-s.from.y), bend=tablet?0:Math.min(12,height*.01);
   let d=`M ${s.from.x} 0 C ${s.from.x+bend} ${height*.36}, ${s.to.x-bend} ${height*.66}, ${s.to.x} ${height}`;
   if(s.from.id==='about') {
    const exit=heroBottom-s.from.y-16, settle=Math.min(height-80,heroBottom-s.from.y+(mobile?132:204));
    const opening=innerWidth*(mobile?.6:.55);
    d=`M ${s.from.x} 0 C ${s.from.x} ${exit*.38}, ${opening} ${exit*.7}, ${opening} ${exit} C ${opening} ${settle}, ${s.to.x} ${exit}, ${s.to.x} ${settle} L ${s.to.x} ${height}`;
   }
   s.svg.setAttribute('width',String(Math.max(s.from.x,s.to.x)+20));s.svg.setAttribute('height',String(height));s.svg.style.top=s.from.y+'px';s.base.setAttribute('d',d);s.active.setAttribute('d',d);
  });
  if(convergence){convergence.style.left=arrival.x-14+'px';convergence.style.top=arrival.y-48+'px';}
 }
 function render(){
  frame=0;if(document.hidden)return;
  if(dirty){measure();dirty=false;}
  root.toggleAttribute('data-first-star-paused',stops[0].y<scrollY);
  const cursor=scrollY+innerHeight*.55;
  let current=0;
  stops.forEach((s,i)=>{if(s.y<=cursor)current=i;});
  stops.forEach((s,i)=>{s.star.classList.toggle('is-reached',i<=current);s.star.classList.toggle('is-current',i===current);});
  segments.forEach(s=>{
   const progress=reduced.matches?1:s.from.id==='about'?clamp(scrollY/Math.max(1,s.to.y-innerHeight*.55)):clamp((cursor-s.from.y)/Math.max(1,s.to.y-s.from.y));
   s.active.style.strokeDashoffset=String(1-progress);
   const visible=s.to.y>=scrollY-64&&s.from.y<=scrollY+innerHeight+64;
   s.svg.style.visibility=visible?'visible':'hidden';
  });
 }
 function schedule(remeasure=false){dirty=dirty||remeasure;if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
 window.addEventListener('scroll',()=>schedule(),{passive:true});
 window.addEventListener('resize',()=>schedule(true),{passive:true});
 window.addEventListener('load',()=>schedule(true),{once:true});
 document.addEventListener('toggle',()=>schedule(true),true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){root.setAttribute('data-first-star-paused','');cancelAnimationFrame(frame);frame=0;}else schedule(true);});
 document.fonts?.ready.then(()=>schedule(true));
 reduced.addEventListener('change',()=>schedule());
 if('ResizeObserver' in window)new ResizeObserver(()=>schedule(true)).observe(document.body);
 stops.filter(s=>s.star.dataset.kind==='project').forEach(s=>{
  const selected=document.querySelector(`.selected-projects a[href="#${s.id}"]`)?.closest('article');
  const target=selected||s.target;
  const set=on=>s.star.classList.toggle('is-emphasized',on);
  target.addEventListener('pointerenter',()=>set(true));target.addEventListener('pointerleave',()=>set(false));
  target.addEventListener('focusin',()=>set(true));target.addEventListener('focusout',()=>set(false));
 });
 schedule(true);
})();

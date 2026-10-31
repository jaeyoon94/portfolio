/* Native page navigation and history; interactions never delay following a link. */
(() => {
 const hero=document.querySelector('.pm-hero');
 if(document.querySelector('main > .case-study'))document.querySelectorAll('.header a[href="projects.html"]').forEach(link=>link.setAttribute('aria-current','location'));
 let bottom=0,frame=0,dirty=true;

 function render(){frame=0;if(dirty){bottom=hero?hero.getBoundingClientRect().bottom+scrollY:0;dirty=false;}document.body.classList.toggle('is-body-theme',!hero||scrollY>bottom-96);}
 function schedule(measure=false){dirty=dirty||measure;if(!frame)frame=requestAnimationFrame(render);}
 if(hero){window.addEventListener('scroll',()=>schedule(),{passive:true});window.addEventListener('resize',()=>schedule(true),{passive:true});window.addEventListener('load',()=>schedule(true),{once:true});if('ResizeObserver'in window)new ResizeObserver(()=>schedule(true)).observe(hero);schedule(true);}
 document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>a.closest('details').removeAttribute('open')));
 // Old shared one-time reveal is unnecessary for native detail pages: content is visible immediately.
 if(location.hash&&!document.getElementById(location.hash.slice(1))){const legacy={career:'career.html',profile:'about.html',projects:'projects.html','project-details':'projects.html','ai-automation':'ai.html','business-pm':'business.html','project-neon':'project-neon.html','project-undecember':'undecember.html','project-slime':'legend-of-slime.html','project-talesrunner':'tales-runner.html','project-dme':'project-dme.html','project-goddess':'goddess-order.html','project-maplestar':'business.html','project-artale':'business.html',documents:'about.html'};const key=location.hash.slice(1);if(legacy[key])location.replace(legacy[key]+'#'+(key==='project-details'?'projects':key));}
})();

// Close the project TOC after native fragment navigation; Escape returns to its trigger.
(() => {
 
 const toc=document.querySelector('.detail-toc details');
 if(!toc)return;
 toc.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toc.removeAttribute('open')));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toc.open){toc.removeAttribute('open');toc.querySelector('summary').focus();}});
 document.addEventListener('pointerdown',e=>{if(toc.open&&!e.target.closest('.detail-toc'))toc.removeAttribute('open');});
})();

// Shared disclosure dismissal; native links and browser history remain in control.
(() => {
 const menu=document.querySelector('.mobile-menu');
 if(menu){
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
  document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
 }
 document.addEventListener('click',e=>{
  if(e.detail!==0||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const link=e.target.closest('a[href^="#"]');
  if(!link)return;
  let target;try{target=document.getElementById(decodeURIComponent(link.hash.slice(1)));}catch{return;}
  if(!target)return;
  // The native fragment scroll runs first. Focus then follows keyboard navigation.
  requestAnimationFrame(()=>{
   const temporary=!target.hasAttribute('tabindex');
   if(temporary)target.setAttribute('tabindex','-1');
   target.focus({preventScroll:true});
   if(temporary)target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
  });
 });
})();

// Cache heading positions on geometry changes; scroll frames perform no layout reads.
(() => {
 const links=[...document.querySelectorAll('.detail-toc nav a[href^="#"]')];
 const items=links.map(link=>({link,target:document.getElementById(link.hash.slice(1)),top:0})).filter(item=>item.target);
 if(!items.length)return;
 let frame=0,dirty=true,active=-1,maxScroll=0,pinned=null,pinnedY=null;
 function update(){
  frame=0;
  if(dirty){
   items.forEach(item=>item.top=item.target.getBoundingClientRect().top+scrollY);
   items.sort((a,b)=>a.top-b.top);
   maxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
   dirty=false;
  }
  const cursor=scrollY+132;
  let next=0;
  for(let i=0;i<items.length;i++){if(items[i].top<=cursor)next=i;else break;}
  if(maxScroll>0&&scrollY>=maxScroll-2)next=items.length-1;
  // A short final section may clamp native anchor scrolling. Keep the chosen
  // heading current until the reader actually scrolls away from that position.
  if(pinned){
   if(pinnedY===null)pinnedY=scrollY;
   if(Math.abs(scrollY-pinnedY)<=2)next=items.indexOf(pinned);
   else {pinned=null;pinnedY=null;}
  }
  if(next===active)return;
  items.forEach((item,i)=>{if(i===next)item.link.setAttribute('aria-current','location');else item.link.removeAttribute('aria-current');});
  active=next;
 }
 function schedule(measure=false){dirty=dirty||measure;if(!frame)frame=requestAnimationFrame(update);}
 addEventListener('scroll',()=>schedule(),{passive:true});
 addEventListener('resize',()=>schedule(true),{passive:true});
 function pinHash(){
  let fragment;try{fragment=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}
  pinned=items.find(item=>item.link.hash===location.hash)||items.find(item=>fragment?.contains(item.target))||null;
  pinnedY=null;schedule(true);
 }
 links.forEach(link=>link.addEventListener('click',()=>{pinned=items.find(item=>item.link===link);pinnedY=null;schedule(true);}));
 addEventListener('hashchange',pinHash);
 addEventListener('pageshow',pinHash);
 document.addEventListener('load',()=>schedule(true),true);
 document.querySelector('main')?.addEventListener('toggle',()=>schedule(true),true);
 if('ResizeObserver'in window)new ResizeObserver(()=>schedule(true)).observe(document.querySelector('main'));
 document.fonts?.ready.then(()=>schedule(true));
 schedule();
})();

/* Diagram playback is always an explicit choice; PNG works without JavaScript. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-process-diagram]').forEach(figure=>{
  const image=figure.querySelector('img'),button=figure.querySelector('button');
  const show=playing=>{image.src=playing?image.dataset.motion:image.dataset.still;button.setAttribute('aria-pressed',String(playing));button.textContent=playing?'정지 이미지 보기':'흐름 재생';};
  button.hidden=false;
  button.addEventListener('click',()=>show(button.getAttribute('aria-pressed')!=='true'));
  reduced.addEventListener('change',event=>{if(event.matches)show(false);});
 });
})();

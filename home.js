// Home pipeline: choosing a column puts that project in the wide panel and returns the
// previous one to the row. Columns stay real links, so without JavaScript they open the case.
(() => {
 const feature=document.getElementById('pl-feature');
 const row=document.querySelector('.pl-row--6');
 if(!feature||!row)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};

 function fill(d){
  feature.setAttribute('style',d.style||'');
  const img=feature.querySelector('.pl-art');
  img.src='assets/images/'+d.img;img.width=+d.w;img.height=+d.h;img.alt=d.alt;
  feature.querySelector('.pl-name').textContent=d.name;
  const title=feature.querySelector('.pl-title');title.replaceChildren(d.context);if(d.foot)title.append(el('sup',null,'1'));
  const dd=feature.querySelectorAll('.pl-spec dd');[d.company,d.period,d.role].forEach((v,i)=>{dd[i].textContent=v;});
  feature.querySelector('.pl-cta').href=d.href;
  feature.querySelector('.pl-foot')?.remove();
  if(d.foot){const f=el('p','pl-foot');f.append(el('span',null,'1'),d.foot);feature.querySelector('.pl-info').append(f);}
 }

 row.addEventListener('click',e=>{
  const link=e.target.closest('.pl-link');
  if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.button!==0)return;
  e.preventDefault();
  const item=link.closest('.pl-col');
  const swap=()=>{
   row.querySelector('.pl-col[hidden]')?.removeAttribute('hidden');
   item.hidden=true;
   fill(link.dataset);
  };
  if(reduced.matches){swap();}
  else{feature.classList.add('is-changing');setTimeout(()=>{swap();feature.classList.remove('is-changing');},180);}
  feature.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
  feature.querySelector('.pl-cta').focus({preventScroll:true});
 });
})();

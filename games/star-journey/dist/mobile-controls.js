/* Arrow keys on desktop; captured pointers allow simultaneous thumb movement and interaction. */
(function(){
 const pad=document.createElement('div');pad.className='touch-controls';pad.setAttribute('role','group');pad.setAttribute('aria-label','모바일 게임 조작');
 pad.innerHTML='<div class="touch-dpad" role="group" aria-label="터치 방향키"><button data-direction="arrowup" aria-label="위로 이동">▲</button><button data-direction="arrowleft" aria-label="왼쪽으로 이동">◀</button><span aria-hidden="true">✦</span><button data-direction="arrowright" aria-label="오른쪽으로 이동">▶</button><button data-direction="arrowdown" aria-label="아래로 이동">▼</button></div><button class="touch-action" aria-label="대화 및 상호작용">대화<span>상호작용</span></button>';
 document.querySelector('.canvas-wrap').append(pad);
 const held=new Map();
 function release(event){const direction=held.get(event.pointerId);held.delete(event.pointerId);if(direction&&![...held.values()].includes(direction))keys.delete(direction);pad.querySelectorAll('[data-direction]').forEach(b=>b.classList.toggle('held',[...held.values()].includes(b.dataset.direction)));}
 for(const button of pad.querySelectorAll('[data-direction]')){
  button.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;event.preventDefault();if(document.querySelector('dialog[open]')||view!=='office'||!state)return;button.setPointerCapture(event.pointerId);held.set(event.pointerId,button.dataset.direction);keys.add(button.dataset.direction);button.classList.add('held');});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
  button.addEventListener('contextmenu',e=>e.preventDefault());
 }
 const action=pad.querySelector('.touch-action');action.addEventListener('click',()=>{if(!document.querySelector('dialog[open]'))interact()});
 const clear=()=>{for(const direction of held.values())keys.delete(direction);held.clear();pad.querySelectorAll('.held').forEach(b=>b.classList.remove('held'))};
 window.addEventListener('blur',clear);window.addEventListener('pagehide',clear);document.addEventListener('visibilitychange',clear);document.querySelectorAll('dialog').forEach(dialog=>new MutationObserver(()=>{if(dialog.open)clear()}).observe(dialog,{attributes:true,attributeFilter:['open']}));
 // Touch motion also persists the current floor position without waiting for keyboard events.
 pad.addEventListener('pointerup',()=>window.dispatchEvent(new Event('office-move-end')));
})();
